import React, { useState, useCallback, useMemo } from 'react';
import WorldMap from './components/WorldMap.jsx';
import BookJourney from './components/BookJourney.jsx';
import { BOOKS, chapterKey } from './data/bible.js';
import { loadProgress, saveProgress, addLogEntry, removeLogEntry, computeStreak } from './data/progress.js';

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState({ view: 'map' });

  const streak = useMemo(() => computeStreak(progress.log), [progress.log]);

  const toggleChapter = useCallback((bookId, chapter, read) => {
    setProgress(prev => {
      const key = chapterKey(bookId, chapter);
      const readChapters = { ...prev.readChapters };
      let log = prev.log;
      if (read) {
        if (!readChapters[key]) {
          readChapters[key] = true;
          log = addLogEntry(log, bookId, chapter);
        }
      } else {
        delete readChapters[key];
        log = removeLogEntry(log, bookId, chapter);
      }
      const next = { readChapters, log };
      saveProgress(next);
      return next;
    });
  }, []);

  return (
    <div style={s.app}>
      <div className="wood-panel" style={s.topBar}>
        <div className="pixel-title" style={s.topTitle}>Bibelreise</div>
        <div style={s.streak} title="Tage in Folge gelesen">
          🔥 <b>{streak}</b>
        </div>
      </div>

      {screen.view === 'map' && (
        <WorldMap
          readChapters={progress.readChapters}
          onSelectBook={(bookId) => setScreen({ view: 'book', bookId })}
        />
      )}

      {screen.view === 'book' && (
        <BookJourney
          bookId={screen.bookId}
          book={BOOKS[screen.bookId]}
          readChapters={progress.readChapters}
          onBack={() => setScreen({ view: 'map' })}
          onToggleChapter={toggleChapter}
        />
      )}
    </div>
  );
}

const s = {
  app: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#2a1c12',
  },
  topBar: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
  },
  topTitle: { fontSize: 17 },
  streak: { fontSize: 15, color: '#efe0b8' },
};
