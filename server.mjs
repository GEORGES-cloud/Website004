/**
 * Luxor Marbella — servidor de producción
 * --------------------------------------------------
 * Sirve el sitio estático (public/, generado por build.mjs) con compresión y
 * cabeceras de caché, y recibe el formulario de presupuesto.
 *
 * Arranque:  npm install  &&  npm start
 * Por defecto escucha en http://localhost:3000
 */

import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || process.argv[2] || 3000;
const PUBLIC_DIR = join(__dirname, 'public');
const IDIOMAS = ['es', 'en', 'fr', 'de', 'sv', 'ru'];

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

// Dominio canónico: www.luxormarbella.com. El dominio sin www redirige con 301
// conservando la ruta, para que Google no vea el sitio duplicado.
// Solo GET y HEAD, para no convertir en GET un POST del formulario.
app.use((req, res, next) => {
  if ((req.hostname || '').toLowerCase() === 'luxormarbella.com' && (req.method === 'GET' || req.method === 'HEAD')) {
    return res.redirect(301, `https://www.luxormarbella.com${req.originalUrl}`);
  }
  next();
});

app.use(compression());

// URL única por página: /carpeta/index.html -> /carpeta/ (arrastrando la query)
app.use((req, res, next) => {
  if (req.path.endsWith('/index.html')) {
    const i = req.originalUrl.indexOf('?');
    // Barras iniciales colapsadas: con "//evil.com/index.html" el destino sería "//evil.com/", otro dominio
    const destino = req.path.slice(0, -'index.html'.length).replace(/^\/+/, '/');
    return res.redirect(301, destino + (i === -1 ? '' : req.originalUrl.slice(i)));
  }
  next();
});

// HTML sin caché (los cambios se ven al momento). CSS, JS, fuentes y las fotos y vídeos con
// la huella del contenido en el nombre (foto.1a2b3c4d5e.jpg) no cambian nunca: un año.
// El resto de imágenes (logo, iconos), un día.
app.use(
  express.static(PUBLIC_DIR, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (/\.(?:css|js|woff2)$/.test(filePath) || /\.[0-9a-f]{10}\.(?:jpe?g|png|webp|mp4|webm)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.(?:jpg|jpeg|png|webp|avif|svg|ico|mp4|webm)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  })
);

// Healthcheck simple para despliegues.
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- Formulario de presupuesto → correo a Luxor ---------------------------------
// Necesita el paquete nodemailer y SMTP_USER / SMTP_PASS en las variables de entorno
// de hPanel (el buzón desde el que se envía). Si falta cualquiera de los dos responde
// 503 y la página ofrece al visitante mandar los mismos datos por WhatsApp.
// No se guarda ni se escribe en el log ningún dato personal.
const MAIL_TO = process.env.MAIL_TO || 'info@luxormarbella.com';
const SMTP = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
};
// Import dinámico: server.mjs se sube por FTP y las dependencias solo se instalan al
// redesplegar desde hPanel; con un import normal, si faltara el módulo la web se caería.
const nodemailer = await import('nodemailer').then((m) => m.default, () => null);
const correo =
  nodemailer && SMTP.user && SMTP.pass
    ? nodemailer.createTransport({
        host: SMTP.host,
        port: SMTP.port,
        secure: SMTP.port === 465,
        auth: { user: SMTP.user, pass: SMTP.pass },
        // Un SMTP que acepta y no contesta no debe dejar al visitante 2 min en "Enviando…":
        // con 502 en ≤10 s la página le ofrece WhatsApp.
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 30000,
      })
    : null;

// Tope de envíos por IP. Holgado a propósito: detrás de la CDN varias personas pueden
// compartir IP, y a quien se le corta le sigue quedando el enlace de WhatsApp.
const LIMITE = 20;
const VENTANA = 10 * 60 * 1000;
const envios = new Map();
function demasiados(ip) {
  const ahora = Date.now();
  const recientes = (envios.get(ip) || []).filter((t) => ahora - t < VENTANA);
  recientes.push(ahora);
  if (envios.size > 5000) envios.clear();
  envios.set(ip, recientes);
  return recientes.length > LIMITE;
}

// Sin saltos de línea: estos valores acaban en el asunto y en el Reply-To del correo.
const limpio = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

app.post('/api/presupuesto', express.json({ limit: '10kb' }), async (req, res) => {
  const b = req.body || {};
  // Campo trampa relleno = bot. Se le responde que sí para que no insista.
  if (b.web) return res.json({ ok: true });
  if (demasiados(req.ip)) return res.status(429).json({ ok: false, error: 'Demasiadas solicitudes' });

  const nombre = limpio(b.nombre, 100);
  const telefono = limpio(b.telefono, 30);
  const email = limpio(b.email, 150);
  const servicio = limpio(b.servicio, 160);
  const zona = limpio(b.zona, 60);
  const plazo = limpio(b.plazo, 60);
  // El mensaje es el único campo que puede llevar saltos de línea (va solo en el cuerpo).
  const mensaje = String(b.mensaje ?? '').replace(/\r/g, '').trim().slice(0, 1200);
  const idioma = IDIOMAS.includes(b.idioma) ? b.idioma : 'es';
  const telOk = /^[+\d][\d\s().-]{5,}$/.test(telefono);
  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!nombre || !telOk || !servicio || !emailOk) {
    return res.status(400).json({ ok: false, error: 'Datos incompletos' });
  }
  if (!correo) return res.status(503).json({ ok: false, error: 'Correo no configurado' });

  try {
    await correo.sendMail({
      from: `"Web Luxor Marbella" <${SMTP.user}>`,
      to: MAIL_TO,
      replyTo: email || undefined,
      subject: `Solicitud de presupuesto · ${servicio} · ${nombre}`,
      text: [
        'Nueva solicitud de presupuesto desde luxormarbella.com',
        '',
        `Nombre:     ${nombre}`,
        `Teléfono:   ${telefono}`,
        `E-mail:     ${email || '(no indicado)'}`,
        `Servicio:   ${servicio}`,
        `Zona:       ${zona || '(no indicada)'}`,
        `Plazo:      ${plazo || '(no indicado)'}`,
        `Idioma:     ${idioma}`,
        '',
        'Mensaje:',
        mensaje || '(sin mensaje)',
        '',
        'Acepta la política de privacidad y ser contactado: sí',
        `Acepta comunicaciones comerciales: ${b.comercial === true ? 'sí' : 'no'}`,
      ].join('\n'),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('presupuesto: no se pudo enviar el correo:', err.code || err.message);
    res.status(502).json({ ok: false, error: 'No se pudo enviar' });
  }
});

// Ruta desconocida → 404 real con la página de error en el idioma de la ruta
// (no la portada con 200, que Google trata como "soft 404").
app.use((req, res) => {
  const lang = IDIOMAS.find((l) => l !== 'es' && (req.path === `/${l}` || req.path.startsWith(`/${l}/`)));
  // si ese idioma aún no tiene página de error propia, la española
  const pagina = [join(PUBLIC_DIR, lang || '', '404', 'index.html'), join(PUBLIC_DIR, '404', 'index.html')].find(existsSync);
  if (req.method === 'GET' && !req.path.startsWith('/api/') && pagina) {
    return res.status(404).set('Cache-Control', 'no-cache').sendFile(pagina);
  }
  res.status(404).type('text/plain; charset=utf-8').send('404 · Página no encontrada');
});

// Un JSON malformado en el POST no debe devolver la traza del servidor.
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ ok: false, error: 'Solicitud no válida' });
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
