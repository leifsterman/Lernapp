/* Kernübersichten: eine Seite pro Thema. Formeln in KaTeX, Diagramme aus diagrams.js. */
(function () {
  const R = String.raw;
  const S = [];
  function sheet(id, title, sub, html, dia) { S.push({ id, title, sub, html, dia: dia || [] }); }

  // ------------------------------------------------------------ Formeln gesamt
  sheet("formeln", "Alle Formeln", "Die Formelsammlung auf einer Seite", R`
<h3>Feld und Kraft</h3>
<table class="cmp"><tr><th>Größe</th><th>Formel</th><th>Einheit</th></tr>
<tr><td>Kraft im Feld</td><td>$F = E\cdot Q$</td><td>N</td></tr>
<tr><td>Feldstärke (Definition)</td><td>$E = \dfrac{F}{Q}$</td><td>N/C = V/m</td></tr>
<tr><td>Coulomb-Gesetz</td><td>$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1Q_2}{r^2}$</td><td>N</td></tr>
<tr><td>Punktladung</td><td>$E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{r^2}$</td><td>V/m</td></tr>
<tr><td>Plattenkondensator</td><td>$E = \dfrac{U}{d} = \dfrac{\sigma}{\varepsilon_0}$</td><td>V/m</td></tr>
<tr><td>Flächenladungsdichte</td><td>$\sigma = \dfrac{Q}{A}$</td><td>C/m²</td></tr></table>
<h3>Kondensator</h3>
<table class="cmp"><tr><th>Größe</th><th>Formel</th><th>Einheit</th></tr>
<tr><td>Kapazität</td><td>$C = \dfrac{Q}{U}$, &nbsp; $Q = C\cdot U$</td><td>F = C/V</td></tr>
<tr><td>Plattenkondensator</td><td>$C = \varepsilon_0\varepsilon_r\dfrac{A}{d}$</td><td>F</td></tr>
<tr><td>Energie</td><td>$W = \dfrac{1}{2}CU^2 = \dfrac{1}{2}QU$</td><td>J</td></tr>
<tr><td>Parallel</td><td>$C_{\mathrm{ges}} = C_1 + C_2$</td><td>F</td></tr>
<tr><td>Reihe</td><td>$\dfrac{1}{C_{\mathrm{ges}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2}$</td><td>F</td></tr></table>
<h3>Auf- und Entladung</h3>
<table class="cmp"><tr><th>Größe</th><th>Formel</th></tr>
<tr><td>Zeitkonstante</td><td>$\tau = R\cdot C$</td></tr>
<tr><td>Entladen</td><td>$U(t) = U_0\,e^{-t/\tau}$, &nbsp; $Q(t) = Q_0\,e^{-t/\tau}$</td></tr>
<tr><td>Aufladen</td><td>$U_C(t) = U_0(1 - e^{-t/\tau})$</td></tr>
<tr><td>Strom</td><td>$I(t) = \dfrac{U_0}{R}\,e^{-t/\tau}$</td></tr>
<tr><td>Halbwertszeit</td><td>$t_{1/2} = \tau\ln 2 \approx 0{,}69\,\tau$</td></tr></table>
<h3>Millikan und Konstanten</h3>
<table class="cmp"><tr><th>Größe</th><th>Wert / Formel</th></tr>
<tr><td>Schweben</td><td>$q = \dfrac{m\,g\,d}{U}$</td></tr>
<tr><td>Elementarladung</td><td>$e = 1{,}602\cdot10^{-19}\,\mathrm{C}$</td></tr>
<tr><td>Feldkonstante</td><td>$\varepsilon_0 = 8{,}854\cdot10^{-12}\,\mathrm{F/m}$</td></tr>
<tr><td>Coulomb-Konstante</td><td>$\dfrac{1}{4\pi\varepsilon_0} = 8{,}99\cdot10^{9}\,\mathrm{N\,m^2/C^2}$</td></tr>
<tr><td>Elektronenmasse</td><td>$m_e = 9{,}109\cdot10^{-31}\,\mathrm{kg}$</td></tr></table>
<p class="hint">Formelsammlung laut Notiz: S. 23, 24, 25, 27.</p>`);

  // ------------------------------------------------------------ Themen
  sheet("groessen", "Größen & Einheiten", "Symbol, Einheit, Formel", R`
<h3>Auf einen Blick</h3>
<table class="cmp"><tr><th>Größe</th><th>Symbol</th><th>Einheit</th><th>Formel</th></tr>
<tr><td>Spannung</td><td>$U$</td><td>V = J/C</td><td>$U = \dfrac{W}{Q}$</td></tr>
<tr><td>Ladung</td><td>$Q$</td><td>C = A·s</td><td>$Q = I\cdot t$</td></tr>
<tr><td>Stromstärke</td><td>$I$</td><td>A</td><td>$I = \dfrac{\mathrm{d}Q}{\mathrm{d}t}$</td></tr>
<tr><td>Widerstand</td><td>$R$</td><td>Ω = V/A</td><td>$R = \dfrac{U}{I}$</td></tr>
<tr><td>Kapazität</td><td>$C$</td><td>F = C/V</td><td>$C = \dfrac{Q}{U}$</td></tr>
<tr><td>Feldstärke</td><td>$E$</td><td>V/m = N/C</td><td>$E = \dfrac{F}{Q}$</td></tr>
<tr><td>Flächenladungsdichte</td><td>$\sigma$</td><td>C/m²</td><td>$\sigma = \dfrac{Q}{A}$</td></tr>
<tr><td>Zeitkonstante</td><td>$\tau$</td><td>s</td><td>$\tau = R\cdot C$</td></tr>
<tr><td>Energie</td><td>$W$</td><td>J</td><td>$W = \tfrac{1}{2}CU^2$</td></tr></table>
<h3>Das musst du können</h3>
<ul class="check"><li>Zu jeder Größe Symbol, Einheit und Formel nennen.</li><li>Einheiten ineinander umrechnen (Probe!).</li><li>Vorsätze: n = $10^{-9}$, µ = $10^{-6}$, m = $10^{-3}$, k = $10^{3}$.</li></ul>`);

  sheet("influenz", "Influenz", "Ladungstrennung in Leitern", R`
<h3>Kern</h3>
<ul><li>Influenz = Ladungstrennung in einem <b>Leiter</b> durch ein äußeres Feld, ohne Berührung.</li>
<li>Zugewandte Seite: <b>ungleichnamig</b>. Abgewandte Seite: <b>gleichnamig</b>. Insgesamt <b>neutral</b>.</li>
<li>Im Leiter ist im Gleichgewicht $E = 0$ (Gegenfeld der Influenzladungen).</li></ul>
<h3>Aufladen durch Influenz (mit negativem Stab)</h3>
<ol><li>Stab nähern, Elektronen weichen aus.</li><li>Kugel erden, Elektronen fließen ab.</li><li>Erdung weg, dann Stab weg.</li><li>Kugel ist <b>positiv</b>.</li></ol>
<h3>Das musst du können</h3>
<ul class="check"><li>Ablauf mit Skizze erklären (Elektroskop, Kugel).</li><li>Influenz von Berührungsaufladung unterscheiden.</li></ul>`);

  sheet("polar", "Polarisation", "Dielektrika, Dipole", R`
<h3>Kern</h3>
<ul><li>Polarisation: Verhalten von <b>Isolatoren</b>. Es gibt keine freien Ladungen.</li>
<li><b>Verschiebungspolarisation:</b> Atom wird zum Dipol. <b>Orientierungspolarisation:</b> vorhandene Dipole richten sich aus (Wasser).</li>
<li>Gebundene Polarisationsladungen schwächen das Feld: $E = \dfrac{E_0}{\varepsilon_r}$.</li></ul>
<table class="cmp"><tr><th></th><th>Influenz</th><th>Polarisation</th></tr>
<tr><td>Material</td><td>Leiter</td><td>Isolator</td></tr><tr><td>Ladungen</td><td>frei beweglich</td><td>gebunden</td></tr><tr><td>Trennbar?</td><td>ja (Erdung)</td><td>nein</td></tr></table>
<h3>Im Kondensator</h3>
<ul><li>Gleiche Spannung: $C\to\varepsilon_r\cdot C$, mehr Ladung.</li><li>Gleiche Ladung: $U\to U/\varepsilon_r$.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Papierschnipsel-Versuch erklären.</li><li>Unterschied zur Influenz in einem Satz sagen.</li></ul>`);

  sheet("feldlinien", "Feldlinienbilder", "Zeichnen & interpretieren", R`
<h3>Regeln</h3>
<ul><li>Von <b>+</b> nach <b>−</b>, nicht geschlossen, schneiden sich nie.</li>
<li>Tangente = Kraftrichtung auf eine positive Probeladung.</li>
<li>Dichte der Linien = Feldstärke.</li><li>Senkrecht zu Leiteroberflächen.</li></ul>
<h3>Typische Bilder</h3>`, ["pos", "neg", "dipole", "pospos", "plates"]);

  sheet("spitze", "Spitzeneffekt & Faraday-Käfig", "Leiter im Feld", R`
<h3>Spitzeneffekt</h3>
<ul><li>Ladung sammelt sich an Spitzen (starke Krümmung), $\sigma$ groß, also $E = \sigma/\varepsilon_0$ groß.</li>
<li>Luft ionisiert, Spitzenentladung. Nutzen: Blitzableiter. Vermeiden: Hochspannung rund bauen.</li></ul>
<h3>Faradayscher Käfig</h3>
<ul><li>Geschlossene leitende Hülle (auch Gitter): im Inneren $E = 0$.</li>
<li>Außen enden die Feldlinien senkrecht. Beispiele: Auto, Flugzeug, Mikrowelle, Koaxialkabel.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Beide Skizzen zeichnen.</li><li>Erklären, warum Feldlinien senkrecht auf dem Leiter stehen.</li></ul>`, ["tip", "faraday"]);

  sheet("kraft", "Feldstärke, Kraft & Coulomb", "F = E·Q, radialsymmetrisch, homogen", R`
<h3>Formeln</h3>
<p>$$F = E\cdot Q \qquad E = \dfrac{F}{Q}$$</p>
<p>$$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1Q_2}{r^2} \qquad E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{r^2}$$</p>
<h3>Kern</h3>
<ul><li>Positive Ladung: Kraft in Feldrichtung. Negative: entgegen.</li>
<li>Gleichnamig stoßen sich ab, ungleichnamig ziehen sich an.</li>
<li><b>Radialsymmetrisch</b>: Punktladung, $E\sim 1/r^2$, inhomogen.</li>
<li><b>Homogen</b> = überall gleich: parallele, gleich weit entfernte Linien (Plattenkondensator).</li>
<li>Elektron im Feld: $a = \dfrac{eE}{m_e}$.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Coulomb-Gesetz aus $F = EQ$ ableiten.</li><li>Abstandsänderungen im Kopf rechnen (doppelt, dreifach).</li></ul>`, ["pos"]);

  sheet("kondensator", "Kondensator & Plattenkondensator", "E = U/d, Q = C·U, C = ε₀εᵣA/d", R`
<h3>Formeln</h3>
<p>$$E = \dfrac{U}{d} = \dfrac{\sigma}{\varepsilon_0}\qquad Q = C\cdot U\qquad C = \varepsilon_0\varepsilon_r\dfrac{A}{d}$$</p>
<p>$$W = \dfrac{1}{2}CU^2$$</p>
<h3>Herleitungen</h3>
<ul><li>$E = U/d$: $W = F\,d = EQ\,d$ und $W = QU$.</li>
<li>$C = \varepsilon_0 A/d$: $C = \dfrac{Q}{U} = \dfrac{\sigma A}{\sigma d/\varepsilon_0}$.</li></ul>
<h3>Wenn sich etwas ändert</h3>
<table class="cmp"><tr><th>Bedingung</th><th>$d$ verdoppeln</th></tr>
<tr><td>Quelle <b>getrennt</b> ($Q$ fest)</td><td>$C$ halbiert, $U$ verdoppelt, $E$ gleich</td></tr>
<tr><td>Quelle <b>angeschlossen</b> ($U$ fest)</td><td>$C$ halbiert, $Q$ halbiert, $E$ halbiert</td></tr></table>
<p class="hint">Achtung: In den Notizen steht $E = \varepsilon_0\cdot\sigma$. Richtig ist $E = \sigma/\varepsilon_0$.</p>
<h3>Das musst du können</h3>
<ul class="check"><li>Beide Herleitungen.</li><li>Das Feldlinienbild zeichnen.</li><li>Die Tabelle oben begründen.</li></ul>`, ["plates"]);

  sheet("schaltung", "Reihen- & Parallelschaltung", "Ersatzkapazität", R`
<table class="cmp"><tr><th></th><th>Parallel</th><th>Reihe</th></tr>
<tr><td>Kapazität</td><td>$C = C_1 + C_2$</td><td>$\dfrac{1}{C} = \dfrac{1}{C_1} + \dfrac{1}{C_2}$</td></tr>
<tr><td>gleich an allen</td><td>Spannung $U$</td><td>Ladung $Q$</td></tr>
<tr><td>teilt sich auf</td><td>$Q = Q_1 + Q_2$</td><td>$U = U_1 + U_2$</td></tr>
<tr><td>Ergebnis</td><td>größer als jedes $C_i$</td><td>kleiner als jedes $C_i$</td></tr></table>
<ul><li>Zwei in Reihe: $C = \dfrac{C_1C_2}{C_1+C_2}$. Am kleineren Kondensator liegt mehr Spannung.</li>
<li>Merke: Bei Widerständen ist es genau umgekehrt.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Gemischte Schaltungen schrittweise zusammenfassen.</li></ul>`);

  sheet("ladung", "Auf- und Entladung", "Differenzialgleichung, τ = R·C", R`
<h3>Entladung</h3>
<p>$$\dfrac{Q}{C} + R\dfrac{\mathrm{d}Q}{\mathrm{d}t} = 0 \;\Rightarrow\; \dfrac{\mathrm{d}Q}{\mathrm{d}t} = -\dfrac{Q}{RC}$$</p>
<p>$$Q(t) = Q_0\,e^{-t/\tau}\qquad U(t) = U_0\,e^{-t/\tau}$$</p>
<h3>Aufladung</h3>
<p>$$U_0 = R\dfrac{\mathrm{d}Q}{\mathrm{d}t} + \dfrac{Q}{C}$$</p>
<p>$$Q(t) = Q_0\bigl(1 - e^{-t/\tau}\bigr)$$</p>
<h3>Merkpunkte</h3>
<ul><li>$\tau = R\,C$. Nach $\tau$: Entladen 37 %, Aufladen 63 %. Nach $5\tau$ praktisch fertig.</li>
<li>Strom beim Einschalten maximal: $I_0 = U_0/R$.</li>
<li>$t_{1/2} = \tau\ln 2$. $\ln U$ über $t$ ist eine Gerade mit Steigung $-1/\tau$.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Dgl. aus der Maschenregel aufstellen und lösen (Variablentrennung).</li><li>Kurven zeichnen, $\tau$ einzeichnen.</li></ul>`, ["rc"]);

  sheet("millikan", "Millikan-Versuch", "Schwebemethode, Elementarladung", R`
<h3>Aufbau</h3>
<ul><li>Öltröpfchen zwischen waagerechten Kondensatorplatten, Mikroskop.</li>
<li>Kräfte: Gewicht $F_G = m g$ nach unten, elektrische Kraft $F_{el} = qE$ nach oben.</li></ul>
<h3>Schwebemethode</h3>
<p>$$q\cdot\dfrac{U}{d} = m\cdot g \;\Rightarrow\; q = \dfrac{m\,g\,d}{U}$$</p>
<h3>Ergebnis</h3>
<ul><li>$q = n\cdot e$ mit $e = 1{,}602\cdot10^{-19}\,\mathrm{C}$: Ladung ist <b>gequantelt</b>.</li>
<li>Aus mehreren Werten: größten gemeinsamen Teiler suchen, durch ganze Zahlen teilen, Mittelwert bilden.</li>
<li>Fehlerquellen: Verdunstung, Luftströmung, Auftrieb, Ablesefehler.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Skizze mit Kräften.</li><li>$q$ berechnen und $n$ bestimmen.</li></ul>`, ["millikan"]);

  sheet("klausur", "Messwerte & Diagramme", "Tabelle, Mittelwert, Diagramm", R`
<h3>Messwerttabelle</h3>
<ul><li>Spaltenkopf: Größe, Symbol, <b>Einheit</b>. In den Zellen nur Zahlen.</li><li>Messungen nummerieren, einheitliche Nachkommastellen, Mittelwert unten.</li></ul>
<h3>Mittelwert</h3>
<p>$$\bar{x} = \dfrac{1}{n}\sum_{i=1}^{n}x_i$$</p>
<h3>Diagramm</h3>
<ul><li>Achsen: Größe und Einheit. Unabhängige Größe auf die x-Achse.</li><li>Gleichmäßige Skala, Messpunkte als Kreuze, <b>Ausgleichsgerade</b> statt Punkt-zu-Punkt.</li>
<li>Steigung mit Steigungsdreieck aus zwei Punkten der Geraden.</li></ul>
<h3>Typische Zusammenhänge</h3>
<table class="cmp"><tr><th>Diagramm</th><th>Verlauf</th><th>Steigung</th></tr>
<tr><td>$Q$ über $U$</td><td>Gerade</td><td>$C$</td></tr><tr><td>$E$ über $r$</td><td>Hyperbel $1/r^2$</td><td>–</td></tr>
<tr><td>$\ln U$ über $t$</td><td>Gerade</td><td>$-1/\tau$</td></tr></table>
<p class="hint">Abweichung: $\dfrac{|x_{mess} - x_{Lit}|}{x_{Lit}}\cdot100\,\%$</p>`);

  window.PHYS_SHEETS = S;
})();
