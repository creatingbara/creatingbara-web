// Acceso a datos (Cloudflare D1). Funciones pequeñas y reutilizables.

export async function getAdminUser(db) {
  return db.prepare('SELECT username, salt, hash, iterations FROM admin_user WHERE id = 1').first();
}

export async function setAdminPassword(db, username, salt, hash, iterations) {
  await db.prepare(
    `INSERT INTO admin_user (id, username, salt, hash, iterations, updated_at)
     VALUES (1, ?, ?, ?, ?, unixepoch())
     ON CONFLICT(id) DO UPDATE SET username=excluded.username, salt=excluded.salt,
       hash=excluded.hash, iterations=excluded.iterations, updated_at=unixepoch()`
  ).bind(username, salt, hash, iterations).run();
}

// ---------- content (clave/valor) ----------
export async function getAllContent(db) {
  const { results } = await db.prepare('SELECT key, value FROM content').all();
  const map = {};
  for (const r of results) map[r.key] = r.value;
  return map;
}

export async function getContentByPrefix(db, prefix) {
  const { results } = await db.prepare('SELECT key, value FROM content WHERE key LIKE ?')
    .bind(prefix + '%').all();
  const map = {};
  for (const r of results) map[r.key] = r.value;
  return map;
}

export async function setContent(db, key, value) {
  await db.prepare(
    `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=unixepoch()`
  ).bind(key, String(value)).run();
}

export async function setContentBatch(db, entries) {
  const stmt = db.prepare(
    `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=unixepoch()`
  );
  const batch = Object.entries(entries).map(([k, v]) => stmt.bind(k, String(v)));
  if (batch.length) await db.batch(batch);
}
