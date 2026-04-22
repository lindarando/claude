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
const OUTPUT_PDF = path.join(__dirname, 'Cartoline-Hic-sunt-libri-STAMPA.pdf');

// Simple static file server for the project directory
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(PROJECT_DIR, decodeURIComponent(req.url.split('?')[0]));
      if (filePath === PROJECT_DIR || filePath === PROJECT_DIR + '/') filePath += '/index.html';

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.jsx': 'text/javascript',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + filePath);
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

(async () => {
  const { server, port } = await startServer();
  console.log(`Server running on port ${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--ignore-certificate-errors',
    ],
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', req => {
    const local = CDN_MAP[req.url()];
    if (local) {
      const data = fs.readFileSync(local);
      req.respond({
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        },
        body: data,
      });
    } else {
      req.continue();
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
    else console.log('PAGE LOG:', msg.text());
  });
  page.on('pageerror', err => console.error('PAGE EXCEPTION:', err.message));
  page.on('requestfailed', req => console.error('REQUEST FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', async res => { if (res.status() === 404) console.error('404:', res.url()); });

  // Larger viewport to match the page size at 2x pixel density
  await page.setViewport({ width: 2160, height: 1440, deviceScaleFactor: 2 });

  const url = `http://127.0.0.1:${port}/Cartoline%20print-ready.html`;
  console.log('Loading:', url);

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for React + Babel to compile and render
  // The print-ready file calls window.print() after 900ms — wait longer to be safe
  await new Promise(r => setTimeout(r, 8000));

  // Check that React rendered content
  const rendered = await page.evaluate(() => {
    return document.getElementById('p1')?.children.length > 0;
  });
  console.log('React rendered:', rendered);

  if (!rendered) {
    const logs = await page.evaluate(() => window.__renderErrors || []);
    console.error('Render failed. Check the page manually.');
    await browser.close();
    server.close();
    process.exit(1);
  }

  console.log('Generating PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    width: '180mm',
    height: '120mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '1-6',
  });

  console.log('PDF saved to:', OUTPUT_PDF);
  await browser.close();
  server.close();
})();
