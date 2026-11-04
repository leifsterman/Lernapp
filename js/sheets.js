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
</table>
<h3>Millikan und Konstanten</h3>
<table class="cmp"><tr><th>Größe</th><th>Wert / Formel</th></tr>
<tr><td>Schweben</td><td>$q = \dfrac{m\,g\,d}{U}$</td></tr>
<tr><td>Elementarladung</td><td>$e = 1{,}602\cdot10^{-19}\,\mathrm{C}$</td></tr>
<tr><td>Feldkonstante</td><td>$\varepsilon_0 = 8{,}854\cdot10^{-12}\,\mathrm{F/m}$</td></tr>
<tr><td>Coulomb-Konstante</td><td>$\dfrac{1}{4\pi\varepsilon_0} = 8{,}99\cdot10^{9}\,\mathrm{N\,m^2/C^2}$</td></tr></table>
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
</ul>
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
<li>$\ln U$ über $t$ ist eine Gerade mit Steigung $-1/\tau$.</li></ul>
<h3>Das musst du können</h3>
<ul class="check"><li>Dgl. aus der Maschenregel aufstellen und lösen (Variablentrennung).</li><li>Kurven zeichnen, $\tau$ einzeichnen.</li></ul>`, ["rc"]);

  sheet("herleitung", "Herleitung Schritt für Schritt", "Auf- und Entladen ohne Vorwissen verstehen und selbst herleiten", R`
<p class="hint"><b>Zum Anschauen:</b> Im Labor gibt es dazu die Simulation <b>„Herleitung live“</b>. Dort siehst du in 8 Schritten am Kondensator, was jeder Teil der Formel bedeutet und warum er dasteht. Im 9. Schritt leitest du selbst her.</p>
<p>Ziel: Du kannst am Ende die Formeln für Auf- und Entladen <b>selbst auf einem leeren Blatt</b> herleiten. Lies jeden Schritt, decke dann die Rechnung ab und versuche sie allein. Im Labor („RC-Schaltung“ und „Differenzialgleichung“) siehst du alles live.</p>

<h3>0 · Was du vorher wissen musst</h3>
<ul>
<li><b>Ladung</b> $Q$ (Einheit C): wie viel Ladung auf der Kondensatorplatte sitzt.</li>
<li><b>Strom</b> $I$ (Einheit A): Ladung pro Zeit. $I = \dfrac{\mathrm{d}Q}{\mathrm{d}t}$ heißt: „Wie schnell ändert sich $Q$?“ Das ist die Steigung der $Q(t)$-Kurve.</li>
<li><b>Spannung</b> $U$ (Einheit V): „Druck“, der Ladung antreibt.</li>
<li><b>Kondensator:</b> $U_C = \dfrac{Q}{C}$. Je mehr Ladung drauf, desto höher seine Spannung.</li>
<li><b>Widerstand (Ohm):</b> $U_R = R\cdot I$. Je mehr Strom, desto mehr Spannung fällt am Widerstand ab.</li>
<li><b>Maschenregel:</b> In einem geschlossenen Kreis ergeben alle Spannungen zusammen null (Quelle zählt gegen die Verbraucher).</li>
</ul>

<h3>1 · Die Idee in Alltagssprache</h3>
<p>Ein leerer Kondensator hinter einem Widerstand: Anfangs „drückt“ die Quelle voll, viel Strom fließt, $Q$ wächst schnell. Je voller der Kondensator, desto stärker drückt <b>er zurück</b>, der Strom wird kleiner, $Q$ wächst langsamer. Das Laden wird also immer träger und erreicht den Endwert nie ganz.</p>
<p>Genauso beim Entladen: Viel Ladung drauf = viel Spannung = viel Strom = schnelle Abnahme. Je weniger Ladung übrig, desto langsamer fällt sie weiter. <b>Die Änderungsrate ist proportional zum Vorrat.</b> Genau das ist eine Differenzialgleichung, und ihre Lösung ist immer eine $e$-Funktion.</p>

