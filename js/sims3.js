/* Labor, Teil 3: Q-U-Messung, Reihen- und Parallelschaltung, Millikan-Auswertung. */
(function () {
  "use strict";
  const K = window.PHYS_SIMKIT; if (!K) return;
  const { A, el, clamp, rnd, de, colors, stage, slider, seg, button, notes, readouts, L, GX } = K;
  const QE = 1.602e-19;
  const ICON = p => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + p + "</svg>";
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const arrowHead = (x, x2, y2, a, h) => { x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)); x.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)); x.closePath(); x.fill(); };

  // Achsen-Hilfe für Diagramme
  function axes(x, c, o) {
    const { X0, X1, Y0, Y1, xmax, ymax, xs, ys, xl, yl } = o;
    x.font = "11px system-ui, sans-serif"; x.lineWidth = 1;
    for (let i = 0; i <= ys; i++) { const v = ymax * i / ys, yy = Y1 - (Y1 - Y0) * i / ys; x.strokeStyle = c.border; L(x, [[X0, yy], [X1, yy]]); x.fillStyle = c.dim; x.textAlign = "right"; x.fillText(de(v, 3), X0 - 5, yy + 4); }
    for (let i = 0; i <= xs; i++) { const v = xmax * i / xs, xx = X0 + (X1 - X0) * i / xs; x.strokeStyle = c.border; L(x, [[xx, Y0], [xx, Y1]]); x.fillStyle = c.dim; x.textAlign = "center"; x.fillText(de(v, 3), xx, Y1 + 14); }
    x.strokeStyle = c.fg; x.lineWidth = 1.4; L(x, [[X0, Y1], [X1 + 6, Y1]]); L(x, [[X0, Y1], [X0, Y0 - 6]]);
    x.fillStyle = c.dim; x.textAlign = "left"; x.fillText(yl, X0 + 6, Y0 - 2); x.textAlign = "right"; x.fillText(xl, X1, Y1 + 28);
  }

  // ============================================================ Q-U-Messung: Kapazität bestimmen
  K.add({
    id: "qu", title: "Q-U-Messung", desc: "Kapazität eines unbekannten Kondensators per Messreihe und Diagramm bestimmen", sheet: "kondensator",
    icon: ICON('<path d="M4 20V4M4 20h16M6 18L19 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="9" cy="14" r="1.6" fill="currentColor"/><circle cx="14" cy="10" r="1.6" fill="currentColor"/>'),
    make(host) {
      const st = stage(360, 250); host.append(st.c);
      const CAPS = [{ n: "Kondensator A", C: 47 }, { n: "Kondensator B", C: 100 }, { n: "Kondensator C", C: 220 }, { n: "Kondensator D", C: 330 }];
      let cap = rnd(CAPS), U = 6, pts = [], shade = false, revealed = false;
      const info = el("div", "sim-info"); host.append(info);
      seg(host, { label: "Bauteil (Kapazität unbekannt)", options: CAPS.map(k => ({ v: k.n, t: k.n.replace("Kondensator ", "") })), value: cap.n,
        onChange: v => { cap = CAPS.find(k => k.n === v); pts = []; revealed = false; renderTable(); } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "Ladespannung U", min: 1, max: 12, step: 0.5, value: U, fmt: v => de(v) + " V", onInput: v => { U = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      button(acts, "Laden und Q messen", () => {
        const Q = cap.C * U * (1 + 0.025 * gauss());
        pts.push({ U, Q, a: 0 }); renderTable();
      }, "primary");
      const sb = button(acts, "Energie als Fläche: aus", () => { shade = !shade; sb.textContent = "Energie als Fläche: " + (shade ? "an" : "aus"); });
      button(acts, "Messreihe löschen", () => { pts = []; renderTable(); });
      const rb = button(acts, "Wert auflösen", () => { revealed = true; renderTable(); });
      void rb;
      const tbl = el("div", "sim-table"); host.append(tbl);
      notes(host, "Aufgaben", [
        "Miss bei mindestens 5 verschiedenen Spannungen. Wie liegen die Messpunkte im $Q$-$U$-Diagramm?",
        "Die Ausgleichsgerade geht durch den Ursprung. Ihre Steigung ist $C = \\dfrac{Q}{U}$. Bestimme $C$ und vergleiche mit dem Mittelwert der Quotienten $Q/U$ in der Tabelle.",
        "Schalte die Fläche ein: Die Fläche unter der Geraden ist die gespeicherte Energie $W = \\tfrac{1}{2}QU = \\tfrac{1}{2}CU^2$.",
        "Warum liegen die Punkte nicht genau auf der Geraden? (Messunsicherheit)"
      ]);
      const fit = () => { if (!pts.length) return null; let su = 0, sq = 0; pts.forEach(p => { su += p.U * p.U; sq += p.U * p.Q; }); return sq / su; };
      function renderTable() {
        if (!pts.length) { tbl.innerHTML = "<p class='fine tight'>Noch keine Messwerte. Stelle U ein und tippe auf „Laden und Q messen“.</p>"; return; }
        const m = fit(), mean = pts.reduce((a, p) => a + p.Q / p.U, 0) / pts.length;
        tbl.innerHTML = "<table class='cmp'><tr><th>Nr.</th><th>U in V</th><th>Q in µC</th><th>Q/U in µF</th></tr>" +
          pts.map((p, i) => "<tr><td>" + (i + 1) + "</td><td>" + de(p.U, 3) + "</td><td>" + de(p.Q, 3) + "</td><td>" + de(p.Q / p.U, 3) + "</td></tr>").join("") +
          "<tr><td colspan='3'><b>Mittelwert</b></td><td><b>" + de(mean, 3) + "</b></td></tr></table>" +
          "<p class='fine tight'>Steigung der Ausgleichsgeraden: <b>C ≈ " + de(m, 3) + " µF</b>" +
          (revealed ? " · tatsächlicher Wert: <b>" + cap.C + " µF</b> (Abweichung " + de(Math.abs(m - cap.C) / cap.C * 100, 2) + " %)" : "") + "</p>";
      }
      renderTable();
      let shadeV = 0, lineV = 0;
      function step(dt) {
        pts.forEach(p => { p.a = Math.min(1, (p.a || 0) + dt * 3); });
        shadeV = GX.ease(shadeV, shade ? 1 : 0, dt, 6);
        const m = fit(); lineV = GX.ease(lineV, m && pts.length >= 2 ? 1 : 0, dt, 5);
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, 360, 250, c);
        const ymax = Math.ceil(cap.C * 12 * 1.12 / 500) * 500, X0 = 52, X1 = 345, Y0 = 22, Y1 = 212;
        const sx = u => X0 + u / 12 * (X1 - X0), sy = q => Y1 - q / ymax * (Y1 - Y0);
        axes(x, c, { X0, X1, Y0, Y1, xmax: 12, ymax, xs: 6, ys: 5, xl: "U in V", yl: "Q in µC" });
        const m = fit();
        if (m && pts.length >= 2) {
          if (shadeV > 0.01) {
            x.save(); x.globalAlpha = shadeV;
            const g = x.createLinearGradient(0, sy(m * U), 0, Y1); g.addColorStop(0, GX.alpha(c.ok, 0.35)); g.addColorStop(1, GX.alpha(c.ok, 0.08));
            x.fillStyle = g; x.beginPath(); x.moveTo(sx(0), sy(0)); x.lineTo(sx(U), sy(m * U)); x.lineTo(sx(U), sy(0)); x.closePath(); x.fill(); x.restore();
            GX.pill(x, c, "W = ½QU = " + de(0.5 * m * U * U / 1000, 3) + " mJ", sx(U * 0.62), sy(m * U * 0.2), { col: c.ok, size: 11, clampW: 360 });
          }
          x.save(); x.strokeStyle = c.accent; x.lineWidth = 2.4; x.globalAlpha = lineV;
          const xe = sx(12 * lineV); GX.poly(x, [[sx(0), sy(0)], [xe, sy(m * 12 * lineV)]]); x.stroke(); x.restore();
          GX.pill(x, c, "Steigung: C ≈ " + de(m, 3) + " µF", X0 + 8, Y0 + 12, { align: "left", col: c.accent, size: 11 });
        }
        // aktuelle Ladespannung
        x.save(); x.strokeStyle = c.warn; x.setLineDash([3, 4]); x.lineWidth = 1.2; GX.poly(x, [[sx(U), Y0], [sx(U), Y1]]); x.stroke(); x.restore();
        GX.pill(x, c, de(U) + " V", sx(U), Y1 - 12, { col: c.warn, size: 10, clampW: 360 });
        // Messpunkte als Kreuze (erscheinen mit kurzem Aufleuchten)
        pts.forEach(p => {
          const px = sx(p.U), py = sy(p.Q), a = p.a || 0, s = 5 + (1 - a) * 8;
          if (a < 1) GX.glow(x, px, py, 18, c.accent, 0.6 * (1 - a));
          x.save(); x.globalAlpha = a; x.strokeStyle = c.fg; x.lineWidth = 2.2; x.lineCap = "round";
          GX.poly(x, [[px - s, py - s], [px + s, py + s]]); x.stroke(); GX.poly(x, [[px - s, py + s], [px + s, py - s]]); x.stroke(); x.restore();
        });
        info.textContent = pts.length < 2 ? "Miss bei mehreren Spannungen. Die Messpunkte werden als Kreuze eingetragen."
          : "Die Punkte liegen auf einer Ursprungsgeraden: Q ist proportional zu U. Die Steigung ist die Kapazität.";
      }
      return { step, draw };
    }
  });

  // ============================================================ Reihen- und Parallelschaltung
  K.add({
    id: "rp", el: true, title: "Reihe & Parallel", desc: "Zwei Kondensatoren schalten: Ladungen, Teilspannungen, Ersatzkapazität", sheet: "schaltung",
    icon: ICON('<path d="M3 8h5M8 4v8M11 4v8M11 8h10M3 16h5M8 12v8M11 12v8M11 16h10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    make(host) {
      const st = stage(360, 240); host.append(st.c);
      let mode = "par", C1 = 4, C2 = 12, U = 12;
      seg(host, { label: "Schaltung", options: [{ v: "par", t: "Parallel" }, { v: "ser", t: "Reihe" }], value: "par", onChange: v => { mode = v; } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "C₁", min: 1, max: 20, step: 1, value: C1, fmt: v => v + " µF", onInput: v => { C1 = v; } });
      slider(ctl, { label: "C₂", min: 1, max: 20, step: 1, value: C2, fmt: v => v + " µF", onInput: v => { C2 = v; } });
      slider(ctl, { label: "Spannung U", min: 1, max: 12, step: 1, value: U, fmt: v => v + " V", onInput: v => { U = v; } });
      const ro = readouts(host, [["cg", "Ersatzkapazität"], ["q1", "Ladung Q₁"], ["q2", "Ladung Q₂"], ["u1", "Spannung U₁"], ["u2", "Spannung U₂"], ["qg", "Gesamtladung"]]);
      const formula = el("div", "sim-eq"); host.append(formula);
      notes(host, "Aufgaben", [
        "<b>Parallel:</b> Welche Größe ist an beiden Kondensatoren gleich? Prüfe $C_{\\mathrm{ges}} = C_1 + C_2$.",
        "<b>Reihe:</b> Welche Größe ist jetzt gleich? An welchem Kondensator liegt die größere Spannung?",
        "Mache in Reihe $C_2$ sehr groß. Was passiert mit $C_{\\mathrm{ges}}$? Warum ist sie nie größer als der kleinste Kondensator?",
        "Vergleiche mit Widerständen: Dort ist es genau umgekehrt."
      ]);
      function vals() {
        if (mode === "par") { const cg = C1 + C2; return { cg, q1: C1 * U, q2: C2 * U, u1: U, u2: U, qg: cg * U }; }
        const cg = C1 * C2 / (C1 + C2), q = cg * U; return { cg, q1: q, q2: q, u1: q / C1, u2: q / C2, qg: q };
      }
      const VV = { q1: 0, q2: 0, u1: 0, u2: 0 };
      let phase = 0, flowAmt = 0;
      function step(dt) {
        const v = vals();
        const dq = Math.abs(v.q1 - VV.q1) + Math.abs(v.q2 - VV.q2);
        flowAmt = GX.ease(flowAmt, clamp(dq / 20, 0, 1), dt, 10);
        VV.q1 = GX.ease(VV.q1, v.q1, dt, 3); VV.q2 = GX.ease(VV.q2, v.q2, dt, 3);
        VV.u1 = GX.ease(VV.u1, v.u1, dt, 3); VV.u2 = GX.ease(VV.u2, v.u2, dt, 3);
        phase += dt * 60;
      }
      // Kondensator mit Ladungen; horizontal: Platten senkrecht im waagerechten Draht
      function cap(x, c, cx, cy, Cv, Q, Uv, label, horizontal) {
        const w = 22 + Cv * 2;
        if (horizontal) { GX.plate(x, c, cx - 6, cy - w / 2, cx - 6, cy + w / 2); GX.plate(x, c, cx + 6, cy - w / 2, cx + 6, cy + w / 2); }
        else { GX.plate(x, c, cx - w / 2, cy - 6, cx + w / 2, cy - 6); GX.plate(x, c, cx - w / 2, cy + 6, cx + w / 2, cy + 6); }
        const nq = clamp(10 * Math.sqrt(Math.max(0, Q) / 240), 0, 10), n = Math.ceil(nq);
        for (let i = 0; i < n; i++) {
          const a = clamp(nq - i, 0, 1), tt = (i + 0.5) / Math.max(n, 4) - 0.5;
          if (horizontal) { GX.ball(x, cx - 15, cy + tt * w, 4.4, c.pos, "+", { alpha: a }); GX.minus(x, c, cx + 15, cy + tt * w, 4.4, { alpha: a }); }
          else { GX.ball(x, cx + tt * w, cy - 15, 4.4, c.pos, "+", { alpha: a }); GX.minus(x, c, cx + tt * w, cy + 15, 4.4, { alpha: a }); }
        }
        if (horizontal) { GX.text(x, c.fg, label, cx, cy - w / 2 - 12, { weight: 700, size: 11 }); GX.pill(x, c, de(Uv, 3) + " V", cx, cy + w / 2 + 16, { col: c.accent, size: 10 }); }
        else { GX.text(x, c.fg, label, cx + w / 2 + 8, cy - 8, { align: "left", weight: 700, size: 11 }); GX.pill(x, c, de(Uv, 3) + " V", cx + w / 2 + 8, cy + 10, { align: "left", col: c.accent, size: 10 }); }
      }
      function flowDots(x, c, pts) {
        if (flowAmt < 0.03) return;
        let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        const n = Math.round(len / 22);
        for (let k = 0; k < n; k++) {
          let d = ((k * len / n + phase) % len + len) % len;
          for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l) { const t = d / l; GX.electron(x, c, pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t, flowAmt); break; } d -= l; }
        }
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, 360, 240, c);
        const v = vals(), yt = mode === "par" ? 30 : 70;
        if (mode === "par") {
          GX.wire(x, c, [[40, 104], [40, yt], [225, yt], [225, 113]]); GX.wire(x, c, [[120, yt], [120, 113]]);
          GX.wire(x, c, [[40, 134], [40, 212], [225, 212], [225, 129]]); GX.wire(x, c, [[120, 212], [120, 129]]);
          flowDots(x, c, [[40, 212], [40, 134]]); flowDots(x, c, [[40, 104], [40, yt], [225, yt]]);
          cap(x, c, 120, 121, C1, VV.q1, VV.u1, "C₁ = " + C1 + " µF", false);
          cap(x, c, 225, 121, C2, VV.q2, VV.u2, "C₂ = " + C2 + " µF", false);
          [[120, yt], [120, 212]].forEach(p => GX.node(x, c, p, 3.4));
        } else {
          GX.wire(x, c, [[40, 104], [40, yt], [124, yt]]); GX.wire(x, c, [[136, yt], [234, yt]]); GX.wire(x, c, [[246, yt], [320, yt], [320, 212], [40, 212], [40, 134]]);
          flowDots(x, c, [[40, 104], [40, yt], [124, yt]]); flowDots(x, c, [[246, yt], [320, yt], [320, 212], [40, 212], [40, 134]]);
          cap(x, c, 130, yt, C1, VV.q1, VV.u1, "C₁ = " + C1 + " µF", true);
          cap(x, c, 240, yt, C2, VV.q2, VV.u2, "C₂ = " + C2 + " µF", true);
          // Spannungsbalken U = U₁ + U₂
          const tot = 230, w1 = tot * VV.u1 / Math.max(U, 1e-6);
          x.save(); GX.rr(x, 70, 160, tot, 16, 8); x.clip();
          x.fillStyle = c.accent; x.fillRect(70, 160, w1, 16); x.fillStyle = c.warn; x.fillRect(70 + w1, 160, tot - w1, 16); x.restore();
          GX.text(x, c.dim, "U₁ (blau) + U₂ (gelb) = " + U + " V", 70, 192, { align: "left", size: 11 });
        }
        GX.battery(x, c, 40, 104, 134, U + " V");
        ro({ cg: de(v.cg, 3) + " µF", q1: de(v.q1, 3) + " µC", q2: de(v.q2, 3) + " µC", u1: de(v.u1, 3) + " V", u2: de(v.u2, 3) + " V", qg: de(v.qg, 3) + " µC" });
        const key = mode;
        if (formula._k !== key) {
          formula._k = key;
          formula.innerHTML = mode === "par"
            ? "$C_{\\mathrm{ges}} = C_1 + C_2$<br>Gleiche Spannung: $U_1 = U_2 = U$<br>Ladungen addieren sich: $Q = Q_1 + Q_2$"
            : "$\\dfrac{1}{C_{\\mathrm{ges}}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2}$<br>Gleiche Ladung: $Q_1 = Q_2$<br>Spannungen addieren sich: $U = U_1 + U_2$";
          A.render(formula);
        }
      }
      return { step, draw };
    }
  });

  // ============================================================ Millikan-Auswertung: Quantelung
  K.add({
    id: "millq", title: "Millikan-Auswertung", desc: "Viele Tröpfchen messen, Quantelung sehen, Elementarladung bestimmen", sheet: "millikan",
    icon: ICON('<path d="M4 20h16M6 20v-4M9 20v-9M12 20v-2M15 20v-12M18 20v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    make(host) {
      const st = stage(360, 230); host.append(st.c);
      let qs = [], anim = [], guess = 1.0, noise = 0.04;
      const info = el("div", "sim-info"); host.append(info);
      const acts = el("div", "sim-acts"); host.append(acts);
      const measure = k => { for (let i = 0; i < k; i++) { const n = 1 + Math.floor(Math.random() * Math.random() * 7); qs.push(n * QE * (1 + noise * gauss()) * 1e19); anim.push(-i * 0.12); } renderTable(); };
      button(acts, "1 Tröpfchen messen", () => measure(1));
      button(acts, "10 Tröpfchen messen", () => measure(10), "primary");
      button(acts, "Neu", () => { qs = []; anim = []; renderTable(); });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "Vermutete Elementarladung", min: 0.5, max: 3.5, step: 0.01, value: guess, fmt: v => de(v, 3) + "·10⁻¹⁹ C", onInput: v => { guess = v; renderTable(); } });
      slider(ctl, { label: "Messunsicherheit", min: 0, max: 10, step: 1, value: noise * 100, fmt: v => "± " + v + " %", onInput: v => { noise = v / 100; } });
      const tbl = el("div", "sim-table"); host.append(tbl);
      notes(host, "Aufgaben", [
        "Miss 20 bis 30 Tröpfchen. Die Ladungen bilden <b>Häufungen</b>. Was bedeutet das?",
        "Verschiebe die vermutete Elementarladung, bis die Linien durch alle Häufungen gehen. Bei welchem Wert passt es?",
        "Probiere die Hälfte des Werts: Dann liegen zwar alle Punkte auf Linien, aber jede zweite Linie bleibt leer. Probiere das Doppelte: Dann fallen Häufungen zwischen die Linien. Deshalb nimmt man den <b>größten</b> Wert, bei dem alle Häufungen getroffen werden.",
        "Erhöhe die Messunsicherheit. Ab wann sind die Häufungen nicht mehr zu erkennen?"
      ]);
      function stats() {
        if (!qs.length) return null;
        const ns = qs.map(q => Math.max(1, Math.round(q / guess)));
        const dev = qs.reduce((a, q, i) => a + Math.abs(q / guess - ns[i]), 0) / qs.length; // mittlere Abweichung vom Ganzzahligen
        const e = qs.reduce((a, q, i) => a + q / ns[i], 0) / qs.length;
        return { ns, dev, e };
      }
      function renderTable() {
        const s = stats();
        if (!s) { tbl.innerHTML = "<p class='fine tight'>Noch keine Messwerte.</p>"; return; }
        const ok = s.dev < 0.12;
        tbl.innerHTML = "<p class='fine tight'>" + qs.length + " Tröpfchen gemessen. Mittlere Abweichung von ganzen Vielfachen: <b>" + de(s.dev, 2) + "</b> " +
          (ok ? "(passt gut)" : "(passt nicht)") + ". Mittelwert aus q/n: <b>e ≈ " + de(s.e, 3) + " · 10⁻¹⁹ C</b>" +
          (ok && Math.abs(s.e - 1.602) / 1.602 < 0.06 ? " · Literaturwert 1,602 · 10⁻¹⁹ C getroffen!" : "") + "</p>" +
          "<table class='cmp'><tr><th>Nr.</th><th>q in 10⁻¹⁹ C</th><th>q / e*</th><th>n</th></tr>" +
          qs.slice(-8).map((q, j) => { const i = qs.length - Math.min(8, qs.length) + j; return "<tr><td>" + (i + 1) + "</td><td>" + de(q, 3) + "</td><td>" + de(q / guess, 3) + "</td><td>" + s.ns[i] + "</td></tr>"; }).join("") +
          "</table>" + (qs.length > 8 ? "<p class='fine tight'>Angezeigt: die letzten 8 Messungen.</p>" : "");
      }
      renderTable();
      let guessV = guess;
      function step(dt) {
        guessV = GX.ease(guessV, guess, dt, 10);
        anim.forEach((a, i) => { anim[i] = a + dt * 2.4; });
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, 360, 230, c);
        const X0 = 20, X1 = 345, base = 190, qmax = 12;
        const sx = q => X0 + q / qmax * (X1 - X0);
        // Raster der vermuteten Vielfachen
        const s = stats(), good = s && s.dev < 0.12;
        for (let k = 1; k * guessV <= qmax; k++) {
          x.save(); x.strokeStyle = good ? c.ok : c.warn; x.globalAlpha = 0.7; x.setLineDash([4, 4]); x.lineWidth = 1.3;
          GX.poly(x, [[sx(k * guessV), 22], [sx(k * guessV), base]]); x.stroke(); x.restore();
          if (guessV > 0.9 || k % 2 === 0) GX.text(x, good ? c.ok : c.warn, k + "e*", sx(k * guessV), 12, { size: 10, weight: 700 });
        }
        // Achse
        x.save(); x.strokeStyle = c.fg; x.lineWidth = 1.6; GX.poly(x, [[X0, base], [X1, base]]); x.stroke();
        for (let q = 0; q <= qmax; q += 2) { GX.poly(x, [[sx(q), base], [sx(q), base + 4]]); x.stroke(); GX.text(x, c.dim, String(q), sx(q), base + 14, { size: 11 }); }
        x.restore();
        GX.text(x, c.dim, "q in 10⁻¹⁹ C", X1, base + 30, { align: "right", size: 11 });
        // Tröpfchen fallen in die Klassen (Breite 0,15)
        const bins = {};
        qs.forEach((q, i) => {
          const b = Math.round(q / 0.15); bins[b] = (bins[b] || 0) + 1;
          const yEnd = Math.max(26, base - 6 - (bins[b] - 1) * 9), a = clamp(anim[i], 0, 1), e = 1 - Math.pow(1 - a, 3);
          if (anim[i] < 0) return;
          const yy = 20 + (yEnd - 20) * e;
          GX.ball(x, sx(q), yy, 3.8, c.accent, null, { alpha: Math.min(1, a * 2), glow: a < 1 ? 8 : 0 });
        });
        info.textContent = !qs.length ? "Jeder Punkt ist ein gemessenes Tröpfchen. Miss zuerst einige Tröpfchen."
          : good ? "Alle Ladungen liegen nahe bei ganzzahligen Vielfachen von e*. Die Ladung ist gequantelt."
          : "Die Linien treffen die Häufungen nicht. Verschiebe die vermutete Elementarladung.";
      }
      return { step, draw };
    }
  });
})();
