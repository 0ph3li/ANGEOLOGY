/* =========================================================
   ANGEOLOGY — collections.js (collections.html; needs main.js + products.js)
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, when, safeTimeline, bag } = A;
  const byId = Object.fromEntries(ANGEOLOGY_PRODUCTS.map((p) => [p.id, p]));
  const cols = ANGEOLOGY_COLLECTIONS;
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- the fanned deck on the cover ---------- */
  $('#fan').innerHTML = cols.map((c, i) => `
    <a class="fan-card" href="#${c.id}" style="--i:${i}" aria-label="The ${c.name}">
      <span class="fan-num">${c.num}</span>
      <span class="fan-art"><span class="slot" data-img="${c.img}" data-alt="The ${c.name}" data-ratio="2 / 3"><span class="slot-label">img/${c.img}</span></span></span>
      <span class="fan-name">The ${c.name}</span>
    </a>`).join('');

  /* ---------- contents ---------- */
  $('#colIndex').innerHTML = `<ol>${cols.map((c) => `
    <li><a href="#${c.id}"><span class="ci-num">${c.num}</span><span class="ci-name">The <em class="script">${c.name}</em></span><span class="ci-count">${c.products.length} products</span></a></li>`).join('')}</ol>`;

  /* ---------- chapters ---------- */
  const thumb = (p) => p.palette
    ? `<span class="rt-palette">${['03', '07', '09', '11'].map((n) => `<span style="background-image:url(img/palette-${n}.jpg)"></span>`).join('')}</span>`
    : `<span class="slot cutout" data-img="${p.img}" data-alt="${esc(p.name)}" data-ratio="1 / 1"><span class="slot-label">${p.img}</span></span>`;

  $('#chapters').innerHTML = cols.map((c, i) => `
    <section class="chapter ch-${c.id} ${i % 2 ? 'flip' : ''}" id="${c.id}" aria-labelledby="t-${c.id}">
      <span class="ch-numeral" aria-hidden="true">${c.num}</span>
      <div class="ch-grid">
        <div class="ch-visual">
          <figure class="ch-arch">
            <div class="slot" data-img="${c.img}" data-alt="The ${c.name} collection" data-ratio="3 / 4"><span class="slot-label">img/${c.img}</span></div>
          </figure>
          <figure class="polaroid ch-polaroid">
            <span class="tape tape-tl"></span>
            <div class="slot" data-img="${c.photo}" data-alt="Mood board for The ${c.name} collection" data-ratio="1 / 1"><span class="slot-label">img/${c.photo}<br><small>1 : 1</small></span></div>
            <figcaption>${c.name.toLowerCase()} mood</figcaption>
          </figure>
          <img src="img/deco/${c.deco}" alt="" class="ch-deco">
        </div>
        <div class="ch-text">
          <p class="sec-num">${String(i + 2).padStart(2, '0')}</p>
          <h2 class="ch-title" id="t-${c.id}"><span class="ch-the">The</span> <em class="script">${c.name}</em></h2>
          <p class="ch-lede">${esc(c.lede)}</p>
          <div class="ch-fortune">
            <p class="ch-kicker">your fortune</p>
            <p class="ch-quote">“${esc(c.fortune)}”</p>
            <dl><dt>upright</dt><dd>${esc(c.upright)}</dd><dt>reversed</dt><dd>${esc(c.reversed)}</dd></dl>
          </div>
          <ul class="ch-mood">${c.mood.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ch-ritual">
        <p class="ch-kicker">the ritual · ${c.products.length} steps</p>
        <ol class="rt-list">${c.products.map((id, k) => { const p = byId[id]; return `
          <li class="rt-item" data-id="${p.id}">
            <a class="rt-thumb p-${p.cat}" href="shop.html?p=${p.id}" aria-label="${esc(p.name)}">${thumb(p)}</a>
            <span class="rt-step">step ${k + 1}</span>
            <a class="rt-name" href="shop.html?p=${p.id}">${esc(p.name)}</a>
            <span class="rt-meta">${p.palette ? '12 pans' : esc(p.shades[0][0])} · € ${p.price}</span>
            <button type="button" class="rt-add" aria-label="Add ${esc(p.name)} to bag">+</button>
          </li>`; }).join('')}
        </ol>
        <a class="btn btn-fill" href="shop.html#${c.id}">Shop The ${c.name} <span class="arrow"></span></a>
      </div>
    </section>`).join('');

  $$('.slot').forEach(fillSlot);

  /* ---------- add from the ritual list ---------- */
  const toast = $('#toast');
  let toastT;
  function say(html) {
    toast.innerHTML = html; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  $('#chapters').addEventListener('click', (e) => {
    const b = e.target.closest('.rt-add'); if (!b) return;
    const p = byId[b.closest('.rt-item').dataset.id];
    const shade = p.palette ? '12 pans' : p.shades[0][0];
    bag.add(p.id, shade, 1);
    b.classList.add('done'); b.textContent = '✓';
    setTimeout(() => { b.classList.remove('done'); b.textContent = '+'; }, 1600);
    if (motion) gsap.fromTo(b.closest('.rt-item').querySelector('.rt-thumb'), { scale: .9, rotation: -6 }, { scale: 1, rotation: 0, duration: .7, ease: 'elastic.out(1, .45)' });
    say(`<b>${esc(p.name)}</b> is in your bag ♡ <a href="cart.html">view bag</a>`);
  });

  /* ---------- quiz ---------- */
  const form = $('#quizForm'), result = $('#quizResult');
  form.addEventListener('change', (e) => { const f = e.target.closest('.q'); if (f) f.classList.add('answered'); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const answers = [0, 1, 2].map((q) => (form.querySelector(`input[name="q${q}"]:checked`) || {}).value);
    if (answers.some((a) => !a)) { $('#quizMsg').textContent = 'Answer all three — the cards need to know ♡'; return; }
    $('#quizMsg').textContent = '';
    const score = {}; answers.forEach((a) => { score[a] = (score[a] || 0) + 1; });
    const winner = cols.slice().sort((a, b) => (score[b.id] || 0) - (score[a.id] || 0))[0];
    A.store.set('angeology-card', winner.id);        // shown on the account page
    result.innerHTML = `
      <div class="qr-card">
        <span class="qr-inner">
          <span class="qr-back"><img src="img/deco/wings.png" alt=""><span class="script">your card is…</span></span>
          <span class="qr-front">
            <span class="fan-num">${winner.num}</span>
            <span class="fan-art"><span class="slot" data-img="${winner.img}" data-alt="The ${winner.name}" data-ratio="2 / 3"><span class="slot-label">img/${winner.img}</span></span></span>
            <span class="fan-name">The ${winner.name}</span>
          </span>
        </span>
      </div>
      <div class="qr-text">
        <p class="ch-kicker">you are</p>
        <p class="qr-title">The <em class="script">${winner.name}</em></p>
        <p class="ch-quote">“${esc(winner.fortune)}”</p>
        <div class="btn-row">
          <a class="btn btn-fill" href="shop.html#${winner.id}">Shop your collection <span class="arrow"></span></a>
          <a class="btn btn-line" href="#${winner.id}">Read your chapter <span class="arrow"></span></a>
        </div>
      </div>`;
    fillSlot(result.querySelector('.slot'));
    result.classList.add('show');
    const card = result.querySelector('.qr-card');
    requestAnimationFrame(() => setTimeout(() => card.classList.add('turned'), 350));
    if (motion) gsap.from('.qr-text > *', { y: 24, opacity: 0, duration: .7, stagger: .08, delay: .9, ease: 'power3.out', clearProps: 'all' });
    setTimeout(() => $$('.qr-text > *').forEach((el) => { el.style.opacity = ''; el.style.transform = ''; }), 3000);
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.wave-col path', { strokeDasharray: '0 4000', duration: 2.2, ease: 'power2.inOut', stagger: .2 }, 0)
      .from('.col-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.col-title .hl-in', { yPercent: 70, rotation: 4, opacity: 0, duration: 1.1, stagger: .14, ease: 'power4.out' }, .2)
      .from('.col-sub, .col-hero .btn', { y: 20, opacity: 0, duration: .7, stagger: .1 }, .7)
      .from('.fan-card', { x: 0, y: 140, rotation: 0, opacity: 0, duration: 1.1, stagger: { each: .12, from: 'end' }, ease: 'back.out(1.3)' }, .4);
  };
  when('#colIndex', () => gsap.from('#colIndex li', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }), 'top 88%');
  $$('.chapter').forEach((ch) => {
    when(ch, () => {
      gsap.from(ch.querySelector('.ch-arch'), { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.3, ease: 'power3.inOut' });
      gsap.from(ch.querySelector('.ch-polaroid'), { y: -160, rotation: -24, opacity: 0, duration: 1.1, delay: .5, ease: 'back.out(1.3)' });
      gsap.from(ch.querySelector('.ch-deco'), { scale: 0, rotation: -60, duration: 1, delay: .8, ease: 'back.out(2)' });
      gsap.from(ch.querySelectorAll('.ch-text > *'), { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' });
    }, 'top 70%');
    when(ch.querySelector('.ch-ritual'), () => gsap.from(ch.querySelectorAll('.rt-item'), { y: 60, opacity: 0, rotation: () => gsap.utils.random(-6, 6), duration: .8, stagger: .1, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }), 'top 88%');
    if (motion && window.ScrollTrigger) gsap.fromTo(ch.querySelector('.ch-numeral'), { yPercent: -18 }, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  when('.quiz-form', () => gsap.from('.q', { y: 50, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out' }), 'top 85%');
})();
