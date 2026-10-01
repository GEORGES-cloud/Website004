// Monta los vídeos del hero "recorrido por la casa" a partir de photos/hero-casa-tomas.json.
//   node tools/montaje-hero.mjs           (necesita ffmpeg; ruta en la variable FFMPEG o la de winget)
//   node tools/montaje-hero.mjs --todo    además, las variantes que se enseñaron al cliente y no eligió
//
// Salidas en photos/:
//   hero-casa-xl.mp4 / hero-casa.mp4  tomas unidas con fundidos, a 2560x1440 (pantallas muy grandes) y 1920x1080
//   hero-casa-v.mp4                   la versión vertical para móvil (720x1280)
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
const tomas = spec.tomas;             // [{ id, nombre, url, inicio, fin, x, mosaico? }]

// 1. descargar las fuentes 4K que falten
for (const t of tomas) {
  t.fichero = join(cache, `${t.id}.mp4`);
  if (existsSync(t.fichero) && statSync(t.fichero).size > 1e6) continue;
  console.log('descargando', t.id);
  const r = spawnSync('curl', ['-sSL', '-A', 'Mozilla/5.0', '-o', t.fichero, t.url], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('descarga ' + t.id);
}

// 2. cada toma recortada, a 30 fps y al tamaño de salida (horizontal o vertical), sin audio
const prepara = (t, vertical) => {
  const d = (t.fin - t.inicio).toFixed(3);
  const cx = Math.round(Math.min(3840 - 1215, Math.max(0, t.x * 3840 - 607)));
  const geo = vertical ? `crop=1215:2160:${cx}:0,scale=720:1280:flags=lanczos` : 'scale=2560:1440:flags=lanczos';
  return `trim=start=${t.inicio}:duration=${d},setpts=PTS-STARTPTS,fps=30,${geo},hqdn3d=1.2:1.2:5:5,format=yuv420p,setsar=1`;
};

// offsets de cada transición en la línea de tiempo de salida (transición k entra a la toma k)
const tiempos = (dur) => {
  const D = tomas.map((t) => t.fin - t.inicio);
  const offs = [];
  let acum = 0;
  for (let k = 1; k <= tomas.length; k++) { acum += D[k - 1]; offs.push(acum - k * dur); }
  return offs;   // offs[k-1] = inicio de la transición hacia la toma k (k = n es la vuelta a la primera)
};

// cadena de transiciones con la primera toma repetida al final; se recorta [dur, offs[n-1] + dur]
const monta = ({ vertical, transicion, dur, salida, linea }) => {
  const n = tomas.length;
  const entradas = [...tomas, tomas[0]].flatMap((t) => ['-i', t.fichero]);
  const filtros = [...tomas, tomas[0]].map((t, i) => `[${i}:v]${prepara(i === n ? { ...t, fin: t.inicio + dur + 0.2 } : t, vertical)}[v${i}]`);
  const offs = tiempos(dur);
  let prev = 'v0';
  offs.forEach((o, k) => { filtros.push(`[${prev}][v${k + 1}]xfade=transition=${transicion}:duration=${dur}:offset=${o.toFixed(3)}[x${k}]`); prev = `x${k}`; });
  const fin = offs[n - 1] + dur;
  let ultimo = prev;
  if (linea) {
    // línea de luz: imagen con brillo gaussiano que cruza la pantalla en cada barrido
    const W = vertical ? 720 : 2560, H = vertical ? 1280 : 1440, lw = vertical ? 90 : 160;
    const x = offs.reduceRight((resto, o) => `if(between(t,${o.toFixed(3)},${(o + dur).toFixed(3)}),(t-${o.toFixed(3)})/${dur}*${W}-w/2,${resto})`, '-w');
    filtros.push(`color=c=black:s=${lw}x${H}:r=30,format=rgba,geq=r=255:g=241:b=218:a='min(255,255*(0.95*exp(-pow((X-${lw / 2})/${vertical ? 3 : 5},2))+0.38*exp(-pow((X-${lw / 2})/${vertical ? 16 : 28},2)))*pow(sin(PI*(Y+1)/(H+1)),0.5))'[luz]`);
    filtros.push(`[${prev}][luz]overlay=x='${x}':y=0:eval=frame:shortest=1[conluz]`);
    ultimo = 'conluz';
  }
  filtros.push(`[${ultimo}]trim=start=${dur}:end=${fin.toFixed(3)},setpts=PTS-STARTPTS,format=yuv420p[out]`);
  ff([...entradas, '-filter_complex', filtros.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow',
    '-crf', vertical ? '27' : '26', '-profile:v', 'high', '-maxrate', vertical ? '3M' : '7M', '-bufsize', vertical ? '6M' : '14M',
    '-g', '60', '-movflags', '+faststart', join(fotos, salida)], salida);
  return { offs, total: fin - dur };
};

const casa = monta({ vertical: false, transicion: 'fade', dur: F, salida: 'hero-casa-xl.mp4' });
// la de 1920 sale de la de 2560 (es la que se descarga casi siempre: pesa menos de la mitad)
ff(['-i', join(fotos, 'hero-casa-xl.mp4'), '-an', '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
  '-profile:v', 'high', '-maxrate', '5M', '-bufsize', '10M', '-g', '60', '-movflags', '+faststart', join(fotos, 'hero-casa.mp4')], 'hero 1920');
monta({ vertical: true, transicion: 'fade', dur: F, salida: 'hero-casa-v.mp4' });
const todo = process.argv.includes('--todo');
if (todo) {
  monta({ vertical: false, transicion: 'wiperight', dur: FL, salida: 'hero-luz.mp4', linea: true });
  monta({ vertical: true, transicion: 'wiperight', dur: FL, salida: 'hero-luz-v.mp4', linea: true });
}

// pósters: primer fotograma de cada montaje
ff(['-i', join(fotos, 'hero-casa-xl.mp4'), '-frames:v', '1', '-q:v', '4', join(fotos, 'hero-casa.jpg')], 'póster');
ff(['-i', join(fotos, 'hero-casa-v.mp4'), '-frames:v', '1', '-vf', 'scale=900:1600:flags=lanczos', '-q:v', '4', join(fotos, 'hero-casa-v.jpg')], 'póster vertical');

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
