import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const modelContext = { window: {} };
vm.runInNewContext(read("js/rc-energy.js"), modelContext);
const { energyAt, potentialAt } = modelContext.window.PHYS_RC_ENERGY;

test("Bienen-Eimer: Spannungsniveau 1 V erzeugt volle Eimer nach Batterie", () => {
  for (const U0 of [1, 2, 9, 12]) {
    assert.equal(energyAt({ c:"L", d:240 }, "charge", U0, 0), 1);
    assert.equal(energyAt({ c:"L", d:120 }, "charge", U0, 0), 0);
    assert.equal(energyAt({ c:"T", d:25 }, "charge", U0, 0), 1);
  }
});

test("Bienen-Eimer: Widerstand senkt Energie stetig statt mit Nachlauf", () => {
  // Entladung 9 V initial, später nur noch 3 V am Kondensator.
  assert.equal(energyAt({ c:"R", d:330 }, "discharge", 9, 3), 1/3);
  assert.ok(Math.abs(energyAt({ c:"R", d:372 }, "discharge", 9, 3)-1/6)<1e-12);
  assert.equal(energyAt({ c:"R", d:410 }, "discharge", 9, 3), 0);
  assert.equal(energyAt({ c:"R", d:330 }, "discharge", 9, 0), 0);
  assert.equal(potentialAt({ c:"R", d:342 }, "discharge", 9, 3), 0);
  assert.equal(potentialAt({ c:"R", d:402 }, "discharge", 9, 3), 3);
});

test("Bienen-Eimer: offene und getrennte Leitungen behalten den Zustand", () => {
  assert.equal(energyAt({ c:"B", d:3 }, "open", 9, 6), null);
  assert.equal(energyAt({ c:"L", d:240 }, "discharge", 9, 6), null);
  assert.equal(energyAt({ c:"R", d:410 }, "charge", 9, 6), null);
});

test("Grafik: leerer Eimer bleibt leer und sehr kleine Füllung wird sichtbar", () => {
  const fills = [];
  function makeContext() {
    const ctx = {
      fillStyle: "#000000",
      globalAlpha: 1,
      getTransform: () => ({a:1}),
      fill() { fills.push(this.fillStyle); },
      drawImage() {},
    };
    return new Proxy(ctx, {
      get(target, prop) { return prop in target ? target[prop] : () => {}; },
      set(target, prop, value) { target[prop] = value; return true; }
    });
  }
  const document = { createElement: tag => {
    assert.equal(tag,"canvas");
    return {width:0,height:0,getContext: () => makeContext()};
  }};
  const context = { document, window:{},localStorage:{getItem:()=> "biene",setItem(){} } };
  vm.runInNewContext(read("js/gfx.js"),context);
  const gfx=context.window.PHYS_GFX, ctx=makeContext();
  gfx.electron(ctx,{},0,0,1,0);
  assert.equal(fills.includes("#17dfbc"),false,"empty bucket must have no colored energy fill");
  fills.length=0;
  gfx.electron(ctx,{},0,0,1,1/12);
  assert.equal(fills.includes("#17dfbc"),true,"1/12 energy must already be visible");
  fills.length=0;
  gfx.electron(ctx,{},0,0,1,1);
  assert.equal(fills.includes("#17dfbc"),true,"full bucket should show energy fill");
});

test("Labor: sämtliche Simulationsmodule bleiben im Gesamt-Build eingebunden", () => {
  const html = read("public/index.html");
  for (const id of [
    "js/sims.js","js/sims2.js","js/sims3.js","js/sims4.js"
  ]) {
    assert.doesNotThrow(() => new vm.Script(read(id)),id);
  }
  assert.match(html,/Bienen mit Eimer/);
  assert.match(html,/PHYS_RC_ENERGY/);
  assert.match(html,/Herleitung live/);
});

test("Euler-Labor: letzter Schritt ist zeitlich auf 5 τ begrenzt", () => {
  const source=read("js/sims.js");
  assert.ok(source.includes("Math.min(5, (i + 1) * dtau)"));
  assert.ok(source.includes("yMin = dtau > 1 ? -0.6 : 0"));
  for (const h of [.1,.5,1,1.3,1.5]) {
    const n=Math.ceil(5/h-1e-9);
    const end=Math.min(5,n*h);
    assert.ok(end <= 5,"time never exceeds plot domain");
    assert.equal(end,5);
  }
});
