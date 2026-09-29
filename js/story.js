/* =========================================================
   ANGEOLOGY — story.js (about.html; needs main.js)
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, when, safeTimeline } = A;
  $$('.slot').forEach(fillSlot);

  /* ---------- intro: the diary opens ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.st-head .sec-num', { y: 14, opacity: 0, duration: .6 }, 0)
      .from('.st-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .1)
      .from('.st-sub', { y: 16, opacity: 0, duration: .7 }, .5)
      .from('.dp-left', { rotationY: 90, transformOrigin: '100% 50%', transformPerspective: 1600, duration: 1.3, ease: 'power3.out' }, .5)
      .from('.dp-right', { rotationY: -90, transformOrigin: '0% 50%', transformPerspective: 1600, duration: 1.3, ease: 'power3.out' }, .5)
      .from('.dp-line', { clipPath: 'inset(0 100% 0 0)', duration: .9, stagger: .35, ease: 'power2.inOut' }, 1.2)
      .from('.dp-sign', { opacity: 0, x: -20, duration: .7 }, 2.2)
      .from('.dp-polaroid', { y: -120, rotation: -20, opacity: 0, duration: 1.1, ease: 'back.out(1.4)' }, 1.1)
      .from('.dp-bow', { y: -160, rotation: -40, opacity: 0, duration: 1.1, ease: 'bounce.out' }, 1.5)
      .from('.dp-pearl', { scale: 0, duration: .6, ease: 'back.out(3)' }, 1.8);
  };

  /* ---------- the string of pearls unrolls as you scroll ---------- */
  if (motion && window.ScrollTrigger) {
    const path = $('#stringPath');
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#entries', start: 'top 70%', end: 'bottom 70%', scrub: true } });
  }
  $$('.entry').forEach((e, i) => when(e, () => {
    gsap.from(e.querySelector('.entry-pearl'), { scale: 0, duration: .7, ease: 'back.out(3)' });
    gsap.from(e.querySelector('.entry-card'), { x: i % 2 ? 70 : -70, opacity: 0, rotation: i % 2 ? 3 : -3, duration: 1, ease: 'power3.out' });
    const side = e.querySelector('.entry-photo, .entry-deco');
    if (side) gsap.from(side, { y: -120, rotation: i % 2 ? -18 : 18, opacity: 0, duration: 1.1, delay: .25, ease: 'back.out(1.4)' });
  }, 'top 78%'));

  when('.letter-grid', () => {
    gsap.from('.founder .slot', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.3, ease: 'power3.inOut' });
    gsap.from('.founder-pin', { y: -100, rotation: 60, opacity: 0, duration: .9, delay: .6, ease: 'back.out(2)' });
    gsap.from('.founder-letter', { y: 80, rotation: 4, duration: 1.1, ease: 'power3.out' });
    gsap.from('.founder-letter > p', { y: 18, opacity: 0, duration: .6, stagger: .08, delay: .3, ease: 'power3.out' });
  });
  when('.notes', () => gsap.from('.note', { y: -90, rotation: () => gsap.utils.random(-14, 14), opacity: 0, duration: 1, stagger: .12, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }), 'top 80%');
  when('.team-list', () => gsap.from('.member', { y: 90, rotation: () => gsap.utils.random(-8, 8), opacity: 0, duration: 1, stagger: .12, ease: 'back.out(1.3)', clearProps: 'transform,opacity' }), 'top 82%');
  when('.studio-grid', () => {
    gsap.from('.studio-a .slot', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power3.inOut' });
    gsap.from('.studio-b', { y: -120, rotation: 20, opacity: 0, duration: 1.1, delay: .4, ease: 'back.out(1.4)' });
    gsap.from('.studio-text > *', { y: 24, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out' });
  });
  when('.next-page', () => gsap.from('.next-page > *', { y: 30, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out' }), 'top 85%');
})();
