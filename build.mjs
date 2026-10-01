// Genera el sitio estático en public/ (npm run generar)
//   src/contenido.mjs · src/legal.mjs   textos en español (la fuente)
//   src/plantillas.mjs                  HTML de cada página
//   src/site.css · src/site.js          estilos y comportamiento comunes
//   src/i18n/<codigo>.json              traducciones: { "texto en español": "traducción" }
//   src/i18n/_fuente.json               catálogo de textos traducibles (lo escribe este script)
// OJO: este script NO es el "build" de package.json a proposito. Hostinger ejecuta
// "npm run build" en cada despliegue y alli no estan ni este fichero ni src/, asi que
// "build" es un paso vacio que tiene que existir (si falta, el despliegue tambien falla).
import { readFileSync, writeFileSync, mkdirSync, rmSync, renameSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { PAGINAS, cuerpo } from './src/plantillas.mjs';
import { NEGOCIO, SERVICIOS, FAQ, GARANTIAS } from './src/contenido.mjs';
import { LEGAL } from './src/legal.mjs';

const root = process.cwd();
const pubFinal = join(root, 'public');
const pub = join(root, 'public.tmp');   // pasa a ser public/ al final, solo si no falta ninguna traducción
const SITE = 'https://www.luxormarbella.com';

// IndexNow (Bing, Yandex…): clave pública, el protocolo obliga a publicarla en public/<clave>.txt.
// Se genera una vez con:  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
// La usa tools/indexnow.mjs al desplegar. Si se cambia, el fichero viejo se poda solo del servidor.
const INDEXNOW_KEY = '258b60e5041911f063582427d77c4423';

// Verificación por etiqueta <meta> en la portada. Vacío = no sale. Mejor por DNS (Search Console:
// propiedad de dominio con registro TXT en Hostinger); esto es la alternativa si no hay acceso al DNS.
const VERIFICACION = {
  google: '',   // Search Console, propiedad "Prefijo de URL" https://www.luxormarbella.com/ -> Etiqueta HTML
  bing: '',     // Bing Webmaster Tools (innecesario si se importa el sitio desde Search Console)
  yandex: '',   // Yandex Webmaster (para la versión rusa)
};
const lee = (f) => readFileSync(join(root, f), 'utf8').replace(/\r\n/g, '\n');
const escribe = (f, txt) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, txt, 'utf8'); };
const escTexto = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escTexto(s).replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ idiomas */

// El español es la fuente y vive en la raíz; cada idioma con diccionario sale en /<codigo>/.
const IDIOMAS = [
  { code: 'es', nombre: 'Español', locale: 'es_ES' },
  { code: 'en', nombre: 'English', locale: 'en_GB' },
  { code: 'fr', nombre: 'Français', locale: 'fr_FR' },
  { code: 'de', nombre: 'Deutsch', locale: 'de_DE' },
  { code: 'sv', nombre: 'Svenska', locale: 'sv_SE' },
  { code: 'ru', nombre: 'Русский', locale: 'ru_RU' },
];
const dicc = {};
for (const l of IDIOMAS) {
  const f = `src/i18n/${l.code}.json`;
  if (l.code !== 'es' && existsSync(join(root, f))) dicc[l.code] = JSON.parse(lee(f));
}
const activos = IDIOMAS.filter((l) => l.code === 'es' || dicc[l.code]);
// x-default: quien no tiene su idioma entre los seis entiende mejor el inglés que el español
const PORDEFECTO = activos.find((l) => l.code === 'en') || IDIOMAS[0];

const ruta = (l, p) => {
  const tramo = l.code === 'es' ? p.es : p.xx;
  return '/' + (l.code === 'es' ? '' : l.code + '/') + (tramo ? tramo + '/' : '');
};
const pagina = (id) => {
  const p = PAGINAS.find((x) => x.id === id);
  if (!p) throw new Error(`Enlace a una página que no existe: ${id}`);
  return p;
};

/* ------------------------------------------------------------------ traducción */

// Textos que no se traducen: correos, direcciones web y nombres propios.
const FIJOS = new Set(['Luxor Marbella', 'Luxor', 'WhatsApp']);
const fijo = (s) => FIJOS.has(s) || /^[\w.+-]+@[\w.-]+\.\w+$/.test(s) || /^(?:www\.|https?:)/.test(s) || /^\{\{[^}]*\}\}$/.test(s);
const conLetras = (s) => /\p{L}/u.test(s);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Catálogo de textos traducibles, en orden de aparición, con el contexto donde salen.
const catalogo = new Map();
const faltan = {};

