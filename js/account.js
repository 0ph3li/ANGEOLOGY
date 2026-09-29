/* =========================================================
   ANGEOLOGY — account.js (account.html; needs main.js + products.js)
   Preview only: the "account" is a name kept in localStorage on this
   device. No passwords, nothing is sent anywhere.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, safeTimeline, when, bag, store } = A;
  const products = ANGEOLOGY_PRODUCTS, cols = ANGEOLOGY_COLLECTIONS;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const eur = (n) => '€ ' + (Math.round(n * 100) / 100).toFixed(2).replace('.00', '').replace('.', ',');
  const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const KEY = 'angeology-member', PKEY = 'angeology-profile';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const SIDES = { coquette: 'coquette angel', alt: 'fallen angel', both: 'a bit of both' };

  $$('.slot').forEach(fillSlot);
  $('#jMonths').innerHTML = MONTHS.map((m, i) => `<label><input type="radio" name="month" value="${i}"> ${m}</label>`).join('');

  const memberNo = (m) => { let h = 7; for (const c of m.name + m.since) h = (h * 31 + c.charCodeAt(0)) % 9973; return 'N° ' + String(h).padStart(4, '0'); };

  /* ---------- the card ---------- */
  function paintCard(m) {
    $('#mcName').textContent = m ? m.name : 'your name here';
    $('#mcNo').textContent = m ? memberNo(m) : 'N° 0000';
    $('#mcSince').textContent = m ? new Date(m.since).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'today';
    $('#mcStatus').textContent = m ? SIDES[m.side] || 'angel' : 'guest';
    $('#mcard').classList.toggle('is-member', !!m);
  }
  // live preview while typing
  $('#jName').addEventListener('input', (e) => { const v = e.target.value.trim(); $('#mcName').textContent = v || 'your name here'; });
  $$('input[name="side"]').forEach((r) => r.addEventListener('change', () => { $('#mcStatus').textContent = SIDES[r.value]; }));

  // tilt + holographic sheen follow the pointer
  const stage = $('#cardStage'), card = $('#mcard');
  if (motion && matchMedia('(hover: hover)').matches) {
    const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3.out' });
    stage.addEventListener('pointermove', (e) => {
      const b = stage.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      ry((x - .5) * 22); rx((.5 - y) * 16);
      card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
    });
    stage.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- tiles ---------- */
  const thumb = (p) => p.palette
    ? `<span class="tl-palette">${['03', '07', '09', '11'].map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`
    : `<span class="slot cutout" data-img="${p.img}" data-alt="${esc(p.name)}" data-ratio="1 / 1"><span class="slot-label">${p.img}</span></span>`;

  function paintWish() {
    const ids = (store.get('angeology-wish', []) || []).filter((id) => byId[id]);
    $('#tWish').innerHTML = ids.length
      ? `<ul class="tl-thumbs">${ids.slice(0, 6).map((id) => { const p = byId[id]; return `<li><a href="shop.html?p=${p.id}" class="p-${p.cat}" title="${esc(p.name)}">${thumb(p)}<span>${esc(p.name)}</span></a></li>`; }).join('')}</ul>
         <p class="tl-more">${ids.length} ${ids.length === 1 ? 'treasure' : 'treasures'} saved · <a href="shop.html" class="text-link">see them in the shop</a></p>`
      : `<p>Nothing yet. Tap the little heart on anything in the shop and it lands here.</p><a href="shop.html" class="text-link">go heart something</a>`;
  }
  function paintBag() {
    const items = bag.items().filter((it) => byId[it.id]);
    const total = items.reduce((s, it) => s + byId[it.id].price * it.qty, 0);
    $('#tBag').innerHTML = items.length
      ? `<p class="tl-big">${bag.count()} <small>${bag.count() === 1 ? 'piece' : 'pieces'}</small></p>
         <ul class="tl-lines">${items.slice(0, 3).map((it) => `<li><span>${esc(byId[it.id].name)}</span><span>× ${it.qty}</span></li>`).join('')}${items.length > 3 ? `<li><span>and ${items.length - 3} more</span><span></span></li>` : ''}</ul>
         <p class="tl-total"><span>total</span><b>${eur(total)}</b></p>
         <a href="cart.html" class="btn btn-fill">Open my bag <span class="arrow"></span></a>`
      : `<p class="tl-big">0 <small>pieces</small></p><p>Your bag is lighter than a feather.</p><a href="shop.html" class="text-link">fill it with something kind</a>`;
  }
  function paintTarot() {
    const c = cols.find((x) => x.id === store.get('angeology-card'));
    $('#tCard').innerHTML = c
      ? `<div class="tc-wrap">
           <a class="tc-art" href="collections.html#quiz"><span class="slot" data-img="${c.img}" data-alt="The ${c.name} tarot card" data-ratio="2 / 3"><span class="slot-label">img/${c.img}</span></span></a>
           <div class="tc-copy">
             <p class="tc-num">N° ${c.num}</p>
             <h3 class="tl-h">The <em>${c.name}</em></h3>
             <p class="tc-fortune">${esc(c.fortune)}</p>
             <p class="tc-up"><span>upright</span> ${esc(c.upright)}</p>
             <a href="shop.html#${c.id}" class="text-link">shop your card</a>
           </div>
         </div>`
      : `<h3 class="tl-h">Not drawn <em>yet</em></h3><p>Answer three little questions and the cards will tell you which collection is yours.</p><a href="collections.html#quiz" class="text-link">draw my card</a>`;
    $$('#tCard .slot').forEach(fillSlot);
  }
  function paintVow() {
    const v = store.get('angeology-vow');
    $('#tVow').innerHTML = v && v.name
      ? `<div class="tv-cert">
           <p class="tv-k">certificate of kindness</p>
           <p class="tv-name">${esc(v.name)}</p>
           <p class="tv-date">signed on ${fmtDate(v.date)}</p>
           <p class="tv-text">promised to choose beauty that never hurts an animal.</p>
         </div>`
      : `<h3 class="tl-h">Not signed <em>yet</em></h3><p>Promise to choose kind beauty and we’ll write you a certificate.</p><a href="cruelty-free.html#pledge" class="text-link">sign the vow</a>`;
  }
  function paintRecent() {
    const r = store.get('angeology-recent', []) || [];
    $('#tRecent').innerHTML = r.length
      ? `<div class="tl-chips">${r.map((q) => `<a href="search.html?q=${encodeURIComponent(q)}">${esc(q)}</a>`).join('')}</div><button type="button" class="text-link" id="clearRecent">forget these</button>`
      : `<p>Nothing searched yet.</p><a href="search.html" class="text-link">search the house</a>`;
  }
  $('#tRecent').addEventListener('click', (e) => { if (e.target.id === 'clearRecent') { store.del('angeology-recent'); paintRecent(); } });

  /* ---------- shade profile ---------- */
  const FINISH = {
    matte: ['seraph-blush', 'bunny-brow', 'rosary-liner', 'cloud-veil'],
    satin: ['sin-satin', 'ribbon-tint', 'baby-skin', 'pearl-dew'],
    glitter: ['angel-dust', 'halo-gloss', 'fallen-lash', 'wingtip-liner'],
  };
  const warmth = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) - (n & 255)) / 255; };
  function pickShade(p, tone) {
    const s = [...p.shades].sort((a, b) => warmth(a[1]) - warmth(b[1]));
    return tone === 'cool' ? s[0] : tone === 'warm' ? s[s.length - 1] : s[Math.floor((s.length - 1) / 2)];
  }
  function paintProfile(animate) {
    const pf = store.get(PKEY, {}) || {};
    $$('#pfTone button').forEach((b) => b.classList.toggle('on', b.dataset.v === pf.tone));
    $$('#pfFinish button').forEach((b) => b.classList.toggle('on', b.dataset.v === pf.finish));
    if (!pf.tone || !pf.finish) { $('#pfPicks').innerHTML = '<p class="pf-hint">Pick both and we’ll choose your shades.</p>'; return; }
    const picks = FINISH[pf.finish].map((id) => byId[id]).filter((p) => p && p.shades.length).slice(0, 3);
    $('#pfPicks').innerHTML = `<p class="pf-label">made for you</p><ul>${picks.map((p) => { const [sn, hex] = pickShade(p, pf.tone); return `<li><a href="shop.html?p=${p.id}"><i style="background:${hex}"></i><span>${esc(p.name)}</span><em>${esc(sn)}</em></a></li>`; }).join('')}</ul>`;
    if (animate && motion && !document.hidden) { const t = gsap.from('#pfPicks li', { x: -14, opacity: 0, duration: .5, stagger: .07, clearProps: 'all' }); setTimeout(() => t.progress(1), 1500); }
  }
  ['#pfTone', '#pfFinish'].forEach((sel) => $(sel).addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const pf = store.get(PKEY, {}) || {};
    pf[sel === '#pfTone' ? 'tone' : 'finish'] = b.dataset.v;
    store.set(PKEY, pf); paintProfile(true);
  }));

  /* ---------- join / dashboard ---------- */
  function render(animate) {
    const m = store.get(KEY);
    paintCard(m);
    $('#join').hidden = !!m;
    $('#dash').hidden = !m;
    $('#acLede').textContent = m
      ? `Welcome back, ${m.name}. Everything you’ve hearted, drawn and promised is kept here, on this device.`
      : 'Your little corner of heaven: wishlist, bag, vow and tarot card, all in one place. Join with just a name, no password needed.';
    if (!m) return;
    $('#dashName').textContent = m.name.split(' ')[0];
    $('#dashSub').textContent = `${SIDES[m.side] || 'angel'} · member since ${fmtDate(m.since)}${m.month != null ? ' · birthday in ' + MONTHS[m.month] : ''}`;
    paintWish(); paintBag(); paintTarot(); paintVow(); paintRecent(); paintProfile();
    $$('.tile .slot').forEach(fillSlot);
    if (animate && motion && !document.hidden) {
      const tl = safeTimeline();
      tl.fromTo(card, { rotationY: -180, scale: .8 }, { rotationY: 0, scale: 1, duration: 1.2, ease: 'back.out(1.4)' })
        .from('.tile', { y: 50, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out' }, .3);
      $('#dash').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  $('#joinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#jName').value.trim().replace(/\s+/g, ' ');
    const email = $('#jEmail').value.trim();
    if (!name) { $('#jError').textContent = 'Your card needs a name, angel.'; $('#jName').focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#jError').textContent = 'That email looks a little crooked — or leave it empty.'; $('#jEmail').focus(); return; }
    $('#jError').textContent = '';
    const old = store.get(KEY) || {};
    const month = $('input[name="month"]:checked');
    store.set(KEY, { name, email, side: $('input[name="side"]:checked').value, month: month ? +month.value : null, since: old.since || Date.now() });
    render(true);
  });
  $('#editMe').addEventListener('click', () => {
    const m = store.get(KEY); if (!m) return;
    $('#jName').value = m.name; $('#jEmail').value = m.email || '';
    const side = $(`input[name="side"][value="${m.side}"]`); if (side) side.checked = true;
    const mo = m.month != null && $(`input[name="month"][value="${m.month}"]`); if (mo) mo.checked = true;
    $('#join').hidden = false; $('#dash').hidden = true;
    $('.jf-title').innerHTML = 'Edit your <em class="script">card</em>';
    $('#joinForm button[type="submit"]').firstChild.textContent = 'Save my card ';
    $('#join').scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
    $('#jName').focus({ preventScroll: true });
  });
  $('#signOut').addEventListener('click', () => {
    if (!confirm('Sign out on this device? Your wishlist, bag and vow stay saved.')) return;
    store.del(KEY);
    $('#joinForm').reset();
    $('.jf-title').innerHTML = 'Join the <em class="script">club</em>';
    $('#joinForm button[type="submit"]').firstChild.textContent = 'Get my wings ';
    render(false);
    scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' });
  });
  addEventListener('storage', (e) => { if (e.key && e.key.startsWith('angeology-')) render(false); });

  render(false);

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.ac-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, 0)
      .from('.ac-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .1)
      .from('.ac-lede, .ac-preview', { y: 20, opacity: 0, duration: .7, stagger: .1 }, .6)
      .from('.ac-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'power4.inOut' }, .2)
      .from(card, { y: 120, rotation: -18, rotationY: 60, opacity: 0, duration: 1.3, ease: 'back.out(1.2)' }, .6);
  };
  when('.perks', () => gsap.from('.perks li', { x: 40, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out' }));
})();
