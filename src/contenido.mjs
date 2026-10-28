// Contenido del sitio en español (la fuente). Las demás lenguas salen de src/i18n/<codigo>.json,
// que traduce estas mismas cadenas una a una; al cambiar un texto aquí, "npm run generar"
// avisa de qué traducciones faltan.

export const NEGOCIO = {
  nombre: 'Luxor Marbella',
  telefono: '+34603605543',
  telefonoVisible: '603 60 55 43',          // solo para el botón de la cabecera, donde no cabe el prefijo
  telefonoIntl: '+34 603 60 55 43',         // el formato que se muestra en el resto del sitio
  whatsapp: '34603605543',
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
    id: 'alquileres',
    corto: 'Alquileres',
    menu: 'Servicios para alquileres',
    kicker: 'Property services · vacacional y larga temporada',
    titulo: 'Servicios para tu vivienda en alquiler',
    resumen: 'La parte operativa de una vivienda alquilada en Marbella, vacacional o de larga temporada: entradas y salidas, limpieza entre estancias, puesta a punto y atención a quien la ocupa.',
    foto: 'svc-alquileres.jpg',
    alt: 'Villa blanca contemporánea con grandes ventanales iluminados al anochecer',
    flip: false,
    h1: 'Servicios para alquiler vacacional y de larga temporada en Marbella',
    entrada: 'Nos ocupamos de la parte operativa de tu alquiler: entradas y salidas, limpieza entre estancias, puesta a punto y atención a quien ocupa la vivienda.',
    metaTitle: 'Servicios para alquileres en Marbella | Luxor Marbella',
    metaDesc: 'Property services para viviendas en alquiler en Marbella: entradas y salidas, llaves, limpieza y lavandería entre estancias, puesta a punto y atención a huéspedes.',
    incluye: [
      { n: 'Entradas, salidas y llaves', t: 'Recibimos a huéspedes e inquilinos, entregamos las llaves y revisamos la casa a la salida.', d: 'Recibimos a huéspedes e inquilinos y les entregamos las llaves. Cuando se van, las recogemos y revisamos la vivienda.', p: [30, 82, 30, 82, false] },
      { n: 'Limpieza y lavandería entre estancias', t: 'La casa limpia y la ropa de cama y baño lista para cada llegada.', d: 'Limpiamos la vivienda y nos ocupamos de la lavandería entre una estancia y la siguiente, para que todo esté listo para cada llegada.', p: [50, 71, 50, 71, false] },
      { n: 'Puesta a punto antes de cada llegada', t: 'Revisamos que todo funcione y reponemos lo necesario antes de cada check-in.', d: 'Antes de cada llegada revisamos que todo funcione y reponemos lo necesario, para que la vivienda esté a punto.', p: [73, 34, 73, 34, true] },
      { n: 'Atención a huéspedes e inquilinos', t: 'Respondemos nosotros: a ti y a quien vive o se aloja en tu casa.', d: 'Somos el contacto de quien vive o se aloja en tu casa, y también el tuyo. Si algo falla, lo resolvemos con nuestro equipo de mantenimiento.', p: [22, 46, 22, 46, false] },
    ],
    secciones: [
      { h: 'Vacacional o de larga temporada', p: ['Trabajamos con las dos modalidades y adaptamos el servicio a cada una: en el alquiler vacacional, las entradas, las salidas y la limpieza entre estancias; en el de larga temporada, la atención al inquilino y el cuidado de la vivienda.'] },
      { h: 'Contratas solo lo que necesitas', p: ['Puedes encargarnos toda la parte operativa del alquiler o solo una parte: las entradas y salidas, la limpieza o la atención a huéspedes. Lo que haga falta en la casa lo resolvemos con nuestro propio servicio de <a href="{{url:mantenimiento}}">mantenimiento y limpieza</a>, así que no tienes que coordinar a nadie.'] },
    ],
    faq: [
      { q: '¿Trabajáis con alquiler de larga temporada o solo vacacional?', a: 'Con los dos. Damos servicio a viviendas en alquiler vacacional y de larga temporada.' },
      { q: '¿Buscáis huéspedes o inquilinos?', a: 'No. Nos ocupamos de la parte operativa del alquiler: entradas y salidas, limpieza, lavandería, atención y mantenimiento. Trabajamos con las reservas y los contratos que consigas tú o tu agencia.' },
      { q: '¿Puedo contratar solo la limpieza o las entradas y salidas?', a: 'Sí. Puedes encargarnos toda la parte operativa del alquiler o solo la parte que necesites.' },
      { q: '¿Tengo que estar en Marbella para alquilar mi casa?', a: 'No. Guardamos las llaves y nos ocupamos de la vivienda y de quien la ocupa. Tú hablas con una sola persona.' },
    ],
  },
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
    entrada: 'Planificamos, coordinamos y supervisamos el proyecto de tu vivienda de principio a fin, aunque tú no estés en Marbella.',
    metaTitle: 'Project management de reformas en Marbella | Luxor Marbella',
    metaDesc: 'Project management de reformas y obras en Marbella: planificación, presupuesto cerrado, coordinación de oficios y proveedores, seguimiento con partes y entrega.',
    incluye: [
      { n: 'Planificación y presupuesto', t: 'Definimos contigo qué se hace, en qué orden y en cuánto tiempo, con un presupuesto cerrado.', d: 'Antes de empezar definimos contigo qué se va a hacer, en qué orden y en cuánto tiempo, y te damos un presupuesto cerrado.', p: [48, 37, 44, 37, false] },
      { n: 'Coordinación de oficios y proveedores', t: 'Organizamos a cada oficio y cada pedido de material para que la obra no se pare.', d: 'Organizamos a cada oficio y cada pedido de material para que la obra avance sin tiempos muertos.', p: [80, 34, 86, 34, true] },
      { n: 'Seguimiento de obra', t: 'Supervisamos la obra y te enviamos partes con fotos, estés donde estés.', d: 'Supervisamos la obra en persona y te enviamos partes con fotos de cómo avanza y de lo que queda pendiente, estés donde estés.', p: [16, 30, 10, 30, false] },
      { n: 'Control de calidad y entrega', t: 'Revisamos cada acabado y te entregamos la vivienda limpia y lista.', d: 'Revisamos cada acabado antes de darlo por terminado y te entregamos la vivienda limpia y lista para usar o alquilar.', p: [55, 64, 58, 64, false] },
    ],
    secciones: [
      { h: 'Una sola persona al frente', p: ['Un proyecto reúne a muchos oficios y proveedores. Nosotros los coordinamos y tú hablas con una sola persona, que responde por todo el proyecto.'] },
      { h: 'Para propietarios que no están en Marbella', p: ['Te mantenemos al día con partes y fotos, y solo te consultamos lo que de verdad necesita tu decisión. La obra la puede hacer nuestro propio <a href="{{url:reformas}}">equipo de reformas</a> y, al terminar, podemos encargarnos también del <a href="{{url:mantenimiento}}">mantenimiento</a> o de los <a href="{{url:alquileres}}">servicios para el alquiler</a>.'] },
    ],
    faq: [
      { q: '¿Qué es el project management de una reforma?', a: 'Es dirigir el proyecto de principio a fin: planificarlo, presupuestarlo, coordinar a los oficios y proveedores, supervisar la obra y entregarla terminada.' },
      { q: '¿Tengo que estar en Marbella durante la obra?', a: 'No. Supervisamos la obra por ti y te enviamos partes con fotos de cómo avanza.' },
      { q: '¿Puedo contratar solo el project management?', a: 'Sí. Puedes contratarlo solo o combinarlo con nuestros servicios de reformas, mantenimiento y alquiler.' },
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
    entrada: 'Reformas integrales, parciales y pequeñas, amueblado y decoración. Dejamos la vivienda lista para vivirla o para sacarla al mercado.',
    metaTitle: 'Reformas y home staging en Marbella | Luxor Marbella',
    metaDesc: 'Reformas integrales, parciales y pequeñas en Marbella, reacondicionamiento para alquiler, amueblado, decoración, home staging y limpieza de fin de obra.',
    incluye: [
      { n: 'Reformas integrales y parciales', t: 'Desde pequeñas reformas y arreglos hasta la vivienda completa.', d: 'Desde pequeñas reformas y arreglos hasta la vivienda completa: baños, cocinas y actualizaciones puntuales.', p: [62, 22, 60, 20, false] },
      { n: 'Reacondicionamiento para alquiler', t: 'Ponemos la vivienda a punto antes de sacarla al mercado de alquiler.', d: 'Ponemos la vivienda a punto antes de sacarla al mercado de alquiler: reparamos y renovamos lo que haga falta.', p: [50, 56, 50, 56, false] },
      { n: 'Amueblado, decoración y home staging', t: 'Amueblamos y decoramos la vivienda para las fotos del anuncio y para las visitas.', d: 'Amueblamos y decoramos la vivienda pensando en las fotos del anuncio y en las visitas.', p: [79, 42, 80, 40, true] },
      { n: 'Limpieza de fin de obra', t: 'Te la entregamos limpia y lista para entrar.', d: 'Al terminar limpiamos a fondo y te entregamos la vivienda lista para entrar.', p: [68, 86, 62, 86, false] },
    ],
    secciones: [
      { h: 'De una pequeña reforma a la vivienda entera', p: ['No hace falta una obra grande para llamarnos. Hacemos arreglos y pequeñas reformas igual que reformas parciales e integrales.', 'Si el proyecto es grande, también lo dirigimos de principio a fin con nuestro servicio de <a href="{{url:proyectos}}">project management</a>.'] },
      { h: 'Pensado para alquilar mejor', p: ['Si la vivienda va a alquilarse, la reforma y el amueblado se deciden con ese fin: que guste, que aguante el uso y que sea fácil de mantener. Después podemos encargarnos también de los <a href="{{url:alquileres}}">servicios para el alquiler</a>.'] },
    ],
    faq: [
      { q: '¿Hacéis pequeñas reformas?', a: 'Sí. Hacemos pequeñas reformas y arreglos, además de reformas parciales e integrales.' },
      { q: '¿Amuebláis la vivienda?', a: 'Sí. Nos ocupamos del amueblado, la decoración y el home staging.' },
      { q: '¿Quién limpia al terminar la obra?', a: 'Nosotros. Hacemos la limpieza de fin de obra y entregamos la vivienda lista para entrar.' },
    ],
  },
  {
    id: 'mantenimiento',
    corto: 'Mantenimiento',
    menu: 'Mantenimiento y limpieza',
    kicker: 'Para cuando no estás en casa',
    titulo: 'Mantenimiento, limpieza y servicios premium para propietarios',
    resumen: 'Lo que necesita una casa cuando su dueño no está: que funcione, que esté limpia y que alguien responda por ella.',
    foto: 'svc-mantenimiento.jpg',
    alt: 'Salón blanco con patio interior y un árbol',
    flip: false,
    h1: 'Mantenimiento y limpieza de viviendas en Marbella',
    entrada: 'Revisiones, averías, limpieza, lavandería, llaves y gestiones de la vivienda, para que la casa esté a punto aunque tú no estés.',
    metaTitle: 'Mantenimiento y limpieza en Marbella | Luxor Marbella',
    metaDesc: 'Mantenimiento preventivo y correctivo, limpieza, lavandería, piscina y exteriores, custodia de llaves y gestión de suministros para viviendas en Marbella.',
    incluye: [
      { n: 'Mantenimiento y averías', t: 'Preventivo y correctivo, con piscina y exteriores: revisamos la vivienda, gestionamos cada avería y colocamos y recogemos los muebles de exterior.', d: 'Mantenimiento preventivo y correctivo, con piscina y exteriores. Revisamos la vivienda, gestionamos cada avería y colocamos y recogemos los muebles de exterior.', p: [82, 60, 82, 62, true] },
      { n: 'Limpieza y lavandería', t: 'La casa limpia y la ropa de cama y baño lista.', d: 'Limpieza de la vivienda y lavandería, para que la casa y la ropa de cama y baño estén listas cuando llegues.', p: [50, 70, 48, 72, false] },
      { n: 'Llaves e inspecciones', t: 'Custodia y entrega de llaves, e inspección periódica de la vivienda cuando está cerrada.', d: 'Custodiamos y entregamos las llaves, e inspeccionamos la vivienda de forma periódica cuando está cerrada.', p: [52, 30, 44, 30, false] },
      { n: 'Suministros y servicios', t: 'Contratación de suministros, alarma, seguro, telefonía e internet, y de servicio doméstico.', d: 'Contratamos por ti los suministros, la alarma, el seguro, la telefonía e internet, y el servicio doméstico.', p: [63, 42, 66, 44, false] },
      { n: 'Gestión administrativa', t: 'Gestión del pago de impuestos de la vivienda y representación en las reuniones de la comunidad de propietarios.', d: 'Gestionamos el pago de los impuestos de la vivienda y te representamos en las reuniones de la comunidad de propietarios.', p: [86, 36, 84, 34, true] },
    ],
    secciones: [
      { h: 'Para propietarios que no viven aquí todo el año', p: ['Guardamos las llaves, entramos con aviso previo y dejamos la casa como si fueras a llegar mañana.', 'Si además la alquilas mientras no estás, también nos encargamos de los <a href="{{url:alquileres}}">servicios para el alquiler</a>.'] },
      { h: 'Un parte después de cada visita', p: ['Después de cada visita recibes un parte con lo que se ha hecho, el material empleado y lo que queda pendiente.', 'Si en una visita vemos algo que conviene arreglar o renovar, te pasamos presupuesto antes de tocar nada y lo hacemos con nuestro <a href="{{url:reformas}}">servicio de reformas</a>.'] },
    ],
    faq: [
      { q: '¿Os ocupáis también de la piscina y el jardín?', a: 'Sí. El mantenimiento incluye piscina y exteriores.' },
      { q: '¿Guardáis las llaves de la vivienda?', a: 'Sí. Custodiamos las llaves y las entregamos a quien tú nos indiques.' },
      { q: '¿Podéis contratar la alarma, el seguro o internet?', a: 'Sí. Nos encargamos de contratar los suministros, la alarma, el seguro, la telefonía e internet.' },
    ],
  },
];

