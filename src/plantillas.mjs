// Plantillas del sitio. Devuelven HTML en español con marcas {{...}} que build.mjs resuelve
// por idioma:  {{url:ID}} enlace a una página · {{langs:desplegable}} / {{langs:lista}} selector de idioma.
// No hay textos de otras lenguas aquí: build.mjs traduce el HTML ya montado.
import { NEGOCIO as N, SERVICIOS, GARANTIAS, VENTAJAS, TICKER, FAQ, ZONAS_FRASE } from './contenido.mjs';
import { LEGAL } from './legal.mjs';

const WA = `https://wa.me/${N.whatsapp}`;
const TEL = `tel:${N.telefono}`;
const svc = (id) => SERVICIOS.find((s) => s.id === id);

// Textos que usa site.js. Van en un bloque JSON para que build.mjs pueda traducirlos.
const TEXTOS_JS = {
  menu_abrir: 'Abrir menú',
  menu_cerrar: 'Cerrar menú',
  paso: 'Paso {n} de {total}',
  q_servicio: 'Marca al menos una opción.',
  q_zona: 'Elige una zona.',
  faltan: 'Para poder llamarte nos faltan estos datos: {lista}.',
  f_nombre: 'nombre',
  f_tel: 'teléfono',
  consentimiento: 'Necesitamos tu consentimiento para poder contactarte.',
  tel_mal: 'Revisa el teléfono: parece incompleto.',
  mail_mal: 'Revisa el e-mail: parece incompleto.',
  enviando: 'Enviando…',
  error_antes: 'No hemos podido enviar el formulario.',
  error_wa: 'Envíanoslo por WhatsApp',
  error_despues: `o llámanos al ${N.telefonoIntl}.`,
  wa_saludo: 'Hola, quiero pedir presupuesto.',
  wa_serv: 'Servicio',
  wa_zona: 'Zona',
  wa_plazo: 'Plazo',
  wa_nombre: 'Nombre',
  wa_tel: 'Teléfono',
};

/* ------------------------------------------------------------------ piezas comunes */

const glifos = `<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <defs>
    <pattern id="gSand" width="150" height="150" patternUnits="userSpaceOnUse">
      <g fill="#E1B181">
        <path d="M28 16l3.2 6.4-.7 19.4h-5l-.7-19.4z"/>
        <ellipse cx="104" cy="44" rx="4.6" ry="6.2"/><circle cx="104" cy="36" r="2.3"/>
        <rect x="95" y="40" width="4" height="1.5"/><rect x="95" y="46" width="4" height="1.5"/>
        <rect x="109" y="40" width="4" height="1.5"/><rect x="109" y="46" width="4" height="1.5"/>
        <rect x="21" y="94" width="14" height="2.4"/><rect x="23.5" y="97" width="9" height="17"/><rect x="21" y="114" width="14" height="2.4"/>
      </g>
      <g fill="none" stroke="#E1B181" stroke-width="1.6">
        <path d="M96 100q3.5-2.8 7 0t7 0M96 106q3.5-2.8 7 0t7 0M96 112q3.5-2.8 7 0t7 0"/>
      </g>
    </pattern>
  </defs>
</svg>`;

const cabecera = `<header class="masthead">
  <div class="wrap">
    <a class="mh-logo" href="{{url:inicio}}" aria-label="Luxor Marbella, inicio">
      <span class="logo-mono" role="img" aria-label="Luxor Marbella"></span>
    </a>
    <nav class="mh-nav" aria-label="Secciones">
${SERVICIOS.map((s) => `      <a href="{{url:${s.id}}}">${s.corto}</a>`).join('\n')}
      <a href="{{url:nosotros}}">Quiénes somos</a>
    </nav>
    <div class="mh-right">
      <a class="mh-tel" href="${TEL}">${N.telefonoVisible}</a>
      {{langs:desplegable}}
      <a class="btn" href="{{url:presupuesto}}">Pedir presupuesto</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<nav class="menu" id="menu" aria-label="Menú principal" hidden>
  <div class="wrap">
    <ul class="menu-main">
${SERVICIOS.map((s) => `      <li><a href="{{url:${s.id}}}">${s.menu}</a></li>`).join('\n')}
      <li><a href="{{url:nosotros}}">Quiénes somos</a></li>
      <li><a href="{{url:presupuesto}}">Pedir presupuesto</a></li>
    </ul>
    <div class="menu-side">
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="${TEL}">${N.telefonoIntl}</a></li>
          <li><a href="${WA}">WhatsApp</a></li>
          <li><a href="mailto:${N.email}">${N.email}</a></li>
        </ul>
      </div>
      <div>
        <h4>Zonas</h4>
        <p>${ZONAS_FRASE}</p>
      </div>
      {{langs:lista}}
    </div>
  </div>
</nav>`;

