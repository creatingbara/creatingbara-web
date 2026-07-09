// Interfaz del panel administrativo (HTML + JS vanilla, sin frameworks).
// Estilo: acento Terracota #DF573F de la marca, con modo oscuro (por defecto)
// y modo claro intercambiables — inspirado en el CRM interno de Creating Bara.

const THEME_SCRIPT = `<script>
(function(){
  try{
    var t=localStorage.getItem('cb_admin_theme')||'dark';
    document.documentElement.setAttribute('data-theme',t);
  }catch(_){document.documentElement.setAttribute('data-theme','dark');}
})();
</script>`;

const BRAND_CSS = `
:root{
  --terra:#DF573F; --terra-ink:#fff; --terra-soft:rgba(223,87,63,.16);
  --bg:#15100f; --surface:#1e1718; --surface-2:#28201f; --border:#382d2c;
  --text:#F5EFEA; --text-muted:#a89a95; --danger:#e5484d; --danger-soft:#3a1f1e;
  --ok:#3fb964; --ok-soft:#173322;
}
:root[data-theme="light"]{
  --bg:#F1ECE5; --surface:#FDFDFD; --surface-2:#F1ECE5; --border:#E3E3E6;
  --text:#3E3334; --text-muted:#8a8082; --danger-soft:#fdece9; --ok-soft:#eaf7ee;
}
*{box-sizing:border-box}
body{margin:0;font-family:'Nunito Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--text);background:var(--bg);transition:background .15s,color .15s}
h1,h2,h3{font-family:'Baloo 2','Nunito Sans',sans-serif;margin:0 0 .3em}
a{color:var(--terra)}
label{display:block;font-weight:700;margin:14px 0 6px;font-size:.92rem;color:var(--text)}
input,textarea{width:100%;padding:11px 13px;border:1px solid var(--border);border-radius:10px;font:inherit;background:var(--surface-2);color:var(--text)}
input:focus,textarea:focus{outline:2px solid var(--terra);outline-offset:1px;border-color:var(--terra)}
textarea{min-height:90px;resize:vertical}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--terra);color:#fff;border:0;border-radius:999px;padding:11px 20px;font:inherit;font-weight:800;cursor:pointer;white-space:nowrap}
.btn:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn.danger{background:transparent;color:var(--danger);border:1px solid var(--danger)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.iconbtn{width:38px;height:38px;border-radius:10px;border:1px solid var(--border);background:var(--surface-2);color:var(--text);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.05rem;flex:0 0 auto}
.iconbtn:hover{border-color:var(--terra);color:var(--terra)}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.muted{color:var(--text-muted);font-size:.9rem}
.msg{padding:10px 14px;border-radius:10px;margin:0 0 16px;font-weight:700;display:none}
.msg.err{display:block;background:var(--danger-soft);color:var(--danger)}
.msg.ok{display:block;background:var(--ok-soft);color:var(--ok)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px 24px;margin:0 0 18px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.grid2{grid-template-columns:1fr}}

/* login */
.login-shell{min-height:100vh;display:grid;place-items:center;padding:24px}
.login-card{width:100%;max-width:400px}
.brand{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.3rem;color:var(--terra)}

/* shell del panel: sidebar + contenido */
.shell{display:flex;min-height:100vh}
.sidebar{width:236px;flex:0 0 236px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:20px 14px;position:sticky;top:0;height:100vh;overflow:auto}
.sidebar .brand{padding:6px 10px 18px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:var(--text-muted);cursor:pointer;font-weight:700;font-size:.95rem;margin-bottom:2px}
.nav-item:hover{background:var(--surface-2);color:var(--text)}
.nav-item.active{background:var(--terra-soft);color:var(--terra)}
.nav-item .dot{width:7px;height:7px;border-radius:99px;background:currentColor;flex:0 0 auto;opacity:.7}
.sidebar-footer{margin-top:auto;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.avatar{width:34px;height:34px;border-radius:99px;background:var(--terra);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex:0 0 auto}
.sidebar-footer .who{min-width:0;flex:1}
.sidebar-footer .who .name{font-weight:800;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sidebar-footer .who .mail{font-size:.76rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.main{flex:1;min-width:0}
.topbar{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:16px 30px;border-bottom:1px solid var(--border)}
.content{padding:26px 30px 64px;max-width:900px}
.content h1{font-size:1.6rem}

/* editor de imagen */
.imgfield{display:flex;gap:14px;align-items:flex-start;margin:8px 0 4px}
.imgpreview{width:120px;height:80px;border-radius:10px;background-size:cover;background-position:center;border:1px solid var(--border);background-color:var(--surface-2);display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;flex:0 0 auto}
.imgfield input[type=file]{padding:8px;font-size:.85rem}
.imgstatus{margin-top:6px;font-size:.82rem;color:var(--text-muted)}

.postrow{padding:14px 0;border-bottom:1px solid var(--border)}
.postrow:last-child{border-bottom:0}
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">`;

