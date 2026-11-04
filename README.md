# Physik Q1 – Elektrisches Feld (Lernkarten)

Karteikarten, Diagramme und Rechenaufgaben zu allen Punkten der Checkliste:
Influenz, Polarisation, Feldlinienbilder, Spitzeneffekt / Faradayscher Käfig, F = E·Q, Coulomb-Gesetz,
Plattenkondensator (E = U/d, Q = C·U, C = ε₀εᵣA/d), Reihen-/Parallelschaltung, Auf- und Entladung (Differenzialgleichung),
Millikan-Versuch, Messwerttabelle / Mittelwert / Diagramme.

- 85 Karten in 11 Themen, jede mit Schwierigkeit (leicht, mittel, schwer) und Art (Abfrage oder Rechnen), Formeln mit KaTeX (lokal eingebunden, funktioniert offline)
- Karteikasten mit 5 Fächern (Leitner): Gewusst = ein Fach weiter, Nicht gewusst = zurück in Fach 1; Fach antippen und nur dessen Karten üben
- Fortschritt pro Karte wird im Browser gespeichert und über einen persönlichen Lerncode (Supabase) zwischen Geräten und Personen getrennt synchronisiert
- Vollbild-/Fokus-Modus (Taste F), Dunkelmodus (Standard), Hellmodus per Knopf, Konfetti nach jeder Runde

## Lernmethoden

- **Karteikasten** (5 Fächer, Leitner), filterbar nach Schwierigkeit, Art (Abfrage/Rechnen) und Thema
- **Quiz**: Multiple Choice mit Erklärung (76 Fragen, davon 39 automatisch aus den Größenkarten)
- **Rechentrainer**: 19 Aufgabentypen mit Zufallswerten, Eingabe mit 3 % Toleranz, Lösungsweg
- **Zuordnen**: Größe mit Symbol, Einheit oder Formel verbinden
- **Klausur-Simulation**: 20 Minuten, 4 Quizfragen und 4 Rechenaufgaben, Punkte und Notenpunkte
- **Kernübersichten**: eine Seite pro Thema mit Formeln, Skizzen und Checkliste, dazu „Alle Formeln“

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

Beim ersten Start „Neuen Code erstellen“ (Name und Einladungscode der Gruppe eintragen). Der Code (z. B. `K7M2-QX9P`) wird auf dem anderen Gerät unter „Verbinden“ eingegeben.
Jede Person hat ihren eigenen Code. Die Tabelle ist per RLS gesperrt, Zugriff nur über zwei Funktionen (`supabase/schema.sql`),
der Code ist das Geheimnis. Der Publishable-Key in `js/config.js` ist für den Browser gedacht.

## Karten löschen

Unter jeder Karte (und jeder Quizfrage) gibt es zwei Knöpfe. Beide setzen eine Anmeldung per Lerncode voraus.
- **Nur für mich löschen**: wird in deinem Profil gespeichert und mit deinen Geräten synchronisiert.
- **Für alle löschen**: blendet die Karte bei allen aus (Tabelle `lern_global`, mit Bestätigung).
Beides lässt sich unter *Mehr → Gelöschte Karten* wieder rückgängig machen.

## Sicherheit

- Der Lerncode ist das Geheimnis eines Profils. Wer ihn kennt, kann den Fortschritt lesen und ändern.
- Neue Profile entstehen nur mit dem **Einladungscode** (steht in Supabase in der Tabelle `lern_config`, nicht im Repo). Dadurch kann niemand ohne Einladung Profile anlegen oder Karten für alle löschen.
- Einladungscode ändern: `update public.lern_config set v = 'NEUERCODE' where k = 'invite';`
- Der Publishable-Key in `js/config.js` ist für den Browser gedacht. Alle Tabellen sind per RLS gesperrt, Zugriff nur über die Funktionen in `supabase/schema.sql`.
