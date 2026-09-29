/* =========================================================
   ANGEOLOGY — search.js (search.html; needs main.js + products.js)
   Instant, client-side search over products, collections, looks and pages.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, tintFilter, safeTimeline, bag } = A;
  const products = ANGEOLOGY_PRODUCTS, cols = ANGEOLOGY_COLLECTIONS, looks = ANGEOLOGY_LOOKS;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const catName = Object.fromEntries(ANGEOLOGY_CATEGORIES);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ');

  /* ---------- what can be found ---------- */
  const pages = [
    ['Shop', 'shop.html', 'all products face eyes lips tools buy'],
    ['Collections', 'collections.html', 'doll fallen bride bunny tarot quiz which angel are you'],
    ['Lookbook', 'lookbook.html', 'looks editorial photos shop the look contact sheet'],
    ['Cruelty free', 'cruelty-free.html', 'vow vegan never tested on animals ingredients checker charter'],
    ['Ingredient checker', 'cruelty-free.html#checker', 'check ingredient beeswax carmine lanolin vegan'],
    ['Our story', 'about.html', 'about founder team diary history studio'],
    ['Contact', 'contact.html', 'help write email message press collaboration order question'],
    ['FAQ: Dear Angeology', 'faq.html', 'faq questions help answers lashes brush shade sensitive skin expiry gift wrap promo code'],
    ['Shipping & returns', 'shipping.html', 'shipping delivery rates cost free shipping parcel tracking returns refund packaging plastic free'],
    ['Returns', 'shipping.html#returns', 'return refund change my mind broken damaged faulty'],
    ['Angel club (account)', 'account.html', 'account login sign in member card profile wishlist'],
    ['Your bag', 'cart.html', 'bag cart basket checkout'],
    ['Privacy', 'privacy.html', 'privacy data cookies gdpr forget erase device storage'],
    ['Terms', 'terms.html', 'terms conditions sale legal withdrawal guarantee'],
    ['Home', 'index.html', 'home angeology'],
  ];
  const banned = { beeswax: 'candelilla & sunflower wax', carmine: 'iron oxides & beetroot', cochineal: 'iron oxides & beetroot', lanolin: 'shea butter & plant oils', squalene: 'olive squalane', guanine: 'mica & synthetic pearl', shellac: 'plant resins', collagen: 'plant peptides', keratin: 'wheat & soy proteins', silk: 'rice powder', honey: 'agave nectar', mink: 'vegan synthetic fibres', fur: 'nothing at all', leather: 'plant-based satin', feather: 'photographs and synthetic fibres', feathers: 'photographs and synthetic fibres', 'animal hair': 'synthetic taklon', gelatin: 'plant peptides', musk: 'plant-based notes' };
  const colours = [['pink', '#f3a7bf'], ['red', '#c0283a'], ['berry', '#8e2f58'], ['nude', '#c98c86'], ['peach', '#f0b097'], ['lilac', '#cfa9d9'], ['sky', '#c7d9ef'], ['gold', '#e2c48f'], ['pearl', '#f4ede8'], ['noir', '#1d1a1b']];
  const stop = new Set(['the', 'a', 'an', 'for', 'with', 'and', 'of', 'in', 'my', 'me', 'i', 'some', 'something', 'to', 'eur', 'euro', 'euros', 'price']);

  const colsOf = (id) => cols.filter((c) => c.products.includes(id));
  const productText = (p) => ({
    name: norm(p.name), latin: norm(p.latin), cat: norm(p.cat + ' ' + catName[p.cat]), desc: norm(p.desc),
    shade: norm(p.shades.map((s) => s[0]).join(' ') + (p.palette ? ' palette pans eyeshadow matte shimmer glitter' : '')),
    col: norm(colsOf(p.id).map((c) => 'the ' + c.name).join(' ')),
    extra: norm([p.isNew ? 'new' : '', p.best <= 3 ? 'bestseller best seller' : '', 'vegan cruelty free'].join(' ')),
  });
  const P = products.map((p) => ({ p, t: productText(p) }));

  /* ---------- query parsing ---------- */
  function parse(raw) {
    let q = norm(raw).trim();
    let max = null;
    const m = q.match(/(?:under|below|less than|max|<)\s*€?\s*(\d+)|€\s*(\d+)/);
    if (m) { max = +(m[1] || m[2]); q = q.replace(m[0], ' '); }
    let tokens = q.split(/[^a-z0-9]+/).filter((t) => t && !stop.has(t));
    // colour words ("pink gloss") become a colour search instead of a text match
    const alias = { blue: 'sky', white: 'pearl', black: 'noir', purple: 'lilac', rose: 'pink', brown: 'nude', coral: 'peach' };
    let hue = null;
    tokens = tokens.filter((t) => { const c = alias[t] || t; if (!hue && colours.some(([n]) => n === c)) { hue = c; return false; } return true; });
    return { q: norm(raw).trim(), tokens, max, hue };
  }
  const variants = (t) => [...new Set([t, t.replace(/es$/, ''), t.replace(/s$/, '')])].filter((v) => v.length > 1);
  const has = (field, t) => variants(t).some((v) => field.includes(v));

  function scoreProduct({ p, t }, tokens) {
    let total = 0;
    for (const tok of tokens) {
      let s = 0;
      if (variants(tok).some((v) => t.name.startsWith(v))) s += 6; else if (has(t.name, tok)) s += 4;
      if (has(t.shade, tok)) s += 3;
      if (has(t.cat, tok)) s += 3;
      if (has(t.col, tok)) s += 3;
      if (has(t.desc, tok)) s += 1;
      if (has(t.latin, tok)) s += 1;
      if (has(t.extra, tok)) s += 1;
      if (!s) return 0;                               // every word has to match somewhere
      total += s;
    }
    return total + (20 - p.best) * .01;
  }

  const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hsl = (h) => {
    const [r, g, b] = hex2rgb(h).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let hue = 0; const sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) hue = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [hue * 60, sat, l];
  };
  // perceptual-ish distance: hue matters for real colours, lightness for neutrals
  const dist = (a, b) => {
    const [h1, s1, l1] = hsl(a), [h2, s2, l2] = hsl(b);
    if (s1 > .15 && s2 > .15) { const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)); return 2 * dh / 180 + Math.abs(s1 - s2) * .6 + Math.abs(l1 - l2) * 1.2; }
    return Math.abs(s1 - s2) * 1.5 + Math.abs(l1 - l2) * 1.5 + (s1 > .15 || s2 > .15 ? .3 : 0);
  };
  const closestShade = (p, hex) => p.shades.reduce((best, s, k) => { const d = dist(s[1], hex); return d < best.d ? { k, d } : best; }, { k: -1, d: 1e9 });

  /* ---------- state ---------- */
  const input = $('#q'), body = $('#srBody');
  let cat = 'all', maxPrice = 50, colour = null;

  $('#srColours').insertAdjacentHTML('beforeend', colours.map(([n, c]) => `<button type="button" data-c="${n}" style="--c:${c}" aria-pressed="false" title="${n}"><span class="visually-hidden">${n}</span></button>`).join(''));
  $('#srCats').innerHTML = ANGEOLOGY_CATEGORIES.map(([id, l]) => `<button type="button" data-cat="${id}" class="${id === 'all' ? 'on' : ''}" aria-pressed="${id === 'all'}">${l}</button>`).join('');

  function mark(text, tokens) {
    let out = esc(text);
    const vs = [...new Set(tokens.flatMap(variants))].filter((v) => v.length > 1).sort((a, b) => b.length - a.length);
    if (!vs.length) return out;
    const re = new RegExp(`(${vs.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return out.replace(re, '<mark>$1</mark>');
  }

  /* ---------- rendering ---------- */
  function productCard(p, tokens, shadeK) {
    const k = shadeK >= 0 ? shadeK : 0;
    const tint = p.shades.length ? tintFilter(p.shades[0][1], p.shades[k][1]) : '';
    const media = p.palette
      ? `<span class="rs-palette">${['03', '07', '09', '11'].map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`
      : `<span class="slot cutout" data-img="${p.img}" data-alt="${esc(p.name)}" data-ratio="1 / 1" data-tint="${tint}"><span class="slot-label">${p.img}</span></span>`;
    return `
      <article class="rs-product" data-id="${p.id}" data-k="${k}">
        <a class="rs-thumb p-${p.cat}" href="shop.html?p=${p.id}">${media}</a>
        <div class="rs-info">
          <p class="rs-cat">${catName[p.cat]}${p.isNew ? ' · new in' : ''}</p>
          <a class="rs-name" href="shop.html?p=${p.id}">${mark(p.name, tokens)}</a>
          <p class="rs-meta">${p.palette ? '12 pans' : `${esc(p.label)}: ${mark(p.shades[k][0], tokens)}`} · € ${p.price}</p>
        </div>
        <button type="button" class="rs-add" aria-label="Add ${esc(p.name)} to bag">+</button>
      </article>`;
  }

  function render() {
    const { q, tokens, max, hue } = parse(input.value);
    const useColour = colour || hue;
    const priceCap = Math.min(maxPrice, max || Infinity);
    const html = [];
    $('#srClear').hidden = !input.value;

    // an animal ingredient? answer it straight away
    const ban = Object.keys(banned).find((b) => q && (q === b || q.includes(b) || (b.startsWith(q) && q.length > 3)));
    if (ban) html.push(`<div class="rs-answer"><p class="rs-answer-v">Never.</p><p><b>${esc(ban)}</b> is never in Angeology — we use <em>${esc(banned[ban])}</em> instead.</p><a class="text-link" href="cruelty-free.html#checker">check another ingredient</a></div>`);

    // products
    let list;
    const generic = tokens.length && tokens.every((t) => ['vegan', 'cruelty', 'free', 'makeup', 'all', 'everything', 'products', 'product'].includes(t));
    if (!tokens.length || generic) list = P.map((x) => ({ ...x, s: 20 - x.p.best }));
    else list = P.map((x) => ({ ...x, s: scoreProduct(x, tokens) })).filter((x) => x.s > 0);
    let shadeFor = {};
    if (useColour) {
      const hex = colours.find((c) => c[0] === useColour)[1];
      list = list.map((x) => { const c = closestShade(x.p, hex); shadeFor[x.p.id] = c.k; return { ...x, d: c.d }; }).filter((x) => x.d < .5).sort((a, b) => a.d - b.d);
    } else list.sort((a, b) => b.s - a.s);
    list = list.filter((x) => (cat === 'all' || x.p.cat === cat) && x.p.price <= priceCap);

    const showAll = !q && !colour;
    const heading = showAll ? 'Loved right now' : useColour ? `Products in <em class="script">${useColour}</em>` : 'Products';
    if (list.length) {
      html.push(`<section class="rs-group"><h2 class="rs-h">${heading} <span>${list.length}</span></h2><div class="rs-products">${(showAll ? list.slice(0, 8) : list).map((x) => productCard(x.p, tokens, shadeFor[x.p.id] ?? -1)).join('')}</div></section>`);
    }

    if (tokens.length && !generic) {
      // collections
      const cs = cols.filter((c) => tokens.every((t) => has(norm(['the', c.name, c.lede, c.mood.join(' '), c.fortune, c.upright].join(' ')), t)));
      if (cs.length) html.push(`<section class="rs-group"><h2 class="rs-h">Collections <span>${cs.length}</span></h2><div class="rs-cols">${cs.map((c) => `
        <a class="rs-col" href="collections.html#${c.id}"><span class="slot" data-img="${c.img}" data-alt="The ${esc(c.name)}" data-ratio="2 / 3"><span class="slot-label">${c.img}</span></span><span class="rs-col-n">${c.num}</span><span class="rs-col-name">The <em class="script">${mark(c.name, tokens)}</em></span></a>`).join('')}</div></section>`);
      // looks
      const ls = looks.map((l, i) => ({ l, i })).filter(({ l }) => tokens.every((t) => has(norm([l.name, l.note, 'the ' + l.col, ...l.wear.map(([id]) => byId[id].name)].join(' ')), t)));
      if (ls.length) html.push(`<section class="rs-group"><h2 class="rs-h">Looks <span>${ls.length}</span></h2><div class="rs-looks">${ls.map(({ l, i }) => `
        <a class="rs-look" href="lookbook.html#look-${i + 1}"><span class="slot" data-img="${l.img}" data-alt="${esc(l.name)}" data-ratio="3 / 4"><span class="slot-label">${l.img}</span></span><span class="rs-look-name">${mark(l.name, tokens)}</span></a>`).join('')}</div></section>`);
      // pages
      const ps = pages.filter(([name, , kw]) => tokens.some((t) => has(norm(name + ' ' + kw), t)));
      if (ps.length) html.push(`<section class="rs-group"><h2 class="rs-h">Pages <span>${ps.length}</span></h2><ul class="rs-pages">${ps.map(([name, url]) => `<li><a href="${url}"><span>${mark(name, tokens)}</span><span class="arrow"></span></a></li>`).join('')}</ul></section>`);
    }

    if (!list.length && html.length === (ban ? 1 : 0)) {
      html.push(`<div class="rs-empty"><p class="rs-empty-t">Nothing <em class="script">up here</em> for “${esc(input.value)}”</p><p>Try another word, a colour, or ask an angel — we might be making it right now.</p><a class="btn btn-line" href="contact.html">Ask us <span class="arrow"></span></a></div>`);
    }
    body.innerHTML = html.join('');
    $$('.slot', body).forEach(fillSlot);
    const n = list.length;
    $('#srCount').textContent = showAll ? `${products.length} products, all vegan` : `${n} product${n === 1 ? '' : 's'} found`;
    if (motion && !document.hidden) gsap.from(body.querySelectorAll('.rs-product, .rs-col, .rs-look, .rs-pages li, .rs-answer, .rs-empty'), { y: 18, opacity: 0, duration: .45, stagger: .025, ease: 'power3.out', clearProps: 'all' });
    history.replaceState(null, '', input.value ? `?q=${encodeURIComponent(input.value)}` : location.pathname);
  }

  /* ---------- recent searches (this device only) ---------- */
  const RKEY = 'angeology-recent';
  const recent = () => { try { return JSON.parse(localStorage.getItem(RKEY)) || []; } catch (e) { return []; } };
  function remember(v) {
    v = v.trim(); if (v.length < 2) return;
    const r = [v, ...recent().filter((x) => x !== v)].slice(0, 5);
    try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch (e) {}
    paintRecent();
  }
  function paintRecent() {
    const r = recent(), box = $('#srRecent');
    box.hidden = !r.length;
    box.innerHTML = r.length ? `<span class="sr-label">recently</span>${r.map((x) => `<button type="button" data-q="${esc(x)}">${esc(x)}</button>`).join('')}` : '';
  }

  /* ---------- events ---------- */
  let t, rt;
  input.addEventListener('input', () => { clearTimeout(t); clearTimeout(rt); t = setTimeout(render, 120); rt = setTimeout(() => remember(input.value), 1500); });
  $('#srForm').addEventListener('submit', (e) => { e.preventDefault(); render(); remember(input.value); input.blur(); $('#results').scrollIntoView({ behavior: 'smooth' }); });
  $('#srClear').addEventListener('click', () => { input.value = ''; render(); input.focus(); });
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-q]');
    if (s) { input.value = s.dataset.q; render(); remember(s.dataset.q); return; }
    const c = e.target.closest('#srColours [data-c]');
    if (c) {
      colour = colour === c.dataset.c ? null : c.dataset.c;
      $$('#srColours [data-c]').forEach((b) => { const on = b.dataset.c === colour; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      return render();
    }
    const k = e.target.closest('#srCats [data-cat]');
    if (k) {
      cat = k.dataset.cat;
      $$('#srCats button').forEach((b) => { const on = b === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      return render();
    }
    const add = e.target.closest('.rs-add');
    if (add) {
      const card = add.closest('.rs-product'), p = byId[card.dataset.id];
      const shade = p.palette ? '12 pans' : p.shades[+card.dataset.k][0];
      bag.add(p.id, shade, 1);
      add.textContent = '✓'; add.classList.add('done'); setTimeout(() => { add.textContent = '+'; add.classList.remove('done'); }, 1500);
      const toast = $('#toast');
      toast.innerHTML = `<b>${esc(p.name)}</b>${p.palette ? '' : ' · ' + esc(shade)} is in your bag ♡ <a href="cart.html">view bag</a>`;
      toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
    }
  });
  const price = $('#price');
  price.addEventListener('input', () => { maxPrice = +price.value; $('#priceOut').textContent = `€ ${maxPrice}`; clearTimeout(t); t = setTimeout(render, 80); });
  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });

  // start from ?q= if present
  const start = new URLSearchParams(location.search).get('q');
  if (start) input.value = start;
  paintRecent();
  render();

  /* ---------- intro ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.wave-sr path', { strokeDasharray: '0 4000', duration: 2.2, ease: 'power2.inOut' }, 0)
      .from('.sr-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.sr-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .2)
      .from('.sr-form', { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'expo.out' }, .6)
      .from('.sr-suggest > *, .sr-colours > *', { y: 16, opacity: 0, duration: .5, stagger: .03 }, .9)
      .from('.sr-spark', { scale: 0, duration: .8, stagger: .2, ease: 'back.out(3)' }, 1.2);
  };
})();