const SUN_ICON = '☀️';
const MOON_ICON = '🌙';

export function loginPage(sitekey) {
  const turnstile = sitekey
    ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
       <div class="cf-turnstile" data-sitekey="${sitekey}" data-theme="dark" style="margin:16px 0"></div>`
    : `<p class="muted" style="margin-top:16px">Turnstile no configurado (modo desarrollo).</p>`;
  return `<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Panel · Creating Bara</title>${THEME_SCRIPT}${FONTS}<style>${BRAND_CSS}</style></head>
<body><div class="login-shell"><div class="card login-card">
<div class="brand">Creating Bara</div>
<h1 style="margin-top:6px">Panel administrativo</h1>
<p class="muted">Inicia sesión para editar el sitio.</p>
<div id="msg" class="msg"></div>
<form id="f" autocomplete="off">
<label for="u">Usuario</label>
<input id="u" name="u" autocomplete="username" required>
<label for="p">Contraseña</label>
<input id="p" name="p" type="password" autocomplete="current-password" required>
${turnstile}
<button class="btn" id="btn" type="submit" style="width:100%;justify-content:center;margin-top:12px">Entrar</button>
</form></div></div>
<script>
const f=document.getElementById('f'),msg=document.getElementById('msg'),btn=document.getElementById('btn');
function show(t,ok){msg.textContent=t;msg.className='msg '+(ok?'ok':'err');}
f.addEventListener('submit',async e=>{
  e.preventDefault();btn.disabled=true;
  const ts=(window.turnstile&&document.querySelector('[name=cf-turnstile-response]')||{}).value||'';
  try{
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({u:f.u.value,p:f.p.value,ts})});
    const d=await r.json();
    if(r.ok&&d.ok){location.href='/admin';return;}
    show(d.error||'No se pudo iniciar sesión.',false);
    if(window.turnstile)window.turnstile.reset();
  }catch(_){show('Error de red. Intenta de nuevo.',false);}
  btn.disabled=false;
});
</script></body></html>`;
}

export function panelPage(username) {
  const initial = escapeHtml((username || '?').trim().charAt(0).toUpperCase());
  return `<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Editor · Creating Bara</title>${THEME_SCRIPT}${FONTS}<style>${BRAND_CSS}</style></head>
<body><div class="shell">

<aside class="sidebar">
<div class="brand">Creating Bara</div>
<nav>
<div class="nav-item active" data-tab="contenido"><span class="dot"></span> Contenido</div>
<div class="nav-item" data-tab="blog"><span class="dot"></span> Blog</div>
<div class="nav-item" data-tab="contacto"><span class="dot"></span> Contacto</div>
<div class="nav-item" data-tab="seguridad"><span class="dot"></span> Seguridad</div>
</nav>
<div class="sidebar-footer">
<div class="avatar">${initial}</div>
<div class="who"><div class="name">${escapeHtml(username)}</div><div class="mail">Cerrar sesión</div></div>
<button class="iconbtn" id="logout" title="Salir" aria-label="Salir">⏻</button>
</div>
</aside>

<div class="main">
<div class="topbar">
<button class="iconbtn" id="themeToggle" title="Cambiar tema" aria-label="Cambiar tema">${MOON_ICON}</button>
<a class="btn ghost" href="https://creatingbara.com/" target="_blank" rel="noopener">Ver sitio ↗</a>
</div>
<div class="content">

<div id="msg" class="msg"></div>

<section class="tabpane" data-pane="contenido">
<h1>Contenido del sitio</h1>
<p class="muted">Edita los textos e imágenes de inicio, servicios y nosotros. Los bloques "Compartido" aparecen en varias páginas. Al guardar, los cambios se publican de inmediato.</p>
<div class="card">
<form id="contentForm"><div id="contentFields">Cargando…</div>
<button class="btn" type="submit" style="margin-top:18px">Guardar cambios</button></form>
</div>
</section>

