// Renderizado del blog (índice y artículos) usando la plantilla del sitio.
import { PAGE } from './blog-template.js';

const SITE = 'https://creatingbara.com';
const CAT_STYLE = 'font-family:var(--display);background:var(--crema);color:var(--terra);padding:3px 12px;border-radius:999px';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function renderPage({ title, desc, url, main }) {
  return PAGE
    .split('{{TITLE}}').join(esc(title))
    .split('{{DESC}}').join(esc(desc))
    .split('{{URL}}').join(esc(url))
    .replace('{{ALT_EN}}', '')
    .replace('{{MAIN}}', main);
}

function metaHtml(post) {
  return `<div class="meta"><span class="cat" style="${CAT_STYLE}">${esc(post.category)}</span>`
    + `<span>${esc(post.date_label)}</span><span>· ${esc(post.minutes)} min</span></div>`;
}

function cardHtml(post) {
  return `<a class="post reveal" href="/blog/${esc(post.slug)}.html"><div class="thumb"></div>`
    + `<div class="body"><div class="meta"><span class="cat">${esc(post.category)}</span>`
    + `<span>${esc(post.date_label)}</span><span>· ${esc(post.minutes)} min</span></div>`
    + `<h3>${esc(post.title)}</h3><p>${esc(post.description)}</p>`
    + `<span class="more">Leer artículo →</span></div></a>`;
}

const CTA = `<section class="section" id="contacto"><div class="wrap"><div class="cta-card reveal">`
  + `<span class="pillito" data-cms="shared.cta.pill">GRATIS · POR LANZAMIENTO</span>`
  + `<h2 data-cms="shared.cta.title">Mini auditoría de tu marca</h2>`
  + `<p data-cms="shared.cta.text">Envíanos tu @ de Instagram o tu WhatsApp Business y te respondemos con <strong>una cosa concreta</strong> que puedes mejorar hoy para verte más profesional. Sin compromiso.</p>`
  + `<a class="btn btn-primary js-wa-audit" href="#" data-cms="shared.cta.button">Pedir mi auditoría gratis</a>`
  + `</div></div></section>`;

export function renderArticle(post, related) {
  const relatedHtml = related.length
    ? `<section class="section" style="background:var(--crema);padding-top:60px"><div class="wrap">`
      + `<h2 class="reveal">Sigue leyendo</h2><div class="postcards">${related.map(cardHtml).join('')}</div></div></section>`
    : '';
  const main = `<section class="section"><div class="wrap"><div class="article">`
    + metaHtml(post) + `<h1>${esc(post.title)}</h1>` + post.body_html
    + `</div></div></section>` + relatedHtml + CTA;
  return renderPage({
    title: `${post.title} — Creating Bara`,
    desc: post.description,
    url: `${SITE}/blog/${post.slug}.html`,
    main,
  });
}

export function renderIndex(posts) {
  const cards = posts.length ? posts.map(cardHtml).join('') : '<p class="lead">Pronto publicaremos nuevos artículos.</p>';
  const main = `<section class="page-hero"><div class="wrap">`
    + `<p class="kicker">Blog</p><h1>Ideas para que tu marca se vea buena</h1>`
    + `<p class="lead">Tips prácticos de branding, diseño y redes — sin jerga técnica.</p></div></section>`
    + `<section class="section"><div class="wrap"><div class="postcards">${cards}</div></div></section>` + CTA;
  return renderPage({
    title: 'Blog — Creating Bara',
    desc: 'Tips prácticos de branding, diseño y redes para que tu marca se vea profesional.',
    url: `${SITE}/blog/`,
    main,
  });
}
