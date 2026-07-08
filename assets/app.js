
const CONFIG={whatsapp:"18090000000",instagram:"creatingbara",facebook:"creatingbara",email:"hola@creatingbara.com"};
const wa=m=>`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(m)}`;
const L=document.documentElement.lang==="en";
document.querySelectorAll('.js-wa').forEach(a=>a.href=wa(L?"Hi Creating Bara 👋 I'd like to know more about your services.":"Hola Creating Bara 👋 Quiero información sobre sus servicios."));
document.querySelectorAll('.js-wa-audit').forEach(a=>a.href=wa(L?"Hi 👋 I want my free mini brand audit. My brand is: ":"Hola 👋 Quiero mi mini auditoría gratis. Mi marca es: "));
document.querySelectorAll('.js-wa-mini').forEach(a=>a.href=wa("Hola 🙌 Sirvo en un ministerio y quiero mejorar nuestra imagen."));
document.querySelectorAll('.js-ig').forEach(a=>a.href=`https://instagram.com/${CONFIG.instagram}`);
document.querySelectorAll('.js-fb').forEach(a=>a.href=`https://facebook.com/${CONFIG.facebook}`);
document.querySelectorAll('.js-mail').forEach(a=>a.href=`mailto:${CONFIG.email}`);
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
function toggleMenu(b){const m=document.getElementById('menu');const o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)}
document.querySelectorAll('#menu a').forEach(a=>a.addEventListener('click',()=>document.getElementById('menu').classList.remove('open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
