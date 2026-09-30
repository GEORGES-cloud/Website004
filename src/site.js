// Comportamiento comun a todas las paginas. build.mjs lo publica como /assets/site.<hash>.js
// y lo carga con "defer". Cada bloque se activa solo si su elemento esta en la pagina.
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var each = function(list, fn){ Array.prototype.forEach.call(list, fn); };
  // textos de este script en el idioma de la pagina (bloque JSON que escribe build.mjs)
  var T = JSON.parse($('i18n').textContent);

  // menu
  var burger = $('burger');
  var menu   = $('menu');
  burger.addEventListener('click', function(){
    var open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? T.menu_cerrar : T.menu_abrir);
  });

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

    var fallo = function(txt){ qerr.textContent = txt; qerr.hidden = false; return false; };
    var valido = function(n){
      qerr.hidden = true;
      if (n === 0 && !marcados('servicio').length) return fallo(T.q_servicio);
      if (n === 1 && !marcados('zona').length) return fallo(T.q_zona);
      if (n === 3) {
        var falta = [];
        if (!val('q-nombre')) falta.push(T.f_nombre);
        if (!val('q-tel'))    falta.push(T.f_tel);
        if (falta.length) return fallo(T.faltan.replace('{lista}', falta.join(', ')));
        if (!$('q-ok').checked) return fallo(T.consentimiento);
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
        if (!valido(k)) { var aviso = qerr.textContent; ir(k, true); fallo(aviso); return; }
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
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        show(now + (e.key === 'ArrowRight' ? 1 : -1));
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
             '.incl li','.row','.faq details','.more a','.zones li','.closer .wrap > *'].join(',');
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
})();