<h3>2 · Entladen: Dgl. aufstellen</h3>
<p><b>Schaltung:</b> Geladener Kondensator ($Q_0$), Schalter zu, Widerstand $R$ im Kreis. Keine Quelle.</p>
<ol>
<li><b>Maschenregel:</b> $U_C + U_R = 0$</li>
<li><b>Bausteine einsetzen:</b> $U_C = \dfrac{Q}{C}$ und $U_R = R\cdot I$ ergibt $\dfrac{Q}{C} + R\cdot I = 0$</li>
<li><b>Strom durch $Q$ ausdrücken:</b> $I = \dfrac{\mathrm{d}Q}{\mathrm{d}t}$. Damit nur noch eine Unbekannte $Q(t)$ übrig bleibt: $\dfrac{Q}{C} + R\,\dfrac{\mathrm{d}Q}{\mathrm{d}t} = 0$</li>
<li><b>Nach der Ableitung umstellen:</b> $R\,\dfrac{\mathrm{d}Q}{\mathrm{d}t} = -\dfrac{Q}{C}$ also
$$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = -\dfrac{1}{RC}\,Q = -\dfrac{Q}{\tau}\qquad\text{mit } \tau = R\cdot C$$</li>
</ol>
<div class="hint">Das Minus sagt: $Q$ wird kleiner. Die Rate ist proportional zu $Q$ selbst, genau wie in Schritt 1 beschrieben. $I = \mathrm{d}Q/\mathrm{d}t$ ist hier negativ, weil der Strom entgegen der Lade-Richtung fließt.</div>

<h3>3 · Entladen: Dgl. lösen (Variablentrennung)</h3>
<p>Idee: Alles mit $Q$ auf eine Seite, alles mit $t$ auf die andere, dann auf beiden Seiten das Integral.</p>
<ol>
<li><b>Trennen:</b> $\dfrac{\mathrm{d}Q}{Q} = -\dfrac{1}{\tau}\,\mathrm{d}t$</li>
<li><b>Integrieren</b> von Anfang ($t=0$, $Q=Q_0$) bis jetzt ($t$, $Q$):
$$\int_{Q_0}^{Q}\dfrac{\mathrm{d}Q'}{Q'} = -\dfrac{1}{\tau}\int_{0}^{t}\mathrm{d}t' \;\Rightarrow\; \ln Q - \ln Q_0 = -\dfrac{t}{\tau}$$
(Stammfunktion von $1/Q$ ist $\ln Q$, von $1$ ist $t$.)</li>
<li><b>Logarithmen zusammenfassen:</b> $\ln\dfrac{Q}{Q_0} = -\dfrac{t}{\tau}$</li>
<li><b>Mit $e$ „aufheben“:</b> $\dfrac{Q}{Q_0} = e^{-t/\tau}$ also
$$Q(t) = Q_0\,e^{-t/\tau}$$</li>
<li><b>Spannung und Strom folgen:</b> $U_C = \dfrac{Q}{C} = U_0\,e^{-t/\tau}$ und $I = -\dfrac{U_0}{R}\,e^{-t/\tau}$ (Betrag $\dfrac{U_0}{R}e^{-t/\tau}$).</li>
</ol>
<p><b>Probe (immer machen!):</b> Ableiten ergibt $\dfrac{\mathrm{d}Q}{\mathrm{d}t} = Q_0\cdot\left(-\dfrac{1}{\tau}\right)e^{-t/\tau} = -\dfrac{Q}{\tau}$. Das ist die Dgl. aus Schritt 2. Bei $t=0$ gilt $Q=Q_0$. Beides stimmt.</p>

<h3>4 · Aufladen: Dgl. aufstellen</h3>
<p><b>Schaltung:</b> Leerer Kondensator ($Q(0)=0$), Quelle $U_0$, Widerstand $R$ in Reihe.</p>
<ol>
<li><b>Maschenregel:</b> Die Quellspannung verteilt sich auf $R$ und $C$: $U_0 = U_R + U_C$</li>
<li><b>Einsetzen:</b> $U_0 = R\,\dfrac{\mathrm{d}Q}{\mathrm{d}t} + \dfrac{Q}{C}$</li>
<li><b>Endladung einführen:</b> Wenn alles fertig ist, fließt kein Strom mehr und $U_C = U_0$. Das heißt $Q_0 = C\cdot U_0$. Dann ist $U_0 = \dfrac{Q_0}{C}$, und es folgt $R\,\dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dfrac{Q_0 - Q}{C}$ also
$$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dfrac{Q_0 - Q}{\tau}$$</li>
</ol>
<div class="hint">Lies es so: Die Rate ist proportional zum <b>Abstand zum Ziel</b> ($Q_0 - Q$). Weit weg = schnell. Fast da = langsam.</div>

