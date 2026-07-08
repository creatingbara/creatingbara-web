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

// ---------- posts (blog) ----------
export async function listPosts(db, lang = 'es', onlyPublished = false) {
  const where = onlyPublished ? 'WHERE lang = ? AND published = 1' : 'WHERE lang = ?';
  const { results } = await db.prepare(
    `SELECT id, slug, lang, title, description, category, minutes, date_label, published, created_at
     FROM posts ${where} ORDER BY created_at DESC, id DESC`
  ).bind(lang).all();
  return results;
}

export async function getPost(db, lang, slug) {
  return db.prepare('SELECT * FROM posts WHERE lang = ? AND slug = ?').bind(lang, slug).first();
}

export async function getPostById(db, id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
}

export async function deletePost(db, id) {
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}

export async function upsertPost(db, p) {
  if (p.id) {
    await db.prepare(
      `UPDATE posts SET slug=?, lang=?, title=?, description=?, category=?, minutes=?,
        date_label=?, body_html=?, published=?, updated_at=unixepoch() WHERE id=?`
    ).bind(p.slug, p.lang, p.title, p.description, p.category, p.minutes, p.date_label, p.body_html, p.published, p.id).run();
    return p.id;
  }
  const r = await db.prepare(
    `INSERT INTO posts (slug, lang, title, description, category, minutes, date_label, body_html, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`
  ).bind(p.slug, p.lang, p.title, p.description, p.category, p.minutes, p.date_label, p.body_html, p.published).run();
  return r.meta.last_row_id;
}

export async function setContentBatch(db, entries) {
  const stmt = db.prepare(
    `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=unixepoch()`
  );
  const batch = Object.entries(entries).map(([k, v]) => stmt.bind(k, String(v)));
  if (batch.length) await db.batch(batch);
}
