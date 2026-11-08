// Contenido del sitio en español (la fuente). Las demás lenguas salen de src/i18n/<codigo>.json,
// que traduce estas mismas cadenas una a una; al cambiar un texto aquí, "npm run generar"
// avisa de qué traducciones faltan.

export const NEGOCIO = {
  nombre: 'Luxor Marbella',
  telefono: '+34655673668',
  telefonoVisible: '655 67 36 68',          // sin prefijo; la web muestra siempre telefonoIntl
  telefonoIntl: '+34 655 67 36 68',         // el formato que se muestra en el resto del sitio
  whatsapp: '34655673668',
  email: 'info@luxormarbella.com',
  zonas: ['Marbella', 'Puerto Banús', 'Nueva Andalucía', 'San Pedro de Alcántara', 'Benahavís', 'Estepona', 'Elviria y Las Chapas', 'Sotogrande'],

  // PENDIENTE DEL CLIENTE. Mientras valgan null / [] no salen en los datos estructurados
  // (build.mjs, función jsonld) y el negocio se marca como Organization y no como LocalBusiness.
  // El 2026-10-02 el cliente dio una oficina (Real Club de Pádel Marbella) y luego dijo que la ubicación
  // estaba equivocada: se quitó. No poner dirección hasta tener la real, donde de verdad se atiende.
  direccion: null,          // { streetAddress: 'Calle y número', postalCode: '29600', addressLocality: 'Marbella', addressRegion: 'Málaga', addressCountry: 'ES' }
  direccionTexto: null,     // la dirección en una línea para el pie y el aviso legal (traducir en src/i18n)
  mapa: null,               // enlace a Google Maps de la dirección
  geo: null,                // { latitude: 36.00000, longitude: -4.00000 }  solo si la dirección es pública
  horario: { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '20:00' },
  horarioTexto: 'Todos los días, 9:00 – 20:00',   // el mismo horario en texto para el pie (traducir en src/i18n)
  idiomasAtencion: ['es', 'en'],  // idiomas en los que se atiende de verdad (dato del cliente, 2026-10-02); la web va en los 6
  perfiles: [],             // URL reales: ficha de Google, Instagram, Facebook, LinkedIn
  razonSocial: null,
  nif: null,
  fundacion: null,
};

// La frase de las zonas se usa tal cual en la portada, en "Quiénes somos", en Mantenimiento y en los datos estructurados.
export const ZONAS_FRASE = 'Luxor Marbella trabaja en Marbella, Puerto Banús, Nueva Andalucía, San Pedro de Alcántara, Benahavís, Estepona, Elviria y Las Chapas, y Sotogrande.';

// Lo que Luxor NO es. Google, Bing y los asistentes de IA siguen describiendo la web anterior al 12-oct
// (anuncios en Airbnb e Idealista, precios): estas frases lo desmienten en la FAQ de la portada y de
// alquileres, en el JSON-LD (disambiguatingDescription) y en llms.txt.
export const NO_ES = 'Luxor Marbella no es una inmobiliaria ni una agencia de alquiler: no publica anuncios, no busca huéspedes ni inquilinos y no fija precios.';
const NO_AGENCIA = { q: '¿Luxor Marbella es una inmobiliaria o una agencia de alquiler?', a: 'No. Luxor Marbella no publica anuncios en Airbnb, Booking ni Idealista, no busca huéspedes ni inquilinos y no fija precios. Se ocupa de la parte operativa del alquiler (entradas y salidas, limpieza y atención) con las reservas del propietario o de su agencia.' };

