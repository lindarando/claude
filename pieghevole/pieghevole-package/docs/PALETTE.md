# Palette CataList — Codici HEX e CMYK

## Palette base brand

| Nome | HEX | CMYK approssimato | Uso principale |
| --- | --- | --- | --- |
| Crimson | `#BE1558` | C:18 M:100 Y:55 K:14 | Sfondo Backoffice, accent generale, pallino logo navy |
| Rose | `#E8588D` | C:0 M:73 Y:21 K:0 | Accent secondario |
| Plum | `#751B4F` | C:42 M:100 Y:35 K:35 | Sfondo Bundle, titoli Manifesto |
| Petal | `#F2ACCB` | C:0 M:42 Y:8 K:0 | Accent rosa caldo |
| Blush | `#F9DAE6` | C:0 M:18 Y:5 K:0 | Sfondo morbido |

## Accenti e neutri

| Nome | HEX | CMYK approssimato | Uso principale |
| --- | --- | --- | --- |
| Oro | `#F4C95D` | C:5 M:21 Y:73 K:0 | Accent moduli scuri (Lettore, Studio, Backoffice, Bundle, Copertina), pallino logo bianco |
| Navy | `#1B1F3B` | C:96 M:90 Y:48 K:65 | Sfondo Studio, testo logo navy |
| Grafite | `#2D3047` | C:90 M:84 Y:50 K:55 | Sfumatura Studio |
| Acquamarina | `#2EC4B6` | C:71 M:0 Y:36 K:0 | Tema Lettore (sfumatura) |
| Teal scuro | `#0D7377` | C:88 M:42 Y:50 K:35 | Sfondo Lettore |

## Crema (Manifesto)

| Nome | HEX | CMYK approssimato |
| --- | --- | --- |
| Crema chiaro | `#F4EDE0` | C:3 M:6 Y:13 K:0 |
| Crema medio | `#EFE5D2` | C:5 M:9 Y:18 K:0 |
| Crema scuro | `#E8DCC4` | C:8 M:13 Y:24 K:0 |

## Note sulla conversione

**I CMYK indicati sono approssimazioni** e possono variare a seconda del profilo colore usato (Coated FOGRA39 vs SWOP vs altro). Per stampa professionale, la conversione va fatta dal software di destinazione (Ghostscript, Acrobat, Affinity) usando il profilo della carta scelta.

I colori più "rischiosi" in stampa CMYK sono:

- **Crimson #BE1558**: il rosa magenta saturo perde brillantezza in CMYK. Se stampato sembra "spento", aumentare M (Magenta) di 3-5 punti.
- **Oro #F4C95D**: tende a virare verso il giallo opaco. Per mantenere il "caldo" si può aumentare M di 5-8 punti.
- **Teal #14A89E**: i ciano/teal vivaci possono diventare verde acquoso. Aumentare leggermente C (Cyan) e diminuire Y (Yellow).

Il modo più affidabile per evitare sorprese è **un test stampa fisico di una sola anta** (5-10€ presso la tipografia) prima di lanciare la tiratura completa.

## Mappatura colori per anta

### Copertina
- Sfondo: gradiente verticale teal → navy → crimson
  - 0%: `#14A89E` (teal vivace)
  - 25%: `#1F6B85` (transizione)
  - 50%: `#2D3047` (grafite)
  - 75%: `#6B1850` (transizione plum)
  - 100%: `#BE1558` (crimson)
- Accent: `#F4C95D` (oro)

### Manifesto
- Sfondo: gradiente crema `#F4EDE0 → #EFE5D2 → #E8DCC4`
- Titoli: `#751B4F` (plum)
- Accent: `#BE1558` (crimson)
- Testo prose: `#3A2128` (plum scurissimo)

### Lettore
- Sfondo: gradiente teal `#14A89E → #0D7377 → #0A5557`
- Accent: `#F4C95D` (oro)

### Studio
- Sfondo: gradiente navy `#2D3047 → #1B1F3B → #131628`
- Accent: `#F4C95D` (oro)

### Backoffice
- Sfondo: gradiente crimson `#BE1558 → #8E1A53 → #5A1340`
- Accent: `#F4C95D` (oro)

### Bundle
- Sfondo: gradiente plum `#6B1747 → #5A1340 → #4A0F35`
- Accent: `#F4C95D` (oro)
