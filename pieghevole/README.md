# Pieghevole CataList — note operative

Volantino A4 a fisarmonica, 3 ante per lato, formato chiuso 98×210mm, aperto 294×210mm. Output finale: 300×216mm (294×210 trim + 3mm bleed/lato).

Per il "perché" e i gotcha generali del processo di stampa, vedi **[`../PRINT-PIPELINE.md`](../PRINT-PIPELINE.md)**.

## Layout

```
Lato A (fronte):
┌────────────┬────────────┬────────────┐
│ MANIFESTO  │   BUNDLE   │ COPERTINA  │
│  (cream)   │  (crimson) │ (gradient) │
└────────────┴────────────┴────────────┘
   98 mm        98 mm       98 mm

Lato B (retro):
┌────────────┬────────────┬────────────┐
│  LETTORE   │   STUDIO   │ BACKOFFICE │
│   (teal)   │   (navy)   │  (crimson) │
└────────────┴────────────┴────────────┘
```

Le ante esterne (manifesto/copertina, lettore/backoffice) hanno bleed sul lato esterno + top + bottom (101mm wide). Le ante centrali (bundle, studio) solo top + bottom (98mm wide).

## File sorgenti

- `pieghevole-package/html/*.html` — un file HTML per anta. Sono mockup standalone con la `.anta` (370×794 px = 98×210mm @ 96dpi) dentro un wrapper "preview".
- `pieghevole-package/img/` — foto duotone per i founder (`linda.png`, `daniela.png`).
- `pieghevole-package/svg/` — loghi e simboli SVG (alcuni anche embedded come data-URI direttamente nei file HTML).
- `pieghevole-package/docs/` — documentazione originale del progetto (layout, palette, specifiche stampa).

## Output

Tutti i file finiscono in `../pieghevole-out/`:

| File | Per cosa |
|---|---|
| `lato-A.pdf`, `lato-B.pdf` | Preview RGB (raster, 508 DPI) |
| `lato-A-FLAT.pdf`, `lato-B-FLAT.pdf` | Canva (raster RGB, JPEG-92) |
| `lato-A-CMYK.pdf`, `lato-B-CMYK.pdf` | Stampatore (CMYK FOGRA39) |
| `antas/*.png` | Render intermedi delle 6 ante singole (non mandare alla tipografia, sono debug) |

## Comandi

```bash
# Dalla root del repo:
node render-antas.js          # rende ogni anta in PNG a 508 DPI
python3 compose-pieghevole.py # compone i 2 lati + crocini + FLAT.pdf

# Conversione CMYK (per ogni lato):
for lato in A B; do
  gs -dBATCH -dNOPAUSE -dSAFER -sDEVICE=pdfwrite \
    -dProcessColorModel=/DeviceCMYK -sColorConversionStrategy=CMYK \
    -sColorConversionStrategyForImages=CMYK \
    -sOutputICCProfile=/tmp/ISOcoated_v2_300_eci.icc \
    -dOverrideICC=true -dRenderIntent=1 -dCompatibilityLevel=1.4 \
    -sOutputFile="pieghevole-out/lato-${lato}-CMYK.pdf" \
    "pieghevole-out/lato-${lato}-FLAT.pdf"
done
```

Tempo totale: ~3 minuti per ricompilare tutto.

## Modifiche frequenti

### Cambiare un prezzo

`pieghevole-package/html/<anta>.html`, cerca `class="price-new"`:
```html
<span class="price-new">€59</span>
```

### Cambiare una citazione

`pieghevole-package/html/<anta>.html`, cerca `class="quote-text"`:
```html
<div class="quote-text">«…»</div>
```

Le dimensioni delle citazioni devono restare uniformi (12.5px text + 9.5px attribution) — vedi commit `b23abcb` per il fix di un'inconsistenza precedente.

### Cambiare il QR della copertina

Il QR viene generato runtime da `qr-matrix.json`. Per cambiare l'URL:

```bash
python3 -c "
import qrcode, json
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=0)
qr.add_data('https://nuovo-url.com')
qr.make(fit=True)
m = [[1 if c else 0 for c in row] for row in qr.get_matrix()]
with open('qr-matrix.json','w') as f:
    json.dump({'size': len(m), 'matrix': m, 'url': 'https://nuovo-url.com'}, f)
"
```

Poi rilancia `node render-antas.js`.

### Aggiungere un'anta

1. Nuovo file `html/<nome>.html` seguendo la struttura dei file esistenti (importante: deve avere un elemento `.anta` con dentro `.anta-content`).
2. Aggiungi `{ name: '<nome>', position: 'left'|'middle'|'right' }` all'array `ANTAS` in `render-antas.js`.
3. Aggiungi a `LATO_A` o `LATO_B` in `compose-pieghevole.py`.
4. Se vai oltre 3 ante per lato, devi anche aggiornare `PAGE_W_MM` e le posizioni in `compose-pieghevole.py`.

## Specifiche tecniche di stampa

- **Trim**: 294×210mm (3 ante da 98mm)
- **Bleed**: 3mm su ogni lato esterno → pagina finale 300×216mm
- **Crocini di taglio**: 2.5mm × 0.25pt ai 4 angoli del trim, dentro l'area di bleed (più grandi non ci stanno nei 3mm)
- **Pieghe**: 2 cordonature a 98mm e 196mm dal bordo sinistro (la tipografia le applica fisicamente, non vanno disegnate)
- **Risoluzione**: 508 DPI raster (= 20 px/mm esatti)
- **Colore**: CMYK FOGRA39 (ISO Coated v2 300% ECI)
- **Font embedded**: Fraunces (serif), DM Sans (sans). Caricati da Google Fonts CDN durante il render.

## Storia delle modifiche

Vedi `git log --oneline pieghevole-out/` per la cronologia. Eventi principali:
- Setup iniziale pipeline (commit `3a6ec95`)
- Fix bleed overlap ai seam + uniformazione citazioni + nuova citazione backoffice (`b23abcb`)
- Rimozione pattern di grana (`f310054`)
- Fix definitivo sub-pixel gap via raster pipeline a 508 DPI (`c7a840a`)
