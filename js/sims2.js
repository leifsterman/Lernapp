/* Labor, Teil 2: Kondensator-Labor, Influenz & Polarisation & Faraday-Käfig, Millikan, Feldlinien.
   Grafik über PHYS_GFX (gfx.js), weiche Übergänge mit GX.ease. */
(function () {
  "use strict";
  const K = window.PHYS_SIMKIT; if (!K) return;
  const { A, el, clamp, de, colors, stage, slider, seg, button, notes, readouts, GX } = K;
  const E0 = 8.854e-12, QE = 1.602e-19, G = 9.81, TAU = Math.PI * 2;
  const prng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const ICON = p => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + p + "</svg>";
  const bez = (p0, p1, p2, p3, n) => { const out = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return out; };

  // Dipol (polares Molekül): + Ende zeigt in Richtung th
  function dipole(x, c, px, py, th, len, a, r) {
    r = r || 4.2;
    const dx = Math.cos(th) * len, dy = Math.sin(th) * len;
    x.save(); x.globalAlpha = a == null ? 1 : a;
    x.strokeStyle = GX.alpha(c.dim.startsWith("#") ? c.dim : "#888888", 0.8); x.lineWidth = Math.max(1.6, r * 0.7); x.lineCap = "round";
    x.beginPath(); x.moveTo(px - dx, py - dy); x.lineTo(px + dx, py + dy); x.stroke();
    GX.ball(x, px + dx, py + dy, r, c.pos, r > 3 ? "+" : null);
    GX.ball(x, px - dx, py - dy, r, c.neg, r > 3 ? "−" : null);
    x.restore();
  }

  // ============================================================ Kondensator-Labor
  K.add({
    id: "kond", title: "Kondensator-Labor", desc: "Abstand, Fläche und Dielektrikum verändern: C, Q, U, E live", sheet: "kondensator",
    icon: ICON('<path d="M4 9h16M4 15h16M12 3v6M12 15v6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    make(host) {
      const W = 360, H = 260, st = stage(W, H);
      const P = { d: 3, A: 150, er: 1, U: 9, connected: true };
      const V = { d: 3, A: 150, er: 1, lever: 1, q: 0, e: 0 }; // angezeigte (weich nachgeführte) Werte
      let Q0 = 0, phase = 0, t = 0;
      const rd = prng(5), mol = Array.from({ length: 40 }, () => ({ u: rd(), v: rd(), th: rd() * TAU, ph: rd() * TAU }));
      const C = () => E0 * P.er * (P.A * 1e-4) / (P.d * 1e-3);
      const U = () => P.connected ? P.U : Q0 / C();
      const Q = () => P.connected ? C() * P.U : Q0;
      host.append(st.c);
      seg(host, { label: "Quelle", options: [{ v: true, t: "Angeschlossen (U fest)" }, { v: false, t: "Getrennt (Q fest)" }], value: true, onChange: v => { if (!v) Q0 = C() * P.U; P.connected = v; } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      slider(ctl, { label: "Spannung U (Quelle)", min: 1, max: 12, step: 1, value: P.U, fmt: v => v + " V", onInput: v => { P.U = v; } });
      slider(ctl, { label: "Plattenabstand d", min: 1, max: 10, step: 0.5, value: P.d, fmt: v => de(v) + " mm", onInput: v => { P.d = v; } });
      slider(ctl, { label: "Plattenfläche A", min: 50, max: 400, step: 10, value: P.A, fmt: v => v + " cm²", onInput: v => { P.A = v; } });
      slider(ctl, { label: "Dielektrikum εᵣ", min: 1, max: 6, step: 0.5, value: P.er, fmt: v => v === 1 ? "Luft (1)" : de(v), onInput: v => { P.er = v; } });
      const ro = readouts(host, [["c", "Kapazität C"], ["q", "Ladung Q"], ["u", "Spannung U"], ["e", "Feldstärke E"], ["w", "Energie W"]]);
      notes(host, "Aufgaben", [
        "<b>Angeschlossen:</b> Verdopple den Plattenabstand. Was passiert mit $C$, $Q$ und $E$?",
        "<b>Getrennt:</b> Verdopple den Plattenabstand. Jetzt bleibt $Q$ gleich. Was macht $U$? Was macht $E$?",
        "Setze $\\varepsilon_r$ hoch (Dielektrikum): Wie ändert sich $C$ bei angeschlossener, wie $U$ bei getrennter Quelle?",
        "Prüfe $C = \\varepsilon_0\\varepsilon_r\\dfrac{A}{d}$ mit den angezeigten Werten."
      ]);
      const QMAX = E0 * 6 * 0.04 * 12 / 1e-3, EMAX = 12 / 1e-3;
      function step(dt) {
        t += dt;
        V.d = GX.ease(V.d, P.d, dt, 7); V.A = GX.ease(V.A, P.A, dt, 7); V.er = GX.ease(V.er, P.er, dt, 5);
        V.lever = GX.ease(V.lever, P.connected ? 1 : 0, dt, 10);
        V.q = GX.ease(V.q, clamp(Math.sqrt(Q() / QMAX), 0, 1), dt, 6); V.e = GX.ease(V.e, clamp(U() / (P.d * 1e-3) / EMAX, 0, 1), dt, 6);
        phase += dt * (8 + 40 * V.e);
        const a = clamp(V.e * 3, 0, 1) * (1 - 1 / V.er) / (1 - 1 / 6);
        mol.forEach(m => { const target = Math.PI / 2; let d = ((target - m.th + Math.PI * 3) % TAU) - Math.PI; m.th += d * Math.min(1, dt * 5 * a) + gauss() * Math.sqrt(dt) * 1.6 * (1 - 0.9 * a); });
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
        const gap = 18 + V.d * 8, len = 50 + Math.sqrt(V.A) * 10, cx = 210, cy = 140, yT = cy - gap / 2, yB = cy + gap / 2, xl = cx - len / 2, xr = cx + len / 2;
        // Dielektrikum
        if (V.er > 1.02) {
          const g = x.createLinearGradient(0, yT, 0, yB); g.addColorStop(0, GX.alpha(c.accent, 0.16 + 0.03 * V.er)); g.addColorStop(1, GX.alpha(c.accent, 0.06 + 0.02 * V.er));
          x.fillStyle = g; GX.rr(x, xl + 2, yT + 4, len - 4, gap - 8, 4); x.fill();
          const vis = clamp((V.er - 1) * 2, 0, 1);
          const cols = Math.max(3, Math.floor((len - 16) / 22)), rows = Math.max(1, Math.floor((gap - 10) / 18));
          mol.slice(0, cols * rows).forEach((m, i) => { const ci = i % cols, ri = Math.floor(i / cols); const px = xl + 12 + (ci + 0.5) * (len - 24) / cols, py = yT + 5 + (ri + 0.5) * (gap - 10) / rows; dipole(x, c, px, py, m.th, 4, 0.9 * vis, 2.6); });
        }
        // Feldlinien: homogen innen, Streufeld am Rand
        const nE = 2 + V.e * 11, nl = Math.ceil(nE);
        for (let i = 0; i < nl; i++) {
          const a = clamp(nE - i, 0, 1) * (0.25 + 0.75 * clamp(V.e * 6, 0, 1));
          const px = xl + 10 + (i + 0.5) * (len - 20) / nl;
          GX.flowLine(x, c.line, [[px, yT + 4], [px, yB - 4]], phase, { alpha: a, w: 1.4, head: gap > 34 });
        }
        if (V.e > 0.01) {
          [[xl, -1], [xr, 1]].forEach(([ex, s]) => {
            const pts = bez([ex + s * 2, yT + 3], [ex + s * gap * 0.55, yT + gap * 0.05], [ex + s * gap * 0.55, yB - gap * 0.05], [ex + s * 2, yB - 3], 24);
            GX.flowLine(x, c.line, pts, phase, { alpha: 0.45, w: 1.2, head: false });
          });
        }
        // Leitungen, Schalter, Batterie
        const bx = 40, b1 = 128, b2 = 150;
        GX.wire(x, c, [[bx, b1 - 3], [bx, 40], [104, 40]]);
        GX.wire(x, c, [[146, 40], [cx, 40], [cx, yT - 3]]);
        GX.wire(x, c, [[bx, b2 + 3], [bx, 236], [cx, 236], [cx, yB + 3]]);
        GX.battery(x, c, bx, b1, b2, P.U + " V");
        GX.terminal(x, c, [104, 40]); GX.terminal(x, c, [146, 40]);
        const ang = (1 - V.lever) * -0.75;
        x.save(); x.strokeStyle = c.fg; x.lineWidth = 3.2; x.lineCap = "round"; x.beginPath(); x.moveTo(104, 40); x.lineTo(104 + Math.cos(ang) * 42, 40 + Math.sin(ang) * 42); x.stroke(); x.restore();
        GX.text(x, c.dim, P.connected ? "geschlossen" : "offen", 125, 56, { size: 10 });
        // Platten mit Ladungen
        GX.plate(x, c, xl, yT, xr, yT, V.q > 0.05 ? GX.alpha(c.pos, 0.35 * V.q) : null);
        GX.plate(x, c, xl, yB, xr, yB, V.q > 0.05 ? GX.alpha(c.neg, 0.35 * V.q) : null);
        const nq = 1 + V.q * 20, nn = Math.ceil(nq);
        for (let i = 0; i < nn; i++) {
          const a = clamp(nq - i, 0, 1), px = xl + 6 + (i + 0.5) * (len - 12) / Math.max(nn, 8);
          GX.ball(x, px, yT - 9, 3.6, c.pos, "+", { alpha: a }); GX.minus(x, c, px, yB + 9, 3.6, { alpha: a });
        }
        // Maße
        GX.dim(x, c, xr + 34, yT, xr + 34, yB, null);
        GX.pill(x, c, "d = " + de(P.d) + " mm", Math.min(W - 4, xr + 34), yT - 16, { align: "right", size: 10, col: c.dim });
        GX.text(x, c.dim, "A = " + P.A + " cm²" + (P.er > 1 ? "   εᵣ = " + de(P.er) : ""), cx, yB + 28, { size: 11, weight: 600 });
        const cc = C(), qq = Q(), uu = U(), E = uu / (P.d * 1e-3);
        ro({ c: de(cc * 1e12, 3) + " pF", q: de(qq * 1e9, 3) + " nC", u: de(uu, 3) + " V", e: de(E / 1e3, 3) + " kV/m", w: de(0.5 * qq * uu * 1e9, 3) + " nJ" });
      }
      return { step, draw };
    }
  });

  // ============================================================ Influenz, Polarisation, Faraday
  K.add({
    id: "pol", title: "Influenz & Polarisation", desc: "Animationen: Ladungstrennung, Dipole im Dielektrikum, Faradayscher Käfig", sheet: "influenz",
    icon: ICON('<circle cx="9" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 8v8M20 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    make(host) {
      let tab = "inf";
      seg(host, { options: [{ v: "inf", t: "Influenz" }, { v: "pol", t: "Polarisation" }, { v: "far", t: "Faraday-Käfig" }], value: "inf", onChange: v => { tab = v; build(); } });
      const body = el("div", ""); host.append(body);
      let sim = null;
      const parts = {}; // jede Animation bleibt beim Umschalten erhalten
      function build() { if (!parts[tab]) { const b = el("div", ""); parts[tab] = { b, sim: tab === "inf" ? influenz(b) : tab === "pol" ? polar(b) : faraday(b) }; } body.replaceChildren(parts[tab].b); sim = parts[tab].sim; }
      build();
      return { step: dt => sim.step && sim.step(dt), draw: () => sim.draw() };

      // ---- Influenz: Metallkugel, negativer Stab (ziehbar), Erdung
      function influenz(h) {
        const W = 360, H = 250, st = stage(W, H, "touch-none"); h.append(st.c);
        const CX = 245, CY = 115, R = 62, N = 26;
        const homes = []; for (let i = 0; i < N; i++) { const r = 48 * Math.sqrt((i + 0.5) / N), a = i * 2.39996; homes.push([Math.cos(a) * r, Math.sin(a) * r]); }
        const els = homes.map(p => ({ x: p[0], y: p[1], vx: 0, vy: 0, st: "in", s: 0 })); // st: in (Kugel), out (Erdleitung abwärts), earth (in der Erde), back (zurück)
        let gap = 100, gapV = 100, grounded = false, t = 0;
        const EARTH_Y = 214, nGone = () => els.filter(e => e.st !== "in").length;
        const status = el("div", "sim-info"); h.append(status);
        const s = slider(h, { label: "Abstand Stab ↔ Kugel (oder Stab ziehen)", min: 0, max: 100, step: 1, value: 80, fmt: v => v < 15 ? "sehr nah" : v > 85 ? "weit weg" : v + " %", onInput: v => { gap = 6 + v * 1.2; } });
        gap = 6 + 80 * 1.2;
        const acts = el("div", "sim-acts"); h.append(acts);
        const gb = button(acts, "Erden: aus", () => { grounded = !grounded; gb.textContent = "Erden: " + (grounded ? "an" : "aus"); });
        button(acts, "Neu beginnen", () => { gap = 6 + 80 * 1.2; s.set(80); grounded = false; gb.textContent = "Erden: aus"; els.forEach((e, i) => { e.st = "in"; e.x = homes[i][0]; e.y = homes[i][1]; e.vx = e.vy = 0; }); });
        notes(h, "Aufgaben", ["Ziehe den negativen Stab an die Kugel heran. Wohin wandern die beweglichen Elektronen?",
          "Erde die Kugel (an), entferne dann die Erdung (aus) und erst danach den Stab. Wie ist die Kugel geladen?",
          "Warum bleibt die Kugel ohne Erdung insgesamt neutral?"]);
        let drag = false;
        st.c.addEventListener("pointerdown", e => { const p = st.pos(e); const edge = CX - R - gapV; if (p.x < edge + 10 && p.x > edge - 110 && Math.abs(p.y - CY) < 34) { drag = true; st.c.setPointerCapture && st.c.setPointerCapture(e.pointerId); } });
        st.c.addEventListener("pointermove", e => { if (!drag) return; const p = st.pos(e); const g = clamp(CX - R - (p.x + 45), 6, 126); gap = g; s.set(Math.round((g - 6) / 1.2)); });
        const up = () => { drag = false; }; st.c.addEventListener("pointerup", up); st.c.addEventListener("pointercancel", up);
        const k = () => clamp(1 - gapV / 135, 0, 1);
        function step(dt) {
          t += dt; gapV = GX.ease(gapV, gap, dt, 10);
          const kk = k();
          // Erdung: Elektronen wandern einzeln durch die Leitung in die Erde (und bei sinkender Zahl zurück), keines verschwindet unterwegs
          const target = grounded ? Math.round(kk * 8) : nGone();
          const moving = els.filter(e => e.st === "out" || e.st === "back").length, gone = nGone();
          if (moving === 0 && gone < target) { const cand = els.filter(e => e.st === "in").sort((p, q) => q.y - p.y)[0]; if (cand) { cand.st = "out"; cand.s = 0; cand.x0 = cand.x; cand.y0 = cand.y; } }
          else if (moving === 0 && gone > target) { const cand = els.find(e => e.st === "earth"); if (cand) { cand.st = "back"; cand.s = 0; } }
          els.forEach(e => {
            if (!grounded) return;
            if (e.st === "out") { e.s += dt * 1.4; if (e.s >= 1) { e.st = "earth"; e.s = 1; } }
            else if (e.st === "back") { e.s += dt * 1.4; if (e.s >= 1) { e.st = "in"; e.x = e.x0; e.y = e.y0; e.vx = e.vy = 0; } }
          });
          // Elektronen: Feder zur verschobenen Ruhelage + Zittern
          els.forEach((e, i) => {
            if (e.st !== "in") return;
            let tx = homes[i][0] + kk * 30 * (1 - 0.25 * Math.abs(homes[i][1]) / R), ty = homes[i][1];
            const d = Math.hypot(tx, ty), lim = R - 9; if (d > lim) { tx *= lim / d; ty *= lim / d; }
            e.vx += ((tx - e.x) * 30 - e.vx * 8) * dt + gauss() * 14 * Math.sqrt(dt);
            e.vy += ((ty - e.y) * 30 - e.vy * 8) * dt + gauss() * 14 * Math.sqrt(dt);
            e.x += e.vx * dt; e.y += e.vy * dt;
            const dd = Math.hypot(e.x, e.y); if (dd > lim) { e.x *= lim / dd; e.y *= lim / dd; }
          });
        }
        function draw() {
          const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
          const kk = k(), edge = CX - R - gapV;
          // Erdung
          {
            if (grounded) GX.wire(x, c, [[CX, CY + R], [CX, 214]]);
            else { GX.wire(x, c, [[CX, CY + R], [CX, 176]]); GX.wire(x, c, [[CX, 198], [CX, 214]]); x.save(); x.strokeStyle = c.fg; x.lineWidth = 2.4; x.lineCap = "round"; x.beginPath(); x.moveTo(CX, 176); x.lineTo(CX + 14, 190); x.stroke(); x.restore(); }
            GX.ground(x, c, CX, 216);
          }
          // Kugel (Metall)
          x.save(); const g = x.createRadialGradient(CX - 20, CY - 24, 8, CX, CY, R);
          g.addColorStop(0, GX.shade(c.surf2, 0.25)); g.addColorStop(1, GX.shade(c.surf2, GX.isDark(c) ? -0.25 : -0.12));
          x.fillStyle = g; x.strokeStyle = c.fg; x.lineWidth = 2.4; x.beginPath(); x.arc(CX, CY, R, 0, TAU); x.fill(); x.stroke(); x.restore();
          // Ionen und Elektronen
          homes.forEach(p => GX.ball(x, CX + p[0], CY + p[1], 3.2, c.pos, "+", { alpha: 0.85 }));
          const earthN = els.filter(e => e.st === "earth").length;
          els.forEach((e, i) => {
            if (e.st === "in") { GX.minus(x, c, CX + e.x, CY + e.y, 4.4); return; }
            if (e.st === "earth") return;
            // Weg: von der Kugel (Startpunkt) auf der Leitung nach unten zur Erde; zurück umgekehrt
            const u = e.st === "out" ? e.s : 1 - e.s;
            const sx = CX + (e.x0 || 0), sy = CY + (e.y0 || 0), top = CY + R;
            const leg1 = Math.hypot(sx - CX, sy - top), total = leg1 + (EARTH_Y - top), dd = u * total;
            const px = dd < leg1 ? sx + (CX - sx) * (dd / (leg1 || 1)) : CX, py = dd < leg1 ? sy + (top - sy) * (dd / (leg1 || 1)) : top + (dd - leg1);
            GX.minus(x, c, px, py, 4.4);
          });
          for (let i = 0; i < earthN; i++) GX.minus(x, c, CX + 22 + (i % 4) * 11, EARTH_Y + 12 + Math.floor(i / 4) * 11, 3.6, { alpha: 0.8 });
          // Stab (ziehbar)
          x.save(); const rg = x.createLinearGradient(0, CY - 20, 0, CY + 20); rg.addColorStop(0, GX.shade(c.neg, 0.35)); rg.addColorStop(1, GX.shade(c.neg, -0.3));
          x.fillStyle = rg; x.shadowColor = GX.alpha(c.neg, 0.5); x.shadowBlur = 10; GX.rr(x, edge - 104, CY - 18, 104, 36, 10); x.fill(); x.restore();
          for (let i = 0; i < 5; i++) GX.ball(x, edge - 88 + i * 18, CY, 5, GX.shade(c.neg, 0.15), "−");
          GX.text(x, c.dim, "⟷ ziehen", edge - 52, CY + 30, { size: 10 });
          const net = nGone();
          GX.pill(x, c, "Gesamtladung der Kugel: " + (net > 0 ? "+" + net + " e" : "0"), CX, 18, { col: net > 0 ? c.pos : c.dim, size: 10, clampW: W });
          const farAndFree = !grounded && gap > 90;
          status.textContent = net > 0 && farAndFree ? "Die Kugel ist jetzt positiv geladen: " + net + " Elektronen fehlen (Aufladung durch Influenz)."
            : net > 0 && !grounded ? "Elektronen sind abgeflossen. Entferne jetzt den Stab, dann verteilt sich die positive Ladung."
            : grounded && kk > 0.1 ? "Erdung: Die abgestoßenen Elektronen fließen zur Erde ab."
            : kk > 0.15 ? "Influenz: Die beweglichen Elektronen werden vom negativen Stab abgestoßen. Die Kugel ist insgesamt neutral."
            : "Der Stab ist weit weg: Die Ladungen sind gleichmäßig verteilt.";
        }
        return { step, draw };
      }

      // ---- Polarisation: Dipole im Dielektrikum
      function polar(h) {
        const W = 360, H = 250, st = stage(W, H); h.append(st.c);
        let kind = "or", Es = 0, EsV = 0, er = 4, phase = 0;
        const rd = prng(11), mol = [];
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) mol.push({ x: 112 + i * 27 + (rd() - 0.5) * 6, y: 84 + j * 25 + (rd() - 0.5) * 5, th: rd() * TAU });
        seg(h, { label: "Art", options: [{ v: "or", t: "Orientierung (polar, z. B. Wasser)" }, { v: "ve", t: "Verschiebung (Atome)" }], value: "or", onChange: v => { kind = v; } });
        const ctl = el("div", "sim-ctl"); h.append(ctl);
        slider(ctl, { label: "Feldstärke E₀", min: 0, max: 100, step: 1, value: 0, fmt: v => v + " %", onInput: v => { Es = v / 100; } });
        slider(ctl, { label: "Dielektrikum εᵣ", min: 1.5, max: 6, step: 0.5, value: er, fmt: v => de(v), onInput: v => { er = v; } });
        const info = el("div", "sim-info"); h.append(info);
        notes(h, "Aufgaben", ["Schalte das Feld ein. Was machen die Dipole bzw. Atome?", "Wo entstehen die <b>Polarisationsladungen</b>? Welches Vorzeichen haben sie oben und unten?",
          "Wie ändert sich das Feld im Dielektrikum? Vergleiche $E_0$ und $E_0/\\varepsilon_r$."]);
        const align = () => EsV * (1 - 1 / er) / (1 - 1 / 6);
        function step(dt) {
          EsV = GX.ease(EsV, Es, dt, 5); phase += dt * (6 + 40 * EsV);
          const a = align();
          mol.forEach(m => { let d = ((Math.PI / 2 - m.th + Math.PI * 3) % TAU) - Math.PI; m.th += d * Math.min(1, dt * 6 * a) + gauss() * Math.sqrt(dt) * 2.2 * (1 - 0.88 * a); });
        }
        function draw() {
          const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
          const a = align();
          GX.plate(x, c, 50, 30, 310, 30, EsV > 0.05 ? GX.alpha(c.pos, 0.4 * EsV) : null);
          GX.plate(x, c, 50, 220, 310, 220, EsV > 0.05 ? GX.alpha(c.neg, 0.4 * EsV) : null);
          const nq = 3 + EsV * 9;
          for (let i = 0; i < Math.ceil(nq); i++) { const al = clamp(nq - i, 0, 1), px = 60 + i * 20; GX.ball(x, px, 18, 4, c.pos, "+", { alpha: al }); GX.ball(x, px, 233, 4, c.neg, "−", { alpha: al }); }
          // Feld außerhalb des Blocks
          if (EsV > 0.02) [[66, 1], [294, 1]].forEach(([px]) => GX.flowLine(x, c.line, [[px, 36], [px, 214]], phase, { alpha: 0.3 + 0.7 * EsV, w: 1.6 }));
          // Block
          x.save(); const g = x.createLinearGradient(0, 62, 0, 180); g.addColorStop(0, GX.alpha(c.accent, 0.14)); g.addColorStop(1, GX.alpha(c.accent, 0.05));
          x.fillStyle = g; x.strokeStyle = c.dim; x.lineWidth = 1.5; GX.rr(x, 92, 62, 176, 118, 8); x.fill(); x.stroke(); x.restore();
          // Feld innen (abgeschwächt)
          if (EsV > 0.02) { const ai = (0.3 + 0.7 * EsV) / (1 + a * (er - 1)); [130, 230].forEach(px => GX.flowLine(x, c.line, [[px, 66], [px, 176]], phase / (1 + a * (er - 1)), { alpha: clamp(ai, 0.15, 1), w: 1.2, head: false })); }
          // Teilchen
          mol.forEach(m => {
            if (kind === "or") dipole(x, c, m.x, m.y, m.th, 7);
            else {
              const sh = a * 6;
              x.save(); const cg = x.createRadialGradient(m.x, m.y - sh, 1, m.x, m.y - sh, 10);
              cg.addColorStop(0, GX.alpha(c.neg, 0.55)); cg.addColorStop(1, GX.alpha(c.neg, 0.05));
              x.fillStyle = cg; x.beginPath(); x.arc(m.x, m.y - sh, 10, 0, TAU); x.fill(); x.restore();
              GX.ball(x, m.x, m.y, 3.2, c.pos);
            }
          });
          // gebundene Oberflächenladungen
          const n = a * 9;
          for (let i = 0; i < Math.ceil(n); i++) { const al = clamp(n - i, 0, 1), px = 104 + i * 19; GX.ball(x, px, 56, 3.6, c.neg, "−", { alpha: al }); GX.ball(x, px, 186, 3.6, c.pos, "+", { alpha: al }); }
          if (EsV > 0.02) { GX.pill(x, c, "E₀", 294, 125, { col: c.line, size: 10 }); GX.pill(x, c, "E = E₀/εᵣ", 180, 200, { col: c.line, size: 10 }); }
          info.textContent = Es === 0 ? "Ohne Feld sind die Dipole ungeordnet bzw. die Atome unverformt."
            : kind === "or" ? "Orientierungspolarisation: Die Dipole richten sich gegen die Wärmebewegung aus. An der Oberfläche entstehen gebundene Ladungen, das Feld im Inneren wird schwächer."
            : "Verschiebungspolarisation: Die Elektronenhüllen verschieben sich gegen die Kerne. An der Oberfläche entstehen gebundene Ladungen, das Feld im Inneren wird schwächer (E = E₀/εᵣ).";
        }
        return { step, draw };
      }

      // ---- Faradayscher Käfig: Feldlinien aus der Laplace-Gleichung
      function faraday(h) {
        const W = 360, H = 250, st = stage(W, H); h.append(st.c);
        let cage = true, E = 0.6, phase = 0;
        seg(h, { label: "Käfig", options: [{ v: true, t: "Mit Käfig" }, { v: false, t: "Ohne Käfig" }], value: true, onChange: v => { cage = v; } });
        slider(h, { label: "Feldstärke E", min: 10, max: 100, step: 1, value: 60, fmt: v => v + " %", onInput: v => { E = v / 100; } });
        const info = el("div", "sim-info"); h.append(info);
        notes(h, "Aufgaben", ["Schalte den Käfig ein. Was passiert mit dem Feld im Inneren?", "Wie treffen die Feldlinien auf die Käfigwand? (Achte auf den Winkel.)",
          "Wo sitzen die Influenzladungen und welches Vorzeichen haben sie?", "Warum ist man in einem Auto bei Blitzschlag geschützt?"]);
        const BX0 = 132, BX1 = 228, BY0 = 84, BY1 = 172, PL = 26, PR = 334;
        const cache = {};
        function solve(withCage) {
          const cs = 4, nx = Math.round(W / cs) + 1, ny = Math.round(H / cs) + 1, phi = new Float32Array(nx * ny), fixed = new Uint8Array(nx * ny);
          const id = (i, j) => j * nx + i;
          for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
            const X = i * cs, Y = j * cs;
            if (X <= PL) { phi[id(i, j)] = 1; fixed[id(i, j)] = 1; }
            else if (X >= PR) { phi[id(i, j)] = 0; fixed[id(i, j)] = 1; }
            else if (withCage && X >= BX0 && X <= BX1 && Y >= BY0 && Y <= BY1) { phi[id(i, j)] = 0.5; fixed[id(i, j)] = 1; }
            else phi[id(i, j)] = 1 - (X - PL) / (PR - PL);
          }
          if (withCage) for (let it = 0; it < 500; it++) for (let j = 0; j < ny; j++) for (let i = 1; i < nx - 1; i++) {
            const k = id(i, j); if (fixed[k]) continue;
            const up = j > 0 ? phi[id(i, j - 1)] : phi[id(i, j + 1)], dn = j < ny - 1 ? phi[id(i, j + 1)] : phi[id(i, j - 1)];
            phi[k] += 1.9 * ((phi[k - 1] + phi[k + 1] + up + dn) / 4 - phi[k]);
          }
          const at = (X, Y) => { const fi = clamp(X / cs, 0, nx - 1.001), fj = clamp(Y / cs, 0, ny - 1.001), i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j;
            return phi[id(i, j)] * (1 - u) * (1 - v) + phi[id(i + 1, j)] * u * (1 - v) + phi[id(i, j + 1)] * (1 - u) * v + phi[id(i + 1, j + 1)] * u * v; };
          const grad = (X, Y) => [-(at(X + 2, Y) - at(X - 2, Y)), -(at(X, Y + 2) - at(X, Y - 2))];
          const inside = (X, Y) => withCage && X >= BX0 - 1 && X <= BX1 + 1 && Y >= BY0 - 1 && Y <= BY1 + 1;
          function trace(X, Y) {
            const pts = [[X, Y]];
            for (let s = 0; s < 400; s++) {
              const g = grad(X, Y), m = Math.hypot(g[0], g[1]) || 1e-9; X += g[0] / m * 3; Y += g[1] / m * 3;
              if (X >= PR - 2 || X < PL || Y < 2 || Y > H - 2) { pts.push([Math.min(X, PR - 3), Y]); break; }
              if (inside(X, Y)) { pts.push([X, Y]); break; }
              pts.push([X, Y]);
            }
            return pts;
          }
          const lines = [];
          for (let y = 22; y <= H - 22; y += 17) lines.push(trace(PL + 3, y));
          if (withCage) for (let y = BY0 + 8; y <= BY1 - 6; y += 17) lines.push(trace(BX1 + 3, y));
          return lines;
        }
        function step(dt) { phase += dt * (8 + 40 * E); }
        function draw() {
          const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
          const key = cage ? "c" : "n"; if (!cache[key]) cache[key] = solve(cage);
          cache[key].forEach(l => GX.flowLine(x, c.line, l, phase, { alpha: 0.35 + 0.6 * E, w: 1.5, at: 0.35 }));
          GX.plate(x, c, PL - 4, 18, PL - 4, H - 18, GX.alpha(c.pos, 0.3 * E)); GX.plate(x, c, PR + 4, 18, PR + 4, H - 18, GX.alpha(c.neg, 0.3 * E));
          for (let i = 0; i < 7; i++) { GX.ball(x, PL - 14, 30 + i * 32, 4, c.pos, "+"); GX.ball(x, PR + 14, 30 + i * 32, 4, c.neg, "−"); }
          if (cage) {
            x.save(); x.fillStyle = GX.alpha(c.surf2.startsWith("#") ? c.surf2 : "#888888", 0.92); x.strokeStyle = c.fg; x.lineWidth = 3; x.setLineDash([8, 4]);
            GX.rr(x, BX0, BY0, BX1 - BX0, BY1 - BY0, 4); x.fill(); x.stroke(); x.restore();
            const n = Math.round(3 + 5 * E);
            for (let i = 0; i < n; i++) { const yy = BY0 + 10 + i * (BY1 - BY0 - 20) / Math.max(1, n - 1); GX.minus(x, c, BX0 + 8, yy, 3.8); GX.ball(x, BX1 - 8, yy, 3.8, c.pos, "+"); }
            GX.pill(x, c, "E = 0", (BX0 + BX1) / 2, (BY0 + BY1) / 2, { col: c.ok, size: 12 });
          } else {
            GX.ball(x, 180, 128, 8, c.warn, "+", { glow: 8 });
            GX.arrow(x, c.warn, 190, 128, 196 + 56 * E, 128, 3);
            GX.pill(x, c, "F = E·Q", 196 + 28 * E, 148, { col: c.warn, size: 10 });
          }
          info.textContent = cage ? "Die Influenzladungen auf dem Käfig erzeugen ein Gegenfeld. Die Feldlinien enden senkrecht auf der Wand, im Inneren ist E = 0."
            : "Ohne Käfig wirkt auf die Probeladung die Kraft F = E·Q in Feldrichtung.";
        }
        return { step, draw };
      }
    }
  });

  // ============================================================ Millikan: Blick durchs Mikroskop
  K.add({
    id: "mill", title: "Millikan-Versuch", desc: "Schwebespannung finden, Ladung berechnen, Messreihe auswerten", sheet: "millikan",
    icon: ICON('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M4 5h16M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    make(host) {
      const W = 360, H = 270, st = stage(W, H); host.append(st.c);
      const d = 5e-3, eta = 1.8e-5, rho = 880, SPEED = 6; // Zeitraffer: Fall durch die Platten in einigen Sekunden
      let scope = null, stuck = 0, U = 0, drop, rows = [], y = 0.5, jx = 0, topPlus = true, fade = 1, respawn = 0, forces = true, Fv = { el: 0, g: 1 };
      function newDrop() {
        const r = (0.75 + Math.random() * 0.25) * 1e-6, n = 1 + Math.floor(Math.random() * 5);
        drop = { r, n, m: 4 / 3 * Math.PI * r ** 3 * rho, q: n * QE, neg: Math.random() < 0.7 };
        y = 0.55; jx = 0; fade = 0; U = 0; sU.set(0);
      }
      seg(host, { label: "Polung der oberen Platte", options: [{ v: true, t: "oben +" }, { v: false, t: "oben −" }], value: true, onChange: v => { topPlus = v; } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      const sU = slider(ctl, { label: "Spannung U", min: 0, max: 1500, step: 1, value: 0, fmt: v => v + " V", onInput: v => { U = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      [[-10, "−10 V"], [-1, "−1 V"], [1, "+1 V"], [10, "+10 V"]].forEach(([dv, t]) => button(acts, t, () => { U = clamp(U + dv, 0, 1500); sU.set(U); }));
      const acts2 = el("div", "sim-acts"); host.append(acts2);
      button(acts2, "Neues Tröpfchen", () => newDrop());
      button(acts2, "Schwebespannung notieren", () => record(), "primary");
      const fb = button(acts2, "Kräfte: an", () => { forces = !forces; fb.textContent = "Kräfte: " + (forces ? "an" : "aus"); });
      const info = el("div", "sim-info"); host.append(info);
      const ro = readouts(host, [["m", "Masse m (bekannt)"], ["fel", "elektrische Kraft"], ["fg", "Gewichtskraft"], ["v", "Geschwindigkeit"]]);
      const tbl = el("div", "sim-table"); host.append(tbl);
      notes(host, "Aufgaben", ["Stelle die Spannung so ein, dass das Tröpfchen <b>schwebt</b>. Nutze die Feinstufen.",
        "Berechne $q = \\dfrac{m\\,g\\,d}{U}$ und vergleiche mit $e = 1{,}602\\cdot10^{-19}\\,\\mathrm{C}$. Wie viele Elementarladungen sind es?",
        "Notiere mehrere Tröpfchen. Welche gemeinsame Einheit haben alle Ladungen? Bilde den Mittelwert für $e$.",
        "Manche Tröpfchen sind positiv geladen. Welche Platte muss dann oben + sein, damit sie schweben können?"]);
      const dir = () => (topPlus === drop.neg ? 1 : -1); // +1: elektrische Kraft nach oben
      const net = () => dir() * drop.q * U / d - drop.m * G;
      function record() {
        const fg = drop.m * G;
        if (U > 0 && dir() < 0) { A.toast("Die elektrische Kraft zeigt nach unten. Polung umkehren!"); return; }
        if (U <= 0 || Math.abs(net()) > 0.05 * fg) { A.toast("Das Tröpfchen schwebt noch nicht. Stelle die Spannung genauer ein."); return; }
        const q = drop.m * G * d / U, nEst = Math.max(1, Math.round(q / QE));
        rows.push({ U, q, nEst }); renderTable(); newDrop();
      }
      function renderTable() {
        if (!rows.length) { tbl.innerHTML = ""; return; }
        const es = rows.map(r => r.q / r.nEst), mean = es.reduce((a, b) => a + b, 0) / es.length;
        tbl.innerHTML = "<table class='cmp'><tr><th>Nr.</th><th>U in V</th><th>q in 10⁻¹⁹ C</th><th>n ≈</th></tr>" +
          rows.map((r, i) => "<tr><td>" + (i + 1) + "</td><td>" + de(r.U, 4) + "</td><td>" + de(r.q * 1e19, 3) + "</td><td>" + r.nEst + "</td></tr>").join("") + "</table>" +
          "<p class='fine tight'>Mittelwert aus q/n: <b>" + de(mean * 1e19, 3) + " · 10⁻¹⁹ C</b> (Literaturwert 1,602 · 10⁻¹⁹ C)</p>";
      }
      newDrop();
      function step(dt) {
        fade = GX.ease(fade, respawn > 0 ? 0 : 1, dt, 6);
        if (respawn > 0) { respawn -= dt; if (respawn <= 0) { y = 0.55; jx = 0; } return; }
        const v = net() / (6 * Math.PI * eta * drop.r); // m/s, positiv: nach oben
        drop.v = v;
        y += v * dt * SPEED / d;
        jx += gauss() * Math.sqrt(dt) * 0.25 - jx * dt * 3; // nur minimales seitliches Zittern, kein Hin- und Herwandern
        // am Rand des Sehfelds liegen bleiben; erst nach einer Weile kommt ein neues Tröpfchen
        if (y > 0.95 || y < 0.05) { y = clamp(y, 0.05, 0.95); stuck += dt; if (stuck > 3) { stuck = 0; respawn = 0.45; } } else stuck = 0;
        Fv.el = GX.ease(Fv.el, U > 0 ? dir() * drop.q * U / d / (drop.m * G) : 0, dt, 10); Fv.g = 1;
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
        const top = 28, bot = 242, cx = 180, cy = (top + bot) / 2, R = 100;
        GX.plate(x, c, 40, top, 320, top, U > 0 ? GX.alpha(topPlus ? c.pos : c.neg, 0.4) : null);
        GX.plate(x, c, 40, bot, 320, bot, U > 0 ? GX.alpha(topPlus ? c.neg : c.pos, 0.4) : null);
        GX.badge(x, c, topPlus ? "+" : "−", 334, top, topPlus ? c.pos : c.neg); GX.badge(x, c, topPlus ? "−" : "+", 334, bot, topPlus ? c.neg : c.pos);
        GX.dim(x, c, 24, top + 4, 24, bot - 4, null);
        x.save(); x.translate(13, cy); x.rotate(-Math.PI / 2); GX.text(x, c.dim, "d = 5 mm", 0, 0, { size: 10, weight: 600 }); x.restore();
        GX.pill(x, c, U + " V", 334, cy + 64, { col: c.accent, size: 11, clampW: W });
        // Mikroskop-Sehfeld (Dunkelfeld)
        const sc = x.getTransform().a || 1;
        if (!scope || scope._sc !== sc) {
          scope = document.createElement("canvas"); scope._sc = sc; scope.width = scope.height = Math.ceil(2 * R * sc);
          const s2 = scope.getContext("2d"); s2.setTransform(sc, 0, 0, sc, R * sc, R * sc);
          s2.beginPath(); s2.arc(0, 0, R, 0, TAU); s2.clip();
          const g = s2.createRadialGradient(0, 0, 10, 0, 0, R); g.addColorStop(0, "#141a26"); g.addColorStop(1, "#05070b");
          s2.fillStyle = g; s2.fillRect(-R, -R, 2 * R, 2 * R);
          s2.strokeStyle = "rgba(160,190,230,.22)"; s2.lineWidth = 1;
          for (let i = -4; i <= 4; i++) { s2.beginPath(); s2.moveTo(-R, i * 20); s2.lineTo(R, i * 20); s2.stroke(); }
          s2.strokeStyle = "rgba(160,190,230,.45)"; s2.beginPath(); s2.moveTo(0, -R); s2.lineTo(0, R); s2.stroke();
          for (let i = -8; i <= 8; i++) { s2.beginPath(); s2.moveTo(-4, i * 10); s2.lineTo(4, i * 10); s2.stroke(); }
        }
        x.save(); x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.clip();
        x.drawImage(scope, cx - R, cy - R, 2 * R, 2 * R);
        // Tröpfchen: hell im Streulicht
        const py = bot - y * (bot - top), px = cx + clamp(jx, -0.6, 0.6) * 2;
        const floating = U > 0 && dir() > 0 && Math.abs(net()) < 0.02 * drop.m * G;
        x.globalAlpha = fade;
        GX.glow(x, px, py, 22, floating ? "#3fb57a" : "#ffd28a", 0.55);
        GX.glow(x, px, py, 7, "#fff6e0", 0.95);
        x.fillStyle = "#fffdf5"; x.beginPath(); x.arc(px, py, 2.4, 0, TAU); x.fill();
        x.globalAlpha = 1; x.restore();
        x.strokeStyle = c.fg; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.stroke();
        // Kräfte
        if (forces) {
          // Kräftekasten rechts oben: Kräfte am Tröpfchen, maßstäblich (größte Kraft 44 px)
          const fx = 334, fy = 122, big = Math.max(1, Math.abs(Fv.el)), sc = 34 / big;
          x.save(); x.fillStyle = GX.alpha(c.surf.startsWith("#") ? c.surf : "#ffffff", 0.9); x.strokeStyle = c.border; x.lineWidth = 1;
          GX.rr(x, fx - 21, fy - 58, 42, 116, 10); x.fill(); x.stroke(); x.restore();
          if (Math.abs(Fv.el) > 0.02) GX.arrow(x, c.ok, fx - 6, fy, fx - 6, fy - Fv.el * sc, 2.6);
          GX.arrow(x, c.bad, fx + 6, fy, fx + 6, fy + sc, 2.6);
          GX.ball(x, fx, fy, 4, "#e8b04a");
          GX.text(x, c.ok, "F_el", fx, Fv.el >= 0 ? fy - 48 : fy + 48, { size: 9, weight: 700 });
          GX.text(x, c.bad, "F_G", fx, Fv.el >= 0 ? fy + 48 : fy - 48, { size: 9, weight: 700 });
        }
        const fel = drop.q * U / d, fg = drop.m * G;
        ro({ m: de(drop.m * 1e15, 3) + " · 10⁻¹⁵ kg", fel: de(fel * 1e15, 3) + " · 10⁻¹⁵ N", fg: de(fg * 1e15, 3) + " · 10⁻¹⁵ N", v: de((drop.v || 0) * 1e3, 2) + " mm/s" });
        info.textContent = stuck > 0.3 ? "Das Tröpfchen ist am Rand angekommen. Ändere die Spannung, sonst kommt gleich ein neues Tröpfchen."
          : U > 0 && dir() < 0 ? "Die elektrische Kraft zeigt nach unten (" + (drop.neg ? "negatives" : "positives") + " Tröpfchen). Polung umkehren!"
          : floating ? "Das Tröpfchen schwebt: F_el = F_G. Jetzt Spannung ablesen und q berechnen."
          : net() > 0 ? "Die elektrische Kraft überwiegt: Das Tröpfchen steigt." : "Die Gewichtskraft überwiegt: Das Tröpfchen sinkt.";
      }
      return { step, draw };
    }
  });

  // ============================================================ Feldlinien-Labor
  K.add({
    id: "feld", title: "Feldlinien-Labor", desc: "Ladungen setzen und verschieben, Feldlinien und Probeladung beobachten", sheet: "feldlinien",
    icon: ICON('<circle cx="6" cy="12" r="2.5" fill="currentColor"/><circle cx="18" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 11c3-3 4-3 7 0M8.5 13c3 3 4 3 7 0" stroke="currentColor" stroke-width="1.6" fill="none"/>'),
    make(host) {
      const W = 360, H = 290, st = stage(W, H, "touch-none"); host.append(st.c);
      let ch = [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: -1 }], mode = "+", probe = null, drag = null, dirty = true, lines = [], phase = 0;
      seg(host, { label: "Modus", options: [{ v: "+", t: "+ setzen" }, { v: "-", t: "− setzen" }, { v: "m", t: "Verschieben" }, { v: "d", t: "Löschen" }, { v: "p", t: "Probeladung" }], value: "+", onChange: v => { mode = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      const pre = {
        "Dipol": () => [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: -1 }],
        "Gleichnamig": () => [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: 1 }],
        "Platten": () => { const a = []; for (let i = 0; i < 7; i++) a.push({ x: 72 + i * 36, y: 70, q: 1 }); for (let i = 0; i < 7; i++) a.push({ x: 72 + i * 36, y: 220, q: -1 }); return a; },
        "Einzeln": () => [{ x: 180, y: 145, q: 1 }]
      };
      Object.keys(pre).forEach(k => button(acts, k, () => { ch = pre[k](); probe = null; dirty = true; }));
      button(acts, "Alle löschen", () => { ch = []; probe = null; dirty = true; });
      const info = el("div", "sim-info", "Tippe auf die Fläche, um Ladungen zu setzen. Im Modus „Probeladung“ siehst du Richtung und relative Stärke von E an einem Punkt."); host.append(info);
      notes(host, "Aufgaben", ["Setze + und − nebeneinander. Wo sind die Feldlinien am dichtesten? Was bedeutet das?",
        "Setze zwei gleichnamige Ladungen. Finde mit der Probeladung den Punkt, an dem $E = 0$ gilt.",
        "Lade „Platten“. Wo ist das Feld homogen, wo nicht?"]);
      const fieldAt = (px, py) => { let ex = 0, ey = 0; ch.forEach(c => { const dx = px - c.x, dy = py - c.y, r2 = dx * dx + dy * dy + 1e-3, r3 = Math.pow(r2, 1.5); ex += c.q * dx / r3; ey += c.q * dy / r3; }); return [ex, ey]; };
      function trace() {
        lines = [];
        const hasPos = ch.some(c => c.q > 0), src = ch.filter(c => hasPos ? c.q > 0 : c.q < 0), dir = hasPos ? 1 : -1;
        src.forEach(s => {
          const n = ch.length > 8 ? 6 : 14;
          for (let i = 0; i < n; i++) {
            const a = (i + 0.5) / n * TAU; let px = s.x + 10 * Math.cos(a), py = s.y + 10 * Math.sin(a); const pts = [[px, py]];
            for (let k = 0; k < 900; k++) {
              const f = fieldAt(px, py), m = Math.hypot(f[0], f[1]) || 1; px += dir * f[0] / m * 2.6; py += dir * f[1] / m * 2.6;
              if (px < 2 || px > W - 2 || py < 2 || py > H - 2) { pts.push([px, py]); break; }
              let hit = false; for (const c of ch) if (Math.sign(c.q) !== Math.sign(s.q) && Math.hypot(px - c.x, py - c.y) < 10) { hit = true; break; }
              if (k % 2 === 0 || hit) pts.push([px, py]); if (hit) break;
            }
            lines.push(dir > 0 ? pts : pts.slice().reverse());
          }
        });
      }
      st.c.addEventListener("pointerdown", e => {
        const p = st.pos(e); st.c.setPointerCapture && st.c.setPointerCapture(e.pointerId);
        const near = () => { let b = null, bd = 24; ch.forEach(c => { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; b = c; } }); return b; };
        if (mode === "+" || mode === "-") { const n = near(); if (n) drag = n; else if (ch.length < 14) { ch.push({ x: p.x, y: p.y, q: mode === "+" ? 1 : -1 }); dirty = true; } }
        else if (mode === "m") drag = near();
        else if (mode === "d") { const n = near(); if (n) { ch.splice(ch.indexOf(n), 1); dirty = true; } }
        else if (mode === "p") { probe = p; drag = "probe"; }
      });
      st.c.addEventListener("pointermove", e => { if (!drag) return; const p = st.pos(e); if (drag === "probe") probe = p; else { drag.x = clamp(p.x, 10, W - 10); drag.y = clamp(p.y, 10, H - 10); dirty = true; } });
      const up = () => { drag = null; }; st.c.addEventListener("pointerup", up); st.c.addEventListener("pointercancel", up);
      function step(dt) { phase += dt * 22; }
      function draw() {
        const c = colors(), x = st.ctx; st.fit(); GX.bg(x, W, H, c);
        if (dirty) { trace(); dirty = false; }
        lines.forEach(l => GX.flowLine(x, c.line, l, phase, { w: 1.4, alpha: 0.85 }));
        ch.forEach(q => GX.ball(x, q.x, q.y, 9.5, q.q > 0 ? c.pos : c.neg, q.q > 0 ? "+" : "−", { glow: 10 }));
        if (probe && ch.length) {
          const f = fieldAt(probe.x, probe.y), m = Math.hypot(f[0], f[1]);
          GX.ball(x, probe.x, probe.y, 6, c.warn, null, { glow: 8 });
          if (m > 1e-7) { const len = clamp(Math.log10(m * 2e4) * 22, 8, 70); GX.arrow(x, c.warn, probe.x, probe.y, probe.x + f[0] / m * len, probe.y + f[1] / m * len, 3); }
          GX.pill(x, c, m < 2e-5 ? "E ≈ 0" : "E (relativ): " + de(m * 1e4, 2), 8, H - 14, { align: "left", col: c.warn, size: 10 });
        }
        if (!ch.length) GX.text(x, c.dim, "Tippe hier, um eine Ladung zu setzen", W / 2, H / 2, { size: 13 });
      }
      return { step, draw };
    }
  });
})();
