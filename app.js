/**
 * app.js — APEX Initiatives site logic.
 *
 * Requires branches.js (BRANCHES config) and the Supabase JS CDN
 * script to be loaded first. See index.html <head>.
 */

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────
// These are meant to be public: Supabase's "anon"/"publishable" key is
// designed to be shipped in client-side code and is safe to expose here —
// access is controlled by Row Level Security policies on the database
// itself, not by hiding this key. Never put a `service_role` secret key
// in front-end code.
//
// Fill these in with your project's real values before deploying.
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let db = null;
if (window.supabase && SUPABASE_URL.startsWith('http')) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.info('Supabase isn\'t configured yet — form submissions will just log to the console.');
}

async function dbInsert(table, data) {
  if (!db) {
    console.log(`[no-op insert] ${table}:`, data);
    return;
  }
  const { error } = await db.from(table).insert([data]);
  if (error) throw error;
}

// ─── VALIDATION ────────────────────────────────────────────────────────────
const RULES = {
  required: v => v.trim().length > 0 || 'This field is required.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
  checked: v => v === true || 'You need to agree to continue.',
};

function validateField(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return null;
}

function applyFieldError(input, errorEl, message) {
  input.classList.toggle('error', Boolean(message));
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('visible', Boolean(message));
  }
}

function bindField(input, rules, errorEl) {
  const run = () => {
    const val = input.type === 'checkbox' ? input.checked : input.value;
    const error = validateField(val, rules);
    applyFieldError(input, errorEl, error);
    return !error;
  };
  input.addEventListener('blur', run);
  input.addEventListener('input', () => { if (input.classList.contains('error')) run(); });
  return run;
}

function setLoading(btn, on) {
  btn.classList.toggle('loading', on);
  btn.disabled = on;
  btn.setAttribute('aria-busy', String(on));
}

function setFormAlert(el, type, msg) {
  el.className = `form-alert ${type} visible`;
  el.textContent = msg;
  el.setAttribute('role', 'alert');
}
function hideFormAlert(el) { el.classList.remove('visible'); }

// ─── TOAST ──────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(message, type = 'success') {
  let t = document.getElementById('global-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'global-toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  clearTimeout(toastTimer);
  t.textContent = message;
  t.className = `toast ${type}`;
  requestAnimationFrame(() => t.classList.add('show'));
  toastTimer = setTimeout(() => t.classList.remove('show'), 4000);
}

// ─── NAV ────────────────────────────────────────────────────────────────────
const nav = document.getElementById('main-nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

function toggleMenu(open) {
  const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
hamburger.addEventListener('click', () => toggleMenu());

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  toggleMenu(false);
  closeModal();
});

// ─── ROUTING ────────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === id));
  window.scrollTo({ top: 0, behavior: 'instant' });
  toggleMenu(false);
}
window.goHome = () => showPage('page-home');

function showBranch(id) {
  renderBranchPage(id);
  showPage('page-branch');
}
window.showBranch = showBranch;
window.showLegal = name => showPage('page-' + name);

function mobileNav(sectionId) {
  toggleMenu(false);
  setTimeout(() => scrollToSection(sectionId), 180);
}
function mobileBranch(id) {
  toggleMenu(false);
  setTimeout(() => showBranch(id), 180);
}
window.mobileNav = mobileNav;
window.mobileBranch = mobileBranch;

function scrollToSection(id) {
  const home = document.getElementById('page-home');
  const go = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!home.classList.contains('active')) {
    showPage('page-home');
    setTimeout(go, 100);
  } else {
    go();
  }
}
window.scrollToSection = scrollToSection;

