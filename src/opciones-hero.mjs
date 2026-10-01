// Opciones de hero para que el cliente compare. Páginas ocultas (noindex, fuera del sitemap) y solo en
// español: /opciones-hero/ (índice) y /opciones-hero/<letra>/ (la portada entera con otro hero).
// Cuando el cliente elija, el hero elegido pasa a la portada y este fichero se borra.
// Los vídeos del recorrido los monta tools/montaje-hero.mjs; photos/hero-casa.json guarda el orden de
// las estancias y en qué segundo empieza cada una (lo usan los capítulos de la opción D).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const montaje = existsSync(RAIZ + 'photos/hero-casa.json') ? JSON.parse(readFileSync(RAIZ + 'photos/hero-casa.json', 'utf8')) : null;

const OPCIONES = [
  { id: 'actual', letra: 'Actual', titulo: 'Salón (la de ahora)', nota: 'Un solo plano del salón con sol de tarde, en bucle de ida y vuelta.' },
  { id: 'a', letra: 'A', titulo: 'Recorrido por la casa', nota: 'Varias estancias de la misma villa unidas con fundidos suaves: salón, comedor, dormitorio, baño, escalera y exterior.' },
  { id: 'b', letra: 'B', titulo: 'Recorrido con línea de luz', nota: 'Las mismas estancias, pero cada cambio lo hace una línea de luz cálida que barre la pantalla, como en homedeco.app.' },
  { id: 'c', letra: 'C', titulo: 'Mosaico de estancias', nota: 'Titular sobre fondo claro y, al lado, cuatro estancias en vídeo a la vez, en una rejilla de esquinas vivas.' },
  { id: 'd', letra: 'D', titulo: 'Editorial con capítulos', nota: 'Titular enorme sobre fondo claro y debajo el recorrido enmarcado, con el nombre de cada estancia marcándose a medida que aparece.' },
];

const ruta = (id) => (id === 'actual' ? 'opciones-hero/actual' : `opciones-hero/${id}`);

// barra para saltar entre opciones (fija abajo a la izquierda, solo en estas páginas)
const barra = (actual) => `<nav class="op-barra" aria-label="Opciones de hero">
  <a href="{{url:op-indice}}">Opciones</a>
${OPCIONES.map((o) => `  <a href="{{url:op-${o.id}}}"${o.id === actual ? ' aria-current="page"' : ''}>${o.letra}</a>`).join('\n')}
</nav>
<style>
.op-barra{position:fixed;z-index:58;left:max(1rem,env(safe-area-inset-left));bottom:max(1rem,env(safe-area-inset-bottom));display:flex;align-items:stretch;
  background:var(--cal);border:1px solid var(--tinta);box-shadow:0 16px 36px -16px rgba(28,24,19,.55);font:600 .85rem/1 var(--f)}
.op-barra a{display:flex;align-items:center;justify-content:center;min-width:44px;height:44px;padding:0 .8rem;text-decoration:none;color:var(--tinta)}
.op-barra a + a{border-left:1px solid var(--linea)}
.op-barra a:hover{background:var(--arena)}
.op-barra a[aria-current]{background:var(--tinta);color:var(--cal)}
@media (max-width:520px){.op-barra a:first-child{display:none}.op-barra a{min-width:40px;padding:0 .55rem}}
</style>`;

const fondoVideo = ({ video, videoV, poster, posterV, alt }) => `<div class="hero-bg" data-video="/photos/${video}" data-video-sm="/photos/${videoV}"><picture><source media="(orientation: portrait)" srcset="/photos/${posterV}" width="900" height="1600"><img src="/photos/${poster}" alt="${alt}" width="2560" height="1440" fetchpriority="high" decoding="async"></picture></div>`;

const ALT_CASA = 'Recorrido por las estancias de una villa luminosa: salón, comedor, dormitorio, baño y exterior';

// texto del hero para fondo claro (A, B, C y D): mismos textos, botón oscuro
const textoClaro = (heroTexto) => heroTexto.replace('class="btn btn-claro"', 'class="btn"');

// A y B: cada estancia tiene una luz distinta, así que el texto va en un recuadro crema abajo a la
// izquierda (se lee sobre cualquier toma) y el vídeo se ve limpio, sin oscurecer.
const ESTILO_TARJETA = `<style>
.hero-tarjeta .hero-bg::after{display:none}
.hero.hero-tarjeta .wrap{justify-content:flex-end}
.ht-caja{width:min(760px,100%);padding:clamp(1.25rem,2.6vw,2.4rem);background:var(--cal);color:var(--tinta)}
.hero-tarjeta h1{font-size:clamp(2.4rem,5vw,5.4rem);max-width:none}
.hero-tarjeta .hero-row{border-top-color:var(--linea);margin-top:clamp(1rem,2.5vh,1.75rem)}
.hero-tarjeta .hero-row p{color:var(--tinta-2)}
.hero-tarjeta .lnk{color:var(--tinta)}
@media (max-width:760px){.hero.hero-tarjeta .wrap{padding-inline:.75rem;padding-bottom:.75rem}.ht-caja{padding:1.25rem 1.1rem 1.4rem}}
</style>`;

