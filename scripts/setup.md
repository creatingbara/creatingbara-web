# Configuración del panel administrativo (una sola vez)

Todo vive en Cloudflare. Necesitas tener sesión de Wrangler:
```
npx wrangler login
```

## 1. Base de datos (D1)
```
npx wrangler d1 create creatingbara
```
Copia el `database_id` que imprime y pégalo en `wrangler.jsonc` → `d1_databases[0].database_id`.

Aplica el esquema (remoto):
```
npx wrangler d1 execute creatingbara --remote --file=schema.sql
```

## 2. Almacenamiento de imágenes (R2)
```
npx wrangler r2 bucket create creatingbara-media
```
(El binding `MEDIA` ya está en `wrangler.jsonc`.)

## 3. Secretos
`SESSION_SECRET` firma las sesiones. Genera uno largo y aleatorio:
```
npx wrangler secret put SESSION_SECRET
```
(pega, por ejemplo, la salida de `openssl rand -hex 32`)

## 4. Turnstile (anti-bots del login)
1. En el panel de Cloudflare → **Turnstile → Add widget** (dominio: `creatingbara.com`).
2. Copia el **Site Key** → pégalo en `wrangler.jsonc` → `vars.TURNSTILE_SITEKEY`.
3. Copia el **Secret Key** → guárdalo como secreto:
```
npx wrangler secret put TURNSTILE_SECRET
```

## 5. Crear el usuario administrador (contraseña hasheada)
La contraseña NO se escribe en el repo. Se genera su hash localmente:
```
node scripts/seed-admin.mjs argenisabreur "TU_CONTRASEÑA"
npx wrangler d1 execute creatingbara --remote --file=scripts/seed-admin.sql
```
`scripts/seed-admin.sql` está en `.gitignore` (no se sube). Bórralo después si quieres.

## 6. Desplegar
```
git add -A && git commit -m "Panel administrativo" && git push
```
Cloudflare construye y despliega solo. El panel queda en `https://creatingbara.com/admin`.

---

## Desarrollo local (opcional)
```
cp .dev.vars.example .dev.vars      # y edita los valores
npm run db:local                    # aplica el esquema a la D1 local
node scripts/seed-admin.mjs argenisabreur "clave-de-prueba"
npx wrangler d1 execute creatingbara --local --file=scripts/seed-admin.sql
npm run dev                         # http://localhost:8787  y  /admin
```
En local, si no configuras `TURNSTILE_SECRET`, el captcha se omite automáticamente.
