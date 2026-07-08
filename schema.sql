-- Esquema de la base de datos (Cloudflare D1) para el panel administrativo.
-- Se aplica con:  npx wrangler d1 execute creatingbara --file=schema.sql   (local: añade --local)

-- Contenido editable por clave (textos, imágenes, datos de contacto, etc.)
CREATE TABLE IF NOT EXISTS content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Artículos del blog (ES/EN). Se llena en la Fase 3.
CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'es',      -- 'es' | 'en'
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT '',
  minutes     INTEGER NOT NULL DEFAULT 3,
  body_html   TEXT NOT NULL DEFAULT '',
  published   INTEGER NOT NULL DEFAULT 1,       -- 0 = borrador
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (lang, slug)
);

-- Servicios / precios. Se llena en la Fase 4.
CREATE TABLE IF NOT EXISTS services (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  lang     TEXT NOT NULL DEFAULT 'es',
  title    TEXT NOT NULL,
  body     TEXT NOT NULL DEFAULT '',
  price    TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

-- Usuario administrador (una sola fila). Contraseña SIEMPRE hasheada (PBKDF2).
CREATE TABLE IF NOT EXISTS admin_user (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  username   TEXT NOT NULL,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  iterations INTEGER NOT NULL DEFAULT 210000,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Registro de intentos de login para rate limiting.
CREATE TABLE IF NOT EXISTS login_attempts (
  ip      TEXT NOT NULL,
  ts      INTEGER NOT NULL,
  success INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_ts ON login_attempts (ip, ts);
