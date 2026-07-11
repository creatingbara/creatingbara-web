// Worker principal de creatingbara.com
// - Sirve el sitio estático (binding ASSETS) e inyecta contenido editable con HTMLRewriter.
// - Expone el panel /admin y la API /api/* con autenticación segura.

import {
  hashPassword, verifyPassword, createSession, verifySession,
  isRateLimited, recordAttempt, verifyTurnstile,
  parseCookies, sessionCookie, clearSessionCookie,
} from './auth.js';
import { getAdminUser, setAdminPassword, getContentByPrefix, getAllContent, setContentBatch,
  listPosts, getPost, getPostById, deletePost, upsertPost,
  getBookedSlots, createBooking, markBookingSent, setBookingCrmContact, getBookingsDueForReminder,
  isDemoBookingRateLimited, recordDemoBookingAttempt } from './db.js';
import { loginPage, panelPage } from './admin.js';
import { CONTENT_SCHEMA, VALID_KEYS } from './content-schema.js';
import { renderArticle, renderIndex } from './blog-view.js';
import { upsertCrmContact, sendCrmTemplateMessage } from './crm-client.js';

const DEMO_HOURS = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];
const DEMO_STAFF = ['Camila', 'Estefany'];
const DEMO_SERVICES = ['manicure-spa', 'unas-acrilicas', 'pedicure-completo'];
const DEMO_CONFIRM_TEMPLATE = 'demo_agenda_confirmacion';
const DEMO_REMINDER_TEMPLATE = 'demo_agenda_recordatorio';

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
    // Subdominio de la demo "Web + Agenda 24/7": una sola página, en cualquier ruta.
    const isDemoAgendaHost = url.hostname === (env.DEMO_AGENDA_HOST || 'demoagenda.creatingbara.com');
    try {
      if (path === '/api/login') return handleLogin(request, env, url);
      if (path === '/api/logout') return handleLogout();
      if (path === '/api/demo-agenda/availability' && request.method === 'GET') return handleDemoAvailability(request, env, url);
      if (path === '/api/demo-agenda/book' && request.method === 'POST') return handleDemoBook(request, env, url);
      if (path.startsWith('/api/')) return handleApi(request, env, url, path);
      if (path.startsWith('/media/')) return serveMedia(env, path.slice('/media/'.length));
      if (isDemoAgendaHost && !path.startsWith('/assets/') && !path.startsWith('/media/')) return serveDemoAgenda(request, env);
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

  // Cron Trigger: envía el recordatorio de WhatsApp ~24h antes de cada cita de la demo.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDueReminders(env));
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

  // POST /api/upload  -> sube una imagen a R2, devuelve su URL pública (/media/...)
  if (path === '/api/upload' && request.method === 'POST') {
    if (!env.MEDIA) return json({ ok: false, error: 'Almacenamiento de imágenes no configurado.' }, 500);
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) return json({ ok: false, error: 'Formato inválido.' }, 400);
    const form = await request.formData().catch(() => null);
    const file = form && form.get('file');
    if (!file || typeof file === 'string') return json({ ok: false, error: 'Falta el archivo.' }, 400);
    if (!file.type || !file.type.startsWith('image/')) return json({ ok: false, error: 'Solo se permiten imágenes.' }, 400);
    if (file.size > 5 * 1024 * 1024) return json({ ok: false, error: 'La imagen es muy grande (máx. 5 MB).' }, 400);
    const ext = (file.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 10) || 'bin';
    const key = `uploads/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    return json({ ok: true, url: '/media/' + key });
  }

  return json({ ok: false, error: 'No encontrado.' }, 404);
}

// ---------- IMÁGENES (R2) ----------
async function serveMedia(env, key) {
  if (!env.MEDIA || !key) return new Response('No encontrado.', { status: 404 });
  const obj = await env.MEDIA.get(decodeURIComponent(key));
  if (!obj) return new Response('No encontrado.', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
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
    .on('[data-cms-bg]', {
      element(el) {
        const key = el.getAttribute('data-cms-bg');
        if (!key || !content[key]) return; // sin override: se queda la imagen original
        const style = el.getAttribute('style') || '';
        const safeUrl = content[key].replace(/[()'"]/g, '');
        const next = /background-image\s*:\s*url\([^)]*\)/.test(style)
          ? style.replace(/background-image\s*:\s*url\([^)]*\)/, `background-image:url('${safeUrl}')`)
          : `${style};background-image:url('${safeUrl}')`;
        el.setAttribute('style', next);
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

// ---------- DEMO "Web + Agenda 24/7" (página única) ----------
async function serveDemoAgenda(request, env) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = '/demo-agenda'; // ruta limpia: evita el 307 de auto-trailing-slash a .html
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  return applyCms(res, env);
}

function timeLabelTo24h(label) {
  const m = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec(label || '');
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return { h, min };
}
// República Dominicana: UTC-4 todo el año (sin horario de verano) — se asume fija
// para no depender de la zona horaria del navegador de quien reserva.
function computeStartsAt(dateStr, timeLabel) {
  const t = timeLabelTo24h(timeLabel);
  if (!t) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
  if (!m) return null;
  return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3], t.h + 4, t.min, 0) / 1000);
}
function isValidDateStr(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); }

async function handleDemoAvailability(request, env, url) {
  const date = url.searchParams.get('date') || '';
  if (!isValidDateStr(date)) return json({ ok: false, error: 'Fecha inválida.' }, 400);
  const booked = await getBookedSlots(env.DB, date);
  return json({ ok: true, booked });
}

async function handleDemoBook(request, env, url) {
  if (!sameOrigin(request, url)) return json({ ok: false, error: 'Origen inválido.' }, 403);
  const ip = clientIp(request);
  if (await isDemoBookingRateLimited(env.DB, ip)) {
    return json({ ok: false, error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' }, 429);
  }
  await recordDemoBookingAttempt(env.DB, ip);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Solicitud inválida.' }, 400); }
  const date = String(body.date || '');
  const timeLabel = String(body.time || '');
  const staff = String(body.staff || '');
  const service = String(body.service || '');
  const name = String(body.name || '').trim().slice(0, 60);
  const phone = String(body.phone || '').trim();

  if (!isValidDateStr(date)) return json({ ok: false, error: 'Fecha inválida.' }, 400);
  if (!DEMO_HOURS.includes(timeLabel)) return json({ ok: false, error: 'Horario inválido.' }, 400);
  if (!DEMO_STAFF.includes(staff)) return json({ ok: false, error: 'Colaboradora inválida.' }, 400);
  if (!DEMO_SERVICES.includes(service)) return json({ ok: false, error: 'Servicio inválido.' }, 400);
  if (!name) return json({ ok: false, error: 'Falta el nombre.' }, 400);
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return json({ ok: false, error: 'Número de WhatsApp inválido. Usa formato +18095551234.' }, 400);

  const startsAt = computeStartsAt(date, timeLabel);
  if (!startsAt) return json({ ok: false, error: 'Fecha/horario inválido.' }, 400);
  const nowTs = Math.floor(Date.now() / 1000);
  if (startsAt < nowTs + 3600) return json({ ok: false, error: 'Elige un horario con al menos 1 hora de anticipación.' }, 400);
  if (startsAt > nowTs + 90 * 86400) return json({ ok: false, error: 'Solo se puede reservar hasta 90 días adelante.' }, 400);
  const dow = new Date(startsAt * 1000).getUTCDay();
  if (dow === 0) return json({ ok: false, error: 'No hay citas los domingos.' }, 400);

  const { id, conflict } = await createBooking(env.DB, { booking_date: date, time_label: timeLabel, staff, service, starts_at: startsAt, name, phone });
  if (conflict) return json({ ok: false, error: 'Ese horario ya se reservó con esa colaboradora. Elige otro.' }, 409);

  // Confirmación real por WhatsApp (best-effort: si la plantilla aún no está aprobada
  // por Meta, la reserva sigue siendo válida — solo no se envía el mensaje todavía).
  let whatsappSent = false;
  try {
    const contact = await upsertCrmContact(env, { phone, name });
    if (contact.ok) {
      await setBookingCrmContact(env.DB, id, contact.data.id);
      const send = await sendCrmTemplateMessage(env, {
        phone, templateName: DEMO_CONFIRM_TEMPLATE, params: [name, date, timeLabel],
      });
      if (send.ok) { whatsappSent = true; await markBookingSent(env.DB, id, 'confirmation'); }
    }
  } catch { /* best-effort */ }

  return json({ ok: true, whatsappSent });
}

// ---------- recordatorio automático 24h antes (Cron Trigger) ----------
async function sendDueReminders(env) {
  const now = Math.floor(Date.now() / 1000);
  const from = now + 23 * 3600, to = now + 25 * 3600; // ventana de ~1h alrededor de las 24h antes
  const due = await getBookingsDueForReminder(env.DB, from, to);
  for (const b of due) {
    try {
      const send = await sendCrmTemplateMessage(env, {
        phone: b.phone, templateName: DEMO_REMINDER_TEMPLATE, params: [b.name, b.booking_date, b.time_label],
      });
      if (send.ok) await markBookingSent(env.DB, b.id, 'reminder');
    } catch { /* best-effort, se reintenta en la próxima corrida */ }
  }
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
