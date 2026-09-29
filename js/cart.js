/* =========================================================
   ANGEOLOGY — cart.js (cart.html; needs main.js + products.js)
   The bag lives in localStorage (see A.bag in main.js).
   Checkout is not connected to a payment provider yet.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, tintFilter, safeTimeline, bag, store } = A;
  const products = ANGEOLOGY_PRODUCTS, cols = ANGEOLOGY_COLLECTIONS;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const catName = Object.fromEntries(ANGEOLOGY_CATEGORIES);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const eur = (n) => '€ ' + (Math.round(n * 100) / 100).toFixed(2).replace('.00', '').replace('.', ',');

  const FREE = 40, SHIP = 4.9, GIFT = 3;
  // demo codes only — replace with real ones when checkout is connected
  const CODES = { ANGEL10: { pct: 10, label: '10% off, for being an angel' }, BOWS: { freeShip: true, label: 'free shipping, tied with a bow' } };
  let promo = store.get('angeology-promo', null);
  const gift = $('#giftWrap');
  gift.checked = !!store.get('angeology-gift', false);

  const shadeIdx = (p, name) => Math.max(0, p.shades.findIndex((s) => s[0] === name));
  const thumb = (p, shade) => p.palette
    ? `<span class="tr-palette">${['03', '07', '09', '11'].map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`
    : `<span class="slot cutout" data-img="${p.img}" data-alt="${esc(p.name)}" data-ratio="1 / 1" data-tint="${tintFilter(p.shades[0][1], p.shades[shadeIdx(p, shade)][1])}"><span class="slot-label">${p.img}</span></span>`;

  /* ---------- the tray ---------- */
  function renderTray() {
    const items = bag.items().filter((it) => byId[it.id]);
    const tray = $('#tray');
    const n = bag.count();
    $('#bagSub').textContent = n ? `${n} ${n === 1 ? 'treasure' : 'treasures'} · all vegan, all cruelty free` : 'lighter than a feather';
    $('#receipt').hidden = !items.length;
    $('#bagGrid').classList.toggle('is-empty', !items.length);
    if (!items.length) {
      tray.innerHTML = `
        <div class="empty">
          <img src="img/deco/feather.png" alt="" class="empty-feather">
          <p class="empty-t">Your bag is <em class="script">empty</em></p>
          <p>Lighter than a feather — and our feathers are only pictures. Let’s fill it with something kind.</p>
          <div class="btn-row"><a href="shop.html" class="btn btn-fill">Go to the shop <span class="arrow"></span></a><a href="collections.html" class="btn btn-line">Pick a collection <span class="arrow"></span></a></div>
        </div>`;
      return;
    }
    tray.innerHTML = `<ul class="tr-list">${items.map((it) => { const p = byId[it.id]; return `
      <li class="tr-item" data-id="${p.id}" data-shade="${esc(it.shade)}">
        <a class="tr-thumb p-${p.cat}" href="shop.html?p=${p.id}">${thumb(p, it.shade)}</a>
        <div class="tr-info">
          <p class="tr-cat">${catName[p.cat]}</p>
          <a class="tr-name" href="shop.html?p=${p.id}">${esc(p.name)}</a>
          ${p.palette ? '<p class="tr-shade">12 pans</p>' : `
          <label class="tr-shade"><span>${esc(p.label)}</span>
            <select data-act="shade" aria-label="${esc(p.name)} ${esc(p.label)}">${p.shades.map(([s]) => `<option ${s === it.shade ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
          </label>`}
        </div>
        <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
          <button type="button" data-act="minus" aria-label="One less">−</button>
          <output>${it.qty}</output>
          <button type="button" data-act="plus" aria-label="One more">+</button>
        </div>
        <p class="tr-price">${eur(p.price * it.qty)}</p>
        <button type="button" class="tr-remove" data-act="remove" aria-label="Remove ${esc(p.name)}">×</button>
      </li>`; }).join('')}</ul>
      <button type="button" class="tr-clear text-link" data-act="clear">empty the bag</button>`;
    $$('.slot', tray).forEach(fillSlot);
  }

  /* ---------- the receipt ---------- */
  function renderReceipt() {
    const items = bag.items().filter((it) => byId[it.id]);
    const sub = items.reduce((s, it) => s + byId[it.id].price * it.qty, 0);
    const code = promo && CODES[promo];
    const disc = code && code.pct ? sub * code.pct / 100 : 0;
    const freeShip = sub >= FREE || (code && code.freeShip);
    const ship = !items.length || freeShip ? 0 : SHIP;
    const g = gift.checked && items.length ? GIFT : 0;
    $('#rcSub').textContent = eur(sub);
    $('#rcShip').textContent = ship ? eur(ship) : 'free ♡';
    $$('.rc-gift-row').forEach((el) => { el.hidden = !g; });
    $$('.rc-disc-row').forEach((el) => { el.hidden = !disc; });
    $('#rcDisc').textContent = '− ' + eur(disc);
    $('#rcTotal').textContent = eur(sub - disc + ship + g);
    const pct = Math.min(1, sub / FREE);
    $('#fsFill').style.width = pct * 100 + '%';
    $('#fsBow').style.left = pct * 100 + '%';
    $('#fsText').innerHTML = freeShip ? 'Shipping is <b>on us</b> ♡' : `You’re <b>${eur(FREE - sub)}</b> away from free shipping`;
    if (code) $('#promoMsg').textContent = `“${promo}” — ${code.label}`;
  }

  /* ---------- recommendations ---------- */
  function renderAlso() {
    const inBag = new Set(bag.items().map((it) => it.id));
    const related = new Set(cols.filter((c) => c.products.some((id) => inBag.has(id))).flatMap((c) => c.products));
    const list = products.filter((p) => !inBag.has(p.id)).sort((a, b) => (related.has(b.id) - related.has(a.id)) || a.best - b.best).slice(0, 4);
    $('#also').hidden = !list.length;
    $('#alsoList').innerHTML = list.map((p) => `
      <article class="al-item" data-id="${p.id}">
        <a class="al-thumb p-${p.cat}" href="shop.html?p=${p.id}">${thumb(p, p.shades.length ? p.shades[0][0] : '')}</a>
        <a class="al-name" href="shop.html?p=${p.id}">${esc(p.name)}</a>
        <p class="al-meta">${catName[p.cat]} · € ${p.price}</p>
        <button type="button" class="al-add" aria-label="Add ${esc(p.name)} to bag">+</button>
      </article>`).join('');
    $$('#alsoList .slot').forEach(fillSlot);
  }

  const renderAll = () => { renderTray(); renderReceipt(); renderAlso(); };
  renderAll();

  /* ---------- interactions ---------- */
  function leave(li, then) {
    if (!motion || document.hidden) return then();
    const tl = gsap.timeline({ onComplete: then });
    tl.to(li, { x: 80, rotation: 4, opacity: 0, duration: .35, ease: 'power2.in' })
      .to(li, { height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, duration: .3, ease: 'power2.inOut' });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 1500);
  }
  $('#tray').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') return;
    if (b.dataset.act === 'clear') {
      if (!confirm('Empty your whole bag?')) return;
      bag.clear(); return renderAll();
    }
    const li = b.closest('.tr-item'), id = li.dataset.id, shade = li.dataset.shade;
    const it = bag.items().find((x) => x.id === id && x.shade === shade);
    if (!it) return;
    if (b.dataset.act === 'plus') { bag.set(id, shade, Math.min(9, it.qty + 1)); renderTray(); renderReceipt(); }
    if (b.dataset.act === 'minus') {
      if (it.qty <= 1) return leave(li, () => { bag.set(id, shade, 0); renderAll(); });
      bag.set(id, shade, it.qty - 1); renderTray(); renderReceipt();
    }
    if (b.dataset.act === 'remove') leave(li, () => { bag.set(id, shade, 0); renderAll(); });
  });
  $('#tray').addEventListener('change', (e) => {
    const sel = e.target.closest('select[data-act="shade"]'); if (!sel) return;
    const li = sel.closest('.tr-item');
    bag.reshade(li.dataset.id, li.dataset.shade, sel.value);
    renderTray(); renderReceipt();
  });
  gift.addEventListener('change', () => { store.set('angeology-gift', gift.checked); renderReceipt(); });
  $('#promo').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#promoCode').value.trim().toUpperCase();
    if (!v) { promo = null; store.del('angeology-promo'); $('#promoMsg').textContent = ''; return renderReceipt(); }
    if (CODES[v]) { promo = v; store.set('angeology-promo', v); $('#promoCode').value = ''; }
    else $('#promoMsg').textContent = `“${v}” isn’t a code we know — try ANGEL10 ♡`;
    renderReceipt();
  });
  $('#checkout').addEventListener('click', () => {
    $('#checkoutMsg').innerHTML = 'Checkout isn’t open yet — this bag is a preview and nothing will be charged. <a href="contact.html">Tell us you’re waiting</a> ♡';
    if (motion) gsap.fromTo('#checkoutMsg', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, clearProps: 'all' });
  });
  $('#alsoList').addEventListener('click', (e) => {
    const b = e.target.closest('.al-add'); if (!b) return;
    const p = byId[b.closest('.al-item').dataset.id];
    bag.add(p.id, p.palette ? '12 pans' : p.shades[0][0], 1);
    const toast = $('#toast');
    toast.innerHTML = `<b>${esc(p.name)}</b> is in your bag ♡`;
    toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
    renderAll();
  });
  addEventListener('storage', (e) => { if (e.key === 'angeology-bag') renderAll(); });   // another tab changed the bag

  /* ---------- intro ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.bg-head .sec-num, .bg-sub', { y: 14, opacity: 0, duration: .6, stagger: .2 }, 0)
      .from('.bg-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .1)
      .from('.tr-item, .empty', { x: -60, opacity: 0, duration: .8, stagger: .08 }, .5)
      .from('.receipt', { y: -80, rotation: 4, opacity: 0, duration: 1, ease: 'back.out(1.3)' }, .6);
  };
})();
