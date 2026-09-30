// Despliegue a Hostinger por FTP (lo lanza .github/workflows/deploy.yml en cada push).
// Sube public/ y server.mjs a la app Node.js y le pide que se reinicie.
// Necesita FTP_SERVER, FTP_USERNAME y FTP_PASSWORD (secrets del repo).
//
// No sube package.json: si cambian las dependencias hay que redesplegar desde hPanel
// (zip nuevo), que es quien ejecuta "npm install" en el servidor.
import * as ftp from 'basic-ftp';
import { Readable } from 'node:stream';

const { FTP_SERVER, FTP_USERNAME, FTP_PASSWORD } = process.env;
// Carpeta de la app vista desde la raiz de la cuenta FTP (mapeada el 2026-09-30):
//   /public_html            solo un .htaccess
//   /hbuilds/versions/<id>  una carpeta por despliegue hecho desde hPanel
//   /hbuilds/current        enlace a la version activa: ahi corre server.mjs
// No es /nodejs como en Zeñorio. Se sube a "current" para seguir a la version activa.
// OJO: un redespliegue desde hPanel crea una version nueva con lo que lleve el zip,
// asi que ese zip tiene que estar al dia o la web retrocede hasta el siguiente push.
const APP = process.env.FTP_APP_DIR || '/hbuilds/current';

if (!FTP_SERVER || !FTP_USERNAME || !FTP_PASSWORD) {
  console.log('::warning::Faltan los secrets FTP_SERVER / FTP_USERNAME / FTP_PASSWORD: no se ha desplegado nada.');
  process.exit(0);
}

const primera = (e) => String(e.message).split('\n')[0];

async function nombres(c, dir) {
  try {
    return (await c.list(dir)).map((f) => f.name + (f.isDirectory ? '/' : ''));
  } catch (e) {
    return [`(no se puede listar: ${primera(e)})`];
  }
}

async function intento(n) {
  const c = new ftp.Client(45000);
  try {
    // rejectUnauthorized:false igual que en Zeñorio: el certificado del FTPS de Hostinger
    // no valida contra las CA del runner y con la validacion activada el despliegue falla.
    // Riesgo conocido: quien se ponga entre GitHub y Hostinger podria leer las credenciales.
    await c.access({
      host: FTP_SERVER,
      user: FTP_USERNAME,
      password: FTP_PASSWORD,
      secure: true,
      secureOptions: { rejectUnauthorized: false },
    });

    // Antes de subir nada: comprobar que APP es de verdad la carpeta de la app.
    // Si no lo es, se enseña lo que hay y se para, en vez de dejar ficheros sueltos.
    const enApp = await nombres(c, APP);
    if (!enApp.includes('server.mjs') || !enApp.includes('public/')) {
      console.log(`::error::${APP} no parece la carpeta de la app (faltan server.mjs o public/). No se ha subido nada.`);
      for (const dir of ['/', APP, '/public_html', '/hbuilds']) {
        console.log(`::notice::${dir}: ${(await nombres(c, dir)).join('  ')}`);
      }
      for (const sub of (await nombres(c, '/hbuilds')).filter((n) => n.endsWith('/'))) {
        console.log(`::notice::/hbuilds/${sub}: ${(await nombres(c, `/hbuilds/${sub}`)).join('  ')}`);
      }
      return 'mal-mapeado';
    }

    await c.uploadFromDir('public', `${APP}/public`);
    console.log(`SUBIDO public/ -> ${APP}/public (intento ${n})`);
    await c.uploadFrom('server.mjs', `${APP}/server.mjs`);
    console.log(`SUBIDO server.mjs -> ${APP}/server.mjs`);

    await c.ensureDir(`${APP}/tmp`);
    await c.uploadFrom(Readable.from([new Date().toISOString()]), 'restart.txt');
    console.log('REINICIO solicitado (tmp/restart.txt)');
    return 'ok';
  } catch (e) {
    console.log(`intento ${n} falló: ${primera(e)}`);
    return 'reintentar';
  } finally {
    c.close();
  }
}

// El FTP de Hostinger falla a ratos (550/timeout): hasta 4 intentos.
let estado = 'reintentar';
for (let n = 1; n <= 4 && estado === 'reintentar'; n++) {
  estado = await intento(n);
  if (estado === 'reintentar') await new Promise((r) => setTimeout(r, 8000));
}
if (estado !== 'ok') process.exit(1);
