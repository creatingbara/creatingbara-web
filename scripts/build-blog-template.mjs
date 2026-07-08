// Genera src/blog-template.js a partir de un artículo real, para que las páginas
// dinámicas del blog conserven exactamente el header, footer y estilos del sitio.
// Uso: node scripts/build-blog-template.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const ref = readFileSync(new URL('../blog/regla-3-segundos.html', import.meta.url), 'utf8');

const T = 'La regla de los 3 segundos: el filtro que usamos antes de publicar — Creating Bara';
const D = 'Si tu post no se entiende en 3 segundos, el cliente ya siguió bajando. Así se aplica el filtro más simple y efectivo del diseño para redes.';
const U = 'https://creatingbara.com/blog/regla-3-segundos.html';
const EN_LINK = '<link rel="alternate" hreflang="en" href="https://creatingbara.com/en/blog/3-second-rule.html">';

let page = ref;
// Quitar el alternate EN (las páginas dinámicas definen el suyo si aplica).
page = page.split(EN_LINK).join('{{ALT_EN}}');
page = page.split(T).join('{{TITLE}}');
page = page.split(D).join('{{DESC}}');
page = page.split(U).join('{{URL}}');
// Reemplazar el contenido de <main> por un marcador.
const mainStart = page.indexOf('<main>');
const mainEnd = page.indexOf('</main>');
page = page.slice(0, mainStart) + '<main>{{MAIN}}</main>' + page.slice(mainEnd + '</main>'.length);

const out = `// GENERADO por scripts/build-blog-template.mjs — no editar a mano.
export const PAGE = ${JSON.stringify(page)};
`;
writeFileSync(new URL('../src/blog-template.js', import.meta.url), out);
console.log('OK: src/blog-template.js (%d bytes)', page.length);
