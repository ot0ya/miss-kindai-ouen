/* ミス近大 応援プラン 営業ガイド: 動きの制御 */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* 見出しを1文字ずつ分ける */
  var h1 = $('#h1');
  if (h1) {
    var txt = h1.textContent;
    h1.textContent = '';
    h1.classList.add('split');
    Array.from(txt).forEach(function (c, i) {
      var s = document.createElement('span');
      s.textContent = c === ' ' ? ' ' : c;
      s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      h1.appendChild(s);
    });
  }

  /* 順番に現れる */
  var groups = {};
  $$('.rv').forEach(function (el) {
    var p = el.parentElement;
    var k = groups.__last === p ? groups.__n++ : (groups.__n = 0);
    groups.__last = p;
    el.style.setProperty('--d', Math.min(k, 6) * 0.08 + 's');
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); onShown(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .flow-track, .checks').forEach(function (el) { io.observe(el); });

  function onShown(el) {
    $$('[data-count]', el).concat(el.hasAttribute && el.hasAttribute('data-count') ? [el] : []).forEach(countUp);
    if (el.classList.contains('checks')) $$('li', el).forEach(function (li, i) { li.style.setProperty('--k', i); });
  }
  $$('.checks li').forEach(function (li, i) { li.style.setProperty('--k', i); });

  /* 数字のカウントアップ */
  function countUp(el) {
    if (el.__done) return; el.__done = true;
    var to = Number(el.getAttribute('data-count')), start = null, dur = 1400;
    if (reduce || !isFinite(to)) return;
    function f(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  $$('[data-count]').forEach(function (el) {
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(el); o.disconnect(); } }); }, { threshold: .6 });
    o.observe(el);
  });

  /* 進捗バー・ナビ */
  var bar = $('#bar'), nav = $('#nav');
  var secs = $$('main section[id]');
  var links = $$('#nav nav a');
  function onScroll() {
    var h = document.documentElement;
    var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100).toFixed(2) + '%';
    nav.classList.toggle('show', h.scrollTop > window.innerHeight * 0.6);
    var cur = null;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = s.id; });
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
    parallax(); hscroll();
  }

  /* パララックス */
  var pars = $$('.par img');
  function parallax() {
    if (reduce) return;
    pars.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.setProperty('--py', (-c * 46).toFixed(1) + 'px');
    });
  }

  /* フェーズの横スクロール(広い画面だけ) */
  var hs = $('#hs'), track = $('#hsTrack'), dots = $$('#phDots li');
  var cards = $$('.ph-card');
  hs.style.setProperty('--n', cards.length);
  function wide() { return window.innerWidth > 900 && !reduce; }
  function hscroll() {
    if (!wide()) { track.style.transform = ''; return; }
    var r = hs.getBoundingClientRect();
    var total = hs.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / total));
    var max = track.scrollWidth - window.innerWidth + 40;
    track.style.transform = 'translateX(' + (-p * Math.max(0, max)).toFixed(1) + 'px)';
    var idx = Math.min(cards.length - 1, Math.round(p * (cards.length - 1)));
    dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
  }

  var tick = false;
  window.addEventListener('scroll', function () {
    if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; onScroll(); }); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* 営業で伝えること: 番号が切り替わる */
  var steps = $$('.step'), no = $('#talkNo');
  if (steps.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          steps.forEach(function (s) { s.classList.toggle('on', s === e.target); });
          var n = e.target.getAttribute('data-n');
          if (no.textContent !== n) {
            no.textContent = n; no.classList.add('bump');
            setTimeout(function () { no.classList.remove('bump'); }, 320);
          }
        }
      });
    }, { rootMargin: '-38% 0px -38% 0px' });
    steps.forEach(function (s) { so.observe(s); });
    steps[0].classList.add('on');
  }

  /* アコーディオン */
  $$('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
    });
  });

  /* カーソルの光・磁石ボタン・傾くカード */
  var root = document.documentElement;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var mx = 50, my = 30, tx = 50, ty = 30;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / window.innerWidth * 100; ty = e.clientY / window.innerHeight * 100;
    }, { passive: true });
    (function loop() {
      mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
      root.style.setProperty('--mx', mx.toFixed(2) + '%'); root.style.setProperty('--my', my.toFixed(2) + '%');
      requestAnimationFrame(loop);
    })();
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    $$('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  } else {
    root.style.setProperty('--mx', '50%'); root.style.setProperty('--my', '30%');
  }

  /* 表紙の光の粒 */
  var cv = $('#sparks');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), ps = [], ptr = { x: -999, y: -999 }, run = true;
    var cols = ['121,134,190', '175,133,224', '231,164,191', '244,198,220'];
    function size() {
      var r = cv.parentElement.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, W * H / 16000));
      ps = [];
      for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: Math.random() * H, r: 2 + Math.random() * 7, vx: (Math.random() - .5) * .25, vy: -.1 - Math.random() * .35, c: cols[i % cols.length], a: .25 + Math.random() * .4, ph: Math.random() * 6.28 });
    }
    size(); window.addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
    new IntersectionObserver(function (es) { run = es[0].isIntersecting; if (run) frame(); }).observe(cv);
    function frame() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      var t = performance.now() / 1000;
      ps.forEach(function (p) {
        var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * 2.2, d = Math.sqrt(d2) || 1; p.x += dx / d * f; p.y += dy / d * f; }
        p.x += p.vx + Math.sin(t + p.ph) * .25; p.y += p.vy;
        if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
        if (p.x < -12) p.x = W + 12; if (p.x > W + 12) p.x = -12;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.4);
        g.addColorStop(0, 'rgba(' + p.c + ',' + p.a + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.4, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* URLのコピー */
  var cb = $('#copyForm'), st = $('#copyState'), lk = $('#formlink');
  if (cb) cb.addEventListener('click', function () {
    var t = lk.href;
    function fb() { var r = document.createRange(); r.selectNodeContents(lk); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = '選択しました。コピーしてください。'; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { st.textContent = 'コピーしました。'; }, fb);
    } else fb();
  });
})();
