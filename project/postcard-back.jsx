// Back of the postcard — cream paper, postal layout
// (QR_MATRIX defined in qr-matrix.jsx, loaded globally.)
// Left: message area with ruled lines
// Right: address lines + stamp area (QR "Hic fui")

function PostcardBack({
  W = 700, H = 440,
  latinDay = 'Dies Secundus',
  dayLabel = 'MERIDIES',
  dateBig = '16 · 05 · 2026',
  dateSmall = 'sabato · meridies',
  creatureLatin = 'Gryphus Lector',
  serial = '2 · 16.05.26',
  cardNumber = '02 / 03',
  mottoText = 'DE LIBRIS NIHIL NISI BONUM',
}) {
  const bgDeep = '#020814';
  const bgNavy = '#002740';
  const red    = '#E8342C';
  const yellow = '#FDC548';
  const teal   = '#3BA5C4';
  const cream  = '#FAF7F2';
  const paper  = '#F4EEE2';   // slightly warmer than cream
  const paperEdge = '#E8DFC9';
  const inkSoft = '#3E4C63';  // muted navy ink for ruled lines

  let s = 4242;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const foxing = [];
  for (let i = 0; i < 220; i++) {
    foxing.push(<circle key={i} cx={rand() * W} cy={rand() * H}
      r={rand() * 0.6 + 0.2}
      fill={i % 3 === 0 ? '#C9A66B' : bgNavy}
      opacity={rand() * 0.08 + 0.02} />);
  }

  const uid = serial.replace(/\W/g, '');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display:'block' }}>
      <defs>
        <clipPath id={`backClip-${uid}`}><rect width={W} height={H} rx={6} ry={6} /></clipPath>
        {/* warm paper base: cream center, slightly darker toward edges */}
        <radialGradient id={`paperBg-${uid}`} cx="50%" cy="50%" r="78%">
          <stop offset="0%" stopColor={cream} />
          <stop offset="70%" stopColor={paper} />
          <stop offset="100%" stopColor={paperEdge} />
        </radialGradient>
        {/* subtle top/bottom navy bands as accent */}
        <linearGradient id={`topBand-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bgNavy} stopOpacity={0.95} />
          <stop offset="100%" stopColor={bgNavy} stopOpacity={0.9} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#backClip-${uid})`}>
        {/* paper base */}
        <rect x={0} y={0} width={W} height={H} fill={`url(#paperBg-${uid})`} />

        {/* top navy band with the ULTIMA PAGINA QUEST marquee */}
        <rect x={0} y={0} width={W} height={46} fill={`url(#topBand-${uid})`} />
        <g>
          <text x={24} y={28} fill={cream} opacity={0.92}
                style={{ font: '400 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            ULTIMA PAGINA QUEST · <tspan style={{ fontWeight: 600 }}>Nº {cardNumber}</tspan>
          </text>
          <text x={W - 24} y={28} textAnchor="end" fill={yellow}
                style={{ font: '700 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            {latinDay.toUpperCase()} · {dayLabel}
          </text>
          {/* little hairline below the band, in red */}
          <line x1={0} y1={46} x2={W} y2={46} stroke={red} strokeWidth={1.2} opacity={0.9} />
          <line x1={0} y1={49} x2={W} y2={49} stroke={red} strokeWidth={0.4} opacity={0.5} />
        </g>

        {/* bottom navy band */}
        <rect x={0} y={H - 46} width={W} height={46} fill={`url(#topBand-${uid})`} />
        <line x1={0} y1={H - 46} x2={W} y2={H - 46} stroke={red} strokeWidth={1.2} opacity={0.9} />
        <line x1={0} y1={H - 49} x2={W} y2={H - 49} stroke={red} strokeWidth={0.4} opacity={0.5} />

        {/* central vertical divider (postal convention) — dotted ink */}
        <line x1={W / 2} y1={64} x2={W / 2} y2={H - 64}
              stroke={bgNavy} strokeWidth={0.5} opacity={0.35} strokeDasharray="1.5 4" />

        {/* ═══ LEFT: MESSAGE AREA ═══ */}
        <g transform="translate(30 72)">
          <text x={0} y={0} fill={bgNavy}
                style={{ font: '700 8.5px "DM Sans", sans-serif', letterSpacing: 2.5 }}>
            EPISTULA · <tspan style={{ fontWeight: 400 }}>MESSAGGIO</tspan>
          </text>
          <line x1={0} y1={8} x2={62} y2={8} stroke={red} strokeWidth={1.6} />
          <text x={0} y={28} fill={bgNavy} opacity={0.9}
                style={{ font: '500 12px Recoleta, serif' }}>
            {'\u201C' + mottoText.charAt(0) + mottoText.slice(1).toLowerCase() + '\u201D'}
            <tspan fill={bgNavy} opacity={0.55} style={{ font: '500 8px "DM Sans", sans-serif' }} dx={8}>
              {'\u201CDei libri si dica solo bene\u201D'}
            </tspan>
          </text>

          {/* ruled lines for writing — ink on paper */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={0} y1={68 + i * 28} x2={290} y2={68 + i * 28}
                  stroke={inkSoft} strokeWidth={0.35} opacity={0.45} />
          ))}

          {/* signature area */}
          <text x={0} y={284} fill={bgNavy} opacity={0.7}
                style={{ font: '500 8px "DM Sans", sans-serif', letterSpacing: 2 }}>
            EXPLORATORIS MANU · DI MIO PUGNO
          </text>
          <line x1={0} y1={300} x2={180} y2={300} stroke={inkSoft} strokeWidth={0.4} opacity={0.55} />
        </g>

        {/* ═══ RIGHT: ADDRESS + STAMP ═══ */}
        <g transform={`translate(${W / 2 + 28} 72)`}>
          {/* "stamp" = QR nel riquadro tipo francobollo */}
          <g transform="translate(214 0)">
            {/* frame: navy on cream paper */}
            <rect x={0} y={0} width={90} height={96} fill={bgNavy} />
            <rect x={3} y={3} width={84} height={90} fill={cream} />
            <rect x={6} y={6} width={78} height={84} fill="none" stroke={bgNavy} strokeWidth={0.8} strokeDasharray="2 1.5" />
            <text x={45} y={17} textAnchor="middle" fill={bgNavy}
                  style={{ font: '700 7px Recoleta, serif', letterSpacing: 2 }}>
              HIC FUI
            </text>
            <g transform="translate(45 50)">
              <rect x={-28} y={-28} width={56} height={56} fill={cream} />
              {(() => {
                const size = QR_MATRIX.length; // 29
                const mod = 56 / size;
                // Detect if a cell is inside one of the 3 finder patterns (7x7 at corners)
                const inFinder = (r, c) => (
                  (r < 7 && c < 7) ||
                  (r < 7 && c >= size - 7) ||
                  (r >= size - 7 && c < 7)
                );
                const dots = [];
                for (let r = 0; r < size; r++) {
                  for (let c = 0; c < size; c++) {
                    if (QR_MATRIX[r][c] && !inFinder(r, c)) {
                      const cx = -28 + c * mod + mod / 2;
                      const cy = -28 + r * mod + mod / 2;
                      dots.push(
                        <circle key={`${r}-${c}`} cx={cx} cy={cy} r={mod * 0.42} fill={bgNavy} />
                      );
                    }
                  }
                }
                // Rounded "eyes" (finder patterns): outer rounded square 7×7 modules,
                // inner 3×3 rounded filled square. Positions: top-left, top-right, bottom-left.
                const eyes = [[0,0],[0,size-7],[size-7,0]].map(([er,ec], i) => {
                  const x = -28 + ec * mod;
                  const y = -28 + er * mod;
                  const s = 7 * mod;
                  const innerOff = 2 * mod;
                  const innerS = 3 * mod;
                  return (
                    <g key={`eye-${i}`}>
                      {/* outer ring */}
                      <rect x={x} y={y} width={s} height={s} rx={mod * 1.8} ry={mod * 1.8}
                            fill="none" stroke={bgNavy} strokeWidth={mod} />
                      {/* inner pupil */}
                      <rect x={x + innerOff} y={y + innerOff} width={innerS} height={innerS}
                            rx={mod * 0.9} ry={mod * 0.9} fill={bgNavy} />
                    </g>
                  );
                });
                return <>{dots}{eyes}</>;
              })()}
            </g>
            <text x={45} y={85} textAnchor="middle" fill={bgNavy}
                  style={{ font: '500 6px "DM Sans", sans-serif', letterSpacing: 1 }}>
              attestato
            </text>
          </g>

          {/* address block */}
          <g transform="translate(0 118)">
            <text x={0} y={0} fill={bgNavy}
                  style={{ font: '700 8.5px "DM Sans", sans-serif', letterSpacing: 2.5 }}>
              AD · <tspan style={{ fontWeight: 400 }}>DESTINATARIO</tspan>
            </text>
            <line x1={0} y1={8} x2={17} y2={8} stroke={red} strokeWidth={1.6} />
            {/* 4 address lines */}
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={i} x1={0} y1={40 + i * 32} x2={308} y2={40 + i * 32}
                    stroke={inkSoft} strokeWidth={0.4} opacity={0.5} />
            ))}
          </g>
        </g>

        {/* ═══ BOTTOM BAR (on navy) ═══ */}
        <g transform={`translate(0 ${H - 46})`}>
          <text x={24} y={20} fill={cream} fontStyle="italic"
                style={{ font: 'italic 600 12px Recoleta, serif' }}>
            Hic sunt libri.
          </text>
          <text x={24} y={34} fill={cream} opacity={0.65}
                style={{ font: '500 8.5px "DM Sans", sans-serif', letterSpacing: 1.5 }}>
            {creatureLatin}
          </text>

          <text x={W / 2} y={20} textAnchor="middle" fill={yellow}
                style={{ font: '700 11px Recoleta, serif', letterSpacing: 2 }}>
            {dateBig}
          </text>
          <text x={W / 2} y={34} textAnchor="middle" fill={cream} opacity={0.65}
                style={{ font: '500 8.5px Recoleta, serif' }}>
            {dateSmall.split(' · ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ')}
          </text>

          <text x={W - 24} y={20} textAnchor="end" fill={cream}
                style={{ font: '700 10px "DM Sans", monospace', letterSpacing: 2 }}>
            SERIE {serial}
          </text>
          <text x={W - 24} y={34} textAnchor="end" fill={yellow} opacity={0.9}
                style={{ font: '500 8.5px "DM Sans", sans-serif', letterSpacing: 1 }}>
            quest.ultimapagina.net
          </text>
        </g>

        {/* paper foxing / aging specks */}
        <g>{foxing}</g>
      </g>
    </svg>
  );
}

Object.assign(window, { PostcardBack });
