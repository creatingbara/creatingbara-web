// Utilidades de seguridad: hashing de contraseña (PBKDF2), sesiones firmadas (HMAC),
// rate limiting y verificación de Turnstile. Todo con Web Crypto nativo del Worker.

const enc = new TextEncoder();

// ---------- helpers de codificación ----------
function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBuf(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a.buffer;
}
function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}
// comparación en tiempo constante
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// ---------- contraseña (PBKDF2-SHA256) ----------
export async function hashPassword(password, saltHex, iterations = 210000) {
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16)).buffer;
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
  return { salt: bufToHex(salt), hash: bufToHex(bits), iterations };
}

export async function verifyPassword(password, user) {
  const { hash } = await hashPassword(password, user.salt, user.iterations);
  return timingSafeEqual(hash, user.hash);
}

// ---------- sesión firmada (HMAC-SHA256) ----------
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSession(secret, username, ttlSeconds = 60 * 60 * 8) {
  const payload = { u: username, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64urlEncode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return `${body}.${bufToHex(sig)}`;
}

export async function verifySession(secret, token) {
  if (!token || token.indexOf('.') < 0) return null;
  const [body, sigHex] = token.split('.');
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, hexToBuf(sigHex), enc.encode(body));
  if (!ok) return null;
  let payload;
  try { payload = JSON.parse(b64urlDecode(body)); } catch { return null; }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// ---------- rate limiting (D1) ----------
export async function isRateLimited(db, ip, { windowSec = 900, maxFails = 8 } = {}) {
  const since = Math.floor(Date.now() / 1000) - windowSec;
  const row = await db.prepare(
    'SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND ts >= ? AND success = 0'
  ).bind(ip, since).first();
  return (row?.n || 0) >= maxFails;
}

export async function recordAttempt(db, ip, success) {
  await db.prepare('INSERT INTO login_attempts (ip, ts, success) VALUES (?, ?, ?)')
    .bind(ip, Math.floor(Date.now() / 1000), success ? 1 : 0).run();
  // limpieza best-effort de registros viejos (> 1 día)
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  await db.prepare('DELETE FROM login_attempts WHERE ts < ?').bind(cutoff).run();
}

// ---------- Turnstile ----------
export async function verifyTurnstile(secret, token, ip) {
  if (!secret) return true; // si no está configurado, no bloquear (dev)
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = await r.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ---------- cookies ----------
export function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

export function sessionCookie(token, ttlSeconds = 60 * 60 * 8) {
  const attrs = [
    `cb_session=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${ttlSeconds}`,
  ];
  return attrs.join('; ');
}

export function clearSessionCookie() {
  return 'cb_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