// ─── RENDER: NAV PROGRAM MENU + FOOTER LINKS + HOME PROGRAM CARDS ─────────
function renderFromBranches() {
  const navMenu = document.getElementById('nav-programs-menu');
  const footerPrograms = document.getElementById('footer-programs');
  const mobilePrograms = document.getElementById('mobile-programs');
  const grid = document.getElementById('program-grid');

  Object.values(BRANCHES).forEach(b => {
    navMenu.insertAdjacentHTML('beforeend', `
      <button class="nav-menu-item" role="menuitem" onclick="showBranch('${b.id}')">
        ${b.name}<span class="item-sub">${b.tagline}</span>
      </button>`);

    footerPrograms.insertAdjacentHTML('beforeend', `
      <button onclick="showBranch('${b.id}')">${b.name}</button>`);

    mobilePrograms.insertAdjacentHTML('beforeend', `
      <button class="mobile-menu-item" onclick="mobileBranch('${b.id}')">${b.name}</button>`);

    grid.insertAdjacentHTML('beforeend', `
      <button class="program-card ${b.color}" onclick="showBranch('${b.id}')">
        <div class="icon-mark ${b.color}">${b.shortName.slice(0, 2).toUpperCase()}</div>
        <h3>${b.name}</h3>
        <p>${b.description}</p>
        <span class="link">Learn more →</span>
      </button>`);
  });
}

// ─── RENDER: BRANCH PAGE TEMPLATE ──────────────────────────────────────────
function renderBranchPage(id) {
  const b = BRANCHES[id];
  if (!b) return;

  document.getElementById('branch-tag').textContent = b.name;
  document.getElementById('branch-tag').className = `branch-tag ${b.color}`;
  document.getElementById('branch-h1').textContent = b.tagline;
  document.getElementById('branch-sub').textContent = b.description;
  document.getElementById('branch-cta').className = `btn btn-${b.color === 'purple' ? 'primary' : b.color}`;

  const offerGrid = document.getElementById('branch-offer-grid');
  offerGrid.innerHTML = b.offerings.map(o => `
    <div class="offer-tile">
      <span class="offer-tag ${b.color}">${o.tag}</span>
      <h3>${o.title}</h3>
      <p>${o.body}</p>
    </div>`).join('');

  document.getElementById('branch-form-title').textContent = `Sign up for ${b.name}`;
  document.getElementById('branch-submit').className = `btn btn-${b.color === 'purple' ? 'primary' : b.color} btn-full`;

  const extraWrap = document.getElementById('branch-extra-field');
  extraWrap.innerHTML = '';
  if (b.formExtraField) {
    extraWrap.innerHTML = `
      <div class="form-group">
        <label for="branch-extra-input">${b.formExtraField.label}</label>
        <input class="form-control" type="text" id="branch-extra-input" name="${b.formExtraField.name}" placeholder="${b.formExtraField.placeholder}" />
      </div>`;
  }

  const form = document.getElementById('form-branch');
  form.dataset.branch = b.id;
  form.reset();
  form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  hideFormAlert(form.querySelector('.form-alert'));
}

// ─── FORM: BRANCH SIGNUP (shared template) ─────────────────────────────────
(function initBranchForm() {
  const form = document.getElementById('form-branch');
  if (!form) return;
  const alertEl = form.querySelector('.form-alert');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideFormAlert(alertEl);

    const validators = [
      bindField(form.querySelector('[name="full_name"]'), [RULES.required], form.querySelector('[data-error="full_name"]')),
      bindField(form.querySelector('[name="email"]'), [RULES.required, RULES.email], form.querySelector('[data-error="email"]')),
      bindField(form.querySelector('[name="country"]'), [RULES.required], form.querySelector('[data-error="country"]')),
    ];
    if (!validators.map(v => v()).every(Boolean)) {
      setFormAlert(alertEl, 'error', 'Please fix the fields above before submitting.');
      return;
    }

    setLoading(submitBtn, true);
    const branchId = form.dataset.branch;
    const b = BRANCHES[branchId];
    try {
      const data = Object.fromEntries(new FormData(form));
      await dbInsert('student_signups', { program: branchId, ...data });
      form.reset();
      showModal('signup', b);
    } catch (err) {
      console.error(err);
      setFormAlert(alertEl, 'error', `Something went wrong. Try again, or email ${b.email} directly.`);
    } finally {
      setLoading(submitBtn, false);
    }
  });
})();

