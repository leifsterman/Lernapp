# Physik Q1 – Elektrisches Feld (Lernkarten)

Karteikarten, Diagramme und Rechenaufgaben zu allen Punkten der Checkliste:
Influenz, Polarisation, Feldlinienbilder, Spitzeneffekt / Faradayscher Käfig, F = E·Q, Coulomb-Gesetz,
Plattenkondensator (E = U/d, Q = C·U, C = ε₀εᵣA/d), Reihen-/Parallelschaltung, Auf- und Entladung (Differenzialgleichung),
Millikan-Versuch, Messwerttabelle / Mittelwert / Diagramme.

- 91 Karten in 12 Themen, Formeln mit KaTeX (lokal eingebunden, funktioniert offline)
- Karteikasten mit 5 Fächern (Leitner): Gewusst = ein Fach weiter, Nicht gewusst = zurück in Fach 1; Fach antippen und nur dessen Karten üben
- Fortschritt pro Karte wird im Browser gespeichert und über einen persönlichen Lerncode (Supabase) zwischen Geräten und Personen getrennt synchronisiert
- Vollbild-/Fokus-Modus (Taste F), Dunkelmodus (Standard), Hellmodus per Knopf, Konfetti nach jeder Runde

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

## Synchronisation

Beim ersten Start „Neuen Code erstellen“ (Name eintragen). Der Code (z. B. `K7M2-QX9P`) wird auf dem anderen Gerät unter „Verbinden“ eingegeben.
Jede Person hat ihren eigenen Code. Die Tabelle ist per RLS gesperrt, Zugriff nur über zwei Funktionen (`supabase/schema.sql`),
der Code ist das Geheimnis. Der Publishable-Key in `js/config.js` ist für den Browser gedacht.
