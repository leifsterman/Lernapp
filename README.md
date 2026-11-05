# Physik Q1 – Elektrisches Feld (Lernkarten)

Karteikarten, Diagramme und Rechenaufgaben zu allen Punkten der Checkliste:
Influenz, Polarisation, Feldlinienbilder, Spitzeneffekt / Faradayscher Käfig, F = E·Q, Coulomb-Gesetz,
Plattenkondensator (E = U/d, Q = C·U, C = ε₀εᵣA/d), Reihen-/Parallelschaltung, Auf- und Entladung (Differenzialgleichung),
Millikan-Versuch, Messwerttabelle / Mittelwert / Diagramme.

- 92 Karten in 11 Themen, jede mit Schwierigkeit (leicht, mittel, schwer) und Art (Abfrage oder Rechnen), Formeln mit KaTeX (lokal eingebunden, funktioniert offline)
- Karteikasten mit 5 Fächern (Leitner): Gewusst = ein Fach weiter, Nicht gewusst = zurück in Fach 1; Fach antippen und nur dessen Karten üben
- Fortschritt pro Karte wird im Browser gespeichert und über einen persönlichen Lerncode (Supabase) zwischen Geräten und Personen getrennt synchronisiert
- Vollbild-/Fokus-Modus (Taste F), Dunkelmodus (Standard), Hellmodus per Knopf, Konfetti nach jeder Runde

## Lernmethoden

- **Karteikasten** (5 Fächer, Leitner), filterbar nach Schwierigkeit, Art (Abfrage/Rechnen) und Thema (Themen in 4 Gruppen, ganze Gruppe per Antippen der Überschrift)
- **Größen abfragen**: Alles, nur Formel oder nur Einheit. Jede Variante hat ihren eigenen Fortschritt im Karteikasten
- **Quiz**: Multiple Choice mit Erklärung (76 Fragen, davon 39 automatisch aus den Größenkarten)
- **Rechentrainer**: 19 Aufgabentypen mit Zufallswerten, Eingabe mit 3 % Toleranz, Lösungsweg
- **Zuordnen**: Größe mit Symbol, Einheit oder Formel verbinden
- **Klausur-Simulation**: 20 Minuten, 4 Quizfragen und 4 Rechenaufgaben, Punkte und Notenpunkte
- **Kernübersichten**: eine Seite pro Thema mit Formeln, Skizzen und Checkliste, dazu „Alle Formeln“

## Labor (Simulationen)

- **Herleitung live**: 9 Schritte mit Animation zur Differenzialgleichung: Q, C und U_C (Tank-Vergleich), U_R = R·I, I = dQ/dt, Maschenregel, (Q₀−Q)/τ, Entladen mit dem Minus, Variablentrennung (ln als Fläche), Lösung mit Probe und eine Übung zum Selbst-Herleiten (Schritte in die richtige Reihenfolge bringen). Jeder Formelteil ist farbig, antippbar und leuchtet im Bild auf
- **RC-Schaltung** wie im Schaltbild der Aufgabe: Umschalter, R₁ zum Laden, R₂ zum Entladen, Voltmeter, bewegte Elektronen, Kurven Uc(t), I(t), Q(t), τ-Marke und Potenziale an den Punkten A bis F
- **Differenzialgleichung**: die Kurve Schritt für Schritt per Euler-Verfahren aus dU/dt aufbauen, Schrittweite einstellbar
- **Kondensator-Labor**: d, A, εᵣ und U verändern, angeschlossen oder getrennt, live C, Q, U, E und W
- **Influenz & Polarisation**: Animationen zu Influenz (mit Erdung), Orientierungs- und Verschiebungspolarisation, Faradayscher Käfig
- **Q-U-Messung**: Kapazität eines unbekannten Kondensators per Messreihe, Diagramm und Ausgleichsgerade bestimmen, Energie als Fläche
- **Reihe & Parallel**: zwei Kondensatoren, Ladungen, Teilspannungen und Ersatzkapazität
- **Millikan-Versuch**: Schwebespannung einstellen, Polung umkehren (positive und negative Tröpfchen), q berechnen, Messreihe mit Mittelwert
- **Millikan-Auswertung**: viele Tröpfchen messen, Häufungen bei Vielfachen von e sehen, e bestimmen
- **Feldlinien-Labor**: Ladungen setzen und verschieben, Feldlinien und Probeladung
- **Schaltung beschriften** (unter „Lernen“): Potenziale an der RC-Schaltung eintragen, mit Erklärung je Punkt