<section class="tabpane" data-pane="blog" hidden>
<div class="row"><h1 style="margin:0">Blog</h1><button class="btn" id="newPost">+ Nuevo artículo</button></div>
<p class="muted">Crea, edita o borra artículos. Se publican en creatingbara.com/blog/.</p>
<div class="card"><div id="postList">Cargando…</div></div>

<div class="card" id="postEditor" hidden>
<h3 id="postEditorTitle">Nuevo artículo</h3>
<form id="postForm">
<input type="hidden" name="id">
<label for="pt">Título</label>
<input id="pt" name="title" required>
<div class="grid2">
<div><label for="pcat">Categoría</label><input id="pcat" name="category" placeholder="Redes, Branding…"></div>
<div><label for="pmin">Minutos de lectura</label><input id="pmin" name="minutes" type="number" min="1" value="3"></div>
<div><label for="pdate">Fecha (texto)</label><input id="pdate" name="date_label" placeholder="16 jun 2026"></div>
<div><label for="pslug">Enlace (slug) — opcional</label><input id="pslug" name="slug" placeholder="se genera del título"></div>
</div>
<label for="pdesc">Descripción corta (para tarjetas y buscadores)</label>
<textarea id="pdesc" name="description"></textarea>
<label for="pbody">Contenido del artículo (HTML)</label>
<textarea id="pbody" name="body_html" style="min-height:260px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9rem"></textarea>
<p class="muted">Usa etiquetas simples: &lt;p&gt;párrafo&lt;/p&gt;, &lt;h2&gt;subtítulo&lt;/h2&gt;, &lt;ul&gt;&lt;li&gt;lista&lt;/li&gt;&lt;/ul&gt;, &lt;strong&gt;negrita&lt;/strong&gt;. Para empezar el artículo: &lt;p class="intro"&gt;…&lt;/p&gt;</p>
<label style="display:flex;align-items:center;gap:8px;font-weight:600"><input type="checkbox" name="published" checked style="width:auto"> Publicado (visible en el sitio)</label>
<div class="row" style="margin-top:16px;justify-content:flex-start;gap:10px">
<button class="btn" type="submit">Guardar artículo</button>
<button class="btn ghost" type="button" id="cancelPost">Cancelar</button>
<button class="btn danger" type="button" id="deletePost" style="margin-left:auto">Borrar</button>
</div>
</form>
</div>
</section>

<section class="tabpane" data-pane="contacto" hidden>
<h1>Datos de contacto</h1>
<p class="muted">Estos valores alimentan todos los botones de WhatsApp, redes y correo del sitio.</p>
<div class="card">
<form id="contactForm">
<div class="grid2">
<div><label for="wa">WhatsApp (solo números, con código de país)</label>
<input id="wa" name="contact.whatsapp" placeholder="18090000000"></div>
<div><label for="email">Correo</label>
<input id="email" name="contact.email" placeholder="hola@creatingbara.com"></div>
<div><label for="ig">Instagram (usuario, sin @)</label>
<input id="ig" name="contact.instagram" placeholder="creatingbara"></div>
<div><label for="fb">Facebook (usuario o página)</label>
<input id="fb" name="contact.facebook" placeholder="creatingbara"></div>
</div>
<button class="btn" type="submit" style="margin-top:16px">Guardar contacto</button>
</form>
</div>
</section>

<section class="tabpane" data-pane="seguridad" hidden>
<h1>Cambiar contraseña</h1>
<p class="muted">Usa una contraseña larga y única. Se guarda cifrada (hash), nunca en texto plano.</p>
<div class="card">
<form id="pwForm">
<label for="cur">Contraseña actual</label>
<input id="cur" name="current" type="password" autocomplete="current-password">
<div class="grid2">
<div><label for="np">Nueva contraseña</label>
<input id="np" name="next" type="password" autocomplete="new-password"></div>
<div><label for="np2">Repetir nueva contraseña</label>
<input id="np2" name="next2" type="password" autocomplete="new-password"></div>
</div>
<button class="btn" type="submit" style="margin-top:16px">Actualizar contraseña</button>
</form>
</div>
</section>

