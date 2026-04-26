// Render each anta HTML with bleed only on the sides where it's actually needed:
// - manifesto, lettore (left of their lato): bleed on Left + Top + Bottom (101x216mm)
// - bundle, studio (middle):                bleed on Top + Bottom only (98x216mm)
// - copertina, backoffice (right):          bleed on Right + Top + Bottom (101x216mm)
//
// Inner side has NO bleed because the seams between panels are folds (not cuts):
// adjacent panels meet exactly at the fold line, no overlap, no visible "ghost" line.

const puppeteer = require('/opt/node22/lib/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PIEGHEVOLE_DIR = path.join(__dirname, 'pieghevole/pieghevole-package');
const OUT_DIR = path.join(__dirname, 'pieghevole-out/antas');
fs.mkdirSync(OUT_DIR, { recursive: true });

const QR_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'qr-matrix.json'), 'utf8'));

// position: 'left' | 'middle' | 'right'
const ANTAS = [
  { name: 'manifesto',  position: 'left'   },
  { name: 'bundle',     position: 'middle' },
  { name: 'copertina',  position: 'right'  },
  { name: 'lettore',    position: 'left'   },
  { name: 'studio',     position: 'middle' },
  { name: 'backoffice', position: 'right'  },
];

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
  for (const { name, position } of ANTAS) {
    const page = await browser.newPage();
    page.on('pageerror', err => console.error(`[${name}] PAGE EXCEPTION:`, err.message));
    await page.setViewport({ width: 1100, height: 1000, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${port}/html/${name}.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    const widthMm = position === 'middle' ? 98 : 101;
    const heightMm = 216;  // 210 + 3 top + 3 bottom

    await page.evaluate((qrData, position, widthMm) => {
      // Replace decorative QR with real one (only on copertina; safe no-op elsewhere)
      const fakeQr = document.querySelector('.qr-svg');
      if (fakeQr) {
        const { size, matrix } = qrData;
        const ns = 'http://www.w3.org/2000/svg';
        while (fakeQr.firstChild) fakeQr.removeChild(fakeQr.firstChild);
        fakeQr.setAttribute('viewBox', `0 0 ${size} ${size}`);
        const bg = document.createElementNS(ns, 'rect');
        bg.setAttribute('width', size); bg.setAttribute('height', size); bg.setAttribute('fill', '#fff');
        fakeQr.appendChild(bg);
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

      const bleedPx = 3 * 96 / 25.4;       // 11.339
      const fullWPx = widthMm * 96 / 25.4; // 393 (left/right) or 370 (middle)
      const fullHPx = 216 * 96 / 25.4;     // 817

      // Adjust .anta-content padding to keep visible content positioned correctly
      // Original anta is 370x794 (98x210mm). New size has +/- bleed.
      // For 'left' position: extra padding-left = bleedPx, padding-top = bleedPx, padding-bottom = bleedPx
      // For 'middle': padding-top = bleedPx, padding-bottom = bleedPx (no horizontal padding adjust)
      // For 'right': padding-right = bleedPx, padding-top = bleedPx, padding-bottom = bleedPx
      const content = anta.querySelector('.anta-content');
      if (content) {
        const cs = getComputedStyle(content);
        let pt = parseFloat(cs.paddingTop)    + bleedPx;
        let pb = parseFloat(cs.paddingBottom) + bleedPx;
        let pl = parseFloat(cs.paddingLeft);
        let pr = parseFloat(cs.paddingRight);
        if (position === 'left')  pl += bleedPx;
        if (position === 'right') pr += bleedPx;
        content.style.setProperty('padding', `${pt}px ${pr}px ${pb}px ${pl}px`, 'important');
      }
      anta.style.setProperty('width', `${fullWPx}px`, 'important');
      anta.style.setProperty('height', `${fullHPx}px`, 'important');
      anta.style.setProperty('border-radius', '0', 'important');
      anta.style.setProperty('box-shadow', 'none', 'important');
      anta.style.setProperty('margin', '0', 'important');

      anta.parentNode.removeChild(anta);
      document.body.innerHTML = '';
      document.body.appendChild(anta);
      document.body.style.cssText = `margin:0; padding:0; background:transparent; width:${fullWPx}px; height:${fullHPx}px; overflow:hidden;`;
      document.documentElement.style.cssText = 'margin:0; padding:0;';
    }, QR_DATA, position, widthMm);

    await new Promise(r => setTimeout(r, 1500));
    const outPath = path.join(OUT_DIR, `${name}.pdf`);
    await page.pdf({
      path: outPath,
      width: `${widthMm}mm`, height: `${heightMm}mm`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });
    console.log(`✓ ${name}.pdf (${widthMm}x${heightMm}mm, ${position})`);
    await page.close();
  }
  await browser.close();
  server.close();
})();
