import { access, readFile } from 'node:fs/promises';

const required = ['public/index.html', 'public/styles.css', 'public/app.js', 'public/favicon.svg'];
await Promise.all(required.map((path) => access(new URL(`../${path}`, import.meta.url))));
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
for (const marker of ['<title>Tabloom', 'meta name="description"', 'id="app"']) {
  if (!html.includes(marker)) throw new Error(`Missing required marker: ${marker}`);
}
console.log('Static checks passed.');