const pie = `<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <div>
        <span class="logo-mono" role="img" aria-label="Luxor Marbella"></span>
        <p>Luxor Marbella es una empresa de Marbella (Málaga) dedicada a la gestión de alquileres, las reformas y el mantenimiento de viviendas en Marbella y la Costa del Sol.</p>
      </div>
      <div>
        <h4>Servicios</h4>
        <ul>
${SERVICIOS.map((s) => `          <li><a href="{{url:${s.id}}}">${s.menu}</a></li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h4>Luxor Marbella</h4>
        <ul>
          <li><a href="{{url:nosotros}}">Quiénes somos</a></li>
          <li><a href="{{url:presupuesto}}">Pedir presupuesto</a></li>
        </ul>
      </div>
      <div>
        <h4>Contacto</h4>
        <ul>
          <li><a href="${TEL}">${N.telefonoIntl}</a></li>
          <li><a href="${WA}">WhatsApp</a></li>
          <li><a href="mailto:${N.email}">${N.email}</a></li>
          <li>Lunes a viernes, 8:00 – 18:00</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="foot-base">
    <div class="wrap">
      <span>© 2026 Luxor Marbella</span>
      <span><a href="{{url:aviso-legal}}">Aviso legal</a> · <a href="{{url:privacidad}}">Política de privacidad</a> · <a href="{{url:cookies}}">Política de cookies</a></span>
      {{langs:lista}}
      <span class="foot-credits">Fotografía: Unsplash · Vídeo: Pexels</span>
    </div>
  </div>
</footer>`;

const cierre = (titulo = '¿Empezamos por tu casa?') => `<section class="closer">
  <svg class="glyphs" aria-hidden="true" style="opacity:.07"><rect width="100%" height="100%" fill="url(#gSand)"/></svg>
  <div class="wrap">
    <h2 class="d2">${titulo}</h2>
    <div class="closer-actions">
      <a class="btn" href="{{url:presupuesto}}">Solicitar presupuesto</a>
      <a class="lnk" href="${WA}">WhatsApp</a>
      <a class="lnk" href="${TEL}">${N.telefonoIntl}</a>
    </div>
  </div>
</section>`;

const migas = (...pasos) => `<ol class="crumbs">
${pasos.map(([texto, id]) => (id ? `        <li><a href="{{url:${id}}}">${texto}</a></li>` : `        <li aria-current="page">${texto}</li>`)).join('\n')}
      </ol>`;

const preguntas = (lista) => `<div class="faq">
${lista.map((f) => `      <details>
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`).join('\n')}
    </div>`;

const img = (foto, alt, extra = '') => `<img src="/photos/${foto}" alt="${alt}" loading="lazy" decoding="async"${extra}>`;

/* ------------------------------------------------------------------ portada */

const explorador = () => `<section class="grid-sec" id="servicios">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Servicios de Luxor Marbella</h2>
      <p>Gestión de alquileres, reformas y mantenimiento: tres líneas de trabajo para una misma vivienda en Marbella. Elige una y recorre los puntos de la foto para ver qué incluye.</p>
    </div>

    <div class="svcx" id="svcx">
      <div class="svc-nav" role="tablist" aria-label="Líneas de servicio">
${SERVICIOS.map((s, k) => `        <button class="svc-tab" type="button" role="tab" aria-controls="svc-${s.id}" aria-selected="${k === 0}"><img src="/photos/${s.foto}" alt="" loading="lazy" decoding="async">${s.corto}</button>`).join('\n')}
      </div>
