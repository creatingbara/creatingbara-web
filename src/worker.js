// Worker principal de creatingbara.com
// - Sirve el sitio estático (binding ASSETS) e inyecta contenido editable con HTMLRewriter.
// - Expone el panel /admin y la API /api/* con autenticación segura.

import {
  hashPassword, verifyPassword, createSession, verifySession,
  isRateLimited, recordAttempt, verifyTurnstile,
  parseCookies, sessionCookie, clearSessionCookie,
} from './auth.js';
import { getAdminUser, setAdminPassword, getContentByPrefix, getAllContent, setContentBatch } from './db.js';
import { loginPage, panelPage } from './admin.js';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { ...JSON_HEADERS, ...extra } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === '/api/login') return handleLogin(request, env, url);
      if (path === '/api/logout') return handleLogout();
      if (path.startsWith('/api/')) return handleApi(request, env, url, path);
      if (path === '/admin' || path === '/admin/') return serveAdmin(request, env);
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
    await setContentBatch(env.DB, entries);
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

  return json({ ok: false, error: 'No encontrado.' }, 404);
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

// ---------- SITIO PÚBLICO ----------
async function servePublic(request, env, ctx) {
  const res = await env.ASSETS.fetch(request);
  const type = res.headers.get('Content-Type') || '';
  if (!type.includes('text/html')) return res;

  // Inyectar CONFIG de contacto (y, en fases siguientes, más contenido).
  let config = {};
  try {
    const c = await getContentByPrefix(env.DB, 'contact.');
    config = {
      whatsapp: c['contact.whatsapp'],
      instagram: c['contact.instagram'],
      facebook: c['contact.facebook'],
      email: c['contact.email'],
    };
    // quitar indefinidos para no pisar los valores por defecto de app.js
    Object.keys(config).forEach(k => config[k] == null && delete config[k]);
  } catch { config = {}; }

  const inject = `<script>window.CMS_CONFIG=${JSON.stringify(config)};</script>`;
  return new HTMLRewriter()
    .on('head', {
      element(el) { el.append(inject, { html: true }); },
    })
    .transform(res);
}
