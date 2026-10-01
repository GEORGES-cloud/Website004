// tools/indexnow.mjs
// Avisa por IndexNow (Bing, Yandex, Seznam, Naver, Yep…) de las páginas que han cambiado en el último
// despliegue. Google NO usa IndexNow: para Google cuentan el sitemap y Search Console.
// Lo lanza .github/workflows/deploy.yml después de subir por FTP. Nunca hace fallar el despliegue.
//
//   node tools/indexnow.mjs            URL de public/**/index.html cambiadas entre $BEFORE y HEAD
//   node tools/indexnow.mjs --todas    todas las URL del sitemap (primera vez, o a mano)
//   DRY=1 node tools/indexnow.mjs      enseña lo que mandaría, sin mandarlo
//
// La clave la escribe build.mjs en public/<clave>.txt (32 caracteres hex): aquí solo se busca.
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SITE = 'https://www.luxormarbella.com';
const HOST = new URL(SITE).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';   // lo reparte a todos los buscadores adheridos
const aviso = (m) => { console.log(`::warning::IndexNow: ${m}`); process.exit(0); };

const claveTxt = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!claveTxt) aviso('no hay public/<clave>.txt (¿build.mjs sin la clave?). No se envía nada.');
const KEY = claveTxt.slice(0, -4);
const keyLocation = `${SITE}/${claveTxt}`;

// URL publicadas = las del sitemap (las páginas con noindex, como la 404, no están)
const delSitemap = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const aUrl = (f) => SITE + '/' + f.replace(/^public\//, '').replace(/index\.html$/, '');

function cambiadas() {
  const before = process.env.BEFORE || '';
  if (!/^[0-9a-f]{40}$/.test(before) || /^0+$/.test(before)) return null;   // workflow_dispatch o rama nueva
  try {
    // con fetch-depth: 2 el commit anterior puede no estar si el push trae varios: se pide
    try { execFileSync('git', ['cat-file', '-e', `${before}^{commit}`], { stdio: 'ignore' }); }
    catch { execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', before], { stdio: 'ignore' }); }
    const out = execFileSync('git', ['diff', '--name-status', '--no-renames', before, 'HEAD', '--', 'public'], { encoding: 'utf8' });
    const urls = new Set();
    for (const linea of out.split('\n').filter(Boolean)) {
      const [estado, f] = linea.split('\t');
      if (!f.endsWith('/index.html') && f !== 'public/index.html') continue;
      const u = aUrl(f);
      // cambiadas o nuevas: solo si están en el sitemap · borradas: también, para que vean el 404
      if (estado === 'D' || delSitemap.includes(u)) urls.add(u);
    }
    return [...urls];
  } catch (e) {
    console.log(`No se pudo calcular el diff (${String(e.message).split('\n')[0]}): se envía el sitemap entero`);
    return null;
  }
}

const urlList = process.argv.includes('--todas') ? delSitemap : (cambiadas() ?? delSitemap);
if (!urlList.length) { console.log('IndexNow: ninguna página cambiada; no se envía nada.'); process.exit(0); }
console.log(`IndexNow: ${urlList.length} URL\n  ${urlList.join('\n  ')}`);
if (process.env.DRY) process.exit(0);

// La app se reinicia tras el FTP: esperar a que la clave esté publicada (si no, la respuesta es 403)
let publicada = false;
for (let i = 0; i < 12 && !publicada; i++) {
  try {
    const r = await fetch(`${keyLocation}?t=${Date.now()}`, { cache: 'no-store' });
    publicada = r.ok && (await r.text()).trim() === KEY;
  } catch { /* reintenta */ }
  if (!publicada) await new Promise((r) => setTimeout(r, 5000));
}
if (!publicada) aviso(`${keyLocation} no responde con la clave tras 60 s. No se envía nada.`);

const r = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList }),
});
// 200 aceptado · 202 aceptado, clave pendiente de validar · 400 formato · 403 clave · 422 URL de otro host · 429 demasiadas
if (r.status === 200 || r.status === 202) console.log(`IndexNow: respuesta ${r.status}, enviado.`);
else aviso(`respuesta ${r.status} ${await r.text().catch(() => '')}`.trim());
