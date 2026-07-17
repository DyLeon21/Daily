import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PLACES, BOOKS, chapterKey } from '../data/bible.js';
import { BookMarker } from './BookMarker.jsx';

// Kartenbild: liegt in /public/map.png — nach dem Generieren dort ablegen.
const MAP_SRC = import.meta.env.BASE_URL + 'map.png';

const FALLBACK_W = 1600;
const FALLBACK_H = 1000;

// Reibung für den Schwung-Effekt nach dem Loslassen (näher an 1 = längeres Gleiten)
const FRICTION = 0.94;
const MIN_VELOCITY = 0.02;
// Wie viel weiter als die Mindest-Zoomstufe man maximal reinzoomen kann
const MAX_ZOOM_FACTOR = 3.2;

export default function WorldMap({ readChapters, onSelectBook }) {
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: FALLBACK_W, h: FALLBACK_H, loaded: false, failed: false });
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.6 });

  const viewRef = useRef(view);
  const containerSize = useRef({ w: 0, h: 0 });
  const pointers = useRef(new Map());
  const gestureStart = useRef(null);
  const rafId = useRef(null);
  const velocity = useRef({ vx: 0, vy: 0 });
  const lastSample = useRef(null);
  const inertiaId = useRef(null);

  // Bildgröße ermitteln
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight, loaded: true, failed: false });
    img.onerror = () => setImgSize(s => ({ ...s, failed: true }));
    img.src = MAP_SRC;
  }, []);

  // Containergröße laufend beobachten (für Zoom-/Pan-Grenzen)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      containerSize.current = { w: el.clientWidth, h: el.clientHeight };
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- Grenzen-Logik: Karte darf nie kleiner als der Bildschirm wirken,
  //      und man darf nie über den Kartenrand hinausziehen ----
  const getMinScale = () => {
    const { w: cw, h: ch } = containerSize.current;
    if (!cw || !ch) return 0.1;
    return Math.max(cw / imgSize.w, ch / imgSize.h);
  };

  const clampScale = (s) => {
    const min = getMinScale();
    return Math.min(min * MAX_ZOOM_FACTOR, Math.max(min, s));
  };

  const clampPos = (x, y, scale) => {
    const { w: cw, h: ch } = containerSize.current;
    const imgW = imgSize.w * scale;
    const imgH = imgSize.h * scale;
    // gültiger Bereich: linke/obere Kante darf nicht rechts/unter den Container rutschen,
    // rechte/untere Kante darf nicht links/über den Container rutschen
    const minX = Math.min(0, cw - imgW);
    const maxX = 0;
    const minY = Math.min(0, ch - imgH);
    const maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const clampView = (v) => {
    const scale = clampScale(v.scale);
    const { x, y } = clampPos(v.x, v.y, scale);
    return { x, y, scale };
  };

  // Startansicht: Karte füllt den Bildschirm komplett, mittig zentriert
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    containerSize.current = { w: cw, h: ch };
    const scale = Math.max(cw / imgSize.w, ch / imgSize.h);
    const next = {
      x: (cw - imgSize.w * scale) / 2,
      y: (ch - imgSize.h * scale) / 2,
      scale,
    };
    viewRef.current = next;
    setView(next);
  }, [imgSize.w, imgSize.h]);

  const applyTransform = (v) => {
    if (!layerRef.current) return;
    layerRef.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.scale})`;
  };

  const stopInertia = () => {
    if (inertiaId.current) {
      cancelAnimationFrame(inertiaId.current);
      inertiaId.current = null;
    }
  };

  const onPointerDown = (e) => {
    stopInertia();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gestureStart.current = { mode: 'pan', px: pts[0].x, py: pts[0].y, view: { ...viewRef.current } };
      lastSample.current = { x: pts[0].x, y: pts[0].y, t: performance.now() };
      velocity.current = { vx: 0, vy: 0 };
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      gestureStart.current = { mode: 'pinch', dist, cx, cy, view: { ...viewRef.current } };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureStart.current;
    if (!g) return;
    const pts = [...pointers.current.values()];

    let next = null;

    if (g.mode === 'pan' && pts.length === 1) {
      const dx = pts[0].x - g.px;
      const dy = pts[0].y - g.py;
      const raw = { ...g.view, x: g.view.x + dx, y: g.view.y + dy };
      const clamped = clampPos(raw.x, raw.y, raw.scale);
      next = { ...raw, ...clamped };

      const now = performance.now();
      if (lastSample.current) {
        const dt = now - lastSample.current.t;
        if (dt > 0) {
          velocity.current = {
            vx: (pts[0].x - lastSample.current.x) / dt,
            vy: (pts[0].y - lastSample.current.y) / dt,
          };
        }
      }
      lastSample.current = { x: pts[0].x, y: pts[0].y, t: now };
    } else if (g.mode === 'pinch' && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = dist / g.dist;
      const newScale = clampScale(g.view.scale * factor);
      const realFactor = newScale / g.view.scale;
      const nx = g.cx - (g.cx - g.view.x) * realFactor;
      const ny = g.cy - (g.cy - g.view.y) * realFactor;
      const clamped = clampPos(nx, ny, newScale);
      next = { scale: newScale, ...clamped };
    }

    if (next) {
      viewRef.current = next;
      if (rafId.current == null) {
        rafId.current = requestAnimationFrame(() => {
          applyTransform(viewRef.current);
          rafId.current = null;
        });
      }
    }
  };

  const runInertia = () => {
    const step = () => {
      const v = velocity.current;
      const speed = Math.hypot(v.vx, v.vy);
      if (speed < MIN_VELOCITY) {
        inertiaId.current = null;
        setView(viewRef.current);
        return;
      }
      const rawX = viewRef.current.x + v.vx * 16;
      const rawY = viewRef.current.y + v.vy * 16;
      const clamped = clampPos(rawX, rawY, viewRef.current.scale);
      // An der Kante angekommen? Dann Schwung in die jeweilige Richtung sofort stoppen
      // statt gegen die unsichtbare Wand weiterzudrücken.
      const hitX = clamped.x !== rawX;
      const hitY = clamped.y !== rawY;
      const next = { ...viewRef.current, x: clamped.x, y: clamped.y };
      viewRef.current = next;
      applyTransform(next);
      velocity.current = {
        vx: hitX ? 0 : v.vx * FRICTION,
        vy: hitY ? 0 : v.vy * FRICTION,
      };
      if (hitX && hitY) {
        inertiaId.current = null;
        setView(viewRef.current);
        return;
      }
      inertiaId.current = requestAnimationFrame(step);
    };
    inertiaId.current = requestAnimationFrame(step);
  };

  const endPointer = (e) => {
    const wasPan = gestureStart.current?.mode === 'pan';
    pointers.current.delete(e.pointerId);

    if (pointers.current.size === 0) {
      gestureStart.current = null;
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      const speed = Math.hypot(velocity.current.vx, velocity.current.vy);
      if (wasPan && speed > MIN_VELOCITY) {
        runInertia();
      } else {
        setView(viewRef.current);
      }
    } else if (pointers.current.size === 1) {
      const pts = [...pointers.current.values()];
      gestureStart.current = { mode: 'pan', px: pts[0].x, py: pts[0].y, view: { ...viewRef.current } };
      lastSample.current = { x: pts[0].x, y: pts[0].y, t: performance.now() };
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    stopInertia();
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const v = viewRef.current;
    const newScale = clampScale(v.scale * factor);
    const realFactor = newScale / v.scale;
    const nx = mx - (mx - v.x) * realFactor;
    const ny = my - (my - v.y) * realFactor;
    const clamped = clampPos(nx, ny, newScale);
    const next = { scale: newScale, ...clamped };
    viewRef.current = next;
    applyTransform(next);
    setView(next);
  };

  const zoomBtn = useCallback((dir) => {
    stopInertia();
    const el = containerRef.current;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    const v = viewRef.current;
    const newScale = clampScale(v.scale * (dir > 0 ? 1.25 : 0.8));
    const f = newScale / v.scale;
    const nx = cx - (cx - v.x) * f;
    const ny = cy - (cy - v.y) * f;
    const clamped = clampPos(nx, ny, newScale);
    const next = { scale: newScale, ...clamped };
    viewRef.current = next;
    if (layerRef.current) {
      layerRef.current.style.transition = 'transform 0.22s ease-out';
      applyTransform(next);
      window.setTimeout(() => {
        if (layerRef.current) layerRef.current.style.transition = '';
      }, 230);
    }
    setView(next);
  }, []);

  useEffect(() => () => {
    stopInertia();
    if (rafId.current) cancelAnimationFrame(rafId.current);
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
        ref={layerRef}
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
    willChange: 'transform',
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
