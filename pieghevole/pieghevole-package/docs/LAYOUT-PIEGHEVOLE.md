# Layout pieghevole DL stretto a fisarmonica

## Schema generale

Il pieghevole è un **DL stretto a fisarmonica** (piega a Z), 6 facciate totali, 3 ante per lato.

- **Formato chiuso:** 98 × 210 mm
- **Formato aperto:** 294 × 210 mm
- **Pieghe:** 2 cordonature, una in dentro e una in fuori (alternate)
- **Ordine pieghe:** la fisarmonica si dispiega tirando un'estremità

## Vista aperta — Lato A (fronte)

Quello che il visitatore vede dopo aver girato il pieghevole appena aperto.

```
┌────────────┬────────────┬────────────┐
│            │            │            │
│            │            │            │
│ MANIFESTO  │   BUNDLE   │ COPERTINA  │
│            │            │            │
│ + bio      │   SUITE    │ + payoff   │
│ + contatti │            │ + QR       │
│            │            │            │
│            │            │            │
└────────────┴────────────┴────────────┘
   98 mm        98 mm       98 mm
                 ↑           ↑
              piega 1     piega 2
              (a 98mm)   (a 196mm)
```

**Ordine di lettura del lato A (per Claude Code che assembla l'HTML):**

1. `html/manifesto.html` (sinistra)
2. `html/bundle.html` (centro)
3. `html/copertina.html` (destra)

## Vista aperta — Lato B (retro)

L'interno del pieghevole, i tre moduli affiancati.

```
┌────────────┬────────────┬────────────┐
│            │            │            │
│            │            │            │
│  LETTORE   │   STUDIO   │ BACKOFFICE │
│            │            │            │
│   teal     │    navy    │  crimson   │
│            │            │            │
│            │            │            │
│            │            │            │
└────────────┴────────────┴────────────┘
   98 mm        98 mm       98 mm
                 ↑           ↑
              piega 1     piega 2
              (a 98mm)   (a 196mm)
```

**Ordine di lettura del lato B (per Claude Code che assembla l'HTML):**

1. `html/lettore.html` (sinistra)
2. `html/studio.html` (centro)
3. `html/backoffice.html` (destra)

## Vista laterale della fisarmonica

```
       ╱╲      ╱╲
      ╱  ╲    ╱  ╲
     ╱    ╲  ╱    ╲
    ╱      ╲╱      ╲
   ╱     piega 1    ╲
  ╱       (in)       ╲
                  piega 2
                   (out)
```

Le pieghe alternate creano la classica forma a Z. Quando il pieghevole è chiuso (a riposo sul tavolino), si vede solo la **Copertina** (anta dx del lato A).

## Esperienza di lettura del visitatore

1. **Vede la Copertina** sul tavolino: tricromia teal/navy/crimson, "La casa dei tuoi libri"
2. **Lo prende e lo gira**: sul retro vede il **Manifesto** (anta sx esterna del lato A, che è anche l'anta nascosta sotto la copertina)
3. **Tira un'estremità**: si dispiega a fisarmonica, vede affiancati i tre moduli sul lato B (Lettore, Studio, Backoffice)
4. **Gira di nuovo** (oppure non gira): sul lato A trova al centro il **Bundle Suite** che lega Studio + Backoffice

## Specifiche di assemblaggio per i PDF di stampa

Quando assembli i 3 HTML per ciascun lato in un singolo HTML composito, fai così:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: 300mm 216mm;        /* 294×210 + 3mm bleed per lato */
      margin: 0;
      marks: crop;              /* crocini di taglio */
      bleed: 3mm;               /* dichiarazione bleed */
    }
    body {
      width: 294mm;
      height: 210mm;
      margin: 3mm;              /* compensa bleed */
      display: flex;
    }
    .anta {
      width: 98mm;
      height: 210mm;
    }
  </style>
</head>
<body>
  <div class="anta">[contenuto Manifesto]</div>
  <div class="anta">[contenuto Bundle]</div>
  <div class="anta">[contenuto Copertina]</div>
</body>
</html>
```

Le linee di cordonatura (a 98mm e 196mm dal bordo sinistro) di solito sono indicate dalla tipografia in base al loro template, non vanno disegnate sul PDF stesso. Verifica con la tipografia se vogliono il PDF "pulito" o con i marker di piega visibili.

## Note pratiche

- **Bleed (abbondanza):** ogni anta deve estendere il fondo di 3mm fuori dal formato di taglio. Per i fondi a tinta unita o gradient, il browser/converter deve continuare il colore oltre il bordo dei 98mm.
- **Sicurezza:** testi e elementi importanti devono stare almeno 3mm dentro il bordo di taglio. Verifica che nessuna parola venga tagliata.
- **Cordonature:** la tipografia farà la cordonatura fisica. Non serve disegnare linee tratteggiate sul PDF, solo essere sicuri che le ante siano a 98mm precisi.
