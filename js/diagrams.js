/* Diagramme als Inline-SVG. Farben kommen über CSS-Variablen (Dark/Light-fähig). */
(function () {
  const W = 320, H = 220;

  function svg(inner, w, h, label) {
    return '<svg class="dia" viewBox="0 0 ' + (w || W) + " " + (h || H) + '" role="img" aria-label="' + (label || "Diagramm") + '">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" class="d-fill-line"/></marker></defs>' + inner + "</svg>";
  }

  function chargeSym(c) {
    const pos = c.q > 0;
    return '<circle cx="' + c.x + '" cy="' + c.y + '" r="9" class="' + (pos ? "d-pos" : "d-neg") + '"/>' +
      '<text x="' + c.x + '" y="' + (c.y + 4.5) + '" text-anchor="middle" class="d-sign">' + (pos ? "+" : "−") + "</text>";
  }

  // Feldlinien numerisch verfolgen
  function fieldAt(charges, x, y) {
    let ex = 0, ey = 0;
    for (const c of charges) {
      const dx = x - c.x, dy = y - c.y;
      const r2 = dx * dx + dy * dy + 1e-6;
      const r3 = Math.pow(r2, 1.5);
      ex += c.q * dx / r3;
      ey += c.q * dy / r3;
    }
    return [ex, ey];
  }

  function fieldLines(charges, opt) {
    opt = opt || {};
    const n = opt.n || 12, step = 2, maxSteps = 900, pad = 4;
    const hasPos = charges.some(c => c.q > 0);
    const sources = charges.filter(c => (hasPos ? c.q > 0 : c.q < 0));
    const dir = hasPos ? 1 : -1;
    let out = "";
    for (const s of sources) {
      for (let i = 0; i < n; i++) {
        const a = (i + (opt.phase || 0.5)) / n * 2 * Math.PI;
        let x = s.x + 10 * Math.cos(a), y = s.y + 10 * Math.sin(a);
        const pts = [[x, y]];
        for (let k = 0; k < maxSteps; k++) {
          // RK2 (Mittelpunkt)
          const f1 = fieldAt(charges, x, y);
          const m1 = Math.hypot(f1[0], f1[1]) || 1;
          const mx = x + dir * f1[0] / m1 * step / 2, my = y + dir * f1[1] / m1 * step / 2;
          const f2 = fieldAt(charges, mx, my);
          const m2 = Math.hypot(f2[0], f2[1]) || 1;
          x += dir * f2[0] / m2 * step; y += dir * f2[1] / m2 * step;
          if (x < pad || x > W - pad || y < pad || y > H - pad) { pts.push([x, y]); break; }
          let hit = false;
          for (const c of charges) {
            if (c !== s && Math.sign(c.q) !== Math.sign(s.q) && Math.hypot(x - c.x, y - c.y) < 10) { hit = true; break; }
          }
          pts.push([x, y]);
          if (hit) break;
        }
        const d = "M" + pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");
        out += '<path d="' + d + '" class="d-line"/>';
        // Pfeil in Feldrichtung etwa in der Mitte
        const mi = Math.floor(pts.length * 0.45);
        if (mi > 1 && mi < pts.length - 1) {
          const p = pts[mi], q = pts[mi + 1];
          let ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
          if (dir < 0) ang += Math.PI; // rückwärts verfolgt -> Feldrichtung umkehren
          const L = 6;
          const tip = [p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L];
          const b1 = [p[0] + Math.cos(ang + 2.6) * L, p[1] + Math.sin(ang + 2.6) * L];
          const b2 = [p[0] + Math.cos(ang - 2.6) * L, p[1] + Math.sin(ang - 2.6) * L];
          out += '<path d="M' + tip.join(",") + "L" + b1.join(",") + "L" + b2.join(",") + 'z" class="d-fill-line"/>';
        }
      }
    }
    return out;
  }

  const D = {};

  D.pos = function () {
    const c = [{ x: 160, y: 110, q: 1 }];
    return svg(fieldLines(c, { n: 12 }) + chargeSym(c[0]), W, H, "Feldlinien einer positiven Punktladung");
  };
  D.neg = function () {
    const c = [{ x: 160, y: 110, q: -1 }];
    return svg(fieldLines(c, { n: 12 }) + chargeSym(c[0]), W, H, "Feldlinien einer negativen Punktladung");
  };
  D.dipole = function () {
    const c = [{ x: 105, y: 110, q: 1 }, { x: 215, y: 110, q: -1 }];
    return svg(fieldLines(c, { n: 14, phase: 0.5 }) + chargeSym(c[0]) + chargeSym(c[1]), W, H, "Feldlinien eines Dipols");
  };
  D.pospos = function () {
    const c = [{ x: 105, y: 110, q: 1 }, { x: 215, y: 110, q: 1 }];
    return svg(fieldLines(c, { n: 14, phase: 0.25 }) + chargeSym(c[0]) + chargeSym(c[1]) +
      '<circle cx="160" cy="110" r="3" class="d-fill-line"/><text x="160" y="212" text-anchor="middle" class="d-txt d-small">Mitte: neutraler Punkt, E = 0</text>', W, H, "Feldlinien zweier positiver Ladungen");
  };

  D.plates = function () {
    let s = "";
    // Platten
    s += '<rect x="60" y="42" width="200" height="8" class="d-plate"/><rect x="60" y="170" width="200" height="8" class="d-plate"/>';
    s += '<text x="46" y="52" text-anchor="end" class="d-txt">+</text><text x="46" y="180" text-anchor="end" class="d-txt">−</text>';
    // homogene Linien
    for (let i = 0; i < 9; i++) {
      const x = 72 + i * 22;
      s += '<line x1="' + x + '" y1="52" x2="' + x + '" y2="168" class="d-line" marker-end="url(#ah)"/>';
    }
    // Randfeld
    s += '<path d="M62,52 C20,70 20,150 62,168" class="d-line" fill="none"/><path d="M258,52 C300,70 300,150 258,168" class="d-line" fill="none"/>';
    s += '<text x="160" y="116" text-anchor="middle" class="d-txt d-small">homogen</text>';
    s += '<line x1="272" y1="52" x2="272" y2="170" class="d-dim"/><text x="280" y="116" class="d-txt d-small">d</text>';
    return svg(s, W, H, "Feldlinien eines Plattenkondensators");
  };

  D.faraday = function () {
    let s = "";
    s += '<rect x="115" y="70" width="90" height="80" rx="3" class="d-cage"/>';
    s += '<text x="160" y="116" text-anchor="middle" class="d-txt">E = 0</text>';
    // Linien links -> Kasten
    for (let i = 0; i < 5; i++) {
      const y = 78 + i * 16;
      s += '<line x1="10" y1="' + y + '" x2="113" y2="' + y + '" class="d-line" marker-end="url(#ah)"/>';
      s += '<line x1="207" y1="' + y + '" x2="310" y2="' + y + '" class="d-line" marker-end="url(#ah)"/>';
    }
    // außen herum
    s += '<path d="M10,60 C90,60 100,30 160,30 C220,30 230,60 310,60" class="d-line" fill="none" marker-end="url(#ah)"/>';
    s += '<path d="M10,160 C90,160 100,190 160,190 C220,190 230,160 310,160" class="d-line" fill="none" marker-end="url(#ah)"/>';
    // Influenzladungen
    for (let i = 0; i < 4; i++) {
      s += '<text x="124" y="' + (84 + i * 18) + '" text-anchor="middle" class="d-sign-sm">−</text>';
      s += '<text x="196" y="' + (84 + i * 18) + '" text-anchor="middle" class="d-sign-sm">+</text>';
    }
    s += '<text x="160" y="212" text-anchor="middle" class="d-txt d-small">Leiter (Käfig / Gitter)</text>';
    return svg(s, W, H, "Faradayscher Käfig im elektrischen Feld");
  };

  D.tip = function () {
    let s = "";
    // Leiter: Kugel links, Spitze rechts
    s += '<path d="M60,110 C60,70 110,60 150,85 L250,110 L150,135 C110,160 60,150 60,110 Z" class="d-cage"/>';
    // Feldlinien: an der Spitze dichter
    const lines = [
      ["M95,68 C95,35 150,25 170,25", 0], ["M120,76 C130,50 180,48 200,50", 0],
      ["M150,85 C180,70 220,55 250,60", 0], ["M180,95 C210,85 255,78 285,80", 0],
      ["M250,110 L305,110", 0], ["M180,125 C210,135 255,142 285,140", 0],
      ["M150,135 C180,150 220,165 250,160", 0], ["M120,144 C130,170 180,172 200,170", 0],
      ["M95,152 C95,185 150,195 170,195", 0], ["M255,106 C275,98 292,95 305,96", 0], ["M255,114 C275,122 292,125 305,124", 0]
    ];
    for (const l of lines) s += '<path d="' + l[0] + '" class="d-line" fill="none" marker-end="url(#ah)"/>';
    // Ladungen: an der Spitze dichter
    const plus = [[70, 85], [62, 110], [70, 135], [95, 68], [95, 152], [150, 83], [150, 137], [190, 98], [190, 122], [220, 104], [220, 116], [240, 110]];
    for (const p of plus) s += '<text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle" class="d-sign-sm">+</text>';
    s += '<text x="160" y="214" text-anchor="middle" class="d-txt d-small">viele Feldlinien und Ladungen an der Spitze</text>';
    return svg(s, W, H, "Spitzeneffekt: Feldlinien an einer Spitze");
  };

  D.millikan = function () {
    let s = "";
    s += '<rect x="60" y="30" width="200" height="8" class="d-plate"/><rect x="60" y="180" width="200" height="8" class="d-plate"/>';
    s += '<text x="48" y="42" text-anchor="end" class="d-txt">+</text><text x="48" y="192" text-anchor="end" class="d-txt">−</text>';
    for (let i = 0; i < 5; i++) {
      const x = 80 + i * 40;
      s += '<line x1="' + x + '" y1="40" x2="' + x + '" y2="178" class="d-line d-faint" marker-end="url(#ah)"/>';
    }
    s += '<circle cx="160" cy="109" r="11" class="d-drop"/><text x="160" y="113" text-anchor="middle" class="d-sign">q</text>';
    s += '<line x1="160" y1="96" x2="160" y2="56" class="d-arrow-up" marker-end="url(#ah)"/><text x="172" y="66" class="d-txt d-small">F_el = q·E</text>';
    s += '<line x1="160" y1="122" x2="160" y2="162" class="d-arrow-down" marker-end="url(#ah)"/><text x="172" y="156" class="d-txt d-small">F_G = m·g</text>';
    s += '<line x1="272" y1="40" x2="272" y2="182" class="d-dim"/><text x="280" y="114" class="d-txt d-small">d</text>';
    s += '<text x="160" y="212" text-anchor="middle" class="d-txt d-small">Schweben: q·U/d = m·g</text>';
    return svg(s, W, H, "Millikan-Versuch, Schwebemethode");
  };

  D.rc = function () {
    // U(t)-Kurven für Auf- und Entladung, t in Einheiten von tau
    const x0 = 44, x1 = 300, y0 = 190, y1 = 28; // Achsen: t = 0..5 tau, U = 0..U0
    const tx = t => x0 + (x1 - x0) * t / 5;
    const uy = u => y0 - (y0 - y1) * u;
    let up = "", down = "";
    for (let i = 0; i <= 100; i++) {
      const t = i / 100 * 5;
      up += (i ? "L" : "M") + tx(t).toFixed(1) + "," + uy(1 - Math.exp(-t)).toFixed(1);
      down += (i ? "L" : "M") + tx(t).toFixed(1) + "," + uy(Math.exp(-t)).toFixed(1);
    }
    let s = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (x1 + 8) + '" y2="' + y0 + '" class="d-axis" marker-end="url(#ah)"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y1 - 10) + '" class="d-axis" marker-end="url(#ah)"/>';
    s += '<text x="' + (x1 + 6) + '" y="' + (y0 + 16) + '" text-anchor="end" class="d-txt d-small">t</text>';
    s += '<text x="' + (x0 + 8) + '" y="14" class="d-txt d-small">U</text>';
    // Hilfslinien bei tau
    s += '<line x1="' + tx(1) + '" y1="' + y0 + '" x2="' + tx(1) + '" y2="' + uy(1 - Math.exp(-1)) + '" class="d-dim"/>';
    s += '<line x1="' + x0 + '" y1="' + uy(1 - Math.exp(-1)) + '" x2="' + tx(1) + '" y2="' + uy(1 - Math.exp(-1)) + '" class="d-dim"/>';
    s += '<line x1="' + x0 + '" y1="' + uy(Math.exp(-1)) + '" x2="' + tx(1) + '" y2="' + uy(Math.exp(-1)) + '" class="d-dim"/>';
    s += '<line x1="' + x0 + '" y1="' + uy(1) + '" x2="' + x1 + '" y2="' + uy(1) + '" class="d-dim"/>';
    s += '<path d="' + up + '" class="d-curve-a" fill="none"/><path d="' + down + '" class="d-curve-b" fill="none"/>';
    s += '<text x="' + (x0 - 4) + '" y="' + (uy(1) + 4) + '" text-anchor="end" class="d-txt d-small">U₀</text>';
    s += '<text x="' + (x0 - 4) + '" y="' + (uy(1 - Math.exp(-1)) + 4) + '" text-anchor="end" class="d-txt d-small">63 %</text>';
    s += '<text x="' + (x0 - 4) + '" y="' + (uy(Math.exp(-1)) + 4) + '" text-anchor="end" class="d-txt d-small">37 %</text>';
    s += '<text x="' + tx(1) + '" y="' + (y0 + 16) + '" text-anchor="middle" class="d-txt d-small">τ</text>';
    s += '<text x="' + tx(2) + '" y="' + (y0 + 16) + '" text-anchor="middle" class="d-txt d-small">2τ</text>';
    s += '<text x="' + tx(3) + '" y="' + (y0 + 16) + '" text-anchor="middle" class="d-txt d-small">3τ</text>';
    s += '<text x="' + tx(4) + '" y="' + (y0 + 16) + '" text-anchor="middle" class="d-txt d-small">4τ</text>';
    s += '<text x="' + (tx(2.4)) + '" y="' + (uy(0.97) - 16) + '" class="d-txt d-small d-a">Aufladen</text>';
    s += '<text x="' + (tx(1.4)) + '" y="' + (uy(0.34) - 6) + '" class="d-txt d-small d-b">Entladen</text>';
    return svg(s, W, 214, "Auf- und Entladekurve eines Kondensators");
  };

  window.PHYS_DIAGRAMS = D;
})();
