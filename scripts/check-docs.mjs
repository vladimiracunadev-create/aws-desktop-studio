import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'dist', 'node_modules']);

function collectMarkdown(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });
}

const files = collectMarkdown(root);
const errors = [];
const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const content = fs.readFileSync(file, 'utf8');
  const firstHeading = content.match(/^#{1,2}\s+(.+)$/m)?.[1] ?? '';

  if (!firstHeading) errors.push(`${relative}: falta un encabezado principal.`);
  const iconExempt = relative.startsWith('skills/');
  if (firstHeading && !iconExempt && !/\p{Extended_Pictographic}/u.test(firstHeading)) {
    errors.push(`${relative}: el primer encabezado necesita un icono semántico.`);
  }

  const navigationExempt = relative === 'README.md'
    || relative.startsWith('.github/')
    || relative.startsWith('skills/');
  if (!navigationExempt && !content.includes('README.md')) {
    errors.push(`${relative}: falta navegación hacia README.md.`);
  }

  const mermaidFences = content.match(/```mermaid/g)?.length ?? 0;
  const allFences = content.match(/```/g)?.length ?? 0;
  if (allFences % 2 !== 0) errors.push(`${relative}: bloque de código sin cerrar.`);
  if (mermaidFences > 0 && !/(flowchart|sequenceDiagram|stateDiagram|mindmap|timeline|classDiagram)/.test(content)) {
    errors.push(`${relative}: Mermaid no declara un tipo de diagrama reconocido.`);
  }

  if (content.includes('\uFFFD')) errors.push(`${relative}: contiene caracteres de reemplazo UTF-8.`);

  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '');
    if (!rawTarget || rawTarget.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) continue;
    const cleanTarget = rawTarget.split('#', 1)[0].split('?', 1)[0];
    if (!cleanTarget) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(cleanTarget);
    } catch {
      errors.push(`${relative}: enlace local mal codificado: ${rawTarget}`);
      continue;
    }
    const resolved = path.resolve(path.dirname(file), decoded);
    if (!fs.existsSync(resolved)) errors.push(`${relative}: enlace local inexistente: ${rawTarget}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Documentación visual OK: ${files.length} Markdown con títulos, navegación y enlaces válidos.`);
