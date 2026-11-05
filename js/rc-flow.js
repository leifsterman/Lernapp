/* Ideal RC model and display helpers, independent of canvas and animation frames.
   Units: Q in µC, C in µF, R in kΩ, U in V, elapsed time in s.
   Electron dots are illustrative tracers, not individual real electrons. */
(function (root) {
  "use strict";
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const finite = (x, fallback) => Number.isFinite(x) ? x : fallback;
  const tau = (mode, p) => ((mode === "charge" ? p.R1 : p.R2) * p.C) / 1000;
  const target = (mode, p, Q) => mode === "charge" ? p.C * p.U0 : mode === "discharge" ? 0 : Q;
  function evolve(Q, mode, p, seconds) {
    if (mode === "open" || !(seconds > 0)) return Q;
    const tc = tau(mode, p);
    if (!(tc > 0) || !Number.isFinite(tc)) return Q;
    const inf = target(mode, p, Q);
    return inf + (Q - inf) * Math.exp(-seconds / tc);
  }
  // One charge/discharge event moves an illustrative fixed number of tracer spacings,
  // regardless of the selected source voltage or capacitor size.
  function travel(deltaQ, mode, p) {
    if (mode === "open") return 0;
    const capacity = Math.max(1e-9, Math.abs(p.C * p.U0));
    const transferredFraction = clamp(Math.abs(deltaQ) / capacity, 0, 1);
    return transferredFraction * 360;
  }
  function plateFill(Q, p) {
    const full = Math.max(1e-9, Math.abs(p.C * p.U0));
    return clamp(finite(Q / full, 0), 0, 1);
  }
  // Rendering sampling uses fractional alpha so very small nonzero charge stays visible.
  function plateDots(Q, p, maxDots) {
    const count = Math.max(1, maxDots || 9);
    const amount = count * plateFill(Q, p);
    return Array.from({ length: Math.ceil(amount) }, (_, i) => clamp(amount - i, 0, 1));
  }
  function historySamples(startT, elapsed, interval, max) {
    if (!(elapsed > 0)) return [];
    const count = Math.min(max || 120, Math.max(1, Math.ceil(elapsed / (interval || .04))));
    return Array.from({ length: count }, (_, i) => startT + elapsed * (i + 1) / count);
  }
  root.PHYS_RC_FLOW = Object.freeze({ tau, target, evolve, travel, plateFill, plateDots, historySamples });
})(typeof window === "undefined" ? globalThis : window);
