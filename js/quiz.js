/* Multiple-Choice-Fragen. Die erste Antwort ist jeweils die richtige, die Reihenfolge wird beim Anzeigen gemischt.
   Dazu kommen automatisch erzeugte Fragen zu Symbol, Einheit und Formel der Größenkarten. */
(function () {
  const R = String.raw;
  const Q = [];
  let n = 0;
  function mc(topic, lvl, q, opts, why) { n += 1; Q.push({ id: "mc-" + n, topic, lvl, q, opts, why: why || "" }); }

  // ---------- leicht
  mc("kraft", 1, R`Welche Einheit hat die elektrische Feldstärke $E$?`,
    [R`$\dfrac{\mathrm{V}}{\mathrm{m}}$`, R`$\mathrm{V\cdot m}$`, R`$\dfrac{\mathrm{C}}{\mathrm{m}}$`, R`$\mathrm{N\cdot C}$`],
    R`$E = \dfrac{F}{Q}$ hat die Einheit $\dfrac{\mathrm{N}}{\mathrm{C}}$, und das ist gleich $\dfrac{\mathrm{V}}{\mathrm{m}}$.`);
  mc("kraft", 1, R`Der Abstand zweier Punktladungen wird <b>verdoppelt</b>. Was passiert mit der Coulomb-Kraft?`,
    ["Sie sinkt auf ein Viertel", "Sie halbiert sich", "Sie verdoppelt sich", "Sie bleibt gleich"],
    R`$F \sim \dfrac{1}{r^2}$, also $\left(\dfrac{1}{2}\right)^2 = \dfrac{1}{4}$.`);
  mc("influenz", 1, "Was geschieht bei der Influenz?",
    ["Freie Ladungen im Leiter werden durch das äußere Feld verschoben, der Leiter bleibt insgesamt neutral",
     "Ladung geht durch Berührung auf den Leiter über", "Atome eines Isolators werden zu Dipolen", "Der Leiter wird insgesamt positiv geladen"],
    "Influenz ist Ladungstrennung in einem Leiter durch ein Feld, ohne Berührung.");
  mc("polar", 1, "In welchem Material tritt <b>Polarisation</b> auf?",
    ["In Isolatoren (Dielektrika)", "Nur in Metallen", "Nur im Vakuum", "Nur in Flüssigkeiten"],
    "Isolatoren haben keine freien Ladungsträger, ihre Atome oder Moleküle werden im Feld zu Dipolen bzw. ausgerichtet.");
  mc("feldlinien", 1, "Wo beginnen elektrische Feldlinien?",
    ["An positiven Ladungen", "An negativen Ladungen", "Im Unendlichen", "Sie sind immer geschlossen"],
    "Feldlinien laufen von + nach −. Sie sind nicht geschlossen.");
  mc("spitze", 1, "Wie groß ist die elektrische Feldstärke im Inneren eines Faradayschen Käfigs (statisch)?",
    ["Null", "Genauso groß wie außen", "Doppelt so groß wie außen", "Unendlich"],
    R`Influenzladungen kompensieren das Außenfeld, im Inneren ist $E = 0$.`);
  mc("kondensator", 1, R`Welche Formel gilt für das Feld im Plattenkondensator?`,
    [R`$E = \dfrac{U}{d}$`, R`$E = U\cdot d$`, R`$E = \dfrac{d}{U}$`, R`$E = \dfrac{Q}{U}$`],
    R`Spannung pro Plattenabstand: $E = \dfrac{U}{d}$, Einheit $\dfrac{\mathrm{V}}{\mathrm{m}}$.`);
  mc("kondensator", 1, R`Ein Plattenkondensator: Der Plattenabstand $d$ wird verdoppelt (sonst alles gleich). Was passiert mit $C$?`,
    ["$C$ halbiert sich", "$C$ verdoppelt sich", "$C$ vervierfacht sich", "$C$ bleibt gleich"],
    R`$C = \varepsilon_0\varepsilon_r\dfrac{A}{d}$, also $C\sim\dfrac{1}{d}$.`);
  mc("schaltung", 1, "Wie berechnet man die Gesamtkapazität bei <b>Parallelschaltung</b>?",
    [R`$C_{\mathrm{ges}} = C_1 + C_2$`, R`$\dfrac{1}{C_{\mathrm{ges}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2}$`, R`$C_{\mathrm{ges}} = C_1\cdot C_2$`, R`$C_{\mathrm{ges}} = \dfrac{C_1}{C_2}$`],
    "Parallel: Plattenflächen addieren sich, also addieren sich auch die Kapazitäten.");
  mc("millikan", 1, "Was zeigt der Millikan-Versuch?",
    ["Die Ladung ist gequantelt (ganzzahlige Vielfache der Elementarladung)", "Die Masse des Elektrons", "Die Lichtgeschwindigkeit", "Dass Ladungen sich nie abstoßen"],
    R`$q = n\cdot e$ mit $e = 1{,}602\cdot10^{-19}\,\mathrm{C}$.`);
  mc("klausur", 1, "Wie zeichnest du die Messpunkte in einem Diagramm richtig ein?",
    ["Als Kreuze, dazu eine Ausgleichsgerade/-kurve", "Als Kreise, Punkt für Punkt verbunden", "Nur die Kurve ohne Messpunkte", "Mit Balken"],
    "Messpunkte werden nicht der Reihe nach verbunden, sondern durch eine Ausgleichskurve angenähert.");
  mc("klausur", 1, R`Berechne den Mittelwert der Messwerte $2{,}0$ · $2{,}2$ · $1{,}8$.`,
    [R`$2{,}0$`, R`$2{,}2$`, R`$1{,}9$`, R`$6{,}0$`],
    R`$\dfrac{2{,}0 + 2{,}2 + 1{,}8}{3} = \dfrac{6{,}0}{3} = 2{,}0$`);
  mc("groessen", 1, R`Welcher Ausdruck entspricht einem Coulomb ($1\,\mathrm{C}$)?`,
    [R`$1\,\mathrm{A\cdot s}$`, R`$1\,\mathrm{A/s}$`, R`$1\,\mathrm{V\cdot s}$`, R`$1\,\mathrm{J/s}$`],
    R`$Q = I\cdot t$, also $1\,\mathrm{C} = 1\,\mathrm{A}\cdot\mathrm{s}$.`);

  // ---------- mittel
  mc("influenz", 2, "Eine neutrale Metallkugel wird mit einem negativen Stab influenziert, kurz geerdet, dann wird erst die Erdung und dann der Stab entfernt. Wie ist die Kugel geladen?",
    ["Positiv", "Negativ", "Neutral", "Das hängt vom Stab-Material ab"],
    "Beim Erden fließen Elektronen ab. Zurück bleibt ein Elektronenmangel, die Kugel ist positiv.");
  mc("feldlinien", 2, "Parallele, gleich weit entfernte Feldlinien bedeuten …",
    ["ein homogenes Feld", "ein radialsymmetrisches Feld", "ein Feld mit Quelle im Unendlichen", "dass das Feld überall null ist"],
    "Homogen: überall gleicher Betrag und gleiche Richtung, z. B. zwischen den Platten eines Plattenkondensators.");
  mc("feldlinien", 2, "Zwei gleich große positive Ladungen. Wie groß ist das Feld genau in der Mitte zwischen ihnen?",
    [R`$E = 0$`, "Doppelt so groß wie bei einer Ladung", "Genau so groß wie bei einer Ladung", "Nicht definiert"],
    "Die Feldstärken beider Ladungen sind gleich groß und entgegengesetzt, sie heben sich auf (neutraler Punkt).");
  mc("spitze", 2, "Warum sind Blitzableiter spitz?",
    ["An Spitzen ist die Feldstärke besonders hoch, Ladung kann kontrolliert abfließen", "Spitzen sind leichter zu bauen", "Spitzen leiten besser", "Weil sie weniger Ladung anziehen"],
    R`Spitzeneffekt: hohe Flächenladungsdichte $\sigma$, also hohes $E = \sigma/\varepsilon_0$.`);
  mc("kraft", 2, R`Wie verhält sich die Feldstärke einer Punktladung mit dem Abstand $r$?`,
    [R`$E\sim\dfrac{1}{r^2}$`, R`$E\sim\dfrac{1}{r}$`, R`$E\sim r$`, R`$E\sim r^2$`],
    "Radialsymmetrisches Feld: Die Feldlinien verteilen sich auf eine Kugeloberfläche ($\\sim r^2$).");
  mc("kraft", 2, "Ein Elektron befindet sich in einem Feld, das nach rechts zeigt. In welche Richtung wirkt die Kraft?",
    ["Nach links", "Nach rechts", "Nach oben", "Es wirkt keine Kraft"],
    "Auf negative Ladungen wirkt die Kraft entgegen der Feldrichtung.");
  mc("kondensator", 2, "Welche Einheit hat die Kapazität?",
    [R`$1\,\mathrm{F} = 1\,\dfrac{\mathrm{C}}{\mathrm{V}}$`, R`$1\,\mathrm{F} = 1\,\dfrac{\mathrm{V}}{\mathrm{C}}$`, R`$1\,\mathrm{F} = 1\,\mathrm{C\cdot V}$`, R`$1\,\mathrm{F} = 1\,\dfrac{\mathrm{A}}{\mathrm{V}}$`],
    R`$C = \dfrac{Q}{U}$.`);
  mc("kondensator", 2, "Wie groß ist die im Kondensator gespeicherte Energie?",
    [R`$W = \dfrac{1}{2}CU^2$`, R`$W = CU^2$`, R`$W = \dfrac{1}{2}C^2U$`, R`$W = QU^2$`],
    R`Fläche unter der Geraden im $Q$-$U$-Diagramm: $\dfrac{1}{2}QU = \dfrac{1}{2}CU^2$.`);
  mc("kondensator", 2, "Welcher Zusammenhang ist richtig? (Vakuum)",
    [R`$E = \dfrac{\sigma}{\varepsilon_0}$`, R`$E = \varepsilon_0\cdot\sigma$`, R`$E = \dfrac{\varepsilon_0}{\sigma}$`, R`$E = \sigma\cdot A$`],
    R`Einheitenprobe: $\dfrac{\mathrm{C/m^2}}{\mathrm{F/m}} = \dfrac{\mathrm{V}}{\mathrm{m}}$.`);
  mc("schaltung", 2, R`Zwei Kondensatoren mit $2\,\mu\mathrm{F}$ und $6\,\mu\mathrm{F}$ sind in Reihe geschaltet. Wie groß ist $C_{\mathrm{ges}}$?`,
    [R`$1{,}5\,\mu\mathrm{F}$`, R`$8\,\mu\mathrm{F}$`, R`$4\,\mu\mathrm{F}$`, R`$3\,\mu\mathrm{F}$`],
    R`$C = \dfrac{2\cdot6}{2+6} = \dfrac{12}{8} = 1{,}5\,\mu\mathrm{F}$, kleiner als der kleinste Einzelwert.`);
  mc("schaltung", 2, "Was ist bei der <b>Reihenschaltung</b> zweier Kondensatoren an beiden gleich?",
    ["Die Ladung Q", "Die Spannung U", "Die Kapazität C", "Die Energie W"],
    "In Reihe fließt dieselbe Ladung auf beide, die Spannungen addieren sich.");
  mc("ladung", 2, "Beim Entladen eines Kondensators wird der Widerstand $R$ verdoppelt. Was passiert?",
    ["Die Entladung dauert doppelt so lange", "Die Entladung geht doppelt so schnell", "Die Anfangsspannung verdoppelt sich", "Nichts"],
    R`$\tau = R\cdot C$ verdoppelt sich.`);
  mc("ladung", 2, R`Auf wie viel Prozent von $U_0$ ist die Spannung beim Entladen nach $t = \tau$ gefallen?`,
    [R`ca. $37\,\%$`, R`ca. $63\,\%$`, R`$50\,\%$`, R`$10\,\%$`],
    R`$U = U_0\,e^{-1} \approx 0{,}37\,U_0$.`);
  mc("millikan", 2, "Welche Bedingung gilt beim Schweben eines Öltröpfchens?",
    [R`$q\cdot E = m\cdot g$`, R`$q\cdot E = m\cdot g\cdot d$`, R`$q\cdot U = m\cdot g$`, R`$\dfrac{q}{E} = m\cdot g$`],
    "Die elektrische Kraft nach oben gleicht die Gewichtskraft aus.");
  mc("klausur", 2, "Was liefert die Steigung im $Q$-$U$-Diagramm eines Kondensators?",
    ["Die Kapazität C", "Die Energie W", "Den Widerstand R", "Die Zeitkonstante τ"],
    R`$Q = C\cdot U$ ist eine Ursprungsgerade mit Steigung $C$.`);

  // ---------- schwer
  mc("kondensator", 3, "Ein geladener Kondensator wird von der Quelle <b>getrennt</b>. Dann wird der Plattenabstand verdoppelt. Was passiert mit der Spannung?",
    ["Sie verdoppelt sich", "Sie halbiert sich", "Sie bleibt gleich", "Sie vervierfacht sich"],
    R`$Q$ bleibt konstant, $C$ halbiert sich, also $U = Q/C$ verdoppelt sich. Das Feld $E = \sigma/\varepsilon_0$ bleibt gleich.`);
  mc("kondensator", 3, R`Ein Kondensator bleibt an der Spannungsquelle. Ein Dielektrikum mit $\varepsilon_r = 4$ wird eingeschoben. Was passiert mit der Ladung $Q$?`,
    ["Sie vervierfacht sich", "Sie viertelt sich", "Sie bleibt gleich", "Sie verdoppelt sich"],
    R`$U$ konstant, $C$ wird 4-mal so groß, also $Q = C\cdot U$ auch.`);
  mc("kraft", 3, R`Der Abstand zu einer Punktladung wird verdreifacht. Wie ändert sich die Feldstärke?`,
    [R`Sie sinkt auf $\tfrac{1}{9}$`, R`Sie sinkt auf $\tfrac{1}{3}$`, R`Sie sinkt auf $\tfrac{1}{6}$`, R`Sie wird $9$-mal so groß`],
    R`$E\sim\dfrac{1}{r^2}$, also $\dfrac{1}{3^2} = \dfrac{1}{9}$.`);
  mc("ladung", 3, "Welche Differenzialgleichung beschreibt die <b>Entladung</b> eines Kondensators über einen Widerstand?",
    [R`$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = -\dfrac{Q}{RC}$`, R`$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = +\dfrac{Q}{RC}$`, R`$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = -RC\cdot Q$`, R`$\dfrac{\mathrm{d}Q}{\mathrm{d}t} = \dfrac{Q_0 - Q}{RC}$`],
    R`Maschenregel $\dfrac{Q}{C} + R\dfrac{\mathrm{d}Q}{\mathrm{d}t} = 0$. Lösung: $Q = Q_0e^{-t/RC}$.`);
  mc("ladung", 3, "<b>Zusatzwissen – Aufladung aktuell nicht benötigt:</b> Wann ist der Ladestrom beim <b>Aufladen</b> eines Kondensators am größten?",
    [R`Beim Einschalten ($t = 0$)`, R`Nach der Zeit $\tau$`, "Wenn der Kondensator voll ist", "Der Strom ist konstant"],
    R`$I(t) = \dfrac{U_0}{R}e^{-t/\tau}$ ist bei $t = 0$ maximal und fällt dann ab.`);
  mc("ladung", 3, R`Du trägst $\ln U$ gegen $t$ für eine Entladung auf. Was erhältst du?`,
    [R`Eine Gerade mit Steigung $-\dfrac{1}{\tau}$`, R`Eine Gerade mit Steigung $+\tau$`, "Eine Parabel", R`Eine Hyperbel $\sim 1/t$`],
    R`$\ln U = \ln U_0 - \dfrac{t}{\tau}$.`);
  mc("millikan", 3, R`Gemessene Tröpfchenladungen (in $10^{-19}\,\mathrm{C}$): $3{,}2$ · $4{,}8$ · $8{,}0$. Welcher Wert ist die größte gemeinsame „Einheit“?`,
    [R`$1{,}6$`, R`$0{,}8$`, R`$3{,}2$`, R`$2{,}4$`],
    R`$3{,}2 = 2\cdot1{,}6$, $4{,}8 = 3\cdot1{,}6$, $8{,}0 = 5\cdot1{,}6$. Das ist die Elementarladung.`);
  mc("millikan", 3, "Beim schwebenden Öltröpfchen wird die Spannung etwas <b>erhöht</b>. Was passiert?",
    ["Das Tröpfchen steigt nach oben", "Das Tröpfchen sinkt", "Das Tröpfchen bleibt schweben", "Das Tröpfchen verliert Ladung"],
    "Die elektrische Kraft $q\\cdot U/d$ wird größer als die Gewichtskraft.");
  mc("spitze", 3, "Warum stehen Feldlinien senkrecht auf einer Leiteroberfläche?",
    ["Eine Tangentialkomponente würde freie Ladungen verschieben, bis sie verschwindet", "Weil Leiter das Feld abstoßen", "Weil Feldlinien immer senkrecht zu Flächen stehen", "Weil die Ladung im Inneren sitzt"],
    "Im statischen Gleichgewicht ist die Leiteroberfläche eine Äquipotenzialfläche.");

  // ---------- automatisch aus den Größenkarten
  function sizeMC(cards) {
    const sizes = cards.filter(c => c.type === "size");  // alle Größenkarten, auch ausgeblendete (nur als Ablenker)
    const out = [];
    const strip = s => String(s).replace(/&nbsp;/g, " ");
    sizes.forEach(c => {
      [["symbol", 1, "Welches Formelzeichen gehört zu <b>" + c.front + "</b>?"],
       ["unit", 2, "Welche SI-Einheit hat <b>" + c.front + "</b>?"],
       ["formula", 3, "Welche Formel/Definition gehört zu <b>" + c.front + "</b>?"]].forEach(([k, lvl, q]) => {
        const right = strip(c[k]);
        const others = [];
        sizes.forEach(o => { const v = strip(o[k]); if (o !== c && v !== right && !others.includes(v)) others.push(v); });
        // zufällig drei Ablenker
        for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
        out.push({ id: "mcs-" + c.id + "-" + k, cardId: c.id, topic: "groessen", lvl, q, opts: [right].concat(others.slice(0, 3)),
          why: "<p>" + c.front + ": " + c.symbol + " · " + c.unit + " · " + c.formula + "</p>" });
      });
    });
    return out;
  }

  window.PHYS_MC = Q;
  window.PHYS_MC_AUTO = () => sizeMC(window.PHYS_CARDS);
})();
