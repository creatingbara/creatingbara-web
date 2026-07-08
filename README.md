# creatingbara.com

Sitio web oficial de **Creating Bara** — estudio creativo de diseño, branding y soluciones digitales. Estático, bilingüe (ES + EN) y sin dependencias: se edita con cualquier editor y se publica en cualquier hosting.

## Editar tus datos (1 minuto)
Abre `assets/app.js` y cambia el bloque `CONFIG` (WhatsApp, Instagram, Facebook, correo). Todos los botones del sitio se conectan solos.

## Ver el sitio en tu computadora
```
python3 -m http.server 8000
```
y abre http://localhost:8000

## Publicar
- **Netlify (recomendado):** arrastra esta carpeta a Netlify Drop → Domain management → agrega `creatingbara.com`.
- **Vercel:** igual de simple.
- **cPanel/Hostinger:** sube todo el contenido a `public_html`.

## Trabajar con agentes de IA
Este repo está preparado para agentes de código:

- **Claude Code:** abre una terminal en esta carpeta y ejecuta `claude`. Lee `CLAUDE.md` automáticamente al iniciar, así conoce la marca y las reglas del proyecto. Instalación y requisitos: https://code.claude.com/docs/en/setup (también disponible en la app de escritorio de Claude, VS Code y JetBrains).
- **Codex (OpenAI) y otros agentes:** abre la carpeta con tu agente; leerá `AGENTS.md`, que contiene las mismas reglas.

Ejemplos de tareas que puedes pedirles:
- "Agrega un artículo al blog sobre cómo escribir una bio de Instagram que venda, en ES y EN."
- "Crea la página /portafolio siguiendo el estilo del sitio."
- "Cambia el número de WhatsApp en CONFIG a 1809XXXXXXX."

## Reglas de la marca
Paleta, tipografías, tono y convenciones están documentadas en `CLAUDE.md` / `AGENTS.md`. Léelas antes de tocar el diseño.
