# Physik Q1 – Elektrisches Feld (Lernkarten)

Karteikarten, Diagramme und Rechenaufgaben zu allen Punkten der Checkliste:
Influenz, Polarisation, Feldlinienbilder, Spitzeneffekt / Faradayscher Käfig, F = E·Q, Coulomb-Gesetz,
Plattenkondensator (E = U/d, Q = C·U, C = ε₀εᵣA/d), Reihen-/Parallelschaltung, Auf- und Entladung (Differenzialgleichung),
Millikan-Versuch, Messwerttabelle / Mittelwert / Diagramme.

- 91 Karten in 12 Themen, Formeln mit KaTeX (lokal eingebunden, funktioniert offline)
- Lernrunden wie bei Anki: „Wusste ich nicht“ kommt nach 3 Karten wieder, „Teilweise“ ans Ende
- Fortschritt pro Karte wird im Browser gespeichert (kein Account, keine Cloud nötig)
- Dunkelmodus (Standard), Hellmodus per Knopf

## Lokal öffnen

`public/index.html` im Browser öffnen. Das ist eine einzelne Datei, die auch auf dem Handy offline läuft.

## Online stellen (kostenlos)

**GitHub Pages** (fertig vorbereitet): Repo → *Settings → Pages → Source: GitHub Actions*. Danach baut `.github/workflows/pages.yml`
bei jedem Push auf `main` die Seite. Adresse: `https://<benutzer>.github.io/Lernapp/`.

**Cloudflare Pages**: *Workers & Pages → Create → Pages → Connect to Git*, Repo wählen, Build command leer lassen,
Output directory `public`. Oder per Kommandozeile: `npx wrangler pages deploy public --project-name physik-q1`.

## Entwickeln

Quellen: `index.html`, `css/`, `js/` (`cards.js` = alle Karten, `diagrams.js` = Feldlinien-Diagramme).
Mit `node build.mjs` wird daraus `public/index.html` gebaut. Lokal testen: `python3 -m http.server` im Projektordner.