const heroTarjeta = (heroTexto, video, videoV, extra = '') => `<section class="hero hero-tarjeta" id="top">
  ${fondoVideo({ video, videoV, poster: 'hero-casa.jpg', posterV: 'hero-casa-v.jpg', alt: ALT_CASA })}
  <div class="wrap">
    <div class="ht-caja">
${textoClaro(heroTexto)}
    </div>
  </div>
</section>
${ESTILO_TARJETA}${extra}`;

const heroA = (heroTexto) => heroTarjeta(heroTexto, 'hero-casa.mp4', 'hero-casa-v.mp4');
// B: la línea de luz ya va dentro del vídeo; se quita la del CSS para que no salgan dos
const heroB = (heroTexto) => heroTarjeta(heroTexto, 'hero-luz.mp4', 'hero-luz-v.mp4', '\n<style>.hero-bg::before{display:none}</style>');

const MOSAICO = [
  { f: 'mos-salon', n: 'Salón', alt: 'Salón con sofá curvo y cortinas de lino al sol' },
  { f: 'mos-dormitorio', n: 'Dormitorio', alt: 'Dormitorio luminoso con ropa de cama clara' },
  { f: 'mos-bano', n: 'Baño', alt: 'Baño de mármol con lavabo de diseño' },
  { f: 'mos-exterior', n: 'Exterior', alt: 'Piscina y terraza de la villa' },
];

const heroC = (heroTexto) => `<section class="hero hero-mosaico" id="top">
  <div class="wrap hm-in">
    <div class="hm-texto">
${textoClaro(heroTexto)}
    </div>
    <div class="hm-rejilla">
${MOSAICO.map((m, k) => `      <figure class="hm-c hm-${k + 1}"><video muted loop playsinline autoplay preload="${k ? 'metadata' : 'auto'}" poster="/photos/${m.f}.jpg" aria-hidden="true" src="/photos/${m.f}.mp4"></video><img src="/photos/${m.f}.jpg" alt="${m.alt}" width="960" height="1200" decoding="async"${k ? ' loading="lazy"' : ''}><figcaption>${m.n}</figcaption></figure>`).join('\n')}
    </div>
  </div>
</section>
<style>
.hero-mosaico{display:block;min-height:0;background:var(--cal)!important;color:var(--tinta)}
.hero .wrap.hm-in{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,4vw,4rem);align-items:stretch;padding-block:clamp(2rem,5vh,3.5rem)}
.hm-texto{display:flex;flex-direction:column;justify-content:space-between;gap:2.5rem}
.hero-mosaico h1{font-size:clamp(2.8rem,6vw,6.6rem);max-width:none}
.hero-mosaico .hero-row{grid-template-columns:minmax(0,1fr);border-top-color:var(--tinta)}
.hero-mosaico .hero-row p{color:var(--tinta-2)}
.hero-mosaico .lnk{color:var(--tinta)}
.hm-rejilla{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;min-height:calc(100svh - var(--mh) - 7rem)}
.hm-c{position:relative;margin:0;overflow:hidden;background:var(--travertino)}
.hm-c video,.hm-c img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hm-c video{z-index:1}
.hm-c figcaption{position:absolute;z-index:2;left:.75rem;bottom:.75rem;padding:.4rem .6rem;background:var(--cal);font-size:.8rem;font-weight:600;letter-spacing:-.01em}
.hero-mosaico + section{box-shadow:none}
@media (max-width:900px){
  .hero .wrap.hm-in{grid-template-columns:minmax(0,1fr)}
  .hm-rejilla{min-height:0;grid-template-columns:1fr 1fr;grid-template-rows:auto;aspect-ratio:1/1.05}
}
@media (prefers-reduced-motion: reduce){.hm-c video{display:none}}
</style>`;

