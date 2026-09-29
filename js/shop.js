/* =========================================================
   ANGEOLOGY — shop.js (shop.html only; needs main.js + products.js)
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, tintFilter, when, safeTimeline, bag } = A;
  const products = ANGEOLOGY_PRODUCTS;
  const deep = new URLSearchParams(location.search).get('p');   // read before the category filter rewrites the URL
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const grid = $('#grid');
  const edQuote = $('[data-ed="quote"]'), edPhoto = $('[data-ed="photo"]');
  const sel = {};                                   // chosen shade index per product (shared by card + quick view)
  const WISH_KEY = 'angeology-wish';
  const wish = new Set((() => { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch (e) { return []; } })());
  const saveWish = () => { try { localStorage.setItem(WISH_KEY, JSON.stringify([...wish])); } catch (e) {} };
  const catName = Object.fromEntries(ANGEOLOGY_CATEGORIES);
  const PALETTE_PREVIEW = ['03', '07', '09', '11'];

  /* ---------- cards ---------- */
  function shadeButtons(p, cls = '') {
    const k0 = sel[p.id] || 0;
    return p.shades.map(([n, c], k) =>
      `<button type="button" class="${cls} ${k === k0 ? 'on' : ''}" style="background:${c}" data-k="${k}" aria-label="${p.label} ${n}" aria-pressed="${k === k0}"></button>`).join('');
  }

  function card(p) {
    const el = document.createElement('article');
    el.className = 'p-card' + (p.palette ? ' p-card--wide' : '');
    el.dataset.id = p.id; el.dataset.cat = p.cat;
    const tag = p.isNew ? '<span class="p-tag">new in</span>' : p.best <= 3 ? '<span class="p-tag">bestseller</span>' : '';
    const media = p.palette
      ? `<span class="p-palette">${PALETTE_PREVIEW.map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`
      : `<span class="slot cutout" data-img="${p.img}" data-alt="${p.name}" data-ratio="4 / 5"><span class="slot-label">img/${p.img}</span></span>`;
    el.innerHTML = `
      <div class="p-media p-${p.cat}">
        ${tag}
        <button type="button" class="p-wish ${wish.has(p.id) ? 'on' : ''}" aria-pressed="${wish.has(p.id)}" aria-label="Save ${p.name} to your wishlist">♡</button>
        <button type="button" class="p-open" aria-label="Quick view: ${p.name}">${media}</button>
        <button type="button" class="p-add">Add to bag <span>+</span></button>
      </div>
      <div class="p-body">
        <p class="p-cat">${catName[p.cat]} · n° ${String(p.best).padStart(2, '0')}</p>
        <h3 class="p-name"><a href="shop.html?p=${p.id}">${p.name}</a></h3>
        <p class="p-latin">${p.latin}</p>
        <div class="p-row">
          <span class="p-price">€ ${p.price}</span>
          <div class="p-shades" role="group" aria-label="${p.name} shades">${p.palette ? '<span class="p-pans">12 pans</span>' : shadeButtons(p)}</div>
        </div>
      </div>`;
    const slot = el.querySelector('.slot');
    if (slot) fillSlot(slot);
    return el;
  }
  const cards = products.map((p) => { const c = card(p); grid.appendChild(c); return c; });
  const cardOf = (id) => cards.find((c) => c.dataset.id === id);

  function paintShade(p) {
    const k = sel[p.id] || 0;
    const f = p.shades.length ? tintFilter(p.shades[0][1], p.shades[k][1]) : '';
    const c = cardOf(p.id);
    const slot = c && c.querySelector('.slot');
    if (slot) { slot.dataset.tint = f; const img = slot.querySelector('img'); if (img) img.style.filter = f; }
    if (c) $$('.p-shades button', c).forEach((b) => { const on = +b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    return f;
  }

  /* ---------- category index ---------- */
  const catList = $('#catList');
  const counts = { all: products.length };
  products.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  catList.innerHTML = ANGEOLOGY_CATEGORIES.map(([id, label]) =>
    `<button type="button" data-cat="${id}" aria-pressed="false">${label}<sup>${counts[id] || 0}</sup></button>`).join('');
  const catHeart = $('#catHeart');
  function moveHeart(btn) {
    const r = btn.getBoundingClientRect(), n = catList.getBoundingClientRect();
    catHeart.style.transform = `translateX(${r.left - n.left + r.width / 2 - 7}px)`;
    catHeart.style.opacity = 1;
  }

  /* ---------- filter + sort (animated with GSAP Flip) ---------- */
  let cat = 'all', sort = 'best', col = null;           // col: a collection from ANGEOLOGY_COLLECTIONS (shop.html#doll …)
  const colById = Object.fromEntries((window.ANGEOLOGY_COLLECTIONS || []).map((c) => [c.id, c]));
  const sorters = {
    best: (a, b) => a.best - b.best,
    new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.best - b.best,
    low: (a, b) => a.price - b.price || a.best - b.best,
    high: (a, b) => b.price - a.price || a.best - b.best,
  };

  function layout(animate = true) {
    const state = animate && motion && window.Flip ? Flip.getState('#grid > *') : null;
    const h0 = grid.offsetHeight;                   // lock the height so the page below never jumps over the cards
    const list = products.filter((p) => (col ? col.products.includes(p.id) : cat === 'all' || p.cat === cat)).sort(sorters[sort]);
    const shown = new Set(list.map((p) => p.id));
    cards.forEach((c) => c.classList.toggle('is-hidden', !shown.has(c.dataset.id)));
    // order: products, with the two editorial cards woven in when showing everything
    const order = list.map((p) => cardOf(p.id));
    const showEd = cat === 'all' && !col;
    edQuote.classList.toggle('is-hidden', !showEd);
    edPhoto.classList.toggle('is-hidden', !showEd);
    if (showEd) { order.splice(Math.min(3, order.length), 0, edQuote); order.splice(Math.min(10, order.length), 0, edPhoto); }
    order.forEach((el) => grid.appendChild(el));
    [edQuote, edPhoto].forEach((el) => { if (!showEd) grid.appendChild(el); });

    $$('#catList button').forEach((b) => { const on = !col && b.dataset.cat === cat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); if (on) moveHeart(b); });
    if (col) catHeart.style.opacity = 0;
    $('#shopCount').innerHTML = `${list.length} ${list.length === 1 ? 'product' : 'products'}${col ? ` from the ${col.name.toLowerCase()} collection · <a href="collections.html#${col.id}">read its fortune</a>` : cat === 'all' ? '' : ' for ' + catName[cat].toLowerCase()} · all vegan`;
    $('#gridEmpty').hidden = list.length > 0;

    if (state) {
      // Flip lifts every card out of the flow while it animates, so the grid keeps an explicit height:
      // growing → the new height at once; shrinking → hold the old one, then glide up once the leaving cards fade
      const h1 = grid.offsetHeight;
      if (h1 >= h0) gsap.set(grid, { height: h1 });
      else gsap.set(grid, { height: h0 });
      const tl = Flip.from(state, {
        duration: .75, ease: 'power3.inOut', absolute: true, scale: true, stagger: .02, nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: .8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: .6, stagger: .04, ease: 'back.out(1.4)' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: .8, duration: .25 }),
        onComplete: () => gsap.to(grid, { height: h1, duration: h1 < h0 ? .5 : 0, ease: 'power3.inOut', onComplete: () => gsap.set(grid, { clearProps: 'height' }) }),
      });
      setTimeout(() => { if (tl.progress() < 1) tl.progress(1); gsap.set('#grid > *:not(.is-hidden)', { clearProps: 'opacity,transform' }); }, 1800);
      setTimeout(() => { gsap.killTweensOf(grid); gsap.set(grid, { clearProps: 'height' }); }, 3000);
    }
  }

  function setCat(next, animate = true) {
    col = colById[next] || null;
    if (col) { cat = 'all'; history.replaceState(null, '', '#' + next); return layout(animate); }
    if (!catName[next]) next = 'all';
    cat = next;
    history.replaceState(null, '', next === 'all' ? location.pathname : '#' + next);
    layout(animate);
  }
  catList.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setCat(b.dataset.cat); });
  $('#sortBy').addEventListener('change', (e) => { sort = e.target.value; layout(); });
  $('#seeNew').addEventListener('click', () => {
    sort = 'new'; $('#sortBy').value = 'new'; cat = 'all';
    $('#shopTools').scrollIntoView({ behavior: 'smooth' });
    setCat('all');
  });
  addEventListener('hashchange', () => setCat(location.hash.slice(1) || 'all'));
  addEventListener('resize', () => { const on = $('#catList button.on'); if (on) moveHeart(on); });
  setCat(location.hash.slice(1) || 'all', false);

  /* ---------- fly a product into the bag ---------- */
  const toast = $('#toast');
  let toastT;
  function say(html) {
    toast.innerHTML = html; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  function addToBag(p, qty, fromEl) {
    const k = sel[p.id] || 0;
    const shade = p.shades.length ? p.shades[k][0] : '12 pans';
    const done = () => {
      bag.add(p.id, shade, qty);
      say(`<b>${p.name}</b>${p.shades.length ? ' · ' + shade : ''} is in your bag ♡ <a href="cart.html">view bag</a>`);
    };
    const target = [...$$('a[href="cart.html"]')].find((a) => a.offsetParent !== null) || $('#menuBtn');
    if (!motion || !fromEl || !target || document.hidden) return done();
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const ghost = fromEl.cloneNode(true);
    Object.assign(ghost.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 90, pointerEvents: 'none' });
    ghost.classList.add('fly-ghost');
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const tl = gsap.timeline({ onComplete: () => { ghost.remove(); done(); } });
    tl.to(ghost, { x: dx * .5, y: dy * .5 - 120, scale: .45, rotation: -14, duration: .45, ease: 'power2.out' })
      .to(ghost, { x: dx, y: dy, scale: .06, rotation: 20, opacity: .6, duration: .45, ease: 'power2.in' });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 2000);
  }

  /* ---------- quick view ---------- */
  const qv = $('#qv'), qvSlot = $('#qvSlot');
  let qvProduct = null, qty = 1, lastFocus = null;
  function paintQvShade() {
    const p = qvProduct, k = sel[p.id] || 0;
    $$('#qvShades button').forEach((b) => { const on = +b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#qvShadeName').textContent = p.shades.length ? `${p.label}: ${p.shades[k][0]}` : '';
    const f = p.shades.length ? tintFilter(p.shades[0][1], p.shades[k][1]) : '';
    qvSlot.dataset.tint = f; const img = qvSlot.querySelector('img'); if (img) img.style.filter = f;
  }
  function openQv(p) {
    qvProduct = p; qty = 1; $('#qtyVal').textContent = qty;
    lastFocus = document.activeElement;
    $('#qvCat').textContent = `${catName[p.cat]} · n° ${String(p.best).padStart(2, '0')}${p.isNew ? ' · new in' : ''}`;
    $('#qvName').textContent = p.name;
    $('#qvLatin').textContent = p.latin;
    $('#qvPrice').textContent = `€ ${p.price}`;
    $('#qvDesc').textContent = p.desc;
    $('#qvShades').innerHTML = p.palette
      ? `<span class="qv-pans">${Array.from({ length: 12 }, (_, i) => `<span style="background-image:url(img/palette-${String(i + 1).padStart(2, '0')}.jpg)"></span>`).join('')}</span>`
      : shadeButtons(p);
    qvSlot.classList.toggle('is-palette', !!p.palette);
    qvSlot._pending = null;
    qvSlot.dataset.alt = p.name;
    if (p.palette) {
      qvSlot.dataset.img = '';
      qvSlot.innerHTML = `<span class="p-palette big">${PALETTE_PREVIEW.map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`;
    } else {
      qvSlot.dataset.img = p.img;
      qvSlot.innerHTML = `<span class="slot-label">img/${p.img}</span>`;
      fillSlot(qvSlot);
    }
    paintQvShade();
    qv.classList.add('open'); qv.setAttribute('aria-hidden', 'false');
    document.body.classList.add('qv-open');
    $('#qvClose').focus();
  }
  function closeQv() {
    qv.classList.remove('open'); qv.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('qv-open');
    if (lastFocus) lastFocus.focus();
  }
  $('#qvClose').addEventListener('click', closeQv);
  qv.addEventListener('click', (e) => { if (e.target === qv) closeQv(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && qv.classList.contains('open')) closeQv(); });
  $('#qvShades').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sel[qvProduct.id] = +b.dataset.k; paintQvShade(); paintShade(qvProduct);
    if (motion) gsap.fromTo('.qv-media', { scale: .96 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
  });
  $('#qtyMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); $('#qtyVal').textContent = qty; });
  $('#qtyPlus').addEventListener('click', () => { qty = Math.min(9, qty + 1); $('#qtyVal').textContent = qty; });
  $('#qvAdd').addEventListener('click', () => { const p = qvProduct, from = $('.qv-media'), n = qty; closeQv(); addToBag(p, n, from); });

  /* ---------- card interactions (one delegated listener) ---------- */
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.p-card'); if (!c) return;
    const p = byId[c.dataset.id];
    const shadeBtn = e.target.closest('.p-shades button');
    if (shadeBtn) {
      sel[p.id] = +shadeBtn.dataset.k; paintShade(p);
      if (motion) gsap.fromTo(c.querySelector('.p-open'), { scale: .95 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
      return;
    }
    if (e.target.closest('.p-name a')) { e.preventDefault(); return openQv(p); }
    if (e.target.closest('.p-add')) return addToBag(p, 1, c.querySelector('.p-open'));
    if (e.target.closest('.p-open')) return openQv(p);
    const w = e.target.closest('.p-wish');
    if (w) {
      const on = !wish.has(p.id);
      on ? wish.add(p.id) : wish.delete(p.id); saveWish();
      w.classList.toggle('on', on); w.setAttribute('aria-pressed', on);
      if (motion && on) gsap.fromTo(w, { scale: .6 }, { scale: 1, duration: .6, ease: 'elastic.out(1.2, .4)' });
      say(on ? `<b>${p.name}</b> saved to your wishlist ♡` : `<b>${p.name}</b> removed from your wishlist`);
    }
  });

  /* ---------- deep link: shop.html?p=<id> opens that product ---------- */
  if (deep && byId[deep]) setTimeout(() => openQv(byId[deep]), document.body.classList.contains('is-loading') ? 1400 : 200);

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.wave-shop path', { strokeDasharray: '0 4000', duration: 2.2, ease: 'power2.inOut' }, 0)
      .from('.shop-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.shop-title .hl-in', { yPercent: 70, rotation: 4, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .2)
      .from('.pill-shop', { width: 0, duration: 1.1, ease: 'expo.out' }, .5)
      .from('.sh-sub, .sh-promises li', { y: 20, opacity: 0, duration: .7, stagger: .08 }, .7)
      .from('.pol-shop', { y: -240, rotation: -25, opacity: 0, duration: 1.2, ease: 'back.out(1.3)' }, .5)
      .from('.new-note', { x: 140, rotation: 14, opacity: 0, duration: 1, ease: 'power3.out' }, .8)
      .from('.sh-bow', { y: -160, rotation: -50, opacity: 0, duration: 1.1, ease: 'bounce.out' }, 1)
      .from('.sh-sparkles', { scale: 0, duration: .8, ease: 'back.out(3)' }, 1.2)
      .from('#catList button', { y: 30, opacity: 0, duration: .7, stagger: .07 }, .9);
  };
  $$('#grid > *').forEach((el) => when(el, () => gsap.from(el, { y: 70, opacity: 0, rotation: gsap.utils.random(-3, 3), duration: .9, ease: 'power3.out', clearProps: 'transform,opacity' }), 'top 94%'));
  when('.shop-promise', () => gsap.from('.shop-promise li', { y: 50, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out' }));
})();
