import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const appSource = fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8');
const homeSource = fs.readFileSync(path.join(root, 'src', 'pages', 'Home.jsx'), 'utf8');
const headerSource = fs.readFileSync(path.join(root, 'src', 'components', 'Header.jsx'), 'utf8');
const viteConfig = fs.readFileSync(path.join(root, 'vite.config.js'), 'utf8');

assert.ok(appSource.includes('BrowserRouter'), 'O app deve seguir usando BrowserRouter com basename.');
assert.ok(appSource.includes('basename={baseName}'), 'O app precisa declarar o basename do repositório do GitHub Pages.');
assert.ok(viteConfig.includes("base: '/CarroFacilMultiMarcas/'"), 'A base do Vite deve apontar para o repositório do GitHub Pages.');
assert.ok(homeSource.includes('import.meta.env.BASE_URL'), 'O botão de estoque precisa usar a base do Vite para funcionar em GitHub Pages.');
assert.ok(headerSource.includes('BASE_URL'), 'Os links de contato devem respeitar a base pública do GitHub Pages.');

console.log('GitHub Pages compatibility checks passed');