// Devuelve la función que traduce un texto al idioma l (y apunta lo que falta).
function traductor(l, idPagina) {
  return (texto, ctx = '') => {
    const clave = norm(texto);
    if (!clave || !conLetras(clave) || fijo(clave)) return texto;
    if (l.code === 'es') {
      if (!catalogo.has(clave)) catalogo.set(clave, new Set());
      catalogo.get(clave).add(`${idPagina} ${ctx}`.trim());
      return texto;
    }
    const tr = dicc[l.code][clave];
    if (tr === undefined) { (faltan[l.code] ??= new Set()).add(clave); return texto; }
    return tr;
  };
}

// Recorre los textos traducibles de un HTML: nodos de texto, atributos legibles y el bloque
// JSON de cadenas de site.js. No toca <style>, <script>, <svg> ni comentarios.
const OPACO = /(<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>|<!--[\s\S]*?-->)/;
function traducir(html, t) {
  return html.split(OPACO).map((parte, i) => {
    if (i % 2) {
      const m = parte.match(/^(<script type="application\/json" id="i18n">)([\s\S]*)(<\/script>)$/);
      if (!m) return parte;
      const o = JSON.parse(m[2]);
      for (const k of Object.keys(o)) o[k] = t(o[k], `texto de site.js (${k})`);
      return m[1] + JSON.stringify(o).replace(/</g, '\\u003c') + m[3];
    }
    return parte
      .replace(/\b(alt|aria-label|placeholder|title)="([^"]*)"/g, (todo, a, v) => `${a}="${escAttr(t(v, `atributo ${a}`))}"`)
      .replace(/>([^<>]+)</g, (todo, txt, pos, entero) => {
        const centro = txt.trim();
        if (!centro) return todo;
        const etiqueta = entero.slice(entero.lastIndexOf('<', pos), pos + 1);
        const tr = t(centro, etiqueta);
        return tr === centro ? todo : '>' + txt.replace(centro, () => escTexto(tr)) + '<';
      });
  }).join('');
}

/* ------------------------------------------------------------------ piezas por idioma */

function selector(l, p, t, tipo) {
  const rotulo = escAttr(t('Idioma', 'rótulo del selector de idioma'));   // antes del return: que entre siempre en el catálogo
  if (activos.length < 2) return '';
  const destino = (a) => ruta(a, p.oculta ? pagina('inicio') : p);
  // en el desplegable cada idioma lleva también su código (ES, EN…) a la derecha
  const enlaces = (conCodigo) => activos.map((a) => `<li><a href="${destino(a)}" lang="${a.code}" hreflang="${a.code}"${a === l ? ' aria-current="true"' : ''}>${a.nombre}${conCodigo ? `<span class="lang-cod" aria-hidden="true">${a.code.toUpperCase()}</span>` : ''}</a></li>`).join('');
  return tipo === 'desplegable'
    ? `<details class="lang"><summary aria-label="${rotulo}: ${l.nombre} (${l.code.toUpperCase()})"><span class="globo" aria-hidden="true"></span>${l.code.toUpperCase()}</summary><ul>${enlaces(true)}</ul></details>`
    : `<div class="langs-caja"><span class="langs-rotulo" aria-hidden="true"><span class="globo"></span>${rotulo}</span><ul class="langs" aria-label="${rotulo}">${enlaces(false)}</ul></div>`;
}

// Zonas de trabajo con su entidad de Wikidata (comprobadas el 2026-10-01 en wikidata.org).
// "en": dentro de qué municipio está, para que nadie confunda Nueva Andalucía o San Pedro con otros
// lugares del mismo nombre. Si se añade una zona en NEGOCIO.zonas hay que añadirla aquí o el build falla.
const MARBELLA = { '@id': `${SITE}/#zona-marbella` };   // el nodo completo de Marbella va en areaServed
const ZONAS_LD = {
  'Marbella': { tipo: 'City', wd: 'Q484799' },
  'Puerto Banús': { wd: 'Q2117451', en: MARBELLA },
  'Nueva Andalucía': { wd: 'Q3346072', en: MARBELLA },
  'San Pedro de Alcántara': { wd: 'Q992775', en: MARBELLA },
  'Benahavís': { tipo: 'City', wd: 'Q816672' },
  'Estepona': { tipo: 'City', wd: 'Q492748' },
  'Elviria': { wd: 'Q3051839', en: MARBELLA },
  'Las Chapas': { wd: 'Q5970327', en: MARBELLA },
  'Sotogrande': { wd: 'Q2223797' },
};
const lugar = (z) => {
  const d = ZONAS_LD[z];
  if (!d) throw new Error(`Falta la zona "${z}" en ZONAS_LD (build.mjs)`);
  const slug = z.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');
  return { '@type': d.tipo || 'Place', '@id': `${SITE}/#zona-${slug}`, name: z, sameAs: `https://www.wikidata.org/wiki/${d.wd}`, ...(d.en && { containedInPlace: d.en }) };
};

