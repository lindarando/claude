# Pieghevole CataList - Salone del Libro 2026

Pacchetto completo per la generazione del PDF di stampa.

## Cosa contiene questo pacchetto

```
pieghevole-package/
├── docs/
│   ├── README.md                      Questo file
│   ├── SPECIFICHE-STAMPA.md           Specifiche tecniche per Claude Code
│   ├── PALETTE.md                     Palette colori CataList con codici HEX
│   └── LAYOUT-PIEGHEVOLE.md           Mappa fronte/retro delle ante
├── html/
│   ├── copertina.html                 Anta dx esterna (lato A)
│   ├── manifesto.html                 Anta sx esterna + bio + contatti (lato A)
│   ├── bundle.html                    Anta centro (lato A)
│   ├── lettore.html                   Anta sx interna (lato B)
│   ├── studio.html                    Anta centro interna (lato B)
│   └── backoffice.html                Anta dx interna (lato B)
├── svg/
│   ├── 1.svg → 10.svg                 10 varianti del logo CataList
└── img/
    ├── linda.png                      Foto duotone Linda (240×240, plum/crema)
    └── daniela.png                    Foto duotone Daniela (240×240, plum/crema)
```

## Cosa devi chiedere a Claude Code

L'obiettivo è generare due PDF di stampa pronti per la tipografia:

- **lato-A.pdf** — Manifesto + Bundle + Copertina (fronte del pieghevole)
- **lato-B.pdf** — Lettore + Studio + Backoffice (retro del pieghevole)

Entrambi i PDF devono essere **294×210mm + 3mm di bleed per lato** (file finale 300×216mm), con crocini di taglio agli angoli e cordonature segnate a 98mm e 196mm dal bordo sinistro.

Per le specifiche tecniche complete, vedi `SPECIFICHE-STAMPA.md`.

## Decisioni di design

### Logo: due varianti in uso

- **Logo bianco + pallino oro (svg/6.svg)** → tutte le ante a fondo scuro: Lettore, Studio, Backoffice, Bundle, Copertina
- **Logo navy + pallino crimson (svg/1.svg)** → ante a fondo chiaro: Manifesto

### Palette per anta

| Anta | Sfondo | Accent |
| --- | --- | --- |
| Copertina | Tricromia teal→navy→crimson | Oro #F4C95D |
| Manifesto | Crema (#F4EDE0 → #E8DCC4) | Crimson #BE1558 + Plum #751B4F |
| Lettore | Teal (#14A89E → #0A5557) | Oro #F4C95D |
| Studio | Navy/Inchiostro (#2D3047 → #131628) | Oro #F4C95D |
| Backoffice | Crimson (#BE1558 → #5A1340) | Oro #F4C95D |
| Bundle | Plum scuro (#6B1747 → #4A0F35) | Oro #F4C95D |

### Tipografia

- **Display/serif:** Fraunces (Google Fonts) — già caricato negli HTML via @import
- **Sans-serif:** DM Sans (Google Fonts) — già caricato negli HTML via @import

### Decisioni di copy chiave

- **Payoff brand:** "La casa dei tuoi libri." (in copertina come headline)
- **Label pricing:** "Early Bird" (NON "Early Bird Salone" — il pieghevole è evergreen)
- **Slug QR finale:** catalistbooks.it/early-bird
- **Frase di chiusura nel manifesto:** "CataList. Lo abbiamo creato perché non c'era."
- **Punto debole noto:** la copertina ha un kicker "Salone del Libro · 2026" che è in conflitto con la natura evergreen del materiale. Da decidere prima della stampa: tenerlo (pieghevole solo-Salone) o sostituirlo con un kicker neutro.

## Specifiche tecniche di stampa rapide

| Parametro | Valore |
| --- | --- |
| Formato finale aperto | 294 × 210 mm |
| Formato singola anta | 98 × 210 mm |
| Bleed (abbondanza) | 3 mm per lato |
| File con bleed | 300 × 216 mm |
| Margini di sicurezza | 3 mm (testi e elementi importanti dentro 288×204mm) |
| Cordonature | a 98 mm e 196 mm dal bordo sx |
| Risoluzione | 300 DPI minimo |
| Colore | CMYK (Coated FOGRA39) |
| Carta consigliata | Patinata opaca 350gr |
| Formato file | PDF/X-1a o PDF/X-4 |

## Workflow consigliato

1. **Primo test (RGB):** chiedi a Claude Code di generare i due PDF in RGB così come sono. Visualizzali in Acrobat Reader per controllare misure, layout, leggibilità.
2. **Conversione CMYK:** chiedi a Claude Code di convertire i colori in CMYK con profilo Coated FOGRA39 e generare i PDF/X-1a finali.
3. **Test fisico A4:** stampa i due PDF su carta normale A4 e piegali a fisarmonica. Verifica che l'ordine delle ante sia corretto fisicamente (la fisarmonica è controintuitiva).
4. **Test stampa tipografia:** prima delle 100 copie definitive, ordina **una sola anta** dalla tipografia (la Copertina o il Bundle, le ante coi colori più "rischiosi"). Verifica resa cromatica reale. Se necessario, aggiusta i colori HEX nell'HTML e rigenera.
5. **Stampa finale:** quando il test è ok, ordina la tiratura completa.

## Riferimenti

- Tipografie consigliate: Pixartprinting, Sprint24 (online), o tipografia locale di Torino
- Per il QR finale, lo slug è `catalistbooks.it/early-bird`. Genera il QR con un tool tipo qrcode-monkey.com o tramite libreria Python (`qrcode`) in Claude Code stesso.
