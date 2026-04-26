# Specifiche tecniche di stampa per Claude Code

Tutto quello che serve sapere per generare i PDF di stampa a partire dagli HTML di questo pacchetto.

## Output desiderato

Due file PDF pronti per la tipografia:

1. **lato-A.pdf** — Lato fronte: Manifesto (sx) + Bundle (centro) + Copertina (dx)
2. **lato-B.pdf** — Lato retro: Lettore (sx) + Studio (centro) + Backoffice (dx)

## Prompt suggerito da dare a Claude Code

```
Devo generare due PDF di stampa per un pieghevole DL stretto a 
fisarmonica. Ho 6 file HTML, ognuno corrispondente a una singola 
anta in scala 1:1 (98×210mm, ovvero 370×794px @96dpi).

Per il PDF lato-A.pdf, assembla in orizzontale (da sinistra a destra):
- html/manifesto.html
- html/bundle.html  
- html/copertina.html

Per il PDF lato-B.pdf, assembla in orizzontale:
- html/lettore.html
- html/studio.html
- html/backoffice.html

Ogni PDF deve essere:
- Formato finale 300×216mm (294×210mm + 3mm di bleed per lato)
- Crocini di taglio agli angoli (5mm di lunghezza, 0.25pt di spessore, 
  posizionati esternamente al formato di taglio)
- Linee di cordonatura segnate (in piè di pagina, fuori area di stampa) 
  a 98mm e 196mm dal bordo sinistro del formato finale
- Risoluzione minima 300 DPI per le immagini raster
- Profilo colore CMYK (Coated FOGRA39 se disponibile, altrimenti 
  qualunque profilo CMYK standard europeo)
- Standard PDF/X-1a o PDF/X-4
- Font Fraunces e DM Sans embedded nel PDF

Le immagini raster (foto duotone in img/linda.png e img/daniela.png) 
devono mantenere risoluzione 300 DPI: a 240×240px alla dimensione 
attuale di rendering nei mockup (~52px × 52px), sono già abbondantemente 
sopra il minimo richiesto.

I loghi sono SVG vettoriali (svg/1.svg e svg/6.svg) e devono restare 
vettoriali nel PDF, non rasterizzati.

Procedi così:
1. Genera prima i PDF in RGB per controllo visivo
2. Mostrami una preview a bassa risoluzione di entrambi
3. Quando confermo, converti in CMYK e genera i PDF/X finali
```

## Approccio tecnico consigliato

Tre vie possibili in Python da Claude Code:

### Via 1 — Playwright/Puppeteer + Ghostscript (più affidabile)

```python
# Step 1: usa playwright per renderizzare ogni anta in PDF singolo
# (Playwright supporta nativamente l'export PDF e gestisce bene CSS, 
# font web, e SVG)

from playwright.async_api import async_playwright

async def render_anta_to_pdf(html_path, output_pdf):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f'file://{html_path}')
        await page.wait_for_load_state('networkidle')
        await page.pdf(
            path=output_pdf,
            width='98mm',
            height='210mm',
            print_background=True,
            margin={'top': 0, 'right': 0, 'bottom': 0, 'left': 0}
        )
        await browser.close()

# Step 2: usa Ghostscript per:
# - assemblare 3 PDF in 1 PDF orizzontale (294mm × 210mm)
# - aggiungere bleed di 3mm
# - aggiungere crocini di taglio
# - convertire in CMYK con profilo Coated FOGRA39
# - esportare come PDF/X-1a

# Esempio comando Ghostscript per CMYK + PDF/X:
# gs -dPDFX -dBATCH -dNOPAUSE -dNOOUTERSAVE -sDEVICE=pdfwrite \
#    -sColorConversionStrategy=CMYK \
#    -sOutputICCProfile=CoatedFOGRA39.icc \
#    -sOutputFile=lato-A-cmyk.pdf lato-A-rgb.pdf
```