// Datos estructurados. Los @id son estables y comunes a todos los idiomas.
function jsonld(l, p, t) {
  const url = SITE + ruta(l, p);
  const N = NEGOCIO;
  const ID = { negocio: `${SITE}/#negocio`, web: `${SITE}/#web`, logo: `${SITE}/#logo` };
  const horario = N.horario && [{ '@type': 'OpeningHoursSpecification', ...N.horario }];
  const zonas = N.zonas.flatMap((z) => z.split(' y ')).map(lugar);   // "Elviria y Las Chapas" son dos lugares
  // Sin dirección postal pública no hay LocalBusiness (Google lo pide con "address"); con ella, el
  // subtipo más concreto que encaja con reformas y mantenimiento. No se pone "image" de fotos: son de banco.
  const negocio = {
    '@type': N.direccion ? 'HomeAndConstructionBusiness' : 'Organization',
    '@id': ID.negocio,
    name: N.nombre,
    ...(N.razonSocial && { legalName: N.razonSocial }),
    ...(N.nif && { vatID: N.nif }),
    ...(N.fundacion && { foundingDate: N.fundacion }),
    url: SITE + '/',
    description: t(FAQ[0].a),           // definición limpia de la empresa (sin el teléfono de la meta description)
    telephone: N.telefono,
    email: N.email,
    logo: { '@type': 'ImageObject', '@id': ID.logo, url: `${SITE}/assets/logo-master-color.png`, contentUrl: `${SITE}/assets/logo-master-color.png`, width: 620, height: 324, caption: N.nombre },
    image: { '@id': ID.logo },
    address: { '@type': 'PostalAddress', ...(N.direccion || { addressLocality: 'Marbella', addressRegion: 'Málaga', addressCountry: 'ES' }) },
    ...(N.geo && { geo: { '@type': 'GeoCoordinates', ...N.geo } }),
    ...(N.direccion && horario && { openingHoursSpecification: horario }),
    areaServed: zonas,
    knowsLanguage: N.idiomasAtencion,   // los idiomas en que se atiende de verdad, no los de la web
    contactPoint: {
      '@type': 'ContactPoint', telephone: N.telefono, email: N.email, contactType: 'customer service',
      availableLanguage: N.idiomasAtencion, ...(horario && { hoursAvailable: horario }),
    },
    ...(N.perfiles.length && { sameAs: N.perfiles }),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t('Servicios'),
      itemListElement: SERVICIOS.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE}/#servicio-${s.id}`, name: t(s.titulo), url: SITE + ruta(l, pagina(s.id)) } })),
    },
  };
  // migas visibles en la página (las mismas que pinta migas() en plantillas.mjs)
  const miga = p.servicio ? t(p.servicio.menu) : p.id === 'nosotros' ? t('Quiénes somos') : LEGAL[p.id] ? t(LEGAL[p.id].titulo) : null;
  const tipoPagina = { nosotros: 'AboutPage', presupuesto: 'ContactPage' }[p.id] || 'WebPage';
  const principal = p.servicio ? { '@id': `${SITE}/#servicio-${p.servicio.id}` } : (p.id === 'nosotros' || p.id === 'presupuesto') ? { '@id': ID.negocio } : null;
  const grafo = [
    negocio,
    { '@type': 'WebSite', '@id': ID.web, url: SITE + '/', name: N.nombre, alternateName: ['luxormarbella.com'], publisher: { '@id': ID.negocio }, inLanguage: activos.map((a) => a.code) },
    {
      '@type': tipoPagina, '@id': `${url}#pagina`, url, name: t(p.title), description: t(p.desc), inLanguage: l.code,
      isPartOf: { '@id': ID.web }, about: { '@id': ID.negocio },
      ...(principal && { mainEntity: principal }),
      ...(miga && { breadcrumb: { '@id': `${url}#migas` } }),
    },
  ];
  // Servicios: en cada página de servicio va el suyo completo; en la portada, los tres, para que
  // la entidad de la empresa y lo que hace queden juntos en la página que Google más mira.
  const servicio = (s, enSuPagina) => ({
    '@type': 'Service', '@id': `${SITE}/#servicio-${s.id}`, name: t(s.titulo), serviceType: t(s.menu),
    description: t(s.metaDesc), url: SITE + ruta(l, pagina(s.id)),
    provider: { '@id': ID.negocio }, areaServed: zonas.map((z) => ({ '@id': z['@id'] })),   // las zonas completas van en la empresa
    ...(enSuPagina && { hasOfferCatalog: {
      '@type': 'OfferCatalog', name: t(s.menu),
      itemListElement: s.incluye.map((i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t(i.n), description: t(i.d) } })),
    } }),
  });
  if (p.id === 'inicio') grafo.push(...SERVICIOS.map((s) => servicio(s, false)));
  if (p.servicio) grafo.push(servicio(p.servicio, true));
  // FAQPage: Google dejó de mostrarlo el 7-5-2026; se mantiene como marcado semántico (las preguntas son visibles).
  const faq = (lista) => ({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: lista.map((f) => ({ '@type': 'Question', name: t(f.q), acceptedAnswer: { '@type': 'Answer', text: t(f.a) } })) });
  if (p.id === 'inicio') grafo.push(faq(FAQ));
  if (p.servicio) grafo.push(faq(p.servicio.faq));
  if (miga) grafo.push({ '@type': 'BreadcrumbList', '@id': `${url}#migas`, itemListElement: [
    { '@type': 'ListItem', position: 1, name: t('Inicio'), item: SITE + ruta(l, pagina('inicio')) },
    { '@type': 'ListItem', position: 2, name: miga, item: url },
  ] });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }).replace(/</g, '\\u003c');
}

