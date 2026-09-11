import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'src/main.js',
  'src/local-server.js',
  'src/aws-auth.js',
  'src/sso-config.js',
  'src/preload.js',
  'src/renderer/index.html',
  'src/renderer/app.js',
  'src/renderer/web-api.js',
  'src/renderer/styles.css',
  'docs/tutorials/ec2.md',
  'docs/08-referencias-y-plan-de-madurez.md',
  'docs/09-investigacion-implementacion-aws.md',
  'skills/cloud-implementation-research-audit/SKILL.md',
  'site/index.html',
  'README.md',
  'SECURITY.md',
  'LICENSE'
];
let ok = true;
for (const f of required) {
  const target = path.join(root, f);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    console.error('Falta o está vacío:', f);
    ok = false;
  }
}
const tutorials = fs.readdirSync(path.join(root, 'docs', 'tutorials')).filter((name) => name.endsWith('.md'));
if (tutorials.length !== 20) {
  console.error(`Se esperaban 20 tutoriales y hay ${tutorials.length}.`);
  ok = false;
}
if (!ok) process.exit(1);
console.log(`Estructura esencial OK: ${required.length} archivos y ${tutorials.length} tutoriales.`);
