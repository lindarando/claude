// No-stub variant of the front card: full-width illustration, no tallone.
// QR, serial, and date live on the back only.
function NightCardChimeraNoStub({
  W = 700, H = 505,
  chimera = 'assets/chimera-3.png',
  ringStyle = 'dotted-orbit',
  mottoText = 'HIC · SUNT · LIBRI · HIC · FUI · AD · MERIDIEM · ',
  cardNumber = '02 / 03',
  daySide = 'MERIDIES · AD MERIDIEM',
  latinDay = 'Dies Secundus',
  dayLabel = 'MERIDIES',
  bottomInfo = 'SABATO 16 MAGGIO 2026 · SALONE DEL LIBRO · TORINO',
  creatureLatin = 'Gryphus Lector',
  creatureIt = 'Lettorǝ meridianǝ',
  constellation = 'meridies',
}) {
  const CONSTELLATIONS = {
    aurora: [
      [-165, -100], [-115, -125], [-60, -140], [0, -150],
      [60, -148], [115, -135], [160, -115],
    ],
    meridies: [
      [-155, -95], [-105, -130], [-50, -150], [10, -155],
      [70, -150], [125, -130], [165, -100],
    ],
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
  const cream  = '#FAF7F2';
  const teal   = '#3BA5C4';

  let s = 2026;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const stars = [];
  for (let i = 0; i < 140; i++) {
    const x = rand() * W, y = rand() * H;
    const r = rand() * 1.1 + 0.2;
    const b = rand();
    stars.push(<circle key={i} cx={x} cy={y} r={r}
      fill={b > 0.92 ? yellow : cream} opacity={b * 0.8 + 0.2} />);
  }
  const grain = [];
  for (let i = 0; i < 700; i++) {
    grain.push(<circle key={i} cx={rand() * W} cy={rand() * H} r={rand() * 0.5 + 0.15}
      fill={i % 2 ? cream : teal} opacity={rand() * 0.14 + 0.04} />);
  }

  const uid = (ringStyle + cardNumber).replace(/\W/g,'');

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
    return (
      <g>
        <circle cx={0} cy={0} r={92} fill="none" stroke={yellow} strokeWidth={1.2} opacity={0.9} />
        <circle cx={0} cy={0} r={104} fill="none" stroke={cream} strokeWidth={0.5} opacity={0.35} strokeDasharray="1 3" />
        <circle cx={0} cy={0} r={118} fill="none" stroke={cream} strokeWidth={0.5} opacity={0.22} strokeDasharray="1 4" />
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
        <clipPath id={`clipN-${uid}`}><rect width={W} height={H} rx={6} ry={6} /></clipPath>
        <radialGradient id={`skyN-${uid}`} cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={bgMid} />
          <stop offset="55%" stopColor={bgNavy} />
          <stop offset="100%" stopColor={bgDeep} />
        </radialGradient>
        <radialGradient id={`sunN-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={yellow} stopOpacity="0.9" />
          <stop offset="50%" stopColor={red} stopOpacity="0.5" />
          <stop offset="100%" stopColor={red} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`discN-${uid}`}>
          <circle cx={0} cy={0} r={90} />
        </clipPath>
        <filter id={`glowN-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g clipPath={`url(#clipN-${uid})`}>
        <rect x={0} y={0} width={W} height={H} fill={`url(#skyN-${uid})`} />
        <ellipse cx={W * 0.5} cy={H * 0.56} rx={290} ry={220} fill={`url(#sunN-${uid})`} opacity={0.8} />
        {stars}

        <g transform={`translate(${W * 0.5} ${H * 0.48})`}>
          <circle cx={0} cy={0} r={92} fill={cream} />
          <g clipPath={`url(#discN-${uid})`}>
            <image href={chimera} x={-76} y={-76} width={152} height={152} preserveAspectRatio="xMidYMid meet" />
          </g>

          <Ring />

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
                <g key={`p${i}`} filter={`url(#glowN-${uid})`}>
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
                style={{ font: '400 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            ULTIMA PAGINA QUEST · <tspan style={{ fontWeight: 600 }}>Nº {cardNumber}</tspan>
          </text>
          <line x1={24} y1={44} x2={W - 24} y2={44} stroke={cream} strokeWidth={0.3} opacity={0.25} />
          <text x={W - 24} y={34} textAnchor="end" fill={yellow}
                style={{ font: '700 9px "DM Sans", sans-serif', letterSpacing: 3 }}>
            {daySide}
          </text>
        </g>

        {/* title */}
        <g>
          <text x={24} y={H - 102} fill={cream}
                style={{ font: '600 32px Recoleta, serif', letterSpacing: -1 }}>
            Hic sunt
          </text>
          <text x={24} y={H - 54} fill={yellow} fontStyle="italic"
                style={{ font: 'italic 700 54px Recoleta, serif', letterSpacing: -2 }}>
            libri.
          </text>
        </g>

        {/* creature label */}
        <g transform={`translate(${W - 24} ${H - 76})`}>
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

        {/* bottom info */}
        <g transform={`translate(24 ${H - 22})`}>
          {(() => {
            const parts = bottomInfo.split(' · ');
            const first = parts[0] || '';
            const rest = parts.slice(1).join(' · ');
            return (
              <text x={0} y={0} fill={cream} opacity={0.6}
                    style={{ font: '400 9px "DM Sans", sans-serif', letterSpacing: 1.5 }}>
                <tspan style={{ fontWeight: 600 }}>{first}</tspan>
                {rest ? ` · ${rest}` : ''}
              </text>
            );
          })()}
        </g>

        <g opacity={0.8}>{grain}</g>
      </g>
    </svg>
  );
}

Object.assign(window, { NightCardChimeraNoStub });
