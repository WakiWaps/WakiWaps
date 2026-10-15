'use strict';
const rowsElement = document.getElementById('sample-rows');
const errorButton = document.getElementById('sample-error');
const resetButton = document.getElementById('sample-reset');
const actionButton = document.getElementById('lab-action');
const statusElement = document.getElementById('lab-status');
const statusText = document.getElementById('lab-status-text');
let rows = WorkflowLab.samples();
let phase = 'edit';
let hasError = false;

function renderRows() {
  rowsElement.replaceChildren();
  WorkflowLab.validate(rows).forEach(row => {
    const tr = document.createElement('tr');
    const sku = document.createElement('td');
    const buffer = document.createElement('td');
    const state = document.createElement('td');
    const badge = document.createElement('span');
    sku.textContent = row.sku;
    buffer.textContent = String(row.buffer).padStart(2, '0');
    badge.className = row.valid ? 'row-badge valid' : 'row-badge invalid';
    badge.textContent = row.valid ? '✓ Valid' : '! Check';
    if (!row.valid) badge.title = row.errors.join(', ');
    state.append(badge);
    tr.append(sku, buffer, state);
    if (!row.valid) tr.className = 'invalid-row';
    rowsElement.append(tr);
  });
}
function setStatus(message, kind = '') {
  statusText.textContent = message;
  statusElement.className = 'lab-status' + (kind ? ' ' + kind : '');
}
function setAction(label) {
  actionButton.replaceChildren(document.createTextNode(label + ' '));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.classList.add('icon');
  use.setAttribute('href', '#arrow-right');
  svg.append(use);
  actionButton.append(svg);
}
function returnToEdit() {
  phase = 'edit';
  setAction('Preview changes');
  setStatus('3 sample rows. Ready for preview.');
  renderRows();
}
errorButton.addEventListener('click', () => {
  hasError = !hasError;
  rows[1].buffer = hasError ? -8 : 8;
  errorButton.textContent = hasError ? '− Fix the sample error' : '+ Add a sample error';
  errorButton.setAttribute('aria-pressed', String(hasError));
  returnToEdit();
});
resetButton.addEventListener('click', () => {
  rows = WorkflowLab.samples();
  hasError = false;
  errorButton.textContent = '+ Add a sample error';
  errorButton.setAttribute('aria-pressed', 'false');
  returnToEdit();
});
actionButton.addEventListener('click', () => {
  if (phase === 'done') { resetButton.click(); return; }
  const result = WorkflowLab.validate(rows);
  const issues = result.filter(row => !row.valid).length;
  if (issues) {
    phase = 'edit';
    setStatus('1 issue: buffer values cannot be negative. Fix it to continue.', 'error');
    setAction('Check again');
    return;
  }
  if (phase === 'preview') {
    phase = 'done';
    setStatus('3 changes applied to this demo. Nothing is sent to a server.', 'success');
    setAction('Try again');
  } else {
    phase = 'preview';
    setStatus('Preview passed. 3 valid rows, 0 issues. Ready to confirm.', 'success');
    setAction('Confirm sample changes');
  }
});
renderRows();
document.getElementById('year').textContent = String(new Date().getFullYear());

const cases = {
  buffer: {
    category: '01 / APPLICATION DEVELOPMENT', title: 'Buffer Stock Configuration',
    intro: 'A configuration tool for e-commerce inventory workflows, combining a web interface, a FastAPI backend, and BigQuery integration.',
    sections: [], walkthrough: 'buffer-walkthrough',
    tags: ['Python', 'FastAPI', 'BigQuery', 'HTML / CSS / JavaScript', 'Testing']
  },
  exemption: {
    category: '02 / BACKEND & OPERATIONS', title: 'Product Exemption',
    intro: 'An interface for managing SKU-level product exemptions by marketplace, store, and brand, with spreadsheet previews before confirmation.',
    sections: [], walkthrough: 'exemption-walkthrough',
    tags: ['Python', 'FastAPI', 'BigQuery', 'HTML / CSS / JavaScript', 'Validation']
  },
  helpdesk: {
    category: '03 / IT OPERATIONS', title: 'osTicket Administration & Workflow Maintenance',
    intro: 'I administer an existing osTicket helpdesk, maintaining request forms and ticket-assignment workflows as team requirements change. I configure filters that evaluate submitted ticket details and assign matching requests to designated support agents. My work also includes updating form fields and dropdown options to suit users’ and agents’ needs.',
    sections: [], walkthrough: 'helpdesk-walkthrough',
    tags: ['osTicket', 'Administration', 'Request forms', 'Ticket routing']
  }
};
const dialog = document.getElementById('case-dialog');
const caseContent = document.getElementById('case-content');
const imageDialog = document.getElementById('image-dialog');
const expandedImage = document.getElementById('expanded-image');
const imageViewport = document.getElementById('image-viewport');
const imageZoom = document.getElementById('image-zoom');
let imageTrigger = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = { transition: 240, reveal: 300, easing: 'cubic-bezier(.4, 0, .2, 1)' };
const closingDialogs = new Map();

