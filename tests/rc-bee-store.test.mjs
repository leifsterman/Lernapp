import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(read("js/rc-energy.js"), sandbox);
const E = sandbox.window.PHYS_RC_ENERGY;
const close = (actual, expected, eps=1e-9) => assert.ok(Math.abs(actual - expected) <= eps, actual + " differs from " + expected);

test("E_C = 1/2 C U^2 is stored in µJ, independent of bee bucket energy", () => {
  const C=470, U=9, Q=C*U;
  const e=0.5*C*U*U;
  close(E.storedEnergyMicroJ(Q,C),e);
  close(E.capacitorStore(Q,C,U).microJ,e);
  close(E.capacitorStore(Q,C,U).joules,e*1e-6);
  close(E.capacitorStore(Q,C,U).ratio,1);
  close(E.storedEnergyMicroJ(0,C),0);
  close(E.capacitorStore(0,C,U).fill,0);
});

test("After one time constant: voltage 1/e, but capacitor energy 1/e squared", () => {
  const C=470,U0=9,Q0=C*U0;
  const before=E.capacitorStore(Q0,C,U0);
  const later=E.capacitorStore(Q0/Math.E,C,U0);
  close(later.voltage/U0,1/Math.E);
  close(later.microJ/before.microJ,Math.exp(-2));
  close(later.percent,Math.exp(-2)*100);
  close(later.fill,Math.exp(-2));
});

test("Stored energy is not the same fraction as charge or voltage", () => {
  const C=500,U0=10;
  const store=E.capacitorStore(C*U0/2,C,U0);
  close(store.voltage/U0,.5);
  close(store.fill,.25);
  close(store.percent,25);
});

test("Changing capacitance with isolated charge changes E by Q squared over 2C", () => {
  const Q=1200;
  const a=E.capacitorStore(Q,200,8);
  const b=E.capacitorStore(Q,400,8);
  close(a.microJ,2*b.microJ);
  close(a.voltage,2*b.voltage);
});

test("Open switch does not alter energy; source reduction does not erase stored joules", () => {
  const C=470, Q=C*9;
  const full=E.capacitorStore(Q,C,9);
  const sourceReduced=E.capacitorStore(Q,C,3);
  close(sourceReduced.microJ,full.microJ);
  close(sourceReduced.ratio,9);
  close(sourceReduced.fill,1);
  close(sourceReduced.percent,900);
});

test("Bee analogy visibly integrates BOTH reservoir and individual buckets",()=>{
  const sim=read("js/sims.js"), css=read("css/style.css");
  for (const marker of [
    "function drawCapacitorHoneycomb(", "drawCapacitorHoneycomb(x, RC_ENERGY.capacitorStore(Q, P.C, P.U0).fill)",
    "rc-capacitor-storage", "rc-store-honeycomb", "rc-store-meter",
    "RC_ENERGY.capacitorStore(Q, P.C, P.U0)",
    'showCapacitorStore();',
    "Honigwabe · Feldenergie",
    "E꜀ = ½ · C · U꜀²",
    "Kein Elektron und kein Honig durchquert den Plattenzwischenraum.",
    'storedEnergy: RC_ENERGY.capacitorStore(Q, P.C, P.U0)'
  ]) assert.ok(sim.includes(marker), "Missing model/view binding " + marker);
  assert.match(css,/\.rc-store-cell::before/);
  assert.match(css,/\.rc-store-meter/);
  assert.match(css,/@media \(max-width: 560px\)/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});

test("No electrons cross the capacitor dielectric while reservoir display fills",()=>{
  const sim=read("js/sims.js");
  assert.match(sim,/charge: \[\["T", 1\], \["Bd", 1\], \["L", 1\], \["B", 1\]\]/);
  assert.match(sim,/discharge: \[\["B", -1\], \["R", 1\], \["Bd", -1\], \["T", -1\]\]/);
  assert.match(sim,/if \(GX\.style !== "biene"\) return;/);
});

test("All assets compile and the original learning app stays intact",()=>{
  for (const p of ["js/sims.js","js/rc-energy.js","js/gfx.js"])
    assert.doesNotThrow(()=>new vm.Script(read(p)),p);
  const html=read("public/index.html");
  assert.match(html,/rc-capacitor-storage/);
  assert.match(html,/rc-store-honeycomb/);
  assert.match(html,/storedEnergyMicroJ/);
  for(const id of ["tab-lab","tab-learn","tab-sheets","tab-board"])
    assert.ok(html.includes('id="'+id+'"'));
});