</div>
</div>
</div>
<script>
const msg=document.getElementById('msg');
function show(t,ok){msg.textContent=t;msg.className='msg '+(ok?'ok':'err');window.scrollTo({top:0,behavior:'smooth'});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

// tema
const themeBtn=document.getElementById('themeToggle');
function paintThemeBtn(){themeBtn.textContent=document.documentElement.getAttribute('data-theme')==='light'?'${MOON_ICON}':'${SUN_ICON}';}
paintThemeBtn();
themeBtn.addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme')||'dark';
  const next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  try{localStorage.setItem('cb_admin_theme',next);}catch(_){}
  paintThemeBtn();
});

// navegación (sidebar)
document.querySelectorAll('.nav-item').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  const name=t.dataset.tab;
  document.querySelectorAll('.tabpane').forEach(p=>p.hidden=p.dataset.pane!==name);
  msg.className='msg';
}));
// logout
document.getElementById('logout').addEventListener('click',async()=>{
  await fetch('/api/logout',{method:'POST'});location.href='/admin';
});
// cargar contacto
async function loadContact(){
  const r=await fetch('/api/content?prefix=contact.');
  if(!r.ok)return;
  const d=await r.json();
  for(const[k,v]of Object.entries(d.content||{})){
    const el=document.querySelector('[name="'+k+'"]');if(el)el.value=v;
  }
}
document.getElementById('contactForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const fd=new FormData(e.target),entries={};
  for(const[k,v]of fd.entries())entries[k]=v;
  const r=await fetch('/api/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entries})});
  const d=await r.json();
  show(r.ok&&d.ok?'Contacto guardado. Los cambios ya están en el sitio.':(d.error||'No se pudo guardar.'),r.ok&&d.ok);
});
document.getElementById('pwForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const f=e.target;
  if(f.next.value!==f.next2.value){show('Las contraseñas nuevas no coinciden.',false);return;}
  if(f.next.value.length<8){show('La nueva contraseña debe tener al menos 8 caracteres.',false);return;}
  const r=await fetch('/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({current:f.current.value,next:f.next.value})});
  const d=await r.json();
  show(r.ok&&d.ok?'Contraseña actualizada.':(d.error||'No se pudo actualizar.'),r.ok&&d.ok);
  if(r.ok&&d.ok)f.reset();
});

// ---- editor de contenido (textos e imágenes) ----
const fieldsBox=document.getElementById('contentFields');
async function loadContentEditor(){
  try{
    const [rs,rc]=await Promise.all([fetch('/api/schema'),fetch('/api/content')]);
    const {schema}=await rs.json();const {content}=await rc.json();
    let html='';
    for(const g of schema){
      html+='<h3 style="margin:22px 0 4px">'+esc(g.group)+'</h3>';
      for(const f of g.fields){
        const val=(content&&content[f.key]!=null)?content[f.key]:f.default;
        const id='cf_'+f.key.replace(/[^a-z0-9]/gi,'_');
        html+='<label for="'+id+'">'+esc(f.label)+'</label>';
        if(f.type==='image'){
          const bg=val?('background-image:url(\\''+val.replace(/'/g,'%27')+'\\')'):'';
          html+='<div class="imgfield" data-key="'+esc(f.key)+'">'
            +'<div class="imgpreview" style="'+esc(bg)+'">'+(val?'':'<span class="muted" style="font-size:.72rem">Imagen original</span>')+'</div>'
            +'<div style="flex:1;min-width:0"><input type="file" accept="image/*" class="imgpicker">'
            +'<input type="hidden" name="'+esc(f.key)+'" value="'+esc(val||'')+'">'
            +'<div class="imgstatus"></div></div></div>';
        } else if(f.type==='textarea'){
          html+='<textarea id="'+id+'" name="'+esc(f.key)+'">'+esc(val)+'</textarea>';
        } else {
          html+='<input id="'+id+'" name="'+esc(f.key)+'" value="'+esc(val)+'">';
        }
      }
    }
    fieldsBox.innerHTML=html;
  }catch(_){fieldsBox.textContent='No se pudo cargar el contenido.';}
}
// subir imagen (delegación, funciona tras cada re-render)
fieldsBox.addEventListener('change', async e=>{
  if(!e.target.classList.contains('imgpicker'))return;
  const input=e.target, wrap=input.closest('.imgfield');
  const file=input.files[0]; if(!file)return;
  const hidden=wrap.querySelector('input[type=hidden]');
  const status=wrap.querySelector('.imgstatus');
  const preview=wrap.querySelector('.imgpreview');
  status.textContent='Subiendo…';
  try{
    const fd=new FormData();fd.append('file',file);
    const r=await fetch('/api/upload',{method:'POST',body:fd});
    const d=await r.json();
    if(r.ok&&d.ok){
      hidden.value=d.url;
      preview.style.backgroundImage="url('"+d.url+"')";
      preview.textContent='';
      status.textContent='Imagen lista — pulsa "Guardar cambios" para publicarla.';
    } else {
      status.textContent=d.error||'No se pudo subir la imagen.';
    }
  }catch(_){status.textContent='Error de red al subir la imagen.';}
});
document.getElementById('contentForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const fd=new FormData(e.target),entries={};
  for(const[k,v]of fd.entries())entries[k]=v;
  const r=await fetch('/api/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entries})});
  const d=await r.json();
  show(r.ok&&d.ok?'Cambios guardados y publicados en el sitio.':(d.error||'No se pudo guardar.'),r.ok&&d.ok);
});

