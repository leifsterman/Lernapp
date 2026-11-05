import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const sim = read("js/sims.js");
const css = read("css/style.css");

function readSaved(value) {
  const from = sim.indexOf("      function readSession() {");
  const to = sim.indexOf("      const saved = readSession();", from);
  assert.ok(from >= 0 && to > from, "session reader is present");
  const fn = sim.slice(from, to);
  const storage = {getItem(key) { assert.equal(key, "physikq1.rc-labor.v3"); return value === undefined ? null : JSON.stringify(value); }};
  return vm.runInNewContext('(function(){const sessionKey="physikq1.rc-labor.v3";' + fn + 'return readSession();})()', {sessionStorage:storage});
}

const valid = () => ({
  version:3, wall:Date.now()-16000, mode:"discharge", Q:200, t:18, qty:"U",
  P:{U0:9,R1:5,R2:5,C:470,speed:1}, showPot:false, showTau:true
});

test("Persisted RC session is accepted only when valid", () => {
  const restored = readSaved(valid());
  assert.equal(restored.mode,"discharge");
  assert.equal(restored.Q,200);
  assert.equal(restored.P.R2,5);
  assert.equal(readSaved({...valid(),mode:"explode"}),null);
  assert.equal(readSaved({...valid(),Q:Infinity}),null);
  assert.equal(readSaved({...valid(),P:{...valid().P,C:0}}),null);
  assert.equal(readSaved({...valid(),wall:Date.now()+120000}),null);
});

test("State is saved across app section, browser-tab and page lifecycle switches", () => {
  for(const expected of [
    'sessionStorage.setItem(sessionKey',
    'sessionStorage.getItem(sessionKey)',
    'wall:lastUpdateWall',
    'nT:EL.nT, nB:EL.nB',
    'if (cur?.save) cur.save();',
    'window.addEventListener("pagehide"',
    'document.addEventListener("visibilitychange"',
    'lastUpdateWall = saved ? Math.min(Date.now(), saved.wall) : Date.now()',
    'const saved = readSession();',
    'return { step, draw, resume, save()',
    'saveSession(true);'
  ]) assert.ok(sim.includes(expected), "Expected state/lifecycle rule: "+expected);
  assert.ok(sim.indexOf('const saved = readSession();') < sim.indexOf('function setMode(m)'));
});

test("Open switch fixes meter value to actual Q/C without a decay animation", () => {
  assert.match(sim,/meter = mode === "open" \? Uc\(\) \/ 12/);
  assert.match(sim,/meter = Uc\(\) \/ 12;/);
  assert.match(sim,/blade = BLADE\.open\.slice\(\); meter = 0/);
});

test("Bees show an enlarged, accessible comparison sourced from the same model", () => {
  assert.match(sim,/vergrößerte Ansicht/);
  assert.match(sim,/RC_ENERGY\.energyAt\(\{c:branch/);
  assert.match(sim,/bucketNodes\.beforeValue\.textContent/);
  assert.match(sim,/bucketNodes\.afterValue\.textContent/);
  assert.match(sim,/bucketGuide\.hidden = GX\.style !== "biene"/);
  assert.match(css,/\.rc-energy-comparison/);
  assert.match(css,/\.rc-energy-guide\[hidden\]/);
  assert.match(css,/@media \(max-width: 400px\)/);
  assert.match(css,/\.rc-energy-liquid/);
});

test("Eimer contrast clearly differs from yellow bees in the source drawing",()=>{
  const gfx=read("js/gfx.js");
  assert.match(gfx,/#17dfbc/);
  assert.match(gfx,/#17334a/);
  assert.match(gfx,/style === "biene" \? 11\.2 : 9/);
  assert.ok(!gfx.includes('#ff9d1c'));
});

test("All learning modules survive the build (not only discharge)",()=>{
  const html=read("public/index.html");
  for(const id of ['tab-lab','tab-sheets','tab-learn','tab-board'])assert.ok(html.includes('id="'+id+'"'));
  for(const marker of ['PHYS_RC_FLOW','PHYS_RC_ENERGY','vergrößerte Ansicht','rc-energy-comparison'])
    assert.ok(html.includes(marker),marker+" missing from bundled HTML");
});
