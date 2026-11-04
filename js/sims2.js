/* Labor, Teil 2: Kondensator, Polarisation und Influenz, Millikan, Feldlinien. */
(function () {
  "use strict";
  const K = window.PHYS_SIMKIT; if (!K) return;
  const { A, el, clamp, rnd, de, colors, stage, slider, seg, button, notes, readouts, L } = K;
  const E0 = 8.854e-12, QE = 1.602e-19, G = 9.81;
  const arrow = (x, x1, y1, x2, y2, head) => {
    x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1), h = head || 6;
    x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)); x.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)); x.closePath(); x.fill();
  };
  // deterministische Zufallszahlen für feste Anordnungen
  const prng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ICON = p => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + p + "</svg>";

  // ============================================================ Kondensator-Labor
  K.add({
    id: "kond", title: "Kondensator-Labor", desc: "Abstand, Fläche und Dielektrikum verändern: C, Q, U, E live", sheet: "kondensator",
    icon: ICON('<path d="M4 9h16M4 15h16M12 3v6M12 15v6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    make(host) {
      const st = stage(360, 250);
      const P = { d: 3, A: 150, er: 1, U: 9, connected: true };
      let Q0 = 0; // feste Ladung im getrennten Zustand
      const C = () => E0 * P.er * (P.A * 1e-4) / (P.d * 1e-3);
      const U = () => P.connected ? P.U : Q0 / C();
      const Q = () => P.connected ? C() * P.U : Q0;
      host.append(st.c);
      seg(host, { label: "Quelle", options: [{ v: true, t: "Angeschlossen (U fest)" }, { v: false, t: "Getrennt (Q fest)" }], value: true, onChange: v => { if (!v) Q0 = C() * P.U; P.connected = v; } });
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      const sU = slider(ctl, { label: "Spannung U (Quelle)", min: 1, max: 12, step: 1, value: P.U, fmt: v => v + " V", onInput: v => { P.U = v; } });
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
      function draw() {
        const c = colors(), x = st.ctx; st.fit();
        const gap = 14 + P.d * 7, len = 40 + Math.sqrt(P.A) * 10, cx = 180, y0 = 135 - gap / 2, y1 = y0 + gap;
        const xl = cx - len / 2, xr = cx + len / 2;
        // Zuleitungen
        x.lineWidth = 2.2; x.strokeStyle = c.fg; x.lineCap = "round";
        if (P.connected) { L(x, [[cx, y0], [cx, 40]]); L(x, [[cx, y1], [cx, 230], [60, 230], [60, 76]]); L(x, [[60, 40], [cx, 40]]); L(x, [[48, 60], [72, 60]]); x.lineWidth = 3.4; L(x, [[52, 76], [68, 76]]); x.lineWidth = 2.2; x.fillStyle = c.fg; x.font = "11px system-ui"; x.textAlign = "left"; x.fillText("+", 76, 58); x.fillText("−", 76, 86); L(x, [[60, 40], [60, 60]]); x.textAlign = "right"; x.fillText(P.U + " V", 40, 72); }
        else { L(x, [[cx, y0], [cx, 70]]); L(x, [[cx, y1], [cx, 200]]); x.setLineDash([3, 4]); x.strokeStyle = c.dim; x.fillStyle = c.dim; x.font = "11px system-ui"; x.textAlign = "left"; x.fillText("von der Quelle getrennt", cx + 8, 60); x.setLineDash([]); }
        // Dielektrikum
        if (P.er > 1) {
          x.fillStyle = "rgba(90,169,255," + (0.08 + 0.05 * P.er) + ")"; x.fillRect(xl, y0 + 2, len, gap - 4);
          const a = clamp(U() / 12, 0, 1) * (1 - 1 / P.er) / (1 - 1 / 6) + 0.0; // Ausrichtung
          x.lineWidth = 1.2;
          const cols = Math.floor(len / 22), rows = Math.max(1, Math.floor((gap - 6) / 16));
          for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
            const px = xl + 12 + i * (len - 24) / Math.max(1, cols - 1), py = y0 + (gap) * (j + 0.5) / rows;
            x.strokeStyle = c.dim; L(x, [[px, py - 3.5], [px, py + 3.5]]);
            x.fillStyle = c.pos; x.beginPath(); x.arc(px, py + 4, 1.6, 0, 7); x.fill();
            x.fillStyle = c.neg; x.beginPath(); x.arc(px, py - 4, 1.6, 0, 7); x.fill();
          }
        }
        // Platten
        x.lineWidth = 4; x.strokeStyle = c.fg; L(x, [[xl, y0], [xr, y0]]); L(x, [[xl, y1], [xr, y1]]); x.lineWidth = 1;
        // Ladungen und Feld
        const E = U() / (P.d * 1e-3), Qmax = E0 * 1 * 0.04 * 12 / 1e-3;
        const nq = Math.round(clamp(Q() / Qmax, 0, 1) * 14), ne = Math.round(clamp(E / 12000, 0, 1) * 12) + (E > 0 ? 1 : 0);
        x.font = "bold 13px system-ui"; x.textAlign = "center";
        for (let i = 0; i < nq; i++) { const px = xl + 8 + i * (len - 16) / Math.max(13, nq - 1); x.fillStyle = c.pos; x.fillText("+", px, y0 - 6); x.fillStyle = c.neg; x.fillText("−", px, y1 + 14); }
        x.strokeStyle = c.line; x.fillStyle = c.line; x.lineWidth = 1.4;
        for (let i = 0; i < ne; i++) { const px = xl + 10 + i * (len - 20) / Math.max(1, ne - 1); arrow(x, px, y0 + 2, px, y1 - 2, 5); }
        // Maße
        x.strokeStyle = c.dim; x.fillStyle = c.dim; x.lineWidth = 1; x.font = "11px system-ui"; x.textAlign = "left";
        L(x, [[xr + 12, y0], [xr + 12, y1]]); x.fillText("d", xr + 18, 138);
        x.textAlign = "center"; L(x, [[xl, y1 + 26], [xr, y1 + 26]]); x.fillText("A", cx, y1 + 40);
        const cc = C(), qq = Q(), uu = U();
        ro({ c: de(cc * 1e12, 3) + " pF", q: de(qq * 1e9, 3) + " nC", u: de(uu, 3) + " V", e: de(E / 1e3, 3) + " kV/m", w: de(0.5 * qq * uu * 1e9, 3) + " nJ" });
      }
      return { draw };
    }
  });

  // ============================================================ Influenz, Polarisation, Faraday
  K.add({
    id: "pol", title: "Influenz & Polarisation", desc: "Animationen: Ladungstrennung, Dipole im Dielektrikum, Faradayscher Käfig", sheet: "influenz",
    icon: ICON('<circle cx="9" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 8v8M20 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    make(host) {
      let tab = "inf";
      const tabs = seg(host, { options: [{ v: "inf", t: "Influenz" }, { v: "pol", t: "Polarisation" }, { v: "far", t: "Faraday-Käfig" }], value: "inf", onChange: v => { tab = v; build(); } });
      const body = el("div", ""); host.append(body);
      let sim = null;
      function build() { body.innerHTML = ""; sim = tab === "inf" ? influenz(body) : tab === "pol" ? polar(body) : faraday(body); }
      build();
      return { step: dt => sim.step && sim.step(dt), draw: () => sim.draw() };

      // ---- Influenz: Metallkugel und negativer Stab
      function influenz(h) {
        const st = stage(360, 250); h.append(st.c);
        const rd = prng(7), N = 28, pts = [];
        for (let i = 0; i < N; i++) { const r = 46 * Math.sqrt((i + 0.5) / N), a = i * 2.39996; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
        void rd;
        let gap = 80, grounded = false, shift = 0, removed = 0;
        const status = el("div", "sim-info"); h.append(status);
        const s = slider(h, { label: "Abstand Stab ↔ Kugel", min: 0, max: 100, step: 1, value: 80, fmt: v => v < 15 ? "sehr nah" : v > 85 ? "weit weg" : v + " %", onInput: v => { gap = v; } });
        const acts = el("div", "sim-acts"); h.append(acts);
        const gb = button(acts, "Erden: aus", () => { grounded = !grounded; gb.textContent = "Erden: " + (grounded ? "an" : "aus"); });
        button(acts, "Neu beginnen", () => { gap = 80; s.set(80); grounded = false; gb.textContent = "Erden: aus"; removed = 0; shift = 0; });
        notes(h, "Aufgaben", ["Führe den negativen Stab an die Kugel heran. Wohin wandern die beweglichen Elektronen?",
          "Erde die Kugel (an), entferne dann die Erdung (aus) und erst danach den Stab. Wie ist die Kugel geladen?",
          "Warum bleibt die Kugel ohne Erdung insgesamt neutral?"]);
        const CX = 235, CY = 125, R = 62;
        function step(dt) {
          const k = clamp(1 - (6 + gap * 1.2) / 135, 0, 1);
          shift += (k * 26 - shift) * Math.min(1, dt * 6);
          if (grounded) { const target = Math.round(k * 8); removed += Math.sign(target - removed) * Math.min(Math.abs(target - removed), dt * 5); }
        }
        function draw() {
          const c = colors(), x = st.ctx; st.fit();
          const k = clamp(1 - (6 + gap * 1.2) / 135, 0, 1), edge = CX - R - (6 + gap * 1.2);
          // Kugel
          x.fillStyle = c.surf2; x.strokeStyle = c.fg; x.lineWidth = 2.4; x.beginPath(); x.arc(CX, CY, R, 0, 7); x.fill(); x.stroke();
          const nRemoved = Math.round(removed);
          const order = pts.map((p, i) => i).sort((a, b) => pts[b][0] - pts[a][0]);
          const gone = new Set(order.slice(0, nRemoved));
          x.font = "bold 12px system-ui"; x.textAlign = "center";
          pts.forEach((p, i) => {
            x.fillStyle = c.pos; x.fillText("+", CX + p[0], CY + p[1] + 4);
            if (gone.has(i)) return;
            let ex = p[0] + shift, ey = p[1]; const d = Math.hypot(ex, ey), lim = R - 9; if (d > lim) { ex *= lim / d; ey *= lim / d; }
            x.fillStyle = c.neg; x.beginPath(); x.arc(CX + ex, CY + ey, 4.4, 0, 7); x.fill();
            x.fillStyle = "#fff"; x.fillRect(CX + ex - 2.2, CY + ey - 0.5, 4.4, 1.1);
          });
          // Stab
          x.fillStyle = c.surf; x.strokeStyle = c.neg; x.lineWidth = 2.4; x.beginPath(); x.rect(edge - 100, CY - 22, 100, 44); x.fill(); x.stroke();
          x.fillStyle = c.neg; x.font = "bold 16px system-ui";
          for (let i = 0; i < 5; i++) x.fillText("−", edge - 90 + i * 20, CY + 6);
          // Erdung
          if (grounded) {
            x.strokeStyle = c.fg; x.lineWidth = 2; L(x, [[CX, CY + R], [CX, 225]]); L(x, [[CX - 14, 225], [CX + 14, 225]]); L(x, [[CX - 9, 232], [CX + 9, 232]]); L(x, [[CX - 4, 239], [CX + 4, 239]]);
            if (Math.abs(removed - Math.round(removed)) > 0.01 || Math.abs(Math.round(k * 8) - removed) > 0.05) { x.fillStyle = c.neg; for (let i = 0; i < 3; i++) { const yy = CY + R + ((performance.now() / 12 + i * 22) % 66); x.beginPath(); x.arc(CX, yy, 3, 0, 7); x.fill(); } }
          }
          const net = Math.round(removed);
          const farAndFree = !grounded && gap > 70;
          status.textContent = net > 0 && farAndFree ? "Die Kugel ist jetzt positiv geladen: " + net + " Elektronen fehlen (Aufladung durch Influenz)."
            : net > 0 && !grounded ? "Elektronen sind abgeflossen. Entferne den Stab, um die Ladung zu verteilen."
            : grounded && k > 0.1 ? "Erdung: Die abgestoßenen Elektronen fließen zur Erde ab."
            : k > 0.15 ? "Influenz: Die beweglichen Elektronen werden vom negativen Stab abgestoßen. Die Kugel ist insgesamt neutral."
            : "Der Stab ist weit weg: Die Ladungen sind gleichmäßig verteilt.";
        }
        return { step, draw };
      }

      // ---- Polarisation: Dipole im Dielektrikum
      function polar(h) {
        const st = stage(360, 250); h.append(st.c);
        let kind = "or", Es = 0, er = 4, t = 0;
        const rd = prng(11), mol = [];
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) mol.push({ x: 108 + i * 28, y: 82 + j * 26, th: rd() * 6.28, ph: rd() * 6.28, w: (rd() - 0.5) * 2 });
        seg(h, { label: "Art", options: [{ v: "or", t: "Orientierung (polar, z. B. Wasser)" }, { v: "ve", t: "Verschiebung (Atome)" }], value: "or", onChange: v => { kind = v; } });
        const ctl = el("div", "sim-ctl"); h.append(ctl);
        slider(ctl, { label: "Feldstärke E₀", min: 0, max: 100, step: 1, value: 0, fmt: v => v + " %", onInput: v => { Es = v / 100; } });
        slider(ctl, { label: "Dielektrikum εᵣ", min: 1.5, max: 6, step: 0.5, value: er, fmt: v => de(v), onInput: v => { er = v; } });
        const info = el("div", "sim-info"); h.append(info);
        notes(h, "Aufgaben", ["Schalte das Feld ein. Was machen die Dipole bzw. Atome?", "Wo entstehen die <b>Polarisationsladungen</b>? Welches Vorzeichen haben sie oben und unten?",
          "Wie ändert sich das Feld im Dielektrikum? Vergleiche $E_0$ und $E_0/\\varepsilon_r$."]);
        const align = () => Es * (1 - 1 / er) / (1 - 1 / 6);
        function step(dt) {
          t += dt; const a = align();
          mol.forEach(m => {
            if (kind === "or") {
              const target = Math.PI / 2; // Pluspol zeigt in Feldrichtung (nach unten)
              let d = ((target - m.th + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
              m.th += d * Math.min(1, dt * 4 * a) + (Math.sin(t * 3 + m.ph) * 1.8 * (1 - 0.85 * a) + m.w * 0.6) * dt * (1 - a * 0.9);
            }
          });
        }
        function draw() {
          const c = colors(), x = st.ctx; st.fit();
          const a = align();
          // Platten
          x.fillStyle = c.fg; x.fillRect(60, 28, 240, 6); x.fillRect(60, 216, 240, 6);
          x.font = "bold 14px system-ui"; x.textAlign = "center"; x.fillStyle = c.pos; for (let i = 0; i < 8; i++) x.fillText("+", 74 + i * 30, 24);
          x.fillStyle = c.neg; for (let i = 0; i < 8; i++) x.fillText("−", 74 + i * 30, 238);
          // Feldpfeile außerhalb des Blocks
          x.strokeStyle = c.line; x.fillStyle = c.line; x.lineWidth = 1.4;
          if (Es > 0) [74, 286].forEach(px => arrow(x, px, 38, px, 38 + 20 + 120 * Es * 0.4 + 14, 6));
          // Block
          x.fillStyle = "rgba(90,169,255,.10)"; x.strokeStyle = c.dim; x.lineWidth = 1.5; x.fillRect(92, 62, 176, 116); x.strokeRect(92, 62, 176, 116);
          // Moleküle
          mol.forEach(m => {
            if (kind === "or") {
              const dx = Math.cos(m.th) * 9, dy = Math.sin(m.th) * 9;
              x.strokeStyle = c.dim; x.lineWidth = 2; L(x, [[m.x - dx, m.y - dy], [m.x + dx, m.y + dy]]);
              x.fillStyle = c.pos; x.beginPath(); x.arc(m.x + dx, m.y + dy, 3.6, 0, 7); x.fill();
              x.fillStyle = c.neg; x.beginPath(); x.arc(m.x - dx, m.y - dy, 3.6, 0, 7); x.fill();
            } else {
              const sh = a * 7;
              x.fillStyle = "rgba(62,123,255,.35)"; x.strokeStyle = c.neg; x.lineWidth = 1; x.beginPath(); x.arc(m.x, m.y - sh, 9.5, 0, 7); x.fill(); x.stroke();
              x.fillStyle = c.pos; x.beginPath(); x.arc(m.x, m.y, 3.2, 0, 7); x.fill();
            }
          });
          // Polarisationsladungen an der Oberfläche
          const n = Math.round(a * 8);
          x.font = "bold 13px system-ui"; x.textAlign = "center";
          for (let i = 0; i < n; i++) { const px = 104 + i * 22; x.fillStyle = c.neg; x.fillText("−", px, 58); x.fillStyle = c.pos; x.fillText("+", px, 196); }
          // Feld im Inneren
          if (Es > 0) { x.strokeStyle = c.line; x.fillStyle = c.line; x.lineWidth = 1.4; const len = 30 + 40 * Es * (1 / (1 + a * (er - 1) * 0.5)); arrow(x, 316, 70, 316, 70 + len, 6); x.font = "11px system-ui"; x.fillStyle = c.dim; x.textAlign = "left"; x.fillText("E", 322, 86); }
          info.textContent = Es === 0 ? "Ohne Feld sind die Dipole ungeordnet bzw. die Atome unverformt."
            : kind === "or" ? "Orientierungspolarisation: Die Dipole richten sich aus. Es entstehen gebundene Oberflächenladungen. E im Inneren: " + de(Es * 100) + " % von E₀ geteilt durch " + de(1 + a * (er - 1)) + "."
            : "Verschiebungspolarisation: Die Elektronenhüllen verschieben sich gegen die Kerne. Es entstehen gebundene Oberflächenladungen. E im Inneren ist kleiner als E₀ (E = E₀/εᵣ).";
        }
        return { step, draw };
      }

      // ---- Faradayscher Käfig
      function faraday(h) {
        const st = stage(360, 250); h.append(st.c);
        let cage = true, E = 0.6, t = 0;
        seg(h, { label: "Käfig", options: [{ v: true, t: "Mit Käfig" }, { v: false, t: "Ohne Käfig" }], value: true, onChange: v => { cage = v; } });
        slider(h, { label: "Feldstärke E", min: 10, max: 100, step: 1, value: 60, fmt: v => v + " %", onInput: v => { E = v / 100; } });
        const info = el("div", "sim-info"); h.append(info);
        notes(h, "Aufgaben", ["Schalte den Käfig ein. Was passiert mit dem Feld im Inneren?", "Wo sitzen die Influenzladungen auf dem Käfig und welches Vorzeichen haben sie?",
          "Warum ist man in einem Auto bei Blitzschlag geschützt?"]);
        const bx0 = 130, bx1 = 230, by0 = 85, by1 = 175;
        function step(dt) { t += dt * (0.4 + 1.6 * E); }
        function draw() {
          const c = colors(), x = st.ctx; st.fit();
          // Platten links (+) und rechts (−)
          x.fillStyle = c.fg; x.fillRect(22, 30, 6, 190); x.fillRect(332, 30, 6, 190);
          x.font = "bold 14px system-ui"; x.textAlign = "center"; x.fillStyle = c.pos; for (let i = 0; i < 6; i++) x.fillText("+", 14, 46 + i * 30);
          x.fillStyle = c.neg; for (let i = 0; i < 6; i++) x.fillText("−", 346, 46 + i * 30);
          // Feldlinien (animierte Pfeilspitzen)
          x.strokeStyle = c.line; x.fillStyle = c.line; x.lineWidth = 1.6;
          const ys = [45, 65, 85, 105, 125, 145, 165, 185, 205];
          ys.forEach(y => {
            const inside = cage && y > by0 && y < by1;
            const segs = inside ? [[30, bx0], [bx1, 330]] : [[30, 330]];
            segs.forEach(sg => {
              L(x, [[sg[0], y], [sg[1], y]]);
              const sp = 40, off = (t * 40) % sp;
              for (let px = sg[0] + off; px < sg[1] - 4; px += sp) { x.beginPath(); x.moveTo(px + 6, y); x.lineTo(px, y - 3.5); x.lineTo(px, y + 3.5); x.fill(); }
            });
          });
          if (cage) {
            x.setLineDash([7, 4]); x.strokeStyle = c.fg; x.lineWidth = 3; x.fillStyle = c.surf2; x.fillRect(bx0, by0, bx1 - bx0, by1 - by0); x.strokeRect(bx0, by0, bx1 - bx0, by1 - by0); x.setLineDash([]);
            const n = Math.round(2 + 6 * E); x.font = "bold 13px system-ui"; x.textAlign = "center";
            for (let i = 0; i < n; i++) { const yy = by0 + 10 + i * (by1 - by0 - 20) / Math.max(1, n - 1); x.fillStyle = c.neg; x.fillText("−", bx0 + 9, yy + 4); x.fillStyle = c.pos; x.fillText("+", bx1 - 9, yy + 4); }
            x.fillStyle = c.fg; x.font = "bold 14px system-ui"; x.fillText("E = 0", (bx0 + bx1) / 2, 133);
          } else {
            x.fillStyle = c.pos; x.beginPath(); x.arc(180, 130, 7, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = "bold 11px system-ui"; x.textAlign = "center"; x.fillText("+", 180, 134);
            x.strokeStyle = c.warn; x.fillStyle = c.warn; x.lineWidth = 2.6; arrow(x, 190, 130, 190 + 50 * E, 130, 8); x.font = "11px system-ui"; x.textAlign = "left"; x.fillText("F = E·Q", 190, 150);
          }
          info.textContent = cage ? "Die Influenzladungen auf dem Käfig erzeugen ein Gegenfeld. Im Inneren heben sich beide Felder auf: E = 0, es wirkt keine Kraft."
            : "Ohne Käfig wirkt auf die Probeladung die Kraft F = E·Q in Feldrichtung.";
        }
        return { step, draw };
      }
    }
  });

  // ============================================================ Millikan
  K.add({
    id: "mill", title: "Millikan-Versuch", desc: "Schwebespannung finden, Ladung berechnen, Messreihe auswerten", sheet: "millikan",
    icon: ICON('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M4 5h16M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    make(host) {
      const st = stage(360, 260); host.append(st.c);
      const d = 5e-3, eta = 1.8e-5, rho = 880, SPEED = 300; // Zeitraffer
      let U = 0, drop, rows = [], y = 0.5;
      function newDrop() {
        const r = (0.75 + Math.random() * 0.25) * 1e-6, n = 1 + Math.floor(Math.random() * 5);
        drop = { r, n, m: 4 / 3 * Math.PI * r ** 3 * rho, q: n * QE };
        y = 0.55; U = 0; sU.set(0);
      }
      const ctl = el("div", "sim-ctl"); host.append(ctl);
      const sU = slider(ctl, { label: "Spannung U", min: 0, max: 1500, step: 1, value: 0, fmt: v => v + " V", onInput: v => { U = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      [[-10, "−10 V"], [-1, "−1 V"], [1, "+1 V"], [10, "+10 V"]].forEach(([dv, t]) => button(acts, t, () => { U = clamp(U + dv, 0, 1500); sU.set(U); }));
      const acts2 = el("div", "sim-acts"); host.append(acts2);
      button(acts2, "Neues Tröpfchen", () => newDrop());
      button(acts2, "Schwebespannung notieren", () => record(), "primary");
      const info = el("div", "sim-info"); host.append(info);
      const ro = readouts(host, [["m", "Masse m (bekannt)"], ["fel", "elektrische Kraft"], ["fg", "Gewichtskraft"], ["v", "Geschwindigkeit"]]);
      const tbl = el("div", "sim-table"); host.append(tbl);
      notes(host, "Aufgaben", ["Stelle die Spannung so ein, dass das Tröpfchen <b>schwebt</b>. Nutze die Feinstufen.",
        "Berechne $q = \\dfrac{m\\,g\\,d}{U}$ und vergleiche mit $e = 1{,}602\\cdot10^{-19}\\,\\mathrm{C}$. Wie viele Elementarladungen sind es?",
        "Notiere mehrere Tröpfchen. Welche gemeinsame Einheit haben alle Ladungen? Bilde den Mittelwert für $e$."]);
      const net = () => drop.q * U / d - drop.m * G;
      function record() {
        const fg = drop.m * G;
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
        const v = net() / (6 * Math.PI * eta * drop.r); // m/s (positiv: nach oben)
        drop.v = v;
        y += v * dt * SPEED / d;
        if (y > 0.97 || y < 0.03) y = 0.55;
      }
      function draw() {
        const c = colors(), x = st.ctx; st.fit();
        const top = 34, bot = 226, yy = bot - y * (bot - top);
        x.fillStyle = c.fg; x.fillRect(60, top - 8, 240, 6); x.fillRect(60, bot + 2, 240, 6);
        x.font = "bold 14px system-ui"; x.textAlign = "left"; x.fillStyle = c.pos; x.fillText("+", 308, top - 2); x.fillStyle = c.neg; x.fillText("−", 308, bot + 10);
        // Feldlinien schwach
        x.strokeStyle = c.line; x.fillStyle = c.line; x.globalAlpha = 0.35; x.lineWidth = 1.2;
        if (U > 0) for (let i = 0; i < 6; i++) arrow(x, 80 + i * 40, top, 80 + i * 40, bot, 5);
        x.globalAlpha = 1;
        // Tröpfchen
        const floating = U > 0 && Math.abs(net()) < 0.02 * drop.m * G;
        const rr = 7 + (drop.r / 1e-6 - 0.75) * 16;
        if (floating) { x.fillStyle = "rgba(63,181,122,.25)"; x.beginPath(); x.arc(180, yy, rr + 8, 0, 7); x.fill(); }
        x.fillStyle = c.warn; x.beginPath(); x.arc(180, yy, rr, 0, 7); x.fill();
        x.fillStyle = "#1a1300"; x.font = "bold 11px system-ui"; x.textAlign = "center"; x.fillText("−", 180, yy + 4);
        // Kräfte
        const fel = drop.q * U / d, fg = drop.m * G, sc = 46 / fg;
        x.lineWidth = 2.6;
        x.strokeStyle = c.ok; x.fillStyle = c.ok; if (fel > 0) arrow(x, 214, yy, 214, yy - Math.min(90, fel * sc), 7);
        x.strokeStyle = c.bad; x.fillStyle = c.bad; arrow(x, 238, yy, 238, yy + 46, 7);
        x.font = "11px system-ui"; x.textAlign = "left"; x.fillStyle = c.ok; x.fillText("F_el", 196, top + 14); x.fillStyle = c.bad; x.fillText("F_G", 244, yy + 30);
        // Abstand
        x.strokeStyle = c.dim; x.fillStyle = c.dim; x.lineWidth = 1; L(x, [[50, top], [50, bot]]); x.save(); x.translate(40, (top + bot) / 2); x.rotate(-Math.PI / 2); x.textAlign = "center"; x.font = "11px system-ui"; x.fillText("d = 5 mm", 0, 0); x.restore();
        ro({ m: de(drop.m * 1e15, 3) + " · 10⁻¹⁵ kg", fel: de(fel * 1e15, 3) + " · 10⁻¹⁵ N", fg: de(fg * 1e15, 3) + " · 10⁻¹⁵ N", v: de((drop.v || 0) * 1e3, 2) + " mm/s" });
        info.textContent = floating ? "Das Tröpfchen schwebt: F_el = F_G. Jetzt Spannung ablesen und q berechnen." : net() > 0 ? "Die elektrische Kraft überwiegt: Das Tröpfchen steigt." : "Die Gewichtskraft überwiegt: Das Tröpfchen sinkt.";
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
      let ch = [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: -1 }], mode = "+", probe = null, drag = null, dirty = true, lines = [], showProbe = true;
      seg(host, { label: "Modus", options: [{ v: "+", t: "+ setzen" }, { v: "-", t: "− setzen" }, { v: "m", t: "Verschieben" }, { v: "d", t: "Löschen" }, { v: "p", t: "Probeladung" }], value: "+", onChange: v => { mode = v; } });
      const acts = el("div", "sim-acts"); host.append(acts);
      const pre = {
        "Dipol": () => [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: -1 }],
        "Gleichnamig": () => [{ x: 110, y: 145, q: 1 }, { x: 250, y: 145, q: 1 }],
        "Platten": () => { const a = []; for (let i = 0; i < 6; i++) { a.push({ x: 90 + i * 36, y: 60, q: 1 }); } for (let i = 0; i < 6; i++) { a.push({ x: 90 + i * 36, y: 230, q: -1 }); } return a; },
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
            const a = (i + 0.5) / n * 6.2832; let px = s.x + 9 * Math.cos(a), py = s.y + 9 * Math.sin(a); const pts = [[px, py]];
            for (let k = 0; k < 800; k++) {
              const f = fieldAt(px, py), m = Math.hypot(f[0], f[1]) || 1; px += dir * f[0] / m * 3; py += dir * f[1] / m * 3;
              if (px < 2 || px > W - 2 || py < 2 || py > H - 2) { pts.push([px, py]); break; }
              let hit = false; for (const c of ch) if (Math.sign(c.q) !== Math.sign(s.q) && Math.hypot(px - c.x, py - c.y) < 9) { hit = true; break; }
              pts.push([px, py]); if (hit) break;
            }
            lines.push({ pts, dir });
          }
        });
      }
      function pt(e) { return st.pos(e); }
      st.c.addEventListener("pointerdown", e => {
        const p = pt(e); st.c.setPointerCapture && st.c.setPointerCapture(e.pointerId);
        const near = () => { let b = null, bd = 22; ch.forEach(c => { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; b = c; } }); return b; };
        if (mode === "+" || mode === "-") { if (near()) { drag = near(); } else if (ch.length < 12) { ch.push({ x: p.x, y: p.y, q: mode === "+" ? 1 : -1 }); dirty = true; } }
        else if (mode === "m") drag = near();
        else if (mode === "d") { const n = near(); if (n) { ch.splice(ch.indexOf(n), 1); dirty = true; } }
        else if (mode === "p") { probe = p; drag = "probe"; }
      });
      st.c.addEventListener("pointermove", e => { if (!drag) return; const p = pt(e); if (drag === "probe") probe = p; else { drag.x = clamp(p.x, 8, W - 8); drag.y = clamp(p.y, 8, H - 8); dirty = true; } });
      const up = () => { drag = null; };
      st.c.addEventListener("pointerup", up); st.c.addEventListener("pointercancel", up);
      function draw() {
        const c = colors(), x = st.ctx; st.fit();
        if (dirty) { trace(); dirty = false; }
        x.lineWidth = 1.4;
        lines.forEach(l => {
          x.strokeStyle = c.line; x.beginPath(); l.pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
          const mi = Math.floor(l.pts.length * 0.5);
          if (mi > 1 && mi < l.pts.length - 1) {
            const p = l.pts[mi], q = l.pts[mi + 1]; let a = Math.atan2(q[1] - p[1], q[0] - p[0]); if (l.dir < 0) a += Math.PI;
            x.fillStyle = c.line; x.beginPath(); x.moveTo(p[0] + Math.cos(a) * 6, p[1] + Math.sin(a) * 6); x.lineTo(p[0] + Math.cos(a + 2.6) * 6, p[1] + Math.sin(a + 2.6) * 6); x.lineTo(p[0] + Math.cos(a - 2.6) * 6, p[1] + Math.sin(a - 2.6) * 6); x.fill();
          }
        });
        ch.forEach(q => { x.fillStyle = q.q > 0 ? c.pos : c.neg; x.beginPath(); x.arc(q.x, q.y, 9, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = "bold 14px system-ui"; x.textAlign = "center"; x.fillText(q.q > 0 ? "+" : "−", q.x, q.y + 5); });
        if (probe && ch.length) {
          const f = fieldAt(probe.x, probe.y), m = Math.hypot(f[0], f[1]);
          x.fillStyle = c.warn; x.beginPath(); x.arc(probe.x, probe.y, 6, 0, 7); x.fill();
          if (m > 1e-7) { const len = clamp(Math.log10(m * 2e4) * 22, 6, 70); x.strokeStyle = c.warn; x.lineWidth = 2.8; arrow(x, probe.x, probe.y, probe.x + f[0] / m * len, probe.y + f[1] / m * len, 8); }
          x.font = "11px system-ui"; x.fillStyle = c.warn; x.textAlign = "left"; x.fillText(m < 2e-5 ? "E ≈ 0" : "E (relativ): " + de(m * 1e4, 2), 8, H - 8);
        }
        if (!ch.length) { x.fillStyle = c.dim; x.font = "13px system-ui"; x.textAlign = "center"; x.fillText("Tippe hier, um eine Ladung zu setzen", W / 2, H / 2); }
      }
      return { draw };
    }
  });
})();