## Lokal öffnen

`public/index.html` im Browser öffnen. Das ist eine einzelne Datei, die auch auf dem Handy offline läuft.

## Online stellen (kostenlos)

**GitHub Pages** (fertig vorbereitet): Repo → *Settings → Pages → Source: GitHub Actions*. Danach baut `.github/workflows/pages.yml`
bei jedem Push auf `main` die Seite. Adresse: `https://<benutzer>.github.io/Lernapp/`.

**Cloudflare Pages**: *Workers & Pages → Create → Pages → Connect to Git*, Repo wählen, Build command leer lassen,
Output directory `public`. Oder per Kommandozeile: `npx wrangler pages deploy public --project-name physik-q1`.

## Entwickeln

Grafik der Simulationen: `js/gfx.js` (Hintergrund, Bauteile, Kugeln, Feldlinien, Sprite-Cache), Simulationen in `js/sims*.js`.


Quellen: `index.html`, `css/`, `js/` (`cards.js` = alle Karten, `diagrams.js` = Feldlinien-Diagramme).
Mit `node build.mjs` wird daraus `public/index.html` gebaut. Lokal testen: `python3 -m http.server` im Projektordner.

## Konto und Rangliste

- Registrieren mit **Benutzername und eigenem Passwort**, keine E-Mail..
- Anmelden auf jedem Gerät mit Benutzername und Passwort, der Fortschritt wird synchronisiert.
- Passwort und Benutzername lassen sich im Reiter „Konto“ ändern. Ohne E-Mail gibt es kein Zurücksetzen per Link.
- **Rangliste** im gleichnamigen Reiter: alle Konten stehen automatisch in der Liste (Ausblenden im Konto möglich). Punkte: Karteikasten nach Fach (1/2/4/7/10 je Karte), Quiz (1, bis 150), Rechentrainer (2, bis 75 Aufgaben), Schaltung beschriften (3, bis 10), Zuordnen (1 pro Runde, bis 20) und Klausur (4 pro Notenpunkt). Die Rangliste hat eine Tageswertung („Heute“: Punkte seit Mitternacht, deutsche Zeit) neben „Gesamt“. Eine bereits richtig gelöste Aufgabe bringt bei Wiederholung nur noch ein Viertel der Punkte. Dazu Titel von „Einsteiger“ bis „Physik-Legende“, eigene Karte mit Fortschritt und Aufschlüsselung.

## Synchronisation (alt: Lerncode)

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


## Zusätzlicher Lernweg: Kondensatorentladung (aktueller Klausurstoff)

Die **ursprüngliche App mit allen Themen, Karteikasten, Quiz, Rechentrainer, Labor, Wissen, Rangliste und Konto bleibt erhalten**.

Im Tab **Lernen** gibt es jetzt eine zusätzliche Schaltfläche **„Geführte Entladungs-Herleitung starten“**. Der Lernweg liegt unter `entladung.html` und führt von der **gegebenen** e-Funktion `Q(t) = Q₀·e^(-t/(RC))` über die Maschenregel zur Differentialgleichung und kontrolliert die Lösung durch Einsetzen (`0 = 0`). Die Lernerklärungen behandeln insbesondere den Sinn von `Q₀`, die Faktor- und Kettenregel, das zusätzliche `k`, Vorzeichen und den Zusammenhang von `Q` und `U`.