function cabeza(l, p, t, css, js) {
  const url = SITE + ruta(l, p);
  const titulo = escAttr(t(p.title));
  const desc = p.desc ? escAttr(t(p.desc)) : '';
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escTexto(t(p.title))}</title>`,
    desc && `<meta name="description" content="${desc}">`,
    ...(p.id === 'inicio' ? [
      VERIFICACION.google && `<meta name="google-site-verification" content="${escAttr(VERIFICACION.google)}">`,
      VERIFICACION.bing && `<meta name="msvalidate.01" content="${escAttr(VERIFICACION.bing)}">`,
      VERIFICACION.yandex && `<meta name="yandex-verification" content="${escAttr(VERIFICACION.yandex)}">`,
    ] : []),
    p.oculta ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`,
    ...(p.oculta ? [] : [
      ...activos.map((a) => `<link rel="alternate" hreflang="${a.code}" href="${SITE}${ruta(a, p)}">`),
      `<link rel="alternate" hreflang="x-default" href="${SITE}${ruta(PORDEFECTO, p)}">`,
    ]),
    '<meta name="theme-color" content="#FBF8F2">',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${NEGOCIO.nombre}">`,
    `<meta property="og:locale" content="${l.locale}">`,
    `<meta property="og:title" content="${titulo}">`,
    desc && `<meta property="og:description" content="${desc}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE}/photos/og.jpg">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Luxor Marbella">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="/assets/favicon-48.png" sizes="48x48" type="image/png">',
    '<link rel="icon" href="/assets/favicon-192.png" sizes="192x192" type="image/png">',
    '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">',
    '<link rel="preload" href="/assets/fonts/inter-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>',
    l.code === 'ru' && '<link rel="preload" href="/assets/fonts/inter-cyrillic-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>',
    `<link rel="stylesheet" href="${css}">`,
    // la clase "js" se pone antes de pintar para que no parpadee la versión sin JavaScript
    // modo JS desde el principio; si site.js no llega a terminar (red cortada, error), al cargar se vuelve al modo sin JS
    "<script>document.documentElement.classList.add('js');addEventListener('load',function(){if(!window.luxorListo)document.documentElement.classList.remove('js')})</script>",
    `<script src="${js}" defer></script>`,
    p.oculta ? '' : `<script type="application/ld+json">${jsonld(l, p, t)}</script>`,
  ].filter(Boolean).map((x) => '  ' + x).join('\n');
}

/* ------------------------------------------------------------------ generación */

rmSync(pub, { recursive: true, force: true });

// estilos y script con la huella del contenido en el nombre: se pueden cachear un año
const huella = (txt) => createHash('sha256').update(txt).digest('hex').slice(0, 10);
const cssTxt = lee('src/site.css');
const jsTxt = lee('src/site.js');
const css = `/assets/site.${huella(cssTxt)}.css`;
const js = `/assets/site.${huella(jsTxt)}.js`;
escribe(join(pub, css), cssTxt);
escribe(join(pub, js), jsTxt);

// Fotos con la huella del contenido en el nombre, como CSS y JS: la CDN de Hostinger las sirve con un año
// de caché y, si se cambia una foto conservando el nombre, navegadores y CDN seguirían enseñando la vieja.
const fotos = new Map();
const conHuella = (f) => {
  if (!fotos.has(f)) {
    const ext = f.slice(f.lastIndexOf('.'));
    fotos.set(f, `${f.slice(0, -ext.length)}.${huella(readFileSync(join(root, 'photos', f)))}${ext}`);
  }
  return fotos.get(f);
};
let paginasEscritas = 0;
for (const l of activos) {
  for (const p of PAGINAS) {
    const t = traductor(l, p.id);
    let html = traducir(cuerpo(p), t)
      .replace(/\{\{langs:(desplegable|lista)\}\}/g, (todo, tipo) => selector(l, p, t, tipo))
      .replace(/\{\{url:([\w-]+)\}\}/g, (todo, id) => ruta(l, pagina(id)));
    html = `<!doctype html>\n<html lang="${l.code}">\n<head>\n${cabeza(l, p, t, css, js)}\n</head>\n<body>\n${html}\n</body>\n</html>\n`;
    if (html.includes('{{')) throw new Error(`Quedan marcas sin resolver en ${p.id} (${l.code})`);
    html = html.replace(/\/photos\/([\w.-]+\.(?:jpe?g|png|webp|mp4|webm))/g, (todo, f) => `/photos/${conHuella(f)}`);
    escribe(join(pub, ruta(l, p), 'index.html'), html);
    paginasEscritas++;
  }
}

// ficheros estáticos
for (const f of ['logo-master-mask.png', 'logo-master-mask.webp', 'logo-master-color.png', 'favicon.svg', 'favicon-48.png', 'favicon-192.png', 'apple-touch-icon.png']) {
  mkdirSync(join(pub, 'assets'), { recursive: true });
  copyFileSync(join(root, 'assets', f), join(pub, 'assets', f));
}
mkdirSync(join(pub, 'assets/fonts'), { recursive: true });
for (const f of readdirSync(join(root, 'assets/fonts'))) {
  if (f.endsWith('.woff2')) copyFileSync(join(root, 'assets/fonts', f), join(pub, 'assets/fonts', f));
}
mkdirSync(join(pub, 'photos'), { recursive: true });
for (const [f, h] of fotos) copyFileSync(join(root, 'photos', f), join(pub, 'photos', h));

// favicon.ico en la raíz: los navegadores y Google lo piden ahí aunque haya <link rel="icon">
copyFileSync(join(root, 'assets', 'favicon-48.png'), join(pub, 'favicon.ico'));

// sitemap con las alternativas de idioma de cada página. Sin <lastmod>: una fecha que cambia
// en cada generación aunque el contenido no cambie hace que Google deje de fiarse de ella.
const visibles = PAGINAS.filter((p) => !p.oculta);
escribe(join(pub, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${activos.flatMap((l) => visibles.map((p) => `  <url>
    <loc>${SITE}${ruta(l, p)}</loc>
