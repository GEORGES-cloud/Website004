// Comportamiento comun a todas las paginas. build.mjs lo publica como /assets/site.<hash>.js
// y lo carga con "defer". Cada bloque se activa solo si su elemento esta en la pagina.
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var each = function(list, fn){ Array.prototype.forEach.call(list, fn); };
  // textos de este script en el idioma de la pagina (bloque JSON que escribe build.mjs)
  var T = JSON.parse($('i18n').textContent);

  // hero con vídeo: la foto se pinta primero y el vídeo se añade encima solo si conviene
  // (nada de vídeo con "reducir movimiento", con ahorro de datos o en conexiones lentas).
  // Con la pantalla en vertical se usa la versión vertical, más ligera; si se gira, se cambia.
  // Un botón permite pararlo (y la pausa se respeta aunque la sección se tape y se destape).
  var fondo = document.querySelector('.hero-bg[data-video]');
  var video = null;
  if (fondo) {
    var red = navigator.connection || {};
    var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!quieto && !red.saveData && !/(^|-)(2g|3g)$/.test(red.effectiveType || '')) {
      var v = video = document.createElement('video');
      var vertical = window.matchMedia('(orientation: portrait)');
      var fuente = function(){ return fondo.getAttribute(vertical.matches && fondo.dataset.videoSm ? 'data-video-sm' : 'data-video'); };
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto';
      v.src = fuente();
      v.addEventListener('playing', function(){ v.classList.add('is-on'); });
      fondo.appendChild(v);
      var parado = false;
      // arranca si toca (no parado por la persona, no tapado); devuelve si se ha conseguido
      var arranca = function(){
        if (parado || !v.paused || fondo.parentNode.classList.contains('tapada')) return Promise.resolve(!v.paused);
        var p = v.play();
        return p && p.then ? p.then(function(){ return true; }, function(){ return false; }) : Promise.resolve(!v.paused);
      };
      v.permitido = function(){ return !parado; };
      arranca();
      v.addEventListener('canplay', function(){ arranca(); }, { once: true });
      // si el navegador no deja arrancarlo solo (ahorro de energía, políticas estrictas), lo
      // intenta con cada clic, toque o tecla hasta que lo consigue; mientras tanto se ve la foto
      var gestos = ['click', 'touchend', 'keydown'];
      var conGesto = function(){
        arranca().then(function(ok){ if (ok) gestos.forEach(function(ev){ window.removeEventListener(ev, conGesto); }); });
      };
      gestos.forEach(function(ev){ window.addEventListener(ev, conGesto, { passive: true }); });
      // al girar la pantalla, el vídeo que corresponde a la nueva orientación
      var alGirar = function(){
        var src = fuente();
        if (v.getAttribute('src') === src) return;
        v.classList.remove('is-on');
        v.src = src;
        arranca();
      };
      if (vertical.addEventListener) vertical.addEventListener('change', alGirar);
      // pausa y reproducción (WCAG 2.2.2: todo lo que se mueve más de 5 s se tiene que poder parar)
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'hero-pausa';
      var pinta = function(){
        boton.setAttribute('aria-label', parado ? T.video_play : T.video_pausa);
        boton.setAttribute('aria-pressed', String(parado));
      };
      boton.addEventListener('click', function(){
        parado = !parado;
        if (parado) v.pause(); else arranca();
        pinta();
      });
      pinta();
      fondo.parentNode.appendChild(boton);
    }
  }

  // menu de texto de la cabecera: marca la pagina en la que estamos
  each(document.querySelectorAll('.mh-nav a'), function(a){
    if (a.pathname === location.pathname) a.setAttribute('aria-current', 'page');
  });

  // menu a pantalla completa (movil y tableta). Escape cierra; mientras esta abierto, lo de
  // debajo queda inerte (ni el tabulador ni un lector de pantalla entran ahi).
  var burger = $('burger');
  var menu   = $('menu');
  var debajo = document.querySelectorAll('main, .foot');
  var abrir = function(si){
    var dentro = menu.contains(document.activeElement);
    if (si) { menu.hidden = false; void menu.offsetWidth; menu.classList.add('abierto'); }
    else { menu.classList.remove('abierto'); menu.hidden = true; }
    each(debajo, function(el){ el.inert = si; });
    document.documentElement.classList.toggle('menu-abierto', si);
    burger.setAttribute('aria-expanded', String(si));
    burger.setAttribute('aria-label', si ? T.menu_cerrar : T.menu_abrir);
    if (!si && dentro) burger.focus();
  };
  burger.addEventListener('click', function(){ abrir(menu.hidden); });
  document.addEventListener('keydown', function(e){
    if (menu.hidden) return;
    if (e.key === 'Escape') { abrir(false); burger.focus(); return; }
    if (e.key === 'Tab' && !e.shiftKey) {
      var enlaces = menu.querySelectorAll('a');
      if (document.activeElement === enlaces[enlaces.length - 1]) { e.preventDefault(); burger.focus(); }
    }
  });
  // al pasar a escritorio el menu de texto ya esta a la vista
  window.addEventListener('resize', function(){ if (!menu.hidden && window.innerWidth >= 1080) abrir(false); });

  // selector de idioma de la cabecera (<details>): se cierra al tocar fuera o con Escape
  each(document.querySelectorAll('details.lang'), function(d){
    document.addEventListener('click', function(e){ if (d.open && !d.contains(e.target)) d.open = false; });
    d.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary').focus(); }
    });
  });

  // boton flotante de WhatsApp: con el saludo en el idioma de la pagina. En la portada aparece
  // al dejar atras el hero (alli ya estan los botones principales y taparia "Que hacemos").
  var waf = $('wa-flota');
  if (waf) {
    waf.href = waf.href.split('?')[0] + '?text=' + encodeURIComponent(T.wa_hola);
    var heroSec = document.querySelector('.hero');
    var verWa = function(){
      var si = !heroSec || window.scrollY > heroSec.offsetHeight * 0.55;
      if (si !== waf.classList.contains('visible')) waf.classList.toggle('visible', si);
    };
    document.documentElement.classList.add('wa-js');
    verWa();
    window.addEventListener('scroll', verWa, { passive: true });
    window.addEventListener('resize', verWa, { passive: true });
  }

  // presupuesto: cuestionario por pasos. El servidor manda la solicitud por correo a Luxor
  // (POST /api/presupuesto); el enlace de WhatsApp lleva siempre lo contestado hasta el momento.
  var quiz = $('quiz');
  if (quiz) {
    var steps = quiz.querySelectorAll('fieldset');
    var back = $('quiz-back'), next = $('quiz-next'), send = $('quiz-send');
    var qerr = $('quiz-error'), wa = $('quiz-wa'), waBase = wa.href.split('?')[0];
    var paso = 0;

    // opciones marcadas: "valor" va en español (es lo que lee Luxor) y "texto" en el idioma de la pagina
    var marcados = function(nombre){
      return Array.prototype.map.call(quiz.querySelectorAll('input[name="' + nombre + '"]:checked'), function(i){
        return { valor: i.value, texto: i.parentNode.querySelector('b').textContent };
      });
    };
    var lista = function(arr, campo){ return arr.map(function(o){ return o[campo]; }).join(', '); };
    var val = function(id){ return $(id).value.trim(); };

    var ponWa = function(){
      var l = [T.wa_saludo], s = marcados('servicio'), z = marcados('zona'), p = marcados('plazo');
      if (s.length) l.push(T.wa_serv + ': ' + lista(s, 'texto'));
      if (z.length) l.push(T.wa_zona + ': ' + lista(z, 'texto'));
      if (p.length) l.push(T.wa_plazo + ': ' + lista(p, 'texto'));
      if (val('q-mensaje')) l.push(val('q-mensaje'));
      if (val('q-nombre')) l.push(T.wa_nombre + ': ' + val('q-nombre'));
      wa.href = waBase + '?text=' + encodeURIComponent(l.join('\n'));
    };

    // el, si se pasa, es el campo que hay que corregir: se le da el foco
    var fallo = function(txt, el){ qerr.textContent = txt; qerr.hidden = false; if (el) el.focus(); return false; };
    var valido = function(n){
      qerr.hidden = true;
      if (n === 0 && !marcados('servicio').length) return fallo(T.q_servicio);
      if (n === 1 && !marcados('zona').length) return fallo(T.q_zona);
      if (n === 3) {
        var falta = [];
        if (!val('q-nombre')) falta.push(T.f_nombre);
        if (!val('q-tel'))    falta.push(T.f_tel);
        if (falta.length) return fallo(T.faltan.replace('{lista}', falta.join(', ')), $(val('q-nombre') ? 'q-tel' : 'q-nombre'));
        // las mismas comprobaciones que hace server.mjs: si no, un 400 se mostraría como un fallo del envío
        if (!/^[+\d][\d\s().-]{5,}$/.test(val('q-tel'))) return fallo(T.tel_mal, $('q-tel'));
        if (val('q-mail') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('q-mail'))) return fallo(T.mail_mal, $('q-mail'));
        if (!$('q-ok').checked) return fallo(T.consentimiento, $('q-ok'));
      }
      return true;
    };
    var ir = function(n, foco){
      paso = n;
      each(steps, function(f, k){ f.classList.toggle('is-on', k === n); });
      $('quiz-count').textContent = T.paso.replace('{n}', n + 1).replace('{total}', steps.length);
      $('quiz-fill').style.width = ((n + 1) / steps.length * 100) + '%';
      back.hidden = n === 0;
      next.hidden = n === steps.length - 1;
      send.hidden = n !== steps.length - 1;
      qerr.hidden = true;
      if (foco) steps[n].querySelector('legend').focus();
    };

    next.addEventListener('click', function(){ if (valido(paso)) ir(paso + 1, true); });
    back.addEventListener('click', function(){ ir(paso - 1, true); });
    quiz.addEventListener('change', ponWa);
    quiz.addEventListener('input', ponWa);
    // en el paso de la zona (una sola respuesta) elegir con raton o dedo avanza solo;
    // con teclado no, porque las flechas cambian la seleccion mientras se recorre la lista
    each(quiz.querySelectorAll('input[name="zona"]'), function(r){
      r.addEventListener('click', function(e){
        if (e.detail > 0 && paso === 1) setTimeout(function(){ if (paso === 1) ir(2, true); }, 220);
      });
    });

    quiz.addEventListener('submit', function(e){
      e.preventDefault();
      // Intro en un campo de un paso intermedio equivale a "Siguiente"
      if (paso < steps.length - 1) { if (valido(paso)) ir(paso + 1, true); return; }
      for (var k = 0; k < steps.length; k++) {
        if (!valido(k)) { if (k !== paso) { var aviso = qerr.textContent; ir(k, true); fallo(aviso); } return; }
      }
      var nombre = val('q-nombre'), rotulo = send.textContent;
      var datos = {
        nombre: nombre, telefono: val('q-tel'), email: val('q-mail'),
        servicio: lista(marcados('servicio'), 'valor'),
        zona: lista(marcados('zona'), 'valor'),
        plazo: lista(marcados('plazo'), 'valor'),
        mensaje: val('q-mensaje'),
        comercial: $('q-ok2').checked,
        idioma: document.documentElement.lang,
        web: $('q-web').value
      };
      send.disabled = true; send.textContent = T.enviando;
      fetch('/api/presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      }).then(function(r){
        if (!r.ok) throw new Error(r.status);
        $('done-name').textContent = nombre.split(' ')[0];
        quiz.hidden = true;
        $('quiz-done').hidden = false;
        $('quiz-done').focus();
      }).catch(function(){
        // si el correo falla, que la solicitud no se pierda: WhatsApp con los datos ya escritos
        ponWa();
        var a = document.createElement('a');
        a.href = wa.href; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = T.error_wa;
        qerr.textContent = T.error_antes + ' ';
        qerr.appendChild(a);
        qerr.appendChild(document.createTextNode(' ' + T.error_despues));
        qerr.hidden = false;
        send.disabled = false; send.textContent = rotulo;
      });
    });

    // llegada desde la pagina de un servicio: ?s=alquileres deja marcada esa opcion
    var pre = /[?&]s=([\w-]+)/.exec(location.search);
    if (pre && quiz.querySelector('input[data-k="' + pre[1] + '"]')) quiz.querySelector('input[data-k="' + pre[1] + '"]').checked = true;
    ir(0);
    ponWa();
  }

  // explorador de servicios: una pestaña por linea; dentro de cada una, la lista y los
  // puntos de la foto van enlazados (activar uno activa el otro y muestra su explicacion).
  var sx = $('svcx');
  if (sx) {
    var svcs = sx.querySelectorAll('.svc');
    var tabs = sx.querySelectorAll('.svc-tab');
    var now = 0;
    var pick = function(svc, i){
      each(svc.querySelectorAll('.it'), function(b, n){
        b.setAttribute('aria-pressed', String(n === i));
        if (n === i) svc.querySelector('.svc-note').textContent = b.querySelector('span').textContent;
      });
      each(svc.querySelectorAll('.dot'), function(d, n){ d.classList.toggle('is-on', n === i); });
    };
    var show = function(n){
      now = (n + svcs.length) % svcs.length;
      each(svcs, function(s, k){ s.classList.toggle('is-on', k === now); });
      each(tabs, function(t, k){ t.setAttribute('aria-selected', String(k === now)); t.tabIndex = k === now ? 0 : -1; });
    };
    each(svcs, function(svc, k){
      svc.setAttribute('role', 'tabpanel');
      svc.setAttribute('aria-label', tabs[k].textContent);
      each(svc.querySelectorAll('.it'), function(b, i){
        ['click','mouseenter','focus'].forEach(function(ev){ b.addEventListener(ev, function(){ pick(svc, i); }); });
      });
      each(svc.querySelectorAll('.dot'), function(d, i){
        ['click','mouseenter'].forEach(function(ev){ d.addEventListener(ev, function(){ pick(svc, i); }); });
      });
      pick(svc, 0);
    });
    each(tabs, function(t, k){
      t.addEventListener('click', function(){ show(k); });
      t.addEventListener('keydown', function(e){
        // en escritorio las pestañas van en columna: tambien valen las flechas arriba y abajo
        var paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!paso) return;
        e.preventDefault();
        show(now + paso);
        tabs[now].focus();
      });
    });
    // deslizar la foto con el dedo pasa a la linea siguiente o a la anterior
    var x0 = null;
    sx.addEventListener('touchstart', function(e){
      x0 = e.target.closest('.svc-photo') ? e.touches[0].clientX : null;
    }, { passive: true });
    sx.addEventListener('touchend', function(e){
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(now + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
  }

  // bloque de dos fotos: pase lento. Cada panel avanza cada 6 s; el segundo arranca 3 s despues.
  var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD = 6000;
  each(document.querySelectorAll('.slides'), function(box, n){
    var frames = box.querySelectorAll('img');
    if (frames.length < 2 || quiet) return;
    var cur = 0;
    function next(){
      frames[cur].classList.remove('is-on');
      cur = (cur + 1) % frames.length;
      var f = frames[cur];
      f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';   // reinicia la deriva a oscuras
      f.classList.add('is-on');
    }
    setTimeout(function(){ next(); setInterval(next, HOLD); }, HOLD + n * HOLD / 2);
  });

  // revelado al hacer scroll: los bloques entran con un leve fundido hacia arriba,
  // escalonados entre hermanos (80 ms, tope 400 ms). El hero queda fuera: ya tiene su propio movimiento.
  var SEL = ['.pledges .wrap > div','.about-copy > *','.rev-col > *','.ben','.grid-head > *','.svcx',
             '.duo-title > *','.duo .shot','.incl li','.row','.faq details','.more a','.zones li','.closer .wrap > *'].join(',');
  var els = document.querySelectorAll(SEL);
  if (!quiet && 'IntersectionObserver' in window && els.length) {
    var count = new Map();
    each(els, function(el){
      var k = count.get(el.parentNode) || 0; count.set(el.parentNode, k + 1);
      el.style.setProperty('--d', Math.min(k * 80, 400) + 'ms');
      el.classList.add('rv');
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    each(els, function(el){ io.observe(el); });

    // red de seguridad: si el observer no llega a disparar, un chequeo por scroll
    // (con temporizador, no con rAF) revela lo que ya esta dentro del viewport.
    var pending = null;
    function sweep(){
      pending = null;
      var limit = window.innerHeight * 0.92;
      each(document.querySelectorAll('.rv:not(.in)'), function(el){
        var r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); }
      });
    }
    function onScroll(){ if (!pending) pending = setTimeout(sweep, 120); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setTimeout(sweep, 400);
  }

  // secciones que se apilan: cada <section> de <main> se queda fija (sticky) cuando asoma su final
  // —o arriba, bajo la cabecera, si cabe entera— y la siguiente sube por encima. La de debajo se
  // oscurece y se aleja un poco. Las cuentas usan la posicion natural de cada seccion (suma de
  // altos), no la pintada, asi que no dependen de lo que ya esta fijo.
  // Las secciones con mucho texto que se busca o se enlaza (preguntas frecuentes, textos legales,
  // cuestionario) no se fijan: si el navegador salta a una frase suya (buscar en la pagina, enlaces
  // de Google a un fragmento), tiene que quedar a la vista y no debajo de la seccion siguiente.
  var secs = document.querySelectorAll('main > section');
  if (!quiet && secs.length > 1 && window.CSS && CSS.supports('position', 'sticky')) {
    var cab = document.querySelector('.masthead'), principal = document.querySelector('main');
    // alto de la pantalla con las barras del navegador a la vista (svh): asi nunca queda texto sin ver
    var sonda = document.createElement('div');
    sonda.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(sonda);
    var capas = [], cabH = 0;
    // el video del hero se para mientras esta tapado (salvo que la persona lo haya parado antes)
    var pausaVideo = function(d, p){
      if (!video || !d.s.contains(video)) return;
      if (p >= 1) { if (!video.paused) video.pause(); }
      else if (video.paused && video.permitido()) { var r = video.play(); if (r && r.catch) r.catch(function(){}); }
    };
    var pintar = function(){
      var y = window.scrollY;
      for (var i = 0; i < capas.length - 1; i++) {
        var d = capas[i];
        if (d.suelta) continue;
        var p = d.l > 0 ? (y - d.a) / d.l : (y >= d.a ? 1 : 0);
        p = Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000;
        if (p === d.p) continue;
        d.p = p;
        d.s.style.setProperty('--cover', p);
        d.s.classList.toggle('tapando', p > 0 && p < 1);
        d.s.classList.toggle('tapada', p >= 1);
        pausaVideo(d, p);
      }
    };
    var medir = function(){
      var alto = sonda.offsetHeight;
      cabH = cab ? cab.offsetHeight : 0;
      var y = principal.getBoundingClientRect().top + window.scrollY;
      capas = Array.prototype.map.call(secs, function(s){
        var h = s.offsetHeight, fija = Math.min(cabH, alto - h), arriba = Math.max(cabH, fija);
        var d = { s: s, n: y, h: h, a: y - fija, l: fija + h - arriba, p: -1, suelta: !!s.querySelector('.faq, .prose, .quiz') };
        s.classList.toggle('suelta', d.suelta);
        s.style.setProperty('--stick', fija + 'px');
        s.style.setProperty('--oy', Math.round((arriba + fija + h) / 2 - fija) + 'px');
        y += h;
        return d;
      });
      pintar();
    };
    var enCola = false, medirEnCola = false;
    var alScroll = function(){ if (!enCola) { enCola = true; requestAnimationFrame(function(){ enCola = false; pintar(); }); } };
    var remedir = function(){ if (!medirEnCola) { medirEnCola = true; requestAnimationFrame(function(){ medirEnCola = false; medir(); }); } };
    document.documentElement.classList.add('stack');
    medir();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', remedir);
    window.addEventListener('load', remedir);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(remedir); each(secs, function(s){ ro.observe(s); }); }
    // el foco del teclado entra en una seccion ya tapada: se vuelve a ella para que se vea
    document.addEventListener('focusin', function(e){
      for (var i = 0; i < capas.length; i++) {
        var d = capas[i];
        if (d.p > 0.02 && d.s.contains(e.target)) {
          var esc = d.s.classList.contains('tapando') ? 1 - d.p * 0.06 : 1;
          var off = (e.target.getBoundingClientRect().top - d.s.getBoundingClientRect().top) / esc;
          window.scrollTo({ top: Math.max(0, Math.min(d.a, d.n + off - cabH - 24)), behavior: 'instant' });
          return;
        }
      }
    });
  }
})();
