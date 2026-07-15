export const SURFACES = ['ui', 'api', 'cli', 'mcp'];

export const starterOperations = [
  { id: 'invite-member', name: 'Invite a teammate', area: 'Members', ui: '/settings/members', api: 'POST /v1/invitations', cli: 'acme members invite', mcp: 'members.invite', risk: 'medium' },
  { id: 'rotate-key', name: 'Rotate a signing key', area: 'Security', ui: '/settings/signing-keys', api: '', cli: '', mcp: '', risk: 'high' },
  { id: 'export-audit', name: 'Export audit events', area: 'Compliance', ui: '/logs', api: 'GET /v1/audit-events', cli: '', mcp: 'audit.list', risk: 'low' },
  { id: 'suspend-member', name: 'Suspend a member', area: 'Members', ui: '/settings/members/:id', api: 'POST /v1/members/:id/suspend', cli: 'acme members suspend', mcp: '', risk: 'high' }
];

export function normalizeOperation(value = {}) {
  const operation = {
    id: String(value.id || crypto.randomUUID()),
    name: String(value.name || '').trim(),
    area: String(value.area || 'Uncategorized').trim() || 'Uncategorized',
    risk: ['low', 'medium', 'high'].includes(value.risk) ? value.risk : 'medium'
  };
  for (const surface of SURFACES) operation[surface] = String(value[surface] || '').trim();
  return operation;
}

export function coverageFor(operation) {
  const covered = SURFACES.filter((surface) => Boolean(operation[surface]));
  const headless = ['api', 'cli', 'mcp'].filter((surface) => Boolean(operation[surface]));
  return {
    covered,
    headless,
    percent: Math.round((covered.length / SURFACES.length) * 100),
    dashboardOnly: Boolean(operation.ui) && headless.length === 0,
    headlessReady: headless.length > 0
  };
}

export function summarize(operations) {
  const total = operations.length;
  const dashboardOnly = operations.filter((item) => coverageFor(item).dashboardOnly).length;
  const headlessReady = operations.filter((item) => coverageFor(item).headlessReady).length;
  const possible = total * SURFACES.length;
  const covered = operations.reduce((sum, item) => sum + coverageFor(item).covered.length, 0);
  return { total, dashboardOnly, headlessReady, coverage: possible ? Math.round((covered / possible) * 100) : 0 };
}

export function toMarkdown(operations) {
  const lines = ['# Action surface map', '', '| Operation | Area | Risk | UI | API | CLI | MCP | Coverage |', '| --- | --- | --- | --- | --- | --- | --- | ---: |'];
  for (const item of operations) {
    const safe = (value) => String(value || '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
    lines.push('| ' + safe(item.name) + ' | ' + safe(item.area) + ' | ' + safe(item.risk) + ' | ' + safe(item.ui) + ' | ' + safe(item.api) + ' | ' + safe(item.cli) + ' | ' + safe(item.mcp) + ' | ' + coverageFor(item).percent + '% |');
  }
  return lines.join('\n') + '\n';
}
