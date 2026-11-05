import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");

test("Lern-App JavaScript parses", () => {
  assert.doesNotThrow(() => new vm.Script(read("js/entladung.js")));
});

test("built page includes lesson and inline assets", () => {
  const html = read("public/index.html");
  assert.match(html, /Kondensatorentladung/);
  assert.match(html, /id="step-list"/);
  assert.match(html, /id="flashcard"/);
  assert.match(html, /id="reason"/);
  assert.match(html, /katex/);
  assert.doesNotMatch(html, /src="js\/entladung.js"/);
  assert.doesNotMatch(html, /href="css\/entladung.css"/);
  assert.doesNotMatch(html, /src="vendor\/katex\/katex.min.js"/);
});

test("the given exponential satisfies the physical differential equation", () => {
  for (const R of [100, 2200, 10000]) {
    for (const C of [1e-6, 470e-6]) {
      for (const t of [0, R*C/2, R*C, 3*R*C]) {
        const Q0 = 8e-6;
        const q = Q0 * Math.exp(-t/(R*C));
        const qDot = -q/(R*C);
        const residual = q + R*C*qDot;
        assert.ok(Math.abs(residual)<1e-18, "Differential equation residue nonzero");
        if(t===0) assert.equal(q,Q0);
      }
    }
  }
});

test("the lesson contains the user's main problem areas", () => {
  const text = read("js/entladung.js");
  for (const marker of ["Maschenregel", "Warum bleibt Q₀", "Kettenregel", "k bereits", "RC", "0 = 0", "Warum gibt es dieselbe Rechnung mit U"]) {
    assert.ok(text.includes(marker), "Missing lesson topic: " + marker);
  }
});
