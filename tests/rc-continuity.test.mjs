import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const scope = { window: {} };
vm.runInNewContext(read("js/rc-flow.js"), scope);
const M = scope.window.PHYS_RC_FLOW;
const P = { U0: 9, C: 470, R1: 5, R2: 5, speed: 1 };

function near(a, b, tolerance = 1e-10) {
  assert.ok(Math.abs(a - b) <= tolerance, "expected " + a + " ≈ " + b);
}

test("RC theory: one tau discharges to 1/e; changing R,C changes only tau", () => {
  for(const R2 of [1, 5, 10])for(const C of [100, 470, 1000]){
    const p={...P,R2,C};const q0=C*p.U0;
    near(M.evolve(q0,"discharge",p,M.tau("discharge",p)),q0/Math.E,1e-8);
    assert.ok(M.evolve(q0,"discharge",p,100*M.tau("discharge",p)) < 1e-30);
    near(M.evolve(q0,"open",p,15000),q0);
    near(M.evolve(0,"charge",p,M.tau("charge",p)),q0*(1-1/Math.E),1e-8);
  }
});

test("Window-switch catch-up: elapsed seconds, including hidden time, use exact physics", () => {
  const q0=P.C*P.U0;
  const early=M.evolve(q0,"discharge",P,.3);
  const rest=M.evolve(early,"discharge",P,37.7);
  const direct=M.evolve(q0,"discharge",P,38);
  near(rest,direct,1e-9);
  near(M.evolve(rest,"open",P,20000),rest,1e-9);
  const resumed=M.evolve(rest,"charge",P,5);
  assert.ok(resumed>rest && resumed<=q0);
});

test("Series-resistor current is continuous: no electron is consumed in R",()=>{
  for(const q of [0,P.C*P.U0*.2,P.C*P.U0]){
    const iDischarge=-(q/P.C)/P.R2;
    const rate=-q/(P.R2*P.C/1000); // µC/s
    near(iDischarge,rate/1000,1e-12);
  }
  // Only the capacitor plates are termini of charge/discharge routes.
  const code=read("js/sims.js");
  assert.match(code,/charge: \[\["T", 1\], \["Bd", 1\], \["L", 1\], \["B", 1\]\]/);
  assert.match(code,/discharge: \[\["B", -1\], \["R", 1\], \["Bd", -1\], \["T", -1\]\]/);
  assert.ok(!code.includes('["T", 1], ["B", 1]'),"No path through capacitor dielectric");
});

test("Illustrative particle motion tracks transferred fraction, not fixed voltage or C",()=>{
  for(const scale of [1,9,12]){
    const p={...P,U0:scale};
    const delta=.4*p.C*p.U0;
    near(M.travel(delta,"charge",p),144);
    near(M.travel(-delta,"discharge",p),144);
    near(M.travel(-delta,"charge",p),-144);
    near(M.travel(delta,"open",p),0);
  }
});

test("Reverse charging current: bucket energy falls across source and resistor in the opposite direction", () => {
  const rcEnergy={window:{}};
  vm.runInNewContext(read("js/rc-energy.js"),rcEnergy);
  const E=rcEnergy.window.PHYS_RC_ENERGY;
  const U0=3,Uc=9;
  const atNegativePlate=E.energyAt({c:"B",d:12},"charge",U0,Uc);
  const afterBattery=E.energyAt({c:"L",d:170},"charge",U0,Uc);
  const beforePositivePlate=E.energyAt({c:"L",d:10},"charge",U0,Uc);
  near(atNegativePlate,1);
  near(afterBattery,2/3);
  near(beforePositivePlate,0);
  assert.ok(atNegativePlate>afterBattery && afterBattery>beforePositivePlate);
});

test("Both capacitor plates always show equal magnitudes, even small fractions",()=>{
  for(const f of [0,.001,.02,.1,.6,1]){
    const dots=M.plateDots(f*P.C*P.U0,P,9);
    near(dots.reduce((sum,v)=>sum+v,0),9*f,1e-10);
    assert.ok(dots.every(x=>x>0&&x<=1));
  }
  assert.equal(M.plateDots(0,P,9).length,0);
  assert.equal(M.plateDots(.005*P.C*P.U0,P,9).length,1);
});

