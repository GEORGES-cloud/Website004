/**
 * Luxor Marbella — servidor de producción
 * --------------------------------------------------
 * Sirve el sitio estático (public/) con compresión y cabeceras de caché.
 *
 * Arranque:  npm install  &&  npm start
 * Por defecto escucha en http://localhost:3000
 */

import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || process.argv[2] || 3000;
const PUBLIC_DIR = join(__dirname, 'public');

const app = express();

app.disable('x-powered-by');
// Detrás del proxy de Hostinger: respetar X-Forwarded-* (host/proto/ip reales). Un solo salto.
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  });
  next();
});

app.use(compression());

// /index.html -> / (URL única para la portada)
app.use((req, res, next) => {
  if (req.path === '/index.html') return res.redirect(301, '/');
  next();
});

// HTML sin caché (los cambios se ven al momento); imágenes con caché de un día.
// No se marcan como immutable: los nombres de las fotos no llevan versión y
// todavía se están cambiando.
app.use(
  express.static(PUBLIC_DIR, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (/\.(?:jpg|jpeg|png|webp|avif|svg|ico|woff2?)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  })
);

// Healthcheck simple para despliegues.
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Ruta desconocida → 404 real (no la portada con 200).
app.use((_req, res) => {
  res.status(404).type('text/plain; charset=utf-8').send('404 · Página no encontrada');
});

// Escuchamos en 0.0.0.0 para que el proxy del hosting pueda alcanzar la app.
// Sin esto puede arrancar sin errores y aun así dar 503.
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`\n  Luxor Marbella · sirviendo en  http://${HOST}:${PORT}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  El puerto ${PORT} ya está en uso. Prueba con otro:  set PORT=8080 && npm start\n`);
    process.exit(1);
  }
  throw err;
});
