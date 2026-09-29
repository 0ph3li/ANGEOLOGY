/* =========================================================
   ANGEOLOGY — home.js (index.html only; needs main.js + products.js)
   ========================================================= */
(() => {
  const { $, $$, reduced, motion, fillSlot, tintFilter, loopWhileVisible } = A;

  /* ---------- halo orbit: the six bestsellers with photos ---------- */
  const products = ANGEOLOGY_PRODUCTS.filter((p) => p.orbit).sort((a, b) => a.orbit - b.orbit);
  const stage = $('#orbitStage');
  const info = $('#orbitInfo');
  const coreSlot = $('#coreSlot');
  const orbs = products.map((p, i) => {
    const b = document.createElement('button');
    b.className = 'orb'; b.type = 'button';
    b.setAttribute('aria-label', p.name);
    b.innerHTML = `<span class="orb-img"><span class="slot cutout" data-img="${p.img}" data-alt="${p.name}" data-ratio="1 / 1"><span class="slot-label">${p.img}</span></span></span><span class="orb-name">${p.name}</span>`;
    stage.appendChild(b);
    fillSlot(b.querySelector('.slot'));
    b.addEventListener('click', () => selectProduct(i));
    return b;
  });

  function renderInfo(i) {
    const p = products[i];
    $('.oi-num', info).textContent = `n° ${String(i + 1).padStart(2, '0')} / ${String(products.length).padStart(2, '0')}`;
    $('.oi-name', info).textContent = p.name;
    $('.oi-latin', info).innerHTML = `<i>${p.latin}</i>`;
    $('.oi-desc', info).textContent = p.desc;
    $('.oi-price', info).textContent = `€ ${p.price}`;
    const sel = p.sel || 0;
    $('.oi-shades', info).innerHTML = p.shades.map(([n, c], k) =>
      `<button type="button" class="${k === sel ? 'on' : ''}" style="background:${c}" data-k="${k}" aria-label="${p.label} ${n}" aria-pressed="${k === sel}"></button>`).join('');
    $('.oi-shade-name', info).textContent = `${p.label}: ${p.shades[sel][0]}`;
    coreSlot.dataset.tint = tintFilter(p.shades[0][1], p.shades[sel][1]);
    coreSlot.dataset.img = p.img;
    coreSlot.dataset.alt = p.name;
    $('.slot-label', coreSlot).textContent = `img/${p.img}`;
    fillSlot(coreSlot);
    orbs.forEach((o, k) => o.classList.toggle('active', k === i));
  }
  let current = 0;
  function selectProduct(i) {
    if (i === current) return;
    current = i;
    if (motion) {
      const tl = gsap.timeline();
      tl.to([info.children, '.core-circle'], { opacity: 0, y: 10, duration: .22, stagger: .015 })
        .add(() => renderInfo(i))
        .to([info.children, '.core-circle'], { opacity: 1, y: 0, duration: .45, stagger: .03, ease: 'power3.out' })
        .fromTo('.core-halo', { scale: .6 }, { scale: 1, duration: .8, ease: 'elastic.out(1, .5)' }, '<');
      setTimeout(() => tl.progress(1), 1600); // never leave the text half-faded
    } else renderInfo(i);
  }
  renderInfo(0);

  info.addEventListener('click', (e) => {
    const b = e.target.closest('.oi-shades button');
    if (!b) return;
    const p = products[current], k = +b.dataset.k;
    $$('.oi-shades button', info).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $('.oi-shade-name', info).textContent = `${p.label}: ${p.shades[k][0]}`;
    p.sel = k;
    const f = tintFilter(p.shades[0][1], p.shades[k][1]);
    [coreSlot, orbs[current].querySelector('.slot')].forEach((sl) => { sl.dataset.tint = f; const img = sl.querySelector('img'); if (img) img.style.filter = f; });
    if (motion) gsap.fromTo('.core-circle', { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
  });

  let angle = 0, hover = false;
  stage.addEventListener('pointerenter', () => hover = true);
  stage.addEventListener('pointerleave', () => hover = false);
  function placeOrbs() {
    const w = stage.clientWidth, h = stage.clientHeight;
    orbs.forEach((o, i) => {
      const a = angle + (i / orbs.length) * Math.PI * 2;
      const depth = (Math.sin(a) + 1) / 2;            // 0 back … 1 front
      const x = w / 2 + Math.cos(a) * w * (w < 500 ? .34 : .43) - o.offsetWidth / 2;   // tighter orbit on phones so labels stay on screen
      const y = h / 2 + Math.sin(a) * h * .36 - o.offsetHeight / 2;
      o.style.transform = `translate(${x}px, ${y}px) scale(${.78 + depth * .3})`;
      o.style.zIndex = depth > .5 ? 30 : 10;
    });
  }
  placeOrbs();
  addEventListener('resize', placeOrbs);
  if (!reduced) loopWhileVisible(stage, (dt) => { angle += (hover ? .00003 : .00016) * dt; placeOrbs(); });

  /* ---------- tarot cards flip ---------- */
  $$('[data-card]').forEach((c) => {
    const flip = (e) => {
      if (e.target.closest('a')) return;
      c.classList.toggle('flipped');
      c.setAttribute('aria-pressed', c.classList.contains('flipped'));
    };
    c.addEventListener('click', flip);
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(e); } });
  });

  /* ---------- sweet / sour compare ---------- */
  const compare = $('#compare');
  const range = $('#cmpRange');
  const setPos = (v) => compare.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => setPos(range.value));

  /* ---------- letters form (no data is sent anywhere yet) ---------- */
  const form = $('#letterForm');
  const msg = $('#letterMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#email');
    if (!email.value || !email.checkValidity()) { msg.textContent = 'Hmm, that address looks a little lost ♡'; return; }
    msg.textContent = 'Your letter is flying to heaven…';
    const done = () => { msg.textContent = 'Received! An angel will write back soon ♡'; form.reset(); };
    if (motion) {
      gsap.timeline({ onComplete: done })
        .to('#envWrap', { y: -40, scale: 1.05, duration: .3, ease: 'power2.out' })
        .to('#envWrap', { x: 260, y: -520, rotation: 18, scale: .4, opacity: 0, duration: 1.1, ease: 'power2.in' })
        .set('#envWrap', { x: 0, y: 160, rotation: 0, scale: .8 })
        .to('#envWrap', { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.6)' });
    } else done();
  });

  function intro() {
    if (!motion || document.hidden) return;   // no intro for background tabs: text stays visible
    const tl = gsap.timeline({ delay: .5, defaults: { ease: 'power3.out' } });
    tl.from('.wave-hero path', { strokeDasharray: '0 4000', duration: 2.4, ease: 'power2.inOut', stagger: .2 }, 0)
      .from('.hero-logo .logo-frame', { scale: .3, rotation: -8, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, .1)
      .from('.hero-logo .logo-text > *', { y: 14, opacity: 0, duration: .7, stagger: .1 }, .4)
      .from('.hero-logo .logo-wing-l', { scaleX: 0, duration: 1.1, transformOrigin: '90% 60%', ease: 'elastic.out(1, .6)' }, .6)
      .from('.hero-logo .logo-wing-r', { scaleX: 0, duration: 1.1, transformOrigin: '10% 60%', ease: 'elastic.out(1, .6)' }, .6)
      .from('.hero-logo .logo-bow', { y: -120, rotation: -40, opacity: 0, duration: 1, ease: 'bounce.out' }, .7)
      .from('.hl-in', { yPercent: 70, rotation: 4, opacity: 0, duration: 1.1, stagger: .09, ease: 'power4.out' }, .5)
      .from('.pill', { width: 0, duration: 1.1, stagger: .15, ease: 'expo.out' }, .9)
      .from('.arch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.4, ease: 'power3.inOut' }, .8)
      .from('.arch-wing-l', { scaleX: 0, transformOrigin: '92% 62%', duration: 1.2, ease: 'elastic.out(1, .6)' }, 1.4)
      .from('.arch-wing-r', { scaleX: 0, transformOrigin: '8% 62%', duration: 1.2, ease: 'elastic.out(1, .6)' }, 1.4)
      .from('.arch-bow', { y: -200, rotation: -50, opacity: 0, duration: 1.2, ease: 'bounce.out' }, 1.5)
      .from('.polaroid', { y: -260, rotation: -30, opacity: 0, duration: 1.2, ease: 'back.out(1.3)' }, 1.1)
      .from('.dear-card', { x: 160, rotation: 16, opacity: 0, duration: 1.1, ease: 'power3.out' }, 1.2)
      .from('.hero-note, .arch-cap', { y: 24, opacity: 0, duration: .8, stagger: .1 }, 1.5)
      .from('.mini-product', { scale: 0, duration: .8, ease: 'back.out(2)' }, 1.8);
    // if frames are throttled, jump to the end so nothing stays hidden
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, (tl.duration() + tl.delay()) * 1000 + 1200);
  }

  function scrollFx() {
    if (!motion || !window.ScrollTrigger) return;
    const when = A.when;
    // vow: counters (0 counts down from 99, 100 counts up) + stamp
    when('.stats', () => {
      $$('.stat-n').forEach((n) => {
        const to = +n.dataset.count, o = { v: to === 0 ? 99 : 0 };
        gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { n.firstChild.textContent = Math.round(o.v); } });
      });
      gsap.from('.stats li', { x: -40, duration: .9, stagger: .12, ease: 'power3.out' });
    });
    when('.letter', () => {
      gsap.from('.letter', { y: 80, rotation: 6, duration: 1.2, ease: 'power3.out' });
      gsap.from('#stamp', { scale: 2.6, opacity: 0, rotation: 40, duration: .55, delay: .8, ease: 'power4.in',
        onComplete: () => gsap.fromTo('.letter', { x: -5 }, { x: 0, duration: .4, ease: 'elastic.out(2, .3)' }) });
    });

    // definition
    when('.cameo', () => {
      gsap.from('.frame-arch', { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'power3.inOut' });
      gsap.from('.cameo-pin', { y: -120, rotation: 70, opacity: 0, duration: .9, delay: .6, ease: 'back.out(2)' });
    });

    // orbit
    when('.orbit-stage', () => {
      gsap.from('.orbit-ring ellipse', { scale: .2, opacity: 0, transformOrigin: '50% 50%', duration: 1.4, stagger: .15, ease: 'expo.out' });
      gsap.from('.core-circle', { scale: 0, duration: 1.2, ease: 'elastic.out(1, .55)' });
      gsap.from('.orb-img', { scale: 0, duration: .8, stagger: .08, delay: .3, ease: 'back.out(2)' });
    });

    // swatches cascade in
    $$('.sw-block').forEach((b) => when(b, () => gsap.from(b.children, { y: 60, rotation: () => gsap.utils.random(-12, 12), scale: .7, duration: .9, stagger: .08, ease: 'back.out(1.6)', clearProps: 'transform' }), 'top 85%'));

    // tarot: dealt from a single deck
    when('#deck', () => {
      const cards = $$('.card');
      const d = $('#deck').getBoundingClientRect();
      const cx = d.left + d.width / 2, cy = d.top + d.height / 2;
      gsap.from(cards, {
        x: (i, el) => { const r = el.getBoundingClientRect(); return cx - (r.left + r.width / 2); },
        y: (i, el) => { const r = el.getBoundingClientRect(); return cy - (r.top + r.height / 2) + 40; },
        rotation: (i) => (i - 1.5) * 8 + gsap.utils.random(-5, 5),
        duration: 1.1, stagger: { each: .14, from: 'end' }, ease: 'power3.out',
      });
    }, 'top 80%');

    // compare hint wiggle
    when('#compare', () => {
      const pos = { v: 50 };
      gsap.timeline()
        .to(pos, { v: 78, duration: .9, ease: 'power2.inOut', onUpdate: () => setPos(pos.v) })
        .to(pos, { v: 24, duration: 1.2, ease: 'power2.inOut', onUpdate: () => setPos(pos.v) })
        .to(pos, { v: 50, duration: .9, ease: 'power2.inOut', onUpdate: () => { setPos(pos.v); range.value = pos.v; } });
    }, 'top 70%');

    // portraits: gentle parallax (5 elements)
    $$('.pf').forEach((f) => {
      gsap.to(f.querySelector('.slot'), { yPercent: +f.dataset.speed || 0, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // envelope
    when('.letters', () => gsap.from('#envWrap', { x: -200, y: 120, rotation: -20, opacity: 0, duration: 1.4, ease: 'power3.out' }));
  }

  A.intro = intro;
  scrollFx();
})();