// Las líneas de servicio. Alimentan el explorador de la portada, el menú, el pie,
// el cuestionario de presupuesto y la página propia de cada servicio.
//   puntos: [x, y, xMovil, yMovil, aLaIzquierda] en % sobre la foto, uno por elemento de "incluye"
//   cabecera (opcional): otra foto para la cabecera de su página; si no hay, se usa la de la línea
// El 2026-10-12 el cliente pasó de presentarse como "property management" a "property services" y
// añadió el project management: la línea de alquiler dejó de ser "gestión integral" y pasó a ser el
// conjunto de servicios que necesita una vivienda alquilada, que se contratan juntos o por separado.
// Solo la parte operativa: Luxor no busca huéspedes ni inquilinos (no publica anuncios ni lleva captación).
export const SERVICIOS = [
  {
    id: 'proyectos',
    corto: 'Proyectos',
    menu: 'Project management',
    kicker: 'Tu proyecto, dirigido de principio a fin',
    titulo: 'Project management de reformas y obras',
    resumen: 'Dirigimos el proyecto de tu vivienda en Marbella de principio a fin: plan, presupuesto, oficios y plazos, con una sola persona que responde por todo.',
    foto: 'svc-proyectos.jpg',
    // cabecera de su página: el plano del vídeo de la portada (más «obra» que el baño terminado de la foto)
    cabecera: { foto: 'phead-proyectos.jpg', alt: 'Plano de planta de una vivienda sobre una mesa', ancho: 2400, alto: 1350 },
    alt: 'Baño terminado con encimera de piedra, espejo en arco y ducha de travertino',
    flip: false,
    h1: 'Project management de reformas y obras en Marbella',
    entrada: 'Planificamos, coordinamos y supervisamos tu proyecto de principio a fin, aunque no estés en Marbella.',
    metaTitle: 'Project management de reformas en Marbella | Luxor Marbella',
    metaDesc: 'Project management de reformas y obras en Marbella: planificación, presupuesto cerrado, coordinación de oficios y proveedores, seguimiento con partes y entrega.',
    incluye: [
      { n: 'Planificación y presupuesto', t: 'Definimos contigo qué se hace, en qué orden y en cuánto tiempo, con un presupuesto cerrado.', d: 'Qué se hace, en qué orden y en cuánto tiempo, con presupuesto cerrado.', p: [48, 37, 44, 37, false] },
      { n: 'Coordinación de oficios y proveedores', t: 'Organizamos a cada oficio y cada pedido de material para que la obra no se pare.', d: 'Oficios y materiales coordinados para que la obra no se pare.', p: [80, 34, 86, 34, true] },
      { n: 'Seguimiento de obra', t: 'Supervisamos la obra y te enviamos partes con fotos, estés donde estés.', d: 'Supervisión en persona y partes con fotos, estés donde estés.', p: [16, 30, 10, 30, false] },
      { n: 'Control de calidad y entrega', t: 'Revisamos cada acabado y te entregamos la vivienda limpia y lista.', d: 'Revisamos cada acabado y te entregamos la vivienda limpia, lista para usar o alquilar.', p: [55, 64, 58, 64, false] },
    ],
    secciones: [
      { h: 'Una sola persona al frente', p: ['Muchos oficios y proveedores, y tú hablas con una sola persona que responde por todo.'] },
      { h: 'Para propietarios que no están en Marbella', p: ['Solo te consultamos lo que necesita tu decisión. La obra la puede hacer nuestro propio <a href="{{url:reformas}}">equipo de reformas</a> y, al terminar, nos encargamos del <a href="{{url:mantenimiento}}">mantenimiento</a>, también si la alquilas.'] },
    ],
    faq: [
      { q: '¿Qué es el project management de una reforma?', a: 'Dirigir la reforma de principio a fin: plan, presupuesto, oficios, obra y entrega.' },
      { q: '¿Tengo que estar en Marbella durante la obra?', a: 'No. Supervisamos la obra por ti y te enviamos partes con fotos.' },
      { q: '¿Puedo contratar solo el project management?', a: 'Sí. Solo o junto a reformas, mantenimiento y alquiler.' },
      { q: '¿El presupuesto es cerrado?', a: 'Sí. Precio cerrado por escrito; cualquier extra se aprueba antes.' },
    ],
  },
  {
    id: 'reformas',
    corto: 'Reformas',
    menu: 'Reformas y home staging',
    kicker: 'Puesta en valor de la vivienda',
    titulo: 'Reformas, home staging y optimización de viviendas',
    resumen: 'Reformas en Marbella, grandes o pequeñas, para que la vivienda guste más y se alquile mejor.',
    foto: 'svc-reformas.jpg',
    alt: 'Salón en tonos crema con mesa de travertino',
    flip: false,
    h1: 'Reformas y home staging en Marbella',
    entrada: 'Reformas integrales, parciales y pequeñas, amueblado y decoración. Tu vivienda, lista para vivirla o para el mercado.',
    metaTitle: 'Reformas integrales y home staging en Marbella | Luxor Marbella',
    metaDesc: 'Reformas integrales, parciales y pequeñas en Marbella, reacondicionamiento para alquiler, amueblado, decoración, home staging y limpieza de fin de obra.',
    incluye: [
      { n: 'Reformas integrales y parciales', t: 'Desde pequeñas reformas y arreglos hasta la vivienda completa.', d: 'Del pequeño arreglo a la vivienda completa.', p: [62, 22, 60, 20, false] },
      { n: 'Reacondicionamiento para alquiler', t: 'Ponemos la vivienda a punto antes de sacarla al mercado de alquiler.', d: 'A punto antes de salir al mercado de alquiler.', p: [50, 56, 50, 56, false] },
      { n: 'Amueblado, decoración y home staging', t: 'Para que luzca en las fotos y en las visitas.', d: 'Para que luzca en las fotos y en las visitas.', p: [79, 42, 80, 40, true] },
      { n: 'Limpieza de fin de obra', t: 'Te la entregamos limpia y lista para entrar.', d: 'Te la entregamos limpia y lista para entrar.', p: [68, 86, 62, 86, false] },
    ],
    secciones: [
      { h: 'De una pequeña reforma a la vivienda entera', p: ['No hace falta una obra grande para llamarnos.', 'Si la obra es grande, la dirigimos con nuestro servicio de <a href="{{url:proyectos}}">project management</a>.'] },
      { h: 'Pensado para alquilar mejor', p: ['Si va a alquilarse, reformamos y amueblamos para que guste, aguante el uso y sea fácil de mantener. Y si la alquilas, llevamos también las <a href="{{url:mantenimiento}}">entradas, salidas y limpieza</a>.'] },
    ],
    faq: [
      { q: '¿Hacéis pequeñas reformas?', a: 'Sí, y también reformas parciales e integrales.' },
      { q: '¿Amuebláis la vivienda?', a: 'Sí: amueblado, decoración y home staging.' },
      { q: '¿Quién limpia al terminar la obra?', a: 'Nosotros, y entregamos la vivienda lista para entrar.' },
    ],
  },
  {
    id: 'mantenimiento',
    corto: 'Mantenimiento',
    menu: 'Mantenimiento y limpieza',
    kicker: 'Para cuando no estás en casa',
    titulo: 'Mantenimiento, llaves y limpieza para propietarios',
    resumen: 'Lo que necesita una casa cuando su dueño no está: que funcione, que esté limpia y que alguien responda por ella.',
    foto: 'svc-mantenimiento.jpg',
    // cabecera de su página: la misma casa recortada sin el televisor ni el reflejo del cristal
    cabecera: { foto: 'phead-mantenimiento.jpg', alt: 'Salón blanco con patio interior y un árbol', ancho: 1440, alto: 900 },
    alt: 'Salón blanco con patio interior y un árbol',
    flip: false,
    h1: 'Mantenimiento de viviendas y custodia de llaves en Marbella',
    entrada: 'Custodia de llaves, revisiones, averías, piscina, limpieza y gestiones de tu villa o apartamento, también mientras está alquilado.',
    metaTitle: 'Mantenimiento de viviendas y llaves en Marbella | Luxor Marbella',
    metaDesc: 'Llaves, revisiones, mantenimiento, piscina y jardín, limpieza y lavandería en Marbella. Y si la alquilas: check-in, check-out y limpieza entre estancias.',
    incluye: [
      { n: 'Mantenimiento y averías', t: 'Preventivo y correctivo, con piscina y exteriores: revisamos la vivienda, gestionamos cada avería y colocamos y recogemos los muebles de exterior.', d: 'Preventivo y correctivo, con piscina y jardín. Gestionamos cada avería.', p: [82, 60, 82, 62, true] },
      { n: 'Limpieza y lavandería', t: 'La casa limpia y la ropa de cama y baño lista.', d: 'La casa limpia y la ropa de cama y baño lista cuando llegues.', p: [50, 70, 48, 72, false] },
      { n: 'Llaves e inspecciones', t: 'Custodia y entrega de llaves, e inspección periódica de la vivienda cuando está cerrada.', d: 'Custodia y entrega de llaves. Inspecciones periódicas con la casa cerrada.', p: [52, 30, 44, 30, false] },
      { n: 'Suministros y servicios', t: 'Contratación de suministros, alarma, seguro, telefonía e internet, y de servicio doméstico.', d: 'Suministros, alarma, seguro, telefonía, internet y servicio doméstico: lo contratamos por ti.', p: [63, 42, 66, 44, false] },
      { n: 'Entradas y salidas de alquileres', t: 'Check-in, check-out, llaves y limpieza entre estancias, vacacional o de larga temporada.', d: 'Si la alquilas: check-in, check-out, llaves, limpieza entre estancias y atención a huéspedes e inquilinos.', p: [24, 62, 22, 62, false] },
      { n: 'Gestión administrativa', t: 'Gestión del pago de impuestos de la vivienda y representación en las reuniones de la comunidad de propietarios.', d: 'Pago de impuestos de la vivienda y representación en la comunidad de propietarios.', p: [86, 36, 84, 34, true] },
    ],
    secciones: [
      { h: 'Para propietarios que no viven aquí todo el año', p: ['Entramos con aviso previo y dejamos la casa como si llegaras mañana.', ZONAS_FRASE] },
      { h: 'También si la alquilas', p: ['Vacacional o de larga temporada, con las reservas que consigas tú o tu agencia.'] },
      { h: 'Un parte después de cada visita', p: ['Lo hecho, el material empleado y lo pendiente, con fotos.', 'Si hay algo que arreglar, te pasamos presupuesto antes de tocar nada y lo hacemos con nuestro <a href="{{url:reformas}}">servicio de reformas</a>.'] },
    ],
    faq: [
      { q: '¿Os ocupáis también de la piscina y el jardín?', a: 'Sí. El mantenimiento incluye piscina y exteriores.' },
      { q: '¿Guardáis las llaves de la vivienda?', a: 'Sí, y las entregamos a quien nos indiques.' },
      { q: '¿Podéis contratar la alarma, el seguro o internet?', a: 'Sí. Nos encargamos de contratar los suministros, la alarma, el seguro, la telefonía e internet.' },
      { q: '¿Preparáis la casa antes de que llegue?', a: 'Sí. Limpieza, ropa de cama y baño y muebles de exterior, listos el día que llegues.' },
      { q: '¿Trabajáis con alquiler de larga temporada o solo vacacional?', a: 'Con los dos: alquiler vacacional y de larga temporada.' },
      { q: '¿Trabajáis con Airbnb, Booking.com o con mi agencia?', a: 'Sí, por el canal que sea. El anuncio, el precio y las reservas son cosa tuya o de tu agencia; nosotros, de la casa y de quien la ocupa.' },
      NO_AGENCIA,
    ],
  },
];

