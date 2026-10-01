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
  direccion: null,          // { streetAddress: 'Calle y número', postalCode: '29600', addressLocality: 'Marbella', addressRegion: 'Málaga', addressCountry: 'ES' }
  geo: null,                // { latitude: 36.00000, longitude: -4.00000 }  solo si la dirección es pública
  horario: null,            // { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' }
  idiomasAtencion: ['es'],  // idiomas en los que se atiende de verdad el teléfono; no los de la web
  perfiles: [],             // URL reales: ficha de Google, Instagram, Facebook, LinkedIn
  razonSocial: null,
  nif: null,
  fundacion: null,
};

// Las tres líneas de servicio. Alimentan el explorador de la portada, el menú, el pie,
// el cuestionario de presupuesto y la página propia de cada servicio.
//   puntos: [x, y, xMovil, yMovil, aLaIzquierda] en % sobre la foto, uno por elemento de "incluye"
export const SERVICIOS = [
  {
    id: 'alquileres',
    corto: 'Alquileres',
    menu: 'Gestión de propiedades y alquileres',
    kicker: 'Property management · vacacional y larga temporada',
    titulo: 'Gestión integral de propiedades y alquileres',
    resumen: 'Llevamos el alquiler de tu vivienda en Marbella de principio a fin, vacacional o de larga temporada, con un solo interlocutor para ti y para quien la ocupa.',
    foto: 'svc-alquileres.jpg',
    alt: 'Casa blanca con arcos, tejado de teja y jardín',
    flip: false,
    h1: 'Gestión de alquileres en Marbella',
    entrada: 'Alquiler vacacional y de larga temporada, llevado de principio a fin. Publicamos la vivienda, atendemos a quien la ocupa y tú hablas con una sola persona.',
    metaTitle: 'Gestión de alquileres en Marbella | Luxor Marbella',
    metaDesc: 'Gestión integral de alquiler vacacional y de larga temporada en Marbella: anuncio en Airbnb e Idealista, atención a inquilinos y un solo interlocutor.',
    incluye: [
      { n: 'Publicación en plataformas', t: 'Tu vivienda anunciada en Airbnb, Idealista y otros portales de alquiler.', d: 'Preparamos el anuncio y lo publicamos en Airbnb, Idealista y otros portales de alquiler.', p: [46, 55, 40, 56, false] },
      { n: 'Captación de inquilinos y huéspedes', t: 'Seguimos cada contacto en nuestro CRM hasta cerrar la reserva o el contrato.', d: 'Cada persona interesada queda registrada en nuestro CRM y la seguimos hasta cerrar la reserva o el contrato.', p: [61, 49, 70, 50, false] },
      { n: 'Atención a propietarios e inquilinos', t: 'Respondemos nosotros: a ti y a quien vive o se aloja en tu casa.', d: 'Somos el contacto de quien vive o se aloja en tu casa, y también el tuyo. No tienes que atender llamadas ni mensajes.', p: [78, 40, 80, 32, true] },
      { n: 'Rentabilidad del inmueble', t: 'Ajustamos precios y ocupación para que la vivienda rinda más.', d: 'Revisamos precios y ocupación para que la vivienda rinda lo que puede dar.', p: [54, 72, 56, 70, false] },
    ],
    secciones: [
      { h: 'Vacacional o de larga temporada', p: ['Gestionamos las dos modalidades. Si no tienes claro cuál te conviene, lo vemos contigo según la vivienda, la zona y el uso que quieras darle.'] },
      { h: 'Todo lo que rodea al alquiler', p: ['Una vivienda alquilada necesita limpieza entre estancias, lavandería y alguien que responda cuando algo falla. Lo hacemos con nuestro propio servicio de <a href="{{url:mantenimiento}}">mantenimiento y limpieza</a>, así que no tienes que coordinar a nadie.'] },
    ],
    faq: [
      { q: '¿Gestionáis alquiler de larga temporada o solo vacacional?', a: 'Los dos. Llevamos alquiler vacacional y alquiler de larga temporada.' },
      { q: '¿En qué portales anunciáis la vivienda?', a: 'En Airbnb, Idealista y otros portales de alquiler.' },
      { q: '¿Tengo que estar en Marbella para alquilar mi casa?', a: 'No. Guardamos las llaves y nos ocupamos de la vivienda y de quien la ocupa. Tú hablas con una sola persona.' },
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
    alt: 'Salón en tonos claros con sofá modular y lámpara de techo',
    flip: false,
    h1: 'Reformas y home staging en Marbella',
    entrada: 'Reformas integrales, parciales y pequeñas, amueblado y decoración. Dejamos la vivienda lista para vivirla o para sacarla al mercado.',
    metaTitle: 'Reformas y home staging en Marbella | Luxor Marbella',
    metaDesc: 'Reformas integrales, parciales y pequeñas en Marbella, reacondicionamiento para alquiler, amueblado, decoración, home staging y limpieza de fin de obra.',
    incluye: [
      { n: 'Reformas integrales y parciales', t: 'Desde pequeñas reformas y arreglos hasta la vivienda completa.', d: 'Desde pequeñas reformas y arreglos hasta la vivienda completa: baños, cocinas y actualizaciones puntuales.', p: [80, 34, 78, 30, true] },
      { n: 'Reacondicionamiento para alquiler', t: 'Ponemos la vivienda a punto antes de sacarla al mercado de alquiler.', d: 'Ponemos la vivienda a punto antes de sacarla al mercado de alquiler: reparamos y renovamos lo que haga falta.', p: [70, 68, 78, 66, true] },
      { n: 'Amueblado, decoración y home staging', t: 'Amueblamos y decoramos la vivienda para las fotos del anuncio y para las visitas.', d: 'Amueblamos y decoramos la vivienda pensando en las fotos del anuncio y en las visitas.', p: [47, 38, 46, 40, false] },
      { n: 'Limpieza de fin de obra', t: 'Te la entregamos limpia y lista para entrar.', d: 'Al terminar limpiamos a fondo y te entregamos la vivienda lista para entrar.', p: [47, 76, 40, 72, false] },
    ],
    secciones: [
      { h: 'De una pequeña reforma a la vivienda entera', p: ['No hace falta una obra grande para llamarnos. Hacemos arreglos y pequeñas reformas igual que reformas parciales e integrales.'] },
      { h: 'Pensado para alquilar mejor', p: ['Si la vivienda va a alquilarse, la reforma y el amueblado se deciden con ese fin: que guste, que aguante el uso y que sea fácil de mantener. Después podemos encargarnos también de la <a href="{{url:alquileres}}">gestión del alquiler</a>.'] },
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
    alt: 'Persona fregando el suelo de un dormitorio luminoso',
    flip: true,
    h1: 'Mantenimiento y limpieza de viviendas en Marbella',
    entrada: 'Revisiones, averías, limpieza, lavandería, llaves y gestiones de la vivienda, para que la casa esté a punto aunque tú no estés.',
    metaTitle: 'Mantenimiento y limpieza de viviendas en Marbella | Luxor Marbella',
    metaDesc: 'Mantenimiento preventivo y correctivo, limpieza, lavandería, piscina y exteriores, custodia de llaves y gestión de suministros para viviendas en Marbella.',
    incluye: [
      { n: 'Mantenimiento y averías', t: 'Preventivo y correctivo, con piscina y exteriores: revisamos la vivienda, gestionamos cada avería y colocamos y recogemos los muebles de exterior.', d: 'Mantenimiento preventivo y correctivo, con piscina y exteriores. Revisamos la vivienda, gestionamos cada avería y colocamos y recogemos los muebles de exterior.', p: [84, 66, 84, 68, true] },
      { n: 'Limpieza y lavandería', t: 'La casa limpia y la ropa de cama y baño lista.', d: 'Limpieza de la vivienda y lavandería, para que la casa y la ropa de cama y baño estén listas cuando llegues.', p: [70, 60, 66, 60, false] },
      { n: 'Llaves e inspecciones', t: 'Custodia y entrega de llaves, e inspección periódica de la vivienda cuando está cerrada.', d: 'Custodiamos y entregamos las llaves, e inspeccionamos la vivienda de forma periódica cuando está cerrada.', p: [51, 24, 44, 28, false] },
      { n: 'Suministros y servicios', t: 'Contratación de suministros, alarma, seguro, telefonía e internet, y de servicio doméstico.', d: 'Contratamos por ti los suministros, la alarma, el seguro, la telefonía e internet, y el servicio doméstico.', p: [44, 66, 24, 62, false] },
      { n: 'Gestión administrativa', t: 'Gestión del pago de impuestos de la vivienda y representación en las reuniones de la comunidad de propietarios.', d: 'Gestionamos el pago de los impuestos de la vivienda y te representamos en las reuniones de la comunidad de propietarios.', p: [82, 26, 82, 26, true] },
    ],
    secciones: [
      { h: 'Para propietarios que no viven aquí todo el año', p: ['Guardamos las llaves, entramos con aviso previo y dejamos la casa como si fueras a llegar mañana.'] },
      { h: 'Un parte después de cada visita', p: ['Después de cada visita recibes un parte con lo que se ha hecho, el material empleado y lo que queda pendiente.'] },
    ],
    faq: [
      { q: '¿Os ocupáis también de la piscina y el jardín?', a: 'Sí. El mantenimiento incluye piscina y exteriores.' },
      { q: '¿Guardáis las llaves de la vivienda?', a: 'Sí. Custodiamos las llaves y las entregamos a quien tú nos indiques.' },
      { q: '¿Podéis contratar la alarma, el seguro o internet?', a: 'Sí. Nos encargamos de contratar los suministros, la alarma, el seguro, la telefonía e internet.' },
    ],
  },
];

export const GARANTIAS = [
  ['Presupuesto cerrado', 'Lo que firmas es lo que pagas.'],
  ['Equipo propio', 'Sin subcontratas rotativas.'],
  ['Respuesta en 24 h', 'En días laborables.'],
  ['Parte de cada visita', 'Con fotos, estés donde estés.'],
];

export const VENTAJAS = [
  ['Un solo interlocutor<br>para toda la casa', 'No coordinas a un fontanero, una limpiadora y una agencia por separado. Nos coordinamos nosotros.'],
  ['Molestias al mínimo,<br>casa protegida', 'Cubrimos suelos y mobiliario antes de empezar y dejamos la vivienda recogida al terminar.'],
  ['Especialistas<br>en segunda residencia', 'Sabemos qué le pasa a una casa cerrada seis meses: humedad, salitre, desagües y persianas.'],
  ['Tu vivienda,<br>lista para alquilar', 'Limpieza entre estancias, lavandería, reposición y revisión técnica antes de cada check-in.'],
  ['Precio cerrado<br>por escrito', 'Visitamos, medimos y damos un precio en firme. Cualquier extra se aprueba antes de tocarlo.'],
];

export const TICKER = ['Alquiler vacacional', 'Alquiler de larga temporada', 'Reformas integrales y parciales', 'Pequeñas reformas', 'Amueblado y home staging', 'Mantenimiento y averías', 'Limpieza y lavandería', 'Piscina y exteriores', 'Custodia de llaves'];

// La frase de las zonas se usa tal cual en la portada, en "Quiénes somos" y en los datos estructurados.
export const ZONAS_FRASE = 'Luxor Marbella trabaja en Marbella, Puerto Banús, Nueva Andalucía, San Pedro de Alcántara, Benahavís, Estepona, Elviria y Las Chapas, y Sotogrande.';

// Preguntas frecuentes generales (portada). Solo datos ciertos.
export const FAQ = [
  { q: '¿Qué es Luxor Marbella?', a: 'Luxor Marbella es una empresa de Marbella que gestiona alquileres, reforma y mantiene viviendas para propietarios que no viven aquí todo el año.' },
  { q: '¿Qué servicios ofrece Luxor Marbella?', a: 'Luxor Marbella ofrece tres líneas de servicio: gestión integral de propiedades y alquileres, reformas y home staging, y mantenimiento y limpieza de viviendas.' },
  { q: '¿En qué zonas trabaja Luxor Marbella?', a: ZONAS_FRASE },
  { q: '¿Puedo contratar un solo servicio?', a: 'Sí. Puedes contratar un solo servicio o combinarlos. Si los combinas, coordinamos las visitas entre nosotros.' },
  { q: '¿Tengo que estar en Marbella?', a: 'No. Guardamos las llaves, entramos con aviso previo y te contamos lo que hacemos después de cada visita.' },
  { q: '¿Cómo pido presupuesto?', a: 'Desde el formulario de la web, por WhatsApp o llamando al +34 603 60 55 43.' },
];
