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
    intro: 'A practical intersection of web development and e-commerce operations.',
    sections: [
      ['The context', 'Buffer stock configuration involves inventory rules and structured data. A clear workflow needs to make input, review, and confirmation understandable.'],
      ['My work', 'I have worked across the frontend, FastAPI backend, service and repository layers, tests, and BigQuery integration. The project includes spreadsheet upload, preview, and confirmation flows.'],
      ['What it shows', 'Working across an application means keeping the interface, data models, validation, and documentation aligned as requirements change.'],
      ['Try the idea', 'The workflow lab on this page uses illustrative product records. Add a sample error, preview it, fix it, and confirm. It demonstrates the interaction locally; it does not connect to the workplace application.']
    ], tags: ['Python', 'FastAPI', 'BigQuery', 'HTML / CSS / JavaScript', 'Testing']
  },
  exemption: {
    category: '02 / BACKEND & OPERATIONS', title: 'Product Exemption',
    intro: 'Giving a product rule the context it needs.',
    sections: [
      ['The context', 'A product exemption needs to identify the marketplace, store, brand, and SKU involved. Keeping that context together makes the record meaningful.'],
      ['My work', 'I have worked on product exemption models, including create and record representations, their fields, and associated tests. Creation and update timestamps are part of the record structure.'],
      ['What it shows', 'Related operational tools can share an application while still needing distinct data models. Product exemption records and buffer stock configuration represent different kinds of rules.']
    ], tags: ['Data modeling', 'Validation', 'E-commerce workflows', 'Testing']
  },
  helpdesk: {
    category: '03 / IT SUPPORT & ADMINISTRATION', title: 'Helpdesk Workflows',
    intro: 'The practical details behind a useful support system.',
    sections: [
      ['The context', 'A support workflow depends on more than creating a ticket. Intake, help topics, notifications, and the information included in an email all affect the experience.'],
      ['My work', 'My osTicket work has included ticket intake and help topic administration, notification troubleshooting, and checking email behavior after a ticket is created.'],
      ['What it shows', 'Technical support builds the habit of tracing an issue through a system, checking the observed behavior, and communicating a clear next step.']
    ], tags: ['osTicket', 'Administration', 'Troubleshooting', 'Documentation']
  }
};
const dialog = document.getElementById('case-dialog');
const caseContent = document.getElementById('case-content');
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
      const section = document.createElement('section');
      const h3 = document.createElement('h3');
      h3.textContent = heading;
      const p = document.createElement('p');
      p.textContent = body;
      section.append(h3, p);
      caseContent.append(section);
    });
    const tags = document.createElement('div');
    tags.className = 'tags';
    data.tags.forEach(tag => { const span = document.createElement('span'); span.textContent = tag; tags.append(span); });
    caseContent.append(tags);
    lastTrigger = button;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    document.getElementById('close-dialog').focus();
  });
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (lastTrigger) lastTrigger.focus(); });
