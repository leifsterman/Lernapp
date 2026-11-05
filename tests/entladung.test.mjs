import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");

test("The complete original Lernapp remains the landing page", () => {
  const html = read("public/index.html");
  for (const expected of [
    'id="tab-learn"', 'id="tab-lab"', 'id="tab-sheets"',
    'id="tab-board"', 'id="tab-more"', 'id="m-mc"', 'id="m-trainer"',
    'id="m-exam"', 'id="sim-list"', 'id="topic-list"',
    'href="entladung.html"'
  ]) {
    assert.ok(html.includes(expected), "Missing main-app feature: " + expected);
  }
  assert.match(html, /Aufladung/);
  assert.match(html, /nicht benötigt/);
  assert.match(html, /window\.PHYS_APP/);
});

test("The guided discharge lesson is built separately, with all scripts inlined", () => {
  const html = read("public/entladung.html");
  assert.match(html, /Kondensatorentladung/);
  assert.match(html, /id="step-list"/);
  assert.match(html, /id="flashcard"/);
  assert.match(html, /id="reason"/);
  assert.match(html, /Zurück zur Lernapp/);
  assert.match(html, /katex/);
  assert.doesNotMatch(html, /src="js\/entladung.js"/);
  assert.doesNotMatch(html, /href="css\/entladung.css"/);
  assert.doesNotMatch(html, /src="vendor\/katex\/katex.min.js"/);
});

test("All restored and new JavaScript modules parse", () => {
  for (const path of [
    "js/app.js", "js/cards.js", "js/methods.js",
    "js/sims.js", "js/sims2.js", "js/sims3.js", "js/sims4.js",
    "js/quiz.js", "js/trainer.js", "js/sheets.js",
    "js/entladung.js"
  ]) {
    assert.doesNotThrow(() => new vm.Script(read(path)), path);
  }
});

test("The given exponential satisfies the physically derived differential equation", () => {
  for (const R of [100, 2200, 10000]) {
    for (const C of [1e-6, 470e-6]) {
      for (const t of [0, R*C/2, R*C, 3*R*C]) {
        const Q0 = 8e-6;
        const q = Q0 * Math.exp(-t/(R*C));
        const qDot = -q/(R*C);
        assert.ok(Math.abs(q + R*C*qDot) < 1e-18);
        if (t === 0) assert.equal(q,Q0);
      }
    }
  }
});

test("The app retains other cards and marks charging as optional", () => {
  const cards = read("js/cards.js");
  for (const topic of ["influenz", "polar", "feldlinien", "kondensator", "millikan", "ladung"]) {
    assert.ok(cards.includes('id: "' + topic + '"'), "Topic missing: " + topic);
  }
  assert.match(cards, /Aufladung aktuell nicht benötigt/);
  assert.match(read("js/sheets.js"), /Aufladung – aktuell nicht benötigt/);
  assert.match(read("js/trainer.js"), /Aufladung U\(t\) – Zusatzwissen/);
});
