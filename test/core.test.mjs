import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageFor, normalizeOperation, summarize, toMarkdown } from '../public/core.js';

test('detects a dashboard-only operation', () => {
  const result = coverageFor({ ui: '/settings', api: '', cli: '', mcp: '' });
  assert.equal(result.dashboardOnly, true);
  assert.equal(result.headlessReady, false);
  assert.equal(result.percent, 25);
});

test('recognizes any non-UI path as headless ready', () => {
  const result = coverageFor({ ui: '', api: '', cli: 'acme sync', mcp: '' });
  assert.equal(result.dashboardOnly, false);
  assert.equal(result.headlessReady, true);
  assert.deepEqual(result.covered, ['cli']);
});

test('summarizes mixed surface coverage', () => {
  const operations = [
    { ui: '/one', api: '', cli: '', mcp: '' },
    { ui: '/two', api: 'POST /two', cli: 'app two', mcp: 'two.run' }
  ];
  assert.deepEqual(summarize(operations), { total: 2, dashboardOnly: 1, headlessReady: 1, coverage: 63 });
});

test('normalizes whitespace and invalid risk values', () => {
  const item = normalizeOperation({ id: 'x', name: '  Rotate key ', area: ' ', risk: 'extreme', ui: ' /keys ' });
  assert.equal(item.name, 'Rotate key');
  assert.equal(item.area, 'Uncategorized');
  assert.equal(item.risk, 'medium');
  assert.equal(item.ui, '/keys');
});

test('exports a portable Markdown table and escapes pipes', () => {
  const output = toMarkdown([{ name: 'Invite | suspend', area: 'Members', risk: 'high', ui: '/members', api: '', cli: '', mcp: '' }]);
  assert.match(output, /Invite \\| suspend/);
  assert.match(output, /25%/);
  assert.ok(output.endsWith('\n'));
});