export const GARANTIAS = [
  ['Llaves en custodia', 'Entramos siempre con aviso previo.'],
  ['Equipo propio', 'Sin subcontratas rotativas.'],
  ['Respuesta en 24 h', 'En días laborables.'],
  ['Parte de cada visita', 'Con fotos, estés donde estés.'],
];

// «Cómo trabajamos» de la portada. El 2026-10-28 se quedó en tres: «Un solo interlocutor» pasó a ser
// la entradilla de la sección y «Tu vivienda, lista para alquilar» repetía el servicio de alquileres.
export const VENTAJAS = [
  ['Molestias al mínimo,<br>casa protegida', 'Cubrimos suelos y mobiliario antes de empezar y dejamos la vivienda recogida al terminar.'],
  ['Especialistas<br>en segunda residencia', 'Sabemos qué le pasa a una casa cerrada seis meses: humedad, salitre, desagües y persianas.'],
  ['Precio cerrado<br>por escrito', 'Visitamos, medimos y damos un precio en firme. Cualquier extra se aprueba antes de tocarlo.'],
];

// La frase de las zonas se usa tal cual en la portada, en "Quiénes somos" y en los datos estructurados.
export const ZONAS_FRASE = 'Luxor Marbella trabaja en Marbella, Puerto Banús, Nueva Andalucía, San Pedro de Alcántara, Benahavís, Estepona, Elviria y Las Chapas, y Sotogrande.';

// Preguntas frecuentes generales (portada). Solo datos ciertos.
export const FAQ = [
  { q: '¿Qué es Luxor Marbella?', a: 'Luxor Marbella es una empresa de property services y project management de Marbella: cuida, reforma y prepara para el alquiler las viviendas de propietarios que no viven aquí todo el año.' },
  { q: '¿Qué servicios ofrece Luxor Marbella?', a: 'Luxor Marbella ofrece cuatro líneas de servicio: servicios para alquileres, project management de reformas y obras, reformas y home staging, y mantenimiento y limpieza de viviendas.' },
  { q: '¿En qué zonas trabaja Luxor Marbella?', a: ZONAS_FRASE },
  { q: '¿Puedo contratar un solo servicio?', a: 'Sí. Puedes contratar un solo servicio o combinarlos. Si los combinas, coordinamos las visitas entre nosotros.' },
  { q: '¿Tengo que estar en Marbella?', a: 'No. Guardamos las llaves, entramos con aviso previo y te contamos lo que hacemos después de cada visita.' },
  { q: '¿Cómo pido presupuesto?', a: 'Desde el formulario de la web, por WhatsApp o llamando al +34 603 60 55 43.' },
];