test("Render lifecycle resumes from wall-clock, and does not render hidden canvas",()=>{
  const source=read("js/sims.js");
  for(const snippet of [
    'if (document.hidden) { raf = 0; return; }',
    'if (cur.resume) cur.resume();',
    'lastUpdateWall = now;',
    'advanceElapsed(seconds);',
    'RC_FLOW.evolve(startQ, mode, P, ds)',
    'RC_FLOW.plateDots(Q, P, 9)',
    'EL.e.forEach(p =>',
    'return { step, draw, resume, save()',
    'blade = BLADE[m].slice();'
  ]) assert.ok(source.includes(snippet), "Missing lifecycle requirement: "+snippet);
  // Prevent a recurrence of the old frame-limited integration and stale counter-based plates.
  assert.ok(!source.includes('const dK = (Q - prevK) / 600'));
  assert.ok(!source.includes('Math.min(9, Math.max(0, EL.nB))'));
});

test("Rendering and source modules parse; bundled page contains every laboratory",()=>{
  for(const file of ["js/rc-flow.js","js/rc-energy.js","js/gfx.js","js/sims.js","js/sims2.js","js/sims3.js","js/sims4.js"])
    assert.doesNotThrow(()=>new vm.Script(read(file)),file);
  const html=read("public/index.html");
  assert.match(html,/PHYS_RC_FLOW/);
  assert.match(html,/PHYS_RC_ENERGY/);
  assert.match(html,/id="tab-lab"/);
  assert.match(html,/Herleitung live/);
});

test("Electron tracer transitions preserve mobile-plus-plate charge bookkeeping",()=>{
  // Isolate original route transition function for a fast, deterministic test
  // without a browser or dependence on canvas drawing.
  const source=read("js/sims.js");
  const start=source.indexOf("  function moveElectrons(");
  const end=source.indexOf("  // Der Eimer",start);
  assert.ok(start>=0 && end>start,"particle transport function not found");
  const script=source.slice(start,end)+"\nmoveElectrons;";
  const chains={ T:50, Bd:65, L:510, B:60, R:390 };
  const routes={charge:[["T",1],["Bd",1],["L",1],["B",1]], discharge:[["B",-1],["R",1],["Bd",-1],["T",-1]]};
  const move=vm.runInNewContext(script,{SP:20,CLEN:chains,ROUTE:routes});
  const initial=[
    ...Array.from({length:2},(_,i)=>({c:"T",d:10+i*20})),
    ...Array.from({length:3},(_,i)=>({c:"B",d:10+i*20})),
    ...Array.from({length:5},(_,i)=>({c:"L",d:30+i*80})),
    ...Array.from({length:5},(_,i)=>({c:"R",d:30+i*65})),
    {c:"Bd",d:25}
  ];
  const state={ e:initial,nT:0,nB:0 };
  const invariant=()=>state.e.length+state.nB-state.nT;
  const base=invariant();
  for(let i=0;i<100;i++)move(state,"charge",4);
  for(let i=0;i<100;i++)move(state,"discharge",4);
  for(let i=0;i<20;i++)move(state,"charge",-4);
  assert.equal(invariant(),base,"mobile tracers and plate reservoirs must balance");
  assert.ok(state.e.every(p=>Number.isFinite(p.d)&&p.d>=0&&p.d<=chains[p.c]),
    "all visible particles must stay on connected conductors");
  assert.ok(state.e.length>0,"moving particles should remain visible");
});


test("Other electron lab scenes show stationary tracers rather than hiding them",()=>{
  const series=read("js/sims3.js");
  const derivation=read("js/sims4.js");
  assert.ok(series.includes("phase += dt * 60 * flowAmt;"));
  assert.ok(!series.includes("if (flowAmt < 0.03) return;"));
  assert.ok(series.includes("GX.electron"));
  assert.ok(derivation.includes("if (o.paths) o.paths.forEach"));
  assert.ok(!derivation.includes("if (!(o.res && inRes(p)))"));
  assert.ok(derivation.includes("m.ph += (m.run ? 10 * Math.abs(m.I()) : 0) * dt;"));
  assert.ok(!derivation.includes("paths: m.run ? [DIS] : []"));
});
