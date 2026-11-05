/* Rechentrainer: erzeugt unendlich viele Aufgaben mit Zufallswerten.
   Jeder Generator liefert { topic, lvl, q, ans, unit, sol } (Antwort in der angegebenen Einheit, 3 % Toleranz). */
(function () {
  const R = String.raw;
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const K = 8.99e9, E0 = 8.854e-12, QE = 1.602e-19, ME = 9.109e-31, G = 9.81;

  // Zahlen für Anzeige: deutsches Komma, TeX-tauglich
  function de(x, n) { return String(Number(x.toPrecision(n || 3))).replace(".", "{,}"); }
  function tx(x, n) {
    n = n || 2;
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 4) return de(x, n);
    return de(x / Math.pow(10, e), n) + R`\cdot10^{` + e + "}";
  }

  const GEN = [];
  function add(topic, lvl, name, fn) { GEN.push({ topic, lvl, name, fn }); }

  // ---------------------------------------------------------------- Stufe 1
  add("kraft", 1, "F = E·Q", () => {
    const E = rnd([2, 3, 5, 8]) * 1e3, Qn = rnd([5, 12, 20, 40]);
    const F = E * Qn * 1e-9;
    return {
      q: R`Eine Ladung $Q = ${Qn}\,\mathrm{nC}$ befindet sich in einem Feld der Stärke $E = ${tx(E)}\,\mathrm{N/C}$. Wie groß ist die Kraft auf die Ladung?`,
      ans: F * 1e6, unit: "µN",
      sol: R`<p>$$F = E\cdot Q = ${tx(E)}\,\tfrac{\mathrm{N}}{\mathrm{C}}\cdot ${Qn}\cdot10^{-9}\,\mathrm{C}$$</p><p>$$F = ${tx(F)}\,\mathrm{N} = ${tx(F * 1e6)}\,\mu\mathrm{N}$$</p>`
    };
  });
  add("kondensator", 1, "E = U/d", () => {
    const U = rnd([50, 120, 230, 400, 600]), dcm = rnd([1, 2, 4, 5]);
    const E = U / (dcm / 100);
    return {
      q: R`Zwischen den Platten eines Kondensators liegt die Spannung $U = ${U}\,\mathrm{V}$, der Plattenabstand beträgt $d = ${dcm}\,\mathrm{cm}$. Wie groß ist die Feldstärke?`,
      ans: E, unit: "V/m",
      sol: R`<p>$$E = \dfrac{U}{d} = \dfrac{${U}\,\mathrm{V}}{${de(dcm / 100)}\,\mathrm{m}} = ${tx(E)}\,\dfrac{\mathrm{V}}{\mathrm{m}}$$</p><p>Achtung: $d$ zuerst in Meter umrechnen.</p>`
    };
  });
  add("groessen", 1, "Q = I·t", () => {
    const I = rnd([2, 5, 12, 40]), t = rnd([10, 30, 60, 120]);
    const Q = I * t; // mA·s = mC
    return {
      q: R`Durch einen Draht fließt $I = ${I}\,\mathrm{mA}$ für $t = ${t}\,\mathrm{s}$. Welche Ladung wird transportiert?`,
      ans: Q, unit: "mC",
      sol: R`<p>$$Q = I\cdot t = ${I}\cdot10^{-3}\,\mathrm{A}\cdot ${t}\,\mathrm{s} = ${tx(Q / 1000)}\,\mathrm{C} = ${Q}\,\mathrm{mC}$$</p>`
    };
  });
  add("kondensator", 1, "Q = C·U", () => {
    const C = rnd([10, 47, 100, 220, 470]), U = rnd([3, 5, 9, 12]);
    const Q = C * U;
    return {
      q: R`Ein Kondensator mit $C = ${C}\,\mu\mathrm{F}$ wird an $U = ${U}\,\mathrm{V}$ aufgeladen. Wie viel Ladung speichert er?`,
      ans: Q, unit: "µC",
      sol: R`<p>$$Q = C\cdot U = ${C}\,\mu\mathrm{F}\cdot ${U}\,\mathrm{V} = ${Q}\,\mu\mathrm{C}$$</p>`
    };
  });
  add("schaltung", 1, "Parallelschaltung", () => {
    const a = rnd([2, 4, 6, 10, 22]), b = rnd([3, 8, 12, 15, 47]);
    return {
      q: R`Zwei Kondensatoren $C_1 = ${a}\,\mu\mathrm{F}$ und $C_2 = ${b}\,\mu\mathrm{F}$ sind <b>parallel</b> geschaltet. Wie groß ist die Gesamtkapazität?`,
      ans: a + b, unit: "µF",
      sol: R`<p>Parallel: Kapazitäten addieren sich.</p><p>$$C_{\mathrm{ges}} = C_1 + C_2 = ${a} + ${b} = ${a + b}\,\mu\mathrm{F}$$</p>`
    };
  });
  add("ladung", 1, "Zeitkonstante τ", () => {
    const Rk = rnd([10, 22, 47, 100]), C = rnd([10, 47, 100]);
    const tau = Rk * C * 1e-3; // kΩ·µF = ms -> s
    return {
      q: R`Ein Widerstand $R = ${Rk}\,\mathrm{k\Omega}$ und ein Kondensator $C = ${C}\,\mu\mathrm{F}$ bilden ein RC-Glied. Berechne die Zeitkonstante $\tau$.`,
      ans: tau, unit: "s",
      sol: R`<p>$$\tau = R\cdot C = ${Rk}\cdot10^{3}\,\Omega\cdot ${C}\cdot10^{-6}\,\mathrm{F} = ${tx(tau, 3)}\,\mathrm{s}$$</p>`
    };
  });
  add("klausur", 1, "Mittelwert", () => {
    const base = rnd([1.5, 2.4, 3.6, 4.8]);
    const v = Array.from({ length: 5 }, () => Math.round((base + (Math.random() - 0.5) * 0.4) * 100) / 100);
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    return {
      q: R`Fünf Messwerte (in $\mathrm{s}$): ${v.map(x => "$" + de(x) + "$").join(" · ")}. Berechne den Mittelwert.`,
      ans: m, unit: "s",
      sol: R`<p>$$\bar{x} = \dfrac{${v.map(x => de(x)).join(" + ")}}{5} = ${de(m, 3)}\,\mathrm{s}$$</p>`
    };
  });

  // ---------------------------------------------------------------- Stufe 2
  add("kondensator", 2, "W = ½CU²", () => {
    const C = rnd([47, 100, 220, 470, 1000]), U = rnd([5, 9, 12, 24]);
    const W = 0.5 * C * 1e-6 * U * U;
    return {
      q: R`Ein Kondensator mit $C = ${C}\,\mu\mathrm{F}$ ist auf $U = ${U}\,\mathrm{V}$ geladen. Welche Energie ist gespeichert?`,
      ans: W * 1e3, unit: "mJ",
      sol: R`<p>$$W = \dfrac{1}{2}CU^2 = \dfrac{1}{2}\cdot ${C}\cdot10^{-6}\,\mathrm{F}\cdot(${U}\,\mathrm{V})^2 = ${tx(W * 1e3, 3)}\,\mathrm{mJ}$$</p>`
    };
  });
  add("kraft", 2, "Coulomb-Kraft", () => {
    const q1 = rnd([1, 2, 3, 5]), q2 = rnd([1, 2, 4, 6]), rcm = rnd([5, 10, 20, 30]);
    const F = K * q1 * 1e-6 * q2 * 1e-6 / Math.pow(rcm / 100, 2);
    return {
      q: R`Zwei Punktladungen $Q_1 = ${q1}\,\mu\mathrm{C}$ und $Q_2 = ${q2}\,\mu\mathrm{C}$ haben den Abstand $r = ${rcm}\,\mathrm{cm}$. Wie groß ist der Betrag der Coulomb-Kraft? (Nutze $\tfrac{1}{4\pi\varepsilon_0} = 8{,}99\cdot10^{9}\,\tfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$)`,
      ans: F, unit: "N",
      sol: R`<p>$$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_1Q_2}{r^2}$$</p><p>$$F = 8{,}99\cdot10^{9}\cdot\dfrac{${q1}\cdot10^{-6}\cdot ${q2}\cdot10^{-6}}{(${de(rcm / 100)})^2}\,\mathrm{N}$$</p><p>$$F = ${tx(F, 3)}\,\mathrm{N}$$</p>`
    };
  });
  add("kraft", 2, "E einer Punktladung", () => {
    const Qn = rnd([2, 5, 10, 20]), rcm = rnd([2, 5, 10]);
    const E = K * Qn * 1e-9 / Math.pow(rcm / 100, 2);
    return {
      q: R`Eine Punktladung $Q = ${Qn}\,\mathrm{nC}$ erzeugt ein Feld. Wie groß ist die Feldstärke im Abstand $r = ${rcm}\,\mathrm{cm}$? ($\tfrac{1}{4\pi\varepsilon_0} = 8{,}99\cdot10^{9}\,\tfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$)`,
      ans: E / 1e3, unit: "kV/m",
      sol: R`<p>$$E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{r^2} = 8{,}99\cdot10^{9}\cdot\dfrac{${Qn}\cdot10^{-9}}{(${de(rcm / 100)})^2}\,\tfrac{\mathrm{V}}{\mathrm{m}}$$</p><p>$$E = ${tx(E, 3)}\,\tfrac{\mathrm{V}}{\mathrm{m}}$$</p><p>$= ${tx(E / 1e3, 3)}\,\mathrm{kV/m}$</p>`
    };
  });
  add("kondensator", 2, "C des Plattenkondensators", () => {
    const Acm = rnd([50, 100, 200, 400]), dmm = rnd([0.5, 1, 2]), er = rnd([1, 2, 4, 5]);
    const C = E0 * er * (Acm * 1e-4) / (dmm * 1e-3);
    return {
      q: R`Ein Plattenkondensator hat die Plattenfläche $A = ${Acm}\,\mathrm{cm^2}$, den Abstand $d = ${de(dmm)}\,\mathrm{mm}$ und ein Dielektrikum mit $\varepsilon_r = ${er}$. Berechne die Kapazität. ($\varepsilon_0 = 8{,}854\cdot10^{-12}\,\tfrac{\mathrm{F}}{\mathrm{m}}$)`,
      ans: C * 1e12, unit: "pF",
      sol: R`<p>$$C = \varepsilon_0\varepsilon_r\dfrac{A}{d} = 8{,}854\cdot10^{-12}\cdot ${er}\cdot\dfrac{${tx(Acm * 1e-4)}\,\mathrm{m^2}}{${tx(dmm * 1e-3)}\,\mathrm{m}}$$</p><p>$$C = ${tx(C * 1e12, 3)}\,\mathrm{pF}$$</p><p>Achtung: $\mathrm{cm^2}$ in $\mathrm{m^2}$ ($\cdot10^{-4}$) und $\mathrm{mm}$ in $\mathrm{m}$ umrechnen.</p>`
    };
  });
  add("schaltung", 2, "Reihenschaltung", () => {
    const [a, b] = rnd([[2, 6], [3, 6], [4, 12], [10, 15], [5, 20], [6, 12]]);
    const C = a * b / (a + b);
    return {
      q: R`Zwei Kondensatoren $C_1 = ${a}\,\mu\mathrm{F}$ und $C_2 = ${b}\,\mu\mathrm{F}$ sind in <b>Reihe</b> geschaltet. Wie groß ist die Gesamtkapazität?`,
      ans: C, unit: "µF",
      sol: R`<p>$$C_{\mathrm{ges}} = \dfrac{C_1C_2}{C_1 + C_2} = \dfrac{${a}\cdot ${b}}{${a} + ${b}}\,\mu\mathrm{F} = ${de(C)}\,\mu\mathrm{F}$$</p><p>Kontrolle: kleiner als der kleinste Einzelkondensator.</p>`
    };
  });
  add("kondensator", 2, "E aus Q und A", () => {
    const Qn = rnd([1, 2, 5]), Acm = rnd([50, 100, 200]);
    const E = Qn * 1e-9 / (E0 * Acm * 1e-4);
    return {
      q: R`Auf den Platten eines Plattenkondensators (Vakuum) sitzt die Ladung $Q = ${Qn}\,\mathrm{nC}$, die Plattenfläche ist $A = ${Acm}\,\mathrm{cm^2}$. Wie groß ist die Feldstärke zwischen den Platten?`,
      ans: E / 1e3, unit: "kV/m",
      sol: R`<p>$$E = \dfrac{\sigma}{\varepsilon_0} = \dfrac{Q}{\varepsilon_0 A}$$</p><p>$$E = \dfrac{${Qn}\cdot10^{-9}}{8{,}854\cdot10^{-12}\cdot ${tx(Acm * 1e-4)}}\,\tfrac{\mathrm{V}}{\mathrm{m}} = ${tx(E / 1e3, 3)}\,\mathrm{kV/m}$$</p>`
    };
  });
  add("millikan", 2, "Anzahl Elementarladungen", () => {
    const n = rnd([1.6, 3.2, 8.0, 16]);
    const N = n * 1e-6 / QE; // µC
    return {
      q: R`Wie viele Elementarladungen ($e = 1{,}602\cdot10^{-19}\,\mathrm{C}$) entsprechen einer Ladung von $Q = ${de(n)}\,\mu\mathrm{C}$? Gib das Ergebnis in $10^{13}$ an.`,
      ans: N / 1e13, unit: "· 10¹³",
      sol: R`<p>$$N = \dfrac{Q}{e} = \dfrac{${de(n)}\cdot10^{-6}\,\mathrm{C}}{1{,}602\cdot10^{-19}\,\mathrm{C}} = ${tx(N / 1e13, 3)}\cdot10^{13}$$</p>`
    };
  });

  // ---------------------------------------------------------------- Stufe 3
  add("ladung", 3, "Entladung U(t)", () => {
    const U0 = rnd([6, 9, 12]), tau = rnd([1, 2, 5]), f = rnd([0.5, 1, 1.5, 2, 3]);
    const t = f * tau, U = U0 * Math.exp(-f);
    return {
      q: R`Ein Kondensator wird über einen Widerstand entladen. Anfangsspannung $U_0 = ${U0}\,\mathrm{V}$, Zeitkonstante $\tau = ${tau}\,\mathrm{s}$. Wie groß ist die Spannung nach $t = ${de(t)}\,\mathrm{s}$?`,
      ans: U, unit: "V",
      sol: R`<p>$$U(t) = U_0\,e^{-t/\tau}$$</p><p>$$U = ${U0}\,\mathrm{V}\cdot e^{-${de(t)}/${tau}} = ${U0}\,\mathrm{V}\cdot e^{-${de(f)}} = ${de(U, 3)}\,\mathrm{V}$$</p>`
    };
  });
  add("ladung", 3, "Aufladung U(t) – Zusatzwissen, aktuell nicht benötigt", () => {
    const U0 = rnd([6, 9, 12]), tau = rnd([0.5, 1, 2]), f = rnd([0.5, 1, 2, 3]);
    const t = f * tau, U = U0 * (1 - Math.exp(-f));
    return {
      q: R`Ein leerer Kondensator wird über einen Widerstand an $U_0 = ${U0}\,\mathrm{V}$ geladen ($\tau = ${de(tau)}\,\mathrm{s}$). Wie groß ist die Kondensatorspannung nach $t = ${de(t)}\,\mathrm{s}$?`,
      ans: U, unit: "V",
      sol: R`<p>$$U_C(t) = U_0\bigl(1 - e^{-t/\tau}\bigr)$$</p><p>$$U_C = ${U0}\,\mathrm{V}\cdot\bigl(1 - e^{-${de(f)}}\bigr) = ${de(U, 3)}\,\mathrm{V}$$</p>`
    };
  });
  add("ladung", 3, "Zeit bis zum Bruchteil", () => {
    const Rk = rnd([22, 47, 100]), C = rnd([47, 100, 220]), p = rnd([50, 25, 10]);
    const tau = Rk * C * 1e-3, t = tau * Math.log(100 / p);
    return {
      q: R`Ein Kondensator ($C = ${C}\,\mu\mathrm{F}$) entlädt sich über $R = ${Rk}\,\mathrm{k\Omega}$. Nach welcher Zeit ist die Spannung auf $${p}\,\%$ von $U_0$ gefallen?`,
      ans: t, unit: "s",
      sol: R`<p>$$\tau = RC = ${tx(tau, 3)}\,\mathrm{s}$$</p><p>$$e^{-t/\tau} = \dfrac{${p}}{100} \;\Rightarrow\; t = \tau\cdot\ln\dfrac{100}{${p}}$$</p><p>$$t = ${tx(tau, 3)}\,\mathrm{s}\cdot ${de(Math.log(100 / p), 3)} = ${de(t, 3)}\,\mathrm{s}$$</p>`
    };
  });
  add("millikan", 3, "Millikan: Ladung des Tröpfchens", () => {
    const n = rnd([1, 2, 3, 4, 5]), U = rnd([300, 400, 500, 600]), dmm = 5;
    const m = n * QE * U / (G * dmm * 1e-3);
    const mr = Number(m.toPrecision(3));
    const q = mr * G * dmm * 1e-3 / U;
    return {
      q: R`Ein Öltröpfchen der Masse $m = ${tx(mr, 3)}\,\mathrm{kg}$ schwebt zwischen zwei Platten ($d = ${dmm}\,\mathrm{mm}$) bei $U = ${U}\,\mathrm{V}$. Welche Ladung trägt es? Gib $q$ in $10^{-19}\,\mathrm{C}$ an. ($g = 9{,}81\,\mathrm{m/s^2}$)`,
      ans: q / 1e-19, unit: "· 10⁻¹⁹ C",
      sol: R`<p>Schweben: $q\cdot E = m\cdot g$ mit $E = U/d$.</p><p>$$q = \dfrac{m\,g\,d}{U} = \dfrac{${tx(mr, 3)}\cdot9{,}81\cdot ${dmm}\cdot10^{-3}}{${U}}\,\mathrm{C}$$</p><p>$$q = ${de(q / 1e-19, 3)}\cdot10^{-19}\,\mathrm{C}$$</p><p>Das sind $\dfrac{q}{e} \approx ${n}$ Elementarladungen.</p>`
    };
  });

  // ---------------------------------------------------------------- Eingabe prüfen
  function parse(str) {
    let s = String(str).trim().toLowerCase().replace(/\s+/g, "");
    s = s.replace(/[·*×x]10\^?\(?([-+−]?\d+)\)?/g, "e$1").replace(/−/g, "-").replace(/,/g, ".");
    const m = s.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }
  function check(task, str) {
    const x = parse(str);
    if (!isFinite(x)) return { ok: false, bad: true };
    const tol = task.ans === 0 ? 1e-9 : Math.abs(task.ans) * 0.03;
    return { ok: Math.abs(x - task.ans) <= tol, value: x };
  }
  function fmtAns(task) {
    const a = task.ans, abs = Math.abs(a);
    let t;
    if (abs >= 1e4 || (abs < 1e-2 && a !== 0)) {
      const [m, e] = a.toExponential(2).split("e");
      const sup = String(parseInt(e, 10)).replace(/-/g, "⁻").replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
      t = m.replace(".", ",") + "·10" + sup;
    } else t = String(Number(a.toPrecision(3))).replace(".", ",");
    return t + " " + task.unit;
  }

  // levels: Menge erlaubter Stufen, topics: Menge erlaubter Themen (oder null)
  function make(levels, topics) {
    let pool = GEN.filter(g => levels.includes(g.lvl) && (!topics || topics.includes(g.topic)));
    if (!pool.length) pool = GEN.filter(g => levels.includes(g.lvl));
    if (!pool.length) pool = GEN;
    const g = rnd(pool);
    const t = g.fn();
    return Object.assign({ topic: g.topic, lvl: g.lvl, name: g.name }, t);
  }

  window.PHYS_TRAINER = { make, check, parse, fmtAns, count: GEN.length, gens: GEN };
})();
