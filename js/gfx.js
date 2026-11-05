/* Grafik-Werkzeug für die Simulationen: einheitlicher Look (Laborpapier, Bauteile, glänzende Ladungen,
   metallische Platten, fließende Feldlinien) und kleine Helfer für weiche Animationen. */
(function () {
  "use strict";
  const TAU = Math.PI * 2;

  // Hex-Farbe aufhellen/abdunkeln (amt -1 … 1)
  function shade(hex, amt) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
    if (!m) return hex;
    const f = v => { v = parseInt(v, 16); v = amt >= 0 ? v + (255 - v) * amt : v * (1 + amt); return Math.round(Math.max(0, Math.min(255, v))); };
    return "rgb(" + f(m[1]) + "," + f(m[2]) + "," + f(m[3]) + ")";
  }
  function alpha(hex, a) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
    if (!m) return hex;
    return "rgba(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + "," + a + ")";
  }
  // weiches Annähern an einen Zielwert, unabhängig von der Bildrate
  const ease = (cur, target, dt, speed) => cur + (target - cur) * (1 - Math.exp(-dt * (speed || 8)));
  const isDark = c => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c.surf || ""); if (!m) return true; return (parseInt(m[1], 16) + parseInt(m[2], 16) + parseInt(m[3], 16)) < 380; };

  function rr(x, x0, y0, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
    x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath();
  }
  function poly(x, pts) { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); }

  // Vorgezeichnete Bilder (Sprites) für häufig gezeichnete Kugeln: spart Farbverläufe in jedem Bild
  const sprites = new Map();
  function sprite(key, size, scale, paint) {
    const k = key + "|" + scale.toFixed(2);
    let sp = sprites.get(k);
    if (!sp) {
      if (sprites.size > 400) sprites.clear();
      const cv = document.createElement("canvas"), px = Math.ceil(size * 2 * scale) + 2;
      cv.width = cv.height = px;
      const cx = cv.getContext("2d"); cx.setTransform(scale, 0, 0, scale, px / 2, px / 2);
      paint(cx);
      sp = { cv, px }; sprites.set(k, sp);
    }
    return sp;
  }
  function drawSprite(x, sp, px, py, a) {
    const sc = x.getTransform().a || 1;
    const prev = x.globalAlpha; if (a != null) x.globalAlpha = prev * a;
    x.drawImage(sp.cv, px - sp.px / 2 / sc, py - sp.px / 2 / sc, sp.px / sc, sp.px / sc);
    x.globalAlpha = prev;
  }

  // ---- Darstellung der Elektronen: Punkt, Männchen mit Armen oder Biene mit Eimer (Energie-Modell) ----
  // Eigene Zeichnung. Energie 0 … 1: wenig = müde / Eimer leer, viel = fröhlich, Arme hoch / Eimer voll.
  // Der Bienen-Eimer besitzt 12 Flüssigkeitsstufen (unabhängig von den 5 Gesichtsstufen).
  const STYLE_KEY = "physikq1-teilchen";
  let style = "punkt";
  try { const v = localStorage.getItem(STYLE_KEY); if (v === "mann" || v === "biene" || v === "punkt") style = v; } catch (e) { /* ignorieren */ }
  const LV = ["#9fb0cf", "#c8c58f", "#ffd45a", "#ffa63a", "#ff6f2b"], INK = "#3a2c1c";
  const energy = en => Math.max(0, Math.min(1, Number.isFinite(en) ? en : 0.5));
  const level = en => Math.round(energy(en) * 4);
  const BUCKET_STEPS = 12;
  const bucketLevel = en => Math.round(energy(en) * BUCKET_STEPS) / BUCKET_STEPS;
  function paintFigure(cx, kind, lv, S, flip, fill) {
    const u = S / 8;
    cx.save(); cx.scale(u * (flip ? -1 : 1), u); cx.lineCap = "round"; cx.lineJoin = "round"; cx.strokeStyle = INK; cx.fillStyle = LV[lv];
    if (kind === "mann") {
      const hands = [[4.6, 6.2], [5.4, 4.6], [6.2, 2], [5.9, -0.8], [4.8, -3.4]][lv];
      cx.lineWidth = 1.5; cx.strokeStyle = LV[lv];
      cx.beginPath(); cx.moveTo(0, 1.6); cx.lineTo(0, 5.6); cx.moveTo(0, 5.6); cx.lineTo(-2, 8); cx.moveTo(0, 5.6); cx.lineTo(2, 8);
      cx.moveTo(0, 2); cx.lineTo(-hands[0], hands[1]); cx.moveTo(0, 2); cx.lineTo(hands[0], hands[1]); cx.stroke();
      cx.lineWidth = 0.8; cx.strokeStyle = INK;
      [-1, 1].forEach(sg => { cx.beginPath(); cx.arc(sg * hands[0], hands[1], 1.15, 0, TAU); cx.fill(); cx.stroke(); });
      cx.beginPath(); cx.arc(0, -3, 3.7, 0, TAU); cx.fill(); cx.stroke();
      cx.lineWidth = 0.9; cx.beginPath();
      if (lv <= 1) { cx.moveTo(-2.2, -3.7); cx.lineTo(-0.6, -3.7); cx.moveTo(0.6, -3.7); cx.lineTo(2.2, -3.7); } // müde Augen
      else { cx.moveTo(-1.3, -3.8); cx.lineTo(-1.3, -3.6); cx.moveTo(1.3, -3.8); cx.lineTo(1.3, -3.6); }
      cx.stroke(); cx.beginPath();
      if (lv === 0) cx.arc(0, -0.9, 1.3, Math.PI * 1.15, Math.PI * 1.85); else if (lv === 1) { cx.moveTo(-1.1, -1.7); cx.lineTo(1.1, -1.7); } else cx.arc(0, -2.4, 1.6, Math.PI * 0.15, Math.PI * 0.85);
      cx.stroke();
      if (lv === 4) { cx.strokeStyle = LV[4]; cx.lineWidth = 0.9; cx.beginPath(); cx.moveTo(-4.8, -6.4); cx.lineTo(-5.8, -7.4); cx.moveTo(4.8, -6.4); cx.lineTo(5.8, -7.4); cx.moveTo(0, -7.2); cx.lineTo(0, -8); cx.stroke(); }
    } else {
      // Biene: Flügel, gestreifter Körper, Kopf, Arm mit Eimer
      cx.fillStyle = "rgba(255,255,255,.8)"; cx.strokeStyle = "rgba(90,110,150,.8)"; cx.lineWidth = 0.7;
      [[-1.6, -3.4, -0.4], [1.2, -3.8, 0.4]].forEach(w => { cx.beginPath(); cx.ellipse(w[0], w[1], 1.8, 3, w[2], 0, TAU); cx.fill(); cx.stroke(); });
      cx.fillStyle = "#ffd23a"; cx.strokeStyle = INK; cx.lineWidth = 0.9;
      cx.beginPath(); cx.ellipse(0, 1, 4.6, 3.3, 0, 0, TAU); cx.fill(); cx.stroke();
      cx.save(); cx.beginPath(); cx.ellipse(0, 1, 4.6, 3.3, 0, 0, TAU); cx.clip(); cx.fillStyle = INK; cx.fillRect(-0.7, -3, 1.5, 8); cx.fillRect(2.3, -3, 1.5, 8); cx.restore();
      cx.fillStyle = "#ffc21a"; cx.beginPath(); cx.arc(-4.8, 0.4, 2.2, 0, TAU); cx.fill(); cx.stroke();
      cx.fillStyle = INK; cx.beginPath(); cx.arc(-5.5, 0, 0.5, 0, TAU); cx.fill();
      cx.lineWidth = 0.7; cx.beginPath(); cx.moveTo(-5.4, -1.6); cx.lineTo(-6.6, -3); cx.stroke();
      cx.lineWidth = 0.7; cx.beginPath();
      if (lv <= 1) cx.arc(-5, 1.7, 0.9, Math.PI * 1.1, Math.PI * 1.9); else cx.arc(-5, 0.7, 1, Math.PI * 0.15, Math.PI * 0.85);
      cx.stroke();
      cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(2.2, 2.6); cx.lineTo(5.2, 3.2); cx.stroke(); // Arm
      // großer Eimer: Füllstand = Energie pro Elektron (Spannung in V), Skalenstriche zeigen die Stufen
      const top = 1.6, bot = 10.6, xl = 4.6, xr = 12.2, inset = 1.1;
      // Dunkler leerer Eimer + türkisfarbene Flüssigkeit: auch bei 10 px
      // sichtbar und deutlich vom gelben Bienenkörper unterscheidbar.
      cx.fillStyle = "#17334a"; cx.strokeStyle = "#ecfaff"; cx.lineWidth = 1.35;
      cx.beginPath(); cx.moveTo(xl, top); cx.lineTo(xr, top); cx.lineTo(xr - inset, bot); cx.lineTo(xl + inset, bot); cx.closePath(); cx.fill();
      if (fill > 0) {
        const h = fill * (bot - top - 0.8), y = bot - h, f = (yy, side) => side < 0 ? xl + inset * (yy - top) / (bot - top) : xr - inset * (yy - top) / (bot - top);
        cx.fillStyle = "#17dfbc"; cx.beginPath(); cx.moveTo(f(y, -1), y); cx.lineTo(f(y, 1), y); cx.lineTo(xr - inset, bot); cx.lineTo(xl + inset, bot); cx.closePath(); cx.fill();
        cx.fillStyle = "#eefff8"; cx.fillRect(f(y, -1) + 0.5, y, (f(y, 1) - f(y, -1)) - 1, 0.9);
      }
      cx.strokeStyle = "#edfcff"; cx.lineWidth = 1.2;
      cx.beginPath(); cx.moveTo(xl, top); cx.lineTo(xr, top); cx.lineTo(xr - inset, bot); cx.lineTo(xl + inset, bot); cx.closePath(); cx.stroke();
      cx.lineWidth = 0.7; cx.beginPath(); for (let i = 1; i < 4; i++) { const yy = bot - i * (bot - top - 0.8) / 4; cx.moveTo(xl + 0.2 + inset * (yy - top) / (bot - top), yy); cx.lineTo(xl + 1.8 + inset * (yy - top) / (bot - top), yy); } cx.stroke();
      cx.lineWidth = 0.9; cx.beginPath(); cx.arc((xl + xr) / 2, top, (xr - xl) / 2 - 0.6, Math.PI, 0); cx.stroke(); // Henkel
      cx.stroke();
    }
    cx.restore();
  }
  function figure(x, kind, px, py, S, en, flip, a) {
    const sc = x.getTransform().a || 1, lv = level(en), sz = Math.round(S * 2) / 2;
    const fill = kind === "biene" ? bucketLevel(en) : 0;
    const sp = sprite("f" + kind + lv + "b" + Math.round(fill * BUCKET_STEPS) + "|" + sz + (flip ? "f" : ""), sz * (kind === "biene" ? 1.9 : 1.4), sc, cx => paintFigure(cx, kind, lv, sz, flip, fill));
    drawSprite(x, sp, px, py, a == null ? 1 : a);
  }
  const bgCache = new Map();

  const G = {
    shade, alpha, ease, rr, isDark, TAU,
    // Hintergrund wie Millimeterpapier
    bg(x, w, h, c, grid) {
      G._dark = isDark(c);
      const sc = x.getTransform().a || 1, key = [w, h, c.surf, c.surf2, c.border, grid !== false, sc.toFixed(2)].join("|");
      let cv = bgCache.get(key);
      if (!cv) {
        if (bgCache.size > 20) bgCache.clear();
        cv = document.createElement("canvas"); cv.width = Math.round(w * sc); cv.height = Math.round(h * sc);
        const bx = cv.getContext("2d"); bx.setTransform(sc, 0, 0, sc, 0, 0);
        G._bgPaint(bx, w, h, c, grid);
        bgCache.set(key, cv);
      }
      x.drawImage(cv, 0, 0, w, h);
    },
    _bgPaint(x, w, h, c, grid) {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, c.surf); g.addColorStop(1, c.surf2);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (grid === false) return;
      x.lineWidth = 1; x.strokeStyle = alpha(c.border.startsWith("#") ? c.border : "#808080", isDark(c) ? 0.45 : 0.6);
      x.beginPath();
      for (let i = 20; i < w; i += 20) { x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, h); }
      for (let j = 20; j < h; j += 20) { x.moveTo(0, j + 0.5); x.lineTo(w, j + 0.5); }
      x.stroke();
    },
    wire(x, c, pts, w, col) {
      x.save(); x.lineCap = "round"; x.lineJoin = "round";
      x.strokeStyle = col || c.fg; x.lineWidth = w || 2.4; poly(x, pts); x.stroke(); x.restore();
    },
    node(x, c, p, r) { x.fillStyle = c.fg; x.beginPath(); x.arc(p[0], p[1], r || 3.2, 0, TAU); x.fill(); },
    terminal(x, c, p) { x.fillStyle = c.surf; x.strokeStyle = c.fg; x.lineWidth = 2; x.beginPath(); x.arc(p[0], p[1], 3.6, 0, TAU); x.fill(); x.stroke(); },
    // Widerstand (Kasten nach DIN)
    resistor(x, c, x0, x1, y, label, vertical) {
      const w = x1 - x0, h = 20;
      x.save();
      const g = vertical ? x.createLinearGradient(y - h / 2, 0, y + h / 2, 0) : x.createLinearGradient(0, y - h / 2, 0, y + h / 2);
      g.addColorStop(0, shade(c.surf2, isDark(c) ? 0.08 : -0.02)); g.addColorStop(1, shade(c.surf2, isDark(c) ? -0.12 : -0.08));
      x.fillStyle = g; x.strokeStyle = c.fg; x.lineWidth = 2;
      rr(x, x0, y - h / 2, w, h, 4); x.fill(); x.stroke();
      if (label) { x.fillStyle = c.fg; x.font = "600 11px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, x0 + w / 2, y + 0.5); }
      x.restore();
    },
    // Batterie senkrecht: langer Strich (+) oben, kurzer (−) unten
    battery(x, c, bx, yTop, yBot, label) {
      x.save(); x.lineCap = "round";
      x.strokeStyle = c.fg; x.lineWidth = 3.4; poly(x, [[bx - 15, yTop], [bx + 15, yTop]]); x.stroke();
      x.lineWidth = 5; poly(x, [[bx - 8, yBot], [bx + 8, yBot]]); x.stroke();
      G.badge(x, c, "+", bx + 24, yTop - 1, c.pos); G.badge(x, c, "−", bx + 24, yBot + 1, c.neg);
      if (label) { x.fillStyle = c.fg; x.font = "700 12px system-ui, sans-serif"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText(label, bx + 36, (yTop + yBot) / 2); }
      x.restore();
    },
    badge(x, c, t, px, py, col) {
      x.save(); x.fillStyle = alpha(col, 0.18); x.strokeStyle = col; x.lineWidth = 1.2;
      x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = col; x.font = "800 11px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(t, px, py + 0.5);
      x.restore();
    },
    // Metallplatte (waagerecht oder senkrecht)
    plate(x, c, x0, y0, x1, y1, glow) {
      x.save();
      const vertical = Math.abs(x1 - x0) < Math.abs(y1 - y0);
      const t = 6;
      const g = vertical ? x.createLinearGradient(x0 - t / 2, 0, x0 + t / 2, 0) : x.createLinearGradient(0, y0 - t / 2, 0, y0 + t / 2);
      const base = isDark(c) ? "#9aa6b8" : "#7d8798";
      g.addColorStop(0, shade(base, 0.45)); g.addColorStop(0.5, base); g.addColorStop(1, shade(base, -0.35));
      if (glow) { // weicher Schein ohne teures shadowBlur
        x.fillStyle = glow;
        for (let k = 3; k >= 1; k--) { x.globalAlpha = 0.18 * (4 - k); if (vertical) rr(x, x0 - t / 2 - k * 2, Math.min(y0, y1) - k, t + k * 4, Math.abs(y1 - y0) + k * 2, 4); else rr(x, Math.min(x0, x1) - k, y0 - t / 2 - k * 2, Math.abs(x1 - x0) + k * 2, t + k * 4, 4); x.fill(); }
        x.globalAlpha = 1;
      }
      x.fillStyle = g;
      if (vertical) rr(x, x0 - t / 2, Math.min(y0, y1), t, Math.abs(y1 - y0), 2); else rr(x, Math.min(x0, x1), y0 - t / 2, Math.abs(x1 - x0), t, 2);
      x.fill(); x.restore();
    },
    // glänzende Kugel (Ladung, Ion, Tröpfchen)
    // negative Ladung = Elektron(en) auf Platte, Kugel oder Käfig; folgt der gewählten Darstellung
    minus(x, c, px, py, r, opts) {
      opts = opts || {};
      if (style === "punkt") { G.ball(x, px, py, r, c.neg, "−", opts); return; }
      if (!isFinite(px) || !isFinite(py)) return;
      figure(x, style, px, py, Math.max(style === "biene" ? 9 : 7, r * 2.4), opts.energy, opts.flip, opts.alpha);
    },
    ball(x, px, py, r, col, sign, opts) {
      if (!isFinite(px) || !isFinite(py)) return;
      opts = opts || {};
      if (!opts.glow) {
        const sc = x.getTransform().a || 1;
        const sp = sprite("b" + col + r + (sign || ""), r + 1, sc, cx => G._ballPaint(cx, 0, 0, r, col, sign));
        drawSprite(x, sp, px, py, opts.alpha == null ? 1 : opts.alpha);
        return;
      }
      x.save();
      if (opts.glow) { x.shadowColor = alpha(col, 0.8); x.shadowBlur = opts.glow; }
      const g = x.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.15, px, py, r);
      g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, -0.35));
      x.fillStyle = g; x.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
      x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
      x.shadowBlur = 0;
      if (sign) {
        x.strokeStyle = "#fff"; x.lineWidth = Math.max(1.4, r * 0.22); x.lineCap = "round";
        const s = r * 0.48;
        x.beginPath(); x.moveTo(px - s, py); x.lineTo(px + s, py);
        if (sign === "+") { x.moveTo(px, py - s); x.lineTo(px, py + s); }
        x.stroke();
      }
      x.restore();
    },
    // Darstellung der Elektronen (Punkt, Männchen, Biene), gilt in allen Versuchen
    get style() { return style; },
    setStyle(v) { if (v !== "punkt" && v !== "mann" && v !== "biene") return; style = v; try { localStorage.setItem(STYLE_KEY, v); } catch (e) { /* ignorieren */ } },
    // Elektron in der Leitung; en = Energie 0 … 1, flip = schaut nach links
    electron(x, c, px, py, a, en, flip) {
      if (!isFinite(px) || !isFinite(py)) return;
      if (style !== "punkt") { figure(x, style, px, py, style === "biene" ? 11.2 : 9, en, flip, a); return; }
      const sc = x.getTransform().a || 1;
      const sp = sprite("e" + c.neg, 7, sc, cx => G._elPaint(cx, c, 0, 0));
      drawSprite(x, sp, px, py, a == null ? 1 : a);
    },
    _elPaint(x, c, px, py) {
      x.save();
      const g = x.createRadialGradient(px, py, 0, px, py, 6);
      g.addColorStop(0, alpha(c.neg, 0.9)); g.addColorStop(0.45, alpha(c.neg, 0.55)); g.addColorStop(1, alpha(c.neg, 0));
      x.fillStyle = g; x.beginPath(); x.arc(px, py, 6, 0, TAU); x.fill();
      x.fillStyle = "#dbe6ff"; x.beginPath(); x.arc(px, py, 1.6, 0, TAU); x.fill();
      x.restore();
    },
    _ballPaint(x, px, py, r, col, sign) {
      const g = x.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.15, px, py, r);
      g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, -0.35));
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
      if (sign) {
        x.strokeStyle = "#fff"; x.lineWidth = Math.max(1.4, r * 0.22); x.lineCap = "round";
        const s = r * 0.48;
        x.beginPath(); x.moveTo(px - s, py); x.lineTo(px + s, py);
        if (sign === "+") { x.moveTo(px, py - s); x.lineTo(px, py + s); }
        x.stroke();
      }
    },
    glow(x, px, py, r, col, a) {
      if (!isFinite(px) || !isFinite(py) || !(r > 0)) return;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, alpha(col, a == null ? 0.45 : a)); g.addColorStop(1, alpha(col, 0));
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    },
    arrow(x, col, x1, y1, x2, y2, w, head) {
      const len = Math.hypot(x2 - x1, y2 - y1); if (len < 1) return;
      const a = Math.atan2(y2 - y1, x2 - x1), h = head || Math.max(7, (w || 2) * 3.2);
      x.save(); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = w || 2; x.lineCap = "round";
      const ex = x2 - Math.cos(a) * h * 0.7, ey = y2 - Math.sin(a) * h * 0.7;
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(ex, ey); x.stroke();
      x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)); x.lineTo(x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)); x.closePath(); x.fill();
      x.restore();
    },
    // beschriftetes Etikett mit Hintergrund
    pill(x, c, text, px, py, o) {
      o = o || {};
      x.save();
      x.font = (o.bold === false ? "500 " : "700 ") + (o.size || 11) + "px system-ui, sans-serif";
      const w = x.measureText(text).width + 12, h = (o.size || 11) + 8;
      let left = o.align === "left" ? px : o.align === "right" ? px - w : px - w / 2;
      if (o.clampW) left = Math.max(2, Math.min(o.clampW - w - 2, left));
      x.fillStyle = o.bg || alpha(c.surf.startsWith("#") ? c.surf : "#ffffff", 0.92);
      x.strokeStyle = o.col || c.border; x.lineWidth = 1.2;
      rr(x, left, py - h / 2, w, h, h / 2); x.fill(); x.stroke();
      x.fillStyle = o.col || c.fg; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(text, left + w / 2, py + 0.5);
      x.restore();
      return w;
    },
    text(x, col, t, px, py, o) {
      o = o || {};
      x.save(); x.fillStyle = col; x.font = (o.weight || 500) + " " + (o.size || 11) + "px system-ui, sans-serif";
      x.textAlign = o.align || "center"; x.textBaseline = o.base || "middle"; x.fillText(t, px, py); x.restore();
    },
    // Feldlinie mit fließender Strichelung und Pfeilspitze (zeigt die Richtung)
    flowLine(x, col, pts, phase, o) {
      o = o || {};
      if (pts.length < 2) return;
      x.save(); x.strokeStyle = col; x.lineWidth = o.w || 1.5; x.lineCap = "round"; x.lineJoin = "round";
      x.globalAlpha = o.alpha == null ? 0.9 : o.alpha;
      poly(x, pts); x.stroke();
      if (o.flow !== false) {
        x.setLineDash([2, 12]); x.lineDashOffset = -phase; x.lineWidth = (o.w || 1.5) + 1.8; x.globalAlpha = 0.85;
        x.strokeStyle = o.dot || (G._dark === false ? shade(col, -0.45) : "#ffffff");
        poly(x, pts); x.stroke(); x.setLineDash([]);
      }
      x.restore();
      if (o.head !== false) {
        let i = Math.floor(pts.length * (o.at || 0.5)); i = Math.max(1, Math.min(pts.length - 1, i));
        const p = pts[i - 1], q = pts[i];
        const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
        x.save(); x.fillStyle = col; x.beginPath();
        x.moveTo(q[0] + Math.cos(a) * 6, q[1] + Math.sin(a) * 6);
        x.lineTo(q[0] + Math.cos(a + 2.5) * 6, q[1] + Math.sin(a + 2.5) * 6);
        x.lineTo(q[0] + Math.cos(a - 2.5) * 6, q[1] + Math.sin(a - 2.5) * 6);
        x.closePath(); x.fill(); x.restore();
      }
    },
    // Erdungszeichen
    ground(x, c, px, py) {
      x.save(); x.strokeStyle = c.fg; x.lineWidth = 2.2; x.lineCap = "round";
      [[14, 0], [9, 6], [4, 12]].forEach(([w, dy]) => { x.beginPath(); x.moveTo(px - w, py + dy); x.lineTo(px + w, py + dy); x.stroke(); });
      x.restore();
    },
    // Abstandspfeil mit Beschriftung
    dim(x, c, x1, y1, x2, y2, label) {
      x.save(); x.strokeStyle = c.dim; x.fillStyle = c.dim; x.lineWidth = 1;
      poly(x, [[x1, y1], [x2, y2]]); x.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1);
      [[x1, y1, a + Math.PI], [x2, y2, a]].forEach(([px, py, aa]) => { x.beginPath(); x.moveTo(px, py); x.lineTo(px - 5 * Math.cos(aa - 0.5), py - 5 * Math.sin(aa - 0.5)); x.lineTo(px - 5 * Math.cos(aa + 0.5), py - 5 * Math.sin(aa + 0.5)); x.closePath(); x.fill(); });
      x.restore();
      if (label) G.pill(x, c, label, (x1 + x2) / 2, (y1 + y2) / 2, { size: 10, col: c.dim });
    },
    poly
  };
  window.PHYS_GFX = G;
})();