**Nur die Aufladung eines Kondensators ist für den aktuellen Lernstoff nicht nötig**. Vorhandene Auflade-Karten, Aufgaben und Übersichten bleiben als **Zusatzwissen** zugänglich und werden an den relevanten Stellen als aktuell nicht benötigt markiert. Andere Themen sind davon nicht betroffen.

Der Build `node build.mjs` erzeugt wie bisher `public/index.html` und `dist/artifact.html`, außerdem `public/entladung.html`. GitHub Pages veröffentlicht beide Seiten zusammen.



## Laborprüfung (Bienen und Euler-Verfahren)

- **Biene mit Eimer:** Der Eimer ist eine didaktische Analogie für elektrische potenzielle Energie **pro Ladung**, relativ zur eingestellten Spannungsquelle \(U_0\), kein tatsächlicher Flüssigkeits- oder Energietransport. Die Füllung wird nicht mehr pauschal durch 12 V geteilt: Auch bei 1 V wird der Eimer unmittelbar nach der Batterie vollständig gefüllt angezeigt.
- Beim **Entladen** ist vor \(R_2\) noch eine relative Füllung von \(U_C/U_0\) vorhanden, hinter \(R_2\) ist er leer. Die Füllung folgt der örtlichen Potenzialdifferenz unmittelbar und wird nicht verzögert. Bei offenem Schalter oder in einem nicht durchströmten Zweig bleibt der bisherige Zustand erhalten.
- Die Bienen-Grafik verwendet jetzt zwölf statt vier unterschiedliche Zwischenfüllungen; Gesichtsausdrücke bleiben unabhängig davon abgestuft.
- **Euler-Verfahren:** Bei zu großen Schritten können negative oder >100-prozentige Näherungswerte auftreten. Das wird im Diagramm und im Informationstext als **numerisches Artefakt** gekennzeichnet; der letzte Schritt überschreitet \(5\tau\) nicht mehr.
- Regressionstests: `node build.mjs && node --test tests/*.test.mjs`. Der Test prüft den Eimer bei mehreren Spannungen, vor und nach dem Widerstand, offene Zweige, das tatsächliche Canvas-Zeichnen der Eimerfüllung und den Euler-Zeitbereich.

**Grenze der Prüfung:** Die automatisierten Node-/Canvas-Mock-Tests ersetzen keine vollständige visuelle Prüfung auf echten Mobilgeräten. Bei unterschiedlichen Browserskalierungen und Touch-Eingaben muss weiter manuell getestet werden.


## Physikalische Kontinuität und Elektronentransport im RC-Labor

**Prinzip:** Die Kondensatorladung wird analytisch berechnet, nicht aus der Anzahl animierter Figuren. Für einen geschlossenen Entladekreis gilt `Q(t+Δt) = Q(t)·exp(−Δt/(R₂C))`; beim Laden `Q(t+Δt) = CU₀ + (Q(t)−CU₀)·exp(−Δt/(R₁C))`. Beim offenen Schalter bleibt die Ladung konstant.

