// Persistenz über localStorage — funktioniert im Browser und als installierte PWA.

const KEY = 'bibelreise-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* defekter Eintrag → frisch starten */ }
  return { readChapters: {}, log: [] };
}

export function saveProgress(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Speichern fehlgeschlagen', e);
  }
}

function todayStr(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addLogEntry(log, bookId, chapter) {
  return [...log, { date: todayStr(), bookId, chapter, ts: Date.now() }];
}

export function removeLogEntry(log, bookId, chapter) {
  return log.filter(l => !(l.bookId === bookId && l.chapter === chapter));
}

export function computeStreak(log) {
  if (!log.length) return 0;
  const days = [...new Set(log.map(l => l.date))].sort();
  const today = todayStr();
  const yesterday = todayStr(new Date(Date.now() - 86400000));
  let cursor = days.includes(today) ? today : (days.includes(yesterday) ? yesterday : null);
  if (!cursor) return 0;
  let idx = days.indexOf(cursor);
  let streak = 1;
  for (let i = idx; i > 0; i--) {
    const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
