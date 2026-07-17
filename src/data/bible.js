// ============================================================
// ORTE — Koordinaten in PROZENT relativ zum Kartenbild.
// Nach dem Generieren deines Kartenbilds musst du diese Werte
// einmal kalibrieren (siehe README, "Koordinaten kalibrieren").
// Die Werte hier passen ungefähr auf einen Bildausschnitt wie
// dein Referenzbild (Rom oben links, Babylon rechts, Ägypten unten links).
// ============================================================

export const PLACES = [
  { id: 'rom',        name: 'Rom',        xPct: 9,  yPct: 17, type: 'capital' },
  { id: 'korinth',    name: 'Korinth',    xPct: 30, yPct: 30, type: 'city' },
  { id: 'ephesus',    name: 'Ephesus',    xPct: 46, yPct: 24, type: 'city' },
  { id: 'patmos',     name: 'Patmos',     xPct: 43, yPct: 31, type: 'city' },
  { id: 'antiochia',  name: 'Antiochia',  xPct: 59, yPct: 32, type: 'city' },
  { id: 'ninive',     name: 'Ninive',     xPct: 69, yPct: 26, type: 'city' },
  { id: 'babylon',    name: 'Babylon',    xPct: 82, yPct: 52, type: 'capital' },
  { id: 'samaria',    name: 'Samaria',    xPct: 55, yPct: 44, type: 'city' },
  { id: 'jerusalem',  name: 'Jerusalem',  xPct: 54, yPct: 50, type: 'capital' },
  { id: 'memphis',    name: 'Memphis',    xPct: 16, yPct: 66, type: 'capital' },
];

// ============================================================
// BÜCHER — jeweils mit Ort der Niederschrift/Vollendung.
// Start mit Daniel; weitere Bücher einfach ergänzen.
// ============================================================

export const BOOKS = {
  daniel: {
    name: 'Daniel',
    chapters: 12,
    placeId: 'babylon',
    icon: 'lion',
    placeNote: 'Verfasst während des Exils in Babylon.',
  },
};

export function chapterKey(bookId, chapter) {
  return `${bookId}:${chapter}`;
}