${activos.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${SITE}${ruta(a, p)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${ruta(PORDEFECTO, p)}"/>
  </url>`)).join('\n')}
</urlset>
`);
escribe(join(pub, 'robots.txt'), `# robots.txt de ${SITE}
# Sitio público: rastreo permitido a buscadores y a asistentes de IA.
# No añadir grupos por bot: un bot con grupo propio deja de leer el grupo *.

User-agent: *
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`);

// IndexNow: el fichero de la clave en la raíz (lo comprueban Bing y Yandex antes de aceptar avisos)
if (!/^[0-9a-f]{32}$/.test(INDEXNOW_KEY)) throw new Error('INDEXNOW_KEY tiene que ser de 32 caracteres hexadecimales');
escribe(join(pub, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

// llms.txt (formato de llmstxt.org): ficha en Markdown para asistentes de IA. Google no lo usa
// (lo dice su guía de IA, 15-6-2026) ni penaliza; ChatGPT, Claude, Perplexity y otros pueden leerlo.
// Se escribe en inglés con los nombres en español entre paréntesis, y sale de los mismos datos y del
// diccionario inglés que la web: si cambia un servicio, cambia aquí sin tocar nada.
{
  const en = (s) => dicc.en?.[norm(s)] ?? s;
  const lEn = activos.find((a) => a.code === 'en') || activos[0];
  const lEs = activos.find((a) => a.code === 'es');
  const url = (l, id) => SITE + ruta(l, pagina(id));
  const zonas = NEGOCIO.zonas.flatMap((z) => z.split(' y '));
  const lista = (xs) => xs.slice(0, -1).join(', ') + ' and ' + xs.at(-1);
  const N = NEGOCIO;
  escribe(join(pub, 'llms.txt'), [
    `# ${N.nombre}`,
    '',
    `> ${N.nombre} is a company in Marbella (Málaga, Spain) that manages holiday and long-term rentals, renovates and furnishes homes, and looks after their maintenance and cleaning, for owners who do not live on the Costa del Sol all year round. One team and a single point of contact for the whole property.`,
    '',
    `- Website: ${SITE}/ (Spanish, with versions in ${lista(activos.filter((a) => a.code !== 'es').map((a) => ({ en: 'English', fr: 'French', de: 'German', sv: 'Swedish', ru: 'Russian' })[a.code]))})`,
    `- Phone and WhatsApp: ${N.telefonoIntl}`,
    `- Email: ${N.email}`,
    `- Areas served: ${lista(zonas)}.`,
    ...GARANTIAS.map(([b, s]) => `- ${en(b)}: ${en(s)}`),
    '',
    '## Services',
    '',
    ...SERVICIOS.map((s) => `- [${en(s.titulo)}](${url(lEn, s.id)}) (es: [${s.h1}](${url(lEs, s.id)})): ${en(s.metaDesc)} Includes: ${s.incluye.map((i) => en(i.n)).join('; ')}.`),
    '',
    '## Company',
    '',
    `- [About ${N.nombre}](${url(lEn, 'nosotros')}) (es: ${url(lEs, 'nosotros')})`,
    `- [Request a quote](${url(lEn, 'presupuesto')}) (es: ${url(lEs, 'presupuesto')}): four-step form, WhatsApp or phone.`,
    '',
    '## Languages',
    '',
    ...activos.map((a) => `- [${a.nombre}](${SITE}${ruta(a, pagina('inicio'))})`),
    '',
    '## Optional',
    '',
    `- [Legal notice](${url(lEn, 'aviso-legal')})`,
    `- [Privacy policy](${url(lEn, 'privacidad')})`,
    `- [Sitemap](${SITE}/sitemap.xml)`,
    '',
  ].join('\n'));
}

// catálogo para traducir: un texto por entrada, con el sitio donde aparece
mkdirSync(join(root, 'src/i18n'), { recursive: true });
const fuente = [...catalogo].map(([texto, ctx], i) => ({ id: i + 1, texto, contexto: [...ctx].slice(0, 3).join(' | ') }));
escribe(join(root, 'src/i18n/_fuente.json'), JSON.stringify(fuente, null, 1) + '\n');

console.log(`public/  ${paginasEscritas} páginas (${PAGINAS.length} × ${activos.map((l) => l.code).join(', ')}) · ${fotos.size} fotos · ${fuente.length} textos traducibles`);
for (const l of activos) {
  if (faltan[l.code]?.size) {
    console.log(`  FALTAN ${faltan[l.code].size} traducciones en ${l.code} (salen en español):`);
    for (const s of [...faltan[l.code]].slice(0, 12)) console.log(`    · ${s.slice(0, 90)}`);
  }
}
// Una página medio en español marcada como hreflang="de" es peor que no tener la versión alemana.
// Se genera en public.tmp y solo pasa a public/ si están todas: así un diccionario incompleto
// nunca llega a public/ (que es lo que se sube) con páginas medio en español.
if (Object.values(faltan).some((s) => s.size)) {
  rmSync(pub, { recursive: true, force: true });
  console.error('Hay idiomas con traducciones incompletas: public/ no se ha tocado.');
  process.exitCode = 1;
} else {
  rmSync(pubFinal, { recursive: true, force: true });
  renameSync(pub, pubFinal);
}
