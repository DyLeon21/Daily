# Bibelreise 🗺️

Eine spielerische Tracking-App fürs tägliche Bibellesen: Bibelbücher liegen als
Icons auf einer historischen Pixelart-Karte an dem Ort, wo sie verfasst wurden.
Jedes Kapitel ist ein Schritt auf der Reise durch das Buch.

## Schnellstart

```bash
npm install
npm run dev        # lokaler Entwicklungsserver
npm run build      # Produktions-Build (dist/)
```

## 1. Kartenbild generieren und einfügen

Die App erwartet dein Kartenbild unter **`public/map.png`**.
Solange keins da ist, zeigt sie einen Platzhalter mit Hinweis.

### Bild-Prompt (für Midjourney, DALL-E, o.ä.)

> Pixel art fantasy map of the ancient biblical world, top-down view, warm sand
> and parchment color palette. Geographic area: Italy and Rome in the upper left,
> Greece and the Aegean islands, Asia Minor, the Levant coast with Israel and
> Judea in the center, Mesopotamia and Babylon on the right, Egypt with the Nile
> river and pyramids in the lower left, Sinai peninsula, Red Sea, Mediterranean
> Sea in rich blue. Detailed isometric pixel art terrain: desert dunes, small
> palm trees, mountain ranges, tiny isometric buildings and ziggurats, sailing
> ships on the sea, a decorative compass rose. Warm golden lighting, aged
> parchment texture. IMPORTANT: no text, no labels, no city names — terrain and
> landscape only. 16:10 landscape format, high resolution.

**Wichtig:** "no text, no labels" — die Ortsnamen legt die App selbst als
klickbare Marker über das Bild.

Bild als `map.png` in den Ordner `public/` legen. Fertig.

## 2. Orts-Koordinaten kalibrieren

Die Marker-Positionen stehen in **`src/data/bible.js`** als Prozentwerte
(`xPct`, `yPct`) relativ zum Bild. Da jedes generierte Bild anders ausfällt,
musst du sie einmal anpassen:

1. `npm run dev` starten, Karte öffnen
2. Schauen, wo z.B. Babylon auf deinem Bild liegt
3. In `bible.js` die `xPct`/`yPct`-Werte anpassen (0 = links/oben, 100 = rechts/unten)
4. Speichern — der Dev-Server lädt automatisch neu

Tipp: Browser-Devtools öffnen und mit dem Element-Inspektor die Marker greifen,
dann sieht man schnell, wie weit sie daneben liegen.

## 3. Neues Bibelbuch hinzufügen

In `src/data/bible.js`:

```js
export const BOOKS = {
  daniel: { ... },
  // Neu z.B.:
  offenbarung: {
    name: 'Offenbarung',
    chapters: 22,
    placeId: 'patmos',       // muss in PLACES existieren
    icon: 'default',         // eigenes Icon: BookGlyph in BookMarker.jsx erweitern
    placeNote: 'Empfangen und niedergeschrieben auf der Insel Patmos.',
  },
};
```

Falls der Ort noch nicht existiert, in `PLACES` ergänzen (mit Prozent-Koordinaten).

## 4. Auf GitHub Pages veröffentlichen

```bash
# einmalig: Repo auf GitHub anlegen, dann
git init
git add .
git commit -m "Bibelreise App"
git remote add origin https://github.com/DEIN-NAME/bibelreise.git
git push -u origin main

# deployen:
npm run deploy
```

Danach in den GitHub-Repo-Einstellungen unter **Pages** die Branch `gh-pages`
auswählen (macht `npm run deploy` meist automatisch). Die App ist dann unter
`https://DEIN-NAME.github.io/bibelreise/` erreichbar.

## 5. Aufs Handy "installieren"

Die Seite im Handy-Browser öffnen → Teilen-Menü → **"Zum Home-Bildschirm"**
(iOS Safari) bzw. **"App installieren"** (Android Chrome). Die App läuft dann
im Vollbild wie eine native App. Der Fortschritt wird lokal auf dem Gerät
gespeichert (localStorage).

> Hinweis: localStorage ist an den Browser gebunden. Wenn du die Seite in einem
> anderen Browser öffnest, fängt der Fortschritt dort bei null an.

## Projektstruktur

```
src/
  App.jsx                 — Navigation, Fortschritts-State, Streak
  styles.css              — Farbwelt & Pergament/Holz-Panels
  data/
    bible.js              — Orte (PLACES) und Bücher (BOOKS)
    progress.js           — localStorage-Persistenz, Streak-Logik
  components/
    WorldMap.jsx          — Karte mit Pan/Zoom (Touch, Pinch, Maus)
    BookMarker.jsx        — klickbares Buch-Medaillon mit Fortschrittsring
    BookJourney.jsx       — Kapitel-Reise (Start → Wanderer → Thron)
public/
  map.png                 — DEIN generiertes Kartenbild (muss ergänzt werden)
```
