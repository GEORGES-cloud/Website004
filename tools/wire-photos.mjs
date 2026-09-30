// Sustituye los huecos de foto de src/page.html por las fotos finales:
//   - cada <div class="shot ..."> con data-slot pasa a contener solo un <img>
//   - se eliminan los svg de glifos y las etiquetas "FOTO · ..." de los huecos
//   - anade la linea de creditos al pie (Unsplash no la exige; es buena practica)
// Idempotente: se puede ejecutar tantas veces como haga falta.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const p = 'src/page.html';
let s = readFileSync(p, 'utf8');

const ALT = {
  'hero-villa':    'Villa cuidada en Marbella',
  'hero-equipo':   'Equipo de Luxor trabajando en una vivienda',
  'about-casa':    'Interior de vivienda lista y recogida',
  'mantenimiento': 'Mantenimiento de vivienda',
  'limpieza':      'Limpieza de vivienda',
  'reparaciones':  'Reparaciones y handyman',
  'alquiler':      'Dormitorio listo para el check-in',
  'piscina':       'Piscina y exteriores de villa',
  'reformas':      'Bano reformado',
  'detalle-obra':  'Detalle de oficio: manos trabajando',
};

// Orden de aparicion de los huecos en el HTML (coincide con la estructura de la pagina)
const ORDER = ['hero-villa','hero-equipo','about-casa','mantenimiento','limpieza','reparaciones','alquiler','piscina','reformas','detalle-obra'];

let i = 0, wired = 0, skipped = 0;
s = s.replace(/<div class="shot([^"]*)">([\s\S]*?)<\/div>(?=\s*(?:<div class="card-foot"|<div class="about-copy"|<div class="detail-list"|<div class="shot|<div class="hero-title"))/g,
  (m, cls, inner) => {
    const slot = ORDER[i++];
    if (!slot) return m;
    if (/\bslides\b/.test(cls)) return m;          // pases de fotos del hero: se gestionan a mano
    const file = `photos/${slot}.jpg`;
    if (!existsSync(file)) { skipped++; return m; }
    wired++;
    return `<div class="shot" data-slot="${slot}"><img src="${file}" alt="${ALT[slot]}" loading="${i <= 2 ? 'eager' : 'lazy'}"></div>`;
  });

// creditos al pie (una sola vez)
if (!s.includes('foot-credits')) {
  s = s.replace(
    '<span class="social">',
    '<span class="foot-credits">Fotografia: Unsplash</span>\n      <span class="social">'
  );
  s = s.replace('.social{display:flex;gap:1rem}', '.social{display:flex;gap:1rem}\n.foot-credits{opacity:.75}');
}

writeFileSync(p, s, 'utf8');
console.log(`huecos cableados: ${wired} · sin foto todavia: ${skipped} · huecos vistos: ${i}`);
if (i !== ORDER.length) console.warn(`AVISO: se esperaban ${ORDER.length} huecos y se han visto ${i}`);
