// Genera el sitio estático en public/ (npm run generar)
//   src/contenido.mjs · src/legal.mjs   textos en español (la fuente)
//   src/plantillas.mjs                  HTML de cada página
//   src/site.css · src/site.js          estilos y comportamiento comunes
//   src/i18n/<codigo>.json              traducciones: { "texto en español": "traducción" }
//   src/i18n/_fuente.json               catálogo de textos traducibles (lo escribe este script)
// OJO: este script NO es el "build" de package.json a proposito. Hostinger ejecuta
// "npm run build" en cada despliegue y alli no estan ni este fichero ni src/, asi que
// "build" es un paso vacio que tiene que existir (si falta, el despliegue tambien falla).
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { PAGINAS, cuerpo } from './src/plantillas.mjs';
import { NEGOCIO, SERVICIOS, FAQ } from './src/contenido.mjs';

const root = process.cwd();
const pub = join(root, 'public');
const SITE = 'https://www.luxormarbella.com';
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
  const enlaces = activos.map((a) => `<li><a href="${destino(a)}" lang="${a.code}" hreflang="${a.code}"${a === l ? ' aria-current="true"' : ''}>${a.nombre}</a></li>`).join('');
  return tipo === 'desplegable'
    ? `<details class="lang"><summary class="pill" aria-label="${rotulo}">${l.code.toUpperCase()}</summary><ul>${enlaces}</ul></details>`
    : `<ul class="langs" aria-label="${rotulo}">${enlaces}</ul>`;
}

// Datos estructurados. Los @id son estables y comunes a todos los idiomas.
function jsonld(l, p, t) {
  const url = SITE + ruta(l, p);
  const N = NEGOCIO;
  const horario = N.horario && [{ '@type': 'OpeningHoursSpecification', ...N.horario }];
  // Sin dirección postal Google no admite LocalBusiness: hasta que el cliente la dé, Organization
  // con la localidad. No se pone "image": las fotos del sitio son de banco, no del negocio.
  const negocio = {
    '@type': N.direccion ? 'LocalBusiness' : 'Organization',
    '@id': `${SITE}/#negocio`,
    name: N.nombre,
    ...(N.razonSocial && { legalName: N.razonSocial }),
    ...(N.nif && { vatID: N.nif }),
    ...(N.fundacion && { foundingDate: N.fundacion }),
    url: SITE + '/',
    description: t(pagina('inicio').desc),
    telephone: N.telefono,
    email: N.email,
    logo: `${SITE}/assets/logo-master-color.png`,
    address: { '@type': 'PostalAddress', ...(N.direccion || { addressLocality: 'Marbella', addressRegion: 'Málaga', addressCountry: 'ES' }) },
    ...(N.geo && { geo: { '@type': 'GeoCoordinates', ...N.geo } }),
    ...(N.direccion && horario && { openingHoursSpecification: horario }),
    // "Elviria y Las Chapas" son dos lugares
    areaServed: N.zonas.flatMap((z) => z.split(' y ')).map((z) => ({ '@type': z === 'Marbella' ? 'City' : 'Place', name: z })),
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
  const grafo = [
    negocio,
    { '@type': 'WebSite', '@id': `${SITE}/#web`, url: SITE + '/', name: N.nombre, alternateName: 'luxormarbella.com', publisher: { '@id': negocio['@id'] }, inLanguage: activos.map((a) => a.code) },
    { '@type': 'WebPage', '@id': `${url}#pagina`, url, name: t(p.title), description: t(p.desc), inLanguage: l.code, isPartOf: { '@id': `${SITE}/#web` }, about: { '@id': negocio['@id'] } },
  ];
  const faq = (lista) => ({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: lista.map((f) => ({ '@type': 'Question', name: t(f.q), acceptedAnswer: { '@type': 'Answer', text: t(f.a) } })) });
  if (p.id === 'inicio') grafo.push(faq(FAQ));
  if (p.servicio) {
    const s = p.servicio;
    grafo.push({
      '@type': 'Service', '@id': `${SITE}/#servicio-${s.id}`, name: t(s.titulo), description: t(s.metaDesc), url,
      provider: { '@id': negocio['@id'] }, areaServed: negocio.areaServed, serviceType: t(s.menu),
    });
    grafo.push(faq(s.faq));
    grafo.push({ '@type': 'BreadcrumbList', '@id': `${url}#migas`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('Inicio'), item: SITE + ruta(l, pagina('inicio')) },
      { '@type': 'ListItem', position: 2, name: t(s.menu), item: url },
    ] });
  }
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
    p.oculta ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`,
    ...(p.oculta ? [] : [
      ...activos.map((a) => `<link rel="alternate" hreflang="${a.code}" href="${SITE}${ruta(a, p)}">`),
      `<link rel="alternate" hreflang="x-default" href="${SITE}${ruta(PORDEFECTO, p)}">`,
    ]),
    '<meta name="theme-color" content="#2A251E">',
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
    '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">',
    '<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>',
    `<link rel="stylesheet" href="${css}">`,
    // la clase "js" se pone antes de pintar para que no parpadee la versión sin JavaScript
    "<script>document.documentElement.classList.add('js')</script>",
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

const fotos = new Set(['og.jpg']);
let paginasEscritas = 0;
for (const l of activos) {
  for (const p of PAGINAS) {
    const t = traductor(l, p.id);
    let html = traducir(cuerpo(p), t)
      .replace(/\{\{langs:(desplegable|lista)\}\}/g, (todo, tipo) => selector(l, p, t, tipo))
      .replace(/\{\{url:([\w-]+)\}\}/g, (todo, id) => ruta(l, pagina(id)));
    html = `<!doctype html>\n<html lang="${l.code}">\n<head>\n${cabeza(l, p, t, css, js)}\n</head>\n<body>\n${html}\n</body>\n</html>\n`;
    if (html.includes('{{')) throw new Error(`Quedan marcas sin resolver en ${p.id} (${l.code})`);
    for (const m of html.matchAll(/\/photos\/([\w.-]+\.(?:jpe?g|png|webp))/g)) fotos.add(m[1]);
    escribe(join(pub, ruta(l, p), 'index.html'), html);
    paginasEscritas++;
  }
}

// ficheros estáticos
for (const f of ['logo-master-mask.png', 'logo-master-color.png', 'favicon.svg', 'favicon-48.png', 'apple-touch-icon.png']) {
  mkdirSync(join(pub, 'assets'), { recursive: true });
  copyFileSync(join(root, 'assets', f), join(pub, 'assets', f));
}
mkdirSync(join(pub, 'assets/fonts'), { recursive: true });
for (const f of readdirSync(join(root, 'assets/fonts'))) {
  if (f.endsWith('.woff2')) copyFileSync(join(root, 'assets/fonts', f), join(pub, 'assets/fonts', f));
}
mkdirSync(join(pub, 'photos'), { recursive: true });
for (const f of fotos) copyFileSync(join(root, 'photos', f), join(pub, 'photos', f));

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
if (Object.values(faltan).some((s) => s.size)) {
  console.error('Hay idiomas con traducciones incompletas: no desplegar hasta completarlas.');
  process.exitCode = 1;
}
