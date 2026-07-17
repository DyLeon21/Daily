import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PLACES, BOOKS, chapterKey } from '../data/bible.js';
import { BookMarker } from './BookMarker.jsx';

// Kartenbild: liegt in /public/map.png — nach dem Generieren dort ablegen.
// Solange keins existiert, zeigt die Komponente einen Platzhalter-Hintergrund.
const MAP_SRC = import.meta.env.BASE_URL + 'map.png';

// Natürliche Bildgröße wird nach Laden ausgelesen; Fallback fürs Platzhalter-Layout:
const FALLBACK_W = 1600;
const FALLBACK_H = 1000;

export default function WorldMap({ readChapters, onSelectBook }) {
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: FALLBACK_W, h: FALLBACK_H, loaded: false, failed: false });
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.6 });
  const pointers = useRef(new Map());
  const gestureStart = useRef(null);

  // Bildgröße ermitteln
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight, loaded: true, failed: false });
    img.onerror = () => setImgSize(s => ({ ...s, failed: true }));
    img.src = MAP_SRC;
  }, []);

  // Startansicht: Karte mittig einpassen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth: cw, clientHeight: ch } = el;
    const scale = Math.max(cw / imgSize.w, ch / imgSize.h) * 0.9;
    setView({
      x: (cw - imgSize.w * scale) / 2,
      y: (ch - imgSize.h * scale) / 2,
      scale,
    });
  }, [imgSize.w, imgSize.h]);

  const clampScale = (s) => Math.min(3, Math.max(0.25, s));

  // ---- Pointer-Gesten: 1 Finger = Pan, 2 Finger = Pinch-Zoom ----
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gestureStart.current = { mode: 'pan', px: pts[0].x, py: pts[0].y, view: { ...view } };
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      gestureStart.current = { mode: 'pinch', dist, cx, cy, view: { ...view } };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureStart.current;
    if (!g) return;
    const pts = [...pointers.current.values()];

    if (g.mode === 'pan' && pts.length === 1) {
      const dx = pts[0].x - g.px;
      const dy = pts[0].y - g.py;
      setView({ ...g.view, x: g.view.x + dx, y: g.view.y + dy });
    } else if (g.mode === 'pinch' && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = dist / g.dist;
      const newScale = clampScale(g.view.scale * factor);
      const realFactor = newScale / g.view.scale;
      // Zoom um den Pinch-Mittelpunkt
      const nx = g.cx - (g.cx - g.view.x) * realFactor;
      const ny = g.cy - (g.cy - g.view.y) * realFactor;
      setView({ x: nx, y: ny, scale: newScale });
    }
  };

  const endPointer = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gestureStart.current = null;
    else if (pointers.current.size === 1) {
      const pts = [...pointers.current.values()];
      gestureStart.current = { mode: 'pan', px: pts[0].x, py: pts[0].y, view: { ...view } };
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setView(v => {
      const newScale = clampScale(v.scale * factor);
      const realFactor = newScale / v.scale;
      return {
        x: mx - (mx - v.x) * realFactor,
        y: my - (my - v.y) * realFactor,
        scale: newScale,
      };
    });
  };

  const zoomBtn = useCallback((dir) => {
    const el = containerRef.current;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    setView(v => {
      const newScale = clampScale(v.scale * (dir > 0 ? 1.25 : 0.8));
      const f = newScale / v.scale;
      return { x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f, scale: newScale };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={s.container}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onWheel={onWheel}
    >
      <div
        style={{
          ...s.mapLayer,
          width: imgSize.w,
          height: imgSize.h,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {imgSize.failed ? (
          <div style={s.placeholder}>
            <div className="pixel-title" style={{ fontSize: 22, marginBottom: 12 }}>Kartenbild fehlt</div>
            <div style={{ maxWidth: 420, lineHeight: 1.5 }}>
              Lege dein generiertes Pixelart-Kartenbild als <b>public/map.png</b> ins Projekt.
              Der Bild-Prompt steht im README.
            </div>
          </div>
        ) : (
          <img src={MAP_SRC} alt="Historische Karte" style={s.mapImg} draggable={false} />
        )}

        {/* Ortsmarker */}
        {PLACES.map(place => (
          <div
            key={place.id}
            style={{
              ...s.placeMarker,
              left: `${place.xPct}%`,
              top: `${place.yPct}%`,
            }}
          >
            <div style={{
              ...s.placeDot,
              width: place.type === 'capital' ? 14 : 10,
              height: place.type === 'capital' ? 14 : 10,
              borderWidth: place.type === 'capital' ? 3 : 2,
            }} />
            <div className="pixel-title" style={s.placeName}>{place.name}</div>
          </div>
        ))}

        {/* Bibelbuch-Marker */}
        {Object.entries(BOOKS).map(([bookId, book]) => {
          const place = PLACES.find(p => p.id === book.placeId);
          if (!place) return null;
          const read = Object.keys(readChapters).filter(k => k.startsWith(bookId + ':')).length;
          return (
            <BookMarker
              key={bookId}
              book={book}
              read={read}
              style={{ left: `${place.xPct + 3}%`, top: `${place.yPct - 6}%` }}
              onClick={() => onSelectBook(bookId)}
            />
          );
        })}
      </div>

      <div style={s.zoomControls}>
        <button className="wood-panel" style={s.zoomBtn} onClick={() => zoomBtn(1)} aria-label="Hineinzoomen">+</button>
        <button className="wood-panel" style={s.zoomBtn} onClick={() => zoomBtn(-1)} aria-label="Herauszoomen">−</button>
      </div>
    </div>
  );
}

const s = {
  container: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
    background: '#3f7fae',
    touchAction: 'none',
    cursor: 'grab',
  },
  mapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: '0 0',
  },
  mapImg: {
    width: '100%',
    height: '100%',
    display: 'block',
    imageRendering: 'pixelated',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'repeating-linear-gradient(45deg, #d9b56e, #d9b56e 40px, #d1ab60 40px, #d1ab60 80px)',
    color: '#2a1c12',
    textAlign: 'center',
    padding: 40,
  },
  placeMarker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  placeDot: {
    borderRadius: '50%',
    background: '#2a1c12',
    border: 'solid #efe0b8',
  },
  placeName: {
    marginTop: 4,
    fontSize: 13,
    color: '#2a1c12',
    textShadow: '1px 1px 0 #efe0b8, -1px -1px 0 #efe0b8, 1px -1px 0 #efe0b8, -1px 1px 0 #efe0b8',
    whiteSpace: 'nowrap',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 18,
    right: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 5,
  },
  zoomBtn: {
    width: 46,
    height: 46,
    fontSize: 24,
    fontWeight: 700,
    color: '#efe0b8',
  },
};
