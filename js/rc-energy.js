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
  root.PHYS_RC_ENERGY = Object.freeze({ potentialAt, energyAt });
})(typeof window === "undefined" ? globalThis : window);
