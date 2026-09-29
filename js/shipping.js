/* =========================================================
   ANGEOLOGY — shipping.js (shipping.html; needs main.js + products.js)
   The pink pages: pick a destination and the "while you were out"
   memo tells you what shipping costs with the bag you have.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, safeTimeline, when, bag, store } = A;
  $$('.slot').forEach(fillSlot);
  const byId = Object.fromEntries(ANGEOLOGY_PRODUCTS.map((p) => [p.id, p]));
  const eur = (n) => '€ ' + (Math.round(n * 100) / 100).toFixed(2).replace('.00', '').replace('.', ',');

  // keep in sync with the pink pages in shipping.html (and FREE/SHIP in cart.js for Italy)
  const ZONES = {
    it: { name: 'Italy', cost: 4.9, free: 40 },
    eu: { name: 'the EU', cost: 7.9, free: 60 },
    uk: { name: 'the UK & Switzerland', cost: 12, free: 80 },
    us: { name: 'the USA & Canada', cost: 15, free: 90 },
    world: { name: 'the rest of the world', cost: 19, free: 120 },
  };
  let zone = store.get('angeology-zone', 'it');
  if (!ZONES[zone]) zone = 'it';
  const btns = $$('#zones button');

  function paint() {
    btns.forEach((b) => b.setAttribute('aria-checked', b.dataset.zone === zone));
    const z = ZONES[zone];
    const sub = bag.items().reduce((s, it) => s + (byId[it.id] ? byId[it.id].price * it.qty : 0), 0);
    const pct = Math.min(1, sub / z.free);
    $('#mpFill').style.width = pct * 100 + '%';
    $('#mpBow').style.left = pct * 100 + '%';
    $('#mpAbout').textContent = 'shipping to ' + z.name.replace(/^the /, '');
    $('#mpMsg').innerHTML = !sub
      ? `Shipping is <b>${eur(z.cost)}</b>, and free from ${eur(z.free)}. Your bag is empty. <a href="shop.html">Fill it</a> and I’ll do the maths.`
      : sub >= z.free
        ? `Your bag is ${eur(sub)}, so shipping is <b>free</b>. Lucky angel ♡`
        : `Your bag is ${eur(sub)}. Shipping is ${eur(z.cost)}, or <b>free if you add ${eur(z.free - sub)}</b>.`;
  }
  $('#zones').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    zone = b.dataset.zone; store.set('angeology-zone', zone); paint();
    if (motion && !document.hidden) {
      const t = gsap.fromTo('#estimate', { rotation: -2, y: -8 }, { rotation: 0, y: 0, duration: .7, ease: 'elastic.out(1.2, .4)', clearProps: 'transform' });
      setTimeout(() => t.progress(1), 1200);
    }
  });
  // arrow keys move between destinations, like a radio group
  $('#zones').addEventListener('keydown', (e) => {
    if (!/Arrow(Left|Right|Up|Down)/.test(e.key)) return;
    e.preventDefault();
    const i = btns.findIndex((b) => b.dataset.zone === zone);
    const n = btns[(i + (/Right|Down/.test(e.key) ? 1 : -1) + btns.length) % btns.length];
    n.focus(); n.click();
  });
  addEventListener('storage', (e) => { if (e.key === 'angeology-bag') paint(); });
  paint();

  /* ---------- intro + scroll ---------- */
  const cord = $('#cordPath');
  A.intro = () => {
    if (!motion || document.hidden) return;
    const len = cord.getTotalLength();
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.hl-photo', { y: 80, rotation: -12, opacity: 0, duration: 1.2 }, 0)
      .from('.hl-kicker', { scaleX: 0, transformOrigin: 'left', duration: .8, ease: 'power3.inOut' }, .2)
      .from('.hl-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .25)
      .from('.hl-lede, .hl-preview, .hl-lines li', { y: 20, opacity: 0, duration: .6, stagger: .08 }, .8)
      .from('.bubble', { scale: 0, opacity: 0, duration: .6, stagger: .35, ease: 'back.out(2.4)' }, 1.1)
      .fromTo(cord, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, .6);
  };
  when('.pp-book', () => {
    gsap.from('.pp-book', { y: 70, rotation: -1.5, opacity: 0, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' });
    gsap.from('#zones li', { x: -40, opacity: 0, duration: .6, stagger: .08, delay: .3, ease: 'power3.out', clearProps: 'transform,opacity' });
    gsap.from('.memo-pad', { y: -60, rotation: 14, opacity: 0, duration: 1, delay: .5, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
  });
  when('.keys', () => gsap.from('.key', { scale: .4, opacity: 0, duration: .6, stagger: .12, ease: 'back.out(2.2)', clearProps: 'transform,opacity' }), 'top 85%');
  when('.kp-box', () => gsap.from('.kp-box li', { y: 30, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity' }), 'top 85%');
  when('.rt-card', () => gsap.from('.rt-steps li, .rt-rules', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity' }));
})();