const heroD = (heroTexto) => {
  const caps = montaje ? montaje.segmentos : [];
  return `<section class="hero hero-edit" id="top">
  <div class="wrap he-top">
${textoClaro(heroTexto)}
  </div>
  <div class="wrap he-pie">
    <div class="he-marco">
      ${fondoVideo({ video: 'hero-casa.mp4', videoV: 'hero-casa-v.mp4', poster: 'hero-casa.jpg', posterV: 'hero-casa-v.jpg', alt: ALT_CASA })}
    </div>
    <ol class="he-caps" aria-hidden="true">
${caps.map((c) => `      <li data-ini="${c.inicio}" data-fin="${c.fin}"><span>${c.nombre}</span><i></i></li>`).join('\n')}
    </ol>
  </div>
</section>
<style>
.hero-edit{display:block;min-height:0;background:var(--cal)!important;color:var(--tinta)}
.hero .wrap.he-top{display:grid;grid-template-columns:minmax(0,1fr);gap:0;padding-top:clamp(2rem,6vh,4rem);padding-bottom:0}
.hero-edit h1{font-size:clamp(3rem,7.6vw,8.8rem);max-width:none}
.hero-edit .hero-row{border-top-color:var(--tinta);margin-top:clamp(1.25rem,3vh,2rem)}
.hero-edit .hero-row p{color:var(--tinta-2)}
.hero-edit .lnk{color:var(--tinta)}
.hero .wrap.he-pie{display:block;padding-top:clamp(1.5rem,4vh,2.5rem);padding-bottom:clamp(2rem,5vh,3.5rem)}
.he-marco{position:relative;aspect-ratio:21/9;overflow:hidden;background:var(--travertino)}
.he-marco .hero-bg::after{display:none}
.he-caps{display:grid;grid-template-columns:repeat(${Math.max(caps.length, 1)},minmax(0,1fr));gap:10px;margin:.9rem 0 0;padding:0;list-style:none}
.he-caps li{display:flex;flex-direction:column;gap:.5rem;font-size:.8rem;font-weight:600;color:var(--tinta-3);transition:color .3s ease}
.he-caps i{display:block;height:2px;background:var(--linea);position:relative;overflow:hidden}
.he-caps i::after{content:"";position:absolute;inset:0;background:var(--tinta);transform:scaleX(var(--p,0));transform-origin:left}
.he-caps li.on{color:var(--tinta)}
@media (max-width:760px){.he-marco{aspect-ratio:4/5}.he-caps{grid-template-columns:repeat(${Math.max(caps.length, 1)},minmax(0,1fr))}.he-caps span{display:none}.he-caps li.on span{display:block;position:absolute}}
@media (prefers-reduced-motion: reduce){.he-caps{display:none}}
</style>
<script>
(function(){
  var caps = document.querySelectorAll('.he-caps li');
  if (!caps.length) return;
  var mira = function(){
    var v = document.querySelector('.he-marco video');
    if (!v) return setTimeout(mira, 300);
    var pinta = function(){
      var t = v.currentTime;
      caps.forEach(function(li){
        var a = +li.dataset.ini, b = +li.dataset.fin, p = Math.min(1, Math.max(0, (t - a) / (b - a)));
        li.classList.toggle('on', t >= a && t < b);
        li.querySelector('i').style.setProperty('--p', t >= b ? 1 : p);
      });
      requestAnimationFrame(pinta);
    };
    pinta();
  };
  mira();
})();
</script>`;
};

export function paginasOpcionesHero({ inicio, heroTexto, heroActual }) {
  const heroes = { actual: heroActual, a: () => heroA(heroTexto), b: () => heroB(heroTexto), c: () => heroC(heroTexto), d: () => heroD(heroTexto) };
  const indice = () => `<section class="phead solo">
  <div class="wrap">
    <div class="phead-copy">
      <p class="kicker">Para el cliente · no se indexa</p>
      <h1>Opciones de hero</h1>
      <p class="lead">Cada opción abre la portada completa con un hero distinto. Abajo a la izquierda tienes una barra para saltar de una a otra.</p>
    </div>
  </div>
</section>
<section class="block">
  <div class="wrap">
    <div class="more three">
${OPCIONES.map((o) => `      <a href="{{url:op-${o.id}}}"><span class="ph"><img src="/photos/${o.id === 'actual' ? 'hero-dia.jpg' : 'op-' + o.id + '.jpg'}" alt="" loading="lazy" decoding="async"></span><span><b>${o.letra === 'Actual' ? '' : o.letra + ' · '}${o.titulo}</b><small>${o.nota}</small></span></a>`).join('\n')}
    </div>
  </div>
</section>`;
  return [
    { id: 'op-indice', es: 'opciones-hero', xx: 'opciones-hero', title: 'Opciones de hero | Luxor Marbella', desc: '', cuerpo: indice, oculta: true, soloEs: true },
    ...OPCIONES.map((o) => ({
      id: `op-${o.id}`, es: ruta(o.id), xx: ruta(o.id), title: `Hero ${o.letra}: ${o.titulo} | Luxor Marbella`, desc: '', oculta: true, soloEs: true,
      cuerpo: () => `${inicio(heroes[o.id]())}\n${barra(o.id)}`,
    })),
  ];
}
