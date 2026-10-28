// Monta los vídeos del hero (fachada, plano, obra, entrada, terraza) a partir de photos/hero-casa-tomas.json.
//   node tools/montaje-hero.mjs           (necesita ffmpeg; ruta en la variable FFMPEG o la de winget)
//   node tools/montaje-hero.mjs --todo    además, las variantes que se enseñaron al cliente y no eligió
//
// Salidas en photos/:
//   hero-casa-xl.mp4 / hero-casa.mp4  tomas unidas con fundidos, a 2560x1440 (pantallas grandes o retina) y 1920x1080
//   hero-casa-v.mp4                   la versión vertical para móvil (1080x1920)
// Las tres salen directamente de las fuentes 4K, cada una con su codificación (máxima calidad razonable).
//   hero-casa.jpg / hero-casa-v.jpg   primer fotograma (póster)
// Con --todo, también:
//   hero-luz.mp4  / hero-luz-v.mp4    las mismas tomas, cambiando con una línea de luz que barre la imagen
//   mos-<nombre>.mp4 / .jpg           clips cortos 4:5 para un mosaico (las tomas con "mosaico")
// Todos los bucles son continuos: la última toma funde con la primera y el corte cae en el mismo fotograma.
// Las descargas 4K se guardan en photos/_videos/ (fuera de git).
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const fotos = join(raiz, 'photos');
const cache = join(fotos, '_videos');
mkdirSync(cache, { recursive: true });
const bin = process.env.FFMPEG || 'C:/Users/Georges Barrio/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin';
const ff = (args, que) => {
  const r = spawnSync(join(bin, 'ffmpeg.exe'), ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'], maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg falló: ${que}`);
};

const spec = JSON.parse(readFileSync(join(fotos, 'hero-casa-tomas.json'), 'utf8'));
const F = spec.fundido ?? 0.9;        // duración de cada fundido (s)
const FL = spec.barrido ?? 1.3;       // duración de cada barrido de luz (s)
const tomas = spec.tomas;             // [{ id, nombre, url, inicio, fin, x, entrada?, filtro?, mosaico? }]
const GRADO = spec.filtro || '';      // corrección de color común a todas las tomas (antes que la de cada una)
// "entrada" de una toma: duración (s) del fundido con que entra; 0.04 es en la práctica un corte seco.
// La de la primera toma es la vuelta del bucle. Sin "entrada", la del fundido general (F).

// 1. descargar las fuentes 4K que falten
for (const t of tomas) {
  t.fichero = join(cache, `${t.id}.mp4`);
  if (existsSync(t.fichero) && statSync(t.fichero).size > 1e6) continue;
  console.log('descargando', t.id);
  const r = spawnSync('curl', ['-sSL', '-A', 'Mozilla/5.0', '-o', t.fichero, t.url], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('descarga ' + t.id);
}

// 2. cada toma recortada, a 30 fps y al tamaño de salida (horizontal o vertical), sin audio
const prepara = (t, vertical, W, H) => {
  const d = (t.fin - t.inicio).toFixed(3);
  const cx = Math.round(Math.min(3840 - 1215, Math.max(0, t.x * 3840 - 607)));
  const geo = vertical ? `crop=1215:2160:${cx}:0,scale=${W}:${H}:flags=lanczos` : `scale=${W}:${H}:flags=lanczos`;
  // "filtro" (opcional): corrección de color de esa toma, para igualar tomas de autores distintos
  const color = [GRADO, t.filtro].filter(Boolean).map((f) => f + ',').join('');
  // "congelar" (opcional): segundo de la fuente que se queda quieto toda la toma, con un acercamiento
  // lento del 5 %. Sirve para tomas que solo están limpias un instante (el plano, antes de que entre la mano).
  const corte = t.congelar == null
    ? `trim=start=${t.inicio}:duration=${d},setpts=PTS-STARTPTS,fps=30`
    : `trim=start=${t.congelar}:duration=0.2,setpts=PTS-STARTPTS,fps=30,trim=end_frame=1,tpad=stop_mode=clone:stop_duration=${d},` +
      `scale=w='trunc(3840*(1+0.05*t/${d})/2)*2':h=-2:eval=frame:flags=bicubic,crop=3840:2160:'(iw-3840)/2':'(ih-2160)/2'`;
  // "zoom" (opcional): acerca la toma alrededor de "cx" (0-1, centro horizontal) para dejar fuera de cuadro
  // algo del borde (en la fachada, una caseta de contadores); se vuelve a 3840x2160 antes de encuadrar
  const z = t.zoom || 1;
  const acerca = z > 1 ? `crop=${Math.round(3840 / z / 2) * 2}:${Math.round(2160 / z / 2) * 2}:${Math.round(Math.min(3840 - 3840 / z, Math.max(0, (t.cx ?? 0.5) * 3840 - 1920 / z)))}:${Math.round((2160 - 2160 / z) / 2)},scale=3840:2160:flags=lanczos,` : '';
  // reducción de ruido muy suave: quita el grano de las fuentes sin comerse el detalle
  return `${corte},${acerca}${geo},${color}hqdn3d=0.6:0.6:3:3,format=yuv420p,setsar=1`;
};

// offsets de cada transición en la línea de tiempo de salida (transición k entra a la toma k).
// fd(k) = duración de esa transición; tras cada una, la cadena mide lo que medía más la toma nueva menos el fundido.
const tiempos = (fd) => {
  const D = tomas.map((t) => t.fin - t.inicio);
  const offs = [];
  let largo = D[0];
  for (let k = 1; k <= tomas.length; k++) { offs.push(largo - fd(k)); largo += (D[k] ?? 0) - fd(k); }
  return offs;   // offs[k-1] = inicio de la transición hacia la toma k (k = n es la vuelta a la primera)
};

// cadena de transiciones con la primera toma repetida al final; se recorta [fd(n), offs[n-1] + fd(n)]
const monta = ({ vertical, W, H, crf, maxrate, transicion, dur, salida, linea }) => {
  const n = tomas.length;
  // con fundidos, cada toma puede traer el suyo ("entrada"); el barrido de luz usa siempre el mismo
  const fd = (k) => (transicion === 'fade' ? tomas[k % n].entrada ?? dur : dur);
  const entradas = [...tomas, tomas[0]].flatMap((t) => ['-i', t.fichero]);
  const filtros = [...tomas, tomas[0]].map((t, i) => `[${i}:v]${prepara(i === n ? { ...t, fin: t.inicio + fd(n) + 0.2 } : t, vertical, W, H)}[v${i}]`);
  const offs = tiempos(fd);
  let prev = 'v0';
  offs.forEach((o, k) => { filtros.push(`[${prev}][v${k + 1}]xfade=transition=${transicion}:duration=${fd(k + 1)}:offset=${o.toFixed(3)}[x${k}]`); prev = `x${k}`; });
  const fin = offs[n - 1] + fd(n);
  dur = fd(n);   // a partir de aquí, el recorte final del bucle
  let ultimo = prev;
  if (linea) {
    // línea de luz: imagen con brillo gaussiano que cruza la pantalla en cada barrido
    const lw = vertical ? 120 : 160;
    const x = offs.reduceRight((resto, o) => `if(between(t,${o.toFixed(3)},${(o + dur).toFixed(3)}),(t-${o.toFixed(3)})/${dur}*${W}-w/2,${resto})`, '-w');
    filtros.push(`color=c=black:s=${lw}x${H}:r=30,format=rgba,geq=r=255:g=241:b=218:a='min(255,255*(0.95*exp(-pow((X-${lw / 2})/${vertical ? 3 : 5},2))+0.38*exp(-pow((X-${lw / 2})/${vertical ? 16 : 28},2)))*pow(sin(PI*(Y+1)/(H+1)),0.5))'[luz]`);
    filtros.push(`[${prev}][luz]overlay=x='${x}':y=0:eval=frame:shortest=1[conluz]`);
    ultimo = 'conluz';
  }
  filtros.push(`[${ultimo}]trim=start=${dur}:end=${fin.toFixed(3)},setpts=PTS-STARTPTS,format=yuv420p[out]`);
  ff([...entradas, '-filter_complex', filtros.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slower',
    '-crf', String(crf), '-profile:v', 'high', '-maxrate', maxrate, '-bufsize', String(parseInt(maxrate) * 2) + 'M',
    '-g', '60', '-movflags', '+faststart', join(fotos, salida)], salida);
  return { offs, total: fin - dur };
};

const casa = monta({ vertical: false, W: 2560, H: 1440, crf: 19, maxrate: '16M', transicion: 'fade', dur: F, salida: 'hero-casa-xl.mp4' });
monta({ vertical: false, W: 1920, H: 1080, crf: 19, maxrate: '10M', transicion: 'fade', dur: F, salida: 'hero-casa.mp4' });
monta({ vertical: true, W: 1080, H: 1920, crf: 20, maxrate: '9M', transicion: 'fade', dur: F, salida: 'hero-casa-v.mp4' });
const todo = process.argv.includes('--todo');
if (todo) {
  monta({ vertical: false, W: 2560, H: 1440, crf: 22, maxrate: '12M', transicion: 'wiperight', dur: FL, salida: 'hero-luz.mp4', linea: true });
  monta({ vertical: true, W: 1080, H: 1920, crf: 23, maxrate: '7M', transicion: 'wiperight', dur: FL, salida: 'hero-luz-v.mp4', linea: true });
}

// pósters: primer fotograma de cada montaje
ff(['-i', join(fotos, 'hero-casa-xl.mp4'), '-frames:v', '1', '-q:v', '3', join(fotos, 'hero-casa.jpg')], 'póster');
ff(['-i', join(fotos, 'hero-casa-v.mp4'), '-frames:v', '1', '-q:v', '3', join(fotos, 'hero-casa-v.jpg')], 'póster vertical');

// estancias y tiempos, para el registro (cada una va de la mitad de un fundido a la mitad del siguiente)
const segmentos = tomas.map((t, k) => ({
  nombre: t.nombre,
  inicio: +(k === 0 ? 0 : casa.offs[k - 1] - F / 2).toFixed(2),
  fin: +(k === tomas.length - 1 ? casa.total : casa.offs[k] - F / 2).toFixed(2),
}));

// clips del mosaico: 4:5, 960x1200, bucle de ida y vuelta
for (const t of todo ? tomas.filter((t) => t.mosaico) : []) {
  const d = Math.min(4.5, t.fin - t.inicio);
  const cw = 1728, cx = Math.round(Math.min(3840 - cw, Math.max(0, t.x * 3840 - cw / 2)));
  const base = `trim=start=${t.inicio}:duration=${d},setpts=PTS-STARTPTS,fps=30,crop=${cw}:2160:${cx}:0,scale=960:1200:flags=lanczos,hqdn3d=1.2:1.2:5:5,format=yuv420p`;
  const n = Math.round(d * 30);
  ff(['-i', t.fichero, '-filter_complex', `[0:v]${base},split[a][b];[b]reverse,trim=start_frame=1:end_frame=${n - 1},setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', join(fotos, `mos-${t.mosaico}.mp4`)], `mosaico ${t.mosaico}`);
  ff(['-i', join(fotos, `mos-${t.mosaico}.mp4`), '-frames:v', '1', '-q:v', '4', join(fotos, `mos-${t.mosaico}.jpg`)], `póster mosaico ${t.mosaico}`);
}
console.log('montaje listo:', segmentos.map((s) => `${s.nombre} ${s.inicio}-${s.fin}`).join(' · '));
