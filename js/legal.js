/* =========================================================
   ANGEOLOGY — legal.js (terms.html + privacy.html; needs main.js)
   Numbers the clauses, builds the contents list with reading
   progress, and on privacy.html shows (and erases) what this
   device keeps in localStorage.
   ========================================================= */
(() => {
  const { $, $$, motion, safeTimeline, when, bag, store } = A;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'];

  /* ---------- numbering + contents ---------- */
  const clauses = $$('.clause');
  clauses.forEach((c, i) => {
    const h = $('h2', c);
    h.insertAdjacentHTML('afterbegin', `<span class="cl-n">${ROMAN[i]}.</span> `);
  });
  $('#toc').innerHTML = clauses.map((c, i) => `<li><a href="#${c.id}"><span>${ROMAN[i]}.</span> ${esc($('h2', c).lastChild.textContent)}</a></li>`).join('');
  const links = $$('#toc a');
  const setActive = (id) => links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
  if (window.ScrollTrigger) {
    clauses.forEach((c) => ScrollTrigger.create({ trigger: c, start: 'top 40%', end: 'bottom 40%', onToggle: (s) => { if (s.isActive) setActive(c.id); } }));
    ScrollTrigger.create({ trigger: '#doc', start: 'top 40%', end: 'bottom 60%', onUpdate: (s) => { $('#tocFill').style.width = s.progress * 100 + '%'; } });
  }

  /* ---------- privacy: what this device remembers ---------- */
  const memo = $('#memo');
  if (memo) {
    const byId = window.ANGEOLOGY_PRODUCTS ? Object.fromEntries(ANGEOLOGY_PRODUCTS.map((p) => [p.id, p])) : {};
    const cols = window.ANGEOLOGY_COLLECTIONS ? Object.fromEntries(ANGEOLOGY_COLLECTIONS.map((c) => [c.id, c])) : {};
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    // every key the site writes (keep in sync when a page starts saving something new)
    const KEYS = [
      ['angeology-bag', 'Your bag', 'what you added, with shades', 'bow.png', (v) => v.length && plural(v.reduce((s, it) => s + it.qty, 0), 'piece', 'pieces') + ': ' + v.map((it) => byId[it.id] ? byId[it.id].name : it.id).join(', ')],
      ['angeology-wish', 'Wishlist', 'the hearts you tapped in the shop', 'sparkle.png', (v) => v.length && v.map((id) => byId[id] ? byId[id].name : id).join(', ')],
      ['angeology-member', 'Angel club card', 'name, optional email, side, birthday month', 'wings.png', (v) => v.name && [v.name, v.email].filter(Boolean).join(' · ')],
      ['angeology-profile', 'Shade profile', 'undertone and favourite finish', 'pearl.png', (v) => [v.tone, v.finish].filter(Boolean).join(' · ')],
      ['angeology-card', 'Tarot card', 'your result from the collections quiz', 'sparkles.png', (v) => cols[v] ? `The ${cols[v].name}` : v],
      ['angeology-vow', 'Signed vow', 'the name on your certificate of kindness', 'feather.png', (v) => v.name],
      ['angeology-recent', 'Recent searches', 'your last five searches', 'envelope.png', (v) => v.length && v.map((q) => `“${q}”`).join(', ')],
      ['angeology-zone', 'Shipping destination', 'the stamp you chose on the shipping page', 'pin.png', (v) => v],
      ['angeology-promo', 'Promo code', 'a code typed in your bag', 'bow.png', (v) => v],
      ['angeology-gift', 'Gift wrap', 'whether you ticked the satin bow', 'bow.png', (v) => v && 'yes, wrap it'],
    ];
    const read = (k) => { let raw = null; try { raw = localStorage.getItem(k); } catch (e) {} if (raw === null) return null; try { return JSON.parse(raw); } catch (e) { return raw; } };
    const summary = (k, fn) => { const v = read(k); if (v === null) return ''; try { return fn(v) || ''; } catch (e) { return 'saved'; } };

    function paintMemo() {
      memo.innerHTML = KEYS.map(([k, name, what, icon, fn]) => {
        const s = summary(k, fn);
        return `<div class="memo-row" data-key="${k}">
          <img src="img/deco/${icon}" alt="">
          <p class="mr-name">${name}<small>${what}</small></p>
          <p class="mr-val ${s ? '' : 'none'}">${s ? esc(s) : 'nothing saved'}</p>
          <button type="button" class="mr-forget" ${s ? '' : 'disabled'} aria-label="Forget ${name}">forget</button>
        </div>`;
      }).join('');
      $('#forgetAll').disabled = !KEYS.some(([k]) => read(k) !== null);
    }
    const forget = (k) => { if (k === 'angeology-bag') bag.clear(); store.del(k); };   // clear() also resets the nav count
    memo.addEventListener('click', (e) => {
      const b = e.target.closest('.mr-forget'); if (!b) return;
      const row = b.closest('.memo-row'), k = row.dataset.key;
      const done = () => { forget(k); paintMemo(); $('#memoMsg').textContent = 'Forgotten ♡'; };
      if (motion && !document.hidden) { const t = gsap.to($('.mr-val', row), { opacity: 0, x: 30, duration: .3, onComplete: done }); setTimeout(() => { if (t.progress() < 1) t.progress(1); }, 900); } else done();
    });
    $('#forgetAll').addEventListener('click', () => {
      if (!confirm('Make this site forget everything it saved on this device?')) return;
      KEYS.forEach(([k]) => forget(k));
      paintMemo();
      $('#memoMsg').textContent = 'All gone. This device has forgotten you ♡';
    });
    addEventListener('storage', (e) => { if (e.key && e.key.startsWith('angeology-')) paintMemo(); });
    paintMemo();
  }

  // the memo panel and web fonts change the page height after the triggers were measured
  if (window.ScrollTrigger) { ScrollTrigger.refresh(); addEventListener('load', () => ScrollTrigger.refresh()); if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh()); }

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.lg-bow', { y: -60, rotation: -30, opacity: 0, duration: 1, ease: 'back.out(1.8)' }, 0)
      .from('.lg-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.lg-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .15)
      .from('.lg-sub', { y: 20, opacity: 0, duration: .7 }, .6)
      .from('.lg-lede, .lg-meta, .lg-draft', { y: 20, opacity: 0, duration: .7, stagger: .1 }, .75);
  };
  when('.lg-body', () => gsap.from('.lg-doc', { y: 80, opacity: 0, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' }), 'top 90%');
  clauses.forEach((c) => { const n = $('.cl-short', c); if (n) when(c, () => gsap.from(n, { y: -30, rotation: 12, opacity: 0, duration: .8, ease: 'back.out(1.8)', clearProps: 'transform,opacity' }), 'top 80%'); });
})();
