/* Weitere Lernmethoden: Quiz, Rechentrainer, Klausur-Simulation, Zuordnen und Kernübersichten. */
(function () {
  "use strict";
  const A = window.PHYS_APP, TR = window.PHYS_TRAINER, DIA = window.PHYS_DIAGRAMS;
  const $ = (s, r) => (r || document).querySelector(s);
  const S = A.store;
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const toast = A.toast;

  // ------------------------------------------------------------ Statistik
  function stat(key) { return S.stats[key] || (S.stats[key] = { n: 0, ok: 0 }); }
  function renderStats() {
    const mc = stat("mc"), tr = stat("tr"), m = stat("match"), ex = S.stats.exam;
    $("#stat-mc").textContent = mc.n ? Math.round(mc.ok / mc.n * 100) + " % richtig · " + mc.n + " Fragen" : "Noch nicht gespielt";
    $("#stat-tr").textContent = tr.n ? Math.round(tr.ok / tr.n * 100) + " % richtig · " + tr.n + " Aufgaben" : "Noch nicht gespielt";
    $("#stat-match").textContent = m.rounds ? m.rounds + " Runden · " + (m.err || 0) + " Fehler" : "Noch nicht gespielt";
    $("#stat-exam").textContent = ex && ex.best != null ? "Beste: " + ex.best + " % (" + notenpunkte(ex.best) + " Punkte)" : "Noch nicht gespielt";
  }
  function notenpunkte(p) {
    const t = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 39, 33, 27, 20];
    for (let i = 0; i < t.length; i++) if (p >= t[i]) return 15 - i;
    return 0;
  }

  // ------------------------------------------------------------ Aufgaben-Läufer (Quiz, Trainer, Klausur)
  const MC_ALL = () => window.PHYS_MC.concat(window.PHYS_MC_AUTO());
  const mcHidden = q => A.isHidden(q.id) || (q.cardId && A.isHidden(q.cardId));
  const mcPool = (useLevels) => MC_ALL().filter(q => !mcHidden(q) && S.sel.includes(q.topic) && (!useLevels || S.levels.includes(q.lvl)));
  let run = null, timer = null, lastMode = "mc";

  function mkMC(q) {
    const opts = shuffle(q.opts.map((t, i) => ({ t, ok: i === 0 })));
    return { kind: "mc", id: q.id, topic: q.topic, lvl: q.lvl, q: q.q, opts, why: q.why };
  }
  function mkCalc(levels, topics) {
    const t = TR.make(levels, topics);
    return { kind: "calc", topic: t.topic, lvl: t.lvl, task: t, q: t.q };
  }

  function startTasks(mode) {
    lastMode = mode; A.customAgain = null;
    let items = [];
    if (mode === "mc") {
      const pool = mcPool(true);
      if (!pool.length) { toast("Für diesen Filter gibt es keine Fragen. Wähle mehr Themen oder Stufen."); return; }
      items = sample(pool, 10).map(mkMC);
    } else if (mode === "trainer") {
      items = Array.from({ length: 8 }, () => mkCalc(S.levels, S.sel));
    } else {
      // Klausur: gemischte Stufen, nur Themenfilter
      // Klausurfragen bevorzugt aus den handgeschriebenen Fragen (nicht aus den automatischen Größenfragen)
      const all = mcPool(false), hand = all.filter(q => !q.cardId);
      const pool = hand.length >= 6 ? hand : all;
      const pick = lv => { const c = pool.filter(q => q.lvl === lv); return c.length ? rnd(c) : rnd(pool.length ? pool : MC_ALL().filter(q => !mcHidden(q))); };
      const used = new Set();
      const mcs = [1, 2, 2, 3].map(lv => { let q, k = 0; do { q = pick(lv); k++; } while (used.has(q.id) && k < 12); used.add(q.id); return mkMC(q); });
      const calcs = [1, 2, 2, 3].map(lv => mkCalc([lv], S.sel));
      items = shuffle(mcs.concat(calcs));
    }
    run = { mode, items, i: 0, results: [], answered: false, pts: 0, max: 0 };
    run.items.forEach(it => { it.points = mode === "exam" ? (it.kind === "mc" ? 2 : 4) : 1; run.max += it.points; });
    clearInterval(timer);
    if (mode === "exam") {
      run.end = Date.now() + 20 * 60 * 1000;
      $("#task-timer").hidden = false; tickTimer();
      timer = setInterval(tickTimer, 500);
    } else $("#task-timer").hidden = true;
    $("#task-title").textContent = mode === "mc" ? "Quiz" : mode === "trainer" ? "Rechentrainer" : "Klausur-Simulation";
    A.show("task");
    renderTask();
  }

  function tickTimer() {
    if (!run || run.mode !== "exam") return;
    const left = Math.max(0, run.end - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
    const el = $("#task-timer");
    el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    el.classList.toggle("low", left < 3 * 60000);
    if (left === 0) finishTasks(true);
  }

  function renderTask() {
    const it = run.items[run.i];
    run.answered = false;
    $("#task-count").textContent = "Aufgabe " + (run.i + 1) + " von " + run.items.length +
      (run.mode !== "exam" ? " · " + run.pts + " richtig" : " · " + it.points + (it.points === 1 ? " Punkt" : " Punkte"));
    $("#task-progress-bar").style.width = (run.i / run.items.length * 100) + "%";
    $("#task-tag").textContent = A.topicTitle[it.topic] || "";
    $("#task-dot").style.setProperty("--h", A.topicHue[it.topic] || 210);
    $("#task-dot").style.background = "hsl(" + (A.topicHue[it.topic] || 210) + " 70% 58%)";
    const lc = $("#task-lvl"); lc.textContent = A.LVL_NAME[it.lvl]; lc.className = "lvlchip lvl-" + it.lvl;
    $("#task-q").innerHTML = it.q;
    const opts = $("#task-opts"), form = $("#task-form"), fb = $("#task-fb");
    fb.hidden = true; fb.innerHTML = ""; fb.className = "fb";
    $("#task-next").hidden = true; $("#task-giveup").hidden = true;
    if (it.kind === "mc") {
      form.hidden = true; opts.hidden = false;
      opts.innerHTML = it.opts.map((o, i) => '<button type="button" class="opt" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span>' + o.t + "</span></button>").join("");
    } else {
      opts.hidden = true; opts.innerHTML = "";
      form.hidden = false;
      $("#task-input").value = ""; $("#task-input").disabled = false; $("#task-check").disabled = false;
      $("#task-unit").textContent = it.task.unit;
      if (run.mode === "exam") { $("#task-check").hidden = true; $("#task-next").hidden = false; $("#task-next").textContent = lastLabel(); }
      else { $("#task-check").hidden = false; $("#task-giveup").hidden = false; }
      setTimeout(() => $("#task-input").focus({ preventScroll: true }), 50);
    }
    if (run.mode === "exam" && it.kind === "mc") { $("#task-next").hidden = true; }
    $("#task-tools").hidden = !(it.kind === "mc" && run.mode === "mc");
    A.render($("#screen-task"));
  }
  const lastLabel = () => run.i === run.items.length - 1 ? "Abgeben" : "Weiter";

  function recordResult(it, ok, given) {
    run.results.push({ it, ok, given });
    if (ok) { run.pts += 1; }
    if (run.mode !== "exam") { const k = stat(run.mode === "mc" ? "mc" : "tr"); k.n++; if (ok) k.ok++; A.save(); }
  }

  function showFeedback(it, ok, extra) {
    const fb = $("#task-fb");
    fb.hidden = false;
    fb.className = "fb " + (ok ? "good" : "bad");
    fb.innerHTML = '<p class="fb-title">' + (ok ? "Richtig" : "Leider falsch") + "</p>" + extra;
    A.render(fb);
    $("#task-next").hidden = false; $("#task-next").textContent = lastLabel();
    $("#task-giveup").hidden = true;
  }

  // Auswahl bei Multiple Choice
  $("#task-opts").addEventListener("click", e => {
    const b = e.target.closest(".opt");
    if (!b || !run) return;
    const it = run.items[run.i];
    if (run.answered && run.mode !== "exam") return;
    const idx = +b.dataset.i;
    if (run.mode === "exam") {
      run.chosen = idx; run.answered = true;
      document.querySelectorAll("#task-opts .opt").forEach(o => o.classList.toggle("picked", +o.dataset.i === idx));
      $("#task-next").hidden = false; $("#task-next").textContent = lastLabel();
      return;
    }
    run.answered = true;
    const ok = it.opts[idx].ok;
    document.querySelectorAll("#task-opts .opt").forEach(o => {
      o.disabled = true;
      const oi = +o.dataset.i;
      if (it.opts[oi].ok) o.classList.add("right");
      else if (oi === idx) o.classList.add("wrong");
    });
    recordResult(it, ok, it.opts[idx].t);
    showFeedback(it, ok, it.why ? '<div class="why">' + it.why + "</div>" : "");
  });

  // Eingabe bei Rechenaufgaben
  $("#task-form").addEventListener("submit", e => {
    e.preventDefault();
    if (!run || run.mode === "exam") return;
    const it = run.items[run.i];
    if (run.answered) return;
    const val = $("#task-input").value;
    const res = TR.check(it.task, val);
    if (res.bad) { toast("Bitte eine Zahl eingeben, z. B. 2,5 oder 3e-4."); return; }
    run.answered = true;
    $("#task-input").disabled = true; $("#task-check").disabled = true;
    recordResult(it, res.ok, val);
    showFeedback(it, res.ok, (res.ok ? "" : '<p>Richtig wäre <b>' + TR.fmtAns(it.task) + "</b> (du: " + esc(val) + ").</p>") + '<div class="why">' + it.task.sol + "</div>");
  });
  $("#task-giveup").addEventListener("click", () => {
    if (!run || run.answered) return;
    const it = run.items[run.i];
    run.answered = true;
    $("#task-input").disabled = true; $("#task-check").disabled = true;
    recordResult(it, false, "");
    showFeedback(it, false, '<p>Lösung: <b>' + TR.fmtAns(it.task) + '</b></p><div class="why">' + it.task.sol + "</div>");
  });

  // Frage löschen (nur für mich / für alle)
  function delTask(scope) {
    if (!run) return;
    const it = run.items[run.i];
    if (!it || it.kind !== "mc") return;
    A.hideItem(it.id, A.plain(it.q), scope, () => {
      if (run.answered) return; // bereits gewertet: nur für künftige Runden ausgeblendet
      run.items.splice(run.i, 1); run.max -= it.points;
      if (run.i >= run.items.length) finishTasks(false); else renderTask();
    });
  }
  $("#tdel-me").addEventListener("click", () => delTask("me"));
  $("#tdel-all").addEventListener("click", () => delTask("all"));

  $("#task-next").addEventListener("click", nextTask);
  // Antwort der gerade angezeigten Klausuraufgabe festhalten
  function captureExamAnswer() {
    const it = run.items[run.i];
    if (!it) return;
    let ok = false, given = "";
    if (it.kind === "mc") { if (run.chosen != null) { ok = it.opts[run.chosen].ok; given = it.opts[run.chosen].t; } }
    else { given = $("#task-input").value; if (given.trim()) { const r = TR.check(it.task, given); ok = !!r.ok; } }
    run.results.push({ it, ok, given });
    if (ok) run.pts += it.points;
    run.chosen = null;
  }
  function nextTask() {
    if (!run) return;
    if (run.mode === "exam") captureExamAnswer();
    run.i++;
    if (run.i >= run.items.length) finishTasks(false); else renderTask();
  }

  function finishTasks(timeout) {
    clearInterval(timer);
    if (!run) return;
    if (run.mode === "exam") {
      // Bei Zeitablauf zählt die gerade eingetragene Antwort noch mit, nicht bearbeitete Aufgaben gelten als falsch
      if (timeout && run.results.length === run.i) captureExamAnswer();
      for (let k = run.results.length; k < run.items.length; k++) run.results.push({ it: run.items[k], ok: false, given: "" });
    }
    const exam = run.mode === "exam";
    const total = exam ? run.max : run.items.length;
    const got = run.pts;
    const pct = Math.round(got / total * 100);
    $("#result-title").textContent = exam ? "Klausur abgegeben" : run.mode === "mc" ? "Quiz beendet" : "Runde beendet";
    $("#result-sub").textContent = exam
      ? (timeout ? "Die Zeit ist abgelaufen. " : "") + got + " von " + total + " Punkten."
      : got + " von " + total + " richtig.";
    const sc = $("#result-score"); sc.hidden = false;
    sc.innerHTML = '<div class="scorebar"><div style="width:' + pct + '%"></div></div><p class="bignum">' + pct + " %" +
      (exam ? ' <span class="np">≈ ' + notenpunkte(pct) + " Notenpunkte</span>" : "") + "</p>" +
      (exam ? '<p class="fine tight">Notenpunkte nach üblicher Oberstufen-Tabelle, ungefähr. Deine Schule kann abweichen.</p>' : "");
    if (exam) { const ex = S.stats.exam || (S.stats.exam = {}); ex.last = pct; ex.best = Math.max(ex.best || 0, pct); A.save(); }
    // Rückblick
    const rv = $("#result-review"); rv.hidden = false;
    rv.innerHTML = "<h2>Rückblick</h2>" + run.results.map((r, i) => {
      const it = r.it;
      const right = it.kind === "mc" ? it.opts.find(o => o.ok).t : TR.fmtAns(it.task);
      return '<div class="rv ' + (r.ok ? "good" : "bad") + '"><div class="rv-h"><span class="rv-n">' + (i + 1) + "</span><b>" + (r.ok ? "Richtig" : "Falsch") + "</b>" +
        (exam ? ' <span class="fine nomargin">' + (r.ok ? it.points : 0) + "/" + it.points + "</span>" : "") + '</div><div class="rv-q">' + it.q + "</div>" +
        (r.ok ? "" : '<div class="rv-a">' + (r.given ? "Deine Antwort: " + (it.kind === "mc" ? r.given : esc(r.given)) + "<br>" : "Keine Antwort.<br>") + "Richtig: " + right + "</div>") +
        (exam && it.kind === "calc" && !r.ok ? '<details><summary>Lösungsweg</summary>' + it.task.sol + "</details>" : "") + "</div>";
    }).join("");
    A.show("result");
    A.render($("#screen-result"));
    if (pct >= 70) A.confetti();
    run.done = true;
  }

  $("#task-quit").addEventListener("click", () => { clearInterval(timer); A.home(); });
  $("#result-home").addEventListener("click", () => { A.customAgain = null; A.home(); });
  $("#result-again").addEventListener("click", () => { if (A.customAgain) A.customAgain(); else startTasks(lastMode); });
  $("#m-mc").addEventListener("click", () => startTasks("mc"));
  $("#m-trainer").addEventListener("click", () => startTasks("trainer"));
  $("#m-exam").addEventListener("click", () => startTasks("exam"));

  // ------------------------------------------------------------ Zuordnen
  let match = null;
  const MODES = { 1: ["symbol", "Formelzeichen"], 2: ["unit", "SI-Einheit"], 3: ["formula", "Formel"] };
  function startMatch() { match = { rounds: 0, err: 0 }; A.show("match"); nextMatchRound(); }
  function nextMatchRound() {
    const lvl = rnd(S.levels), mk = MODES[lvl][0];
    const strip = s => String(s).replace(/&nbsp;/g, " ").replace(/\\dfrac/g, "\\tfrac");
    const sizes = A.liveCards().filter(c => c.type === "size");
    const count = {}; sizes.forEach(c => { const v = strip(c[mk]); count[v] = (count[v] || 0) + 1; });
    const ok = sizes.filter(c => count[strip(c[mk])] === 1);
    const pairs = sample(ok, 6).map(c => ({ name: c.front, val: strip(c[mk]) }));
    match.round = { lvl, label: MODES[lvl][1], pairs, left: shuffle(pairs.map((p, i) => i)), right: shuffle(pairs.map((p, i) => i)), done: new Set(), sel: null, err: 0 };
    $("#match-title").textContent = "Zuordnen · " + A.LVL_NAME[lvl];
    $("#match-hint").textContent = "Verbinde jede Größe mit ihrer " + MODES[lvl][1] + ". Tippe links und dann rechts.";
    $("#match-actions").hidden = true;
    renderMatch();
  }
  function renderMatch() {
    const r = match.round;
    const btn = (side, idx) => {
      const p = r.pairs[idx], done = r.done.has(idx);
      return '<button type="button" class="mitem' + (done ? " done" : "") + '" data-side="' + side + '" data-i="' + idx + '"' + (done ? " disabled" : "") + ">" +
        (side === "l" ? p.name : p.val) + "</button>";
    };
    $("#match-left").innerHTML = r.left.map(i => btn("l", i)).join("");
    $("#match-right").innerHTML = r.right.map(i => btn("r", i)).join("");
    $("#match-count").textContent = r.done.size + " von " + r.pairs.length + " · " + r.err + " Fehler";
    $("#match-progress-bar").style.width = (r.done.size / r.pairs.length * 100) + "%";
    A.render($("#screen-match"));
  }
  function onMatchClick(e) {
    const b = e.target.closest(".mitem");
    if (!b || !match) return;
    const r = match.round, side = b.dataset.side, idx = +b.dataset.i;
    if (!r.sel || r.sel.side === side) {
      r.sel = { side, idx };
      document.querySelectorAll(".mitem").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      return;
    }
    const a = r.sel; r.sel = null;
    if (a.idx === idx) {
      r.done.add(idx);
      renderMatch();
      if (r.done.size === r.pairs.length) endMatchRound();
    } else {
      r.err++; match.err++;
      const other = document.querySelector('.mitem[data-side="' + a.side + '"][data-i="' + a.idx + '"]');
      [b, other].forEach(x => x && x.classList.add("bad"));
      setTimeout(() => { document.querySelectorAll(".mitem").forEach(x => x.classList.remove("bad", "sel")); }, 550);
      $("#match-count").textContent = r.done.size + " von " + r.pairs.length + " · " + r.err + " Fehler";
    }
  }
  function endMatchRound() {
    const m = stat("match"); m.rounds = (m.rounds || 0) + 1; m.err = (m.err || 0) + match.round.err; A.save();
    $("#match-hint").textContent = match.round.err === 0 ? "Perfekt, kein Fehler!" : "Geschafft mit " + match.round.err + (match.round.err === 1 ? " Fehler." : " Fehlern.");
    $("#match-actions").hidden = false;
    if (match.round.err === 0) A.confetti();
  }
  $("#match-left").addEventListener("click", onMatchClick);
  $("#match-right").addEventListener("click", onMatchClick);
  $("#m-match").addEventListener("click", startMatch);
  $("#match-next").addEventListener("click", nextMatchRound);
  $("#match-home").addEventListener("click", () => A.home());
  $("#match-quit").addEventListener("click", () => A.home());

  // ------------------------------------------------------------ Kernübersichten
  const SHEETS = window.PHYS_SHEETS;
  const DIA_NAMES = { pos: "Positive Punktladung", neg: "Negative Punktladung", dipole: "Dipol", pospos: "Zwei gleichnamige Ladungen",
    plates: "Plattenkondensator", tip: "Spitzeneffekt", faraday: "Faradayscher Käfig", rc: "Auf- und Entladung", millikan: "Millikan-Versuch" };
  let sheetIdx = 0;
  function renderSheetList() {
    $("#sheet-list").innerHTML = SHEETS.map((s, i) =>
      '<li><button type="button" class="sheet-item" data-i="' + i + '" style="--h:' + (A.topicHue[s.id] != null ? A.topicHue[s.id] : 205) + '"><span class="sname">' + s.title +
      '</span><span class="ssub">' + s.sub + "</span></button></li>").join("");
  }
  function openSheet(i) {
    sheetIdx = (i + SHEETS.length) % SHEETS.length;
    const s = SHEETS[sheetIdx];
    $("#sheet-title").textContent = s.title;
    $("#sheet-sub").textContent = s.sub;
    $("#sheet-body").innerHTML = s.html;
    $("#sheet-dia").innerHTML = s.dia.filter(d => DIA[d]).map(d => '<figure>' + DIA[d]() + "<figcaption>" + DIA_NAMES[d] + "</figcaption></figure>").join("");
    $("#sheet-practice").hidden = !A.topicTitle[s.id];
    A.show("sheet");
    A.render($("#screen-sheet"));
  }
  $("#sheet-list").addEventListener("click", e => { const b = e.target.closest(".sheet-item"); if (b) openSheet(+b.dataset.i); });
  $("#sheet-prev").addEventListener("click", () => openSheet(sheetIdx - 1));
  $("#sheet-next").addEventListener("click", () => openSheet(sheetIdx + 1));
  $("#sheet-back").addEventListener("click", () => { A.setTab("sheets"); A.home(); });
  $("#sheet-practice").addEventListener("click", () => A.startCards(SHEETS[sheetIdx].id));
  $("#sheet-print").addEventListener("click", () => { try { window.print(); } catch (e) { toast("Drucken geht hier nicht."); } });
  renderSheetList();
  A.openSheet = id => { const i = SHEETS.findIndex(s => s.id === id); if (i >= 0) openSheet(i); };

  // ------------------------------------------------------------ Tasten und Hooks
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("#dlg")) return;
    const cur = document.querySelector("main > .screen:not([hidden])");
    if (!cur) return;
    const id = cur.id;
    if (e.key === "Escape" && ["screen-task", "screen-match", "screen-result", "screen-sheet", "screen-sim", "screen-label"].includes(id)) { clearInterval(timer); A.home(); return; }
    if (id === "screen-task" && run) {
      const inField = e.target.tagName === "INPUT";
      const it = run.items[run.i];
      if (it && it.kind === "mc" && /^[1-4]$/.test(e.key) && !inField) {
        const b = document.querySelector('#task-opts .opt[data-i="' + (+e.key - 1) + '"]');
        if (b && !b.disabled) b.click();
      } else if (e.key === "Enter" && !inField && !$("#task-next").hidden) { e.preventDefault(); nextTask(); }
      else if (e.key === "Enter" && inField && run.mode === "exam") { e.preventDefault(); nextTask(); }
    }
  });
  // ------------------------------------------------------------ Gelöschte Karten
  function labelOf(id) {
    const c = window.PHYS_CARDS.find(x => x.id === id);
    if (c) return A.plain(c.front);
    const q = MC_ALL().find(x => x.id === id);
    return q ? "Quiz: " + A.plain(q.q) : id;
  }
  function renderDeleted() {
    const list = A.hiddenList();
    $("#deleted-empty").hidden = list.length > 0;
    $("#deleted-list").innerHTML = list.map(h =>
      '<li><div class="d-t">' + esc(labelOf(h.id)) + '</div><div class="d-m"><span class="badge' + (h.all ? " all" : "") + '">' +
      (h.all ? "für alle" + (h.by ? " · " + esc(h.by) : "") : "nur für mich") + "</span>" +
      (h.me ? '<button type="button" class="link" data-id="' + esc(h.id) + '" data-scope="me">Für mich zurück</button>' : "") +
      (h.all ? '<button type="button" class="link" data-id="' + esc(h.id) + '" data-scope="all">Für alle zurück</button>' : "") + "</div></li>").join("");
  }
  $("#deleted-list").addEventListener("click", async e => {
    const b = e.target.closest("button[data-id]"); if (!b) return;
    const ok = await A.restoreItem(b.dataset.id, b.dataset.scope);
    if (ok) toast("Wiederhergestellt");
  });
  A.onChange(renderDeleted);

  A.onShow(name => {
    if (name !== "task") clearInterval(timer);
    if (name === "start") { renderStats(); renderDeleted(); }
  });
  renderStats();
  renderDeleted();
})();
