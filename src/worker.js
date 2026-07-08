// Worker principal de creatingbara.com
// - Sirve el sitio estático (binding ASSETS) e inyecta contenido editable con HTMLRewriter.
// - Expone el panel /admin y la API /api/* con autenticación segura.

import {
  hashPassword, verifyPassword, createSession, verifySession,
  isRateLimited, recordAttempt, verifyTurnstile,
  parseCookies, sessionCookie, clearSessionCookie,
} from './auth.js';
import { getAdminUser, setAdminPassword, getContentByPrefix, getAllContent, setContentBatch,
  listPosts, getPost, getPostById, deletePost, upsertPost } from './db.js';
import { loginPage, panelPage } from './admin.js';
import { CONTENT_SCHEMA, VALID_KEYS } from './content-schema.js';
import { renderArticle, renderIndex } from './blog-view.js';

const CONTACT_KEYS = new Set(['contact.whatsapp', 'contact.instagram', 'contact.facebook', 'contact.email']);

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { ...JSON_HEADERS, ...extra } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    // Subdominio dedicado al panel: todo sirve el panel/API, nunca el sitio público.
    const isAdminHost = url.hostname === (env.ADMIN_HOST || 'admin.creatingbara.com');
    try {
      if (path === '/api/login') return handleLogin(request, env, url);
      if (path === '/api/logout') return handleLogout();
      if (path.startsWith('/api/')) return handleApi(request, env, url, path);
      if (isAdminHost) return serveAdmin(request, env);
      if (path === '/admin' || path === '/admin/') return serveAdmin(request, env);
      if (path === '/blog' || path === '/blog/') return serveBlogIndex(request, env);
      const artMatch = path.match(/^\/blog\/([a-z0-9-]+)\.html$/i);
      if (artMatch) return serveBlogArticle(request, env, artMatch[1]);
      return servePublic(request, env, ctx);
    } catch (err) {
      return json({ ok: false, error: 'Error interno.' }, 500);
    }
  },
};

// ---------- utilidades de request ----------
function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '0.0.0.0';
}
async function requireSession(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  return verifySession(env.SESSION_SECRET || 'dev-secret', cookies.cb_session);
}
function sameOrigin(request, url) {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // navegación directa / sin Origin
  try { return new URL(origin).host === url.host; } catch { return false; }
}

// ---------- LOGIN ----------
async function handleLogin(request, env, url) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405);
  if (!sameOrigin(request, url)) return json({ ok: false, error: 'Origen inválido.' }, 403);
  const ip = clientIp(request);
  const db = env.DB;

  if (await isRateLimited(db, ip)) {
    return json({ ok: false, error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' }, 429);
  }

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Solicitud inválida.' }, 400); }
  const { u = '', p = '', ts = '' } = body;

  const okTs = await verifyTurnstile(env.TURNSTILE_SECRET, ts, ip);
  if (!okTs) { await recordAttempt(db, ip, false); return json({ ok: false, error: 'Verificación anti-bots fallida.' }, 403); }

  const user = await getAdminUser(db);
  const okUser = user && u === user.username && await verifyPassword(p, user);
  await recordAttempt(db, ip, !!okUser);
  if (!okUser) return json({ ok: false, error: 'Usuario o contraseña incorrectos.' }, 401);

  const token = await createSession(env.SESSION_SECRET || 'dev-secret', user.username);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}

function handleLogout() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}

