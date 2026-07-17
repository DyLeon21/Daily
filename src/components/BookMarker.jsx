import React from 'react';

// Buch-Icon-Marker auf der Karte: Pergament-Medaillon mit Symbol,
// Fortschrittsring, Gold-Zustand bei Abschluss.

export function BookMarker({ book, read, style, onClick }) {
  const done = read === book.chapters;
  const pct = read / book.chapters;
  const R = 26;
  const CIRC = 2 * Math.PI * R;

  return (
    <button
      onClick={onClick}
      style={{ ...s.wrap, ...style }}
      aria-label={`${book.name} öffnen — ${read} von ${book.chapters} Kapiteln gelesen`}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ display: 'block' }}>
        {/* Medaillon */}
        <circle cx="36" cy="36" r="28" fill={done ? '#e0a458' : '#efe0b8'} stroke="#2a1c12" strokeWidth="3.5" />
        {/* Fortschrittsring */}
        {read > 0 && !done && (
          <circle
            cx="36" cy="36" r={R}
            fill="none" stroke="#4e8c4a" strokeWidth="5"
            strokeDasharray={`${pct * CIRC} ${CIRC}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
        )}
        {done && <circle cx="36" cy="36" r={R} fill="none" stroke="#8a5a1a" strokeWidth="2" />}
        {/* Icon */}
        <g transform="translate(16,14)" fill="none" stroke={done ? '#5c3a10' : '#6b4a24'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <BookGlyph name={book.icon} />
        </g>
      </svg>
      <div className="pixel-title" style={s.label}>
        {book.name}{done ? ' ✓' : ''}
      </div>
    </button>
  );
}

function BookGlyph({ name }) {
  switch (name) {
    case 'lion':
      return (
        <>
          <circle cx="20" cy="19" r="9" />
          <path d="M11 13 Q6 11 6 6 M29 13 Q34 11 34 6 M11 25 Q6 27 6 32 M29 25 Q34 27 34 32" />
        </>
      );
    default:
      return (
        <>
          <rect x="8" y="4" width="24" height="34" rx="2" />
          <path d="M14 12 L26 12 M14 18 L26 18 M14 24 L26 24" />
        </>
      );
  }
}

const s = {
  wrap: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 0,
    filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))',
  },
  label: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: 700,
    color: '#2a1c12',
    textShadow: '1px 1px 0 #efe0b8, -1px -1px 0 #efe0b8, 1px -1px 0 #efe0b8, -1px 1px 0 #efe0b8',
    whiteSpace: 'nowrap',
  },
};
