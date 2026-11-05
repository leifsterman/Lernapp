/* Labor: interaktive Simulationen (Canvas) und die Übung „Schaltung beschriften“.
   Gerüst, RC-Schaltung, Euler-Verfahren. Weitere Simulationen stehen in sims2.js. */
(function () {
  "use strict";
  const A = window.PHYS_APP;
  const $ = (s, r) => (r || document).querySelector(s);
  const S = A.store;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const TEXT = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
  const el = (tag, cls, html) => {
    const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html;
    if (cls === "sim-info") { // Infotexte werden jedes Bild gesetzt: nur bei Änderung ins DOM schreiben
      let last = e.textContent;
      Object.defineProperty(e, "textContent", { get: () => last, set: v => { if (v !== last) { last = v; TEXT.set.call(e, v); } } });
    }
    return e;
  };
  const de = (x, n) => String(Number(x.toPrecision(n || 3))).replace(".", ",");

  // ------------------------------------------------------------ Farben aus dem Theme
  let colCache = null, colKey = "";
  function colors() {
    const key = (document.documentElement.getAttribute("data-theme") || "") + (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "d" : "l");
    if (colCache && key === colKey) return colCache;
    colKey = key; colCache = readColors(); return colCache;
  }
  function readColors() {
    const s = getComputedStyle(document.documentElement), g = n => s.getPropertyValue(n).trim();
    return { fg: g("--fg"), dim: g("--fg-dim"), line: g("--line"), border: g("--border"), surf: g("--surface"), surf2: g("--surface-2"),
      pos: g("--pos"), neg: g("--neg"), ok: g("--ok"), bad: g("--bad"), warn: g("--warn"), accent: g("--accent") };
  }

  // ------------------------------------------------------------ Zeichenfläche mit festem Seitenverhältnis
  function stage(w, h, cls) {
    const c = document.createElement("canvas");
    c.className = "sim-canvas" + (cls ? " " + cls : "");
    c.style.aspectRatio = w + " / " + h;
    const o = { c, w, h, ctx: c.getContext("2d"), scale: 1 };
    o.fit = () => {
      const cw = c.clientWidth || w, dpr = window.devicePixelRatio || 1;
      const pw = Math.round(cw * dpr), ph = Math.round(cw * h / w * dpr);
      if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
      o.scale = pw / w;
      o.ctx.setTransform(o.scale, 0, 0, o.scale, 0, 0);
      o.ctx.clearRect(0, 0, w, h);
    };
    o.pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; };
    return o;
  }

  // ------------------------------------------------------------ kleine Bedienelemente
  function slider(host, o) {
    const row = el("label", "sim-row");
    const lab = el("span", "sim-lab"), val = el("output", "sim-val");
    const inp = document.createElement("input");
    inp.type = "range"; inp.min = o.min; inp.max = o.max; inp.step = o.step; inp.value = o.value;
    const fmt = o.fmt || (v => de(+v));
    const upd = () => { val.textContent = fmt(+inp.value); lab.textContent = o.label; };
    inp.addEventListener("input", () => { upd(); o.onInput && o.onInput(+inp.value); });
    upd();
    row.append(lab, inp, val); host.append(row);
    return { set(v) { inp.value = v; upd(); }, get: () => +inp.value, el: row };
  }
  function seg(host, o) {
    const wrap = el("div", "sim-seg");
    if (o.label) wrap.append(el("span", "sim-lab", o.label));
    const box = el("div", "seg");
    const btns = o.options.map(op => {
      const b = el("button", "", op.t); b.type = "button";
      b.addEventListener("click", () => { set(op.v); o.onChange && o.onChange(op.v); });
      box.append(b); return b;
    });
    function set(v) { o.options.forEach((op, i) => btns[i].setAttribute("aria-pressed", op.v === v)); }
    set(o.value);
    wrap.append(box); host.append(wrap);
    return { set };
  }
  function button(host, text, fn, cls) { const b = el("button", "btn small " + (cls || ""), text); b.type = "button"; b.addEventListener("click", fn); host.append(b); return b; }
  function notes(host, title, items) {
    const d = el("div", "sim-notes", "<h3>" + title + "</h3><ul>" + items.map(i => "<li>" + i + "</li>").join("") + "</ul>");
    host.append(d); A.render(d); return d;
  }
  function readouts(host, keys) {
    const box = el("div", "readouts");
    const spans = {};
    keys.forEach(([k, label]) => { const d = el("div", "ro", '<span class="ro-l">' + label + '</span><span class="ro-v">–</span>'); spans[k] = d.querySelector(".ro-v"); box.append(d); });
    host.append(box);
    const last = {};
    return o => { for (const k in o) if (spans[k] && last[k] !== o[k]) { last[k] = o[k]; spans[k].textContent = o[k]; } };
  }

  // ------------------------------------------------------------ Schleife
  const SIMS = [], INST = {};
  let cur = null, raf = 0, last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = Math.max(last, now); // nie negativ (sonst NaN bei Zufallsbewegung)
    if (cur) { cur.step && cur.step(dt); cur.draw && cur.draw(); }
  }
  function startLoop(obj) { stopLoop(); cur = obj; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; cur = null; }
  A.onShow(name => { if (name !== "sim" && name !== "label") stopLoop(); });

  const styleBoxes = [];
  A.openSim = id => openSim(id);
  function openSim(id) {
    const def = SIMS.find(s => s.id === id); if (!def) return;
    const host = $("#sim-host");
    // Der Versuch bleibt beim Wechseln der Ansicht erhalten (Zustand, Ladungen, Messreihe): einmal bauen, danach nur wieder einhängen.
    let inst = INST[id];
    if (!inst) { const box = document.createElement("div"); host.replaceChildren(box); inst = INST[id] = { box, obj: def.make(box) }; }
    else host.replaceChildren(inst.box);
    if (styleBoxes[1]) styleBoxes[1].hidden = !def.el; // Darstellung nur, wo Elektronen vorkommen
    $("#sim-title").textContent = def.title;
    $("#sim-sheet").dataset.sheet = def.sheet || "";
    $("#sim-sheet").hidden = !def.sheet;
    A.show("sim");
    startLoop(inst.obj);
  }
  const ORDER = ["herleitung", "rc", "euler", "kond", "qu", "rp", "mill", "millq", "pol", "feld"];
  function renderSimList() {
    SIMS.sort((a, b) => (ORDER.indexOf(a.id) + 99) % 99 - (ORDER.indexOf(b.id) + 99) % 99);
    $("#sim-list").innerHTML = SIMS.map(s => '<button type="button" class="method" data-sim="' + s.id + '"><span class="micon">' + (s.icon || "") + '</span><span class="mname">' + s.title + '</span><span class="mdesc">' + s.desc + "</span></button>").join("");
  }
  // Darstellung der Elektronen (Punkt, Männchen mit Armen, Biene mit Eimer): gilt in allen Versuchen und bleibt gespeichert
  const STYLES = [{ v: "punkt", t: "● Punkt" }, { v: "mann", t: "☺ Männchen" }, { v: "biene", t: "🐝 Biene" }];
  const STYLE_HINT = { punkt: "", mann: "Männchen mit Armen: Wer viel Energie hat (nach der Batterie), freut sich mit erhobenen Armen. Wer sie abgegeben hat (nach dem Widerstand), ist müde. Wie schnell sie laufen, zeigt die Stromstärke.",
    biene: "Bienen mit Eimer: Der Füllstand veranschaulicht elektrische Energie pro Ladung relativ zur eingestellten Anfangsspannung (kein echter Energietransport in einem Eimer). Beim Entladen sinkt die verfügbare Energie vor R₂ mit Uc; hinter R₂ ist der Eimer leer. Der Strom bestimmt die Bewegung, nicht den Füllstand." };
  function makeStyleBox() {
    const box = el("div", "sim-style"), hint = el("p", "fine tight");
    const sg = seg(box, { label: "Elektronen darstellen als", options: STYLES, value: window.PHYS_GFX.style, onChange: v => { window.PHYS_GFX.setStyle(v); styleBoxes.forEach(b => b.sync()); } });
    box.append(hint);
    box.sync = () => { sg.set(window.PHYS_GFX.style); hint.textContent = STYLE_HINT[window.PHYS_GFX.style]; hint.hidden = !hint.textContent; };
    box.sync(); styleBoxes.push(box); return box;
  }
  $("#sim-list").before(makeStyleBox()); styleBoxes[0].hidden = false;
  $("#sim-host").before(makeStyleBox());
  $("#sim-list").addEventListener("click", e => { const b = e.target.closest("[data-sim]"); if (b) openSim(b.dataset.sim); });
  $("#sim-back").addEventListener("click", () => { A.setTab("lab"); A.home(); });
  $("#sim-sheet").addEventListener("click", () => { const id = $("#sim-sheet").dataset.sheet; if (id) A.openSheet(id); });

  // ------------------------------------------------------------ Schaltung (gemeinsam für Simulation und Übung)
  // Koordinaten im Bild 360 x 250, Bezug: unterer Draht = 0 V
  const G = { topY: 40, botY: 230, bx: 40, by1: 112, by2: 136, r1: [80, 140], r2: [268, 328], cl: [172, 40], cr: [248, 40], pv: [210, 100], rx: 345, pt: 150, pb: 170, vm: [290, 160] };
  const NODES = { // Messpunkte A–F für die Übung
    A: { x: 40, y: 78, t: "A" }, B: { x: 156, y: 40, t: "B" }, C: { x: 210, y: 126, t: "C" },
    D: { x: 258, y: 40, t: "D" }, E: { x: 322, y: 110, t: "E" }, F: { x: 120, y: 230, t: "F" }
  };
  const L = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  const GX = window.PHYS_GFX;
  const BLADE = { charge: [G.cl[0] + 3, G.cl[1] + 5], discharge: [G.cr[0] - 3, G.cr[1] + 5], open: [G.pv[0] + 20, G.pv[1] - 46] };
  // Zeigermessgerät (Voltmeter) mit Skala; frac = Zeigerausschlag 0 … 1
  function drawMeter(x, c, cx, cy, frac, unit) {
    x.save();
    const g = x.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, 17);
    g.addColorStop(0, GX.shade(c.surf, GX.isDark(c) ? 0.12 : 0)); g.addColorStop(1, GX.shade(c.surf2, GX.isDark(c) ? -0.1 : -0.06));
    x.fillStyle = g; x.strokeStyle = c.fg; x.lineWidth = 2.2;
    x.beginPath(); x.arc(cx, cy, 16, 0, GX.TAU); x.fill(); x.stroke();
    x.strokeStyle = c.dim; x.lineWidth = 1;
    for (let i = 0; i <= 6; i++) { const a = -Math.PI * 0.85 + (Math.PI * 0.7) * i / 6; x.beginPath(); x.moveTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11 + 3); x.lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14 + 3); x.stroke(); }
    if (frac != null) {
      const a = -Math.PI * 0.85 + Math.PI * 0.7 * Math.max(0, Math.min(1, frac));
      x.strokeStyle = c.bad; x.lineWidth = 1.6; x.lineCap = "round";
      x.beginPath(); x.moveTo(cx, cy + 3); x.lineTo(cx + Math.cos(a) * 13, cy + 3 + Math.sin(a) * 13); x.stroke();
    }
    x.fillStyle = c.fg; x.beginPath(); x.arc(cx, cy + 3, 1.8, 0, GX.TAU); x.fill();
    GX.text(x, c.fg, unit || "V", cx, cy + 10, { weight: 800, size: 8 });
    x.restore();
  }
  function drawCircuit(x, c, o) {
    o = o || {};
    // Leitungen
    GX.wire(x, c, [[G.bx, G.by1 - 3], [G.bx, G.topY], [G.r1[0], G.topY]]);
    GX.wire(x, c, [[G.bx, G.by2 + 3], [G.bx, G.botY], [G.rx, G.botY], [G.rx, G.topY], [G.r2[1], G.topY]]);
    GX.wire(x, c, [[G.r1[1], G.topY], [G.cl[0], G.cl[1]]]);
    GX.wire(x, c, [[G.cr[0], G.cr[1]], [G.r2[0], G.topY]]);
    GX.wire(x, c, [G.pv, [G.pv[0], G.pt - 3]]);
    GX.wire(x, c, [[G.pv[0], G.pb + 3], [G.pv[0], G.botY]]);
    GX.wire(x, c, [[G.pv[0], 128], [G.vm[0], 128], [G.vm[0], G.vm[1] - 16]]);
    GX.wire(x, c, [[G.vm[0], G.vm[1] + 16], [G.vm[0], G.botY]]);
    // Bauteile
    GX.battery(x, c, G.bx, G.by1, G.by2, o.U0lab || "U₀");
    GX.resistor(x, c, G.r1[0], G.r1[1], G.topY, o.R1lab || "R₁");
    GX.resistor(x, c, G.r2[0], G.r2[1], G.topY, o.R2lab || "R₂");
    GX.plate(x, c, 170, G.pt, 250, G.pt, o.glow ? GX.alpha(c.pos, o.glow) : null);
    GX.plate(x, c, 170, G.pb, 250, G.pb, o.glow ? GX.alpha(c.neg, o.glow) : null);
    GX.text(x, c.dim, "C", 258, 160, { align: "left", weight: 700, size: 12 });
    if (!o.noMeter) drawMeter(x, c, G.vm[0], G.vm[1], o.meter);
    // Umschalter
    GX.terminal(x, c, G.cl); GX.terminal(x, c, G.cr);
    const b = o.blade || BLADE[o.mode || "open"];
    x.save(); x.strokeStyle = c.fg; x.lineWidth = 3.4; x.lineCap = "round";
    x.beginPath(); x.moveTo(G.pv[0], G.pv[1]); x.lineTo(b[0], b[1]); x.stroke(); x.restore();
    GX.node(x, c, G.pv, 4.6);
    [[G.pv[0], 128], [G.pv[0], G.botY], [G.vm[0], G.botY]].forEach(p => GX.node(x, c, p, 3.4));
    GX.text(x, c.dim, "0 V", 56, G.botY - 10, { align: "left", size: 11 });
  }
  // Potenziale (Bezug: unterer Draht = 0 V) für Schalterstellung und Kondensatorspannung
  function potentials(mode, U0, Uc) {
    if (mode === "charge") return { A: U0, B: Uc, C: Uc, D: 0, E: 0, F: 0 };
    if (mode === "discharge") return { A: U0, B: U0, C: Uc, D: Uc, E: 0, F: 0 };
    return { A: U0, B: U0, C: Uc, D: 0, E: 0, F: 0 };
  }
  function pathLen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
  function pointAt(pts, d) {
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l) { const t = d / l; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; } d -= l; }
    return pts[pts.length - 1];
  }
  const P_CHARGE = [[[G.bx, G.by1], [G.bx, G.topY], [G.cl[0], G.topY], [G.pv[0], G.pv[1]], [G.pv[0], G.pt]], [[G.pv[0], G.pb], [G.pv[0], G.botY], [G.bx, G.botY], [G.bx, G.by2]]];
  const P_DISCH = [[[G.pv[0], G.pt], [G.pv[0], G.pv[1]], [G.cr[0], G.topY], [G.rx, G.topY], [G.rx, G.botY], [G.pv[0], G.botY], [G.pv[0], G.pb]]];

  // ------------------------------------------------------------ Elektronen in der RC-Schaltung (Teilchen, Zahl bleibt erhalten)
  // Ketten: T Stiel oben (Platte → Schalter), Bd Schalterblatt, L Ladekreis, B Stiel unten (→ Platte), R Entladekreis.
  // Jedes Elektron sitzt auf genau einer Kette und wandert nur bei Stromfluss; es verschwindet nie. Nur an den Platten
  // geht es in die Platte hinein bzw. kommt aus ihr heraus (Plattenzähler nT, nB).
  const SP = 20, BLEN = 65;
  const CH = {
    T: [[G.pv[0], G.pt], [G.pv[0], G.pv[1]]],
    L: [[G.cl[0], G.cl[1]], [G.bx, G.topY], [G.bx, G.by1], [G.bx, G.by2], [G.bx, G.botY], [G.pv[0], G.botY]],
    B: [[G.pv[0], G.botY], [G.pv[0], G.pb + 3]],
    R: [[G.pv[0], G.botY], [G.rx, G.botY], [G.rx, G.topY], [G.cr[0], G.cr[1]]]
  };
  const CLEN = { T: pathLen(CH.T), Bd: BLEN, L: pathLen(CH.L), B: pathLen(CH.B), R: pathLen(CH.R) };
  const ROUTE = { // Reihenfolge der Ketten; dir = Richtung der Kette relativ zur Fließrichtung der Elektronen
    charge: [["T", 1], ["Bd", 1], ["L", 1], ["B", 1]],
    discharge: [["B", -1], ["R", 1], ["Bd", -1], ["T", -1]]
  };
  function newElectrons() {
    const e = [];
    for (let d = 0; d < CLEN.T; d += SP) e.push({ c: "T", d });
    for (let d = CLEN.B - SP; d > 0; d -= SP) e.push({ c: "B", d });
    for (let d = SP / 2; d < CLEN.L; d += SP) e.push({ c: "L", d });
    for (let d = SP / 2; d < CLEN.R; d += SP) e.push({ c: "R", d });
    for (let i = 0; i < 3; i++) e.push({ c: "Bd", d: (i + 0.5) * BLEN / 3 });
    return e;
  }
  // verschiebt alle Elektronen um a (Pixel) entlang der Route; positiv = in Fließrichtung
  function moveElectrons(S, mode, a) {
    const route = ROUTE[mode]; if (!route || !a) return;
    const idx = {}; route.forEach((r, i) => { idx[r[0]] = i; });
    const keep = [];
    for (const p of S.e) {
      let i = idx[p.c];
      if (i == null) { keep.push(p); continue; }
      let rem = a, alive = true;
      for (let guard = 0; guard < 8 && rem !== 0; guard++) {
        const dir = route[i][1], len = CLEN[p.c];
        const nd = p.d + rem * dir;
        if (nd >= 0 && nd <= len) { p.d = nd; rem = 0; break; }
        // über das Kettenende hinaus: Rest in die nächste Kette übernehmen
        const over = nd < 0 ? -nd : nd - len, atStart = nd < 0; // Kettenanfang (d = 0) bzw. Ende (d = len)
        const leaveFwd = rem > 0;
        const ni = i + (leaveFwd ? 1 : -1);
        if (ni < 0 || ni >= route.length) { // in die Platte hinein
          // Laden: unten kommt ein Elektron an (nB+), oben fehlt eines weniger (nT−); Entladen: umgekehrt
          if (leaveFwd) { if (mode === "charge") S.nB += 1; else S.nT -= 1; } else if (mode === "charge") S.nT -= 1; else S.nB += 1;
          alive = false; break;
        }
        i = ni; p.c = route[i][0];
        const ndir = route[i][1];
        // Eintritt: bei Vorwärtsfahrt am Routen-Anfang der neuen Kette, sonst an ihrem Routen-Ende
        const entryAtD0 = leaveFwd ? ndir > 0 : ndir < 0;
        p.d = entryAtD0 ? 0 : CLEN[p.c];
        rem = leaveFwd ? over : -over;
      }
      if (alive) keep.push(p);
    }
    S.e = keep;
    // Elektronen treten aus der Platte aus, sobald vor ihr Platz von einem Abstand frei ist
    const first = route[0], last = route[route.length - 1];
    const sFirst = p => (first[1] > 0 ? p.d : CLEN[first[0]] - p.d);
    const sLast = p => (last[1] > 0 ? CLEN[last[0]] - p.d : p.d);
    const supplyStart = mode === "charge" ? true : S.nB > 0, supplyEnd = mode === "charge" ? S.nB > 0 : true;
    for (let g = 0; g < 6; g++) {
      const onFirst = S.e.filter(p => p.c === first[0]);
      if (a > 0 && supplyStart && onFirst.length && Math.min(...onFirst.map(sFirst)) >= SP) {
        const m = Math.min(...onFirst.map(sFirst)) - SP;
        S.e.push({ c: first[0], d: first[1] > 0 ? m : CLEN[first[0]] - m });
        if (mode === "charge") S.nT += 1; else S.nB -= 1;
      } else break;
    }
    for (let g = 0; g < 6; g++) {
      const onLast = S.e.filter(p => p.c === last[0]);
      if (a < 0 && supplyEnd && onLast.length && Math.min(...onLast.map(sLast)) >= SP) {
        const m = Math.min(...onLast.map(sLast)) - SP;
        S.e.push({ c: last[0], d: last[1] > 0 ? CLEN[last[0]] - m : m });
        if (mode === "charge") S.nB -= 1; else S.nT += 1;
      } else break;
    }
  }
  // Der Eimer zeigt eine relative Spannungs-/Energiehöhe. In der Entladung ist
  // vor dem Widerstand Uc/U0 verfügbar und hinter ihm 0; bei offenem Schalter
  // wird nicht mehr künstlich umgefüllt.
  const RC_ENERGY = window.PHYS_RC_ENERGY;
  if (!RC_ENERGY) throw new Error("RC energy model missing");
  function electronEnergy(S, mode, U0, Uc, dt, blade) {
    S.e.forEach(p => {
      const target = RC_ENERGY.energyAt(p, mode, U0, Uc);
      // Keinen zeitlichen Nachlauf über den Widerstand: Position und Eimer
      // müssen zum selben Moment passen (Potential in phiAt verläuft stetig).
      if (target != null) p.en = target;
      else if (p.en == null) p.en = 0;
      // Blickrichtung: entlang der Bewegung (nach links schauen, wenn sich das Elektron nach links bewegt)
      const q = electronPos(p, blade), q2 = p.c === "Bd" ? [G.pv[0] + (blade[0] - G.pv[0]) * (p.d + 1) / BLEN, G.pv[1] + (blade[1] - G.pv[1]) * (p.d + 1) / BLEN] : pointAt(CH[p.c], Math.min(CLEN[p.c], p.d + 1));
      const dirv = ((ROUTE[mode] || []).find(r => r[0] === p.c) || [0, 1])[1] * (S.sg || 1);
      const tx = (q2[0] - q[0]) * dirv;
      if (Math.abs(tx) > 0.2) p.fl = tx < 0;
    });
  }
  function electronPos(p, blade) {
    if (p.c === "Bd") { const u = p.d / BLEN; return [G.pv[0] + (blade[0] - G.pv[0]) * u, G.pv[1] + (blade[1] - G.pv[1]) * u]; }
    return pointAt(CH[p.c], p.d);
  }

  // ------------------------------------------------------------ Simulation 1: RC-Schaltung
  SIMS.push({
    id: "rc", el: true, title: "RC-Schaltung", desc: "Laden und Entladen mit Schalter, Voltmeter und Kurven", sheet: "ladung",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 18c4 0 5-12 9-12s5 12 9 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    make(host) {
      const st = stage(360, 250), pl = stage(360, 175);
      const P = { U0: 9, R1: 5, R2: 5, C: 470, speed: 1 };
      let mode = "open", Q = 0, t = 0, qty = "U", EL = { e: newElectrons(), nT: 0, nB: 0 }, prevK = 0, showTau = true, showPot = false, hist = [], histT = 0, ev = null, fieldPhase = 0;
      let blade = BLADE.open.slice(), meter = 0, glow = 0, frame = 0;
      const tau = m => (m === "charge" ? P.R1 : P.R2) * P.C / 1000; // kΩ·µF = ms
      const Uc = () => Q / P.C;
      function setMode(m) {
        if (m === mode) return;
        mode = m; segMode.set(m);
        if (m !== "open") ev = { t0: t, Ustart: Uc(), Uinf: m === "charge" ? P.U0 : 0, tau: tau(m), mode: m };
        else ev = null;
      }
      host.append(st.c);
      const info = el("div", "sim-info"); host.append(info);
      const segMode = seg(host, { label: "Schalter (oder im Bild auf den Schalter tippen)", options: [{ v: "charge", t: "Laden (links)" }, { v: "open", t: "Offen" }, { v: "discharge", t: "Entladen (rechts)" }], value: "open", onChange: setMode });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "Spannung U₀", min: 1, max: 12, step: 1, value: P.U0, fmt: v => v + " V", onInput: v => { P.U0 = v; if (ev && ev.mode === "charge") ev.Uinf = v; } });
      slider(ctl, { label: "Widerstand R₁ (Laden)", min: 1, max: 10, step: 0.5, value: P.R1, fmt: v => de(v) + " kΩ", onInput: v => { P.R1 = v; if (ev && ev.mode === "charge") ev.tau = tau("charge"); } });
      slider(ctl, { label: "Widerstand R₂ (Entladen)", min: 1, max: 10, step: 0.5, value: P.R2, fmt: v => de(v) + " kΩ", onInput: v => { P.R2 = v; if (ev && ev.mode === "discharge") ev.tau = tau("discharge"); } });
      slider(ctl, { label: "Kapazität C", min: 100, max: 1000, step: 10, value: P.C, fmt: v => v + " µF", onInput: v => { const u = Uc(); P.C = v; Q = u * v; prevK = Q; if (ev) ev.tau = tau(ev.mode); } });
      slider(ctl, { label: "Zeitraffer", min: 0.25, max: 4, step: 0.25, value: 1, fmt: v => "×" + de(v), onInput: v => { P.speed = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      button(acts, "Zurücksetzen", () => { Q = 0; t = 0; hist = []; histT = 0; ev = null; mode = "open"; segMode.set("open"); EL = { e: newElectrons(), nT: 0, nB: 0 }; prevK = 0; });
      const tb = button(acts, "τ zeigen: an", () => { showTau = !showTau; tb.textContent = "τ zeigen: " + (showTau ? "an" : "aus"); });
      const pb = button(acts, "Potenziale: aus", () => { showPot = !showPot; pb.textContent = "Potenziale: " + (showPot ? "an" : "aus"); });
      host.append(pl.c);
      seg(host, { label: "Kurve", options: [{ v: "U", t: "Uc(t)" }, { v: "I", t: "I(t)" }, { v: "Q", t: "Q(t)" }], value: "U", onChange: v => { qty = v; } });
      const ro = readouts(host, [["u", "Kondensatorspannung"], ["i", "Stromstärke"], ["q", "Ladung"], ["tau", "Zeitkonstante"]]);
      notes(host, "Aufgaben", [
        "Lege den Schalter nach links und beobachte $U_C$. Wann ist der Kondensator nach etwa $5\\tau$ voll?",
        "Verdopple $R_1$. Wie ändert sich $\\tau$, wie die Form der Kurve?",
        "Lade bis fast voll, dann <b>Offen</b>: Was passiert mit $U_C$? Warum?",
        "Schalte auf <b>Entladen</b> und lies die Spannung nach genau $\\tau$ ab. Welchen Bruchteil von $U_0$ erwartest du?",
        "Schalte <b>Potenziale: an</b> und vergleiche die Werte bei den Schalterstellungen."
      ]);
      function curI() { return mode === "charge" ? (P.U0 - Uc()) / P.R1 : mode === "discharge" ? -Uc() / P.R2 : 0; } // mA

      function step(dt) {
        const ds = dt * P.speed;
        t += ds;
        if (mode !== "open") {
          const tc = tau(mode), Qinf = mode === "charge" ? P.C * P.U0 : 0;
          Q = Qinf + (Q - Qinf) * Math.exp(-ds / tc);
        }
        const dK = (Q - prevK) / 600; prevK = Q; // Tempo der Elektronen ∝ Stromstärke: eine Abstandseinheit je 600 µC
        if (mode !== "open") { const a = SP * (mode === "charge" ? dK : -dK); moveElectrons(EL, mode, a); if (Math.abs(a) > 1e-6) EL.sg = Math.sign(a); }
        electronEnergy(EL, mode, P.U0, Uc(), dt, blade);
        histT += ds;
        while (histT >= 0.04) { histT -= 0.04; hist.push([t, Uc(), curI()]); if (hist.length > 5000) hist.shift(); }
        const I = Math.abs(curI());
        fieldPhase += dt * 14;
        const target = BLADE[mode];
        blade[0] = GX.ease(blade[0], target[0], dt, 14); blade[1] = GX.ease(blade[1], target[1], dt, 14);
        meter = GX.ease(meter, Uc() / 12, dt, 6);
        glow = GX.ease(glow, Math.min(1, I / 2), dt, 6);
      }

      function draw() {
        const c = colors(), x = st.ctx;
        st.fit(); GX.bg(x, 360, 250, c);
        const f = clamp(Uc() / 12, 0, 1);
        // Feld zwischen den Platten (fließt von + nach −)
        if (f > 0.01) {
          for (let i = 0; i < 5; i++) { const px = 182 + i * 14; GX.flowLine(x, c.line, [[px, G.pt + 4], [px, G.pb - 4]], fieldPhase, { alpha: 0.35 + 0.6 * f, head: false, w: 1.2 }); }
        }
        drawCircuit(x, c, { blade, meter, glow: f > 0.05 ? 0.35 * f : 0, R1lab: de(P.R1) + " kΩ", R2lab: de(P.R2) + " kΩ", U0lab: P.U0 + " V" });
        // Elektronen auf den Leitungen (entgegen der technischen Stromrichtung); sie bleiben immer sichtbar
        const I = Math.abs(curI());
        EL.e.forEach(p => { const q = electronPos(p, blade); GX.electron(x, c, q[0], q[1], 0.95, p.en, p.fl); });
        // Ladungen auf den Platten: so viele, wie Elektronen ein- bzw. ausgetreten sind
        for (let i = 0; i < Math.min(9, Math.max(0, EL.nB)); i++) GX.minus(x, c, 176 + i * 8.5, G.pb + 9, 3.6, { energy: clamp(Uc() / Math.max(P.U0, 1e-9), 0, 1) });
        for (let i = 0; i < Math.min(9, Math.max(0, EL.nT)); i++) GX.ball(x, 176 + i * 8.5, G.pt - 9, 3.6, c.pos, "+");
        // Stromstärke am aktiven Widerstand
        if (I > 0.004) {
          const r = mode === "charge" ? G.r1 : G.r2, xm = (r[0] + r[1]) / 2;
          GX.pill(x, c, "I = " + de(I, 2) + " mA", xm, G.topY + 24, { col: c.bad, size: 10 });
        }
        // Spannungsanzeige
        GX.pill(x, c, de(Uc(), 3) + " V", G.vm[0] + 2, 202, { col: c.accent, size: 12 });
        // Potenziale
        if (showPot) {
          const pot = potentials(mode, P.U0, Uc());
          Object.keys(NODES).forEach(k => { const nd = NODES[k]; GX.pill(x, c, k + ": " + de(pot[k], 3) + " V", nd.x, nd.y - 12, { col: c.accent, size: 10, clampW: 360 }); });
        }
        ro({ u: de(Uc(), 3) + " V", i: de(curI(), 3) + " mA", q: de(Q, 3) + " µC", tau: de(tau(mode === "open" ? "charge" : mode), 3) + " s" });
        info.textContent = mode === "charge" ? "Laden: Der Strom fließt über R₁ zur Platte. Die Elektronen (blau) wandern entgegen der technischen Stromrichtung."
          : mode === "discharge" ? "Entladen: Der Kondensator treibt den Strom über R₂. Die Spannung sinkt exponentiell."
          : "Schalter offen: keine Verbindung, die Ladung bleibt (ideal).";
        if ((frame = (frame + 1) % 2) === 0) drawPlot(c); // Diagramm reicht mit halber Bildrate
      }

      function niceW(v) { const a = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200]; return a.find(z => z >= v) || 200; }
      function drawPlot(c) {
        pl.fit(); const x = pl.ctx;
        GX.bg(x, 360, 175, c, false);
        const X0 = 44, X1 = 350, Y0 = 16, Y1 = 142;
        const W = niceW(5.5 * Math.max(tau("charge"), tau("discharge")));
        const t0 = Math.max(0, t - W), t1 = t0 + W;
        let ymin = 0, ymax, key, col;
        if (qty === "U") { ymax = Math.max(P.U0, 1) * 1.08; key = 1; col = c.accent; }
        else if (qty === "I") { const m = P.U0 / Math.min(P.R1, P.R2) * 1.08; ymin = -m; ymax = m; key = 2; col = c.bad; }
        else { ymax = P.C * P.U0 * 1.08; key = 3; col = c.ok; }
        const sx = tt => X0 + (tt - t0) / W * (X1 - X0), sy = v => Y1 - (v - ymin) / (ymax - ymin) * (Y1 - Y0);
        const val = h => key === 3 ? h[1] * P.C : h[key];
        x.font = "11px system-ui, sans-serif"; x.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const v = ymin + (ymax - ymin) * i / 4, yy = sy(v); x.strokeStyle = c.border; L(x, [[X0, yy], [X1, yy]]); GX.text(x, c.dim, de(v, 2), X0 - 5, yy, { align: "right" }); }
        for (let i = 0; i <= 5; i++) { const tt = t0 + W * i / 5, xx = sx(tt); x.strokeStyle = c.border; L(x, [[xx, Y0], [xx, Y1]]); GX.text(x, c.dim, de(tt, 3), xx, Y1 + 12); }
        x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[X0, Y1], [X1, Y1]]); L(x, [[X0, Y1], [X0, Y0 - 6]]);
        GX.text(x, c.dim, qty === "U" ? "Uc in V" : qty === "I" ? "I in mA" : "Q in µC", X0 + 6, 9, { align: "left" });
        GX.text(x, c.dim, "t in s", X1, Y1 + 26, { align: "right" });
        if (qty === "I") { x.strokeStyle = c.dim; L(x, [[X0, sy(0)], [X1, sy(0)]]); }
        x.save(); x.beginPath(); x.rect(X0, Y0 - 4, X1 - X0, Y1 - Y0 + 8); x.clip();
        const pts = hist.filter(h => h[0] >= t0 - 0.1).map(h => [sx(h[0]), sy(val(h))]);
        if (pts.length > 1) {
          // Fläche unter der Kurve
          const g = x.createLinearGradient(0, Y0, 0, Y1); g.addColorStop(0, GX.alpha(col, 0.28)); g.addColorStop(1, GX.alpha(col, 0.02));
          x.fillStyle = g; x.beginPath(); x.moveTo(pts[0][0], sy(Math.max(ymin, 0))); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(pts[pts.length - 1][0], sy(Math.max(ymin, 0))); x.closePath(); x.fill();
          x.strokeStyle = col; x.lineWidth = 2.6; x.lineJoin = "round"; GX.poly(x, pts); x.stroke();
        }
        if (showTau && ev && qty === "U") {
          x.strokeStyle = c.warn; x.fillStyle = c.warn; x.setLineDash([4, 4]); x.lineWidth = 1.4;
          x.beginPath();
          for (let i = 0; i <= 60; i++) { const tt = Math.max(ev.t0, t0) + (t1 - Math.max(ev.t0, t0)) * i / 60; const v = ev.Uinf + (ev.Ustart - ev.Uinf) * Math.exp(-(tt - ev.t0) / ev.tau); i ? x.lineTo(sx(tt), sy(v)) : x.moveTo(sx(tt), sy(v)); }
          x.stroke();
          const tt = ev.t0 + ev.tau, v = ev.Uinf + (ev.Ustart - ev.Uinf) / Math.E;
          L(x, [[sx(tt), Y1], [sx(tt), sy(v)]]); L(x, [[X0, sy(v)], [sx(tt), sy(v)]]);
          x.setLineDash([]); GX.ball(x, sx(tt), sy(v), 4, c.warn);
          GX.pill(x, c, "τ", sx(tt), Y1 - 10, { col: c.warn, size: 10 });
        }
        x.restore();
        if (pts.length) { const p = pts[pts.length - 1]; GX.glow(x, p[0], p[1], 12, col, 0.5); GX.ball(x, p[0], p[1], 4.2, col); }
      }
      // Tippen auf den Schalter wechselt die Stellung
      st.c.addEventListener("click", e => { const p = st.pos(e); if (p.y < 115 && p.x > 150 && p.x < 270) setMode(mode === "open" ? "charge" : mode === "charge" ? "discharge" : "open"); });
      window.PHYS_RC_STATE = () => EL; // nur zum Prüfen der Elektronenerhaltung
      return { step, draw };
    }
  });

  // ------------------------------------------------------------ Simulation 2: Differenzialgleichung (Euler-Verfahren)
  SIMS.push({
    id: "euler", title: "Differenzialgleichung", desc: "Die Kurve Schritt für Schritt aus der Dgl. bauen (Euler-Verfahren)", sheet: "ladung",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 5l4 4 3 2 3 3 3 2 5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    make(host) {
      const st = stage(360, 235);
      let m = "dis", dtau = 0.5, k = 0; // k = Anzahl gezeigter Schritte
      host.append(st.c);
      const eq = el("div", "sim-eq"); host.append(eq);
      seg(host, { label: "Vorgang", options: [{ v: "dis", t: "Entladen" }, { v: "ch", t: "Aufladen" }], value: "dis", onChange: v => { m = v; k = 0; } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "Schrittweite Δt", min: 0.1, max: 1.5, step: 0.05, value: dtau, fmt: v => de(v) + " τ", onInput: v => { dtau = v; k = 0; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      const N = () => Math.ceil(5 / dtau - 1e-9);
      button(acts, "Nächster Schritt", () => { k = Math.min(N(), k + 1); }, "primary");
      button(acts, "Alle Schritte", () => { k = N(); });
      button(acts, "Zurück", () => { k = 0; });
      const tbl = el("div", "sim-table"); host.append(tbl);
      notes(host, "Aufgaben", [
        "Klicke dich durch die Schritte. Jeder Schritt folgt der <b>Tangente</b> im aktuellen Punkt.",
        "Wähle $\\Delta t = 1{,}5\\,\\tau$ und dann $0{,}1\\,\\tau$. Wie ändert sich der Abstand zur exakten Kurve?",
        "Warum kann ein großer Euler-Schritt sogar negative Spannung oder mehr als 100 % ergeben? Das ist ein <b>Rechenfehler der Näherung</b>, keine reale Kondensatorentladung."
      ]);
      const f = y => m === "dis" ? -y : 1 - y, ex = t => m === "dis" ? Math.exp(-t) : 1 - Math.exp(-t);
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, 360, 235, c, false);
        const X0 = 40, X1 = 350, Y0 = 14, Y1 = 195;
        // Bei Δt > τ kann das Euler-Verfahren physikalisch unsinnige negative
        // Werte oder >100 % liefern. Diese nicht außerhalb der Leinwand verstecken.
        const yMin = dtau > 1 ? -0.6 : 0, yMax = dtau > 1 ? 1.6 : 1;
        const sx = t => X0 + t / 5 * (X1 - X0), sy = y => Y1 - (y - yMin) / (yMax - yMin) * (Y1 - Y0);
        x.font = "11px system-ui, sans-serif"; x.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const y = yMin + (yMax - yMin) * i / 4; x.strokeStyle = c.border; L(x, [[X0, sy(y)], [X1, sy(y)]]); x.fillStyle = c.dim; x.textAlign = "right"; x.fillText(de(y, 2), X0 - 5, sy(y) + 4); }
        for (let i = 0; i <= 5; i++) { x.strokeStyle = c.border; L(x, [[sx(i), Y0], [sx(i), Y1]]); x.fillStyle = c.dim; x.textAlign = "center"; x.fillText(i + "τ", sx(i), Y1 + 14); }
        x.textAlign = "left"; x.fillStyle = c.dim; x.fillText("U / U₀", X0 + 8, 10);
        // exakte Kurve
        x.lineWidth = 2.4; x.strokeStyle = c.accent; x.beginPath();
        for (let i = 0; i <= 100; i++) { const t = i / 20; i ? x.lineTo(sx(t), sy(ex(t))) : x.moveTo(sx(t), sy(ex(t))); } x.stroke();
        x.fillStyle = c.accent; x.textAlign = "right"; x.fillText("exakt", X1, m === "dis" ? sy(ex(0.9)) - 4 : sy(ex(3.2)) + 14);
        // Euler
        let y = m === "dis" ? 1 : 0; const pts = [[0, y]];
        for (let i = 0; i < k; i++) { const h = Math.min(dtau, Math.max(0, 5 - i * dtau)); const ny = y + f(y) * h; pts.push([Math.min(5, (i + 1) * dtau), ny]); y = ny; }
        x.lineWidth = 2; x.strokeStyle = c.warn; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(sx(p[0]), sy(p[1])) : x.moveTo(sx(p[0]), sy(p[1]))); x.stroke();
        pts.forEach((p, i) => {
          GX.ball(x, sx(p[0]), sy(p[1]), 4, c.warn);
          if (i > 0) { x.strokeStyle = c.dim; x.setLineDash([2, 3]); x.lineWidth = 1; L(x, [[sx(p[0]), sy(p[1])], [sx(p[0]), sy(ex(p[0]))]]); x.setLineDash([]); }
        });
        // aktuelle Tangente (nächster Schritt)
        if (k < N()) { const p = pts[pts.length - 1], h = Math.min(dtau, Math.max(0, 5 - p[0])); x.strokeStyle = c.warn; x.setLineDash([5, 4]); x.lineWidth = 1.4; L(x, [[sx(p[0]), sy(p[1])], [sx(p[0] + h), sy(p[1] + f(p[1]) * h)]]); x.setLineDash([]); }
        // Text
        const cur = pts[pts.length - 1];
        if (eq._k !== m) {
          eq._k = m;
          eq.innerHTML = m === "dis"
            ? "$\\dfrac{\\mathrm{d}U}{\\mathrm{d}t} = -\\dfrac{U}{\\tau}\\;\\Rightarrow\\; U_{n+1} = U_n - \\dfrac{U_n}{\\tau}\\,\\Delta t$"
            : "$\\dfrac{\\mathrm{d}U}{\\mathrm{d}t} = \\dfrac{U_0 - U}{\\tau}\\;\\Rightarrow\\; U_{n+1} = U_n + \\dfrac{U_0 - U_n}{\\tau}\\,\\Delta t$";
          A.render(eq);
        }
        let rows = "";
        const show = Math.min(k, 5); let yy = m === "dis" ? 1 : 0;
        for (let i = 0; i < show; i++) { const h = Math.min(dtau, Math.max(0, 5 - i * dtau)), delta = f(yy) * h, ny = yy + delta; rows += "<tr><td>" + i + "</td><td>" + de(Math.min(5, i * dtau), 2) + " τ</td><td>" + de(yy, 3) + "</td><td>" + (delta >= 0 ? "+" : "−") + de(Math.abs(delta), 3) + "</td><td>" + de(ny, 3) + "</td></tr>"; yy = ny; }
        const key = k + "|" + m + "|" + dtau;
        if (tbl._k !== key) {
          tbl._k = key;
          let info = "";
          if (k > 0) { const t = cur[0], e = ex(t); info = "<p class='fine tight'>Nach " + k + " Schritten (t = " + de(t, 2) + " τ): Näherung " + de(cur[1], 3) + ", exakt " + de(e, 3) + ", Abweichung " + de(Math.abs(cur[1] - e) * 100, 2) + " Prozentpunkte.</p>";
            if (cur[1] < 0 || cur[1] > 1) info += "<p class='fine tight'><b>Hinweis:</b> Der Euler-Wert liegt außerhalb von 0–100 %. Das ist bei zu großer Schrittweite ein Artefakt der Näherung, keine physikalische Spannung.</p>";
          }
          tbl.innerHTML = k ? "<table class='cmp'><tr><th>n</th><th>t</th><th>Uₙ/U₀</th><th>ΔU/U₀</th><th>Uₙ₊₁/U₀</th></tr>" + rows + "</table>" + info : "<p class='fine tight'>Tippe auf „Nächster Schritt“. Start: " + (m === "dis" ? "U = U₀" : "U = 0") + ".</p>";
        }
      }
      return { draw };
    }
  });

  // ------------------------------------------------------------ Übung: Schaltung beschriften
  const LABEL_N = 5;
  let lab = null;
  function newScenario(round) {
    const lvl = lab.lvl;
    const U0 = rnd([6, 9, 12]);
    let mode, Uc, title;
    if (lvl === 1) {
      mode = rnd(["charge", "discharge"]);
      if (mode === "charge") { Uc = rnd([0, U0]); title = Uc === 0 ? "Schalter links, ganz am Anfang (t = 0): Der Kondensator ist noch leer." : "Schalter links, lange gewartet (t → ∞): Der Kondensator ist voll."; }
      else { Uc = U0; title = "Schalter rechts, ganz am Anfang des Entladens (t = 0): Der Kondensator ist voll."; }
    } else {
      mode = rnd(["charge", "discharge", lvl === 3 ? "open" : "charge"]);
      Uc = U0 * rnd([1 / 3, 1 / 2, 2 / 3]);
      title = mode === "charge" ? "Schalter links, Kondensator teilweise geladen: U_C = " + de(Uc) + " V."
        : mode === "discharge" ? "Schalter rechts, Kondensator entlädt sich gerade: U_C = " + de(Uc) + " V."
        : "Schalter offen, Kondensator hat U_C = " + de(Uc) + " V.";
    }
    const pot = potentials(mode, U0, Uc);
    const nodes = lvl === 1 ? ["A", "B", "C", "D", "E"] : ["A", "B", "C", "D", "E", "F"];
    const vals = Array.from(new Set([0, U0, Uc, U0 - Uc].map(v => Math.round(v * 100) / 100))).sort((a, b) => a - b);
    return { mode, U0, Uc, title, pot, nodes, vals, answers: {}, sel: nodes[0], checked: false };
  }
  function why(sc, k) {
    const { mode, U0, Uc } = sc, v = sc.pot[k];
    const R1 = "Am Widerstand R₁", R2 = "Am Widerstand R₂";
    const txt = {
      A: "A liegt direkt am Pluspol der Quelle: " + de(U0) + " V.",
      F: "F liegt am unteren Draht, das ist der Bezugspunkt: 0 V.",
      C: "C ist die obere Kondensatorplatte. Ihr Potenzial ist die Kondensatorspannung: " + de(Uc) + " V.",
      B: mode === "charge" ? "B hängt über den geschlossenen Schalter an der oberen Platte: " + de(Uc) + " V. Der Spannungsabfall an R₁ ist " + de(U0 - Uc) + " V."
        : "Der linke Zweig führt keinen Strom. Ohne Strom fällt an R₁ nichts ab, also hat B dasselbe Potenzial wie A: " + de(U0) + " V.",
      D: mode === "discharge" ? "D hängt über den geschlossenen Schalter an der oberen Platte: " + de(Uc) + " V."
        : "Der rechte Zweig führt keinen Strom, an R₂ fällt nichts ab. D liegt wie der untere Draht bei 0 V.",
      E: mode === "discharge" ? "E liegt hinter R₂ am unteren Draht: 0 V. An R₂ fallen " + de(Uc) + " V ab." : "E liegt über den rechten Draht am unteren Draht: 0 V."
    }[k];
    return txt;
  }
  function renderLabel() {
    const host = $("#label-host"); host.innerHTML = "";
    const sc = lab.sc;
    $("#label-count").textContent = "Aufgabe " + (lab.i + 1) + " von " + LABEL_N + " · " + lab.pts + " richtig";
    $("#label-progress-bar").style.width = (lab.i / LABEL_N * 100) + "%";
    const card = el("div", "panel label-card");
    card.append(el("p", "label-q", "<b>" + sc.title + "</b><br><span class='fine'>Quelle: U₀ = " + de(sc.U0) + " V. Der untere Draht ist Bezugspunkt (0 V). Trage die Potenziale an den Punkten A bis " + sc.nodes[sc.nodes.length - 1] + " ein.</span>"));
    const wrap = el("div", "circuit-wrap");
    const cv = stage(360, 250); wrap.append(cv.c);
    sc.nodes.forEach(k => {
      const b = el("button", "node", k); b.type = "button"; b.dataset.k = k;
      b.style.left = (NODES[k].x / 360 * 100) + "%"; b.style.top = (NODES[k].y / 250 * 100) + "%";
      b.addEventListener("click", () => { if (sc.checked) return; sc.sel = k; paint(); });
      wrap.append(b);
    });
    card.append(wrap);
    const tray = el("div", "chips-tray");
    tray.append(el("span", "sim-lab", "Wert wählen:"));
    sc.vals.forEach(v => { const b = el("button", "chip val", de(v) + " V"); b.type = "button"; b.addEventListener("click", () => { if (sc.checked || !sc.sel) { if (!sc.sel) A.toast("Tippe zuerst einen Punkt (A, B, …) an."); return; } sc.answers[sc.sel] = v; const i = sc.nodes.indexOf(sc.sel); sc.sel = sc.nodes[i + 1] || sc.sel; paint(); }); tray.append(b); });
    card.append(tray);
    const list = el("div", "node-list"); card.append(list);
    const fb = el("div", "fb", ""); fb.hidden = true; card.append(fb);
    const acts = el("div", "start-actions");
    const chk = button(acts, "Prüfen", () => check(), "primary"); const nxt = button(acts, "Weiter", () => next()); nxt.hidden = true;
    card.append(acts); host.append(card);

    function paint() {
      list.innerHTML = sc.nodes.map(k => '<span class="nl' + (sc.checked ? (Math.abs((sc.answers[k] ?? NaN) - sc.pot[k]) < 1e-6 ? " ok" : " bad") : "") + '"><b>' + k + "</b> " + (k in sc.answers ? de(sc.answers[k]) + " V" : "–") + "</span>").join("");
      wrap.querySelectorAll(".node").forEach(b => {
        const k = b.dataset.k, has = k in sc.answers;
        b.classList.toggle("sel", sc.sel === k); b.classList.toggle("has", has);
        b.textContent = has ? k + " = " + de(sc.answers[k]) : k;
        if (sc.checked) { const ok = Math.abs((sc.answers[k] ?? NaN) - sc.pot[k]) < 1e-6; b.classList.toggle("ok", ok); b.classList.toggle("bad", !ok); }
      });
      chk.disabled = !sc.nodes.every(k => k in sc.answers) || sc.checked;
    }
    function check() {
      sc.checked = true;
      const wrong = sc.nodes.filter(k => Math.abs((sc.answers[k] ?? NaN) - sc.pot[k]) > 1e-6);
      if (!wrong.length) lab.pts++;
      fb.hidden = false; fb.className = "fb " + (wrong.length ? "bad" : "good");
      fb.innerHTML = '<p class="fb-title">' + (wrong.length ? "Nicht ganz: " + wrong.join(", ") + " stimmt nicht" : "Alles richtig") + "</p>" +
        sc.nodes.map(k => "<p><b>" + k + "</b> = " + de(sc.pot[k]) + " V. " + why(sc, k) + "</p>").join("");
      chk.hidden = true; nxt.hidden = false; nxt.textContent = lab.i === LABEL_N - 1 ? "Ergebnis" : "Weiter"; paint();
      const s = (S.stats.label || (S.stats.label = { n: 0, ok: 0 })); s.n++; if (!wrong.length) A.countOk(s, "label:" + sc.title + JSON.stringify(sc.pot)); A.save();
    }
    function next() {
      lab.i++;
      if (lab.i >= LABEL_N) { finishLabel(); return; }
      lab.sc = newScenario(lab.i); renderLabel();
    }
    paint();
    lab.draw = () => {
      const c = colors(); cv.fit(); GX.bg(cv.ctx, 360, 250, c);
      drawCircuit(cv.ctx, c, { mode: sc.mode, R1lab: "R₁", R2lab: "R₂", U0lab: "U₀", meter: null });
    };
  }
  function finishLabel() {
    stopLoop();
    $("#result-title").textContent = "Übung beendet";
    $("#result-sub").textContent = lab.pts + " von " + LABEL_N + " Schaltungen komplett richtig.";
    const sc = $("#result-score"); sc.hidden = false; const pct = Math.round(lab.pts / LABEL_N * 100);
    sc.innerHTML = '<div class="scorebar"><div style="width:' + pct + '%"></div></div><p class="bignum">' + pct + " %</p>";
    $("#result-review").hidden = true;
    A.customAgain = startLabel;
    A.show("result");
    if (pct >= 80) A.confetti();
  }
  function startLabel() {
    const lvls = S.levels;
    lab = { i: 0, pts: 0, lvl: rnd(lvls), draw: null };
    lab.sc = newScenario(0);
    A.show("label");
    renderLabel();
    startLoop({ draw: () => lab.draw && lab.draw() });
  }
  $("#m-label").addEventListener("click", startLabel);
  $("#label-quit").addEventListener("click", () => A.home());
  const origStat = () => { const s = S.stats.label; $("#stat-label").textContent = s && s.n ? Math.round(s.ok / s.n * 100) + " % richtig · " + s.n + " Schaltungen" : "Noch nicht gespielt"; };
  A.onShow(n => { if (n === "start") origStat(); });
  origStat();

  // Öffentliche Schnittstelle für sims2.js
  window.PHYS_SIMKIT = { GX, labState: () => (lab ? lab.sc : null), potentials, A, S, $, el, clamp, rnd, de, colors, stage, slider, seg, button, notes, readouts, L, add: s => { SIMS.push(s); renderSimList(); }, G };
  renderSimList();
})();
