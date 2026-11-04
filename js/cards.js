/* Physik Q1 – Elektrisches Feld: alle Karten.
   Formeln: KaTeX-Syntax in $...$ (inline) bzw. $$...$$ (abgesetzt).
   String.raw, damit Backslashes nicht verschluckt werden. */
(function () {
  const R = String.raw;

  // ---------------------------------------------------------------- Themen
  const TOPICS = [
    { id: "groessen",   title: "Größen & Einheiten",              sub: "Symbol, SI-Einheit, Formel" },
    { id: "influenz",   title: "Influenz",                        sub: "Ladungstrennung in Leitern" },
    { id: "polar",      title: "Polarisation",                    sub: "Dielektrika, Dipole" },
    { id: "feldlinien", title: "Feldlinienbilder",                sub: "Zeichnen & interpretieren" },
    { id: "spitze",     title: "Spitzeneffekt & Faraday-Käfig",   sub: "Leiter im Feld" },
    { id: "kraft",      title: "Feldstärke, Kraft & Coulomb",     sub: "F = E·Q, radialsymmetrisch" },
    { id: "kondensator",title: "Kondensator & Plattenkondensator",sub: "E = U/d, Q = C·U, C = ε₀εᵣA/d" },
    { id: "schaltung",  title: "Reihen- & Parallelschaltung",     sub: "Ersatzkapazität" },
    { id: "ladung",     title: "Auf- und Entladung",              sub: "Differenzialgleichung, τ = R·C" },
    { id: "millikan",   title: "Millikan-Versuch",                sub: "Schwebemethode, Elementarladung" },
    { id: "klausur",    title: "Messwerte & Diagramme",           sub: "Tabelle, Mittelwert, Diagramm" }
  ];

  const cards = [];
  let n = 0;
  // Standardkarte: Frage / Antwort (+ optionales Diagramm auf der Rückseite)
  function Q(topic, front, back, opt) {
    n += 1;
    cards.push(Object.assign({ id: topic + "-" + n, topic, type: "qa", front, back }, opt || {}));
  }
  // Größenkarte: Name -> Symbol, Einheit (klickbar), Formel
  function G(name, symbol, unit, unitInfo, formula, extra) {
    n += 1;
    cards.push({ id: "groessen-" + n, topic: "groessen", type: "size",
      front: name, symbol, unit, unitInfo, formula, extra: extra || "" });
  }

  // ============================================================ GRÖSSEN
  G("Elektrische Spannung", R`$U$`, R`Volt ($\mathrm{V}$)`,
    R`$1\,\mathrm{V} = 1\,\dfrac{\mathrm{J}}{\mathrm{C}} = 1\,\dfrac{\mathrm{W}}{\mathrm{A}}$`,
    R`$U = \dfrac{W}{Q}$`, R`Arbeit pro Ladung. Im Plattenkondensator: $U = E\cdot d$.`);
  G("Elektrische Kapazität", R`$C$`, R`Farad ($\mathrm{F}$)`,
    R`$1\,\mathrm{F} = 1\,\dfrac{\mathrm{C}}{\mathrm{V}} = 1\,\dfrac{\mathrm{A}\cdot\mathrm{s}}{\mathrm{V}}$`,
    R`$C = \dfrac{Q}{U} = \varepsilon_0\varepsilon_r\dfrac{A}{d}$`, "Wie viel Ladung pro Volt gespeichert wird.");
  G("Elektrische Ladung", R`$Q$ (oder $q$)`, R`Coulomb ($\mathrm{C}$)`,
    R`$1\,\mathrm{C} = 1\,\mathrm{A}\cdot\mathrm{s}$`,
    R`$Q = I\cdot t$`, R`Elementarladung $e = 1{,}602\cdot10^{-19}\,\mathrm{C}$.`);
  G("Elektrischer Widerstand", R`$R$`, R`Ohm ($\Omega$)`,
    R`$1\,\Omega = 1\,\dfrac{\mathrm{V}}{\mathrm{A}}$`,
    R`$R = \dfrac{U}{I}$`);
  G("Elektrische Stromstärke", R`$I$`, R`Ampere ($\mathrm{A}$)`,
    R`Basiseinheit des SI-Systems`,
    R`$I = \dfrac{\mathrm{d}Q}{\mathrm{d}t}$`, R`Bei konstantem Strom: $I = \dfrac{Q}{t}$.`);
  G("Elektrische Kraft (Coulomb-Kraft)", R`$F_{\mathrm{el}}$ (oder $F$)`, R`Newton ($\mathrm{N}$)`,
    R`$1\,\mathrm{N} = 1\,\dfrac{\mathrm{kg}\cdot\mathrm{m}}{\mathrm{s}^2}$`,
    R`$F_{\mathrm{el}} = E\cdot Q$ &nbsp;bzw.&nbsp; $F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1 Q_2}{r^2}$`);
  G("Elektrische Feldstärke", R`$E$`, R`Volt pro Meter ($\dfrac{\mathrm{V}}{\mathrm{m}}$)`,
    R`$1\,\dfrac{\mathrm{V}}{\mathrm{m}} = 1\,\dfrac{\mathrm{N}}{\mathrm{C}}$`,
    R`$E = \dfrac{F}{Q}$ &nbsp;und im Plattenkondensator&nbsp; $E = \dfrac{U}{d}$`);
  G("Elektrische Energie (im Kondensator)", R`$W_{\mathrm{el}}$ (oder $E_{\mathrm{el}}$)`, R`Joule ($\mathrm{J}$)`,
    R`$1\,\mathrm{J} = 1\,\mathrm{V}\cdot\mathrm{A}\cdot\mathrm{s} = 1\,\mathrm{N}\cdot\mathrm{m}$`,
    R`$W_{\mathrm{el}} = \dfrac{1}{2}CU^2 = \dfrac{1}{2}QU = \dfrac{Q^2}{2C}$`);
  G("Flächenladungsdichte", R`$\sigma$ (Sigma)`, R`Coulomb pro Quadratmeter ($\dfrac{\mathrm{C}}{\mathrm{m}^2}$)`,
    R`$1\,\dfrac{\mathrm{C}}{\mathrm{m}^2} = 1\,\dfrac{\mathrm{A}\cdot\mathrm{s}}{\mathrm{m}^2}$`,
    R`$\sigma = \dfrac{Q}{A}$`, R`Zusammenhang mit dem Feld: $E = \dfrac{\sigma}{\varepsilon_0}$.`);
  G("Zeitkonstante", R`$\tau$ (Tau)`, R`Sekunde ($\mathrm{s}$)`,
    R`Basiseinheit; Probe: $\Omega\cdot\mathrm{F} = \dfrac{\mathrm{V}}{\mathrm{A}}\cdot\dfrac{\mathrm{A}\cdot\mathrm{s}}{\mathrm{V}} = \mathrm{s}$`,
    R`$\tau = R\cdot C$`, "Nach der Zeit τ ist die Spannung beim Entladen auf rund 37 % gefallen.");
  G("Elektrische Feldkonstante", R`$\varepsilon_0$`, R`Farad pro Meter ($\dfrac{\mathrm{F}}{\mathrm{m}}$)`,
    R`$1\,\dfrac{\mathrm{F}}{\mathrm{m}} = 1\,\dfrac{\mathrm{A}\cdot\mathrm{s}}{\mathrm{V}\cdot\mathrm{m}}$`,
    R`$\varepsilon_0 = 8{,}854\cdot10^{-12}\,\dfrac{\mathrm{F}}{\mathrm{m}}$`,
    R`Es gilt $\dfrac{1}{4\pi\varepsilon_0} \approx 8{,}99\cdot10^{9}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$.`);
  G("Permittivitätszahl (Dielektrizitätszahl)", R`$\varepsilon_r$`, R`einheitenlos ( – )`,
    R`Verhältnisgröße (Zahl ≥ 1; Vakuum: $\varepsilon_r = 1$)`,
    R`$\varepsilon_r = \dfrac{C_{\mathrm{mit}}}{C_{\mathrm{Vakuum}}}$`, "Ein Dielektrikum vergrößert C um den Faktor εᵣ.");
  G("Elementarladung", R`$e$`, R`Coulomb ($\mathrm{C}$)`,
    R`$1\,\mathrm{C} = 1\,\mathrm{A}\cdot\mathrm{s}$`,
    R`$e = 1{,}602\cdot10^{-19}\,\mathrm{C}$`, "Kleinste frei vorkommende Ladung. Bestimmt im Millikan-Versuch.");

  // ============================================================ INFLUENZ
  Q("influenz", "Was ist <b>Influenz</b>?",
    R`<p><b>Ladungstrennung in einem Leiter durch ein äußeres elektrisches Feld</b> (ohne Berührung).</p>
      <ul><li>Die frei beweglichen Elektronen im Leiter werden verschoben.</li>
      <li>Seite <b>zum</b> geladenen Körper: <b>ungleichnamige</b> Ladung.</li>
      <li>Seite <b>vom</b> Körper weg: <b>gleichnamige</b> Ladung.</li>
      <li>Insgesamt bleibt der Leiter <b>neutral</b>.</li></ul>`);
  Q("influenz", "Eine neutrale Metallkugel wird durch einen negativ geladenen Stab aufgeladen, ohne dass der Stab sie berührt. Wie funktioniert das (Ablauf)?",
    R`<ol><li>Stab nähern: Elektronen werden abgestoßen → nahe Seite <b>+</b>, ferne Seite <b>−</b>.</li>
      <li>Kugel <b>erden</b>: Überschuss-Elektronen fließen ab.</li>
      <li><b>Erdung entfernen</b> (Stab noch da!).</li>
      <li>Stab entfernen → die Kugel ist <b>positiv</b> geladen (ungleichnamig zum Stab).</li></ol>`);
  Q("influenz", "Wie groß ist das Feld im Inneren eines Leiters (statisch) und warum?",
    R`<p>$E = 0$ im Inneren.</p>
      <p>Die Influenzladungen erzeugen ein <b>Gegenfeld</b>, das das äußere Feld genau aufhebt. Sonst würden die freien Ladungen weiterwandern, bis das Gleichgewicht erreicht ist.</p>`);
  Q("influenz", "Warum schlägt ein Elektroskop schon bei Annäherung eines geladenen Stabes aus (ohne Berührung)?",
    R`<p>Durch <b>Influenz</b>: Ladungen werden in Zeiger und Stiel verschoben. Beide tragen dann <b>gleichnamige</b> Ladung und stoßen sich ab.</p>
      <p>Entfernt man den Stab, geht der Ausschlag zurück (Gesamtladung blieb 0).</p>`);
  Q("influenz", "Wie unterscheidet sich Aufladen durch <b>Influenz</b> von Aufladen durch <b>Berührung</b>?",
    R`<ul><li><b>Berührung:</b> Ladung geht über, der Körper erhält die <b>gleichnamige</b> Ladung.</li>
      <li><b>Influenz:</b> keine Berührung, nach Erdung erhält der Körper die <b>ungleichnamige</b> Ladung.</li></ul>`);

  // ============================================================ POLARISATION
  Q("polar", "Was ist <b>Polarisation</b> (im Gegensatz zur Influenz)?",
    R`<p>Verhalten von <b>Isolatoren (Dielektrika)</b> im elektrischen Feld. Es gibt keine frei beweglichen Ladungen.</p>
      <ul><li><b>Verschiebungspolarisation:</b> Elektronenhülle und Kern verschieben sich leicht, das Atom wird zum Dipol.</li>
      <li><b>Orientierungspolarisation:</b> vorhandene Dipole (z. B. Wasser) richten sich im Feld aus.</li></ul>
      <p>An der Oberfläche entstehen gebundene Polarisationsladungen.</p>`);
  Q("polar", "<b>Influenz vs. Polarisation</b>: Was ist der Unterschied?",
    R`<table class="cmp"><tr><th></th><th>Influenz</th><th>Polarisation</th></tr>
      <tr><td>Material</td><td>Leiter (Metall)</td><td>Isolator</td></tr>
      <tr><td>Ladungen</td><td><b>frei</b> beweglich</td><td><b>gebunden</b>, nur verschoben/ausgerichtet</td></tr>
      <tr><td>Trennbar?</td><td>Ja (z. B. durch Erden)</td><td>Nein</td></tr></table>`);
  Q("polar", "Warum werden kleine Papierschnipsel von einem geladenen Stab angezogen?",
    R`<p>Das Papier wird <b>polarisiert</b>. Die dem Stab zugewandte Seite trägt die ungleichnamige Ladung.</p>
      <p>Das Feld des Stabes ist nahe am Stab <b>stärker</b> (inhomogen). Die Anziehung der nahen Ladung überwiegt die Abstoßung der fernen → <b>Netto-Anziehung</b>.</p>`);
  Q("polar", "Was bewirkt ein <b>Dielektrikum</b> zwischen Kondensatorplatten?",
    R`<p>Polarisationsladungen schwächen das Feld im Dielektrikum: $E = \dfrac{E_0}{\varepsilon_r}$.</p>
      <ul><li>Bei <b>gleicher Spannung</b>: $C$ steigt um den Faktor $\varepsilon_r$, es passt mehr Ladung drauf.</li>
      <li>Bei <b>gleicher Ladung</b> (Quelle getrennt): $U$ sinkt auf $U_0/\varepsilon_r$.</li></ul>`);

  // ============================================================ FELDLINIEN
  Q("feldlinien", "Welche <b>Eigenschaften</b> haben elektrische Feldlinien?",
    R`<ul><li>Sie verlaufen von <b>+</b> nach <b>−</b> (Quellenfeld, <b>nicht geschlossen</b>).</li>
      <li>Die <b>Tangente</b> zeigt die Kraftrichtung auf eine <b>positive</b> Probeladung.</li>
      <li>Sie <b>schneiden sich nie</b>.</li>
      <li><b>Dichte</b> der Linien = <b>Stärke</b> des Feldes.</li>
      <li>Sie stehen <b>senkrecht</b> auf Leiteroberflächen.</li></ul>`);
  Q("feldlinien", "Zeichne das Feldlinienbild einer <b>positiven Punktladung</b>.",
    R`<p>Radial nach <b>außen</b>, Linien werden mit dem Abstand weniger dicht ($E \sim 1/r^2$).</p>`, { diagram: "pos" });
  Q("feldlinien", "Zeichne das Feldlinienbild einer <b>negativen Punktladung</b>.",
    R`<p>Radial nach <b>innen</b> (Pfeile zeigen zur Ladung hin).</p>`, { diagram: "neg" });
  Q("feldlinien", "Zeichne das Feldlinienbild eines <b>Dipols</b> (+ und − nebeneinander).",
    R`<p>Linien laufen von + zu −. Zwischen den Ladungen ist das Feld am <b>dichtesten</b> (stärksten) und zeigt von + nach −.</p>`, { diagram: "dipole" });
  Q("feldlinien", "Zeichne das Feldlinienbild zweier <b>gleichnamiger</b> Ladungen (+ und +).",
    R`<p>Die Linien <b>stoßen sich ab</b> und biegen auseinander. In der Mitte liegt ein <b>neutraler Punkt</b> mit $E = 0$.</p>`, { diagram: "pospos" });
  Q("feldlinien", "Zeichne das Feldlinienbild eines <b>Plattenkondensators</b>. Wo ist das Feld homogen?",
    R`<p>Zwischen den Platten: <b>parallele, gleich weit entfernte</b> Linien (senkrecht zu den Platten) → <b>homogen</b>.</p>
      <p>Am Rand wölben sich die Linien nach außen (Streufeld, inhomogen).</p>`, { diagram: "plates" });
  Q("feldlinien", "Wie <b>interpretiert</b> man ein Feldlinienbild? (Stärke, Richtung, Ladungen)",
    R`<ul><li><b>Wo sind die Linien dicht?</b> → dort ist $E$ groß.</li>
      <li><b>Parallel und gleich weit?</b> → homogenes Feld.</li>
      <li><b>Wo starten Linien?</b> → positive Ladung. <b>Wo enden sie?</b> → negative Ladung.</li>
      <li><b>Pfeilrichtung</b> = Kraftrichtung auf eine positive Probeladung. Eine negative Ladung erfährt die Kraft <b>entgegen</b> der Pfeilrichtung.</li>
      <li>Linien <b>laufen auseinander</b> → Feld wird schwächer.</li></ul>`);
  Q("feldlinien", "Was bedeutet ein Punkt, an dem keine Feldlinie vorbeiführt? Gibt es dort kein Feld?",
    R`<p>Nein. Feldlinien sind nur ein <b>Modell</b>. Das Feld ist überall im Raum vorhanden. Die Linien zeigen nur ausgewählte Richtungen, und ihre Dichte zeigt die Stärke.</p>
      <p>Echte Ausnahme: der <b>neutrale Punkt</b> ($E = 0$), z. B. zwischen zwei gleichen Ladungen.</p>`);

  // ============================================================ SPITZENEFFEKT / FARADAY
  Q("spitze", "Was ist der <b>Spitzeneffekt</b>?",
    R`<p>Auf einem geladenen Leiter sammelt sich die Ladung an Stellen mit <b>starker Krümmung</b> (Spitzen, Kanten).</p>
      <ul><li>Dort ist die Flächenladungsdichte $\sigma$ groß → $E = \dfrac{\sigma}{\varepsilon_0}$ ist groß.</li>
      <li>Die Luft wird ionisiert → <b>Spitzenentladung</b> / Korona („elektrischer Wind“).</li></ul>
      <p>Anwendungen: <b>Blitzableiter</b>, Entladestäbchen am Flugzeug. Vermeiden: Hochspannungsteile werden <b>rund</b> gebaut.</p>`, { diagram: "tip" });
  Q("spitze", "Warum ist das Feld an einer Spitze besonders stark?",
    R`<p>Auf der Spitze ist die Fläche klein, die Ladung drängt sich dort zusammen: $\sigma = \dfrac{Q}{A}$ groß.</p>
      <p>Die Feldlinien stehen senkrecht auf der Oberfläche und laufen an der Spitze <b>eng zusammen</b> → hohe Feldliniendichte → große Feldstärke.</p>`);
  Q("spitze", "Was ist ein <b>Faradayscher Käfig</b> und was bewirkt er?",
    R`<p>Eine geschlossene <b>leitende Hülle</b> (auch ein Drahtgitter) schirmt das Innere gegen äußere elektrische Felder ab.</p>
      <ul><li>Im Inneren ist $E = 0$.</li>
      <li>Influenzladungen an der Außenwand heben das Außenfeld im Inneren auf.</li>
      <li>Die Feldlinien enden <b>senkrecht</b> auf der Außenseite.</li></ul>`, { diagram: "faraday" });
  Q("spitze", "Nenne Beispiele für den Faradayschen Käfig.",
    R`<ul><li><b>Auto / Flugzeug:</b> Bei einem Blitz bleibt die Ladung auf der Außenhaut, die Insassen sind geschützt.</li>
      <li><b>Mikrowellengerät</b> (Gitter in der Tür).</li>
      <li><b>Koaxialkabel</b> (Abschirmung).</li>
      <li><b>Aufzug</b>, schlechter Handyempfang darin.</li></ul>`);
  Q("spitze", "Warum stehen Feldlinien <b>senkrecht</b> auf einer Leiteroberfläche?",
    R`<p>Hätte das Feld eine Komponente <b>entlang</b> der Oberfläche, würden die freien Ladungen wandern, bis diese Komponente verschwindet.</p>
      <p>Im statischen Gleichgewicht bleibt nur die Senkrechtkomponente. Die Leiteroberfläche ist eine <b>Äquipotenzialfläche</b>.</p>`);

  // ============================================================ KRAFT / COULOMB
  Q("kraft", "Wie groß ist die Kraft auf eine Ladung $Q$ im elektrischen Feld $E$? Welche Richtung hat sie?",
    R`<p>$$F = E\cdot Q$$</p>
      <ul><li><b>Positive</b> Ladung: Kraft in Feldrichtung.</li>
      <li><b>Negative</b> Ladung: Kraft <b>entgegen</b> der Feldrichtung.</li></ul>
      <p>Umgestellt (Definition der Feldstärke): $E = \dfrac{F}{Q}$, Einheit $\dfrac{\mathrm{N}}{\mathrm{C}} = \dfrac{\mathrm{V}}{\mathrm{m}}$.</p>`);
  Q("kraft", "Formuliere das <b>Coulomb-Gesetz</b>.",
    R`<p>$$F = \dfrac{1}{4\pi\varepsilon_0}\cdot\dfrac{Q_1\cdot Q_2}{r^2}$$</p>
      <ul><li><b>Gleichnamige</b> Ladungen stoßen sich ab, <b>ungleichnamige</b> ziehen sich an.</li>
      <li>$F \sim Q_1 Q_2$ und $F \sim \dfrac{1}{r^2}$ (Abstand verdoppelt → Kraft ein Viertel).</li>
      <li>$\dfrac{1}{4\pi\varepsilon_0} \approx 8{,}99\cdot10^{9}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$</li></ul>`);
  Q("kraft", "Wie groß ist die Feldstärke einer <b>Punktladung</b> $Q$ im Abstand $r$?",
    R`<p>$$E = \dfrac{1}{4\pi\varepsilon_0}\cdot\dfrac{Q}{r^2}$$</p>
      <p>Herleitung: Setze $F_{\mathrm{Coulomb}}$ in $E = \dfrac{F}{Q_2}$ ein, die Probeladung $Q_2$ kürzt sich.</p>
      <p>Abstand verdoppelt → $E$ viertel.</p>`);
  Q("kraft", "Was bedeutet <b>radialsymmetrisches</b> Feld?",
    R`<p>Das Feld einer Punktladung (oder geladenen Kugel): Die Feldlinien verlaufen <b>radial</b> (strahlenförmig).</p>
      <p>Der Betrag von $E$ hängt <b>nur vom Abstand $r$</b> ab, nicht von der Richtung. Das Feld ist <b>inhomogen</b>: es wird nach außen schwächer ($\sim 1/r^2$).</p>`, { diagram: "pos" });
  Q("kraft", "Was bedeutet <b>homogenes</b> Feld? Wo kommt es vor?",
    R`<p><b>Homogen = überall gleich</b> (gleicher Betrag <b>und</b> gleiche Richtung).</p>
      <p>Feldlinien: parallel und gleich weit entfernt. Vorkommen: <b>zwischen den Platten eines Plattenkondensators</b> (ohne Randbereich).</p>`, { diagram: "plates" });
  Q("kraft", "Wie hängen <b>Coulomb-Gesetz</b> und $F = E\\cdot Q$ zusammen?",
    R`<p>$F = E\cdot Q_2$ mit dem Feld der Punktladung $Q_1$:</p>
      <p>$$F = \underbrace{\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1}{r^2}}_{E\ \text{von } Q_1}\cdot Q_2$$</p>
      <p>Das Coulomb-Gesetz ist also $F = E\cdot Q$ für das Feld einer Punktladung.</p>`);
  Q("kraft", "Wie berechnet man die <b>Beschleunigung</b> eines Elektrons im homogenen Feld?",
    R`<p>$F = e\cdot E$ und $F = m\cdot a$, also</p>
      <p>$$a = \dfrac{e\cdot E}{m_e}$$</p>
      <p>mit $e = 1{,}602\cdot10^{-19}\,\mathrm{C}$ und $m_e = 9{,}109\cdot10^{-31}\,\mathrm{kg}$. Die Schwerkraft ist dagegen vernachlässigbar.</p>`);

  // ============================================================ KONDENSATOR
  Q("kondensator", "Was ist ein <b>Kondensator</b> und wie groß ist das Feld im <b>Plattenkondensator</b>?",
    R`<p>Ein Kondensator <b>speichert Ladung</b> (und Energie) auf zwei gegenüberliegenden Leitern.</p>
      <p>Zwischen den Platten (Abstand $d$, Spannung $U$) ist das Feld <b>homogen</b>:</p>
      <p>$$E = \dfrac{U}{d}$$</p>`, { diagram: "plates" });
  Q("kondensator", "Warum gilt $E = \\dfrac{U}{d}$? (Herleitung)",
    R`<p>Verschiebt man die Ladung $Q$ um den Abstand $d$, wird die Arbeit verrichtet:</p>
      <p>$$W = F\cdot d = E\cdot Q\cdot d \quad\text{und}\quad W = Q\cdot U$$</p>
      <p>Gleichsetzen und durch $Q$ teilen: $U = E\cdot d \;\Rightarrow\; E = \dfrac{U}{d}$.</p>`);
  Q("kondensator", "Wie hängt die Feldstärke im Plattenkondensator mit der <b>Flächenladungsdichte</b> $\\sigma$ und der Ladung $Q$ zusammen?",
    R`<p>$$E = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0\cdot A}$$</p>
      <p>Mit Dielektrikum: $E = \dfrac{Q}{\varepsilon_0\varepsilon_r A}$.</p>
      <p class="note">⚠ In deinen Notizen steht „$E = \varepsilon_0\cdot\sigma$“. Richtig ist $E = \sigma/\varepsilon_0$ (die Einheiten passen nur so: $\dfrac{\mathrm{C/m^2}}{\mathrm{F/m}} = \dfrac{\mathrm{V}}{\mathrm{m}}$).</p>`);
  Q("kondensator", "Was besagt $Q = C\\cdot U$?",
    R`<p>Die gespeicherte Ladung ist <b>proportional zur Spannung</b>. Die Konstante $C$ ist die <b>Kapazität</b>.</p>
      <p>$$C = \dfrac{Q}{U}$$</p>
      <p>„Wie groß ist der Kondensator?“ → wie viel Ladung pro Volt er aufnimmt. Einheit: $1\,\mathrm{F} = 1\,\dfrac{\mathrm{C}}{\mathrm{V}}$.</p>`);
  Q("kondensator", "Wie lautet die Kapazität des <b>Plattenkondensators</b>?",
    R`<p>$$C = \varepsilon_0\cdot\varepsilon_r\cdot\dfrac{A}{d}$$</p>
      <ul><li>Plattenfläche $A$ verdoppeln → $C$ doppelt.</li>
      <li>Abstand $d$ verdoppeln → $C$ halbiert.</li>
      <li>Dielektrikum → $C$ mal $\varepsilon_r$.</li></ul>`);
  Q("kondensator", "Leite $C = \\varepsilon_0\\dfrac{A}{d}$ aus $C = \\dfrac{Q}{U}$ her.",
    R`<p>Mit $Q = \sigma\cdot A$ und $U = E\cdot d = \dfrac{\sigma}{\varepsilon_0}\cdot d$:</p>
      <p>$$C = \dfrac{Q}{U} = \dfrac{\sigma A}{\dfrac{\sigma d}{\varepsilon_0}} = \varepsilon_0\dfrac{A}{d}$$</p>`);
  Q("kondensator", "Wie groß ist die <b>Energie</b> eines geladenen Kondensators?",
    R`<p>$$W = \dfrac{1}{2}CU^2 = \dfrac{1}{2}QU = \dfrac{Q^2}{2C}$$</p>
      <p>Der Faktor $\frac12$ kommt daher, dass die Spannung beim Laden von 0 auf $U$ steigt (Fläche unter der Geraden im $Q$-$U$-Diagramm).</p>`);
  Q("kondensator", "Ein geladener Kondensator wird von der Quelle <b>getrennt</b> ($Q$ konstant) und der Plattenabstand verdoppelt. Was passiert mit $C$, $U$, $E$?",
    R`<ul><li>$C$ halbiert sich (da $C \sim 1/d$).</li>
      <li>$U = Q/C$ verdoppelt sich.</li>
      <li>$E = \sigma/\varepsilon_0$ bleibt <b>gleich</b> (σ unverändert).</li>
      <li>Die Energie steigt (Arbeit gegen die Anziehung der Platten).</li></ul>`);
  Q("kondensator", "Derselbe Kondensator bleibt an der Quelle <b>angeschlossen</b> ($U$ konstant) und der Abstand wird verdoppelt. Was passiert?",
    R`<ul><li>$C$ halbiert sich.</li>
      <li>$Q = C\cdot U$ halbiert sich (Ladung fließt ab).</li>
      <li>$E = U/d$ halbiert sich.</li></ul>`);

  // ============================================================ SCHALTUNG
  Q("schaltung", "<b>Parallelschaltung</b> von Kondensatoren: Ersatzkapazität, Spannung, Ladung?",
    R`<p>$$C_{\mathrm{ges}} = C_1 + C_2 + \dots$$</p>
      <ul><li>Gleiche Spannung an allen: $U = U_1 = U_2$.</li>
      <li>Ladungen addieren sich: $Q = Q_1 + Q_2$.</li>
      <li>Wie eine größere Plattenfläche → $C$ <b>wächst</b>.</li></ul>`);
  Q("schaltung", "<b>Reihenschaltung</b> von Kondensatoren: Ersatzkapazität, Spannung, Ladung?",
    R`<p>$$\dfrac{1}{C_{\mathrm{ges}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2} + \dots$$</p>
      <ul><li>Gleiche Ladung auf allen: $Q = Q_1 = Q_2$.</li>
      <li>Spannungen addieren sich: $U = U_1 + U_2$.</li>
      <li>$C_{\mathrm{ges}}$ ist <b>kleiner als die kleinste</b> Einzelkapazität (wie größerer Abstand).</li></ul>`);
  Q("schaltung", "Zwei Kondensatoren in Reihe: Kurzformel? Und wie teilt sich die Spannung auf?",
    R`<p>$$C_{\mathrm{ges}} = \dfrac{C_1\cdot C_2}{C_1 + C_2}$$</p>
      <p>Wegen $Q$ gleich gilt $U_1 : U_2 = \dfrac{1}{C_1} : \dfrac{1}{C_2}$. Am <b>kleineren</b> Kondensator liegt die <b>größere</b> Spannung.</p>`);
  Q("schaltung", "Eselsbrücke: Vergleich <b>Kondensator ↔ Widerstand</b> bei Reihen- und Parallelschaltung?",
    R`<p>Bei Kondensatoren ist es <b>umgekehrt</b> wie bei Widerständen:</p>
      <table class="cmp"><tr><th></th><th>Kondensator</th><th>Widerstand</th></tr>
      <tr><td>Parallel</td><td>$C$ addieren</td><td>$1/R$ addieren</td></tr>
      <tr><td>Reihe</td><td>$1/C$ addieren</td><td>$R$ addieren</td></tr></table>`);

  // ============================================================ AUF-/ENTLADUNG
  Q("ladung", "Wie lautet die <b>Differenzialgleichung der Entladung</b> und was ist ihre Lösung?",
    R`<p>Maschenregel: $U_C + U_R = 0$, also $\dfrac{Q}{C} + R\cdot\dfrac{\mathrm{d}Q}{\mathrm{d}t} = 0$.</p>
      <p>$$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = -\dfrac{1}{RC}\,Q$$</p>
      <p>Trennung der Variablen: $\dfrac{\mathrm{d}Q}{Q} = -\dfrac{\mathrm{d}t}{\tau}$ → $\ln Q = -\dfrac{t}{\tau} + c$:</p>
      <p>$$Q(t) = Q_0\,e^{-t/\tau}$$</p>
      <p>$$U(t) = U_0\,e^{-t/\tau}\qquad I(t) = I_0\,e^{-t/\tau}$$</p>`);
  Q("ladung", "Wie lautet die <b>Differenzialgleichung der Aufladung</b> und was ist ihre Lösung?",
    R`<p>Maschenregel: $U_0 = U_R + U_C = R\dfrac{\mathrm{d}Q}{\mathrm{d}t} + \dfrac{Q}{C}$.</p>
      <p>Mit $Q_0 = C\cdot U_0$ (Endladung):</p>
      <p>$$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dfrac{Q_0 - Q}{\tau}$$</p>
      <p>Lösung:</p>
      <p>$$Q(t) = Q_0\bigl(1 - e^{-t/\tau}\bigr)$$</p>
      <p>$$U_C(t) = U_0\bigl(1 - e^{-t/\tau}\bigr)$$</p>
      <p>$$I(t) = \dfrac{U_0}{R}\,e^{-t/\tau}$$</p>`);
  Q("ladung", "Was bedeutet die <b>Zeitkonstante</b> $\\tau = R\\cdot C$?",
    R`<ul><li>Beim <b>Entladen</b>: nach $t = \tau$ ist $U$ auf $\dfrac{1}{e} \approx 37\,\%$ gefallen.</li>
      <li>Beim <b>Aufladen</b>: nach $t = \tau$ sind $63\,\%$ von $U_0$ erreicht.</li>
      <li>Nach $5\tau$ sind ca. $99{,}3\,\%$ erreicht (praktisch fertig).</li>
      <li>Die <b>Tangente bei $t = 0$</b> schneidet die Endlinie bei $t = \tau$.</li>
      <li>Größeres $R$ oder $C$ → langsamer.</li></ul>`, { diagram: "rc" });
  Q("ladung", "Zeichne und beschrifte die $U(t)$-Kurven für Auf- und Entladung.",
    R`<p>Aufladen: steigt, nähert sich $U_0$ (63 % bei $\tau$). Entladen: fällt von $U_0$ auf 0 (37 % bei $\tau$).</p>
      <p>Beide Kurven laufen an die Achse bzw. an $U_0$ heran, <b>erreichen sie aber nie</b>.</p>`, { diagram: "rc" });
  Q("ladung", "Wie verhält sich der <b>Strom</b> beim Aufladen?",
    R`<p>Beim Einschalten ist der leere Kondensator wie ein Kurzschluss: $I_0 = \dfrac{U_0}{R}$ (<b>Maximum</b>).</p>
      <p>Dann fällt $I(t) = I_0\,e^{-t/\tau}$ auf 0. Ist der Kondensator voll, fließt kein Strom mehr (wie eine Unterbrechung).</p>`);
  Q("ladung", "Wie lange dauert es, bis ein Kondensator beim Entladen auf die <b>Hälfte</b> abgefallen ist?",
    R`<p>$e^{-t/\tau} = \dfrac{1}{2} \Rightarrow t_{1/2} = \tau\cdot\ln 2 \approx 0{,}69\,\tau$.</p>`);
  Q("ladung", "Wie kann man $\\tau$ aus einer Messreihe $U(t)$ bestimmen?",
    R`<ul><li>$\ln U$ gegen $t$ auftragen: <b>Gerade</b> mit Steigung $m = -\dfrac{1}{\tau}$.</li>
      <li>Oder: Zeit ablesen, bei der $U = 0{,}37\cdot U_0$ ist.</li>
      <li>Oder: Anfangstangente zeichnen, Schnittpunkt mit der $t$-Achse = $\tau$.</li></ul>`);

  // ============================================================ MILLIKAN
  Q("millikan", "Wie ist der <b>Millikan-Versuch</b> aufgebaut?",
    R`<ul><li>Zerstäubte <b>Öltröpfchen</b> fallen zwischen zwei waagerechte Kondensatorplatten (Abstand $d$, einstellbare Spannung $U$).</li>
      <li>Durch Reibung/Strahlung tragen sie Ladung $q$.</li>
      <li>Beobachtung der Tröpfchen mit dem <b>Mikroskop</b>.</li>
      <li>Kräfte: <b>Gewichtskraft</b> nach unten, <b>elektrische Kraft</b> $F_{\mathrm{el}} = E\cdot q$ nach oben.</li>
      <li>Das geht nur bei <b>negativem</b> Tröpfchen und <b>oberer Platte +</b>, denn dann zeigt $F_{\mathrm{el}}$ <b>entgegen</b> der Feldrichtung.</li></ul>`, { diagram: "millikan" });
  Q("millikan", "Wie funktioniert die <b>Schwebemethode</b> und welche Formel gilt?",
    R`<p>Spannung so einstellen, dass das Tröpfchen <b>schwebt</b> (ruht): Kräftegleichgewicht.</p>
      <p>$$F_{\mathrm{el}} = F_G \;\Rightarrow\; q\cdot\dfrac{U}{d} = m\cdot g$$</p>
      <p>$$q = \dfrac{m\cdot g\cdot d}{U}$$</p>
      <p>(Auftrieb in Luft meist vernachlässigt.)</p>`, { diagram: "millikan" });
  Q("millikan", "Was ist das <b>Ergebnis</b> des Millikan-Versuchs?",
    R`<p>Alle gemessenen Ladungen sind <b>ganzzahlige Vielfache</b> einer kleinsten Ladung:</p>
      <p>$$q = n\cdot e,\qquad e = 1{,}602\cdot10^{-19}\,\mathrm{C}$$</p>
      <p>→ <b>Quantelung der Ladung</b>, Bestimmung der <b>Elementarladung</b>.</p>`);
  Q("millikan", "Wie kommt man aus mehreren Messwerten $q_i$ auf $e$?",
    R`<ul><li>Messwerte der Größe nach ordnen, <b>kleinste Differenz</b> bzw. größten gemeinsamen Teiler suchen.</li>
      <li>Jedes $q_i$ durch eine ganze Zahl $n_i$ teilen: $e_i = q_i/n_i$.</li>
      <li>Aus allen $e_i$ den <b>Mittelwert</b> bilden.</li></ul>`);
  Q("millikan", "Wie bestimmt man die <b>Masse</b> des Öltröpfchens?",
    R`<p>Ohne Feld das Sinken beobachten: Bei konstanter Sinkgeschwindigkeit $v$ gilt Gewicht = Stokes-Reibung $6\pi\eta r v$.</p>
      <p>Daraus folgt der Radius $r$ und mit der Öldichte $\rho$:</p>
      <p>$$m = \dfrac{4}{3}\pi r^3\rho$$</p>`);
  Q("millikan", "Welche <b>Fehlerquellen</b> hat der Versuch?",
    R`<ul><li>Verdunstung des Öls (Masse ändert sich).</li>
      <li>Luftströmungen und Temperatur.</li>
      <li>Auftrieb und Reibung (Stokes-Korrektur) vernachlässigt.</li>
      <li>Ungenaue Spannungs- oder Zeitmessung (Reaktionszeit).</li>
      <li>Tröpfchen wechselt beim Beobachten seine Ladung.</li></ul>`);

  // ============================================================ KLAUSUR: MESSWERTE & DIAGRAMME
  Q("klausur", "Wie erstellt man eine <b>Messwerttabelle</b>?",
    R`<ul><li>Überschrift/Spaltenkopf mit <b>Größe, Symbol und Einheit</b>, z. B. $U$ in V, $t$ in s.</li>
      <li>In den Zellen stehen nur <b>Zahlen</b>, Einheit nicht wiederholen.</li>
      <li>Messungen <b>nummerieren</b> (1, 2, 3 …).</li>
      <li>Sinnvolle, <b>einheitliche</b> Nachkommastellen.</li>
      <li>Unten: <b>Mittelwert</b>-Zeile, wenn gemittelt wird.</li></ul>`);
  Q("klausur", "Wie berechnet man den <b>Mittelwert</b>?",
    R`<p>$$\bar{x} = \dfrac{x_1 + x_2 + \dots + x_n}{n} = \dfrac{1}{n}\sum_{i=1}^{n} x_i$$</p>
      <p>Alle Werte addieren und durch die <b>Anzahl</b> teilen. Beim Runden nicht mehr Stellen angeben, als die Messwerte hergeben.</p>`);
  Q("klausur", "Wie wird die <b>Abweichung</b> vom Literaturwert angegeben?",
    R`<p>Absolut:</p>
      <p>$$\Delta x = |x_{\mathrm{mess}} - x_{\mathrm{Lit}}|$$</p>
      <p>Relativ:</p>
      <p>$$\dfrac{\Delta x}{x_{\mathrm{Lit}}}\cdot 100\,\% = \dfrac{|x_{\mathrm{mess}} - x_{\mathrm{Lit}}|}{x_{\mathrm{Lit}}}\cdot 100\,\%$$</p>`);
  Q("klausur", "Worauf musst du beim <b>Diagramm zeichnen</b> achten?",
    R`<ul><li><b>Achsen beschriften:</b> Größe, Symbol, Einheit. Unabhängige Größe (was du veränderst) auf die <b>x-Achse</b>.</li>
      <li><b>Skalierung</b> gleichmäßig und so, dass die Messwerte das Diagramm füllen.</li>
      <li>Messpunkte als <b>Kreuze</b> eintragen.</li>
      <li><b>Ausgleichsgerade/-kurve</b> zeichnen. <b>Nicht</b> Punkt für Punkt verbinden.</li>
      <li>Ursprungsgerade → Proportionalität.</li>
      <li>Titel / Überschrift.</li></ul>`);
  Q("klausur", "Wie bestimmt man die <b>Steigung</b> einer Ausgleichsgeraden?",
    R`<p>Steigungsdreieck an <b>zwei weit auseinanderliegenden Punkten der Geraden</b> (nicht unbedingt Messpunkte):</p>
      <p>$$m = \dfrac{\Delta y}{\Delta x} = \dfrac{y_2 - y_1}{x_2 - x_1}$$</p>
      <p>Einheit der Steigung = Einheit von $y$ geteilt durch Einheit von $x$.</p>`);
  Q("klausur", "Welche physikalische Größe liefert die Steigung im $Q$-$U$-Diagramm eines Kondensators?",
    R`<p>$Q = C\cdot U$ → Gerade durch den Ursprung, Steigung $m = \dfrac{Q}{U} = C$ (die <b>Kapazität</b>).</p>`);
  Q("klausur", "Welche Diagramme/Zusammenhänge sollte man kennen? (Schnellübersicht)",
    R`<table class="cmp"><tr><th>Diagramm</th><th>Verlauf</th><th>Steigung / Fläche</th></tr>
      <tr><td>$Q$ über $U$</td><td>Ursprungsgerade</td><td>Steigung $= C$</td></tr>
      <tr><td>$E$ über $U$ (fest $d$)</td><td>Ursprungsgerade</td><td>Steigung $= 1/d$</td></tr>
      <tr><td>$E$ über $r$ (Punktladung)</td><td>Hyperbel $\sim 1/r^2$</td><td>–</td></tr>
      <tr><td>$C$ über $d$</td><td>Hyperbel $\sim 1/d$</td><td>–</td></tr>
      <tr><td>$U(t)$ Entladung</td><td>$e$-Funktion fallend</td><td>Tangente bei 0 schneidet bei $\tau$</td></tr>
      <tr><td>$\ln U$ über $t$</td><td>Gerade</td><td>Steigung $= -1/\tau$</td></tr>
      <tr><td>$Q$ über $U$</td><td>–</td><td>Fläche $= \frac12 QU = W$</td></tr></table>`);
  Q("klausur", "Formelsammlung: Welche Seiten sind für die Klausur wichtig?",
    R`<p>Laut deiner Notiz: <b>S. 23, S. 24, S. 25 und S. 27</b>.</p>
      <p>Übe, jede Formel dort schnell zu finden und den Größen die richtigen Einheiten zuzuordnen. Die Formelsammlung ist zugelassen, die <b>Herleitungen und das Verständnis</b> nicht.</p>`);

  // ============================================================ RECHENAUFGABEN
  function Calc(front, back) { Q("rechnen", front, back, { calc: true }); }

  Calc(R`<b>Coulomb-Kraft.</b> $Q_1 = 2{,}0\,\mu\mathrm{C}$, $Q_2 = -3{,}0\,\mu\mathrm{C}$, Abstand $r = 20\,\mathrm{cm}$. Wie groß ist die Kraft und ist sie anziehend oder abstoßend?`,
    R`<p>$$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1 Q_2}{r^2}$$</p>
      <p>$$F = 8{,}99\cdot10^{9}\cdot\dfrac{2{,}0\cdot10^{-6}\cdot3{,}0\cdot10^{-6}}{(0{,}20)^2}\,\mathrm{N}$$</p>
      <p>$$F \approx 1{,}35\,\mathrm{N}$$</p><p><b>Anziehend</b>, da ungleichnamige Ladungen.</p>`);
  Calc(R`<b>Feld einer Punktladung.</b> $Q = 5{,}0\,\mathrm{nC}$. Wie groß ist $E$ im Abstand $r = 3{,}0\,\mathrm{cm}$?`,
    R`<p>$$E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{r^2}$$</p>
      <p>$$E = 8{,}99\cdot10^{9}\cdot\dfrac{5{,}0\cdot10^{-9}}{(0{,}030)^2}\,\tfrac{\mathrm{V}}{\mathrm{m}}$$</p>
      <p>$$E \approx 5{,}0\cdot10^{4}\,\dfrac{\mathrm{V}}{\mathrm{m}}$$</p>`);
  Calc(R`<b>Kraft im Feld.</b> $E = 2{,}0\cdot10^{4}\,\mathrm{N/C}$, $Q = 15\,\mathrm{nC}$. Welche Kraft wirkt?`,
    R`<p>$$F = E\cdot Q = 2{,}0\cdot10^{4}\cdot15\cdot10^{-9}\,\mathrm{N} = 3{,}0\cdot10^{-4}\,\mathrm{N}$$</p>`);
  Calc(R`<b>Plattenkondensator.</b> $U = 400\,\mathrm{V}$, Plattenabstand $d = 2{,}0\,\mathrm{cm}$. Wie groß ist $E$?`,
    R`<p>$$E = \dfrac{U}{d} = \dfrac{400\,\mathrm{V}}{0{,}020\,\mathrm{m}} = 2{,}0\cdot10^{4}\,\dfrac{\mathrm{V}}{\mathrm{m}}$$</p>`);
  Calc(R`<b>Feldstärke aus Ladung.</b> Auf einem Plattenkondensator (Vakuum, $A = 0{,}010\,\mathrm{m^2}$) sitzt $Q = 2{,}0\,\mathrm{nC}$. Wie groß ist $E$?`,
    R`<p>$$E = \dfrac{Q}{\varepsilon_0 A} = \dfrac{2{,}0\cdot10^{-9}}{8{,}854\cdot10^{-12}\cdot0{,}010}\,\dfrac{\mathrm{V}}{\mathrm{m}} \approx 2{,}3\cdot10^{4}\,\dfrac{\mathrm{V}}{\mathrm{m}}$$</p>`);
  Calc(R`<b>Kapazität.</b> Plattenkondensator mit $A = 200\,\mathrm{cm^2}$, $d = 0{,}50\,\mathrm{mm}$, Luft ($\varepsilon_r \approx 1$). Berechne $C$. Wie ändert sich $C$ mit einem Dielektrikum $\varepsilon_r = 5$?`,
    R`<p>$A = 0{,}020\,\mathrm{m^2}$, $d = 5{,}0\cdot10^{-4}\,\mathrm{m}$:</p>
      <p>$$C = \varepsilon_0\dfrac{A}{d} = 8{,}854\cdot10^{-12}\cdot\dfrac{0{,}020}{5{,}0\cdot10^{-4}}\,\mathrm{F}$$</p>
      <p>$$C \approx 3{,}5\cdot10^{-10}\,\mathrm{F} = 354\,\mathrm{pF}$$</p>
      <p>Mit $\varepsilon_r = 5$: $C \approx 1{,}77\,\mathrm{nF}$ (5-mal so groß).</p>`);
  Calc(R`<b>Ladung.</b> Ein Kondensator mit $C = 470\,\mu\mathrm{F}$ wird an $U = 9{,}0\,\mathrm{V}$ geladen. Wie viel Ladung und Energie speichert er?`,
    R`<p>$$Q = C\cdot U = 470\cdot10^{-6}\cdot9{,}0\,\mathrm{C}$$</p>
      <p>$$Q \approx 4{,}2\cdot10^{-3}\,\mathrm{C} = 4{,}2\,\mathrm{mC}$$</p>
      <p>$$W = \dfrac{1}{2}CU^2 = \dfrac{1}{2}\cdot470\cdot10^{-6}\cdot(9{,}0)^2\,\mathrm{J}$$</p>
      <p>$$W \approx 19\,\mathrm{mJ}$$</p>`);
  Calc(R`<b>Reihe und Parallel.</b> $C_1 = 4{,}0\,\mu\mathrm{F}$ und $C_2 = 12\,\mu\mathrm{F}$. Berechne $C_{\mathrm{ges}}$ bei Reihen- und bei Parallelschaltung.`,
    R`<p>Reihe: $C_{\mathrm{ges}} = \dfrac{C_1 C_2}{C_1 + C_2} = \dfrac{4\cdot12}{16}\,\mu\mathrm{F} = 3{,}0\,\mu\mathrm{F}$ (kleiner als $C_1$)</p>
      <p>Parallel: $C_{\mathrm{ges}} = C_1 + C_2 = 16\,\mu\mathrm{F}$</p>`);
  Calc(R`<b>Zeitkonstante.</b> $R = 22\,\mathrm{k\Omega}$, $C = 47\,\mu\mathrm{F}$. Berechne $\tau$ und die Zeit, nach der sich der Kondensator auf die Hälfte von $U_0$ entladen hat.`,
    R`<p>$$\tau = R\cdot C = 22\cdot10^{3}\cdot47\cdot10^{-6}\,\mathrm{s} \approx 1{,}03\,\mathrm{s}$$</p>
      <p>$$t_{1/2} = \tau\ln 2 \approx 0{,}72\,\mathrm{s}$$</p>`);
  Calc(R`<b>Entladung.</b> $U_0 = 12\,\mathrm{V}$, $\tau = 2{,}0\,\mathrm{s}$. Wie groß ist $U$ nach $t = 3{,}0\,\mathrm{s}$?`,
    R`<p>$$U = U_0\,e^{-t/\tau} = 12\,\mathrm{V}\cdot e^{-1{,}5} \approx 2{,}7\,\mathrm{V}$$</p>`);
  Calc(R`<b>Aufladung.</b> $U_0 = 9{,}0\,\mathrm{V}$, $\tau = 0{,}50\,\mathrm{s}$. Wie groß ist $U_C$ nach $t = 1{,}0\,\mathrm{s}$?`,
    R`<p>$$U_C = U_0\bigl(1 - e^{-t/\tau}\bigr)$$</p>
      <p>$$U_C = 9{,}0\,\mathrm{V}\cdot\bigl(1 - e^{-2}\bigr) \approx 7{,}8\,\mathrm{V}$$</p>`);
  Calc(R`<b>Ladung aus Strom.</b> Es fließt $I = 3{,}0\,\mathrm{mA}$ für $t = 20\,\mathrm{s}$. Wie viel Ladung ist geflossen und wie viele Elektronen sind das?`,
    R`<p>$$Q = I\cdot t = 3{,}0\cdot10^{-3}\cdot20\,\mathrm{C} = 0{,}060\,\mathrm{C}$$</p>
      <p>$$N = \dfrac{Q}{e} = \dfrac{0{,}060}{1{,}602\cdot10^{-19}} \approx 3{,}7\cdot10^{17}$$</p>`);
  Calc(R`<b>Elektron im Feld.</b> Ein Elektron befindet sich in einem homogenen Feld $E = 1{,}0\cdot10^{4}\,\mathrm{V/m}$. Wie groß ist seine Beschleunigung?`,
    R`<p>$$a = \dfrac{eE}{m_e} = \dfrac{1{,}602\cdot10^{-19}\cdot1{,}0\cdot10^{4}}{9{,}109\cdot10^{-31}}\,\dfrac{\mathrm{m}}{\mathrm{s}^2} \approx 1{,}8\cdot10^{15}\,\dfrac{\mathrm{m}}{\mathrm{s}^2}$$</p>`);
  Calc(R`<b>Millikan (Schwebemethode).</b> Ein Öltröpfchen mit $m = 3{,}27\cdot10^{-15}\,\mathrm{kg}$ schwebt bei $U = 500\,\mathrm{V}$ zwischen Platten mit $d = 5{,}0\,\mathrm{mm}$. Welche Ladung trägt es? Wie viele Elementarladungen sind das?`,
    R`<p>$$q = \dfrac{m g d}{U}$$</p>
      <p>$$q = \dfrac{3{,}27\cdot10^{-15}\cdot9{,}81\cdot5{,}0\cdot10^{-3}}{500}\,\mathrm{C}$$</p>
      <p>$$q \approx 3{,}2\cdot10^{-19}\,\mathrm{C}$$</p>
      <p>$$n = \dfrac{q}{e} \approx \dfrac{3{,}2\cdot10^{-19}}{1{,}6\cdot10^{-19}} = 2$$</p>
      <p>Das Tröpfchen trägt <b>2 Elementarladungen</b>.</p>`);
  Calc(R`<b>Mittelwert.</b> Aus fünf Auswertungen ergibt sich $e$ (in $10^{-19}\,\mathrm{C}$): 1,55 · 1,63 · 1,60 · 1,58 · 1,64. Berechne den Mittelwert.`,
    R`<p>$$\bar{e} = \dfrac{1{,}55 + 1{,}63 + 1{,}60 + 1{,}58 + 1{,}64}{5}\cdot10^{-19}\,\mathrm{C}$$</p>
      <p>$$\bar{e} = 1{,}60\cdot10^{-19}\,\mathrm{C}$$</p>`);


  // ---------------------------------------------------------------- Metadaten
  // lvl: 1 = leicht (Grundwissen), 2 = mittel, 3 = schwer (Herleitung, Dgl., mehrere Schritte)
  // kind: "abfrage" (Wissen) oder "rechnen" (Rechenaufgabe). Die IDs bleiben gleich, damit Fortschritt erhalten bleibt.
  const LVL = {
    1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:2, 9:2, 10:2, 11:2, 12:2, 13:1,
    14:1, 15:2, 16:2, 17:2, 18:1, 19:1, 20:2, 21:2, 22:2,
    23:1, 24:1, 25:1, 26:2, 27:2, 28:1, 29:2, 30:3, 31:1, 32:2, 33:1, 34:1, 35:3,
    36:1, 37:1, 38:2, 39:1, 40:1, 41:3, 42:2,
    43:1, 44:3, 45:2, 46:1, 47:1, 48:3, 49:2, 50:3, 51:3, 52:1, 53:1, 54:2, 55:2,
    56:3, 57:3, 58:2, 59:2, 60:2, 61:2, 62:3, 63:1, 64:2, 65:1, 66:2, 67:3, 68:2,
    69:1, 70:1, 71:1, 72:1, 73:2, 74:2, 75:2, 76:1,
    77:2, 78:2, 79:1, 80:1, 81:2, 82:2, 83:2, 84:2, 85:2, 86:3, 87:3, 88:1, 89:3, 90:3, 91:1
  };
  const CALC_TOPIC = { 77: "kraft", 78: "kraft", 79: "kraft", 80: "kondensator", 81: "kondensator", 82: "kondensator",
    83: "kondensator", 84: "schaltung", 85: "ladung", 86: "ladung", 87: "ladung", 88: "groessen", 89: "kraft",
    90: "millikan", 91: "klausur" };
  // Nicht auf der Checkliste, deshalb entfernt (die Nummern bleiben vergeben, damit die IDs und der Lernfortschritt stabil bleiben):
  // 42 Elektron beschleunigen, 55 Eselsbrücke Widerstand, 61 Halbwertszeit, 67 Masse des Tröpfchens (Stokes),
  // 71 Abweichung vom Literaturwert, 89 Rechenaufgabe Elektron im Feld
  const DROP = new Set([42, 55, 61, 67, 71, 89]);
  for (let i = cards.length - 1; i >= 0; i--) {
    if (DROP.has(+cards[i].id.slice(cards[i].id.lastIndexOf("-") + 1))) cards.splice(i, 1);
  }
  cards.forEach(c => {
    const num = +c.id.slice(c.id.lastIndexOf("-") + 1);
    c.lvl = LVL[num] || 2;
    c.kind = c.calc ? "rechnen" : "abfrage";
    if (CALC_TOPIC[num]) c.topic = CALC_TOPIC[num];
  });

  window.PHYS_TOPICS = TOPICS;
  window.PHYS_CARDS = cards;
})();
