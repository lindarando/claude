const puppeteer = require('/opt/node22/lib/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CDN_MAP = {
  'https://unpkg.com/react@18.3.1/umd/react.development.js': path.join(__dirname, 'node_modules/react/umd/react.development.js'),
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js': path.join(__dirname, 'node_modules/react-dom/umd/react-dom.development.js'),
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js': path.join(__dirname, 'node_modules/@babel/standalone/babel.min.js'),
};

const PROJECT_DIR = path.join(__dirname, 'project');
const OUTPUT_PDF = path.join(__dirname, 'Cartoline-Hic-sunt-libri-STAMPA-NOSTUB.pdf');
const HTML_FILE = 'Cartoline%20print-ready-nostub.html';

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(PROJECT_DIR, decodeURIComponent(req.url.split('?')[0]));
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.jsx': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const { server, port } = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    const local = CDN_MAP[req.url()];
    if (local) req.respond({ status: 200, headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(local) });
    else req.continue();
  });
  page.on('pageerror', err => console.error('PAGE EXCEPTION:', err.message));
  page.on('response', async res => { if (res.status() === 404) console.error('404:', res.url()); });
  await page.setViewport({ width: 2160, height: 1440, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}/${HTML_FILE}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));
  const rendered = await page.evaluate(() => document.getElementById('p1')?.children.length > 0);
  console.log('React rendered:', rendered);
  if (!rendered) { await browser.close(); server.close(); process.exit(1); }
  await page.pdf({ path: OUTPUT_PDF, width: '154mm', height: '111mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1-6' });
  console.log('PDF saved to:', OUTPUT_PDF);
  await browser.close();
  server.close();
})();
