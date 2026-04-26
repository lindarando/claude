// Render each anta as a PNG at exact pixel dimensions (no PDF mm/pt conversion gaps).
// Uses 508 DPI -> exactly 20 px/mm for clean integer math:
//   left/right anta:  101mm × 216mm = 2020 × 4320 px
//   middle anta:       98mm × 216mm = 1960 × 4320 px
//   composed lato:    300mm × 216mm = 6000 × 4320 px (= 2020 + 1960 + 2020 ✓)

const puppeteer = require('/opt/node22/lib/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PIEGHEVOLE_DIR = path.join(__dirname, 'pieghevole/pieghevole-package');
const OUT_DIR = path.join(__dirname, 'pieghevole-out/antas');
fs.mkdirSync(OUT_DIR, { recursive: true });

const QR_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'qr-matrix.json'), 'utf8'));

const DPI = 508;             // 20 px/mm exact
const PX_PER_MM = DPI / 25.4; // = 20

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
    const widthMm = position === 'middle' ? 98 : 101;
    const heightMm = 216;
    const widthPx  = widthMm  * PX_PER_MM;  // 1960 or 2020
    const heightPx = heightMm * PX_PER_MM;  // 4320

    // Use a CSS-px viewport at base 96 DPI then scale up via deviceScaleFactor.
    // 1mm @ 96 DPI = 96/25.4 = 3.7795 CSS px. Scale factor = PX_PER_MM / (96/25.4) = 20 / 3.7795 = 5.2917.
    const cssWidthPx  = widthMm  * 96 / 25.4;
    const cssHeightPx = heightMm * 96 / 25.4;
    const scale = PX_PER_MM / (96 / 25.4);

    const page = await browser.newPage();
    page.on('pageerror', err => console.error(`[${name}] PAGE EXCEPTION:`, err.message));
    await page.setViewport({
      width:  Math.round(cssWidthPx),
      height: Math.round(cssHeightPx),
      deviceScaleFactor: scale,
    });
    await page.goto(`http://127.0.0.1:${port}/html/${name}.html`, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.evaluate((qrData, position) => {
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
      const bleedPx = 3 * 96 / 25.4;
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
      anta.style.setProperty('width',  '100%', 'important');
      anta.style.setProperty('height', '100%', 'important');
      anta.style.setProperty('border-radius', '0', 'important');
      anta.style.setProperty('box-shadow', 'none', 'important');
      anta.style.setProperty('margin', '0', 'important');

      anta.parentNode.removeChild(anta);
      document.body.innerHTML = '';
      document.body.appendChild(anta);
      document.body.style.cssText = 'margin:0; padding:0; background:transparent; width:100vw; height:100vh; overflow:hidden;';
      document.documentElement.style.cssText = 'margin:0; padding:0; width:100%; height:100%;';
    }, QR_DATA, position);

    await new Promise(r => setTimeout(r, 1500));
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({
      path: outPath,
      type: 'png',
      omitBackground: false,
      fullPage: false,
      clip: { x: 0, y: 0, width: cssWidthPx, height: cssHeightPx },
    });
    console.log(`✓ ${name}.png (${widthPx}x${heightPx} @ 508 DPI, ${position})`);
    await page.close();
  }
  await browser.close();
  server.close();
})();
