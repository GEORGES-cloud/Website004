// Genera los entregables a partir de src/page.html
//   index.html                -> web real, con <head> completo y assets enlazados
//   public/                   -> lo que sirve server.mjs en Hostinger (index.html + solo las imagenes que usa)
//   build/luxor-onefile.html  -> fichero unico con los logos incrustados (para publicar)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const root = process.cwd();
const src = readFileSync(join(root, 'src/page.html'), 'utf8');
const [head, body] = src.split('<!--HEAD-END-->');
if (body === undefined) throw new Error('Falta el marcador <!--HEAD-END--> en src/page.html');

const DESC = 'Luxor Marbella: mantenimiento, limpieza, reparaciones y gestion de alquiler vacacional para viviendas en Marbella y la Costa del Sol.';

const meta = [
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  `  <meta name="description" content="${DESC}">`,
  '  <meta name="theme-color" content="#1B3251">',
  '  <meta property="og:type" content="website">',
  '  <meta property="og:locale" content="es_ES">',
  '  <meta property="og:title" content="Luxor Marbella">',
  `  <meta property="og:description" content="${DESC}">`,
].join('\n');

const page = `<!doctype html>\n<html lang="es">\n<head>\n${meta}\n${head.trim()}\n</head>\n<body>\n${body.trim()}\n</body>\n</html>\n`;
writeFileSync(join(root, 'index.html'), page, 'utf8');

// public/: se rehace entero para que no queden imagenes que la pagina ya no usa
const pub = join(root, 'public');
for (const d of ['assets', 'photos']) rmSync(join(pub, d), { recursive: true, force: true });
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, 'index.html'), page, 'utf8');
const used = [...new Set(page.match(/(?:assets|photos)\/[\w.-]+\.(?:png|jpe?g|svg|webp)/g) || [])];
for (const f of used) {
  mkdirSync(dirname(join(pub, f)), { recursive: true });
  copyFileSync(join(root, f), join(pub, f));
}

let one = src.replace('<!--HEAD-END-->', '');
let inlined = 0;
for (const f of readdirSync(join(root, 'assets'))) {
  if (!f.endsWith('.png')) continue;
  const b64 = readFileSync(join(root, 'assets', f)).toString('base64');
  one = one.split(`assets/${f}`).join(`data:image/png;base64,${b64}`);
  inlined++;
}
// fotos finales (jpg) -> data URI
let photos = 0;
try {
  for (const f of readdirSync(join(root, 'photos'))) {
    if (!f.endsWith('.jpg')) continue;
    const b64 = readFileSync(join(root, 'photos', f)).toString('base64');
    one = one.split(`photos/${f}`).join(`data:image/jpeg;base64,${b64}`);
    photos++;
  }
} catch {}
mkdirSync(join(root, 'build'), { recursive: true });
writeFileSync(join(root, 'build/luxor-onefile.html'), one, 'utf8');

if (/(assets|photos)\//.test(one)) throw new Error('Quedan rutas sin incrustar en la version de fichero unico');
console.log(`index.html               ${(readFileSync(join(root,'index.html')).length/1024).toFixed(0)} KB`);
console.log(`public/                  index.html + ${used.length} imagenes`);
console.log(`build/luxor-onefile.html ${(one.length/1024).toFixed(0)} KB  (${inlined} png + ${photos} fotos incrustadas)`);
