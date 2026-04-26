// Render each anta HTML to a 104x216mm PDF (98x210mm + 3mm bleed all around).
// Strips the mockup wrapper and extends .anta-content padding by 3mm so the
// original visible content stays in place while the gradient bleeds outward.

const puppeteer = require('/opt/node22/lib/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PIEGHEVOLE_DIR = path.join(__dirname, 'pieghevole/pieghevole-package');
const OUT_DIR = path.join(__dirname, 'pieghevole-out/antas');
fs.mkdirSync(OUT_DIR, { recursive: true });

const QR_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'qr-matrix.json'), 'utf8'));

const ANTAS = ['manifesto', 'bundle', 'copertina', 'lettore', 'studio', 'backoffice'];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(PIEGHEVOLE_DIR, decodeURIComponent(req.url.split('?')[0]));
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  for (const name of ANTAS) {
    const page = await browser.newPage();
    page.on('pageerror', err => console.error(`[${name}] PAGE EXCEPTION:`, err.message));
    await page.setViewport({ width: 1100, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}/html/${name}.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Strip mockup chrome and extend .anta to 104x216mm (98x210 + 3mm bleed each side).
    // 96 DPI: 1mm = 3.7795px; 3mm = 11.34px. Original .anta is 370x794px (98x210mm).
    // New size: 393x817px (104x216mm).
    await page.evaluate((qrData) => {
      // Replace the fake decorative QR with a real one (only on copertina)
      const fakeQr = document.querySelector('.qr-svg');
      if (fakeQr) {
        const { size, matrix } = qrData;
        // Use viewBox 0..size, draw 1x1 cells, no border (the .qr-block already has padding)
        const ns = 'http://www.w3.org/2000/svg';
        // Clear existing children
        while (fakeQr.firstChild) fakeQr.removeChild(fakeQr.firstChild);
        fakeQr.setAttribute('viewBox', `0 0 ${size} ${size}`);
        // White background
        const bg = document.createElementNS(ns, 'rect');
        bg.setAttribute('width', size); bg.setAttribute('height', size); bg.setAttribute('fill', '#fff');
        fakeQr.appendChild(bg);
        // Draw black cells as a single path for compact, crisp output
        let d = '';
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (matrix[r][c]) d += `M${c} ${r}h1v1h-1z`;
          }
        }
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', '#1a1a1a');
        fakeQr.appendChild(path);
      }
      const anta = document.querySelector('.anta');
      if (!anta) throw new Error('.anta not found');
      // Inject a fresh body containing only the .anta, sized for bleed
      const bleedPx = 3 * 96 / 25.4;  // 11.339
      const fullW = 98 * 96 / 25.4 + 2 * bleedPx;  // 393.0
      const fullH = 210 * 96 / 25.4 + 2 * bleedPx; // 817.0

      // Adjust .anta-content padding by adding bleedPx to each side so visible content stays in place
      const content = anta.querySelector('.anta-content');
      if (content) {
        const cs = getComputedStyle(content);
        const pt = parseFloat(cs.paddingTop) + bleedPx;
        const pr = parseFloat(cs.paddingRight) + bleedPx;
        const pb = parseFloat(cs.paddingBottom) + bleedPx;
        const pl = parseFloat(cs.paddingLeft) + bleedPx;
        content.style.setProperty('padding', `${pt}px ${pr}px ${pb}px ${pl}px`, 'important');
      }
      // Resize the .anta itself
      anta.style.setProperty('width', `${fullW}px`, 'important');
      anta.style.setProperty('height', `${fullH}px`, 'important');
      anta.style.setProperty('border-radius', '0', 'important');
      anta.style.setProperty('box-shadow', 'none', 'important');
      anta.style.setProperty('margin', '0', 'important');

      // Remove all body children, then reattach .anta as the only one
      const placeholder = document.createElement('div');
      anta.parentNode.replaceChild(placeholder, anta);
      document.body.innerHTML = '';
      document.body.appendChild(anta);
      document.body.style.cssText = `margin:0; padding:0; background:transparent; width:${fullW}px; height:${fullH}px; overflow:hidden;`;
      document.documentElement.style.cssText = 'margin:0; padding:0;';
    }, QR_DATA);
    // Wait a tick for fonts/images to settle
    await new Promise(r => setTimeout(r, 1500));

    const outPath = path.join(OUT_DIR, `${name}.pdf`);
    await page.pdf({
      path: outPath,
      width: '104mm', height: '216mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });
    console.log(`✓ ${name}.pdf`);
    await page.close();
  }
  await browser.close();
  server.close();
})();