function openDialog(element) {
  element.classList.remove('is-closing');
  element.showModal();
}

function closeDialog(element) {
  if (!element.open || closingDialogs.has(element)) return;
  if (reducedMotion.matches) { element.close(); return; }
  // Keep the native modal and its focus containment active through the exit.
  element.classList.add('is-closing');
  const timer = window.setTimeout(() => element.close(), motion.transition);
  closingDialogs.set(element, timer);
}

[dialog, imageDialog].forEach(element => {
  element.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || (element === dialog && imageDialog.open)) return;
    const controls = [...element.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]')]
      .filter(control => control.tabIndex >= 0 && !control.disabled && !control.closest('[inert]') &&
        (control.checkVisibility ? control.checkVisibility() : control.getClientRects().length > 0));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  element.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog(element);
  });
  element.addEventListener('close', () => {
    window.clearTimeout(closingDialogs.get(element));
    closingDialogs.delete(element);
    element.classList.remove('is-closing');
  });
});

function syncDialogScrollLock() {
  document.body.classList.toggle('dialog-open', dialog.open || imageDialog.open);
}
let lastTrigger = null;
document.querySelectorAll('[data-case]').forEach(button => {
  button.addEventListener('click', () => {
    const data = cases[button.dataset.case];
    if (!data) return;
    caseContent.replaceChildren();
    const category = document.createElement('p');
    category.className = 'eyebrow';
    category.textContent = data.category;
    const title = document.createElement('h2');
    title.id = 'case-title';
    title.textContent = data.title;
    const intro = document.createElement('p');
    intro.className = 'case-intro';
    intro.textContent = data.intro;
    caseContent.append(category, title, intro);
    data.sections.forEach(([heading, body]) => {
      const section = document.createElement('details');
      section.className = 'walkthrough-disclosure case-note';
      section.open = true;
      const summary = document.createElement('summary');
      const h3 = document.createElement('h3');
      h3.textContent = heading;
      const content = document.createElement('div');
      content.className = 'disclosure-body';
      const p = document.createElement('p');
      p.textContent = body;
      summary.append(h3);
      content.append(p);
      section.append(summary, content);
      caseContent.append(section);
    });
    const tags = document.createElement('div');
    tags.className = 'tags';
    data.tags.forEach(tag => { const span = document.createElement('span'); span.textContent = tag; tags.append(span); });
    caseContent.append(tags);
    if (data.walkthrough) caseContent.append(document.getElementById(data.walkthrough).content.cloneNode(true));
    dialog.classList.toggle('case-walkthrough', Boolean(data.walkthrough));
    lastTrigger = button;
    openDialog(dialog);
    caseContent.scrollTop = 0;
    syncDialogScrollLock();
    document.getElementById('close-dialog').focus();
    if (data.walkthrough === 'helpdesk-walkthrough' && revealObserver) {
      caseContent.querySelectorAll('.helpdesk-example').forEach(section => revealObserver.observe(section));
    }
  });
});
document.getElementById('close-dialog').addEventListener('click', () => closeDialog(dialog));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
});
dialog.addEventListener('close', () => {
  if (revealObserver) caseContent.querySelectorAll('.helpdesk-example').forEach(section => revealObserver.unobserve(section));
  syncDialogScrollLock();
  if (lastTrigger && !imageDialog.open) lastTrigger.focus({ preventScroll: true });
});

// Retain native modal behavior and restore the exact thumbnail after closing.
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-enlarge-image]');
  if (!trigger) return;
  const image = trigger.querySelector('img');
  if (!image) return;
  imageTrigger = trigger;
  expandedImage.src = image.currentSrc || image.src;
  expandedImage.alt = image.alt;
  expandedImage.width = Number(image.getAttribute('width'));
  expandedImage.height = Number(image.getAttribute('height'));
  imageViewport.style.setProperty('--image-width', expandedImage.width + 'px');
  imageViewport.classList.remove('is-zoomed');
  imageZoom.setAttribute('aria-pressed', 'false');
  imageZoom.textContent = 'View full size';
  document.getElementById('image-title').textContent = trigger.dataset.imageTitle;
  document.getElementById('image-caption').textContent = trigger.dataset.imageCaption;
  openDialog(imageDialog);
  imageViewport.scrollTo(0, 0);
  syncDialogScrollLock();
  document.getElementById('close-image').focus();
});
document.getElementById('close-image').addEventListener('click', () => closeDialog(imageDialog));
imageDialog.addEventListener('click', event => {
  if (event.target !== imageDialog) return;
  const rect = imageDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(imageDialog);
});
imageDialog.addEventListener('close', () => {
  syncDialogScrollLock();
  if (imageTrigger && imageTrigger.isConnected) imageTrigger.focus({ preventScroll: true });
});
imageZoom.addEventListener('click', () => {
  const zoomed = imageViewport.classList.toggle('is-zoomed');
  imageZoom.setAttribute('aria-pressed', String(zoomed));
  imageZoom.textContent = zoomed ? 'Fit to width' : 'View full size';
  if (zoomed) {
    imageViewport.scrollLeft = (imageViewport.scrollWidth - imageViewport.clientWidth) / 2;
    imageViewport.scrollTop = (imageViewport.scrollHeight - imageViewport.clientHeight) / 2;
  } else imageViewport.scrollTo(0, 0);
  imageViewport.focus({ preventScroll: true });
});