export const GARANTIAS = [
  ['Llaves en custodia', 'Entramos siempre con aviso previo.'],
  ['Equipo propio', 'Sin subcontratas rotativas.'],
  ['Respuesta en un día laborable', 'Por teléfono, WhatsApp o correo.'],
  ['Parte de cada visita', 'Con fotos, estés donde estés.'],
];

// «Cómo trabajamos» de la portada. El 2026-10-28 se quedó en tres: «Un solo interlocutor» pasó a ser
// la entradilla de la sección y «Tu vivienda, lista para alquilar» repetía el servicio de alquileres.
export const VENTAJAS = [
  ['Molestias al mínimo,<br>casa protegida', 'Cubrimos suelos y muebles, y lo dejamos todo recogido.'],
  ['Especialistas<br>en segunda residencia', 'Humedad, salitre, desagües, persianas: sabemos qué le pasa a una casa cerrada.'],
  ['Precio cerrado<br>por escrito', 'Precio en firme tras visitar y medir. Ningún extra sin tu aprobación.'],
];


// Preguntas frecuentes generales (portada). Solo datos ciertos.
export const FAQ = [
  { q: '¿Qué es Luxor Marbella?', a: 'Luxor Marbella es una empresa de property services y project management de Marbella: cuida, mantiene y reforma viviendas de propietarios que no viven aquí todo el año, también en alquiler.' },
  { q: '¿Qué servicios ofrece Luxor Marbella?', a: 'Luxor Marbella ofrece tres líneas de servicio: project management de reformas y obras, reformas y home staging, y mantenimiento y limpieza de viviendas. Todas valen también para viviendas en alquiler.' },
  NO_AGENCIA,
  { q: '¿Qué horario tenéis y en qué idiomas atendéis?', a: 'Todos los días de 9:00 a 20:00, en español e inglés, por teléfono, WhatsApp (+34 655 67 36 68) o correo (info@luxormarbella.com).' },
  { q: '¿En qué zonas trabaja Luxor Marbella?', a: ZONAS_FRASE },
  { q: '¿Puedo contratar un solo servicio?', a: 'Sí, uno o varios. Si los combinas, coordinamos nosotros las visitas.' },
  { q: '¿Tengo que estar en Marbella?', a: 'No. Guardamos las llaves, entramos con aviso previo y te informamos tras cada visita.' },
  { q: '¿Cómo pido presupuesto?', a: 'Por el formulario, WhatsApp o al +34 655 67 36 68.' },
];