// ─── FORM: VOLUNTEER ────────────────────────────────────────────────────────
(function initVolunteerForm() {
  const form = document.getElementById('form-volunteer');
  if (!form) return;
  const alertEl = form.querySelector('.form-alert');
  const submitBtn = form.querySelector('[type="submit"]');

  const validators = [
    bindField(form.querySelector('[name="full_name"]'), [RULES.required], form.querySelector('[data-error="full_name"]')),
    bindField(form.querySelector('[name="email"]'), [RULES.required, RULES.email], form.querySelector('[data-error="email"]')),
    bindField(form.querySelector('[name="institution"]'), [RULES.required], form.querySelector('[data-error="institution"]')),
    bindField(form.querySelector('[name="role"]'), [RULES.required], form.querySelector('[data-error="role"]')),
    bindField(form.querySelector('[name="branch"]'), [RULES.required], form.querySelector('[data-error="branch"]')),
    bindField(form.querySelector('[name="consent"]'), [RULES.checked], form.querySelector('[data-error="consent"]')),
  ];

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideFormAlert(alertEl);
    if (!validators.map(v => v()).every(Boolean)) {
      setFormAlert(alertEl, 'error', 'Please complete all required fields.');
      return;
    }
    setLoading(submitBtn, true);
    try {
      const fd = new FormData(form);
      await dbInsert('volunteer_applications', {
        full_name: fd.get('full_name'),
        email: fd.get('email'),
        institution: fd.get('institution'),
        role: fd.get('role'),
        branch: fd.get('branch'),
        why: fd.get('why') || '',
        consent: fd.get('consent') === 'on',
      });
      form.reset();
      showModal('volunteer');
    } catch (err) {
      console.error(err);
      setFormAlert(alertEl, 'error', 'Submission failed. Try again, or email hello@apexinitiatives.org.');
    } finally {
      setLoading(submitBtn, false);
    }
  });
})();

// ─── DONATE ─────────────────────────────────────────────────────────────────
let selectedAmount = 100;

document.querySelectorAll('.donate-amount').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.donate-amount').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    selectedAmount = parseInt(btn.dataset.amount, 10);
    const custom = document.getElementById('donate-custom');
    if (custom) custom.value = '';
  });
});

(function initDonateForm() {
  const form = document.getElementById('form-donate');
  if (!form) return;
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const customInput = document.getElementById('donate-custom');
    const customVal = customInput ? parseFloat(customInput.value) : NaN;
    const amount = !isNaN(customVal) && customVal > 0 ? customVal : selectedAmount;
    if (!amount || amount < 1) {
      showToast('Choose or enter a donation amount.', 'error');
      return;
    }
    setLoading(submitBtn, true);
    try {
      await dbInsert('donation_intents', { amount, frequency: 'once' });
      showModal('donate');
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
})();

// ─── MODAL ──────────────────────────────────────────────────────────────────
let lastFocused;

const MODAL_COPY = {
  signup: b => ({
    color: b.color,
    eyebrow: `${b.name} · Request received`,
    title: 'You\u2019re on the list.',
    body: `We\u2019ll follow up by email within a couple of business days with next steps. Questions in the meantime: <strong>${b.email}</strong>.`,
  }),
  volunteer: () => ({
    color: 'green',
    eyebrow: 'Application received',
    title: 'Thanks for applying.',
    body: 'We review applications on a rolling basis and follow up by email either way. Questions: <strong>hello@apexinitiatives.org</strong>.',
  }),
  donate: () => ({
    color: 'amber',
    eyebrow: 'Donation · Thank you',
    title: 'Thanks for the support.',
    body: 'A receipt will be sent to the email associated with your payment. Questions: <strong>donate@apexinitiatives.org</strong>.',
  }),
  contact: () => null, // uses static markup
};

function showModal(type, branch) {
  lastFocused = document.activeElement;
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-dynamic-body');
  const staticEl = document.getElementById('modal-contact-static');

  staticEl.hidden = (type !== 'contact');
  body.hidden = (type === 'contact');

  if (type !== 'contact') {
    const copy = MODAL_COPY[type](branch);
    body.innerHTML = `
      <p class="modal-eyebrow ${copy.color}">${copy.eyebrow}</p>
      <h2 class="modal-title" id="modal-title">${copy.title}</h2>
      <p class="modal-body">${copy.body}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Close</button>
      </div>`;
  }

  overlay.classList.add('open');
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('button, [href], input')?.focus();
}
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
  lastFocused?.focus();
}
window.showModal = showModal;
window.closeModal = closeModal;

document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ─── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderFromBranches();
  const defaultAmount = document.querySelector('.donate-amount[data-amount="100"]');
  if (defaultAmount) {
    defaultAmount.classList.add('selected');
    defaultAmount.setAttribute('aria-pressed', 'true');
  }
});
