import { cp, mkdir, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = new URL('public/', root);
const output = new URL('dist/', root);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log('Built Tabloom to dist/');
