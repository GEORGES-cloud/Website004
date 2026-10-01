// Traducciones del sitio.
//   node tools/i18n.mjs preparar             congela el catálogo actual en src/i18n/_traducir.json
//   node tools/i18n.mjs comprobar <idioma>   valida src/i18n/<idioma>.ids.json contra ese catálogo
//   node tools/i18n.mjs unir <idioma>        valida y escribe src/i18n/<idioma>.json (lo que lee build.mjs)
//
// "npm run generar" escribe src/i18n/_fuente.json: un texto por entrada con su id. Como los ids
// se renumeran cada vez que cambia un texto español, quien traduce trabaja sobre la copia congelada
// (_traducir.json) y entrega <idioma>.ids.json = { "1": "traducción", ... }. Al unir, el diccionario
// final queda indexado por el texto español, que es lo que build.mjs busca; si luego cambia un
// texto español, build.mjs avisa de que falta su traducción.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [accion, idioma] = process.argv.slice(2);
const CATALOGO = 'src/i18n/_traducir.json';
if (accion === 'preparar') {
  // Ids estables: un texto que ya estaba en el catálogo conserva su id y los nuevos reciben ids a partir
  // del mayor, así un <idioma>.ids.json entregado sobre un catálogo anterior sigue bien emparejado.
  const nuevo = JSON.parse(readFileSync('src/i18n/_fuente.json', 'utf8'));
  const viejo = existsSync(CATALOGO) ? JSON.parse(readFileSync(CATALOGO, 'utf8')) : [];
  const idDe = new Map(viejo.map((e) => [e.texto, e.id]));
  let sig = Math.max(0, ...viejo.map((e) => e.id));
  for (const e of nuevo) e.id = idDe.get(e.texto) ?? ++sig;
  writeFileSync(CATALOGO, JSON.stringify(nuevo, null, 1) + '\n', 'utf8');
  console.log(`${CATALOGO}: ${nuevo.length} textos (${nuevo.filter((e) => !idDe.has(e.texto)).length} nuevos)`);
  process.exit(0);
}
if (!['comprobar', 'unir'].includes(accion) || !/^[a-z]{2}$/.test(idioma || '')) {
  console.error('Uso: node tools/i18n.mjs preparar | comprobar <idioma> | unir <idioma>');
  process.exit(2);
}
const lee = (f) => JSON.parse(readFileSync(f, 'utf8'));
const fuente = lee(CATALOGO);
const fIds = `src/i18n/${idioma}.ids.json`;
if (!existsSync(fIds)) { console.error(`No existe ${fIds}`); process.exit(2); }
const ids = lee(fIds);

// Largo máximo (en caracteres) de los textos que van en botones, pestañas y títulos.
const LIMITE = [
  [/^(Alquileres|Reformas|Mantenimiento)$/, 14, 'pestaña del explorador'],
  [/^¡Llámanos! 603/, 24, 'botón de la cabecera'],
  [/^(Solicitar presupuesto|Pedir presupuesto|Ver el servicio|Enviar solicitud|Enviar por WhatsApp|Conoce Luxor Marbella)$/, 26, 'botón'],
  [/^Hacemos fácil tener casa/, 48, 'titular de la portada'],
  [/\| Luxor Marbella$|^Luxor Marbella \|/, 65, 'título de página'],
];

const problemas = [];
const marcas = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join(',');
for (const e of fuente) {
  const t = ids[String(e.id)];
  const donde = `#${e.id} «${e.texto.slice(0, 50)}»`;
  if (typeof t !== 'string' || !t.trim()) { problemas.push(`${donde}: falta la traducción`); continue; }
  if (/[<>]/.test(t)) problemas.push(`${donde}: lleva < o > (los textos no llevan etiquetas HTML)`);
  if (/&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/.test(t)) problemas.push(`${donde}: lleva una entidad HTML (&…;); escribe el carácter directamente (p. ej. el espacio duro U+00A0)`);
  if (marcas(t) !== marcas(e.texto)) problemas.push(`${donde}: no conserva las marcas ${marcas(e.texto) || '(ninguna)'}`);
  if (e.texto.includes('603 60 55 43') && !t.includes('603 60 55 43')) problemas.push(`${donde}: falta el teléfono 603 60 55 43`);
  if (e.texto.includes('+34') && !t.includes('+34')) problemas.push(`${donde}: falta el prefijo +34`);
  if (/Luxor Marbella/.test(e.texto) && !/Luxor Marbella/.test(t)) problemas.push(`${donde}: falta la marca "Luxor Marbella" tal cual`);
  if (t !== t.trim()) problemas.push(`${donde}: sobran espacios al principio o al final`);
  for (const [re, max, que] of LIMITE) {
    if (re.test(e.texto) && [...t].length > max) problemas.push(`${donde}: ${[...t].length} caracteres, máximo ${max} (${que})`);
  }
  // las descripciones de página (las que acaban en teléfono o describen el servicio) no deben pasar de 160
  if (/^(inicio|alquileres|reformas|mantenimiento|presupuesto|nosotros)$/.test(e.contexto.split(' | ')[0]) && e.texto.length > 100 && [...t].length > 165) {
    problemas.push(`${donde}: ${[...t].length} caracteres, máximo 165 (descripción de página)`);
  }
}
const sobran = Object.keys(ids).filter((k) => !fuente.some((e) => String(e.id) === k));
if (sobran.length) problemas.push(`ids que no están en el catálogo: ${sobran.slice(0, 10).join(', ')}`);

if (problemas.length) {
  console.error(`${idioma}: ${problemas.length} problemas`);
  for (const p of problemas.slice(0, 60)) console.error('  · ' + p);
  process.exit(1);
}
console.log(`${idioma}: ${fuente.length} textos correctos`);

if (accion === 'unir') {
  const dicc = {};
  for (const e of fuente) dicc[e.texto] = ids[String(e.id)];
  writeFileSync(`src/i18n/${idioma}.json`, JSON.stringify(dicc, null, 1) + '\n', 'utf8');
  console.log(`escrito src/i18n/${idioma}.json`);
}