<h3>5 · Aufladen: Dgl. lösen</h3>
<ol>
<li><b>Trennen:</b> $\dfrac{\mathrm{d}Q}{Q_0 - Q} = \dfrac{\mathrm{d}t}{\tau}$</li>
<li><b>Integrieren</b> von $t=0$ ($Q=0$) bis $t$:
$$-\ln(Q_0 - Q)\,\Big|_{0}^{Q} = \dfrac{t}{\tau} \;\Rightarrow\; -\ln(Q_0 - Q) + \ln Q_0 = \dfrac{t}{\tau}$$
(Vorsicht: Wegen der Kettenregel steht vor dem $\ln$ ein <b>Minus</b>, denn die innere Ableitung von $Q_0-Q$ ist $-1$.)</li>
<li><b>Zusammenfassen:</b> $\ln\dfrac{Q_0 - Q}{Q_0} = -\dfrac{t}{\tau}$</li>
<li><b>Mit $e$ aufheben:</b> $\dfrac{Q_0 - Q}{Q_0} = e^{-t/\tau}$</li>
<li><b>Nach $Q$ umstellen:</b>
$$Q(t) = Q_0\bigl(1 - e^{-t/\tau}\bigr)\qquad U_C(t) = U_0\bigl(1 - e^{-t/\tau}\bigr)$$</li>
<li><b>Strom</b> = Ableitung: $I = \dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dfrac{Q_0}{\tau}\,e^{-t/\tau}$. Wegen $\dfrac{Q_0}{\tau} = \dfrac{C U_0}{RC} = \dfrac{U_0}{R}$ gilt
$$I(t) = \dfrac{U_0}{R}\,e^{-t/\tau}$$</li>
</ol>
<p><b>Probe:</b> Bei $t=0$ ist $Q = Q_0(1-1) = 0$ ✓. Für $t\to\infty$ geht $e^{-t/\tau}\to 0$, also $Q\to Q_0$ ✓. Ableiten bestätigt $\dfrac{Q_0 - Q}{\tau}$ ✓.</p>

<h3>6 · Was ist $\tau = R\cdot C$?</h3>
<ul>
<li><b>Einheit:</b> $\Omega\cdot\mathrm{F} = \dfrac{\mathrm{V}}{\mathrm{A}}\cdot\dfrac{\mathrm{C}}{\mathrm{V}} = \dfrac{\mathrm{C}}{\mathrm{A}} = \mathrm{s}$. Es ist eine Zeit.</li>
<li>Setze $t = \tau$ ein: $e^{-1}\approx 0{,}37$. Entladen: noch 37 % übrig. Aufladen: $1 - 0{,}37 = 63\,\%$ erreicht.</li>
<li>Nach $2\tau$: $e^{-2}\approx 13{,}5\,\%$, nach $3\tau$: $5\,\%$, nach $5\tau$: $0{,}7\,\%$ (praktisch fertig).</li>
<li>Halbwertszeit: $e^{-t/\tau} = \dfrac{1}{2}$ ergibt $t_{1/2} = \tau\ln 2 \approx 0{,}69\,\tau$.</li>
</ul>
<p><b>Zahlenbeispiel:</b> $R = 10\,\mathrm{k\Omega}$, $C = 100\,\mu\mathrm{F}$ ergibt $\tau = 10^4\cdot 10^{-4} = 1\,\mathrm{s}$. Aufgeladen auf $U_0 = 9\,\mathrm{V}$: nach $1\,\mathrm{s}$ sind es $5{,}7\,\mathrm{V}$, nach $3\,\mathrm{s}$ schon $8{,}55\,\mathrm{V}$.</p>

<h3>Das Rezept zum Merken</h3>
<ol>
<li><b>Skizze</b> mit $R$, $C$, Quelle bzw. Schalter.</li>
<li><b>Maschenregel</b> hinschreiben.</li>
<li>$U_R = R\,I$, $U_C = Q/C$, $I = \mathrm{d}Q/\mathrm{d}t$ <b>einsetzen</b>.</li>
<li>Auf die Form $\dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dots$ <b>umstellen</b> ($\tau = RC$ erkennen).</li>
<li><b>Variablen trennen</b> und beidseitig integrieren, Grenzen aus der Anfangsbedingung.</li>
<li>Mit $e$ <b>auflösen</b>, dann <b>Probe</b>: ableiten und $t=0$ prüfen.</li>
</ol>
<div class="hint">Typische Fehler: Vorzeichen bei $\mathrm{d}Q/\mathrm{d}t$ vergessen. Beim Aufladen das Minus vor dem $\ln$ verlieren. $\tau$ mit falschen Einheiten ($\mu\mathrm{F}$, $\mathrm{k\Omega}$ umrechnen!). Die Anfangsbedingung nicht einsetzen.</div>

<h3>Das musst du können</h3>
<ul class="check"><li>Beide Dgl. mit der Maschenregel selbst aufstellen.</li><li>Die Variablentrennung samt Integrationsgrenzen vorrechnen.</li><li>Die Probe durch Ableiten machen.</li><li>$\tau$ erklären und $37\,\%$, $63\,\%$ begründen.</li></ul>`, ["rc"]);

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
`);

  window.PHYS_SHEETS = S;
})();