// ---- blog ----
const postList=document.getElementById('postList');
const postEditor=document.getElementById('postEditor');
const postForm=document.getElementById('postForm');
async function loadPosts(){
  try{
    const d=await (await fetch('/api/posts')).json();
    const posts=d.posts||[];
    if(!posts.length){postList.innerHTML='<p class="muted">Aún no hay artículos.</p>';return;}
    postList.innerHTML=posts.map(p=>
      '<div class="row postrow">'
      +'<div><strong>'+esc(p.title)+'</strong>'+(p.published?'':' <span class="muted">(borrador)</span>')
      +'<br><span class="muted">'+esc(p.category||'')+' · '+esc(p.date_label||'')+' · /blog/'+esc(p.slug)+'.html</span></div>'
      +'<button class="btn ghost editPost" data-id="'+p.id+'">Editar</button></div>'
    ).join('');
    document.querySelectorAll('.editPost').forEach(b=>b.addEventListener('click',()=>openPost(b.dataset.id)));
  }catch(_){postList.textContent='No se pudo cargar el blog.';}
}
function fillForm(p){
  postForm.id.value=p.id||'';postForm.title.value=p.title||'';postForm.category.value=p.category||'';
  postForm.minutes.value=p.minutes||3;postForm.date_label.value=p.date_label||'';postForm.slug.value=p.slug||'';
  postForm.description.value=p.description||'';postForm.body_html.value=p.body_html||'';
  postForm.published.checked=p.published!==0;
  document.getElementById('deletePost').style.display=p.id?'':'none';
}
function showEditor(title){document.getElementById('postEditorTitle').textContent=title;postEditor.hidden=false;postEditor.scrollIntoView({behavior:'smooth'});}
document.getElementById('newPost').addEventListener('click',()=>{fillForm({minutes:3,published:1});showEditor('Nuevo artículo');});
document.getElementById('cancelPost').addEventListener('click',()=>{postEditor.hidden=true;});
async function openPost(id){
  const d=await (await fetch('/api/posts?id='+id)).json();
  if(d.ok){fillForm(d.post);showEditor('Editar artículo');}
}
postForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const b={id:postForm.id.value||null,title:postForm.title.value,category:postForm.category.value,
    minutes:postForm.minutes.value,date_label:postForm.date_label.value,slug:postForm.slug.value,
    description:postForm.description.value,body_html:postForm.body_html.value,published:postForm.published.checked};
  const r=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
  const d=await r.json();
  if(r.ok&&d.ok){show('Artículo guardado.',true);postEditor.hidden=true;loadPosts();}
  else show(d.error||'No se pudo guardar.',false);
});
document.getElementById('deletePost').addEventListener('click',async()=>{
  const id=postForm.id.value;if(!id)return;
  if(!confirm('¿Borrar este artículo? No se puede deshacer.'))return;
  const r=await fetch('/api/posts/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  const d=await r.json();
  if(r.ok&&d.ok){show('Artículo borrado.',true);postEditor.hidden=true;loadPosts();}
  else show(d.error||'No se pudo borrar.',false);
});
loadContentEditor();
loadContact();
loadPosts();
</script></body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
