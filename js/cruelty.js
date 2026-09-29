/* =========================================================
   ANGEOLOGY — cruelty.js (cruelty-free.html; needs main.js)
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, when, safeTimeline } = A;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  $$('.slot').forEach(fillSlot);

  /* ---------- what we swapped ---------- */
  const swaps = [
    ['Carmine', 'crushed cochineal insects', 'iron oxides & beetroot'],
    ['Beeswax', 'from honeybees', 'candelilla & sunflower wax'],
    ['Lanolin', 'from sheep’s wool', 'shea butter & plant oils'],
    ['Squalene', 'from shark liver', 'olive squalane'],
    ['Guanine', 'from fish scales', 'mica & synthetic pearl'],
    ['Shellac', 'from lac bugs', 'plant resins'],
    ['Collagen', 'from animal skin', 'plant peptides'],
    ['Keratin', 'from hooves & feathers', 'wheat & soy proteins'],
    ['Silk powder', 'from silkworms', 'rice powder'],
    ['Honey', 'from honeybees', 'agave nectar'],
    ['Animal-hair brushes', 'goat, squirrel, pony', 'synthetic taklon'],
    ['Mink lashes', 'from minks', 'vegan synthetic fibres'],
  ];
  $('#swapList').innerHTML = swaps.map(([a, from, b], i) => `
    <li class="swap">
      <span class="swap-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="swap-old"><del>${a}</del><small>${from}</small></span>
      <span class="swap-arrow" aria-hidden="true"></span>
      <span class="swap-new"><span class="visually-hidden">replaced by </span>${b}</span>
    </li>`).join('');

  /* ---------- ingredient checker ---------- */
  const never = {
    carmine: ['carmine', 'cochineal', 'ci 75470', 'e120', 'crimson lake'],
    beeswax: ['beeswax', 'cera alba', 'bees wax'],
    lanolin: ['lanolin', 'wool wax', 'wool fat'],
    squalene: ['squalene', 'shark liver oil'],
    guanine: ['guanine', 'fish scale', 'pearl essence', 'ci 75170'],
    shellac: ['shellac', 'lac resin'],
    collagen: ['collagen', 'gelatin', 'gelatine'],
    keratin: ['keratin'],
    'silk powder': ['silk', 'silk powder', 'sericin'],
    honey: ['honey', 'propolis', 'royal jelly'],
    'animal-hair brushes': ['goat hair', 'squirrel hair', 'pony hair', 'sable', 'animal hair', 'badger'],
    'mink lashes': ['mink', 'mink lashes'],
    feathers: ['feather', 'feathers', 'down'],
    leather: ['leather', 'suede'],
    musk: ['musk', 'civet', 'castoreum', 'ambergris'],
    tallow: ['tallow', 'stearic acid (animal)', 'animal fat'],
  };
  const instead = Object.fromEntries(swaps.map(([a, , b]) => [a.toLowerCase(), b]));
  Object.assign(instead, { feathers: 'photographs and synthetic fibres (the ones on this site are only pictures)', leather: 'plant-based satin and recycled card', musk: 'plant and safe synthetic fragrance notes', tallow: 'plant oils and butters' });
  const kind = ['mica', 'iron oxides', 'candelilla wax', 'shea butter', 'squalane', 'glycerin', 'jojoba oil', 'aloe', 'rose water', 'hyaluronic acid', 'vitamin e', 'rice powder'];
  $('#ingredientList').innerHTML = [...new Set([...Object.values(never).flat(), ...kind])].sort().map((n) => `<option value="${n}">`).join('');

  const result = $('#checkerResult');
  function check(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) { result.innerHTML = ''; return; }
    const hit = Object.entries(never).find(([, names]) => names.some((n) => q.includes(n) || n.includes(q) && q.length > 3));
    if (hit) {
      const [key] = hit;
      result.className = 'checker-result is-never';
      result.innerHTML = `<p class="cr-verdict">Never.</p><p class="cr-text"><b>${esc(raw.trim())}</b> is never in Angeology. We use <em>${esc(instead[key] || 'plant and mineral alternatives')}</em> instead.</p>`;
    } else if (kind.some((k) => q.includes(k) || k.includes(q) && q.length > 3)) {
      result.className = 'checker-result is-kind';
      result.innerHTML = `<p class="cr-verdict">Kind ♡</p><p class="cr-text"><b>${esc(raw.trim())}</b> is plant- or mineral-derived — the kind of thing we love to use.</p>`;
    } else {
      result.className = 'checker-result is-unknown';
      result.innerHTML = `<p class="cr-verdict">Not on our list</p><p class="cr-text">We don’t know <b>${esc(raw.trim())}</b> yet — but if it comes from an animal, it isn’t in Angeology. <a href="contact.html">Ask us</a> and an angel will check.</p>`;
    }
    if (motion) gsap.fromTo(result, { y: 16, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.6)', clearProps: 'all' });
  }
  $('#checkerForm').addEventListener('submit', (e) => { e.preventDefault(); check($('#ingredient').value); });
  $$('[data-try]').forEach((b) => b.addEventListener('click', () => { $('#ingredient').value = b.dataset.try; check(b.dataset.try); }));

  /* ---------- sign the vow (kept on this device only) ---------- */
  const KEY = 'angeology-vow';
  const cert = $('#cert');
  function showCert(v, animate) {
    $('#certName').textContent = v.name;
    $('#certDate').textContent = 'signed on ' + new Date(v.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    cert.classList.add('signed');
    if (animate && motion) {
      gsap.timeline()
        .fromTo('#certName', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' })
        .fromTo('.cert-seal', { scale: 2.6, opacity: 0, rotation: 40 }, { scale: 1, opacity: 1, rotation: -12, duration: .5, ease: 'power4.in' }, '-=.3')
        .fromTo(cert, { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(2, .3)', clearProps: 'transform' });
      setTimeout(() => { $('#certName').style.clipPath = ''; }, 3000);
    }
  }
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && saved.name) showCert(saved, false); } catch (e) {}
  $('#pledgeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#pledgeName').value.trim();
    if (!name) return;
    const v = { name, date: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (err) {}
    showCert(v, true);
  });

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.wave-cf path', { strokeDasharray: '0 4000', duration: 2.2, ease: 'power2.inOut' }, 0)
      .from('.cf-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.cf-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .2)
      .from('.cf-lede, .cf-copy .btn-row', { y: 20, opacity: 0, duration: .7, stagger: .1 }, .8)
      .from('.cf-arch .slot', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.3, ease: 'power3.inOut' }, .5)
      .from('.cf-wing-l', { scaleX: 0, transformOrigin: '92% 62%', duration: 1.2, ease: 'elastic.out(1, .6)' }, 1.1)
      .from('.cf-wing-r', { scaleX: 0, transformOrigin: '8% 62%', duration: 1.2, ease: 'elastic.out(1, .6)' }, 1.1)
      .from('.cf-stamp', { scale: 2.6, opacity: 0, rotation: 40, duration: .55, ease: 'power4.in' }, 1.5);
  };
  when('.cf-numbers', () => $$('.cfn').forEach((n) => {
    const to = +n.dataset.to, o = { v: to === 0 ? 99 : 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { n.textContent = Math.round(o.v); } });
  }), 'top 85%');
  when('.charter', () => {
    gsap.from('.charter', { y: 80, rotation: -2, duration: 1.1, ease: 'power3.out' });
    gsap.from('.articles li', { x: -30, opacity: 0, duration: .7, stagger: .1, delay: .3, ease: 'power3.out' });
  });
  when('.charter-foot', () => gsap.from('#wax', { scale: 2.4, opacity: 0, rotation: 60, duration: .55, delay: .3, ease: 'power4.in' }), 'top 88%');
  when('#swapList', () => {
    $$('.swap').forEach((s) => s.classList.add('struck'));   // CSS draws the strike-through lines one by one
    gsap.from('.swap', { y: 30, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out' });
  });
  // failsafe: strike-throughs appear even if the trigger never fires
  setTimeout(() => $$('.swap').forEach((s) => s.classList.add('struck')), 8000);
  when('.checker-card', () => gsap.from('.checker-card', { y: 60, rotation: 2, duration: 1, ease: 'power3.out' }));
  if (motion && window.ScrollTrigger) {
    const path = $('#tlPath');
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 60%', scrub: true } });
  }
  $$('.timeline li').forEach((li, i) => when(li, () => gsap.from(li, { x: i % 2 ? 60 : -60, opacity: 0, duration: .9, ease: 'power3.out' }), 'top 85%'));
  when('.faq-list', () => gsap.from('.faq-list details', { y: 24, opacity: 0, duration: .6, stagger: .07, ease: 'power3.out' }), 'top 85%');
  when('.cert', () => gsap.from('.cert', { y: 70, rotation: 3, duration: 1, ease: 'power3.out' }), 'top 85%');
})();
