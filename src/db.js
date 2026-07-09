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

// ---------- reservas de la demo "Web + Agenda 24/7" ----------
export async function getBookedSlots(db, date) {
  const { results } = await db.prepare(
    `SELECT time_label FROM demo_bookings WHERE booking_date = ? AND status = 'confirmed'`
  ).bind(date).all();
  return results.map(r => r.time_label);
}

export async function createBooking(db, b) {
  try {
    const r = await db.prepare(
      `INSERT INTO demo_bookings (booking_date, time_label, starts_at, name, phone)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(b.booking_date, b.time_label, b.starts_at, b.name, b.phone).run();
    return { id: r.meta.last_row_id, conflict: false };
  } catch (err) {
    if (String(err.message || err).includes('UNIQUE')) return { id: null, conflict: true };
    throw err;
  }
}

export async function markBookingSent(db, id, field) {
  const col = field === 'reminder' ? 'reminder_sent' : 'confirmation_sent';
  await db.prepare(`UPDATE demo_bookings SET ${col} = 1 WHERE id = ?`).bind(id).run();
}

export async function setBookingCrmContact(db, id, contactId) {
  await db.prepare('UPDATE demo_bookings SET crm_contact_id = ? WHERE id = ?').bind(contactId, id).run();
}

export async function getBookingsDueForReminder(db, fromTs, toTs) {
  const { results } = await db.prepare(
    `SELECT * FROM demo_bookings WHERE status = 'confirmed' AND reminder_sent = 0
     AND starts_at >= ? AND starts_at <= ?`
  ).bind(fromTs, toTs).all();
  return results;
}

// ---------- rate limiting de reservas de la demo ----------
export async function isDemoBookingRateLimited(db, ip, { windowSec = 600, maxAttempts = 3 } = {}) {
  const since = Math.floor(Date.now() / 1000) - windowSec;
  const row = await db.prepare(
    'SELECT COUNT(*) AS n FROM demo_booking_attempts WHERE ip = ? AND ts >= ?'
  ).bind(ip, since).first();
  return (row?.n || 0) >= maxAttempts;
}

export async function recordDemoBookingAttempt(db, ip) {
  await db.prepare('INSERT INTO demo_booking_attempts (ip, ts) VALUES (?, ?)')
    .bind(ip, Math.floor(Date.now() / 1000)).run();
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  await db.prepare('DELETE FROM demo_booking_attempts WHERE ts < ?').bind(cutoff).run();
}

export async function setContentBatch(db, entries) {
  const stmt = db.prepare(
    `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=unixepoch()`
  );
  const batch = Object.entries(entries).map(([k, v]) => stmt.bind(k, String(v)));
  if (batch.length) await db.batch(batch);
}
