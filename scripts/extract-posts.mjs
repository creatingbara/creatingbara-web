// Extrae los artículos ES estáticos a SQL para migrarlos a D1.
// Uso: node scripts/extract-posts.mjs > scripts/seed-posts.sql
import { readFileSync } from 'node:fs';

const FILES = ['regla-3-segundos', 'errores-marca-casera', 'colores-de-marca'];
const MONTHS = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };

function pick(re, s) { const m = s.match(re); return m ? m[1].trim() : ''; }
function sql(v) { return "'" + String(v).replace(/'/g, "''") + "'"; }

const rows = [];
for (const slug of FILES) {
  const h = readFileSync(new URL(`../blog/${slug}.html`, import.meta.url), 'utf8');
  const title = pick(/<h1>([\s\S]*?)<\/h1>/, h);
  const description = pick(/name="description" content="([^"]*)"/, h);
  // .meta: <span class="cat" ...>Cat</span><span>16 jun 2026</span><span>· 4 min</span>
  const metaBlock = pick(/<div class="meta">([\s\S]*?)<\/div>/, h);
  const spans = [...metaBlock.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(m => m[1].trim());
  const category = spans[0] || '';
  const dateLabel = spans[1] || '';
  const minutes = parseInt((spans[2] || '').replace(/\D/g, ''), 10) || 3;
  // created_at desde la fecha "16 jun 2026"
  let createdAt = Math.floor(Date.now() / 1000);
  const dm = dateLabel.match(/(\d{1,2})\s+([a-zñ]{3})\s+(\d{4})/i);
  if (dm) {
    const d = new Date(Date.UTC(+dm[3], MONTHS[dm[2].toLowerCase()] ?? 0, +dm[1]));
    createdAt = Math.floor(d.getTime() / 1000);
  }
  // cuerpo: desde <p class="intro"> hasta el cierre del artículo
  const start = h.indexOf('<p class="intro"');
  const end = h.indexOf('</div></div></section>', start);
  const body = h.slice(start, end).trim();

  rows.push(`INSERT INTO posts (slug, lang, title, description, category, minutes, date_label, body_html, published, created_at, updated_at)
VALUES (${sql(slug)}, 'es', ${sql(title)}, ${sql(description)}, ${sql(category)}, ${minutes}, ${sql(dateLabel)}, ${sql(body)}, 1, ${createdAt}, ${createdAt});`);
}

console.log('DELETE FROM posts WHERE lang = \'es\';');
console.log(rows.join('\n'));
