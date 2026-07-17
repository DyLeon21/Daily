import React from 'react';
import { chapterKey } from '../data/bible.js';

// Kapitel-Reise nach dem Referenzbild:
// Pergament-Bahn mit Wüsten-Silhouette im Hintergrund,
// START-Fahne links, Kapitel-Punkte auf gestrichelter Linie,
// Wanderer-Figur auf dem aktuellen Kapitel, Thron als ZIEL rechts.

export default function BookJourney({ bookId, book, readChapters, onBack, onToggleChapter }) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const readCount = chapters.filter(c => readChapters[chapterKey(bookId, c)]).length;
  const done = readCount === book.chapters;
  // Wanderer steht auf dem ersten ungelesenen Kapitel (oder dem letzten, wenn fertig)
  const walkerChapter = done ? book.chapters : (chapters.find(c => !readChapters[chapterKey(bookId, c)]) ?? 1);

  return (
    <div style={s.screen}>
      <div className="wood-panel" style={s.headerBar}>
        <button onClick={onBack} style={s.backBtn} aria-label="Zurück zur Karte">←</button>
        <Walker size={30} />
        <div className="pixel-title" style={s.headerTitle}>Reise durch {book.name}</div>
      </div>

      <div style={s.meta}>
        <span>{book.placeNote}</span>
        <span style={{ fontWeight: 700 }}>{readCount}/{book.chapters} Kapitel</span>
      </div>

      <div className="parchment-panel torn" style={s.journeyPanel}>
        {/* Wüsten-Silhouette als Hintergrund-Deko */}
        <DesertBackdrop />

        <div style={s.journeyRow}>
          {/* START-Fahne */}
          <div style={s.endpoint}>
            <Flag />
            <div className="pixel-title" style={s.endpointLabel}>Start</div>
          </div>

          {/* Kapitel-Spur — horizontal scrollbar bei vielen Kapiteln */}
          <div style={s.trackScroll}>
            <div style={{ ...s.track, width: Math.max(chapters.length * 58, 200) }}>
              <div style={s.dashLine} />
              {chapters.map((c, i) => {
                const isRead = !!readChapters[chapterKey(bookId, c)];
                const isWalker = c === walkerChapter;
                return (
                  <div key={c} style={{ ...s.nodeWrap, left: i * 58 + 29 }}>
                    {isWalker && !done && (
                      <div style={s.walkerPos}><Walker size={34} /></div>
                    )}
                    <button
                      onClick={() => onToggleChapter(bookId, c, !isRead)}
                      style={{
                        ...s.node,
                        background: isRead
                          ? 'radial-gradient(circle at 35% 30%, #6fae5f, #4e8c4a 70%)'
                          : 'radial-gradient(circle at 35% 30%, #b0a58c, #8a7d64 70%)',
                        borderColor: isRead ? '#2c5526' : '#5c523e',
                        boxShadow: isWalker && !isRead
                          ? '0 0 0 4px rgba(224,164,88,0.55), 0 2px 3px rgba(0,0,0,0.3)'
                          : '0 2px 3px rgba(0,0,0,0.3)',
                      }}
                      aria-label={`Kapitel ${c} ${isRead ? 'als ungelesen markieren' : 'als gelesen markieren'}`}
                    >
                      {isRead ? '✓' : ''}
                    </button>
                    <div className="pixel-title" style={s.nodeLabel}>Kap. {c}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ZIEL-Thron */}
          <div style={{ ...s.endpoint, filter: done ? 'drop-shadow(0 0 10px #ffd684)' : 'none' }}>
            <Throne glowing={done} />
            <div className="pixel-title" style={s.endpointLabel}>Ziel</div>
          </div>
        </div>
      </div>

      {done && (
        <div className="parchment-panel" style={s.doneBanner}>
          <span style={{ fontSize: 22 }}>🏅</span>
          <span className="pixel-title" style={{ fontSize: 14 }}>
            {book.name} vollständig gelesen — Auszeichnung freigeschaltet!
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Deko-Elemente (SVG) ---------- */

function DesertBackdrop() {
  return (
    <svg viewBox="0 0 800 120" preserveAspectRatio="none" style={s.backdrop} aria-hidden="true">
      {/* ferne Berge */}
      <path d="M0,100 L80,60 L150,95 L230,45 L320,100 L410,55 L500,95 L580,65 L660,100 L740,70 L800,95 L800,120 L0,120 Z"
        fill="#c2a468" opacity="0.55" />
      {/* nahe Dünen */}
      <path d="M0,110 Q120,85 260,108 Q420,88 560,110 Q680,92 800,108 L800,120 L0,120 Z"
        fill="#b3945a" opacity="0.5" />
      {/* Palmen (klein, angedeutet) */}
      <g stroke="#6b7a3a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M130,105 L130,88 M130,88 Q120,84 116,76 M130,88 Q140,84 144,76 M130,88 Q126,80 122,74 M130,88 Q134,80 138,74" />
        <path d="M620,102 L620,86 M620,86 Q610,82 606,74 M620,86 Q630,82 634,74" />
      </g>
      {/* Stadt-Silhouette rechts (Ziel-Nähe) */}
      <g fill="#a08050" opacity="0.6">
        <rect x="700" y="70" width="16" height="35" />
        <rect x="720" y="58" width="20" height="47" />
        <rect x="744" y="66" width="14" height="39" />
        <path d="M720,58 L730,46 L740,58 Z" />
      </g>
    </svg>
  );
}

function Flag() {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden="true">
      <line x1="10" y1="4" x2="10" y2="48" stroke="#5c4630" strokeWidth="4" strokeLinecap="round" />
      <path d="M12,6 L34,10 L12,20 Z" fill="#4a6a9c" stroke="#2a3a56" strokeWidth="1.5" />
    </svg>
  );
}

function Throne({ glowing }) {
  return (
    <svg width="46" height="56" viewBox="0 0 46 56" aria-hidden="true">
      <rect x="8" y="6" width="30" height="40" rx="4" fill={glowing ? '#e0a458' : '#a87838'} stroke="#5c3a10" strokeWidth="2.5" />
      <rect x="13" y="12" width="20" height="22" rx="3" fill="#8a4a2a" stroke="#5c3a10" strokeWidth="1.5" />
      <rect x="4" y="42" width="38" height="8" rx="2" fill={glowing ? '#e0a458' : '#a87838'} stroke="#5c3a10" strokeWidth="2" />
      <circle cx="10" cy="8" r="3" fill="#ffd684" stroke="#5c3a10" strokeWidth="1.5" />
      <circle cx="36" cy="8" r="3" fill="#ffd684" stroke="#5c3a10" strokeWidth="1.5" />
    </svg>
  );
}

function Walker({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* Kopf */}
      <circle cx="22" cy="9" r="6" fill="#e8c39e" stroke="#3d2b1f" strokeWidth="1.5" />
      {/* Haar/Bart angedeutet */}
      <path d="M16,7 Q22,2 28,7 M18,13 Q22,16 26,13" stroke="#4a3320" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Gewand */}
      <path d="M15,17 L29,17 L31,34 L13,34 Z" fill="#3a5a8c" stroke="#22304a" strokeWidth="1.5" />
      {/* Gürtel */}
      <line x1="14" y1="26" x2="30" y2="26" stroke="#8a6a3a" strokeWidth="2.5" />
      {/* Beine im Schritt */}
      <path d="M18,34 L14,45 M26,34 L31,44" stroke="#3d2b1f" strokeWidth="4" strokeLinecap="round" />
      {/* Wanderstab */}
      <line x1="36" y1="12" x2="36" y2="45" stroke="#7a5c3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M29,20 L36,17" stroke="#e8c39e" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const s = {
  screen: {
    flex: 1,
    overflowY: 'auto',
    padding: 14,
    background: 'linear-gradient(180deg, #ecd9a8 0%, #dfc38a 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    touchAction: 'pan-y',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#efe0b8',
    fontSize: 24,
    padding: '0 4px',
  },
  headerTitle: { fontSize: 16, flex: 1 },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#5c4630',
    padding: '0 4px',
    gap: 10,
    flexWrap: 'wrap',
  },
  journeyPanel: {
    padding: '30px 12px 20px',
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  journeyRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
    minHeight: 130,
  },
  endpoint: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 18,
  },
  endpointLabel: { fontSize: 11, color: '#3d2b1f' },
  trackScroll: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
    minWidth: 0,
    WebkitOverflowScrolling: 'touch',
  },
  track: {
    position: 'relative',
    height: 120,
  },
  dashLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 74,
    borderTop: '3px dashed #6b5a3e',
    opacity: 0.7,
  },
  nodeWrap: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 54,
  },
  walkerPos: {
    position: 'absolute',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  node: {
    marginTop: 62,
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '3px solid',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  nodeLabel: {
    marginTop: 5,
    fontSize: 10,
    color: '#3d2b1f',
    whiteSpace: 'nowrap',
  },
  doneBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '14px 16px',
    color: '#5c3a10',
  },
};
