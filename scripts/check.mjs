// Проверка сборки: index.html на месте, все локальные скрипты и стили существуют,
// в JS нет синтаксических ошибок.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const html = readFileSync('index.html', 'utf8');
const local = (url) => !/^(https?:)?\/\//.test(url) && !url.startsWith('data:');

const scripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/gi)].map((m) => m[1]).filter(local);
const assets = [...html.matchAll(/<link[^>]*\bhref="([^"]+)"/gi)].map((m) => m[1]).filter(local);

if (scripts.length === 0) {
  console.error('В index.html нет локальных скриптов');
  process.exit(1);
}

let failed = false;
for (const path of [...scripts, ...assets]) {
  if (!existsSync(path)) {
    console.error(`Файл из index.html не найден: ${path}`);
    failed = true;
  }
}
if (failed) process.exit(1);

for (const path of scripts) {
  execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
}
console.log(`OK: ${scripts.length} скрипт(ов), ${assets.length} файл(ов) стилей/иконок, синтаксис в порядке`);
