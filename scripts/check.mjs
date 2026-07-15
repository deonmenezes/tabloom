import { access, readFile } from 'node:fs/promises';

const required = ['public/index.html', 'public/styles.css', 'public/runtime.js', 'public/core.js', 'public/favicon.svg', 'README.md', 'LICENSE'];
await Promise.all(required.map((path) => access(new URL('../' + path, import.meta.url))));

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
for (const marker of ['<title>Tabloom', 'meta name="description"', 'id="app"', 'operation-dialog', 'runtime.js']) {
  if (!html.includes(marker)) throw new Error('Missing required HTML marker: ' + marker);
}
const runtime = await readFile(new URL('../public/runtime.js', import.meta.url), 'utf8');
for (const marker of ['localStorage', 'export-markdown', 'data-filter', 'showToast']) {
  if (!runtime.includes(marker)) throw new Error('Missing required runtime behavior: ' + marker);
}
console.log('Static, metadata, and app-contract checks passed.');
