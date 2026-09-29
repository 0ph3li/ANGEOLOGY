/* =========================================================
   ANGEOLOGY — lookbook.js (lookbook.html; needs main.js + products.js)
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, tintFilter, when, safeTimeline, bag } = A;
  const byId = Object.fromEntries(ANGEOLOGY_PRODUCTS.map((p) => [p.id, p]));
  const colById = Object.fromEntries(ANGEOLOGY_COLLECTIONS.map((c) => [c.id, c]));
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const looks = ANGEOLOGY_LOOKS;                   // defined in products.js (shared with search)
  // editorial sizes for the 12-column grid, repeating
  const sizes = ['xl', 's', 'm', 'm', 's', 'l', 's', 'm', 'l', 'm', 's', 'xl'];
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- filter chips ---------- */
  const filters = [['all', 'All looks'], ...ANGEOLOGY_COLLECTIONS.map((c) => [c.id, 'The ' + c.name])];
  $('#lbFilter').innerHTML = filters.map(([id, label], i) =>
    `<button type="button" data-f="${id}" class="${i ? '' : 'on'}" aria-pressed="${!i}">${label}<sup>${id === 'all' ? looks.length : looks.filter((l) => l.col === id).length}</sup></button>`).join('');

  /* ---------- grid ---------- */
  const grid = $('#lbGrid');
  grid.innerHTML = looks.map((l, i) => `
    <figure class="lb-look size-${sizes[i]}" data-i="${i}" data-col="${l.col}">
      <button type="button" class="lb-open" aria-label="Shop the look: ${esc(l.name)}">
        <span class="slot" data-img="${l.img}" data-alt="${esc(l.name)}"><span class="slot-label">img/${l.img}</span></span>
        <span class="lb-shop">shop the look <span class="arrow"></span></span>
      </button>
      <figcaption><span class="lb-n">fig. ${pad(i + 1)}</span><span class="lb-name">${esc(l.name)}</span><span class="lb-col">the ${colById[l.col].name.toLowerCase()}</span></figcaption>
    </figure>`).join('');
  $$('#lbGrid .slot').forEach(fillSlot);
  const figs = $$('.lb-look');

  $('#lbFilter').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const f = b.dataset.f;
    $$('#lbFilter button').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    const state = motion && window.Flip ? Flip.getState(figs) : null;
    const h0 = grid.offsetHeight;
    figs.forEach((fig) => fig.classList.toggle('is-hidden', f !== 'all' && fig.dataset.col !== f));
    if (!state) return;
    const h1 = grid.offsetHeight;
    gsap.set(grid, { height: Math.max(h0, h1) });          // Flip lifts the figures out of the flow; keep the page below still
    const tl = Flip.from(state, {
      duration: .75, ease: 'power3.inOut', absolute: true, scale: true, stagger: .03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.4)' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: .85, duration: .25 }),
      onComplete: () => gsap.to(grid, { height: h1, duration: h1 < h0 ? .5 : 0, ease: 'power3.inOut', onComplete: () => gsap.set(grid, { clearProps: 'height' }) }),
    });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); gsap.set(figs, { clearProps: 'opacity,transform' }); }, 1800);
    setTimeout(() => { gsap.killTweensOf(grid); gsap.set(grid, { clearProps: 'height' }); }, 3000);
  });

  /* ---------- shop the look ---------- */
  const stl = $('#stl'), stlSlot = $('#stlSlot');
  let cur = 0, lastFocus = null;
  const shadeOf = (p, k) => (p.palette ? '12 pans' : p.shades[k][0]);
  function thumb(p, k) {
    if (p.palette) return `<span class="st-thumb st-palette">${['03', '07', '09', '11'].map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`;
    return `<span class="st-thumb p-${p.cat}"><span class="slot cutout" data-img="${p.img}" data-alt="${esc(p.name)}" data-ratio="1 / 1" data-tint="${tintFilter(p.shades[0][1], p.shades[k][1])}"><span class="slot-label">${p.img}</span></span></span>`;
  }
  function render(i) {
    cur = (i + looks.length) % looks.length;
    const l = looks[cur];
    $('#stlFig').textContent = `fig. ${pad(cur + 1)} · the ${colById[l.col].name.toLowerCase()}`;
    $('#stlName').textContent = l.name;
    $('#stlNote').textContent = l.note;
    $('#stlCount').textContent = `${pad(cur + 1)} / ${pad(looks.length)}`;
    stlSlot.dataset.img = l.img; stlSlot.dataset.alt = l.name;
    stlSlot.innerHTML = `<span class="slot-label">img/${l.img}</span>`;
    fillSlot(stlSlot);
    $('#stlList').innerHTML = l.wear.map(([id, k]) => { const p = byId[id]; return `
      <li class="st-item" data-id="${id}" data-k="${k}">
        <a href="shop.html?p=${id}">${thumb(p, k)}</a>
        <span class="stl-txt"><a class="st-name" href="shop.html?p=${id}">${esc(p.name)}</a><span class="st-meta">${p.palette ? '12 pans' : p.label + ': ' + esc(shadeOf(p, k))} · € ${p.price}</span></span>
        <button type="button" class="st-add" aria-label="Add ${esc(p.name)} to bag">+</button>
      </li>`; }).join('');
    $$('#stlList .slot').forEach(fillSlot);
    const total = l.wear.reduce((s, [id]) => s + byId[id].price, 0);
    $('#stlAll').innerHTML = `Add the whole look · € ${total} <span class="arrow"></span>`;
  }
  function open(i) {
    lastFocus = document.activeElement;
    render(i);
    stl.classList.add('open'); stl.setAttribute('aria-hidden', 'false'); document.body.classList.add('stl-open');
    $('#stlClose').focus();
  }
  function close() {
    stl.classList.remove('open'); stl.setAttribute('aria-hidden', 'true'); document.body.classList.remove('stl-open');
    if (lastFocus) lastFocus.focus();
  }
  function step(d) {
    if (motion) gsap.fromTo('.stl-panel > :not(.stl-close)', { x: d * 30, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'all' });
    render(cur + d);
  }
  grid.addEventListener('click', (e) => { const b = e.target.closest('.lb-open'); if (b) open(+b.closest('.lb-look').dataset.i); });
  $('#stlClose').addEventListener('click', close);
  stl.addEventListener('click', (e) => { if (e.target === stl) close(); });
  $('#stlPrev').addEventListener('click', () => step(-1));
  $('#stlNext').addEventListener('click', () => step(1));
  addEventListener('keydown', (e) => {
    if (!stl.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  const toast = $('#toast');
  let toastT;
  function say(html) {
    toast.innerHTML = html; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  $('#stlList').addEventListener('click', (e) => {
    const b = e.target.closest('.st-add'); if (!b) return;
    const li = b.closest('.st-item'), p = byId[li.dataset.id];
    bag.add(p.id, shadeOf(p, +li.dataset.k), 1);
    b.textContent = '✓'; b.classList.add('done'); setTimeout(() => { b.textContent = '+'; b.classList.remove('done'); }, 1500);
    say(`<b>${esc(p.name)}</b> is in your bag ♡ <a href="cart.html">view bag</a>`);
  });
  $('#stlAll').addEventListener('click', () => {
    const l = looks[cur];
    l.wear.forEach(([id, k]) => bag.add(id, shadeOf(byId[id], k), 1));
    if (motion) gsap.fromTo('#stlList .st-item', { x: 0 }, { x: 12, duration: .12, yoyo: true, repeat: 1, stagger: .06 });
    say(`The whole <b>${esc(l.name)}</b> look is in your bag ♡ <a href="cart.html">view bag</a>`);
  });

  // deep link: lookbook.html#look-5 opens that look
  const m = location.hash.match(/^#look-(\d+)$/);
  if (m && looks[+m[1] - 1]) setTimeout(() => open(+m[1] - 1), document.body.classList.contains('is-loading') ? 1400 : 200);

  /* ---------- contact sheet with hand-drawn circles ---------- */
  const favs = [3, 7, 10];                       // circled by "the editor"
  $('#sheetFrames').innerHTML = looks.map((l, i) => `
    <button type="button" class="frame" data-i="${i}" aria-label="Open look ${pad(i + 1)}: ${esc(l.name)}">
      <span class="slot" data-img="${l.img}" data-alt=""><span class="slot-label">${pad(i + 1)}</span></span>
      <span class="frame-n">${pad(i + 1)}A</span>
    </button>`).join('');
  $$('#sheetFrames .slot').forEach(fillSlot);
  $('#sheetFrames').addEventListener('click', (e) => { const f = e.target.closest('.frame'); if (f) open(+f.dataset.i); });

  const marks = $('#sheetMarks');
  function drawMarks() {
    const box = $('#sheet').getBoundingClientRect();
    marks.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    marks.innerHTML = favs.map((i, k) => {
      const r = $$('#sheetFrames .frame')[i].getBoundingClientRect();
      const cx = r.left - box.left + r.width / 2, cy = r.top - box.top + r.height / 2;
      const rx = r.width * .62, ry = r.height * .62;
      // a slightly wobbly, unclosed loop like a grease pencil
      const d = `M${cx - rx},${cy} C${cx - rx},${cy - ry * 1.1} ${cx + rx * 1.05},${cy - ry * 1.05} ${cx + rx},${cy + ry * .05} C${cx + rx * .95},${cy + ry * 1.1} ${cx - rx * 1.02},${cy + ry} ${cx - rx * .96},${cy - ry * .18}`;
      // the scribbled note sits beside the circle, flipped to the other side if it would leave the sheet
      const word = k === 0 ? 'yes!!' : k === 2 ? 'cover?' : '';
      const right = cx + rx + 110 < box.width;
      const note = word ? `<text x="${right ? cx + rx + 8 : cx - rx - 8}" y="${cy - ry * .55}" class="mark-note" text-anchor="${right ? 'start' : 'end'}">${word}</text>` : '';
      return `<path class="mark" d="${d}"/>${note}`;
    }).join('');
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawMarks);
  addEventListener('resize', drawMarks);

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.lb-masthead span', { y: -14, opacity: 0, duration: .6, stagger: .06 }, 0)
      .from('.lb-title .hl-in', { yPercent: 60, opacity: 0, duration: 1.2, stagger: .12, ease: 'power4.out' }, .15)
      .from('.cover-arch .slot', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.4, ease: 'power3.inOut' }, .4)
      .from('.cover-bow', { y: -200, rotation: -50, opacity: 0, duration: 1.2, ease: 'bounce.out' }, 1.1)
      .from('.cover-seal', { scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.8)' }, 1.3)
      .from('.cl-left li', { x: -40, opacity: 0, duration: .8, stagger: .12 }, .9)
      .from('.cl-right li', { x: 40, opacity: 0, duration: .8, stagger: .12 }, .9);
  };
  when('#lbFilter', () => gsap.from('#lbFilter button', { y: 24, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out' }), 'top 90%');
  figs.forEach((f, i) => when(f, () => gsap.from(f, { y: 80, opacity: 0, rotation: i % 2 ? 2 : -2, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' }), 'top 92%'));
  when('#sheet', () => {
    drawMarks();
    gsap.from('.frame', { opacity: 0, duration: .5, stagger: .05 });
    gsap.fromTo('.mark', { strokeDasharray: '0 2000' }, { strokeDasharray: '2000 0', duration: 1.4, stagger: .35, delay: .6, ease: 'power2.inOut' });
    gsap.from('.mark-note', { opacity: 0, y: 10, duration: .5, delay: 1.8, stagger: .3 });
  }, 'top 70%');
  when('.credits', () => gsap.from('.credit-list > *', { y: 20, opacity: 0, duration: .6, stagger: .05, ease: 'power3.out' }), 'top 80%');
})();
