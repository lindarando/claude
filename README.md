# `lindarando/claude` — print pipelines for CataList & Ultima Pagina

Repo che raccoglie due progetti di stampa fatti partendo da mockup HTML/CSS:

| Progetto | Cosa | Cartella sorgenti | Output |
|---|---|---|---|
| **Cartoline Hic sunt libri** | 3 cartoline A6 (fronte + retro) per Ultima Pagina Quest @ Salone del Libro 2026 | `project/` | `Cartoline-Hic-sunt-libri-STAMPA{,-FLAT,-CMYK}.pdf` (con tallone) e `*-NOSTUB-*` (senza) |
| **Pieghevole CataList** | Volantino A4 a fisarmonica 3 ante per CataList (Salone del Libro 2026) | `pieghevole/pieghevole-package/` | `pieghevole-out/lato-{A,B}{,-FLAT,-CMYK}.pdf` |

I sorgenti sono mockup HTML/CSS che il design tool genera per la preview. Gli script in root convertono ogni mockup nei PDF da mandare in stampa o caricare su Canva.

## Quick start

```bash
# Cartoline (con tallone)
node generate-pdf.js
# Cartoline (versione no-stub)
node generate-pdf-nostub.js
# Pieghevole CataList — entrambi i lati
node render-antas.js && python3 compose-pieghevole.py
```

Per la conversione CMYK FOGRA39 (richiesta da molte tipografie) serve poi un passaggio Ghostscript con il profilo ICC ECI — vedi [`PRINT-PIPELINE.md`](./PRINT-PIPELINE.md).

## Documentazione

- **[`PRINT-PIPELINE.md`](./PRINT-PIPELINE.md)** — la "ricetta" tecnica riusabile per qualunque progetto di stampa che parte da HTML. Spiega il pattern, i tre formati di output, e tutti i gotcha che abbiamo incontrato (sub-pixel gap, bleed, CMYK, Canva, QR, Moiré). **Leggere questo prima di iniziare un nuovo progetto simile.**
- **[`pieghevole/README.md`](./pieghevole/README.md)** — comandi e modifiche specifici per il pieghevole CataList.
- **[`HANDOFF-CARTOLINE.md`](./HANDOFF-CARTOLINE.md)** — il README originale del bundle di Claude Design per le cartoline (è la "lettera" che il design tool ha allegato all'export).
- **`chats/`** — transcript della chat originale di design per le cartoline (utile per capire le decisioni creative).

## Output finali (cosa scaricare per cosa)

Per ogni "famiglia" di file ci sono tre versioni con suffissi:

- `*.pdf` — vector RGB (preview, archivio)
- `*-FLAT.pdf` — raster RGB ad alta risoluzione, niente layer editabili (**per Canva**)
- `*-CMYK.pdf` — raster CMYK FOGRA39 con profilo ICC embeddato (**per la tipografia**)

Se la tipografia accetta RGB → puoi mandarle anche il `-FLAT` direttamente. Se ti chiedono PDF/X o CMYK con profilo ICC esplicito → usa `-CMYK`.