${SERVICIOS.map((s, k) => `
      <article class="svc${k === 0 ? ' is-on' : ''}" id="svc-${s.id}">
        <div class="shot svc-photo">
          ${img(s.foto, s.alt, s.flip ? ' class="flip"' : '')}
${s.incluye.map((i) => `          <button class="dot${i.p[4] ? ' to-left' : ''}" type="button" tabindex="-1" aria-hidden="true" style="--x:${i.p[0]}%;--y:${i.p[1]}%;--mx:${i.p[2]}%;--my:${i.p[3]}%"><span>${i.n}</span></button>`).join('\n')}
        </div>
        <div class="svc-panel">
          <p class="svc-kicker">${s.kicker}</p>
          <h3 class="svc-title">${s.titulo}</h3>
          <p class="svc-desc">${s.resumen}</p>
          <ul class="svc-items">
${s.incluye.map((i) => `            <li><button class="it" type="button"><b>${i.n}</b><span>${i.t}</span></button></li>`).join('\n')}
          </ul>
          <p class="svc-note" aria-live="polite"></p>
          <div class="svc-actions">
            <a class="btn" href="{{url:${s.id}}}">Ver el servicio</a>
            <a class="lnk" href="{{url:presupuesto}}?s=${s.id}">Pedir presupuesto</a>
          </div>
        </div>
      </article>`).join('\n')}

    </div>
  </div>
</section>`;

const inicio = () => `<section class="hero" id="top">
  <div class="hero-bg" data-video="/photos/hero-dia.mp4" data-video-sm="/photos/hero-dia-v.mp4"><picture><source media="(orientation: portrait)" srcset="/photos/hero-dia-v.jpg" width="900" height="1600"><img src="/photos/hero-dia.jpg" alt="Salón luminoso con sofá blanco y mesa de madera a la luz del sol" width="2560" height="1440" fetchpriority="high" decoding="async"></picture></div>
  <div class="wrap">
    <h1><span class="kick">Luxor Marbella</span> Hacemos fácil tener casa en Marbella</h1>
    <div class="hero-row">
      <p>Luxor Marbella gestiona alquileres, hace reformas y mantiene viviendas en Marbella y la Costa del Sol. Un solo equipo y un solo interlocutor.</p>
      <div class="hero-actions">
        <a class="btn btn-claro" href="{{url:presupuesto}}">Pedir presupuesto</a>
        <a class="lnk" href="#servicios">Qué hacemos</a>
      </div>
    </div>
  </div>
</section>

<section class="pledges">
  <div class="wrap">
${GARANTIAS.map(([b, s]) => `    <div><b>${b}</b><span>${s}</span></div>`).join('\n')}
  </div>
</section>

${explorador()}

<section class="duo">
  <div class="wrap">
    <div class="duo-title">
      <h2 class="d1">Cuidamos tu casa en Marbella los 365 días</h2>
      <p>Para propietarios que no viven aquí todo el año: guardamos las llaves y dejamos la casa como si fueras a llegar mañana.</p>
      <a class="lnk" href="{{url:nosotros}}">Conoce Luxor Marbella</a>
    </div>
    <div class="shot slides">${img('hero-villa.jpg', 'Fachada de piedra clara con ventanales y balcones de forja', ' class="is-on"')}${img('hero-villa-2.jpg', 'Salón en tonos claros con sofá, mesa de centro y dos cuadros')}${img('hero-villa-3.jpg', 'Terraza con sillones de mimbre, pérgola con cortinas blancas y tumbonas')}</div>
    <div class="shot slides">${img('duo-oficio.jpg', 'Manos cortando una pieza de madera', ' class="is-on"')}${img('hero-equipo-3.jpg', 'Manos con espátula enluciendo una pared')}</div>
  </div>
</section>

<section class="reviews" id="como-trabajamos">
  <div class="wrap">
    <div class="rev-col">
      <p class="eyebrow">Cómo trabajamos</p>
      <h2>Una sola llamada para toda la casa</h2>
      <p>Puedes contratar un solo servicio o combinarlos. Si los combinas, coordinamos las visitas entre nosotros.</p>
    </div>
    <div class="ben-col">
