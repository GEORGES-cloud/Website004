// Textos legales en español. Describen lo que la web hace de verdad: si cambia el tratamiento
// de datos (analítica, cookies, otro proveedor), hay que actualizarlos aquí.
// PENDIENTE DEL CLIENTE: razón social, NIF y domicilio del titular. La LSSI (art. 10) y el RGPD
// (art. 13) piden identificarlo; hasta tener esos datos solo figuran nombre comercial y contacto.
import { NEGOCIO as N } from './contenido.mjs';

export const LEGAL = {
  'aviso-legal': {
    es: 'aviso-legal',
    xx: 'legal-notice',
    titulo: 'Aviso legal',
    entrada: 'Información general sobre este sitio web y las condiciones para usarlo.',
    html: `      <h2>Titular del sitio</h2>
      <p>El sitio web www.luxormarbella.com pertenece a Luxor Marbella.</p>
      <p>Contacto: <a href="mailto:${N.email}">${N.email}</a> · <a href="tel:${N.telefono}">+34 ${N.telefonoVisible}</a></p>
      <h2>Objeto</h2>
      <p>El sitio informa sobre los servicios de Luxor Marbella —gestión de alquileres, reformas y mantenimiento de viviendas en Marbella y la Costa del Sol— y permite pedir presupuesto.</p>
      <h2>Condiciones de uso</h2>
      <p>El acceso al sitio es libre y gratuito. Quien lo usa se compromete a hacerlo de forma lícita y a no dañar el sitio ni impedir su funcionamiento.</p>
      <h2>Propiedad intelectual</h2>
      <p>Los textos, el diseño y la marca Luxor Marbella pertenecen a su titular. Las fotografías proceden de Unsplash y se usan conforme a su licencia. No está permitido reproducir los contenidos con fines comerciales sin autorización.</p>
      <h2>Responsabilidad</h2>
      <p>La información del sitio es orientativa y no constituye una oferta vinculante: las condiciones y el precio de cada servicio son los que figuren en el presupuesto aceptado por escrito.</p>
      <p>Luxor Marbella no responde del contenido de los sitios de terceros a los que este sitio enlaza.</p>
      <h2>Legislación aplicable</h2>
      <p>Este aviso legal se rige por la legislación española.</p>`,
  },
  privacidad: {
    es: 'privacidad',
    xx: 'privacy',
    titulo: 'Política de privacidad',
    entrada: 'Qué datos personales recogemos en esta web, para qué los usamos y cómo puedes ejercer tus derechos.',
    html: `      <h2>Quién es el responsable</h2>
      <p>El responsable del tratamiento es Luxor Marbella. Puedes escribirnos a <a href="mailto:${N.email}">${N.email}</a> o llamarnos al <a href="tel:${N.telefono}">+34 ${N.telefonoVisible}</a>.</p>
      <h2>Qué datos recogemos</h2>
      <p>Solo los que tú nos das al pedir presupuesto: nombre, teléfono, correo electrónico si lo indicas, la zona de la vivienda, el servicio que te interesa y lo que quieras contarnos en el mensaje.</p>
      <p>Si nos escribes por WhatsApp, por correo o nos llamas, trataremos los datos que nos facilites por ese medio.</p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Para responder a tu solicitud y prepararte un presupuesto.</li>
        <li>Para enviarte comunicaciones comerciales de Luxor Marbella, solo si marcas la casilla correspondiente.</li>
      </ul>
      <h2>Base legal</h2>
      <p>Tratamos tus datos porque nos los envías para que te hagamos un presupuesto (medidas precontractuales a petición tuya) y con tu consentimiento. Las comunicaciones comerciales se basan únicamente en tu consentimiento, que puedes retirar cuando quieras.</p>
      <h2>Cuánto tiempo los conservamos</h2>
      <p>Mientras gestionamos tu solicitud y, después, el tiempo necesario para atender posibles responsabilidades legales. Si aceptaste recibir comunicaciones comerciales, hasta que retires tu consentimiento.</p>
      <h2>A quién se comunican</h2>
      <p>No cedemos tus datos a terceros, salvo obligación legal. El formulario de la web no guarda tus datos en una base de datos: nos los envía por correo electrónico. Nuestro proveedor de alojamiento y correo es Hostinger, que actúa como encargado del tratamiento.</p>
      <p>Si eliges escribirnos por WhatsApp, ese servicio lo presta Meta conforme a sus propias condiciones y política de privacidad.</p>
      <h2>Tus derechos</h2>
      <p>Puedes pedirnos acceder a tus datos, rectificarlos, suprimirlos, limitar u oponerte a su tratamiento y solicitar su portabilidad escribiendo a <a href="mailto:${N.email}">${N.email}</a>. Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>`,
  },
  cookies: {
    es: 'cookies',
    xx: 'cookies',
    titulo: 'Política de cookies',
    entrada: 'Esta web no usa cookies.',
    html: `      <h2>Qué usamos y qué no</h2>
      <p>Esta web no instala cookies propias ni de terceros, y no usa herramientas de analítica ni de publicidad. Las tipografías y las imágenes se sirven desde nuestro propio servidor.</p>
      <h2>Enlaces a otros servicios</h2>
      <p>Los enlaces a WhatsApp abren un servicio de Meta, que tiene su propia política de cookies y privacidad.</p>
      <h2>Cambios</h2>
      <p>Si en el futuro la web empieza a usar cookies, actualizaremos esta página y te pediremos tu consentimiento cuando sea necesario.</p>`,
  },
};
