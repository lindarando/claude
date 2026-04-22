// Back of the postcard — classic postale layout
// Left: message area with micro-marginalia
// Right: address lines + stamp area (with micro QR "Hic fui")
// Ticket-style divider in the middle

function PostcardBack({
  W = 700, H = 440,
  latinDay = 'Dies Secundus',
  dayLabel = 'MERIDIES',
  dateBig = '16 · 05 · 2026',
  dateSmall = 'sabato · meridies',
  creatureLatin = 'Gryphus lector',
  serial = '2 · 16.05.26',
  cardNumber = '02 / 03',
  mottoText = 'DE LIBRIS NIL NISI BONUM',
}) {
  const bgDeep = '#020814';
  const bgNavy = '#002740';
  const bgMid  = '#0A2545';
  const red    = '#E8342C';
  const yellow = '#FDC548';
  const teal   = '#3BA5C4';
  const cream  = '#FAF7F2';

  let s = 4242;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const grain = [];
  for (let i = 0; i < 800; i++) {
    grain.push(<circle key={i} cx={rand() * W} cy={rand() * H} r={rand() * 0.5 + 0.15}
      fill={i % 2 ? cream : teal} opacity={rand() * 0.14 + 0.04} />);
  }

  const uid = serial.replace(/\W/g, '');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display:'block' }}>
      <defs>
        <clipPath id={`backClip-${uid}`}><rect width={W} height={H} rx={6} ry={6} /></clipPath>
        <radialGradient id={`backSky-${uid}`} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor={bgMid} />
          <stop offset="60%" stopColor={bgNavy} />
          <stop offset="100%" stopColor={bgDeep} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#backClip-${uid})`}>
        <rect x={0} y={0} width={W} height={H} fill={`url(#backSky-${uid})`} />

        {/* top marquee */}
        <g>
          <text x={24} y={30} fill={cream} opacity={0.85}
                style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            ULTIMA PAGINA QUEST · Nº {cardNumber}
          </text>
          <line x1={24} y1={40} x2={W - 24} y2={40} stroke={cream} strokeWidth={0.3} opacity={0.25} />
          <text x={W - 24} y={30} textAnchor="end" fill={yellow}
                style={{ font: '700 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            {latinDay.toUpperCase()} · {dayLabel}
          </text>
        </g>

        {/* central vertical divider (postal convention) */}
        <line x1={W / 2} y1={58} x2={W / 2} y2={H - 54}
              stroke={cream} strokeWidth={0.4} opacity={0.3} strokeDasharray="2 4" />

        {/* ═══ LEFT: MESSAGE AREA ═══ */}
        <g transform="translate(30 68)">
          <text x={0} y={0} fill={yellow}
                style={{ font: '600 8.5px "DM Sans", sans-serif', letterSpacing: 2.5 }}>
            EPISTULA · MESSAGGIO
          </text>
          <line x1={0} y1={8} x2={18} y2={8} stroke={red} strokeWidth={1.6} />
          <text x={0} y={28} fill={cream} fontStyle="italic" opacity={0.75}
                style={{ font: 'italic 500 11px Recoleta, serif' }}>
            "{mottoText}"
          </text>

          {/* ruled lines for writing */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={0} y1={68 + i * 28} x2={290} y2={68 + i * 28}
                  stroke={cream} strokeWidth={0.35} opacity={0.28} />
          ))}

          {/* signature area */}
          <text x={0} y={284} fill={cream} opacity={0.55}
                style={{ font: '500 8px "DM Sans", sans-serif', letterSpacing: 2 }}>
            EXPLORATORIS MANU · DI MIO PUGNO
          </text>
          <line x1={0} y1={300} x2={180} y2={300} stroke={cream} strokeWidth={0.4} opacity={0.35} />
        </g>

        {/* ═══ RIGHT: ADDRESS + QR + STAMP ═══ */}
        <g transform={`translate(${W / 2 + 22} 68)`}>
          {/* "stamp" = QR nel riquadro tipo francobollo */}
          <g transform="translate(236 0)">
            {/* frame */}
            <rect x={0} y={0} width={90} height={96} fill={cream} />
            <rect x={4} y={4} width={82} height={88} fill="none" stroke={bgNavy} strokeWidth={0.8} strokeDasharray="2 1.5" />
            {/* title */}
            <text x={45} y={15} textAnchor="middle" fill={bgNavy}
                  style={{ font: '700 7px Recoleta, serif', letterSpacing: 2 }}>
              HIC FUI
            </text>
            {/* QR */}
            <g transform="translate(45 52)">
              <rect x={-30} y={-30} width={60} height={60} fill={cream} />
              {(() => {
                const cells = [];
                let qs = 314;
                const qr = () => { qs = (qs * 9301 + 49297) % 233280; return qs / 233280; };
                for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
                  if (qr() > 0.48) cells.push(
                    <rect key={`${r}-${c}`} x={-30 + c * 4} y={-30 + r * 4} width={4} height={4} fill={bgNavy} />
                  );
                }
                return cells;
              })()}
              {[[-30,-30],[14,-30],[-30,14]].map(([x,y],i)=>(
                <g key={i}>
                  <rect x={x} y={y} width={16} height={16} fill={cream} />
                  <rect x={x+2} y={y+2} width={12} height={12} fill="none" stroke={bgNavy} strokeWidth={1.6} />
                  <rect x={x+5} y={y+5} width={6} height={6} fill={bgNavy} />
                </g>
              ))}
            </g>
            <text x={45} y={90} textAnchor="middle" fill={bgNavy}
                  style={{ font: '500 6px "DM Sans", sans-serif', letterSpacing: 1 }}>
              attestato
            </text>
          </g>

          {/* address block */}
          <g transform="translate(0 118)">
            <text x={0} y={0} fill={yellow}
                  style={{ font: '600 8.5px "DM Sans", sans-serif', letterSpacing: 2.5 }}>
              AD · DESTINATARIO
            </text>
            <line x1={0} y1={8} x2={18} y2={8} stroke={red} strokeWidth={1.6} />
            {/* 4 address lines */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i}>
                <line x1={0} y1={40 + i * 32} x2={320} y2={40 + i * 32}
                      stroke={cream} strokeWidth={0.45} opacity={0.32} />
              </g>
            ))}
          </g>
        </g>

        {/* ═══ BOTTOM BAR ═══ */}
        <g>
          <line x1={24} y1={H - 44} x2={W - 24} y2={H - 44} stroke={cream} strokeWidth={0.3} opacity={0.25} />
          <text x={24} y={H - 26} fill={cream} fontStyle="italic"
                style={{ font: 'italic 600 12px Recoleta, serif' }}>
            Hic sunt libri.
          </text>
          <text x={24} y={H - 12} fill={cream} opacity={0.55}
                style={{ font: '500 8.5px "DM Sans", sans-serif', letterSpacing: 1.5 }}>
            {creatureLatin}
          </text>

          <text x={W / 2} y={H - 26} textAnchor="middle" fill={yellow}
                style={{ font: '700 11px Recoleta, serif', letterSpacing: 2 }}>
            {dateBig}
          </text>
          <text x={W / 2} y={H - 12} textAnchor="middle" fill={cream} opacity={0.55}
                style={{ font: 'italic 500 8.5px Recoleta, serif' }}>
            {dateSmall}
          </text>

          <text x={W - 24} y={H - 26} textAnchor="end" fill={cream}
                style={{ font: '700 10px "DM Sans", monospace', letterSpacing: 2 }}>
            SERIE {serial}
          </text>
          <text x={W - 24} y={H - 12} textAnchor="end" fill={yellow} opacity={0.85}
                style={{ font: '500 8.5px "DM Sans", sans-serif', letterSpacing: 1 }}>
            quest.ultimapagina.net
          </text>
        </g>

        <g opacity={0.7}>{grain}</g>
      </g>
    </svg>
  );
}

Object.assign(window, { PostcardBack });