// Follow the section in view without changing the URL or keyboard focus.
const navigationLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
const navigationSections = navigationLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let navigationFrame = null;
function updateNavigation() {
  navigationFrame = null;
  const headerHeight = document.querySelector('.site-header').offsetHeight;
  const marker = headerHeight + Math.min(window.innerHeight * .25, 180);
  let activeSection = navigationSections[0];
  navigationSections.forEach(section => {
    if (section.getBoundingClientRect().top <= marker) activeSection = section;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) activeSection = navigationSections[navigationSections.length - 1];
  navigationLinks.forEach(link => {
    if (activeSection && link.getAttribute('href') === '#' + activeSection.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleNavigationUpdate() {
  if (navigationFrame === null) navigationFrame = window.requestAnimationFrame(updateNavigation);
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
updateNavigation();

// Native details remain usable if enhancement is unavailable. Only the grouped
// body changes height; screenshots and their explanations share one transition.
const disclosureAnimations = new Map();
document.addEventListener('click', event => {
  const summary = event.target.closest('.walkthrough-disclosure > summary');
  if (!summary) return;
  const details = summary.parentElement;
  const body = summary.nextElementSibling;
  if (!body || !body.animate) return;
  event.preventDefault();
  const previous = disclosureAnimations.get(details);
  const opening = previous ? !previous.opening : !details.open;
  const fromHeight = details.open ? body.getBoundingClientRect().height : 0;
  const fromOpacity = details.open ? Number(getComputedStyle(body).opacity) : 0;
  if (previous) previous.animation.cancel();
  disclosureAnimations.delete(details);
  body.classList.remove('is-animating');
  body.inert = false;
  if (reducedMotion.matches) { details.open = opening; return; }
  details.open = true;
  const toHeight = opening ? body.getBoundingClientRect().height : 0;
  body.classList.add('is-animating');
  body.inert = !opening;
  const animation = body.animate([
    { height: fromHeight + 'px', opacity: fromOpacity },
    { height: toHeight + 'px', opacity: opening ? 1 : 0 }
  ], { duration: motion.transition, easing: motion.easing });
  disclosureAnimations.set(details, { animation, opening });
  animation.onfinish = () => {
    details.open = opening;
    body.inert = false;
    body.classList.remove('is-animating');
    disclosureAnimations.delete(details);
    scheduleNavigationUpdate();
  };
});

// Animate on entry without hiding content in CSS: a failed or absent script
// leaves every section visible. Each observed group reveals only once.
const revealAnimations = new Set();
let revealObserver = null;
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      const target = entry.target;
      if (target.contains(document.activeElement) || !target.animate || reducedMotion.matches) return;
      const grid = target.closest('.project-grid');
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
      const index = grid ? [...grid.children].indexOf(target) % columns : 0;
      const animation = target.animate([
        { opacity: .55, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: motion.reveal, delay: index * 45, easing: motion.easing, fill: 'backwards' });
      revealAnimations.add(animation);
      const finish = () => revealAnimations.delete(animation);
      animation.onfinish = finish;
      animation.oncancel = finish;
    });
  }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('#about, .toolbelt, #lab, #work > .section-heading, .project-grid > .project, #approach .shell, #connect .shell').forEach(section => revealObserver.observe(section));
}

document.addEventListener('focusin', () => {
  // Keyboard navigation must never land on a temporarily faded control.
  revealAnimations.forEach(animation => {
    if (animation.effect.target.contains(document.activeElement)) animation.cancel();
  });
});
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  if (revealObserver) revealObserver.disconnect();
  revealAnimations.forEach(animation => animation.cancel());
  disclosureAnimations.forEach(({ animation }) => animation.finish());
  closingDialogs.forEach((timer, element) => {
    window.clearTimeout(timer);
    element.close();
  });
});