- **Leitung und Widerstände:** Elektronen bewegen sich auf leitfähigen Strecken. Im unverzweigten Stromkreis wird im Widerstand kein Elektron „verbraucht“. Auf beiden Seiten des Widerstands ist die Stromstärke gleich; die Energie pro Ladung kann über dem Widerstand abfallen. Das bisherige Bienen-Eimer-Modell bleibt ausdrücklich eine Analogie.
- **Kondensator:** Bewegte Elektronen erreichen bzw. verlassen die äußeren Kontakte der Platten; es gibt **keine Elektronenbahn durch das ideal isolierende Dielektrikum**. Positive und negative Plattenladung erscheinen stets mit gleichem Betrag und werden gemeinsam aus dem physikalischen `Q` berechnet. Kleine Ladungen erscheinen als halbtransparente Symbole, nicht sprunghaft erst ab einem diskreten Zählerstand.
- **Umschalten:** Beim Kontaktwechsel springen grafische und elektrische Schalterstellung zusammen. Ein offener Schalter bewirkt keine Drift; die sichtbaren Elektronen bleiben auf ihren Leitern. Bei Quellspannungsabsenkung unter `U_C` ist auch ein umgekehrter Strom im Ladezweig möglich.
- **Fenster-, Tab- und App-Bereichswechsel:** Die App spart unsichtbare Zeichenframes ein. Sobald das Labor wieder geöffnet oder der Tab aktiv wird, wird die tatsächlich vergangene Zeit mit der **exakten RC-Gleichung** nachgerechnet; Tracer und Diagramm werden nachgeführt. Die ursprünglichen Elektronenpositionen und der physikalische Simulationszustand überleben interne App-Navigation, aber **kein bewusstes Neuladen/Schließen des gesamten Dokuments**.
- **Geschwindigkeit:** Bewegte Punkte sind stark beschleunigte Tracer und nicht maßstabsgetreue einzelne Elektronen. Die Ausbreitung des elektrischen Feldes wird nicht als atomistischer Transport simuliert. Einmalige Wege werden als Illustration gleichmäßig in kleine Bewegungsstücke aufgeteilt.
- **Einheiten:** In der App sind `R` in kΩ, `C` in µF, `Q` in µC, `U` in V und `t` in s; damit gilt `τ = R·C/1000`.

Auch die Labore **Reihen-/Parallelschaltung** und **Herleitung live** zeigen die Leitungs-Elektronen jetzt bei verschwindendem Strom weiterhin statisch. Im Herleitungs-Labor bewegen sie sich nur bei tatsächlich fließendem Strom und verschwinden beim Durchqueren eines Widerstands nicht mehr.

Regressionsprüfungen: `node build.mjs && node --test tests/*.test.mjs`. Sie prüfen RC-Zeitgesetz, große Unterbrechungen, Stromrichtung, Kondensatorladungen und Leiterwege. Eine **vollständige** visuelle und Touch-Interaktion auf echten Endgeräten ist damit noch nicht nachgewiesen.


## RC-Labor: visuell überprüfte Bedienung

Die Bienen-Eimer haben nun eine deutlich unterscheidbare türkisfarbene Füllung auf dunklem Grund und sind etwas größer. Wenn die Bienen-Darstellung aktiv ist, erscheint zusätzlich eine vergrößerte Energievergleichsanzeige **vor und nach dem jeweils geschlossenen Widerstand**. Die Anzeige verwendet dieselbe Modellfunktion wie die bewegten Teilchen und gibt Prozentwerte an. Bei offenem Schalter wird statt einer Energiemessung ausdrücklich Stillstand angezeigt.

Der RC-Zustand (Schalter, Q, verstrichene Zeit, gewählte Schaltungsparameter, Elektronenpositionen samt Reserven, Diagrammauswahl, Anzeigeoptionen) wird in `sessionStorage` für den **gleichen Browser-Tab** gespeichert. Interne Navigation, vorübergehend unsichtbare Tabs und Neuladen derselben Registerkarte sollen den RC-Zustand nicht auf den Anfang zurücksetzen; nach der Rückkehr wird die verstrichene Zeit mit der RC-Gleichung nachgerechnet. Ein neu geöffneter separater Browser-Tab ist bewusst eine neue Sitzung. Der Knopf `Zurücksetzen` setzt nur die RC-Simulation zurück. Beim offenen Schalter folgt das Voltmeter ohne künstlichen Anzeige-Nachlauf dem konstanten `U_C`.

Offline nutzt der Service Worker Netzwerkpriorität für Seiten-Navigation, damit veraltete JS-Versionen nicht ständig aus dem Cache geladen werden. Alle ursprünglichen Themen und Lernbereiche bleiben vorhanden.

**Prüfung:** `node build.mjs && node --test tests/*.test.mjs`. Der Build bestätigt, dass die vollständige Haupt-App und die Entladungs-Lerneinheit erhalten bleiben. Die automatisierten Prüfungen sind keine vollständige visuelle Abnahme auf jedem Mobilgerät.
