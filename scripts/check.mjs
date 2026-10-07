// Проверка сборки: файл игры существует, inline-скрипты без синтаксических ошибок.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const FILE = 'idle.html';
const html = readFileSync(FILE, 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);

if (scripts.length === 0) {
  console.error(`В ${FILE} нет inline-скриптов`);
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'check-'));
scripts.forEach((code, i) => {
  const path = join(dir, `script${i}.js`);
  writeFileSync(path, code);
  execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
});
console.log(`OK: ${scripts.length} скрипт(ов) в ${FILE} без синтаксических ошибок`);
