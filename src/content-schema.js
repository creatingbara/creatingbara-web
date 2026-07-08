// Modelo de contenido editable del sitio.
// Cada campo: { key, label, type: 'text'|'textarea', default }
// El `default` coincide con el texto original del HTML: el panel lo muestra como
// punto de partida y el sitio solo cambia cuando se guarda un valor distinto.
// Las claves coinciden con los atributos data-cms="..." en el HTML.

export const CONTENT_SCHEMA = [
  {
    group: 'Inicio · Portada',
    fields: [
      { key: 'home.hero.kicker', label: 'Etiqueta superior', type: 'text', default: 'Estudio creativo · Branding & diseño' },
      { key: 'home.hero.lead', label: 'Descripción', type: 'textarea', default: 'Diseño gráfico, branding y soluciones digitales para emprendedores, negocios, ministerios y artistas que quieren verse profesionales y vender mejor.' },
      { key: 'home.hero.cta_audit', label: 'Botón principal', type: 'text', default: 'Pide tu mini auditoría gratis' },
      { key: 'home.hero.note', label: 'Nota bajo los botones', type: 'text', default: 'Respondemos el mismo día por WhatsApp.' },
    ],
  },
  {
    group: 'Inicio · Servicios (resumen)',
    fields: [
      { key: 'home.serv.kicker', label: 'Etiqueta', type: 'text', default: 'Servicios' },
      { key: 'home.serv.title', label: 'Título', type: 'text', default: 'Lo que hacemos por tu marca' },
      { key: 'home.serv.lead', label: 'Descripción', type: 'textarea', default: 'Todo lo que necesitas para verte profesional, en un solo lugar y listo para publicar.' },
    ],
  },
  {
    group: 'Inicio · Cómo trabajamos',
    fields: [
      { key: 'home.proceso.kicker', label: 'Etiqueta', type: 'text', default: 'Cómo trabajamos' },
      { key: 'home.proceso.title', label: 'Título', type: 'text', default: 'Un solo trazo, tres pasos' },
      { key: 'home.proceso.lead', label: 'Descripción', type: 'textarea', default: 'Como nuestro logo: un trazo continuo que empieza en tu idea y no se detiene hasta que tu marca está lista para comunicar.' },
      { key: 'home.proceso.step1_title', label: 'Paso 1 · Título', type: 'text', default: 'Conversamos' },
      { key: 'home.proceso.step1_text', label: 'Paso 1 · Texto', type: 'textarea', default: 'Nos cuentas tu marca, tu público y tu meta. Sin tecnicismos ni formularios eternos.' },
      { key: 'home.proceso.step2_title', label: 'Paso 2 · Título', type: 'text', default: 'Creamos' },
      { key: 'home.proceso.step2_text', label: 'Paso 2 · Texto', type: 'textarea', default: 'Diseñamos con identidad: propuestas claras, revisiones incluidas y cero plantillas genéricas.' },
      { key: 'home.proceso.step3_title', label: 'Paso 3 · Título', type: 'text', default: 'Publicas' },
      { key: 'home.proceso.step3_text', label: 'Paso 3 · Texto', type: 'textarea', default: 'Recibes todo listo para usar: archivos en las medidas correctas y guía de publicación.' },
    ],
  },
  {
    group: 'Inicio · Iglesias y ministerios',
    fields: [
      { key: 'home.mini.kicker', label: 'Etiqueta', type: 'text', default: 'Para iglesias y ministerios' },
      { key: 'home.mini.title', label: 'Título', type: 'text', default: 'Tu iglesia también merece verse con excelencia.' },
      { key: 'home.mini.text', label: 'Texto', type: 'textarea', default: 'Artes para cultos, series, eventos y redes con una identidad coherente que honra el mensaje que comunican.' },
      { key: 'home.mini.cta', label: 'Botón', type: 'text', default: 'Hablemos de tu ministerio' },
    ],
  },
  {
    group: 'Inicio · Bará (significado)',
    fields: [
      { key: 'home.bara.def', label: 'Definición', type: 'textarea', default: 'Crear con propósito, orden y excelencia. El tipo de creación que no improvisa: da forma a lo que antes no tenía imagen.' },
      { key: 'home.bara.claim', label: 'Frase de cierre', type: 'textarea', default: 'Ese es nuestro estándar. No hacemos "diseñitos": creamos marcas con propósito.' },
    ],
  },
  {
    group: 'Inicio · Blog (encabezado)',
    fields: [
      { key: 'home.blog.kicker', label: 'Etiqueta', type: 'text', default: 'Blog' },
      { key: 'home.blog.title', label: 'Título', type: 'text', default: 'Ideas para que tu marca se vea buena' },
      { key: 'home.blog.lead', label: 'Descripción', type: 'textarea', default: 'Tips prácticos de branding, diseño y redes — sin jerga técnica.' },
    ],
  },
  {
    group: 'Inicio · Contacto (tarjeta final)',
    fields: [
      { key: 'home.cta.pill', label: 'Etiqueta', type: 'text', default: 'GRATIS · POR LANZAMIENTO' },
      { key: 'home.cta.title', label: 'Título', type: 'text', default: 'Mini auditoría de tu marca' },
      { key: 'home.cta.text', label: 'Texto', type: 'textarea', default: 'Envíanos tu @ de Instagram o tu WhatsApp Business y te respondemos con una cosa concreta que puedes mejorar hoy para verte más profesional. Sin compromiso.' },
      { key: 'home.cta.button', label: 'Botón', type: 'text', default: 'Pedir mi auditoría gratis' },
    ],
  },
];

// Conjunto de claves válidas (para validar en la API).
export const VALID_KEYS = new Set(CONTENT_SCHEMA.flatMap(g => g.fields.map(f => f.key)));
