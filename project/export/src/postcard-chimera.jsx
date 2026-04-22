// Night card with REAL chimera image at medallion center.
// chimera-1 = grifone in piedi (statuario)     → venerdì / aurora
// chimera-2 = leone che cammina (calmo)         → domenica / vespro
// chimera-3 = grifone rampante (dinamico)       → sabato / meridies

function NightCardChimera({
  W = 700, H = 440,
  chimera = 'assets/chimera-3.png',
  ringStyle = 'dotted-orbit',  // none | astrolabe | latin-ring | dotted-orbit
  mottoText = 'HIC · SUNT · LIBRI · HIC · FUI · AD · MERIDIEM · ',
  cardNumber = '02 / 03',
  daySide = 'MERIDIES · AD MERIDIEM',
  latinDay = 'Dies Secundus',
  dayLabel = 'MERIDIES',
  serial = '2 · 16.05.26',
  dateBig = '16 · 05 · 2026',
  dateSmall = 'meridies',
  bottomInfo = 'SABATO 16 MAGGIO 2026 · SALONE DEL LIBRO · TORINO',
  creatureLatin = 'Gryphus lector',
  creatureIt = 'il lettore meridiano',
  constellation = 'meridies',
}) {
  // 3 distinct constellations — 7 stars each, ALL placed ABOVE the medallion
  // (negative y, well outside the disc radius of 92). Simple numbered dots.
  const CONSTELLATIONS = {
    // Aurora — arco ascendente da sx verso dx in alto
    aurora: [
      [-165, -100], [-115, -125], [-60, -140], [0, -150],
      [60, -148], [115, -135], [160, -115],
    ],
    // Meridies — corona simmetrica alta
    meridies: [
      [-155, -95], [-105, -130], [-50, -150], [10, -155],
      [70, -150], [125, -130], [165, -100],
    ],
    // Vesper — curva discendente da sx alto a dx meno alto (tramonto)
    vesper: [
      [-165, -140], [-110, -155], [-45, -158], [15, -148],
      [75, -130], [130, -115], [175, -100],
    ],
  };
  const constPoints = CONSTELLATIONS[constellation] || CONSTELLATIONS.meridies;
  const bgDeep = '#020814';
  const bgNavy = '#002740';
  const bgMid  = '#0A2545';
  const red    = '#E8342C';
  const yellow = '#FDC548';
  const teal   = '#3BA5C4';
  const cream  = '#FAF7F2';

  const stubW = 168;
  const bodyW = W - stubW;
  const perfX = bodyW;

  let s = 2026;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const stars = [];
  for (let i = 0; i < 140; i++) {
    const x = rand() * bodyW, y = rand() * H;
    const r = rand() * 1.1 + 0.2;
    const b = rand();
    stars.push(<circle key={i} cx={x} cy={y} r={r}
      fill={b > 0.92 ? yellow : cream} opacity={b * 0.8 + 0.2} />);
  }
  const twinkles = [];
  for (let i = 0; i < 6; i++) {
    const x = rand() * bodyW, y = rand() * H * 0.7;
    twinkles.push(
      <g key={i} opacity={0.85}>
        <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke={yellow} strokeWidth={0.8} />
        <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke={yellow} strokeWidth={0.8} />
      </g>
    );
  }
  const grain = [];
  for (let i = 0; i < 700; i++) {
    grain.push(<circle key={i} cx={rand() * W} cy={rand() * H} r={rand() * 0.5 + 0.15}
      fill={i % 2 ? cream : teal} opacity={rand() * 0.14 + 0.04} />);
  }

  const uid = (ringStyle + serial).replace(/\W/g,'');

  const Ring = () => {
    if (ringStyle === 'none') {
      return <circle cx={0} cy={0} r={92} fill="none" stroke={yellow} strokeWidth={1.2} opacity={0.9} />;
    }
    if (ringStyle === 'astrolabe') {
      return (
        <g>
          <circle cx={0} cy={0} r={92} fill="none" stroke={yellow} strokeWidth={1.2} opacity={0.9} />
          <circle cx={0} cy={0} r={104} fill="none" stroke={cream} strokeWidth={0.4} opacity={0.35} />
          <circle cx={0} cy={0} r={114} fill="none" stroke={cream} strokeWidth={0.4} opacity={0.25} />
          {Array.from({ length: 72 }).map((_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const long = i % 3 === 0;
            const r1 = 104, r2 = long ? 114 : 109;
            return <line key={i}
              x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
              stroke={cream} strokeWidth={long ? 0.7 : 0.35} opacity={long ? 0.55 : 0.3} />;
          })}
          {[[0,-122,'N'],[122,0,'E'],[0,122,'S'],[-122,0,'O']].map(([x,y,t],i)=>(
            <text key={i} x={x} y={y+3} textAnchor="middle" fill={yellow}
                  style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 1 }}>{t}</text>
          ))}
        </g>
      );
    }
    if (ringStyle === 'latin-ring') {
      return (
        <g>
          <circle cx={0} cy={0} r={92} fill="none" stroke={yellow} strokeWidth={1.2} opacity={0.9} />
          <defs>
            <path id={`mp-${uid}`} d="M 0,-108 a 108,108 0 1,1 -0.01,0" />
          </defs>
          <text fill={cream} opacity={0.85}
                style={{ font: '600 10px Recoleta, serif', letterSpacing: 4 }}>
            <textPath href={`#mp-${uid}`} startOffset="0">{mottoText.repeat(2)}</textPath>
          </text>
          <circle cx={0} cy={0} r={122} fill="none" stroke={cream} strokeWidth={0.3} opacity={0.3} />
        </g>
      );
    }
    // dotted-orbit (default)
    return (
      <g>
        <circle cx={0} cy={0} r={92} fill="none" stroke={yellow} strokeWidth={1.2} opacity={0.9} />
        <circle cx={0} cy={0} r={104} fill="none" stroke={cream} strokeWidth={0.5} opacity={0.35}
                strokeDasharray="1 3" />
        <circle cx={0} cy={0} r={118} fill="none" stroke={cream} strokeWidth={0.5} opacity={0.22}
                strokeDasharray="1 4" />
        {[[0,-111],[111,0],[0,111],[-111,0]].map(([x,y],i)=>(
          <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
            <rect x={-2.5} y={-2.5} width={5} height={5} fill={yellow} />
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display:'block' }}>
      <defs>
        <clipPath id={`clip-${uid}`}><rect width={W} height={H} rx={6} ry={6} /></clipPath>
        <radialGradient id={`sky-${uid}`} cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={bgMid} />
          <stop offset="55%" stopColor={bgNavy} />
          <stop offset="100%" stopColor={bgDeep} />
        </radialGradient>
        <radialGradient id={`sun-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={yellow} stopOpacity="0.9" />
          <stop offset="50%" stopColor={red} stopOpacity="0.5" />
          <stop offset="100%" stopColor={red} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`stub-${uid}`} cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor={bgNavy} />
          <stop offset="100%" stopColor={bgDeep} />
        </radialGradient>
        <clipPath id={`disc-${uid}`}>
          <circle cx={0} cy={0} r={90} />
        </clipPath>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <rect x={0} y={0} width={bodyW} height={H} fill={`url(#sky-${uid})`} />
        <ellipse cx={bodyW * 0.56} cy={H * 0.58} rx={260} ry={200} fill={`url(#sun-${uid})`} opacity={0.8} />
        {stars}
        {twinkles}

        <g transform={`translate(${bodyW * 0.56} ${H * 0.55})`}>
          {/* cream disc */}
          <circle cx={0} cy={0} r={92} fill={cream} />
          {/* chimera image, clipped to the disc */}
          <g clipPath={`url(#disc-${uid})`}>
            <image href={chimera} x={-85} y={-85} width={170} height={170} preserveAspectRatio="xMidYMid meet" />
          </g>

          <Ring />

          {/* constellation — 7 stars, different per day */}
          {(() => {
            const pts = constPoints;
            const els = [];
            for (let i = 0; i < pts.length - 1; i++) {
              els.push(
                <line key={`l${i}`}
                      x1={pts[i][0]} y1={pts[i][1]}
                      x2={pts[i+1][0]} y2={pts[i+1][1]}
                      stroke={yellow} strokeWidth={0.6} opacity={0.55} strokeDasharray="2 3" />
              );
            }
            pts.forEach(([x, y], i) => {
              els.push(
                <g key={`p${i}`} filter={`url(#glow-${uid})`}>
                  {/* 4-point sparkle star */}
                  <g transform={`translate(${x} ${y})`}>
                    <path d="M 0,-6 L 1,-1 L 6,0 L 1,1 L 0,6 L -1,1 L -6,0 L -1,-1 Z" fill={yellow} />
                    <circle cx={0} cy={0} r={1.4} fill={cream} />
                  </g>
                  <text x={x + 10} y={y + 4} fill={yellow}
                        style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 0.5 }}>
                    {i + 1}
                  </text>
                </g>
              );
            });
            return els;
          })()}
        </g>

        {/* top */}
        <g>
          <text x={24} y={34} fill={cream} opacity={0.9}
                style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            ULTIMA PAGINA QUEST · Nº {cardNumber}
          </text>
          <line x1={24} y1={44} x2={bodyW - 24} y2={44} stroke={cream} strokeWidth={0.3} opacity={0.25} />
          <text x={bodyW - 24} y={34} textAnchor="end" fill={yellow}
                style={{ font: '700 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            {daySide}
          </text>
        </g>

        {/* title */}
        <g>
          <text x={24} y={H - 96} fill={cream}
                style={{ font: '700 42px Recoleta, serif', letterSpacing: -1.5 }}>
            Hic sunt
          </text>
          <text x={24} y={H - 54} fill={yellow} fontStyle="italic"
                style={{ font: 'italic 700 42px Recoleta, serif', letterSpacing: -1.5 }}>
            libri.
          </text>
        </g>

        {/* creature label */}
        <g transform={`translate(${bodyW - 24} ${H - 76})`}>
          <text x={0} y={0} textAnchor="end" fill={yellow} opacity={0.9}
                style={{ font: '600 8.5px "DM Sans", sans-serif', letterSpacing: 2.5 }}>
            {latinDay.toUpperCase()} · {dayLabel}
          </text>
          <text x={0} y={18} textAnchor="end" fill={cream} fontStyle="italic"
                style={{ font: 'italic 600 16px Recoleta, serif' }}>
            {creatureLatin}
          </text>
          <text x={0} y={34} textAnchor="end" fill={cream} opacity={0.7}
                style={{ font: '500 9.5px "DM Sans", sans-serif' }}>
            {creatureIt}
          </text>
        </g>

        <g transform={`translate(24 ${H - 22})`}>
          <text x={0} y={0} fill={cream} opacity={0.6}
                style={{ font: '500 9px "DM Sans", sans-serif', letterSpacing: 1.5 }}>
            {bottomInfo}
          </text>
        </g>

        {/* perf */}
        {(() => {
          const dots = [];
          for (let i = 0; i < Math.floor(H / 10); i++) {
            dots.push(<circle key={i} cx={perfX} cy={8 + i * 10} r={1.8} fill={bgDeep} />);
          }
          return dots;
        })()}
        <line x1={perfX} y1={0} x2={perfX} y2={H} stroke={cream} strokeWidth={0.3} strokeDasharray="2 3" opacity={0.2} />

        {/* stub */}
        <g transform={`translate(${perfX} 0)`}>
          <rect x={0} y={0} width={stubW} height={H} fill={`url(#stub-${uid})`} />
          <rect x={14} y={14} width={stubW - 28} height={20} fill={yellow} />
          <text x={stubW / 2} y={28} textAnchor="middle" fill={bgNavy}
                style={{ font: '700 10px Recoleta, serif', letterSpacing: 4 }}>
            HIC FUI
          </text>
          <g transform={`translate(26 ${H / 2 + 30}) rotate(-90)`}>
            <text textAnchor="middle" fill={cream} opacity={0.5}
                  style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 5 }}>
              TALLONE · ATTESTATO
            </text>
          </g>
          <g transform={`translate(${stubW / 2 + 10} 130)`}>
            <rect x={-42} y={-42} width={84} height={84} fill={cream} />
            {(() => {
              const cells = [];
              let qs = 42;
              const qr = () => { qs = (qs * 9301 + 49297) % 233280; return qs / 233280; };
              for (let r = 0; r < 17; r++) for (let c = 0; c < 17; c++) {
                if (qr() > 0.48) cells.push(
                  <rect key={`${r}-${c}`} x={-42 + c * 4.94} y={-42 + r * 4.94} width={4.94} height={4.94} fill={bgNavy} />
                );
              }
              return cells;
            })()}
            {[[-42,-42],[20,-42],[-42,20]].map(([x,y],i)=>(
              <g key={i}>
                <rect x={x} y={y} width={22} height={22} fill={cream} />
                <rect x={x+2} y={y+2} width={18} height={18} fill="none" stroke={bgNavy} strokeWidth={2.2} />
                <rect x={x+7} y={y+7} width={8} height={8} fill={bgNavy} />
              </g>
            ))}
          </g>
          <text x={stubW / 2 + 10} y={194} textAnchor="middle" fill={cream}
                style={{ font: '600 9px "DM Sans", sans-serif', letterSpacing: 1.5 }}>
            SCARICA L'ATTESTATO
          </text>
          <text x={stubW / 2 + 10} y={208} textAnchor="middle" fill={yellow} opacity={0.8}
                style={{ font: '500 8px "DM Sans", sans-serif' }}>
            quest.ultimapagina.net
          </text>
          <g transform={`translate(${stubW / 2 + 10} 244)`}>
            <line x1={-44} y1={-8} x2={44} y2={-8} stroke={cream} strokeWidth={0.3} opacity={0.25} />
            <text y={4} textAnchor="middle" fill={cream} opacity={0.5}
                  style={{ font: '500 7px "DM Sans", sans-serif', letterSpacing: 2 }}>
              SERIE
            </text>
            <text y={22} textAnchor="middle" fill={yellow}
                  style={{ font: '700 17px "DM Sans", monospace', letterSpacing: 2 }}>
              {serial}
            </text>
            <line x1={-44} y1={32} x2={44} y2={32} stroke={cream} strokeWidth={0.3} opacity={0.25} />
          </g>
          <g transform={`translate(${stubW / 2 + 10} 302)`}>
            <text y={0} textAnchor="middle" fill={cream} opacity={0.5}
                  style={{ font: '500 7px "DM Sans", sans-serif', letterSpacing: 2 }}>
              VALIDO IL
            </text>
            <text y={22} textAnchor="middle" fill={cream}
                  style={{ font: '700 19px Recoleta, serif', letterSpacing: -0.5 }}>
              {dateBig}
            </text>
            <text y={40} textAnchor="middle" fill={cream} opacity={0.55}
                  style={{ font: 'italic 500 9px Recoleta, serif' }}>
              {dateSmall}
            </text>
          </g>
          <text x={stubW / 2 + 10} y={H - 18} textAnchor="middle" fill={cream} opacity={0.85}
                style={{ font: '700 9px Recoleta, serif', letterSpacing: 3 }}>
            ULTIMA PAGINA
          </text>
        </g>

        <g opacity={0.8}>{grain}</g>
      </g>
    </svg>
  );
}

Object.assign(window, { NightCardChimera });