### Via 2 — WeasyPrint (CSS print-aware nativo)

WeasyPrint è una libreria Python che rispetta CSS Paged Media (page-break, 
@page rules, bleed marks, crop marks). Più adatto per stampa, ma il 
rendering CSS è meno fedele rispetto a Chromium.

```python
from weasyprint import HTML, CSS

# CSS supplementare per stampa con bleed e crocini:
print_css = CSS(string='''
@page {
  size: 300mm 216mm;  /* formato con bleed */
  margin: 3mm;        /* bleed */
  marks: crop;        /* crocini di taglio automatici */
}
''')

HTML('lato-A-composto.html').write_pdf('lato-A.pdf', stylesheets=[print_css])
```

### Via 3 — Chrome headless + post-processing (la più diretta)

```bash
# Step 1: Chrome headless renderizza in PDF
chromium --headless --disable-gpu --print-to-pdf=lato-A-rgb.pdf \
  --print-to-pdf-no-header --no-pdf-header-footer \
  lato-A-composto.html

# Step 2: Ghostscript converte in CMYK + PDF/X
gs -dPDFX -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
   -sColorConversionStrategy=CMYK \
   -sOutputFile=lato-A-print.pdf lato-A-rgb.pdf
```

## Note importanti

### Conversione CMYK

I colori HEX nei CSS sono RGB. La conversione automatica in CMYK può 
produrre piccole derive cromatiche, in particolare su:

- **Rosa/crimson saturi** (#BE1558, #E8588D): possono perdere brillantezza
- **Oro #F4C95D**: può diventare giallo "spento"
- **Teal vivaci** (#14A89E, #2EC4B6): possono virare verso il verde

Per minimizzare problemi, usa il profilo **Coated FOGRA39** (standard europeo 
per carta patinata). Se vuoi un controllo più fine, puoi convertire 
manualmente i colori HEX in CMYK e aggiornare l'HTML usando 
`color: cmyk(...)` (supportato in PDF generation ma non sempre in browser).

### Foto duotone

Le immagini in `img/` sono già preparate in duotone plum/crema 
(non hanno bisogno di ulteriori conversioni). Sono PNG a 240×240px.

### Loghi SVG

I loghi SVG embedded come data-URL nei file HTML manterranno la qualità 
vettoriale solo se il convertitore PDF gestisce bene gli SVG. Playwright 
e WeasyPrint lo fanno bene; Ghostscript a volte rasterizza.

### QR Code (solo nella copertina)

Il QR nella copertina è disegnato come SVG inline con `<rect>` decorativi 
ma **non è un QR funzionante**. Prima di stampare, sostituiscilo con un 
QR vero generato a partire da `catalistbooks.it/early-bird`:

```python
import qrcode
qr = qrcode.make('https://catalistbooks.it/early-bird')
qr.save('img/qr-early-bird.png')  # poi sostituisci nel HTML copertina
```

Oppure usa una libreria che genera QR direttamente in SVG vettoriale 
per non perdere qualità in stampa.

## Checklist pre-stampa

Prima di mandare i PDF alla tipografia, verifica:

- [ ] Le misure sono esattamente 300×216mm (con bleed)
- [ ] Le cordonature sono a 98mm e 196mm dal bordo sinistro
- [ ] I crocini di taglio sono presenti e fuori area di stampa
- [ ] I font Fraunces e DM Sans sono embedded nel PDF
- [ ] I loghi SVG sono rimasti vettoriali (apri il PDF e zooma 800%, 
      i bordi delle lettere devono rimanere nitidi)
- [ ] Le foto duotone sono almeno 300 DPI alla dimensione di stampa
- [ ] Il QR è funzionante (scansionalo dal PDF stampato per verifica)
- [ ] I colori sono in CMYK (verifica con Acrobat → Output Preview)
- [ ] Tutti i testi importanti sono dentro i margini di sicurezza 
      (almeno 3mm dai bordi del formato di taglio)