${VENTAJAS.map(([h, p]) => `      <div class="ben">
        <h3 class="d3">${h}</h3>
        <p>${p}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Preguntas frecuentes</h2>
    </div>
    ${preguntas(FAQ)}
  </div>
</section>

<section class="quote-block">
  <div class="wrap">
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">
        ${[...TICKER, ...TICKER].map((t) => `<span>${t}</span>`).join('')}
      </div>
    </div>
  </div>
</section>

${cierre()}`;

/* ------------------------------------------------------------------ página de servicio */

const servicio = (id) => {
  const s = svc(id);
  const otros = SERVICIOS.filter((o) => o.id !== id);
  return `<section class="phead">
  <div class="wrap">
    <div class="phead-copy">
      ${migas(['Inicio', 'inicio'], [s.menu])}
      <p class="kicker">${s.kicker}</p>
      <h1>${s.h1}</h1>
      <p class="lead">${s.entrada}</p>
      <div class="phead-actions">
        <a class="btn" href="{{url:presupuesto}}?s=${s.id}">Pedir presupuesto</a>
        <a class="lnk" href="${WA}">WhatsApp</a>
      </div>
    </div>
    <div class="shot">${img(s.foto, s.alt, s.flip ? ' class="flip"' : '')}</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Qué incluye</h2>
      <p>${s.resumen}</p>
    </div>
    <ul class="incl">
${s.incluye.map((i) => `      <li>
        <h3>${i.n}</h3>
        <p>${i.d}</p>
      </li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="block tint">
  <div class="wrap">
    <div class="rows">
${s.secciones.map((x) => `      <div class="row">
        <h2 class="d3">${x.h}</h2>
        <div>${x.p.map((p) => `<p>${p}</p>`).join('')}</div>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Preguntas frecuentes</h2>
    </div>
    ${preguntas(s.faq)}
  </div>
</section>

<section class="block tint">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Otros servicios</h2>
      <p>Puedes contratar un solo servicio o combinarlos. Si los combinas, coordinamos las visitas entre nosotros.</p>
    </div>
    <div class="more">
${otros.map((o) => `      <a href="{{url:${o.id}}}"><span class="ph">${img(o.foto, '', o.flip ? ' class="flip"' : '')}</span><span><b>${o.titulo}</b><small>${o.kicker}</small></span></a>`).join('\n')}
    </div>
  </div>
</section>

${cierre()}`;
};

/* ------------------------------------------------------------------ nosotros */

const nosotros = () => `<section class="phead solo">
  <div class="wrap">
    <div class="phead-copy">
      ${migas(['Inicio', 'inicio'], ['Quiénes somos'])}
      <p class="kicker">Quiénes somos</p>
      <h1>Luxor Marbella</h1>
      <p class="lead">${FAQ[0].a}</p>
    </div>
  </div>
</section>

<section class="about">
  <div class="wrap">
    <div class="shot">${img('about-casa.jpg', 'Salón blanco minimalista con ventanal')}</div>
    <div class="about-copy">
      <h2 class="d2">La llave que no tienes que buscar</h2>
      <p>Cuidamos viviendas en Marbella y su entorno para propietarios que no viven aquí todo el año. Guardamos las llaves, entramos con aviso previo y dejamos la casa como si fueras a llegar mañana.</p>
      <p>Trabajamos en tres líneas —gestión de alquileres, reformas y mantenimiento— coordinadas desde una sola persona de contacto. Después de cada visita recibes un parte con lo que se ha hecho, el material empleado y lo que queda pendiente.</p>
      <div><a class="btn" href="{{url:presupuesto}}">Pedir presupuesto</a></div>
    </div>
  </div>
</section>

<section class="block tint">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Qué hacemos</h2>
      <p>Puedes contratar un solo servicio o combinarlos. Si los combinas, coordinamos las visitas entre nosotros.</p>
    </div>
    <div class="more three">
${SERVICIOS.map((o) => `      <a href="{{url:${o.id}}}"><span class="ph">${img(o.foto, '', o.flip ? ' class="flip"' : '')}</span><span><b>${o.titulo}</b><small>${o.kicker}</small></span></a>`).join('\n')}
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid-head">
      <h2 class="d2">Dónde trabajamos</h2>
      <p>${ZONAS_FRASE}</p>
    </div>
    <ul class="zones">
${N.zonas.map((z) => `      <li>${z}</li>`).join('\n')}
    </ul>
  </div>
</section>

${cierre()}`;

/* ------------------------------------------------------------------ presupuesto (cuestionario) */

const opcion = (tipo, nombre, valor, titulo, texto = '', clave = '') =>
  `<label class="opt"><input type="${tipo}" name="${nombre}" value="${valor}"${clave ? ` data-k="${clave}"` : ''}><span><b>${titulo}</b>${texto ? `<small>${texto}</small>` : ''}</span></label>`;

const presupuesto = () => `<section class="quiz-sec">
  <div class="wrap">
    <div class="quiz-head">
      <h1>Pide tu presupuesto</h1>
      <p>Cuatro preguntas y te llamamos para concretar la visita de valoración. Si lo prefieres, escríbenos directamente por WhatsApp.</p>
    </div>

    <form class="quiz" id="quiz" novalidate>
      <div class="quiz-bar"><span id="quiz-count"></span><div class="quiz-track"><i id="quiz-fill"></i></div></div>

      <fieldset>
        <legend tabindex="-1">¿Qué necesitas?</legend>
        <p class="hint">Puedes marcar más de una opción.</p>
        <div class="opts">
          ${opcion('checkbox', 'servicio', 'Gestión de alquileres', 'Alquilar mi vivienda', 'Vacacional o de larga temporada, gestionado de principio a fin.', 'alquileres')}
          ${opcion('checkbox', 'servicio', 'Reformas y home staging', 'Reformar o amueblar', 'Reformas grandes o pequeñas, amueblado y home staging.', 'reformas')}
          ${opcion('checkbox', 'servicio', 'Mantenimiento y limpieza', 'Mantenimiento y limpieza', 'Averías, limpieza, llaves y todo lo que necesita la casa.', 'mantenimiento')}
          ${opcion('checkbox', 'servicio', 'Otra cosa', 'Otra cosa', 'Nos lo cuentas más adelante.')}
        </div>
      </fieldset>

      <fieldset>
        <legend tabindex="-1">¿Dónde está la vivienda?</legend>
        <p class="hint">Elige la zona más cercana.</p>
        <div class="opts cols3">
          ${N.zonas.map((z) => opcion('radio', 'zona', z, z)).join('\n          ')}
          ${opcion('radio', 'zona', 'Otra zona', 'Otra zona')}
        </div>
      </fieldset>

      <fieldset>
        <legend tabindex="-1">¿Para cuándo lo necesitas?</legend>
        <p class="hint">Así sabemos con qué prisa llamarte.</p>
        <div class="opts">
          ${opcion('radio', 'plazo', 'Cuanto antes', 'Cuanto antes')}
          ${opcion('radio', 'plazo', 'Este mes', 'Este mes')}
          ${opcion('radio', 'plazo', 'En los próximos meses', 'En los próximos meses')}
          ${opcion('radio', 'plazo', 'Solo me estoy informando', 'Solo me estoy informando')}
        </div>
        <div class="fields">
          <label class="full"><span class="lbl">Algo que debamos saber (opcional)</span><textarea id="q-mensaje" rows="3" maxlength="1200" placeholder="Por ejemplo: villa de cuatro dormitorios, vacía desde junio."></textarea></label>
        </div>
      </fieldset>

      <fieldset>
        <legend tabindex="-1">¿Cómo te localizamos?</legend>
        <p class="hint">Te llamamos al teléfono que nos dejes.</p>
        <div class="fields">
          <label><span class="lbl">Tu nombre</span><input id="q-nombre" type="text" placeholder="Nombre y apellidos" autocomplete="name" required></label>
          <label><span class="lbl">Teléfono</span><input id="q-tel" type="tel" inputmode="tel" placeholder="600 00 00 00" autocomplete="tel" required></label>
          <label class="full"><span class="lbl">E-mail (opcional)</span><input id="q-mail" type="email" placeholder="tu@correo.com" autocomplete="email"></label>
        </div>
        <!-- trampa para bots: las personas no ven ni rellenan este campo -->
        <div class="qf-hp" aria-hidden="true"><label>No rellenar <input id="q-web" type="text" tabindex="-1" autocomplete="off"></label></div>
        <div class="consents">
          <label><input type="checkbox" id="q-ok" required><span>He leído y acepto la <a href="{{url:privacidad}}">política de privacidad</a> y que Luxor Marbella me contacte para responder a mi solicitud de presupuesto.</span></label>
          <label><input type="checkbox" id="q-ok2"><span>Doy mi consentimiento para recibir comunicaciones comerciales de Luxor Marbella. (Opcional)</span></label>
        </div>
      </fieldset>

      <p class="quiz-error" id="quiz-error" role="alert" hidden></p>
      <div class="quiz-nav">
        <button class="btn btn-borde btn-atras" type="button" id="quiz-back" hidden>Atrás</button>
        <span></span>
        <button class="btn" type="button" id="quiz-next">Siguiente</button>
        <button class="btn" type="submit" id="quiz-send">Enviar solicitud</button>
      </div>
      <noscript><p class="quiz-error">Para enviar el formulario hace falta JavaScript. Escríbenos por WhatsApp o llámanos al ${N.telefonoIntl}.</p></noscript>
    </form>

    <div class="quiz-done" id="quiz-done" hidden tabindex="-1">
      <h2 class="d3">Recibido, <span id="done-name">gracias</span>.</h2>
      <p>Te llamamos al teléfono que nos has dejado para concretar la visita y darte un precio cerrado.</p>
    </div>

    <p class="quiz-wa"><span>¿Prefieres escribirnos?</span> <a class="btn btn-borde" id="quiz-wa" href="${WA}" target="_blank" rel="noopener">Enviar por WhatsApp</a> <a class="lnk" href="${TEL}">Llamar al ${N.telefonoIntl}</a></p>
  </div>
</section>`;

/* ------------------------------------------------------------------ legales y 404 */

const legal = (id) => {
  const l = LEGAL[id];
  return `<section class="phead solo">
  <div class="wrap">
    <div class="phead-copy">
      ${migas(['Inicio', 'inicio'], [l.titulo])}
      <h1>${l.titulo}</h1>
      <p class="lead">${l.entrada}</p>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="prose">
${l.html}
    </div>
  </div>
</section>`;
};

const noEncontrada = () => `<section class="nf">
  <div class="wrap">
    <p class="kicker">Error 404</p>
    <h1 class="d2">No encontramos esa página</h1>
    <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
    <div class="closer-actions">
      <a class="btn" href="{{url:inicio}}">Ir al inicio</a>
      <a class="lnk" href="{{url:presupuesto}}">Pedir presupuesto</a>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ páginas */

const DESC = 'Luxor Marbella gestiona alquileres, reforma y mantiene viviendas en Marbella para propietarios que no viven aquí todo el año. Tel. +34 603 60 55 43.';

// id · ruta en español · ruta en el resto de idiomas · título y descripción · cuerpo
export const PAGINAS = [
  { id: 'inicio', es: '', xx: '', title: 'Luxor Marbella | Gestión de alquileres, reformas y mantenimiento', desc: DESC, cuerpo: inicio },
  ...SERVICIOS.map((s) => ({
    id: s.id,
    es: { alquileres: 'servicios/gestion-alquileres', reformas: 'servicios/reformas-home-staging', mantenimiento: 'servicios/mantenimiento-limpieza' }[s.id],
    xx: { alquileres: 'services/property-management', reformas: 'services/renovation-home-staging', mantenimiento: 'services/maintenance-cleaning' }[s.id],
    title: s.metaTitle, desc: s.metaDesc, cuerpo: () => servicio(s.id), servicio: s,
  })),
  { id: 'presupuesto', es: 'presupuesto', xx: 'quote', title: 'Pedir presupuesto | Luxor Marbella', desc: 'Pide presupuesto a Luxor Marbella en cuatro pasos o escríbenos por WhatsApp. Gestión de alquileres, reformas y mantenimiento de viviendas en Marbella.', cuerpo: presupuesto },
  { id: 'nosotros', es: 'nosotros', xx: 'about', title: 'Quiénes somos | Luxor Marbella', desc: 'Conoce Luxor Marbella: cuidamos viviendas en Marbella y su entorno para propietarios que no viven aquí todo el año, con una sola persona de contacto.', cuerpo: nosotros },
  ...Object.keys(LEGAL).map((id) => ({ id, es: LEGAL[id].es, xx: LEGAL[id].xx, title: `${LEGAL[id].titulo} | Luxor Marbella`, desc: LEGAL[id].entrada, cuerpo: () => legal(id) })),
  { id: '404', es: '404', xx: '404', title: 'Página no encontrada | Luxor Marbella', desc: '', cuerpo: noEncontrada, oculta: true },
];

// Todo lo que va dentro de <body>
export const cuerpo = (pagina) => `${glifos}

${cabecera}

<main>
${pagina.cuerpo()}
</main>

${pie}

<script type="application/json" id="i18n">${JSON.stringify(TEXTOS_JS)}</script>`;
