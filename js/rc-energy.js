/* Deterministic, testable energy-indicator model for the RC bees.
   The bucket is an analogy for potential energy PER CHARGE, not transported fluid.
   Levels are scaled to the initial/source voltage, never to a fixed 12 V. */
(function (root) {
  "use strict";
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Distances on the RC conductor paths in sims.js (360 × 250 layout).
  // L: first resistor d=32…92, battery d=204…228.
  // R: discharge resistor d=342…402.
  function potentialAt(p, mode, U0, Uc) {
    if (p.c === "T" || p.c === "Bd") return Uc;
    if (p.c === "B") return 0;
    if (p.c === "L") {
      const a = mode === "charge" ? Uc : U0, d = p.d;
      if (d < 32) return a;
      if (d < 92) return a + (U0 - a) * (d - 32) / 60;
      if (d < 204) return U0;
      if (d < 228) return U0 * (1 - (d - 204) / 24);
      return 0;
    }
    if (p.c === "R") {
      const voltage = mode === "discharge" ? Uc : 0, d = p.d;
      if (d < 342) return 0;
      if (d < 402) return voltage * (d - 342) / 60;
      return voltage;
    }
    return 0;
  }
  function energyAt(p, mode, U0, Uc) {
    if (mode === "open") return null; // Nothing flows: keep the previous bucket levels.
    if (mode !== "charge" && mode !== "discharge") return null;
    // The branch disconnected by the switch does not exchange energy.
    if ((mode === "charge" && p.c === "R") || (mode === "discharge" && p.c === "L")) return null;
    // Wird die Quelle unter die momentan gespeicherte Spannung abgesenkt,
    // kehrt sich der Strom im Ladezweig um: Die Quelle nimmt Energie auf.
    // Die Anzeige muss dann auch den Energieabfall in umgekehrter Richtung
    // entlang von Batterie und Widerstand unterscheiden können.
    const reference = Math.max(Math.abs(U0), Math.abs(Uc), 1e-9);
    const available = mode === "discharge" ? Uc : Math.max(U0, Uc);
    return clamp((available - potentialAt(p, mode, U0, Uc)) / reference, 0, 1);
  }
  // Physikalische Speicherenergie des Kondensators (nicht die Eimerenergie
  // eines einzelnen Elektrons). C in µF und Q in µC -> Ergebnis in µJ.
  // E_C = Q²/(2C) = (C·U_C²)/2. Die Vergleichsgröße bezieht sich explizit
  // auf die momentan eingestellte Quellspannung U₀.
  function storedEnergyMicroJ(Q, C) {
    if (!Number.isFinite(Q) || !Number.isFinite(C) || C <= 0) return 0;
    return Q * Q / (2 * C);
  }
  function capacitorStore(Q, C, U0) {
    const microJ = storedEnergyMicroJ(Q, C);
    const sourceVoltage = Math.max(0, Number.isFinite(U0) ? Math.abs(U0) : 0);
    const referenceMicroJ = C > 0 ? 0.5 * C * sourceVoltage * sourceVoltage : 0;
    const ratio = referenceMicroJ > 0 ? microJ / referenceMicroJ : 0;
    const voltage = C > 0 ? Q / C : 0;
    return {
      microJ, joules: microJ * 1e-6, referenceMicroJ,
      voltage, ratio, percent: ratio * 100, fill: clamp(ratio, 0, 1),
      fieldStrengthRelative: sourceVoltage > 0 ? Math.abs(voltage) / sourceVoltage : 0
    };
  }
  root.PHYS_RC_ENERGY = Object.freeze({ potentialAt, energyAt, storedEnergyMicroJ, capacitorStore });
})(typeof window === "undefined" ? globalThis : window);
