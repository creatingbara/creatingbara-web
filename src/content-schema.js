// Modelo de contenido editable del sitio.
// Cada campo: { key, label, type: 'text'|'textarea', default }
// El `default` coincide con el texto original del HTML: el panel lo muestra como
// punto de partida y el sitio solo cambia cuando se guarda un valor distinto.
// Las claves coinciden con los atributos data-cms="..." en el HTML.
// Las claves shared.* aparecen en varias páginas: editarlas cambia todas a la vez.

export const CONTENT_SCHEMA = [
  {
    group: 'Compartido · Cómo trabajamos (inicio y servicios)',
    fields: [
      { key: 'shared.proceso.kicker', label: 'Etiqueta', type: 'text', default: 'Cómo trabajamos' },
      { key: 'shared.proceso.title', label: 'Título', type: 'text', default: 'Un solo trazo, tres pasos' },
      { key: 'shared.proceso.lead', label: 'Descripción', type: 'textarea', default: 'Como nuestro logo: un trazo continuo que empieza en tu idea y no se detiene hasta que tu marca está lista para comunicar.' },
      { key: 'shared.proceso.step1_title', label: 'Paso 1 · Título', type: 'text', default: 'Conversamos' },
      { key: 'shared.proceso.step1_text', label: 'Paso 1 · Texto', type: 'textarea', default: 'Nos cuentas tu marca, tu público y tu meta. Sin tecnicismos ni formularios eternos.' },
      { key: 'shared.proceso.step2_title', label: 'Paso 2 · Título', type: 'text', default: 'Creamos' },
      { key: 'shared.proceso.step2_text', label: 'Paso 2 · Texto', type: 'textarea', default: 'Diseñamos con identidad: propuestas claras, revisiones incluidas y cero plantillas genéricas.' },
      { key: 'shared.proceso.step3_title', label: 'Paso 3 · Título', type: 'text', default: 'Publicas' },
      { key: 'shared.proceso.step3_text', label: 'Paso 3 · Texto', type: 'textarea', default: 'Recibes todo listo para usar: archivos en las medidas correctas y guía de publicación.' },
    ],
  },
  {
    group: 'Compartido · Bloque iglesias y ministerios',
    fields: [
      { key: 'shared.mini.kicker', label: 'Etiqueta', type: 'text', default: 'Para iglesias y ministerios' },
      { key: 'shared.mini.title', label: 'Título', type: 'text', default: 'Tu iglesia también merece verse con excelencia.' },
      { key: 'shared.mini.text', label: 'Texto', type: 'textarea', default: 'Artes para cultos, series, eventos y redes con una identidad coherente que honra el mensaje que comunican.' },
      { key: 'shared.mini.cta', label: 'Botón', type: 'text', default: 'Hablemos de tu ministerio' },
    ],
  },
  {
    group: 'Compartido · Tarjeta de contacto (final de página)',
    fields: [
      { key: 'shared.cta.pill', label: 'Etiqueta', type: 'text', default: 'GRATIS · POR LANZAMIENTO' },
      { key: 'shared.cta.title', label: 'Título', type: 'text', default: 'Mini auditoría de tu marca' },
      { key: 'shared.cta.text', label: 'Texto', type: 'textarea', default: 'Envíanos tu @ de Instagram o tu WhatsApp Business y te respondemos con una cosa concreta que puedes mejorar hoy para verte más profesional. Sin compromiso.' },
      { key: 'shared.cta.button', label: 'Botón', type: 'text', default: 'Pedir mi auditoría gratis' },
    ],
  },

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
    group: 'Nosotros · Portada',
    fields: [
      { key: 'nosotros.hero.kicker', label: 'Etiqueta', type: 'text', default: 'Nosotros' },
      { key: 'nosotros.hero.title', label: 'Título', type: 'text', default: 'Un estudio con un nombre que es una declaración' },
      { key: 'nosotros.hero.lead', label: 'Descripción', type: 'textarea', default: 'Creating Bara nació de una convicción: el buen trabajo merece verse bien.' },
    ],
  },
  {
    group: 'Nosotros · Bará (significado)',
    fields: [
      { key: 'nosotros.bara.def', label: 'Definición', type: 'textarea', default: 'Es la palabra usada para la creación en «En el principio creó (bará) Dios los cielos y la tierra». No describe cualquier forma de hacer: describe crear con propósito, con orden y con excelencia.' },
      { key: 'nosotros.bara.claim', label: 'Frase de cierre', type: 'textarea', default: 'Por eso nos llamamos así. Porque no hacemos "diseñitos": damos forma, orden y propósito a ideas que aún no tienen imagen.' },
    ],
  },
  {
    group: 'Nosotros · El símbolo',
    fields: [
      { key: 'nosotros.simbolo.kicker', label: 'Etiqueta', type: 'text', default: 'El símbolo' },
      { key: 'nosotros.simbolo.title', label: 'Título', type: 'text', default: 'Un solo trazo que no se detiene' },
      { key: 'nosotros.simbolo.lead', label: 'Descripción', type: 'textarea', default: 'Nuestro monograma "cb" está construido con un trazo continuo — un trazo que nace y no se para, como la creación misma. Así trabajamos cada marca: desde la primera conversación hasta que está lista para comunicar.' },
    ],
  },
  {
    group: 'Nosotros · Valores',
    fields: [
      { key: 'nosotros.valores.kicker', label: 'Etiqueta', type: 'text', default: 'Valores' },
      { key: 'nosotros.valores.title', label: 'Título', type: 'text', default: 'Lo que no negociamos' },
      { key: 'nosotros.val1.title', label: 'Valor 1 · Título', type: 'text', default: 'Excelencia' },
      { key: 'nosotros.val1.text', label: 'Valor 1 · Texto', type: 'textarea', default: 'Todo lo que sale del estudio se ve profesional. Sin excepciones.' },
      { key: 'nosotros.val2.title', label: 'Valor 2 · Título', type: 'text', default: 'Claridad' },
      { key: 'nosotros.val2.text', label: 'Valor 2 · Texto', type: 'textarea', default: 'Diseño que comunica, no que confunde. Si no se entiende en 3 segundos, se rediseña.' },
      { key: 'nosotros.val3.title', label: 'Valor 3 · Título', type: 'text', default: 'Propósito' },
      { key: 'nosotros.val3.text', label: 'Valor 3 · Texto', type: 'textarea', default: 'Cada marca tiene una razón de ser; el diseño debe reflejarla.' },
      { key: 'nosotros.val4.title', label: 'Valor 4 · Título', type: 'text', default: 'Cercanía' },
      { key: 'nosotros.val4.text', label: 'Valor 4 · Texto', type: 'textarea', default: 'Trato humano y lenguaje simple. Cero tecnicismos innecesarios.' },
      { key: 'nosotros.val5.title', label: 'Valor 5 · Título', type: 'text', default: 'Fe y servicio' },
      { key: 'nosotros.val5.text', label: 'Valor 5 · Texto', type: 'textarea', default: 'Sensibilidad real para trabajar con ministerios y marcas cristianas.' },
    ],
  },

  {
    group: 'Servicios · Portada',
    fields: [
      { key: 'servicios.hero.kicker', label: 'Etiqueta', type: 'text', default: 'Servicios' },
      { key: 'servicios.hero.title', label: 'Título', type: 'text', default: 'Todo lo que tu marca necesita para verse profesional' },
      { key: 'servicios.hero.lead', label: 'Descripción', type: 'textarea', default: 'Del logo a la página web, con un mismo estándar: propósito, orden y excelencia.' },
    ],
  },
  {
    group: 'Servicios · Preguntas frecuentes',
    fields: [
      { key: 'servicios.faq.kicker', label: 'Etiqueta', type: 'text', default: 'Preguntas frecuentes' },
      { key: 'servicios.faq.title', label: 'Título', type: 'text', default: 'Antes de escribirnos' },
      { key: 'servicios.faq.q1', label: 'Pregunta 1', type: 'text', default: '¿Para qué negocios sirve la Web + Agenda 24/7?' },
      { key: 'servicios.faq.a1', label: 'Respuesta 1', type: 'textarea', default: 'Para cualquier negocio que trabaje con citas: salones, barberías, centros de uñas, pestañas y cejas, spas, consultorios médicos y dentales, psicólogos, nutricionistas, tatuadores, fotógrafos, entrenadores y más. Si tus clientes te escriben "¿tienes espacio para el viernes?", esto es para ti.' },
      { key: 'servicios.faq.q2', label: 'Pregunta 2', type: 'text', default: '¿La agenda puede cobrar la seña al reservar?' },
      { key: 'servicios.faq.a2', label: 'Respuesta 2', type: 'textarea', default: 'Sí. Según la herramienta que integremos para tu nicho, el cliente paga la seña con un link de pago o coordina la transferencia al confirmar. Eso reduce los plantones drásticamente — hasta un 89% según los datos de estas plataformas.' },
      { key: 'servicios.faq.q3', label: 'Pregunta 3', type: 'text', default: '¿Cuánto cuesta un logo o una identidad completa?' },
      { key: 'servicios.faq.a3', label: 'Respuesta 3', type: 'textarea', default: 'Depende del alcance de tu proyecto. Por eso empezamos siempre con una conversación corta: nos cuentas qué necesitas y te damos una cotización clara antes de empezar, sin sorpresas ni letra pequeña.' },
      { key: 'servicios.faq.q4', label: 'Pregunta 4', type: 'text', default: '¿Cuánto tiempo toma?' },
      { key: 'servicios.faq.a4', label: 'Respuesta 4', type: 'textarea', default: 'Piezas para redes: de 2 a 4 días. Una identidad completa (logo + paleta + manual): de 1 a 2 semanas, según las revisiones. Siempre acordamos la fecha antes de arrancar.' },
      { key: 'servicios.faq.q5', label: 'Pregunta 5', type: 'text', default: '¿Trabajan con iglesias y ministerios?' },
      { key: 'servicios.faq.a5', label: 'Respuesta 5', type: 'textarea', default: 'Sí — es una de nuestras especialidades. Entendemos el lenguaje, el propósito y la sensibilidad de comunicar un mensaje de fe con excelencia.' },
      { key: 'servicios.faq.q6', label: 'Pregunta 6', type: 'text', default: '¿Qué recibo al final?' },
      { key: 'servicios.faq.a6', label: 'Respuesta 6', type: 'textarea', default: 'Archivos listos para publicar en las medidas correctas, versiones editables cuando aplica, y una guía simple de uso. Nada de "ahí te dejo el archivo y suerte".' },
      { key: 'servicios.faq.q7', label: 'Pregunta 7', type: 'text', default: '¿Cómo empezamos?' },
      { key: 'servicios.faq.a7', label: 'Respuesta 7', type: 'textarea', default: 'Con la mini auditoría gratis o escribiéndonos por WhatsApp. Te respondemos el mismo día.' },
    ],
  },
];

// Conjunto de claves válidas (para validar en la API).
export const VALID_KEYS = new Set(CONTENT_SCHEMA.flatMap(g => g.fields.map(f => f.key)));
