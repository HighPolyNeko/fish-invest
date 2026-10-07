// Проверка сборки: index.html на месте, все локальные скрипты и стили существуют,
// в JS нет синтаксических ошибок.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

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

// Новости: в data/news.js должен лежать массив из нескольких разных непустых строк
// (иначе правило «не показывать одну и ту же два раза подряд» теряет смысл).
const sandbox = { window: {} };
vm.runInNewContext(readFileSync('data/news.js', 'utf8'), sandbox);
const news = sandbox.window.Fish && sandbox.window.Fish.NEWS;
if (!Array.isArray(news) || news.length < 2 || news.some((n) => typeof n !== 'string' || !n.trim())) {
  console.error('data/news.js: ожидается массив минимум из двух непустых строк в window.Fish.NEWS');
  process.exit(1);
}
if (new Set(news).size !== news.length) {
  console.error('data/news.js: есть повторяющиеся новости');
  process.exit(1);
}
console.log(`OK: новостей ${news.length}`);
console.log(`OK: ${scripts.length} скрипт(ов), ${assets.length} файл(ов) стилей/иконок, синтаксис в порядке`);
