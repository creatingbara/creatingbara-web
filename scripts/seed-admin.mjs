// Genera el usuario administrador con la contraseña HASHEADA (PBKDF2), sin exponerla.
// Uso:
//   node scripts/seed-admin.mjs <usuario> "<contraseña>"
// Escribe scripts/seed-admin.sql (ignorado por git). Luego aplícalo a D1:
//   npx wrangler d1 execute creatingbara --remote --file=scripts/seed-admin.sql
// (para pruebas locales usa --local en vez de --remote)

import { writeFileSync } from 'node:fs';

const ITERATIONS = 100000; // máximo permitido por el runtime de Cloudflare Workers
const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('Uso: node scripts/seed-admin.mjs <usuario> "<contraseña>"');
  process.exit(1);
}

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);

const saltHex = hex(salt.buffer);
const hashHex = hex(bits);
const u = username.replace(/'/g, "''");

const sql = `-- Generado por seed-admin.mjs. Contiene solo el hash, nunca la contraseña.
INSERT INTO admin_user (id, username, salt, hash, iterations, updated_at)
VALUES (1, '${u}', '${saltHex}', '${hashHex}', ${ITERATIONS}, unixepoch())
ON CONFLICT(id) DO UPDATE SET username=excluded.username, salt=excluded.salt,
  hash=excluded.hash, iterations=excluded.iterations, updated_at=unixepoch();
`;

writeFileSync(new URL('./seed-admin.sql', import.meta.url), sql);
console.log('OK: scripts/seed-admin.sql generado para el usuario "%s".', username);
console.log('Aplícalo con:  npx wrangler d1 execute creatingbara --remote --file=scripts/seed-admin.sql');
