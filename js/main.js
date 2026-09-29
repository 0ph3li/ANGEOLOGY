/* =========================================================
   ANGEOLOGY — main.js (shared by every page)
   Page scripts (home.js, shop.js …) load after this file and use window.A.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (hasGsap && window.Flip) gsap.registerPlugin(Flip);
  const motion = hasGsap && !reduced;

  /* ---------- image slots: load img/<name>, keep placeholder if missing ---------- */
  function fillSlot(slot) {
    const name = slot.dataset.img;
    if (slot.dataset.ratio) slot.style.setProperty('--ratio', slot.dataset.ratio);
    const old = slot.querySelector('img');
    if (old) old.remove();
    slot.classList.remove('has-img');
    if (!name) return;
    const img = new Image();
    img.alt = slot.dataset.alt || '';
    slot._pending = img;                       // only the latest request may land (avoids stale images)
    img.onload = () => {
      if (slot._pending !== img) return;
      slot.querySelectorAll('img').forEach((o) => o.remove());
      img.style.filter = slot.dataset.tint || '';
      slot.appendChild(img); slot.classList.add('has-img');
    };
    img.src = 'img/' + name;
  }
  $$('.slot').forEach(fillSlot);

  /* ---------- nav: scrolled state, gliding heart, menu built from the same links ---------- */
  const topnav = $('#topnav');
  const onScrollNav = () => topnav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const heart = $('#navHeart');
  const navEl = $('.topnav nav');
  $$('#navLinks a').forEach((a) => {
    a.addEventListener('mouseenter', () => {
      const r = a.getBoundingClientRect(), n = navEl.getBoundingClientRect();
      heart.style.transform = `translateX(${r.left - n.left + r.width / 2 - 5}px)`;
    });
  });

  const menuList = $('#menuList');
  $$('#navLinks li').forEach((li) => menuList.appendChild(li.cloneNode(true)));
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const toggleMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.addEventListener('click', () => toggleMenu(true));
  $('#menuClose').addEventListener('click', () => toggleMenu(false));
  menu.addEventListener('click', (e) => { if (e.target === menu || e.target.closest('a')) toggleMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- bag: kept in localStorage, count shown in the nav on every page ---------- */
  const BAG_KEY = 'angeology-bag';
  const readBag = () => { try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch (e) { return []; } };
  const writeBag = (b) => { try { localStorage.setItem(BAG_KEY, JSON.stringify(b)); } catch (e) {} };
  const bagCount = () => readBag().reduce((n, it) => n + it.qty, 0);
  function paintBag() {
    const n = bagCount();
    $$('a[href="cart.html"]').forEach((a) => {
      a.querySelectorAll('.t, .s').forEach((el) => { el.textContent = el.classList.contains('t') ? `Bag (${n})` : `bag (${n})`; });
    });
  }
  const bag = {
    items: readBag,
    count: bagCount,
    add(id, shade, qty = 1) {
      const b = readBag();
      const hit = b.find((it) => it.id === id && it.shade === shade);
      if (hit) hit.qty += qty; else b.push({ id, shade, qty });
      writeBag(b); paintBag();
      $$('a[href="cart.html"]').forEach((a) => a.classList.remove('bump'));
      requestAnimationFrame(() => $$('a[href="cart.html"]').forEach((a) => a.classList.add('bump')));
      return bagCount();
    },
    set(id, shade, qty) {                            // qty 0 removes the line
      let b = readBag();
      const hit = b.find((it) => it.id === id && it.shade === shade);
      if (hit) hit.qty = qty;
      b = b.filter((it) => it.qty > 0);
      writeBag(b); paintBag();
      return bagCount();
    },
    reshade(id, from, to) {                          // switch a line to another shade (merging if it already exists)
      let b = readBag();
      const line = b.find((it) => it.id === id && it.shade === from);
      if (!line || from === to) return;
      const other = b.find((it) => it.id === id && it.shade === to);
      if (other) { other.qty += line.qty; b = b.filter((it) => it !== line); } else line.shade = to;
      writeBag(b); paintBag();
    },
    clear() { writeBag([]); paintBag(); },
  };
  // other small things kept on this device only
  const store = {
    get(key, fallback = null) { try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch (e) { return fallback; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} },
  };
  paintBag();
  addEventListener('storage', (e) => { if (e.key === BAG_KEY) paintBag(); });

  /* ---------- falling feathers (faux — only pictures ♡) ---------- */
  const feathers = $('#feathers');
  if (feathers && !reduced) {
    for (let i = 0; i < 6; i++) {
      const f = document.createElement('img');
      f.src = 'img/deco/feather.png'; f.alt = ''; f.className = 'feather';
      f.style.left = (6 + i * 16 + Math.random() * 6) + '%';
      f.style.width = (36 + Math.random() * 36) + 'px';
      f.style.animationDuration = (15 + Math.random() * 10) + 's';
      f.style.animationDelay = (-Math.random() * 20) + 's';
      feathers.appendChild(f);
    }
  }

  /* ---------- run a rAF loop only while an element is on screen ---------- */
  function loopWhileVisible(el, fn) {
    let raf = null, last = 0;
    const tick = (t) => { const dt = Math.min(64, t - (last || t)); last = t; fn(dt); raf = requestAnimationFrame(tick); };
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(el);
  }

  /* ---------- satin ribbon text (speeds up when you scroll) ---------- */
  const rText = $('#ribbonText');
  if (rText && !reduced) {
    let off = 0, half = 0, boost = 0, lastY = scrollY;
    const measure = () => { half = rText.parentNode.getComputedTextLength() / 2; };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
    addEventListener('scroll', () => { boost = Math.min(8, Math.abs(scrollY - lastY) * .15); lastY = scrollY; }, { passive: true });
    loopWhileVisible($('.ribbon'), (dt) => {
      if (!half) measure();
      off -= (0.05 + boost * .08) * dt;
      boost *= .92;
      if (off < -half) off += half;
      rText.setAttribute('startOffset', off);
    });
  }

  /* ---------- recolour a product photo: hue / saturation / lightness shift from its base colour ---------- */
  const hsl = (hex) => {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0; const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function tintFilter(base, target) {
    if (base === target) return '';
    const [bh, bs, bl] = hsl(base), [th, ts, tl] = hsl(target);
    let dh = th - bh; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
    return `hue-rotate(${dh.toFixed(0)}deg) saturate(${clamp(ts / Math.max(bs, .05), .3, 3).toFixed(2)}) brightness(${clamp(tl / Math.max(bl, .05), .8, 1.25).toFixed(2)})`;
  }

  /* ---------- split dictionary definitions into words ---------- */
  let wi = 0;
  $$('[data-split]').forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', wi++); s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- CSS reveals ----------
     Text is visible by default. Only elements still below the fold get the
     'pre' state, and several independent triggers bring them back, so nothing
     can stay hidden (background tabs, missed observer callbacks, fast scroll). */
  const pending = new Set();
  const reveal = (el) => { el.classList.remove('pre'); pending.delete(el); };
  if (!reduced && !document.hidden) {
    $$('.reveal, .defs').forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight * .9) { el.classList.add('pre'); pending.add(el); }
    });
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px' });
  pending.forEach((el) => io.observe(el));
  const sweep = () => pending.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * .96) reveal(el); });
  addEventListener('scroll', () => { if (pending.size) requestAnimationFrame(sweep); setTimeout(sweep, 400); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pending.forEach(reveal); });

  /* ---------- loader pearls ---------- */
  const lp = $('#loaderPearls');
  const loader = $('#loader');
  const LP_N = 11;
  for (let i = 0; i < LP_N; i++) {
    const t = i / (LP_N - 1);
    const p = document.createElement('img');
    p.src = 'img/deco/pearl.png'; p.alt = '';
    p.style.left = t * 100 + '%';
    p.style.top = Math.sin(t * Math.PI) * 55 + 10 + '%';
    lp.appendChild(p);
  }

  /* =========================================================
     LOADER → HERO INTRO → SCROLL EFFECTS
     ========================================================= */
  const count = $('#loaderCount');
  document.body.classList.add('is-loading');

  function runLoader() {
    return new Promise((resolve) => {
      const pearls = $$('img', lp);
      const start = performance.now();
      const dur = reduced ? 300 : (document.body.dataset.loader === 'short' ? 900 : 1800);
      let loaded = document.readyState === 'complete';
      addEventListener('load', () => loaded = true);
      setTimeout(() => { loaded = true; }, 4000);           // never wait forever
      const step = () => {
        let k = Math.min(1, (performance.now() - start) / dur);
        if (!loaded) k = Math.min(k, .9);
        count.textContent = Math.round(k * 100);
        pearls.forEach((p, i) => p.classList.toggle('on', k >= (i + 1) / pearls.length - .001));
        if (k < 1) setTimeout(step, 30); else setTimeout(resolve, 250);
      };
      step();
    });
  }

  function hideLoader() {
    document.body.classList.remove('is-loading');
    setTimeout(() => { loader.style.display = 'none'; }, 2200);  // safety net
    if (motion) {
      return gsap.timeline()
        .to('.loader-inner', { y: -30, opacity: 0, duration: .4, ease: 'power2.in' })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power3.inOut' }, '-=.1')
        .set(loader, { display: 'none' });
    }
    loader.style.display = 'none';
    return Promise.resolve();
  }

  function when(trigger, fn, start = 'top 78%') {
    // from-states are applied only when the section is reached, so nothing is ever hidden in advance,
    // and whatever they start is forced to its end state after a few seconds if frames were throttled
    if (!motion || !window.ScrollTrigger) return;
    ScrollTrigger.create({ trigger, start, once: true, onEnter: () => {
      const before = new Set(gsap.globalTimeline.getChildren(false, true, true));
      fn();
      const mine = gsap.globalTimeline.getChildren(false, true, true).filter((t) => !before.has(t));
      setTimeout(() => mine.forEach((t) => { if (t.progress() < 1) t.progress(1); }), 4500);
    } });
  }
  // a timeline that can never leave things half-hidden when frames are throttled
  function safeTimeline(opts) {
    const tl = gsap.timeline(opts);
    requestAnimationFrame(() => setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, (tl.duration() + (tl.delay() || 0)) * 1000 + 1200));
    return tl;
  }

  if ($('.ribbon')) when('.ribbon', () => gsap.from('.ribbon-band, .ribbon-stitch', { strokeDasharray: '0 3000', duration: 2, ease: 'power2.inOut',
    onComplete: () => gsap.set('.ribbon-band, .ribbon-stitch', { clearProps: 'strokeDasharray' }) }), 'top 92%');

  window.A = { $, $$, reduced, motion, fillSlot, tintFilter, loopWhileVisible, when, safeTimeline, bag, store, intro: null };

  runLoader().then(async () => {
    if (motion && !document.hidden) {
      const tl = safeTimeline({ delay: .5 });
      tl.from('#navLinks li', { y: -14, opacity: 0, duration: .5, stagger: .03, ease: 'power3.out' });
    }
    if (typeof A.intro === 'function') A.intro();   // page intro: from-states apply now, playback starts while the loader lifts
    await hideLoader();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