// ---------- API autenticada ----------
async function handleApi(request, env, url, path) {
  const session = await requireSession(request, env);
  if (!session) return json({ ok: false, error: 'No autorizado.' }, 401);

  // GET /api/schema  -> estructura de campos editables (con textos por defecto)
  if (path === '/api/schema' && request.method === 'GET') {
    return json({ ok: true, schema: CONTENT_SCHEMA });
  }

  // GET /api/content?prefix=contact.
  if (path === '/api/content' && request.method === 'GET') {
    const prefix = url.searchParams.get('prefix') || '';
    const content = prefix ? await getContentByPrefix(env.DB, prefix) : await getAllContent(env.DB);
    return json({ ok: true, content });
  }

  // mutaciones: exigir mismo origen
  if (request.method === 'POST' && !sameOrigin(request, url)) {
    return json({ ok: false, error: 'Origen inválido.' }, 403);
  }

  // POST /api/content  { entries: {key: value} }
  if (path === '/api/content' && request.method === 'POST') {
    const { entries } = await request.json().catch(() => ({}));
    if (!entries || typeof entries !== 'object') return json({ ok: false, error: 'Datos inválidos.' }, 400);
    // Solo aceptar claves conocidas (contenido del esquema o datos de contacto).
    const clean = {};
    for (const [k, v] of Object.entries(entries)) {
      if ((VALID_KEYS.has(k) || CONTACT_KEYS.has(k)) && typeof v === 'string') clean[k] = v;
    }
    if (!Object.keys(clean).length) return json({ ok: false, error: 'Sin campos válidos.' }, 400);
    await setContentBatch(env.DB, clean);
    return json({ ok: true });
  }

  // POST /api/change-password { current, next }
  if (path === '/api/change-password' && request.method === 'POST') {
    const { current = '', next = '' } = await request.json().catch(() => ({}));
    if (next.length < 8) return json({ ok: false, error: 'La nueva contraseña es muy corta.' }, 400);
    const user = await getAdminUser(env.DB);
    if (!user || !(await verifyPassword(current, user))) {
      return json({ ok: false, error: 'La contraseña actual no es correcta.' }, 403);
    }
    const { salt, hash, iterations } = await hashPassword(next);
    await setAdminPassword(env.DB, user.username, salt, hash, iterations);
    return json({ ok: true });
  }

  // ----- Blog -----
  // GET /api/posts  -> lista (para el panel)
  if (path === '/api/posts' && request.method === 'GET') {
    const id = url.searchParams.get('id');
    if (id) {
      const post = await getPostById(env.DB, Number(id));
      if (!post) return json({ ok: false, error: 'No encontrado.' }, 404);
      return json({ ok: true, post });
    }
    const posts = await listPosts(env.DB, 'es', false);
    return json({ ok: true, posts });
  }

  // POST /api/posts  -> crear o actualizar
  if (path === '/api/posts' && request.method === 'POST') {
    const b = await request.json().catch(() => ({}));
    const title = (b.title || '').trim();
    if (!title) return json({ ok: false, error: 'El título es obligatorio.' }, 400);
    let slug = slugify(b.slug || title);
    if (!slug) return json({ ok: false, error: 'No se pudo generar el enlace (slug).' }, 400);
    // slug único (excepto el propio post)
    const existing = await getPost(env.DB, 'es', slug);
    if (existing && existing.id !== Number(b.id || 0)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const post = {
      id: b.id ? Number(b.id) : null,
      slug, lang: 'es',
      title,
      description: (b.description || '').trim(),
      category: (b.category || '').trim(),
      minutes: Math.max(1, parseInt(b.minutes, 10) || 3),
      date_label: (b.date_label || '').trim(),
      body_html: b.body_html || '',
      published: b.published === false ? 0 : 1,
    };
    const id = await upsertPost(env.DB, post);
    return json({ ok: true, id, slug });
  }

  // POST /api/posts/delete  -> borrar
  if (path === '/api/posts/delete' && request.method === 'POST') {
    const { id } = await request.json().catch(() => ({}));
    if (!id) return json({ ok: false, error: 'Falta el id.' }, 400);
    await deletePost(env.DB, Number(id));
    return json({ ok: true });
  }

  return json({ ok: false, error: 'No encontrado.' }, 404);
}

function slugify(s) {
  const base = String(s).toLowerCase().normalize('NFD').split('')
    .filter(c => { const n = c.charCodeAt(0); return n < 0x300 || n > 0x36f; }).join('');
  return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// ---------- PANEL /admin ----------
async function serveAdmin(request, env) {
  const session = await requireSession(request, env);
  const html = session ? panelPage(session.u) : loginPage(env.TURNSTILE_SITEKEY || '');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
    },
  });
}

// ---------- inyección de contenido editable (contacto + textos data-cms) ----------
async function applyCms(response, env) {
  let content = {};
  try { content = await getAllContent(env.DB); } catch { content = {}; }

  const config = {};
  for (const k of ['whatsapp', 'instagram', 'facebook', 'email']) {
    const v = content['contact.' + k];
    if (v != null && v !== '') config[k] = v;
  }
  const inject = `<script>window.CMS_CONFIG=${JSON.stringify(config)};</script>`;

  return new HTMLRewriter()
    .on('head', {
      element(el) { el.append(inject, { html: true }); },
    })
    .on('[data-cms]', {
      element(el) {
        const key = el.getAttribute('data-cms');
        if (!key || !(key in content)) return;
        const val = content[key];
        if (val == null) return;
        if (el.tagName === 'img') el.setAttribute('src', val);
        else el.setInnerContent(val); // texto (se escapa automáticamente)
      },
    })
    .transform(response);
}

function htmlResponse(html, extraHeaders = {}) {
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...extraHeaders } });
}

// ---------- SITIO PÚBLICO (assets estáticos) ----------
async function servePublic(request, env, ctx) {
  const res = await env.ASSETS.fetch(request);
  const type = res.headers.get('Content-Type') || '';
  if (!type.includes('text/html')) return res;
  return applyCms(res, env);
}

// ---------- BLOG DINÁMICO ----------
async function serveBlogIndex(request, env) {
  let posts = [];
  try { posts = await listPosts(env.DB, 'es', true); } catch { posts = []; }
  return applyCms(htmlResponse(renderIndex(posts)), env);
}

async function serveBlogArticle(request, env, slug) {
  let post = null;
  try { post = await getPost(env.DB, 'es', slug); } catch { post = null; }
  // Si no existe en la base, servir el archivo estático (compatibilidad).
  if (!post || !post.published) return servePublic(request, env);
  let related = [];
  try {
    related = (await listPosts(env.DB, 'es', true)).filter(p => p.slug !== slug).slice(0, 3);
  } catch { related = []; }
  return applyCms(htmlResponse(renderArticle(post, related)), env);
}
