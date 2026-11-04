/* Labor, Teil 4: „Herleitung live“. Acht Schritte, in denen jede Größe der Differenzialgleichung
   am Kondensator sichtbar wird: Q, C, U_C, R, I = dQ/dt, Maschenregel, (Q₀−Q)/τ, ln und e-Funktion. */
(function () {
  "use strict";
  const K = window.PHYS_SIMKIT; if (!K) return;
  const { A, el, clamp, colors, stage, slider, button, notes, readouts, L, GX } = K;
  const R = String.raw;
  const W = 360, H = 250, U0 = 10; // feste Quellspannung in V
  const f1 = v => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1).replace(".", ",").replace("-", "−");
  const f2 = v => v.toFixed(2).replace(".", ",");
  const tc = (col, t) => "\\textcolor{" + col + "}{" + t + "}";
  const pal = c => ({ Q: c.warn, UC: c.accent, UR: c.bad, I: c.ok, T: c.fg });
  let hl = null, pulse = 0; // hervorgehobener Formelteil, Takt für das Pulsieren
  const hk = key => (hl === key ? 0.35 + 0.65 * pulse : 0);

  // ------------------------------------------------------------ Geometrie-Helfer
  function pathLen(p) { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function pointAt(p, d) {
    for (let i = 1; i < p.length; i++) {
      const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (d <= l || i === p.length - 1) { const t = l ? Math.min(1, d / l) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t]; }
      d -= l;
    }
    return p[0];
  }
  // Wege der Elektronen (laufen entgegen der technischen Stromrichtung)
  const CH1 = [[30, 124], [30, 210], [180, 210], [180, 140]], CH2 = [[180, 108], [180, 40], [30, 40], [30, 100]];
  const DIS = [[180, 140], [180, 210], [30, 210], [30, 40], [180, 40], [180, 108]];
  const inRes = p => p[1] > 28 && p[1] < 52 && p[0] > 68 && p[0] < 132;
  function ring(x, col, k, px, py, w, h) {
    if (k <= 0) return;
    x.save(); x.globalAlpha = 0.3 + 0.7 * k; x.strokeStyle = col; x.lineWidth = 2.6; GX.rr(x, px - w / 2, py - h / 2, w, h, 10); x.stroke(); x.restore();
  }

  // Schaltung: Quelle links, Widerstand oben, Kondensator rechts
  function circuit(x, c, o) {
    const w = pts => GX.wire(x, c, pts, 2.4), f = clamp(o.f || 0, 0, 1);
    if (o.src === "wire") w([[30, 40], [30, 210]]);
    else { w([[30, 100], [30, 40]]); w([[30, 124], [30, 210]]); }
    if (o.res) { w([[30, 40], [70, 40]]); GX.resistor(x, c, 70, 130, 40, o.resLab || "R"); w([[130, 40], [180, 40], [180, 108]]); }
    else w([[30, 40], [180, 40], [180, 108]]);
    w([[180, 140], [180, 210], [30, 210]]);
    if (o.src === "bat") GX.battery(x, c, 30, 100, 124, o.srcLab);
    if (o.src === "isrc") {
      x.save(); x.strokeStyle = c.fg; x.lineWidth = 2.2; x.fillStyle = c.surf; x.beginPath(); x.arc(30, 112, 12, 0, GX.TAU); x.fill(); x.stroke(); x.restore();
      GX.arrow(x, c.fg, 30, 118, 30, 106, 2, 7);
    }
    x.fillStyle = GX.alpha(c.accent, 0.06 + 0.32 * f); x.fillRect(160, 111, 40, 26);
    GX.plate(x, c, 158, 108, 202, 108); GX.plate(x, c, 158, 140, 202, 140);
    const n = f > 0.01 ? Math.max(1, Math.round(f * 8)) : 0;
    for (let i = 0; i < n; i++) { const px = 162 + i * 36 / 7; GX.ball(x, px, 115.5, 3.2, c.pos, "+"); GX.ball(x, px, 132.5, 3.2, c.neg, "−"); }
    if (o.paths && o.I > 0.01) o.paths.forEach(pts => {
      const len = pathLen(pts), n2 = Math.max(4, Math.round(len / 20));
      for (let i = 0; i < n2; i++) {
        const p = pointAt(pts, (((i * len / n2) + o.phase) % len + len) % len);
        if (!(o.res && inRes(p))) GX.electron(x, c, p[0], p[1], Math.min(1, 0.4 + o.I));
      }
    });
    (o.rings || []).forEach(r => ring(x, r.col, r.k, r.x, r.y, r.w, r.h));
  }
  const RING = {
    src: (col, k) => ({ x: 44, y: 112, w: 66, h: 54, col, k }),
    res: (col, k) => ({ x: 100, y: 40, w: 78, h: 36, col, k }),
    cap: (col, k) => ({ x: 180, y: 124, w: 62, h: 62, col, k })
  };

  // ------------------------------------------------------------ Hauptgerät
  const SC = []; // Schritte, unten definiert
  K.add({
    id: "herleitung", title: "Herleitung live", desc: "Die Dgl. in 8 Schritten am Kondensator sehen: was jeder Teil bedeutet und woher er kommt", sheet: "herleitung",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 4h6v6H5zM13 14h6v6h-6zM8 10v4h5M16 14v-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    make(host) {
      const st = stage(W, H);
      const nav = el("div", "her-nav"), dots = el("div", "her-dots");
      const prev = button(nav, "‹ Zurück", () => go(idx - 1)), lab = el("div", "her-step"); nav.append(lab);
      const next = button(nav, "Weiter ›", () => go(idx + 1), "primary");
      host.append(nav, dots);
      const lead = el("p", "her-lead"); host.append(lead);
      host.append(st.c);
      const eq = el("div", "sim-eq"); host.append(eq);
      const terms = el("div", "her-terms"); host.append(terms);
      const ctl = el("div", "sim-ctl"), acts = el("div", "sim-acts"), roBox = el("div"), notesBox = el("div");
      host.append(ctl, acts, roBox, notesBox);
      const dotEls = SC.map((s, i) => { const b = el("button", "her-dot"); b.type = "button"; b.setAttribute("aria-label", "Schritt " + (i + 1) + ": " + s.title); b.addEventListener("click", () => go(i)); dots.append(b); return b; });

      let idx = -1, cur = null, eqF = null, termsF = null, lastC = null, T = 0;
      const ui = {
        ctl, acts, ro: roBox,
        setEq(fn) { eqF = fn; },
        setTerms(fn) { termsF = fn; },
        button: (t, fn, cls) => button(acts, t, fn, cls),
        refresh
      };
      function renderTerms() {
        terms.innerHTML = "";
        const list = termsF ? termsF(pal(colors())) : [];
        if (list.length && !list.some(t => t.k === hl)) hl = list[0].k;
        list.forEach(t => {
          const b = el("button", "her-term", '<span class="sym">$' + t.tex + '$</span><span class="txt">' + t.text + "</span>");
          b.type = "button"; b.dataset.k = t.k; b.style.setProperty("--tc", t.col);
          b.setAttribute("aria-pressed", String(hl === t.k));
          b.addEventListener("click", () => { hl = hl === t.k ? null : t.k; terms.querySelectorAll(".her-term").forEach(e => e.setAttribute("aria-pressed", String(e.dataset.k === hl))); });
          terms.append(b);
        });
        A.render(terms);
      }
      function refresh() {
        if (eqF) { eq.innerHTML = "$$" + eqF(pal(colors())) + "$$"; A.render(eq); }
        renderTerms();
      }
      function go(i) {
        i = clamp(i, 0, SC.length - 1);
        if (i === idx) return;
        idx = i; const d = SC[i];
        ctl.innerHTML = ""; acts.innerHTML = ""; roBox.innerHTML = ""; notesBox.innerHTML = "";
        eqF = null; termsF = null; hl = null;
        cur = d.make(ui);
        lead.innerHTML = d.lead; A.render(lead);
        lab.textContent = "Schritt " + (i + 1) + " von " + SC.length + ": " + d.title;
        dotEls.forEach((b, j) => { b.className = "her-dot" + (j === i ? " on" : j < i ? " done" : ""); b.setAttribute("aria-current", j === i ? "step" : "false"); });
        prev.disabled = i === 0; next.disabled = i === SC.length - 1;
        refresh();
        notes(notesBox, "Probiere aus", d.notes);
      }
      go(0);
      return {
        step(dt) { T += dt; pulse = 0.5 + 0.5 * Math.sin(T * 5); cur && cur.step && cur.step(dt); },
        draw() {
          const c = colors();
          if (c !== lastC) { const first = lastC === null; lastC = c; if (!first) refresh(); }
          st.fit(); cur && cur.draw(st.ctx, c);
        }
      };
    }
  });

  // ============================================================ 1 · Q, C, U_C
  SC.push({
    title: "Kondensator: Q, C und U_C",
    lead: R`<b>Ein Kondensator speichert Ladung.</b> Ziehe den Regler: Je mehr Ladung $Q$ auf den Platten sitzt, desto höher die Spannung $U_C$. Eine größere Plattenfläche ($C$) verteilt dieselbe Ladung dünner, die Spannung sinkt. Wie bei einem Tank: <b>Wasserstand = Wasser ÷ Grundfläche</b>.`,
    notes: [
      "Stelle $C$ auf den kleinsten Wert und $Q = 4\\,\\mathrm{mC}$. Dann verdopple $C$. Was passiert mit $U_C$ und warum?",
      "Setze $Q = 0$. Wie groß ist $U_C$? Was bedeutet das für einen <b>leeren</b> Kondensator (Start beim Laden)?"
    ],
    make(ui) {
      const s = { Q: 2, C: 0.5 };
      slider(ui.ctl, { label: "Ladung Q", min: 0, max: 4, step: 0.1, value: s.Q, fmt: v => f1(v) + " mC", onInput: v => { s.Q = v; } });
      slider(ui.ctl, { label: "Kapazität C (Plattenfläche)", min: 0.2, max: 1, step: 0.05, value: s.C, fmt: v => f2(v) + " mF", onInput: v => { s.C = v; } });
      const ro = readouts(ui.ro, [["q", "Ladung Q"], ["c", "Kapazität C"], ["u", "Spannung U_C = Q/C"]]);
      ui.setEq(P => tc(P.UC, "U_C") + "=\\dfrac{" + tc(P.Q, "Q") + "}{C}");
      ui.setTerms(P => [
        { k: "Q", col: P.Q, tex: tc(P.Q, "Q"), text: "<b>Ladung</b> auf den Platten (+Q oben, −Q unten): so viele Elektronen wurden von einer Platte zur anderen verschoben. Sie steht im <b>Zähler</b>: mehr Ladung, mehr Spannung." },
        { k: "C", col: P.T, tex: "C", text: "<b>Kapazität</b> = Fassungsvermögen (Plattenfläche, Tank-Grundfläche). Sie steht im <b>Nenner</b>: bei gleicher Ladung ist die Spannung umso kleiner, je größer $C$ ist." },
        { k: "UC", col: P.UC, tex: tc(P.UC, "U_C"), text: "<b>Spannung</b> zwischen den Platten (Wasserstand). Das ist der „Gegendruck“, mit dem der Kondensator gegen weiteres Laden drückt." }
      ]);
      return {
        draw(x, c) {
          const P = pal(c), U = s.Q / s.C;
          GX.bg(x, W, H, c);
          const w = 30 + s.C * 110, cx = 95, x0 = cx - w / 2, x1 = cx + w / 2, yT = 122, yB = 154;
          GX.wire(x, c, [[cx, 84], [cx, yT]]); GX.wire(x, c, [[cx, yB], [cx, 192]]);
          x.fillStyle = GX.alpha(c.accent, 0.07 + 0.3 * clamp(U / 20, 0, 1)); x.fillRect(x0 + 2, yT + 3, w - 4, yB - yT - 6);
          GX.plate(x, c, x0, yT, x1, yT); GX.plate(x, c, x0, yB, x1, yB);
          const n = Math.round(s.Q * 4);
          for (let i = 0; i < n; i++) {
            const px = x0 + (i + 0.5) * w / n;
            GX.ball(x, px, yT + 7, 3, c.pos, "+"); GX.ball(x, px, yB - 7, 3, c.neg, "−");
            if (hk("Q") > 0) { GX.glow(x, px, yT + 7, 9, P.Q, 0.5 * hk("Q")); GX.glow(x, px, yB - 7, 9, P.Q, 0.5 * hk("Q")); }
          }
          ring(x, P.T, hk("C"), cx, 138, w + 22, 52);
          GX.text(x, c.dim, "Kondensator", cx, 14, { weight: 700, size: 11 });
          GX.pill(x, c, "U_C = " + f1(U) + " V", cx, 64, { col: P.UC });
          GX.pill(x, c, "Q = " + f1(s.Q) + " mC", cx, 206, { col: P.Q });
          GX.pill(x, c, "C = " + f2(s.C) + " mF", cx, 230, {});
          // Tank
          const tw = 30 + s.C * 95, tcx = 255, tx0 = tcx - tw / 2, tx1 = tcx + tw / 2, yb = 210, ht = 160, lvl = clamp(U / 20, 0, 1) * ht;
          x.fillStyle = GX.alpha(P.Q, 0.45 + 0.25 * hk("Q")); x.fillRect(tx0 + 1.5, yb - lvl, tw - 3, lvl);
          x.strokeStyle = hk("C") > 0 ? P.T : c.fg; x.lineWidth = 2.6 + 1.6 * hk("C"); L(x, [[tx0, yb - ht - 8], [tx0, yb], [tx1, yb], [tx1, yb - ht - 8]]);
          x.strokeStyle = P.UC; x.lineWidth = 2.6 + 2.4 * hk("UC"); L(x, [[tx0, yb - lvl], [tx1, yb - lvl]]);
          x.font = "10px system-ui, sans-serif"; x.fillStyle = c.dim; x.textAlign = "right";
          [0, 10, 20].forEach(v => { const yy = yb - ht * v / 20; x.strokeStyle = c.border; x.lineWidth = 1; L(x, [[tx1 + 4, yy], [tx1 + 12, yy]]); x.fillText(v + " V", 356, yy + 3); });
          if (lvl > 34) GX.text(x, c.fg, "Wasser ≙ Q", tcx, yb - lvl / 2, { weight: 600, size: 10 });
          GX.text(x, c.dim, "Tank (Vergleich)", tcx, 14, { weight: 700, size: 11 });
          GX.text(x, c.dim, "Grundfläche ≙ C", tcx, 230, { size: 10 });
          GX.pill(x, c, "Wasserstand ≙ U_C", tcx, Math.max(30, yb - lvl - 14), { size: 10, col: P.UC });
          ro({ q: f1(s.Q) + " mC", c: f2(s.C) + " mF", u: f1(U) + " V" });
        }
      };
    }
  });

  // ============================================================ 2 · U_R = R·I
  SC.push({
    title: "Widerstand: U_R = R·I",
    lead: R`<b>Ein Widerstand bremst die Elektronen</b> (die Hindernisse im Draht). Damit trotzdem Strom fließt, muss vor dem Widerstand ein höheres Potenzial herrschen als dahinter. Dieses Gefälle ist die Spannung $U_R$. Unten siehst du es als Stufe.`,
    notes: [
      "Verdopple $R$ bei gleichem $I$. Wie ändert sich die Stufe? Und wenn du stattdessen $I$ verdoppelst?",
      "Hinweis: Die Elektronen laufen <b>entgegen</b> der Pfeilrichtung von $I$ (technische Stromrichtung). Das ist reine Vereinbarung."
    ],
    make(ui) {
      const s = { R: 4, I: 1, ph: 0 };
      slider(ui.ctl, { label: "Widerstand R", min: 1, max: 10, step: 0.5, value: s.R, fmt: v => f1(v) + " kΩ", onInput: v => { s.R = v; } });
      slider(ui.ctl, { label: "Strom I", min: 0.2, max: 2, step: 0.1, value: s.I, fmt: v => f1(v) + " mA", onInput: v => { s.I = v; } });
      const ro = readouts(ui.ro, [["r", "Widerstand R"], ["i", "Strom I"], ["u", "Spannung U_R = R·I"]]);
      ui.setEq(P => tc(P.UR, "U_R") + "=" + "R\\cdot" + tc(P.I, "I"));
      ui.setTerms(P => [
        { k: "R", col: P.T, tex: "R", text: "<b>Hindernisse</b> im Draht (Gitterionen). Je mehr Hindernisse, desto mehr Gefälle braucht es, um denselben Strom hindurchzudrücken." },
        { k: "I", col: P.I, tex: tc(P.I, "I"), text: "<b>Strom</b> = Ladung pro Sekunde (Elektronen pro Sekunde). Mehr Strom heißt mehr Zusammenstöße pro Sekunde, also mehr Gefälle." },
        { k: "UR", col: P.UR, tex: tc(P.UR, "U_R"), text: "<b>Potenzialstufe</b> über dem Widerstand (die Stufe unten). Diese Spannung „verbraucht“ der Widerstand. Sie steht in der Maschenregel (Schritt 4)." }
      ]);
      return {
        step(dt) { s.ph += (10 + s.I * 45) * dt; },
        draw(x, c) {
          const P = pal(c), Ur = s.R * s.I;
          GX.bg(x, W, H, c);
          const y0 = 62, bx0 = 90, bx1 = 250;
          GX.wire(x, c, [[14, y0], [bx0, y0]]); GX.wire(x, c, [[bx1, y0], [346, y0]]);
          GX.resistor(x, c, bx0, bx1, y0, "");
          ring(x, P.T, hk("R"), (bx0 + bx1) / 2, y0, bx1 - bx0 + 14, 36);
          const np = Math.round(s.R * 2.4), per = Math.ceil(np / 2);
          x.fillStyle = c.dim;
          for (let i = 0; i < np; i++) { const row = i % 2, m = row ? Math.floor(np / 2) : per; const idx = Math.floor(i / 2); x.beginPath(); x.arc(bx0 + 6 + (idx + 0.5) * (bx1 - bx0 - 12) / Math.max(1, m), y0 + (row ? 5 : -5), 2.1, 0, GX.TAU); x.fill(); }
          const len = 332, n = 15;
          for (let i = 0; i < n; i++) {
            const px = 346 - (((i * len / n) + s.ph) % len), inside = px > bx0 && px < bx1;
            const jit = inside ? Math.sin(s.ph * 0.35 + i * 2.1) * (1.5 + s.R * 0.45) : 0;
            GX.electron(x, c, px, y0 + jit, Math.min(1, 0.45 + s.I / 2));
            if (hk("I") > 0) GX.glow(x, px, y0 + jit, 9, P.I, 0.55 * hk("I"));
          }
          GX.arrow(x, P.I, 110, 24, 110 + 40 + 20 * hk("I"), 24, 1.4 + s.I * 1.4 + 1.5 * hk("I"));
          GX.pill(x, c, "I = " + f1(s.I) + " mA", 80, 24, { col: P.I, size: 10 });
          GX.pill(x, c, "R = " + f1(s.R) + " kΩ", (bx0 + bx1) / 2, 92, { size: 10 });
          // Potenzialverlauf
          const yb = 222, k = 4.5, yv = yb - Ur * k;
          x.strokeStyle = c.border; x.lineWidth = 1; L(x, [[14, yb], [346, yb]]);
          GX.text(x, c.dim, "Potenzial („Höhe“ der Ladung) entlang des Drahtes", 180, 118, { size: 10 });
          x.fillStyle = GX.alpha(P.UR, 0.16 + 0.2 * hk("UR")); x.beginPath(); x.moveTo(14, yb); x.lineTo(14, yv); x.lineTo(bx0, yv); x.lineTo(bx1, yb); x.closePath(); x.fill();
          x.strokeStyle = P.UR; x.lineWidth = 2.6 + 2.2 * hk("UR"); x.lineJoin = "round"; L(x, [[14, yv], [bx0, yv], [bx1, yb], [346, yb]]);
          GX.dim(x, c, 290, yv, 290, yb, "");
          GX.pill(x, c, "U_R = " + f1(Ur) + " V", 290, (yv + yb) / 2, { col: P.UR, size: 10 });
          GX.text(x, c.dim, "0 V", 332, yb + 10, { size: 10 });
          ro({ r: f1(s.R) + " kΩ", i: f1(s.I) + " mA", u: f1(Ur) + " V" });
        }
      };
    }
  });

  // ============================================================ 3 · I = dQ/dt
  SC.push({
    title: "Strom = Ladung pro Zeit",
    lead: R`<b>Strom ist die Rate, mit der Ladung auf die Platte fließt.</b> Hier läuft ein <i>konstanter</i> Strom: $Q$ wächst gleichmäßig, die $Q(t)$-Kurve ist eine Gerade, ihre <b>Steigung ist $I$</b>. Im RC-Kreis ändert sich $I$ dauernd. Dann nimmt man die Steigung in einem einzigen Punkt: das schreibt man $\dfrac{\mathrm{d}Q}{\mathrm{d}t}$.`,
    notes: [
      "Verdopple $I$. Wie ändert sich die Steigung der Kurve? Wie viel Ladung ist nach 5 s auf der Platte?",
      "Lies im Dreieck $\\Delta Q$ und $\\Delta t$ ab und rechne $\\Delta Q / \\Delta t$. Vergleiche mit dem eingestellten Strom."
    ],
    make(ui) {
      const s = { I: 1, t: 0, ph: 0 };
      slider(ui.ctl, { label: "Strom I (konstant)", min: 0.2, max: 2, step: 0.1, value: s.I, fmt: v => f1(v) + " mA", onInput: v => { s.I = v; s.t = 0; } });
      ui.button("Neustart", () => { s.t = 0; });
      const ro = readouts(ui.ro, [["t", "Zeit t"], ["q", "Ladung Q = I·t"], ["i", "Steigung ΔQ/Δt"]]);
      ui.setEq(P => tc(P.I, "I") + "=\\dfrac{" + tc(P.Q, "\\mathrm{d}Q") + "}{\\mathrm{d}t}");
      ui.setTerms(P => [
        { k: "Q", col: P.Q, tex: tc(P.Q, "Q"), text: "<b>Ladung</b> auf der Platte (Füllstand). Sie wächst, solange Elektronen nachfließen." },
        { k: "t", col: P.T, tex: "t", text: "<b>Zeit</b>. Strom heißt: wie viel Ladung in welcher Zeit. Ohne Zeit gäbe es keinen Strom." },
        { k: "dQdt", col: P.I, tex: tc(P.I, "I") + "=\\dfrac{" + tc(P.Q, "\\mathrm{d}Q") + "}{\\mathrm{d}t}", text: "<b>„d“ heißt: ein winzig kleines Stück.</b> $\\mathrm{d}Q/\\mathrm{d}t$ ist die Steigung der $Q(t)$-Kurve in <i>einem</i> Punkt. So wird „Ladung pro Sekunde“ zur exakten Formel, auch wenn der Strom sich ändert." }
      ]);
      const X = t => 250 + 9 * t, Y = q => 200 - 8 * q;
      return {
        step(dt) { s.t += dt; if (s.t > 10) s.t = 0; s.ph += (14 + s.I * 34) * dt; },
        draw(x, c) {
          const P = pal(c), Q = s.I * s.t;
          GX.bg(x, W, H, c);
          circuit(x, c, { src: "isrc", f: Q / 20, paths: [CH1, CH2], phase: s.ph, I: s.I / 2, rings: [RING.cap(P.Q, hk("Q"))] });
          GX.text(x, c.dim, "Stromquelle", 50, 112, { align: "left", size: 10 });
          GX.arrow(x, P.I, 70, 24, 120 + 16 * hk("dQdt"), 24, 1.4 + s.I * 1.3 + 1.8 * hk("dQdt"));
          GX.pill(x, c, "I = " + f1(s.I) + " mA", 40, 24, { col: P.I, size: 10, align: "left" });
          // Diagramm Q(t)
          x.strokeStyle = hk("t") > 0 ? P.T : c.fg; x.lineWidth = 1.4 + 2 * hk("t"); L(x, [[250, 200], [345, 200]]); x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[250, 200], [250, 34]]);
          x.font = "10px system-ui, sans-serif"; x.fillStyle = c.dim; x.textAlign = "center"; x.fillText("t in s", 330, 224); x.fillText("0", 250, 213); x.fillText("10", 340, 213);
          x.textAlign = "right"; x.fillText("Q in mC", 296, 28); x.fillText("20", 244, 40);
          x.strokeStyle = P.Q; x.lineWidth = 2.6; L(x, [[250, 200], [X(s.t), Y(Q)]]);
          GX.ball(x, X(s.t), Y(Q), 4, P.Q);
          const d = Math.min(2, s.t);
          if (d > 0.1) {
            const A_ = [X(s.t - d), Y(s.I * (s.t - d))], B_ = [X(s.t), Y(s.I * (s.t - d))], C_ = [X(s.t), Y(Q)];
            x.setLineDash([3, 3]); x.lineWidth = 1.6 + 2 * hk("dQdt"); x.strokeStyle = P.T; L(x, [A_, B_]); x.strokeStyle = P.I; L(x, [B_, C_]); x.setLineDash([]);
            GX.text(x, c.fg, "Δt", (A_[0] + B_[0]) / 2, B_[1] + 10, { size: 10, weight: 700 });
            GX.text(x, P.I, "ΔQ", B_[0] + 4, (B_[1] + C_[1]) / 2, { size: 10, weight: 700, align: "left" });
          }
          GX.pill(x, c, "Steigung = " + f1(s.I) + " mA", 298, 238, { col: P.I, size: 10 });
          ro({ t: f1(s.t) + " s", q: f1(Q) + " mC", i: f1(s.I) + " mA" });
        }
      };
    }
  });

  // ============================================================ gemeinsames RC-Modell
  function rcModel(o) {
    const m = { C: 0.4, R: 5, Q: o.start === "full" ? 0.4 * U0 : 0, run: o.run !== false, ph: 0 };
    m.Q0 = () => m.C * U0; m.tau = () => m.R * m.C; m.Uc = () => m.Q / m.C;
    m.I = () => (o.mode === "charge" ? (U0 - m.Uc()) / m.R : -m.Uc() / m.R); // mA, Vorzeichen: + = Laden
    m.step = dt => {
      if (m.run) { const inf = o.mode === "charge" ? m.Q0() : 0; m.Q = inf + (m.Q - inf) * Math.exp(-dt / m.tau()); }
      m.ph += (m.run ? 8 + 9 * Math.abs(m.I()) : 0) * dt;
    };
    m.setC = v => { const f = m.Q / m.Q0(); m.C = v; m.Q = f * m.Q0(); };
    m.reset = () => { m.Q = o.start === "full" ? m.Q0() : 0; m.run = true; };
    return m;
  }
  function rcSliders(ui, m) {
    slider(ui.ctl, { label: "Widerstand R", min: 1, max: 10, step: 0.5, value: m.R, fmt: v => f1(v) + " kΩ", onInput: v => { m.R = v; } });
    slider(ui.ctl, { label: "Kapazität C", min: 0.1, max: 1, step: 0.05, value: m.C, fmt: v => f2(v) + " mF", onInput: v => m.setC(v) });
  }

  // ============================================================ 4 · Maschenregel (Laden)
  SC.push({
    title: "Maschenregel beim Laden",
    lead: R`<b>Die Quelle drückt mit konstant $U_0$.</b> Anfangs ist der Kondensator leer ($U_C = 0$): die ganze Spannung liegt am Widerstand, es fließt viel Strom. Je voller er wird, desto stärker <b>drückt er zurück</b>: $U_C$ wächst, $U_R$ schrumpft. Die Summe bleibt immer $U_0$. Das ist die Maschenregel.`,
    notes: [
      "Beobachte den Balken: Wie ändern sich $U_R$ und $U_C$, während die Summe gleich bleibt? Wann ist $U_R$ fast null?",
      "Vergrößere $R$ und starte neu. Was bleibt gleich (Endwert), was ändert sich (Dauer)?"
    ],
    make(ui) {
      const m = rcModel({ mode: "charge" });
      rcSliders(ui, m);
      ui.button("Neu starten (leerer Kondensator)", () => m.reset(), "primary");
      const ro = readouts(ui.ro, [["ur", "Spannung am Widerstand U_R"], ["uc", "Spannung am Kondensator U_C"], ["sum", "Summe U_R + U_C"]]);
      ui.setEq(P => tc(P.T, "U_0") + "=" + tc(P.UR, "U_R") + "+" + tc(P.UC, "U_C") + "\\;\\Rightarrow\\;" + tc(P.T, "U_0") + "=" + tc(P.UR, "R") + tc(P.UR, "\\,\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}") + "+" + tc(P.UC, "\\dfrac{Q}{C}"));
      ui.setTerms(P => [
        { k: "U0", col: P.T, tex: "U_0", text: "<b>Quellspannung</b>: die Energie, die die Quelle pro Ladung hineingibt. Sie ist konstant und muss im Kreis vollständig „aufgebraucht“ werden." },
        { k: "UR", col: P.UR, tex: tc(P.UR, "U_R"), text: "<b>Spannung am Widerstand</b>. Sie steuert, wie viel Strom noch fließt: $U_R = R\\cdot I$ (Schritt 2)." },
        { k: "UC", col: P.UC, tex: tc(P.UC, "U_C"), text: "<b>Gegenspannung des Kondensators</b>: $U_C = Q/C$ (Schritt 1). Sie wächst mit der gespeicherten Ladung." },
        { k: "sub", col: P.I, tex: "U_R=R\\,\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t},\\;U_C=\\dfrac{Q}{C}", text: "<b>Einsetzen</b> der Bausteine aus Schritt 1 bis 3: $I = \\mathrm{d}Q/\\mathrm{d}t$. So hängt alles nur noch von $Q(t)$ ab. Das ist eine <b>Differenzialgleichung</b>." }
      ]);
      return {
        step: m.step,
        draw(x, c) {
          const P = pal(c), Uc = m.Uc(), Ur = U0 - Uc, I = Ur / m.R;
          GX.bg(x, W, H, c);
          const sub = hk("sub");
          circuit(x, c, { src: "bat", srcLab: "10 V", res: true, resLab: "", f: Uc / U0, paths: m.run ? [CH1, CH2] : [], phase: m.ph, I: I / 5,
            rings: [RING.src(P.T, hk("U0")), RING.res(P.UR, Math.max(hk("UR"), sub)), RING.cap(P.UC, Math.max(hk("UC"), sub))] });
          GX.pill(x, c, "U_R = " + f1(Ur) + " V", 100, 18, { col: P.UR, size: 10 });
          GX.pill(x, c, "U_C = " + f1(Uc) + " V", 112, 168, { col: P.UC, size: 10 });
          // Spannungsbalken
          const bx = 250, bw = 36, top = 50, bot = 200, hU = (bot - top);
          GX.text(x, c.dim, "Spannungen im Kreis", 285, 30, { weight: 700, size: 11 });
          const hc = hU * Uc / U0, hr = hU - hc;
          x.fillStyle = GX.alpha(P.UC, 0.6 + 0.3 * Math.max(hk("UC"), sub)); x.fillRect(bx, bot - hc, bw, hc);
          x.fillStyle = GX.alpha(P.UR, 0.6 + 0.3 * Math.max(hk("UR"), sub)); x.fillRect(bx, top, bw, hr);
          x.strokeStyle = c.fg; x.lineWidth = 2; x.strokeRect(bx, top, bw, hU);
          if (hr > 16) GX.text(x, "#fff", "U_R", bx + bw / 2, top + hr / 2, { weight: 800, size: 11 });
          if (hc > 16) GX.text(x, "#fff", "U_C", bx + bw / 2, bot - hc / 2, { weight: 800, size: 11 });
          x.strokeStyle = P.T; x.lineWidth = 1.5 + 2 * hk("U0"); L(x, [[bx - 6, top], [bx + bw + 6, top]]);
          GX.dim(x, c, bx + bw + 26, top, bx + bw + 26, bot, "");
          GX.pill(x, c, "U₀ = 10 V", bx + bw + 26, (top + bot) / 2 - 4, { size: 10, col: P.T });
          ro({ ur: f1(Ur) + " V", uc: f1(Uc) + " V", sum: f1(Ur + Uc) + " V" });
        }
      };
    }
  });

  // ============================================================ 5 · dQ/dt = (Q0 − Q)/τ
  SC.push({
    title: "Warum (Q₀ − Q)/τ?",
    lead: R`Stelle den Kreis um: <b>Der Strom ist der „Abstand zum Ziel“, geteilt durch $\tau$.</b> Ziehe den Füllstand: Ist der Kondensator fast leer, ist der fehlende Rest $Q_0 - Q$ groß und es fließt viel Strom. Ist er fast voll, fließt kaum noch etwas. Das ist die ganze Physik hinter der e-Funktion.`,
    notes: [
      "Ziehe den Füllstand auf 0 %, dann auf 50 % und 90 %. Wie verhält sich der Strompfeil im Verhältnis zum fehlenden Rest?",
      "Vergrößere $R$ oder $C$. Wie ändert sich $\\tau$, und wie ändert sich der Strom bei gleichem Füllstand?"
    ],
    make(ui) {
      const m = rcModel({ mode: "charge", run: false });
      m.Q = 0.2 * m.Q0();
      const sl = slider(ui.ctl, { label: "Füllstand Q / Q₀ (loslassen: Laden läuft)", min: 0, max: 100, step: 1, value: 20, fmt: v => v + " %", onInput: v => { m.run = false; m.Q = v / 100 * m.Q0(); } });
      rcSliders(ui, m);
      ui.button("Loslassen (Laden läuft)", () => { m.run = true; }, "primary");
      ui.button("Anhalten", () => { m.run = false; });
      const ro = readouts(ui.ro, [["q0", "Endladung Q₀ = C·U₀"], ["gap", "fehlt noch Q₀ − Q"], ["tau", "Zeitkonstante τ = R·C"], ["i", "Strom dQ/dt"]]);
      ui.setEq(P => tc(P.UR, "R") + tc(P.I, "\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}") + "=U_0-\\dfrac{Q}{C}=\\dfrac{" + tc(P.Q, "Q_0-Q") + "}{C}\\;\\Rightarrow\\;" + tc(P.I, "\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}") + "=\\dfrac{" + tc(P.Q, "Q_0-Q") + "}{" + tc(P.T, "\\tau") + "}");
      ui.setTerms(P => [
        { k: "Q0", col: P.Q, tex: tc(P.Q, "Q_0") + "=C\\,U_0", text: "<b>Endladung</b>: Dann ist $U_C = U_0$, es bleibt keine Spannung für $R$ übrig und der Strom ist null. Das <b>Ziel</b> des Ladevorgangs." },
        { k: "gap", col: P.Q, tex: tc(P.Q, "Q_0-Q"), text: "<b>Noch fehlende Ladung</b>. Sie ist proportional zu $U_R = U_0 - U_C = (Q_0 - Q)/C$. Je mehr fehlt, desto größer die Spannung am Widerstand, desto mehr Strom." },
        { k: "tau", col: P.T, tex: tc(P.T, "\\tau") + "=R\\,C", text: "<b>Zeitkonstante</b>. Sie entsteht beim Umstellen: $R\\,\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t} = \\dfrac{Q_0-Q}{C}$, dann durch $R$ teilen. Großes $R$ bremst, großes $C$ muss mehr aufnehmen: beides macht langsamer." },
        { k: "I", col: P.I, tex: tc(P.I, "\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}"), text: "<b>Änderungsrate der Ladung</b> = Strom (Schritt 3). Rechts als Pfeil gezeigt: Länge und Dicke sind proportional zum Strom." }
      ]);
      return {
        step(dt) { m.step(dt); if (m.run) { const v = Math.round(100 * m.Q / m.Q0()); if (v !== sl.get()) sl.set(v); } },
        draw(x, c) {
          const P = pal(c), Q0 = m.Q0(), gap = Q0 - m.Q, I = gap / m.tau();
          GX.bg(x, W, H, c);
          circuit(x, c, { src: "bat", srcLab: "10 V", res: true, resLab: "R", f: m.Q / Q0, paths: m.run ? [CH1, CH2] : [], phase: m.ph, I: I / 3, rings: [RING.res(P.T, hk("tau")), RING.cap(P.Q, Math.max(hk("Q0"), hk("gap")))] });
          // Füllstandsbalken
          const bx = 262, bw = 36, top = 50, bot = 200, hU = bot - top, hq = hU * m.Q / Q0, hg = hU - hq;
          GX.text(x, c.dim, "Ladungsstand", 280, 20, { weight: 700, size: 11 });
          x.fillStyle = GX.alpha(P.Q, 0.7); x.fillRect(bx, bot - hq, bw, hq);
          x.fillStyle = GX.alpha(P.Q, 0.12 + 0.25 * Math.max(hk("gap"), 0)); x.fillRect(bx, top, bw, hg);
          x.setLineDash([4, 3]); x.strokeStyle = P.Q; x.lineWidth = 1.6 + 2 * hk("gap"); x.strokeRect(bx, top, bw, hg); x.setLineDash([]);
          x.strokeStyle = c.fg; x.lineWidth = 2; x.strokeRect(bx, top, bw, hU);
          x.strokeStyle = P.Q; x.lineWidth = 1.5 + 2.5 * hk("Q0"); L(x, [[bx - 6, top], [bx + bw + 6, top]]);
          if (hq > 16) GX.text(x, "#fff", "Q", bx + bw / 2, bot - hq / 2, { weight: 800, size: 11 });
          if (hg > 18) GX.text(x, c.fg, "Q₀−Q", bx + bw / 2, top + hg / 2, { weight: 700, size: 10 });
          GX.pill(x, c, "Q₀ = " + f1(Q0) + " mC", bx + bw / 2, 36, { col: P.Q, size: 10 });
          // Strompfeil
          const len = 4 + 52 * clamp(I / (U0 / 1), 0, 1) * 5; // bis ca. 52 px bei 2 mA
          const al = clamp(len, 4, 56);
          GX.arrow(x, P.I, 330, bot, 330, bot - Math.max(6, al), 2 + al / 10 + 2 * hk("I"), 9);
          GX.text(x, P.I, "I", 342, bot - al / 2 - 4, { weight: 800, size: 11 });
          ro({ q0: f1(Q0) + " mC", gap: f1(gap) + " mC", tau: f1(m.tau()) + " s", i: f2(I) + " mA" });
        }
      };
    }
  });

  // ============================================================ 6 · Entladen
  SC.push({
    title: "Entladen: das Minus",
    lead: R`Jetzt ist <b>keine Quelle</b> im Kreis. Der geladene Kondensator selbst treibt den Strom durch $R$. Maschenregel: $U_C + U_R = 0$. $U_R$ ist also genau so groß wie $U_C$, nur mit <b>umgekehrtem Vorzeichen</b>: Der Strom fließt rückwärts. Daher das Minus: $Q$ nimmt ab, und zwar umso schneller, je mehr noch da ist.`,
    notes: [
      "Schau auf die Balken: Wie groß ist $U_C + U_R$ zu jedem Zeitpunkt?",
      "Warum fällt $U_C$ am Anfang schnell und später immer langsamer? Wie hängt das mit „Rate ∝ Vorrat“ zusammen?"
    ],
    make(ui) {
      const m = rcModel({ mode: "discharge", start: "full" });
      rcSliders(ui, m);
      ui.button("Neu starten (voller Kondensator)", () => m.reset(), "primary");
      const ro = readouts(ui.ro, [["uc", "Kondensatorspannung U_C"], ["ur", "Widerstandsspannung U_R"], ["i", "Strom dQ/dt"], ["q", "Ladung Q"]]);
      ui.setEq(P => tc(P.UC, "\\dfrac{Q}{C}") + "+" + tc(P.UR, "R\\,") + tc(P.I, "\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}") + "=0\\;\\Rightarrow\\;" + tc(P.I, "\\dfrac{\\mathrm{d}Q}{\\mathrm{d}t}") + "=" + tc(P.UR, "-") + "\\dfrac{Q}{\\tau}");
      ui.setTerms(P => [
        { k: "UC", col: P.UC, tex: tc(P.UC, "U_C") + "=\\dfrac{Q}{C}", text: "<b>Spannung des vollen Kondensators</b>. Jetzt ist sie die einzige „Quelle“ im Kreis und treibt den Entladestrom." },
        { k: "UR", col: P.UR, tex: tc(P.UR, "U_R") + "=R\\,I", text: "<b>Spannung am Widerstand</b>. Sie ist so groß wie $U_C$, aber <b>negativ</b>, weil der Strom entgegen der Laderichtung fließt." },
        { k: "minus", col: P.UR, tex: tc(P.UR, "-") + "\\dfrac{Q}{\\tau}", text: "<b>Das Minus</b>: $\\mathrm{d}Q/\\mathrm{d}t$ ist negativ, die Ladung wird kleiner. $Q$ steht rechts, weil der Strom (also die Abnahme) proportional zum Vorrat ist." }
      ]);
      return {
        step: m.step,
        draw(x, c) {
          const P = pal(c), Uc = m.Uc(), Ur = -Uc, I = m.I();
          GX.bg(x, W, H, c);
          circuit(x, c, { src: "wire", res: true, resLab: "R", f: m.Q / m.Q0(), paths: m.run ? [DIS] : [], phase: m.ph, I: Math.abs(I) / 5,
            rings: [RING.res(P.UR, Math.max(hk("UR"), hk("minus"))), RING.cap(P.UC, hk("UC"))] });
          GX.pill(x, c, "U_R = " + f1(Ur) + " V", 100, 18, { col: P.UR, size: 10 });
          GX.pill(x, c, "U_C = " + f1(Uc) + " V", 112, 168, { col: P.UC, size: 10 });
          GX.arrow(x, P.I, 150, 62, 100, 62, 1.6 + Math.abs(I) * 0.5 + 1.5 * hk("minus"));
          GX.text(x, P.I, "I", 126, 76, { weight: 800, size: 11 });
          // Balken über und unter der Nulllinie
          const base = 125, sc = 7;
          GX.text(x, c.dim, "Spannungen im Kreis", 292, 30, { weight: 700, size: 11 });
          x.fillStyle = GX.alpha(P.UC, 0.65 + 0.3 * hk("UC")); x.fillRect(262, base - sc * Uc, 30, sc * Uc);
          x.fillStyle = GX.alpha(P.UR, 0.65 + 0.3 * Math.max(hk("UR"), hk("minus"))); x.fillRect(298, base, 30, sc * Uc);
          x.strokeStyle = c.fg; x.lineWidth = 2; L(x, [[250, base], [342, base]]);
          GX.text(x, c.dim, "0 V", 346, base - 8, { size: 10, align: "right" });
          GX.text(x, c.fg, "U_C", 277, base - sc * Uc - 8, { size: 10, weight: 700 });
          GX.text(x, c.fg, "U_R", 313, base + sc * Uc + 9, { size: 10, weight: 700 });
          GX.pill(x, c, "U_C + U_R = " + f1(Uc + Ur) + " V", 296, 222, { size: 10 });
          ro({ uc: f1(Uc) + " V", ur: f1(Ur) + " V", i: f2(I) + " mA", q: f1(m.Q) + " mC" });
        }
      };
    }
  });

  // ============================================================ 7 · Variablentrennung: ln und t/τ
  SC.push({
    title: "Woher kommt der ln?",
    lead: R`Wir kennen nur die Rate und wollen $Q(t)$. <b>Trick:</b> alles mit $Q$ nach links, alles mit $t$ nach rechts: $\dfrac{\mathrm{d}Q}{Q_0-Q} = \dfrac{\mathrm{d}t}{\tau}$. Dann auf beiden Seiten alle kleinen Stücke aufsummieren (= Fläche unter der Kurve). Links ergibt die Fläche unter $\dfrac{1}{1-q}$ genau den <b>$-\ln$</b>, rechts ist es ein einfaches Rechteck $\dfrac{t}{\tau}$. <b>Beide Flächen sind zu jedem Zeitpunkt gleich groß.</b>`,
    notes: [
      "Lass die Zeit laufen: Welche Fläche wächst zuerst schnell, welche gleichmäßig? Warum sind sie trotzdem immer gleich groß?",
      "Ziehe $t/\\tau$ auf 1: Wie viel Prozent von $Q_0$ sind erreicht? (Tipp: $q = 1 - e^{-1}$.)"
    ],
    make(ui) {
      const s = { t: 0, run: true };
      const sl = slider(ui.ctl, { label: "Zeit t / τ", min: 0, max: 2.1, step: 0.02, value: 0, fmt: v => f2(v), onInput: v => { s.run = false; s.t = v; } });
      ui.button("Zeit läuft / Pause", () => { s.run = !s.run; if (s.run && s.t >= 2.1) s.t = 0; }, "primary");
      ui.button("Neustart", () => { s.t = 0; s.run = true; });
      const ro = readouts(ui.ro, [["q", "Füllstand q = Q/Q₀"], ["l", "linke Fläche −ln(1−q)"], ["r", "rechte Fläche t/τ"]]);
      ui.setEq(P => "\\int\\dfrac{\\mathrm{d}" + tc(P.Q, "Q") + "}{" + tc(P.Q, "Q_0-Q") + "}=\\int\\dfrac{\\mathrm{d}t}{" + tc(P.T, "\\tau") + "}\\;\\Rightarrow\\;" + tc(P.UC, "-\\ln") + "\\dfrac{" + tc(P.Q, "Q_0-Q") + "}{" + tc(P.Q, "Q_0") + "}=\\dfrac{t}{" + tc(P.T, "\\tau") + "}");
      ui.setTerms(P => [
        { k: "left", col: P.UC, tex: "\\dfrac{\\mathrm{d}Q}{Q_0-Q}", text: "<b>Linke Seite</b>: jeder kleine Ladungszuwachs, geteilt durch den Rest. Je näher am Ziel, desto größer das Gewicht (die Kurve $1/(1-q)$ steigt steil)." },
        { k: "ln", col: P.UC, tex: tc(P.UC, "-\\ln") + "(1-q)", text: "<b>Der ln</b> ist keine Magie: Die Fläche unter $1/x$ ist <i>definiert</i> als ln. Aufsummieren (Integrieren) von $1/(1-q)$ ergibt deshalb $-\\ln(1-q)$." },
        { k: "right", col: P.T, tex: "\\dfrac{t}{" + tc(P.T, "\\tau") + "}", text: "<b>Rechte Seite</b>: Die Höhe $1/\\tau$ ist konstant, die Breite ist $t$. Die Fläche ist also einfach das Rechteck $t/\\tau$." }
      ]);
      const QMAX = 0.875, T_MAX = 2.1;
      const lx0 = 24, lx1 = 168, ly0 = 190, lyH = 120, rx0 = 204, rx1 = 340;
      const kxL = (lx1 - lx0) / QMAX, kyL = lyH / 8, kxR = (rx1 - rx0) / T_MAX, kyR = kxL * kyL / kxR;
      return {
        step(dt) {
          if (s.run) { s.t += dt * 0.45; if (s.t >= T_MAX) { s.t = T_MAX; s.run = false; } sl.set(Math.round(s.t / 0.02) * 0.02); }
        },
        draw(x, c) {
          const P = pal(c), q = 1 - Math.exp(-s.t), area = s.t; // −ln(1−q) = t/τ
          GX.bg(x, W, H, c, false);
          // linkes Diagramm
          x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[lx0, ly0], [lx1 + 6, ly0]]); L(x, [[lx0, ly0], [lx0, ly0 - lyH - 6]]);
          x.font = "10px system-ui, sans-serif"; x.fillStyle = c.dim; x.textAlign = "center"; x.fillText("q = Q/Q₀", (lx0 + lx1) / 2 + 14, ly0 + 14); x.fillText("0", lx0, ly0 + 13); x.fillText("0,5", lx0 + kxL * 0.5, ly0 + 13);
          x.textAlign = "left"; x.fillText("1/(1−q)", lx0 + 4, ly0 - lyH - 8);
          x.beginPath(); x.moveTo(lx0, ly0);
          const qq = Math.min(q, QMAX);
          for (let i = 0; i <= 60; i++) { const v = qq * i / 60; x.lineTo(lx0 + kxL * v, ly0 - kyL * Math.min(8, 1 / (1 - v))); }
          x.lineTo(lx0 + kxL * qq, ly0); x.closePath();
          x.fillStyle = GX.alpha(P.UC, 0.28 + 0.3 * Math.max(hk("left"), hk("ln"))); x.fill();
          x.strokeStyle = P.UC; x.lineWidth = 2.2; x.beginPath();
          for (let i = 0; i <= 80; i++) { const v = QMAX * i / 80; const yy = ly0 - kyL * Math.min(8, 1 / (1 - v)); i ? x.lineTo(lx0 + kxL * v, yy) : x.moveTo(lx0 + kxL * v, yy); } x.stroke();
          GX.ball(x, lx0 + kxL * qq, ly0 - kyL * Math.min(8, 1 / (1 - qq)), 4, P.UC);
          // rechtes Diagramm
          x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[rx0, ly0], [rx1 + 6, ly0]]); L(x, [[rx0, ly0], [rx0, ly0 - lyH - 6]]);
          x.fillStyle = c.dim; x.textAlign = "center"; x.fillText("t/τ", (rx0 + rx1) / 2, ly0 + 14); x.fillText("0", rx0, ly0 + 13); x.fillText("2", rx0 + kxR * 2, ly0 + 13);
          x.textAlign = "left"; x.fillText("Höhe 1/τ", rx0 + 4, ly0 - lyH - 8);
          x.fillStyle = GX.alpha(P.T, 0.2 + 0.25 * Math.max(hk("right"), 0)); x.fillRect(rx0, ly0 - kyR, kxR * s.t, kyR);
          x.strokeStyle = P.T; x.lineWidth = 2.2; L(x, [[rx0, ly0 - kyR], [rx1, ly0 - kyR]]);
          x.strokeStyle = P.T; x.lineWidth = 1.6; x.strokeRect(rx0, ly0 - kyR, kxR * s.t, kyR);
          GX.ball(x, rx0 + kxR * s.t, ly0 - kyR, 4, P.T);
          GX.text(x, c.fg, "links: Σ dQ/(Q₀−Q)", 96, 26, { weight: 700, size: 10 });
          GX.text(x, c.fg, "rechts: Σ dt/τ", 272, 26, { weight: 700, size: 10 });
          GX.pill(x, c, "Fläche = " + f2(area), 96, 44, { col: P.UC, size: 10 });
          GX.pill(x, c, "Fläche = " + f2(area), 272, 44, { col: P.T, size: 10 });
          GX.text(x, c.fg, "=", 186, 44, { weight: 800, size: 16 });
          GX.pill(x, c, "q(t) = 1 − e^(−t/τ) = " + f2(q), 180, 236, { size: 10 });
          ro({ q: f2(q), l: f2(area), r: f2(s.t) });
        }
      };
    }
  });

  // ============================================================ 8 · Lösung und Probe
  SC.push({
    title: "Lösung und Probe",
    lead: R`Aus $-\ln\dfrac{Q_0-Q}{Q_0} = \dfrac{t}{\tau}$ folgt (beide Seiten als Exponent von $e$): $\dfrac{Q_0-Q}{Q_0} = e^{-t/\tau}$, umgestellt $Q(t) = Q_0\bigl(1-e^{-t/\tau}\bigr)$. <b>Probe:</b> Schiebe die Zeit. Die Steigung der Kurve (Tangente) ist an jeder Stelle genau $\dfrac{Q_0-Q}{\tau}$, also die Gleichung aus Schritt 5.`,
    notes: [
      "Schiebe $t$ auf $\\tau$. Wie viel Prozent von $Q_0$ sind erreicht? Und bei $5\\tau$? Wo trifft die Anfangstangente die Endlinie?",
      "Vergleiche die beiden Steigungswerte unten: Sie stimmen für jede Zeit überein. Das ist die Probe, dass die Lösung zur Gleichung passt.",
      "Wechsle auf <b>Entladen</b>: Welche Funktion beschreibt die Kurve, und warum ist die Steigung jetzt negativ?"
    ],
    make(ui) {
      const s = { R: 5, C: 0.4, t: 2, mode: "charge" };
      const tau = () => s.R * s.C;
      const modeBtns = [];
      const setMode = m => { s.mode = m; modeBtns.forEach(([mm, b]) => b.setAttribute("aria-pressed", String(mm === m))); ui.refresh(); };
      const segW = el("div", "seg"); ui.ctl.append(segW);
      [["charge", "Aufladen"], ["discharge", "Entladen"]].forEach(([m, t]) => { const b = el("button", "", t); b.type = "button"; b.setAttribute("aria-pressed", String(m === s.mode)); b.addEventListener("click", () => setMode(m)); segW.append(b); modeBtns.push([m, b]); });
      slider(ui.ctl, { label: "Zeit t", min: 0, max: 10, step: 0.05, value: 2, fmt: v => f2(v) + " s", onInput: v => { s.t = v; } });
      slider(ui.ctl, { label: "Widerstand R", min: 1, max: 10, step: 0.5, value: s.R, fmt: v => f1(v) + " kΩ", onInput: v => { s.R = v; } });
      slider(ui.ctl, { label: "Kapazität C", min: 0.1, max: 1, step: 0.05, value: s.C, fmt: v => f2(v) + " mF", onInput: v => { s.C = v; } });
      const ro = readouts(ui.ro, [["tau", "Zeitkonstante τ = R·C"], ["q", "Füllstand Q/Q₀"], ["a", "Steigung (aus der Kurve gemessen)"], ["b", "Steigung laut Gleichung"]]);
      const qf = t => (s.mode === "charge" ? 1 - Math.exp(-t / tau()) : Math.exp(-t / tau()));
      ui.setEq(P => s.mode === "charge"
        ? tc(P.Q, "Q(t)") + "=" + tc(P.Q, "Q_0") + "\\left(1-" + tc(P.UR, "e^{-t/") + tc(P.T, "\\tau") + tc(P.UR, "}") + "\\right)"
        : tc(P.Q, "Q(t)") + "=" + tc(P.Q, "Q_0") + tc(P.UR, "\\,e^{-t/") + tc(P.T, "\\tau") + tc(P.UR, "}"));
      ui.setTerms(P => [
        { k: "Q0", col: P.Q, tex: tc(P.Q, "Q_0"), text: s.mode === "charge" ? "<b>Endwert</b> (obere Linie): $Q_0 = C\\cdot U_0$. Die Kurve nähert sich ihr an, erreicht sie aber nie." : "<b>Startwert</b>: Der volle Kondensator trägt $Q_0 = C\\cdot U_0$. Von dort aus fällt die Kurve." },
        { k: "exp", col: P.UR, tex: tc(P.UR, "e^{-t/\\tau}"), text: "<b>Der noch nicht erledigte Rest</b>: startet bei 1 und schrumpft. Er hat die Form einer e-Funktion, weil die Rate immer proportional zum Rest ist (Schritt 5)." + (s.mode === "charge" ? " Bei $1-e^{-t/\\tau}$ ist es der <i>bereits erledigte</i> Teil." : "") },
        { k: "tau", col: P.T, tex: tc(P.T, "\\tau"), text: "<b>Zeitmaßstab</b>: Bei $t = \\tau$ sind " + (s.mode === "charge" ? "63 % erreicht (37 % Rest)." : "nur noch 37 % übrig.") + " Größeres $R$ oder $C$ streckt die Kurve." }
      ]);
      const X0 = 40, X1 = 340, Y0 = 30, Y1 = 190, kx = (X1 - X0) / 10, ky = Y1 - Y0, X = t => X0 + t * kx, Y = q => Y1 - q * ky;
      return {
        draw(x, c) {
          const P = pal(c), tu = tau(), q = qf(s.t), h = 1e-3;
          const slopeNum = (qf(s.t + h) - qf(s.t)) / h, slopeEq = s.mode === "charge" ? (1 - q) / tu : -q / tu;
          GX.bg(x, W, H, c, false);
          x.font = "10px system-ui, sans-serif"; x.lineWidth = 1;
          for (let i = 0; i <= 4; i++) { const yy = Y(i / 4); x.strokeStyle = c.border; L(x, [[X0, yy], [X1, yy]]); x.fillStyle = c.dim; x.textAlign = "right"; x.fillText(Math.round(i * 25) + " %", X0 - 4, yy + 3); }
          for (let i = 0; i <= 10; i += 2) { x.strokeStyle = c.border; L(x, [[X(i), Y0], [X(i), Y1]]); x.fillStyle = c.dim; x.textAlign = "center"; x.fillText(i + " s", X(i), Y1 + 13); }
          x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[X0, Y1], [X1 + 6, Y1]]); L(x, [[X0, Y1], [X0, Y0 - 6]]);
          GX.text(x, c.dim, "Q/Q₀", X0 + 4, Y0 - 12, { size: 10, align: "left" });
          // Q0-Linie
          x.strokeStyle = P.Q; x.lineWidth = 1.6 + 2.6 * hk("Q0"); x.setLineDash([6, 4]); const yq = s.mode === "charge" ? Y(1) : Y(1); L(x, [[X0, yq], [X1, yq]]); x.setLineDash([]);
          GX.text(x, P.Q, "Q₀", X1 + 2, Y(1), { size: 10, weight: 700, align: "left" });
          // Anfangstangente und τ-Marke
          x.strokeStyle = P.T; x.lineWidth = 1.4 + 2.2 * hk("tau"); x.setLineDash([5, 4]);
          if (s.mode === "charge") L(x, [[X(0), Y(0)], [X(Math.min(tu, 10)), Y(Math.min(1, 10 / tu))]]); else L(x, [[X(0), Y(1)], [X(Math.min(tu, 10)), Y(Math.max(0, 1 - 10 / tu))]]);
          x.setLineDash([2, 3]); const qt = qf(tu);
          if (tu <= 10) { L(x, [[X(tu), Y1], [X(tu), Y(qt)]]); L(x, [[X0, Y(qt)], [X(tu), Y(qt)]]); GX.pill(x, c, "τ = " + f1(tu) + " s", X(tu), Y1 - 12, { size: 10, col: P.T }); GX.pill(x, c, s.mode === "charge" ? "63 %" : "37 %", X0 + 26, Y(qt), { size: 10, col: P.T }); }
          x.setLineDash([]);
          // Kurve
          x.strokeStyle = P.UR; x.lineWidth = 2.8 + 2.2 * hk("exp"); x.lineJoin = "round"; x.beginPath();
          for (let i = 0; i <= 200; i++) { const t = i / 20; i ? x.lineTo(X(t), Y(qf(t))) : x.moveTo(X(t), Y(qf(t))); } x.stroke();
          // Tangente am Cursor
          const slPx = -slopeNum * ky / kx, dx = 48;
          x.save(); x.beginPath(); x.rect(X0, Y0 - 4, X1 - X0, Y1 - Y0 + 4); x.clip(); x.strokeStyle = P.I; x.lineWidth = 2.4; L(x, [[X(s.t) - dx, Y(q) - slPx * dx], [X(s.t) + dx, Y(q) + slPx * dx]]); x.restore();
          GX.ball(x, X(s.t), Y(q), 4.5, P.UR);
          GX.pill(x, c, "Q/Q₀ = " + Math.round(q * 100) + " %", clamp(X(s.t), 60, 300), Y(q) < 100 ? Y(q) + 18 : Y(q) - 18, { size: 10, col: P.UR });
          const fm = v => (v < 0 ? "−" : "") + Math.abs(v).toFixed(3).replace(".", ",");
          ro({ tau: f1(tu) + " s", q: Math.round(q * 100) + " %", a: fm(slopeNum) + " /s", b: fm(slopeEq) + " /s" });
        }
      };
    }
  });
})();
