// Fails if sample data names real pharmacy chains or discount-card brands.
// Enforces the "no real providers or prices" rule in .kiro/steering/product.md.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = /\b(CVS|Walgreens|Walmart|Costco|Rite Aid|GoodRx|RxSaver)\b/i;
const ROOTS = ['src', 'backend/app'];
const EXTENSIONS = /\.(tsx?|py)$/;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const hits = [];
for (const root of ROOTS) {
  for (const file of walk(root).filter((f) => EXTENSIONS.test(f))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const match = line.match(FORBIDDEN);
      if (match) hits.push(`${file}:${i + 1}  "${match[0]}"`);
    });
  }
}

if (hits.length) {
  console.error('Real pharmacy/brand names found in sample data:\n' + hits.join('\n'));
  process.exit(1);
}
console.log('check-demo-data: OK (no real pharmacy or discount-card names)');
