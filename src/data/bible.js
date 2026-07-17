// ============================================================
// ORTE — Koordinaten in PROZENT relativ zum Kartenbild.
// Nach dem Generieren deines Kartenbilds musst du diese Werte
// einmal kalibrieren (siehe README, "Koordinaten kalibrieren").
// Die Werte hier passen ungefähr auf einen Bildausschnitt wie
// dein Referenzbild (Rom oben links, Babylon rechts, Ägypten unten links).
// ============================================================

export const PLACES = [
  { id: 'rom',        name: 'Rom',        xPct: 10.4, yPct: 18.6, type: 'capital' },
  { id: 'ephesus',    name: 'Ephesus',    xPct: 46.0, yPct: 24.6, type: 'city' },
  { id: 'antiochia',  name: 'Antiochia',  xPct: 56.1, yPct: 30.4, type: 'city' },
  { id: 'ninive',     name: 'Ninive',     xPct: 66.1, yPct: 27.3, type: 'city' },
  { id: 'babylon',    name: 'Babylon',    xPct: 80.1, yPct: 52.4, type: 'capital' },
  { id: 'samaria',    name: 'Samaria',    xPct: 52.5, yPct: 42.0, type: 'city' },
  { id: 'jerusalem',  name: 'Jerusalem',  xPct: 52.9, yPct: 50.3, type: 'capital' },
  { id: 'memphis',    name: 'Memphis',    xPct: 14.0, yPct: 67.6, type: 'capital' },
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
