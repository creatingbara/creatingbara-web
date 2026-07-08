# CLAUDE.md — creatingbara.com

## Qué es este proyecto
Sitio web estático y bilingüe de **Creating Bara**, estudio creativo de diseño gráfico, branding y soluciones digitales (República Dominicana). Español en la raíz (`/`) y espejo parcial en inglés (`/en/`: inicio + blog). **Sin frameworks, sin build, sin dependencias**: HTML + CSS + JS vanilla. Se publica tal cual en cualquier hosting estático.

## Estructura
```
index.html            Inicio (ES)
servicios.html        Servicios + FAQ
nosotros.html         Historia (Bará), símbolo, valores
blog/                 Índice + artículos (ES)
en/                   Inicio y blog en inglés
assets/style.css      Todos los estilos (tokens en :root)
assets/app.js         CONFIG de contacto + menú + reveals
sitemap.xml, robots.txt
```

## Previsualizar
```
python3 -m http.server 8000
```
y abrir http://localhost:8000 (las rutas son relativas).

## REGLAS DURAS DE MARCA — nunca romper
1. **Paleta exacta** (variables en `:root` de `assets/style.css`):
   Terracota `#DF573F` · Negro cálido `#3E3334` · Blanco `#FDFDFD` · Crema `#F1ECE5` · Línea `#E3E3E6`. **No introducir ningún otro color.**
2. **Tipografías:** Baloo 2 (títulos) y Nunito Sans (textos), vía Google Fonts. **Máximo esas dos familias.**
3. **Logo:** está inline como **SVG vectorial** con `fill="currentColor"` en el header y footer de cada página. **NUNCA** reemplazarlo por PNG/JPG (las copias rasterizadas pierden la transparencia), ni estirarlo, rotarlo o recolorearlo fuera de la paleta.
4. **Texturas de papel:** son JPEG en base64 dentro de `assets/style.css` (`.hero`, `.page-hero`, `.bara`, `.mini`, `.post .thumb`). No eliminarlas ni "optimizarlas".
5. **Tono de voz:** español, tuteo, claro y sin jerga técnica, inspirador sin promesas exageradas. Mensaje eje: *"Tu trabajo es bueno. Ahora haz que se vea bueno."* Hashtag fijo: `#QueSeVeaBueno`.

## Convenciones técnicas
- **Contacto centralizado:** el objeto `CONFIG` al inicio de `assets/app.js` (whatsapp, instagram, facebook, email). Los enlaces usan las clases `js-wa`, `js-wa-audit`, `js-wa-mini`, `js-ig`, `js-fb`, `js-mail`. **Nunca** hardcodear números o links de contacto en el HTML.
- **Bilingüe:** las páginas con contraparte (inicio, blog e índices) llevan `hreflang` y `canonical`; el selector ES|EN del nav apunta a la contraparte correcta.
- **Accesibilidad ya implementada** (mantener en todo lo nuevo): `:focus-visible`, `prefers-reduced-motion`, `aria-label`, jerarquía de encabezados.
- **Animaciones:** clase `.reveal` (IntersectionObserver en `app.js`). Nada de librerías de animación.

## Tareas comunes

### Agregar un artículo al blog (ES)
1. Duplicar `blog/regla-3-segundos.html` como plantilla → `blog/mi-slug.html`.
2. Actualizar `<title>`, meta description, `canonical` (+ `hreflang` si tendrá versión EN), categoría, fecha, minutos, H1 y cuerpo (usa `.intro`, `h2`, `.divider`, listas).
3. Agregar su tarjeta en `blog/index.html` y en la sección Blog de `index.html` (el home muestra los 3 más recientes).
4. Versión EN (opcional): crear `en/blog/slug-en.html` + tarjetas en `en/blog/index.html` y `en/index.html`.
5. Añadir la(s) URL(s) a `sitemap.xml`.
6. Verificar que todos los enlaces relativos funcionan con el servidor local.

### Agregar una página nueva
Copiar el `<head>`, header y footer de una página existente **de la misma profundidad** (los prefijos `../` dependen del nivel). Añadirla al nav si corresponde y a `sitemap.xml`.

### Cambiar datos de contacto
Solo en `CONFIG` (`assets/app.js`). Nada más.

## Checklist antes de dar por terminado un cambio
- [ ] Solo colores de la paleta y las 2 tipografías oficiales
- [ ] Textos en español con tuteo (o inglés correcto si es `/en/`)
- [ ] Enlaces relativos verificados con `python3 -m http.server`
- [ ] Se ve bien en móvil (~380 px) sin desbordes horizontales
- [ ] `sitemap.xml` actualizado si hubo páginas nuevas
- [ ] Cero dependencias, frameworks o pasos de build añadidos

## Qué NO hacer
- No introducir frameworks, bundlers ni paquetes npm.
- No tocar los paths SVG del logo ni los data-URI de textura.
- No inventar precios, teléfonos ni datos de contacto.
- No cambiar el hashtag ni el mensaje eje de la marca.
