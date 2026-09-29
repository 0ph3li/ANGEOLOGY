/* =========================================================
   ANGEOLOGY — contact.js (contact.html; needs main.js)
   The form is not connected to a service yet: nothing is sent,
   it only shows the "sent" state. Wire it to your form backend later.
   ========================================================= */
(() => {
  const { $, $$, motion, fillSlot, when, safeTimeline } = A;
  $$('.slot').forEach(fillSlot);

  const form = $('#letterPaper'), sent = $('#sent'), err = $('#lpError');
  const msg = $('#msg'), count = $('#msgCount'), orderField = $('#orderField');
  const topicNames = { order: 'your order', product: 'your product question', cruelty: 'your ingredient question', press: 'your press enquiry', collab: 'your collaboration idea', hi: 'your hello' };

  // the order number field only shows up when it's useful
  const syncTopic = () => { orderField.hidden = form.topic.value !== 'order'; };
  form.addEventListener('change', (e) => { if (e.target.name === 'topic') syncTopic(); });
  syncTopic();
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / 800`; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cName').value.trim(), email = $('#cEmail');   // (form.name is the form's own name, not the field)
    const problems = [];
    if (msg.value.trim().length < 5) problems.push('a few words in your letter');
    if (!name) problems.push('your name');
    if (!email.value || !email.checkValidity()) problems.push('an email we can write back to');
    if (problems.length) {
      err.textContent = 'Almost! We still need ' + problems.join(', ').replace(/, ([^,]*)$/, ' and $1') + ' ♡';
      if (motion) gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(2, .3)' });
      return;
    }
    err.textContent = '';
    $('#sentText').textContent = `Thank you, ${name}. An angel will reply to ${topicNames[form.topic.value]} at ${email.value} — usually within two working days.`;
    const show = () => {
      form.hidden = true; sent.hidden = false;
      if (motion) gsap.from('.sent > *', { y: 30, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', clearProps: 'all' });
    };
    if (!motion || document.hidden) return show();
    // fold the letter, then the big envelope flies off and comes back
    const tl = gsap.timeline({ onComplete: show });
    tl.to(form, { scaleY: .05, transformOrigin: '50% 0%', opacity: 0, duration: .6, ease: 'power3.in' })
      .to('#bigEnv', { x: 220, y: -420, rotation: 18, scale: .4, opacity: 0, duration: 1, ease: 'power2.in' }, 0)
      .set('#bigEnv', { x: 0, y: 140, rotation: 0, scale: .8 })
      .to('#bigEnv', { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.6)' });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 3000);
  });
  $('#writeAgain').addEventListener('click', () => {
    form.reset(); syncTopic(); count.textContent = '0 / 800';
    gsap.set(form, { clearProps: 'all' });
    sent.hidden = true; form.hidden = false;
    form.querySelector('textarea').focus();
  });

  /* ---------- intro + scroll ---------- */
  A.intro = () => {
    if (!motion || document.hidden) return;
    const tl = safeTimeline({ delay: .45, defaults: { ease: 'power3.out' } });
    tl.from('.wave-ct path', { strokeDasharray: '0 4000', duration: 2.2, ease: 'power2.inOut' }, 0)
      .from('.ct-hero .sec-num', { y: 14, opacity: 0, duration: .6 }, .1)
      .from('.ct-title .hl-in', { yPercent: 70, rotation: 3, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' }, .2)
      .from('.ct-lede', { y: 20, opacity: 0, duration: .7 }, .6)
      .from('.ways li', { x: -30, opacity: 0, duration: .6, stagger: .08 }, .8)
      .from('#bigEnv', { x: -260, y: 160, rotation: -24, opacity: 0, duration: 1.4, ease: 'power3.out' }, .5)
      .from('.float-heart', { scale: 0, duration: .6, stagger: .15, ease: 'back.out(3)' }, 1.4);
  };
  when('.letter-paper', () => gsap.from('.letter-paper', { y: 90, rotation: -3, duration: 1.1, ease: 'power3.out' }));
  when('.postcard', () => {
    gsap.from('.postcard', { rotationY: 70, transformPerspective: 1600, opacity: 0, duration: 1.2, ease: 'power3.out' });
    gsap.from('.pc-stamp', { scale: 2.4, opacity: 0, rotation: 40, duration: .5, delay: .9, ease: 'power4.in' });
  });
  when('.quick-list', () => gsap.from('.quick-list li', { x: 40, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' }), 'top 85%');
})();
