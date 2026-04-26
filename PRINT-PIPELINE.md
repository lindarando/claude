# Print pipeline — recipe & gotchas

How to turn an HTML/CSS mockup (typically exported from a design tool) into print-ready PDFs in three formats. Both projects in this repo use the same pattern; this doc captures the reusable parts and the bugs we hit so you don't redo the discovery.

**Audience**: future me + future Claude. Includes context, not just commands.

---

## The pattern

```
HTML mockup (1:1 design)
        │
        ▼  Puppeteer headless render at exact pixel size (508 DPI)
        │
        ▼  PNG per panel/page
        │
        ▼  Composite (PIL or pypdf): assemble panels, draw crop marks, add bleed
        │
        ▼  RGB PDF (vector) ──── for archive
        │
        ▼  RGB raster PDF ────── for Canva (flat, no editable layers)
        │
        ▼  Ghostscript: RGB → CMYK using FOGRA39 ICC profile
        │
        ▼  CMYK PDF ──────────── for the printer
```

The same pattern works for any project: cartoline (single-page front+back), pieghevole (multi-panel side-by-side), brochure pages, etc. Just adjust the panel layout and the PDF page dimensions.

---

## Three output formats — what each is for

| Suffix | Color space | Vector / raster | Use case |
|---|---|---|---|
| `.pdf` | RGB | vector (or raster, see gotcha #1) | Preview, archive, screen viewing |
| `-FLAT.pdf` | RGB | raster 400+ DPI | **Canva**: import without editable layers (Canva interprets vector PDFs as editable shapes, which breaks complex compositions) |
| `-CMYK.pdf` | CMYK | raster 300+ DPI | **Printer**: most Italian/EU printers want FOGRA39 (ISO Coated v2 300%) for coated paper. Some accept RGB and convert internally, but CMYK is safer |

**When in doubt, send the printer the CMYK version.** When using Canva, always use FLAT.

---

## Tools & dependencies

```bash
# Node side (Puppeteer for HTML → PDF/PNG)
node_modules/  # has puppeteer; package.json in repo root

# Python side (composition, raster, CMYK)
pip3 install Pillow img2pdf pypdf reportlab qrcode

# System tools
apt-get install poppler-utils ghostscript libjpeg-dev
# poppler-utils → pdftoppm (rasterize PDFs)
# ghostscript    → CMYK conversion with ICC profile
# libjpeg-dev    → JPEG support for Pillow

# ICC profile (FOGRA39, ~1.7 MB)
curl -fsSL -o /tmp/ISOcoated_v2_300_eci.icc \
  "https://raw.githubusercontent.com/jerome-lemaire/profil-icc/main/ISOcoated_v2_300_eci.icc"
```

The ICC profile is the standard ISO 12647-2 spec for European coated paper (FOGRA39). Free, embedded once at the document level by Ghostscript so the printer's RIP picks it up automatically.

---

## Reusable script templates

- **`render-antas.js`** — Puppeteer headless render. The pieghevole version renders 6 panels at exact pixel size (508 DPI). The cartoline version (`generate-pdf.js`) renders multiple pages from a single React-rendered HTML.
- **`compose-pieghevole.py`** — PIL-based raster composition + crop marks + JPEG-encoded PDF via img2pdf.
- **`generate-pdf.js`** — for projects that already render multi-page HTML directly (cartoline), Puppeteer's `page.pdf()` is enough. No composition needed.

For a new project, copy whichever template fits the layout, adjust the panel sizes/positions/HTML paths, and re-run.

---

## Gotchas — read this section especially

### 1. Chromium PDF rendering leaves a 1–2 px white strip on the right/bottom edges

**Symptom**: when you compose multiple anta PDFs side-by-side, you see thin vertical white lines at every fold seam.

**Cause**: when you tell Puppeteer to render at `width: '98mm'`, the produced PDF page is *slightly* larger than 98mm in points (we measured 277.92 pt instead of 277.80 pt — a 0.04mm overshoot). The HTML body fills the requested 98mm exactly, but the PDF page is bigger, so there's a transparent strip at the right and bottom edges that renders as white.

**Fix**: don't go through PDF for the per-panel render. Use Puppeteer's `page.screenshot()` with `deviceScaleFactor` to capture each panel as a PNG at exact pixel dimensions (e.g., 508 DPI = 20 px/mm exact). Compose pixel-perfect with PIL, then convert the composite PNG to PDF via `img2pdf`. The seams become 1-pixel sharp (one pixel of natural anti-aliasing, no white in between).

This is what `render-antas.js` + `compose-pieghevole.py` do for the pieghevole. Worth using the same approach for any multi-panel layout.

### 2. Bleed goes on outer edges, NOT at fold seams

**Symptom**: when you add a 3mm bleed all around each panel and then overlap them at the seams, you get visible 3mm strips of one panel's color "eating into" the adjacent panel's content.

**Cause**: bleed is a safety extension of the design beyond the **trim cut line**. Fold seams are NOT trim cuts — they're paper folds where the design is physically continuous. Adding bleed at a fold seam means one panel's color extends 3mm into the next panel, overlapping its content.

**Fix**: bleed only on edges that are actually trim cuts:
- Leftmost panel: bleed on **L + T + B**
- Middle panel(s): bleed on **T + B only**
- Rightmost panel: bleed on **R + T + B**

For the pieghevole (3 panels) this means the outer panels are 101mm wide (98 + 3mm one-sided bleed) and the middle is 98mm wide (no L/R bleed). Total = 300mm = 294mm trim + 6mm outer bleed.

### 3. QR codes need a quiet zone

**Symptom**: QR doesn't scan, especially when sitting on a colored background.

**Cause**: QR spec requires at least 4 modules of whitespace ("quiet zone") around the matrix. A 29-module QR rendered edge-to-edge in a coloured box has zero quiet zone, so scanners can't find the finder patterns.

**Fix**: shrink the QR matrix so the surrounding cream/white box has at least `4 * (matrix_size_px / 29)` of margin on each side. For a 84×84px box with a 29-module QR, the QR itself should be ~66×66px, leaving ~9px (4 modules) of white border.

### 4. Regular dot patterns can produce Moiré at low DPI

**Symptom**: at PDF viewer zoom levels (~50–150 DPI screen), you see vertical/horizontal stripes that aren't in the original design.

**Cause**: noise/grain backgrounds done as `radial-gradient(circle at 1px 1px, ... 1px, transparent 0)` repeated every N px form a regular dot grid. When the screen pixel grid samples this grid at a non-integer ratio, you get Moiré aliasing — often shows up as faint vertical or diagonal lines.

**Fix**: avoid regular dot grids for grain. If you really want grain, use a non-tiled noise texture (an SVG `<filter feTurbulence>` or a real noise PNG). For the cartoline + pieghevole projects we just removed the grain entirely — at print resolution it didn't add much anyway.

### 5. CMYK conversion with FOGRA39

**Command**:
```bash
gs -dBATCH -dNOPAUSE -dSAFER -sDEVICE=pdfwrite \
   -dProcessColorModel=/DeviceCMYK \
   -sColorConversionStrategy=CMYK \
   -sColorConversionStrategyForImages=CMYK \
   -sOutputICCProfile=/tmp/ISOcoated_v2_300_eci.icc \
   -dOverrideICC=true \
   -dRenderIntent=1 \
   -dCompatibilityLevel=1.4 \
   -sOutputFile=output-cmyk.pdf input-rgb.pdf
```

`-dRenderIntent=1` is "relative colorimetric" — preserves spot colors better than perceptual for graphic designs. `-dOverrideICC=true` forces the profile even if the input PDF already has one.

**Verify the result is actually CMYK**:
```bash
gs -o - -sDEVICE=inkcov input.pdf 2>&1 | grep -E "^\s+[0-9]\."
# Each line should show 4 decimal values + "CMYK OK"
```

**Caveat**: CMYK has a smaller gamut than sRGB. Saturated colors (especially crimson/teal/gold) will look slightly duller in print than on screen. This is normal and expected. If the printer has a stricter spec (e.g. PDF/X-1a or PDF/X-4), Ghostscript can produce that too with `-dPDFX`, but most digital printers accept the basic CMYK output above.

### 6. Image size at 300 DPI for raster PDFs

For a 300×216mm page at 300 DPI, the image needs to be 3543×2551 px minimum. We use 508 DPI (6000×4320 px) for the pieghevole — gives integer 20 px/mm so all positioning is exact, and headroom for high-quality print.

### 7. Use mm units for PDF page dimensions, even if you switch CSS to pixels

`pdftoppm`, `gs`, `img2pdf`, and `pypdf` all want PDF page sizes in PostScript points (1pt = 1/72 inch = 0.3528 mm). For a 300×216mm output, that's `img2pdf.mm_to_pt(300)` = 850.39 pt. Don't try to be clever with px-to-pt conversions — keep mm as the source of truth and convert to pt at the boundary.

---

## Common operations

### Change a piece of text or a price

1. Find the text in the relevant HTML in `project/` (cartoline) or `pieghevole/pieghevole-package/html/` (pieghevole).
2. Edit it directly in the HTML — these are static files.
3. Re-run the pipeline:
   ```bash
   # Cartoline
   node generate-pdf.js
   # Pieghevole (both lati)
   node render-antas.js && python3 compose-pieghevole.py
   ```
4. Re-run CMYK conversion (see Gotcha 5 above).

### Change a color

Same as above but find the relevant CSS rule. For consistency across panels (e.g., gold accent color used in lettore, studio, backoffice), search and replace across the relevant HTML files.

### Swap an image

Image files live in `project/assets/` (cartoline) or `pieghevole/pieghevole-package/img/` (pieghevole). For SVG logos that are inlined as data-URIs in the HTML, you have to base64-encode the new SVG and replace the inline string. For raster images referenced by relative path, just drop the new file in.

### Add a new panel/page to the pieghevole

1. Make a new `panel-name.html` in the same style as the existing antas (`.anta` div with `.anta-content` inside, etc.).
2. Add it to the `ANTAS` list in `render-antas.js` with the right `position` (`left | middle | right`).
3. Update `compose-pieghevole.py`'s `LATO_A` / `LATO_B` lists.

If you go from 3 panels to 4+, also update the page width and panel positioning math in `compose-pieghevole.py`.

---

## Pre-print checklist (the printer's "would you please")

Run through this before sending to the press:

- [ ] PDF dimensions exactly match what the printer asked (e.g., 300×216mm for the pieghevole, 154×111mm for the cartoline)
- [ ] 3mm bleed is present on all outer edges — verify by opening in Acrobat and looking for the bleed box vs trim box, OR by checking that solid-color backgrounds extend to the very edges of the PDF (no white margins)
- [ ] Crop marks at the 4 trim corners (small black L-shaped marks within the bleed area)
- [ ] No important text or graphic within 3mm of the trim cut line
- [ ] CMYK color space (verify with `gs -o - -sDEVICE=inkcov file.pdf`)
- [ ] All fonts embedded in the PDF (Puppeteer does this by default; verify with `pdffonts file.pdf` — every font should say "yes" in the "emb" column)
- [ ] QR codes scan correctly when printed at the final size (test by printing one page on home printer first)
- [ ] Vector graphics where possible (SVG logos), raster only for photos
- [ ] File size reasonable (< 10 MB usually; some printers reject huge uploads)

---

## When something goes wrong — debugging order

1. **Look at the rasterized PDF directly**, not what the PDF viewer renders. `pdftoppm -r 400 -png file.pdf /tmp/check` then read `/tmp/check-1.png`. PDF viewers can introduce their own artifacts (especially Chrome's built-in viewer at non-100% zoom).

2. **For seam/gap issues, sample pixels**:
   ```python
   from PIL import Image
   img = Image.open('check.png').convert('RGB')
   for x in range(seam_x - 5, seam_x + 5):
       print(x, img.getpixel((x, mid_y)))
   ```
   You'll see immediately if there's a transition gap, anti-aliasing band, or unexpected color.

3. **For color shifts in CMYK**, compare the same pixel in the FLAT and CMYK versions. Some shift is expected; large shifts mean the conversion intent or profile is wrong.

4. **For bleed problems**, check the trim box vs media box: `pdfinfo -box file.pdf`. If they're identical, the PDF doesn't tell the printer where to cut and they'll have to guess.

5. **For Puppeteer rendering oddities**, inspect what was actually rendered in the headless browser by using `--devtools` and a non-headless launch, OR by saving an intermediate PNG screenshot and looking at it.

---

## Things that took us a long time to figure out (so you don't have to)

- **Chromium's PDF page width is ~0.04mm bigger than the requested mm**. This was the cause of the white seam strip. Fix: render to PNG via screenshot, not to PDF.
- **`api.github.com` is blocked from this sandbox** but `github.com`, `raw.githubusercontent.com`, and `gist.github.com` are reachable. So `gh` CLI doesn't work without auth, but raw downloads do.
- **Most file-hosting services (transfer.sh, file.io, catbox.moe, pastebin) are blocked** by the proxy. The pragmatic workaround: push to GitHub via a temporary classic PAT (`ghp_…`) with `repo` scope. Fine-grained PATs (`github_pat_…`) need explicit "Contents: write" permission per repo, which is easy to miss.
- **GPG signing fails** in this sandbox (`signing server returned status 400`). Always commit with `git -c commit.gpgsign=false commit -m "..."`.
- **`pypdf` needs an up-to-date `cryptography`** to import cleanly. `pip3 install --upgrade cryptography` once at session start.
- **Pillow's PDF writer can't save JPEGs without `libjpeg-dev`** at install time. If `Image.save('out.pdf')` errors with `KeyError: 'JPEG'`, install libjpeg-dev and reinstall Pillow.
