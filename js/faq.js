/* =========================================================
   ANGEOLOGY — faq.js (faq.html; needs main.js)
   Pillow talk: search the interview (empty chapters fold away),
   faq.html#q-<id> jumps to one answer and makes it glow.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, safeTimeline, when } = A;
  $$('.slot').forEach(fillSlot);
  const qas = $$('.qa');
  const chapters = $$('.chapter');
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  qas.forEach((q) => { q._q = $('.qa-text', q).textContent; q._text = norm(q.textContent); });

  function apply() {
    const words = norm($('#fqQ').value.trim()).split(/\s+/).filter((w) => w.length > 1)
      .map((w) => (w.length > 4 ? w.replace(/(es|s)$/, '') : w));   // lashes → lash, returns → return
    const re = words.length && new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
    let n = 0;
    qas.forEach((q) => {
      const ok = words.every((w) => q._text.includes(w));
      q.hidden = !ok; if (ok) n++;
      $('.qa-text', q).innerHTML = re ? q._q.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(re, '<mark>$1</mark>') : q._q.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    });
    chapters.forEach((c) => {
      const empty = !$$('.qa', c).some((q) => !q.hidden);
      c.hidden = empty;
      const pull = $(`.pull[data-after="${c.dataset.cat}"]`); if (pull) pull.hidden = !!words.length;   // quotes only when reading everything
      const link = $(`.pt-toc a[href="#${c.id}"]`); if (link) link.classList.toggle('is-empty', empty);
    });
    $('#fqNone').hidden = n > 0;
    $('#fqCount').textContent = n === qas.length ? `${n} questions, all answered` : `${n} of ${qas.length} questions match`;
  }
  $('#fqQ').addEventListener('input', apply);
  $('#fqQ').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const first = qas.find((q) => !q.hidden);
    if (first) first.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
  });
  apply();

  function flash(q) {
    q.classList.add('flash');
    setTimeout(() => q.classList.remove('flash'), 2200);
  }
  function openHash() {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (!el || !el.classList.contains('qa')) return;
    if (el.hidden) { $('#fqQ').value = ''; apply(); }
    setTimeout(() => { el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' }); flash(el); }, 300);
  }
  openHash();
  addEventListener('hashchange', openHash);

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.pt-photo', { xPercent: 12, rotationY: -40, transformPerspective: 1400, transformOrigin: 'right center', opacity: 0, duration: 1.3, ease: 'power3.out' }, 0)
      .from('.pt-page', { xPercent: -8, rotationY: 30, transformPerspective: 1400, transformOrigin: 'left center', opacity: 0, duration: 1.3, ease: 'power3.out' }, .1)
      .from('.pt-kicker', { scaleX: 0, transformOrigin: 'left', duration: .8, ease: 'power3.inOut' }, .6)
      .from('.pt-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .7)
      .from('.pt-stand, .pt-search, .pt-toc li', { y: 20, opacity: 0, duration: .6, stagger: .07 }, 1.1);
  };
  chapters.forEach((c) => when(c, () => {
    gsap.from($('.ch-n', c), { yPercent: 60, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from($$('.qa', c), { y: 40, opacity: 0, duration: .7, stagger: .08, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity' });
  }, 'top 80%'));
  $$('.pull').forEach((p) => when(p, () => gsap.from($('blockquote', p), { scale: .9, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity' })));
  when('.fq-write', () => gsap.from('.fq-write-card', { y: 80, scale: .94, opacity: 0, duration: 1, ease: 'back.out(1.3)', clearProps: 'transform,opacity' }));
})();
