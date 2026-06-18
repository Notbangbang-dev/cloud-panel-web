/* Cloud Panel website — interactions (shared by landing + docs) */
(function () {
  'use strict';

  /* ---- Central links: set these once to update the whole site ---- */
  const SITE = {
    discord: 'https://discord.gg/zuD93ztesn',
    botInvite: 'https://discord.com/oauth2/authorize?client_id=1517089584016523395&permissions=8&integration_type=0&scope=bot+applications.commands',
    github: '', // set to your repo URL once it's created, e.g. 'https://github.com/you/cloud-panel'
  };
  if (SITE.discord) document.querySelectorAll('[data-discord]').forEach((a) => (a.href = SITE.discord));
  if (SITE.botInvite) document.querySelectorAll('[data-bot-invite]').forEach((a) => (a.href = SITE.botInvite));
  if (SITE.github) document.querySelectorAll('[data-github]').forEach((a) => (a.href = SITE.github));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---- Year ---- */
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---- Nav: scrolled state + mobile menu ---- */
  const nav = $('#nav');
  const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('#menuToggle');
  const links = $('#navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', (e) => { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); maybeCount(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---- Animated counters ---- */
  function maybeCount(scope) {
    $$('[data-count]', scope).forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1200; const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---- Hero typing effect ---- */
  const typed = $('#typed');
  if (typed) {
    const cmds = ['say Welcome to the network!', 'list', 'tps', 'restart', 'help'];
    let ci = 0, chi = 0, deleting = false;
    const loop = () => {
      const cur = cmds[ci];
      typed.textContent = cur.slice(0, chi);
      if (!deleting && chi < cur.length) { chi++; setTimeout(loop, 60 + Math.random() * 50); }
      else if (!deleting && chi === cur.length) { deleting = true; setTimeout(loop, 1600); }
      else if (deleting && chi > 0) { chi--; setTimeout(loop, 28); }
      else { deleting = false; ci = (ci + 1) % cmds.length; setTimeout(loop, 350); }
    };
    setTimeout(loop, 900);
  }

  /* ---- Copy buttons ---- */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard?.writeText(text).then(() => {
        const old = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        setTimeout(() => (btn.innerHTML = old), 1500);
      });
    });
  });

  /* ---- Docs: scrollspy + active sidebar link ---- */
  const sideLinks = $$('.docs-side a[href^="#"]');
  if (sideLinks.length) {
    const map = new Map();
    sideLinks.forEach((a) => { const el = document.getElementById(a.getAttribute('href').slice(1)); if (el) map.set(el, a); });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          sideLinks.forEach((a) => a.classList.remove('active'));
          const a = map.get(en.target); if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    map.forEach((_, el) => spy.observe(el));
  }
})();
