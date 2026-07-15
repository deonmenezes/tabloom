import { SURFACES, coverageFor, normalizeOperation, starterOperations, summarize, toMarkdown } from './core.js';

const STORAGE_KEY = 'tabloom.operations.v1';
const dialog = document.querySelector('#operation-dialog');
const form = document.querySelector('#operation-form');
const toast = document.querySelector('#toast');
let activeFilter = 'all';
let query = '';
let operations = loadOperations();

function loadOperations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterOperations.map(normalizeOperation);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeOperation) : starterOperations.map(normalizeOperation);
  } catch {
    showToast('Stored data could not be read. A demo workspace was loaded.', 'error');
    return starterOperations.map(normalizeOperation);
  }
}

function saveOperations() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(operations)); }
  catch { showToast('Your browser blocked local saving. Export a copy before leaving.', 'error'); }
}

function showToast(message, tone = 'success') {
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function visibleOperations() {
  return operations.filter((item) => {
    const coverage = coverageFor(item);
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'gaps' && coverage.dashboardOnly) || (activeFilter === 'ready' && coverage.headlessReady);
    const haystack = [item.name, item.area, item.ui, item.api, item.cli, item.mcp].join(' ').toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  });
}

function render() {
  const summary = summarize(operations);
  const visible = visibleOperations();
  document.querySelector('#total-count').textContent = summary.total;
  document.querySelector('#gap-count').textContent = summary.dashboardOnly;
  document.querySelector('#ready-count').textContent = summary.headlessReady;
  document.querySelector('#coverage-value').textContent = summary.coverage + '%';
  document.querySelector('#coverage-ring').style.setProperty('--progress', (summary.coverage * 3.6) + 'deg');
  document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  const body = document.querySelector('#operation-list');
  if (!visible.length) {
    body.innerHTML = '<div class="empty-state"><span aria-hidden="true">⌁</span><h3>No matching operations</h3><p>' + (operations.length ? 'Try another filter or search term.' : 'Add your first product operation to begin mapping coverage.') + '</p></div>';
    return;
  }
  body.innerHTML = visible.map((item) => {
    const coverage = coverageFor(item);
    const cells = SURFACES.map((surface) => '<div class="surface-cell ' + (item[surface] ? 'is-covered' : '') + '" title="' + escapeHtml(item[surface] || ('No ' + surface.toUpperCase() + ' path')) + '"><span class="surface-dot" aria-hidden="true"></span><span>' + (item[surface] ? escapeHtml(item[surface]) : 'Missing') + '</span></div>').join('');
    return '<article class="operation-row" data-id="' + escapeHtml(item.id) + '"><div class="operation-name"><span class="risk risk-' + item.risk + '">' + escapeHtml(item.risk) + '</span><div><h3>' + escapeHtml(item.name) + '</h3><p>' + escapeHtml(item.area) + '</p></div></div><div class="surface-grid">' + cells + '</div><div class="row-score"><strong>' + coverage.percent + '%</strong><span>' + (coverage.dashboardOnly ? 'UI trapped' : coverage.headlessReady ? 'Headless path' : 'Unmapped') + '</span></div><div class="row-actions"><button class="icon-button" type="button" data-edit="' + escapeHtml(item.id) + '" aria-label="Edit ' + escapeHtml(item.name) + '">Edit</button><button class="icon-button danger" type="button" data-delete="' + escapeHtml(item.id) + '" aria-label="Delete ' + escapeHtml(item.name) + '">×</button></div></article>';
  }).join('');
}

function openDialog(operation) {
  form.reset();
  form.elements.id.value = operation?.id || '';
  document.querySelector('#dialog-title').textContent = operation ? 'Edit operation' : 'Add an operation';
  if (operation) for (const key of ['name', 'area', 'risk', ...SURFACES]) form.elements[key].value = operation[key];
  dialog.showModal();
  form.elements.name.focus();
}

function download(filename, content, type) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

document.querySelector('#add-operation').addEventListener('click', () => openDialog());
document.querySelector('#hero-add').addEventListener('click', () => openDialog());
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#search').addEventListener('input', (event) => { query = event.target.value; render(); });
document.querySelector('#filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (button) { activeFilter = button.dataset.filter; render(); }
});
document.querySelector('#operation-list').addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');
  if (editButton) openDialog(operations.find((item) => item.id === editButton.dataset.edit));
  if (deleteButton) {
    const item = operations.find((candidate) => candidate.id === deleteButton.dataset.delete);
    if (item && window.confirm('Delete “' + item.name + '”?')) {
      operations = operations.filter((candidate) => candidate.id !== item.id);
      saveOperations();
      render();
      showToast('Operation removed.');
    }
  }
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const operation = normalizeOperation(Object.fromEntries(new FormData(form)));
  if (!operation.name) return;
  const index = operations.findIndex((item) => item.id === operation.id);
  if (index >= 0) operations[index] = operation;
  else operations.push(operation);
  saveOperations();
  dialog.close();
  render();
  showToast(index >= 0 ? 'Operation updated.' : 'Operation added.');
});
document.querySelector('#export-json').addEventListener('click', () => download('tabloom-map.json', JSON.stringify(operations, null, 2), 'application/json'));
document.querySelector('#export-markdown').addEventListener('click', () => download('tabloom-map.md', toMarkdown(operations), 'text/markdown'));
document.querySelector('#reset-demo').addEventListener('click', () => {
  if (!window.confirm('Replace your workspace with the demo operations?')) return;
  operations = starterOperations.map(normalizeOperation);
  saveOperations();
  render();
  showToast('Demo workspace restored.');
});

render();
