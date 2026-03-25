/* ─── CREOS MAIN JS ─── */

const SUPABASE_URL = 'https://hhwaambtzylvxdajirez.supabase.co/rest/v1/waitlist';
const SUPABASE_KEY = 'sb_publishable_CUJm8Nt27TByOmRUdYK7qw_hlsUhPZu';

/* ─── NAV SCROLL EFFECT ─── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function updateNav() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* ─── MOBILE MENU ─── */
(function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const overlay = document.querySelector('.nav-overlay');

  if (!hamburger || !mobileMenu) return;

  // Ensure menu is in the DOM flow before animating
  mobileMenu.classList.add('ready');

  function open() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? close() : open();
  });

  if (overlay) overlay.addEventListener('click', close);

  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* ─── SCROLL REVEAL ─── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ─── SCROLL INDICATOR ─── */
(function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  function check() {
    if (window.scrollY > 80) {
      indicator.classList.add('hidden');
    } else {
      indicator.classList.remove('hidden');
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ─── FAQ ACCORDION ─── */
(function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ─── PRICING TOGGLE ─── */
(function initPricingToggle() {
  const toggle = document.querySelector('.toggle-switch');
  if (!toggle) return;

  const monthlyPrices = { starter: '$19', pro: '$29' };
  const annualPrices  = { starter: '$15', pro: '$23' };

  const starterAmount = document.getElementById('starter-amount');
  const proAmount     = document.getElementById('pro-amount');
  const monthlyLabel  = document.getElementById('billing-monthly');
  const annualLabel   = document.getElementById('billing-annual');

  let isAnnual = false;

  toggle.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggle.classList.toggle('annual', isAnnual);
    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
    if (annualLabel) annualLabel.classList.toggle('active', isAnnual);
    if (starterAmount) starterAmount.textContent = isAnnual ? '15' : '19';
    if (proAmount) proAmount.textContent = isAnnual ? '23' : '29';
  });
})();

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = 'form-message ' + type;
  el.style.display = 'block';
}

/* ─── BIND ALL WAITLIST FORMS ─── */
(function bindForms() {
  document.querySelectorAll('.waitlist-form').forEach(form => {
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"]');
    // Support both inline .form-message and external .success-msg sibling
    const msg   = form.querySelector('.form-message') || form.nextElementSibling;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg(msg, 'Please enter a valid email address.', 'error');
        return;
      }
      const orig = btn.textContent;
      btn.textContent = 'Submitting…';
      btn.disabled = true;
      try {
        const res = await fetch(SUPABASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email })
        });
        const text = res.status === 409
          ? "You're already signed up."
          : "✓ You're in! We'll be in touch shortly.";
        form.style.display = 'none';
        showMsg(msg, text, 'success');
        if ((res.ok || res.status === 201) && typeof gtag === 'function') {
          gtag('event', 'sign_up', { method: 'waitlist' });
        }
      } catch (err) {
        console.error('Network error:', err);
        showMsg(msg, 'Network error. Please try again.', 'error');
      } finally {
        btn.textContent = orig;
        btn.disabled = false;
      }
    });
  });
})();

/* ─── ACTIVE NAV LINK ─── */
(function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Normalize href relative to root
    const normalized = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
    if (
      (normalized === '/' && (path === '' || path === '/' || path.endsWith('index.html'))) ||
      (normalized !== '/' && path.includes(normalized.replace('.html', '')))
    ) {
      a.classList.add('active');
    }
  });
})();
