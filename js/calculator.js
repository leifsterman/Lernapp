/* Taschenrechner (wissenschaftlich, Casio-Stil). Eigener Parser, kein eval.
   Außen: window.PHYS_CALC.enable(true|false) blendet den Rechner ein oder aus. */
(function () {
  "use strict";
  const SKEY = "physikq1.calc";
  let st = { deg: true, sci: false, mem: 0, hist: [], x: null, y: null };
  try { Object.assign(st, JSON.parse(localStorage.getItem(SKEY) || "{}")); } catch (e) { /* ohne Speicher */ }
  const persist = () => { try { localStorage.setItem(SKEY, JSON.stringify({ deg: st.deg, sci: st.sci, mem: st.mem, hist: st.hist.slice(0, 30), x: st.x, y: st.y })); } catch (e) { /* ignorieren */ } };

  // ---------------------------------------------------------------- Rechnen
  const CONST = [
    ["ε₀", "Elektrische Feldkonstante", 8.8541878128e-12, "F/m"],
    ["e", "Elementarladung", 1.602176634e-19, "C"],
    ["k", "Coulomb-Konstante 1/(4πε₀)", 8.9875517923e9, "N·m²/C²"],
    ["g", "Ortsfaktor", 9.81, "m/s²"],
    ["mₑ", "Elektronenmasse", 9.1093837015e-31, "kg"],
    ["mₚ", "Protonenmasse", 1.67262192369e-27, "kg"],
    ["c", "Lichtgeschwindigkeit", 299792458, "m/s"],
    ["µ₀", "Magnetische Feldkonstante", 1.25663706212e-6, "N/A²"],
    ["h", "Planck-Konstante", 6.62607015e-34, "J·s"],
    ["Nₐ", "Avogadro-Konstante", 6.02214076e23, "1/mol"]
  ];
  const FUN = { sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, log: 1, ln: 1, sqrt: 1, cbrt: 1, tenx: 1, expx: 1 };

  function fact(n) {
    if (n < 0 || Math.abs(n - Math.round(n)) > 1e-12 || n > 170) throw new Error("Math-Fehler");
    let r = 1; for (let i = 2; i <= Math.round(n); i++) r *= i; return r;
  }
  function evaluate(src, ans) {
    // Tokenizer
    const toks = []; let i = 0;
    while (i < src.length) {
      const rest = src.slice(i);
      let m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(rest);
      if (m) { toks.push({ t: "n", v: parseFloat(m[0].replace("E", "e")) }); i += m[0].length; continue; }
      m = /^(asin|acos|atan|sin|cos|tan|log|ln|sqrt|cbrt|tenx|expx|pi|Ans|X|Y)/.exec(rest);
      if (m) { toks.push({ t: FUN[m[1]] ? "f" : "c", v: m[1] }); i += m[1].length; if (FUN[m[1]]) { if (src[i] === "(") i++; } continue; }
      const ch = src[i];
      if ("+-*/^~()!%e".includes(ch)) { toks.push({ t: ch === "e" ? "c" : "o", v: ch }); i++; continue; }
      throw new Error("Syntax-Fehler");
    }
    let p = 0;
    const peek = () => toks[p];
    const toRad = x => (st.deg ? x * Math.PI / 180 : x);
    const fromRad = x => (st.deg ? x * 180 / Math.PI : x);
    function applyF(f, x) {
      switch (f) {
        case "sin": { const r = Math.sin(toRad(x)); return st.deg && Math.abs(x % 180) === 0 ? 0 : r; }
        case "cos": return st.deg && Math.abs((x - 90) % 180) === 0 ? 0 : Math.cos(toRad(x));
        case "tan": if (st.deg && Math.abs((x - 90) % 180) === 0) throw new Error("Math-Fehler"); return st.deg && x % 180 === 0 ? 0 : Math.tan(toRad(x));
        case "asin": if (Math.abs(x) > 1) throw new Error("Math-Fehler"); return fromRad(Math.asin(x));
        case "acos": if (Math.abs(x) > 1) throw new Error("Math-Fehler"); return fromRad(Math.acos(x));
        case "atan": return fromRad(Math.atan(x));
        case "log": if (x <= 0) throw new Error("Math-Fehler"); return Math.log10(x);
        case "ln": if (x <= 0) throw new Error("Math-Fehler"); return Math.log(x);
        case "sqrt": if (x < 0) throw new Error("Math-Fehler"); return Math.sqrt(x);
        case "cbrt": return Math.cbrt(x);
        case "tenx": return Math.pow(10, x);
        case "expx": return Math.exp(x);
      }
    }
    function expr() {
      let v = term();
      for (;;) {
        const t = peek();
        if (t && t.t === "o" && (t.v === "+" || t.v === "-")) { p++; const r = term(); v = t.v === "+" ? v + r : v - r; } else return v;
      }
    }
    function startsFactor(t) { return t && (t.t === "n" || t.t === "c" || t.t === "f" || (t.t === "o" && t.v === "(")); }
    function term() {
      let v = unary();
      for (;;) {
        const t = peek();
        if (t && t.t === "o" && (t.v === "*" || t.v === "/")) {
          p++; const r = unary();
          if (t.v === "/" && r === 0) throw new Error("Math-Fehler: Division durch 0");
          v = t.v === "*" ? v * r : v / r;
        } else if (startsFactor(t)) { v = v * unary(); } // 2π, 2(3), 3sin(…)
        else return v;
      }
    }
    function unary() {
      const t = peek();
      if (t && t.t === "o" && (t.v === "-" || t.v === "+")) { p++; const v = unary(); return t.v === "-" ? -v : v; }
      return power();
    }
    function power() {
      let b = postfix();
      const t = peek();
      if (t && t.t === "o" && t.v === "^") {
        p++;
        const e = unarySignedPower(); // rechtsassoziativ, erlaubt 2^-3
        const r = Math.pow(b, e);
        if (!isFinite(r) && isFinite(b) && isFinite(e)) throw new Error("Math-Fehler");
        return r;
      }
      if (t && t.t === "o" && t.v === "~") { // n ˣ√ x  =  x^(1/n)
        p++; const x = unarySignedPower();
        if (b === 0) throw new Error("Math-Fehler");
        if (x < 0 && Math.abs(b % 2) === 1) return -Math.pow(-x, 1 / b);
        if (x < 0) throw new Error("Math-Fehler");
        return Math.pow(x, 1 / b);
      }
      return b;
    }
    function unarySignedPower() {
      const t = peek();
      if (t && t.t === "o" && (t.v === "-" || t.v === "+")) { p++; const v = unarySignedPower(); return t.v === "-" ? -v : v; }
      return power();
    }
    function postfix() {
      let v = primary();
      for (;;) {
        const t = peek();
        if (t && t.t === "o" && t.v === "!") { p++; v = fact(v); }
        else if (t && t.t === "o" && t.v === "%") { p++; v = v / 100; }
        else return v;
      }
    }
    function primary() {
      const t = toks[p++];
      if (!t) throw new Error("Syntax-Fehler");
      if (t.t === "n") return t.v;
      if (t.t === "c") {
        if (t.v === "pi") return Math.PI;
        if (t.v === "e") return Math.E;
        if (t.v === "Ans") return ans;
        if (t.v === "X") return st.x == null ? 0 : st.x;
        if (t.v === "Y") return st.y == null ? 0 : st.y;
      }
      if (t.t === "f") { const x = parenBody(); return applyF(t.v, x); }
      if (t.t === "o" && t.v === "(") { const x = parenBody(); return x; }
      throw new Error("Syntax-Fehler");
    }
    // Innenteil bis ")" – fehlende Klammern am Ende werden automatisch geschlossen
    function parenBody() {
      const v = expr();
      const t = peek();
      if (t && t.t === "o" && t.v === ")") p++;
      return v;
    }
    const r = expr();
    if (p < toks.length) throw new Error("Syntax-Fehler");
    if (!isFinite(r) || isNaN(r)) throw new Error("Math-Fehler");
    return r;
  }

  // ---------------------------------------------------------------- Format
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function sciParts(x, sig) {
    const e = Math.floor(Math.log10(Math.abs(x)));
    let m = x / Math.pow(10, e), ee = e;
    let ms = m.toPrecision(sig);
    if (Math.abs(parseFloat(ms)) >= 10) { ee++; ms = (m / 10).toPrecision(sig); }
    return { m: ms.replace(/\.?0+$/, "").replace(".", ","), e: ee };
  }
  function fmt(x) { // liefert HTML
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (st.sci || a < 1e-4 || a >= 1e10) {
      const q = sciParts(x, st.sci ? 4 : 10);
      return q.m + "·10<sup>" + q.e + "</sup>";
    }
    let s = parseFloat(x.toPrecision(10)).toString();
    if (s.includes("e")) { const q = sciParts(x, 10); return q.m + "·10<sup>" + q.e + "</sup>"; }
    return s.replace(".", ",");
  }
  function plainNum(x) { // für Verlauf/Einfügen: Zahl als Eingabe-Zeichenfolge
    const s = parseFloat(x.toPrecision(12)).toString();
    return s.replace("e+", "E").replace("e-", "E-");
  }

  // ---------------------------------------------------------------- Zustand der Eingabe
  // Jeder Token: { d: Anzeige (HTML), v: Wert für den Parser, k: Art }
  let toks = [], justEvaluated = false, shift = false, lastAns = 0, resultHtml = "", errMsg = "", enabled = true, open = false;
  const T = (d, v, k) => ({ d, v, k: k || "x" });
  const FUNC_T = {
    sin: T("sin(", "sin(", "f"), cos: T("cos(", "cos(", "f"), tan: T("tan(", "tan(", "f"),
    asin: T("sin⁻¹(", "asin(", "f"), acos: T("cos⁻¹(", "acos(", "f"), atan: T("tan⁻¹(", "atan(", "f"),
    log: T("log(", "log(", "f"), ln: T("ln(", "ln(", "f"), tenx: T("10<sup>(</sup>", "tenx(", "f"), expx: T("e<sup>(</sup>", "expx(", "f"),
    sqrt: T("√(", "sqrt(", "f"), cbrt: T("³√(", "cbrt(", "f")
  };
  const isDigit = t => t && t.k === "d";
  function renderExpr() {
    let h = "", inExp = false, first = false;
    toks.forEach(t => {
      if (t.k === "E") { h += "·10"; inExp = true; first = true; return; }
      if (inExp && (isDigit(t) || (first && t.v === "-"))) { h += "<sup>" + t.d + "</sup>"; first = false; return; }
      inExp = false; h += t.d;
    });
    return h;
  }

  // ---------------------------------------------------------------- Oberfläche
  const root = document.createElement("div");
  root.id = "calc-root";
  root.innerHTML =
    '<button type="button" id="calc-fab" aria-label="Taschenrechner öffnen" aria-expanded="false" title="Taschenrechner (Taste C)">' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="5.5" width="8" height="3.5" rx=".8" fill="currentColor"/><g fill="currentColor"><circle cx="8.8" cy="13" r="1.1"/><circle cx="12" cy="13" r="1.1"/><circle cx="15.2" cy="13" r="1.1"/><circle cx="8.8" cy="16.6" r="1.1"/><circle cx="12" cy="16.6" r="1.1"/><circle cx="15.2" cy="16.6" r="1.1"/></g></svg>' +
    "</button>" +
    '<section id="calc" role="dialog" aria-label="Taschenrechner" hidden>' +
      '<header class="c-head" id="calc-drag">' +
        '<span class="c-brand">PHYS<b>·</b>CALC <i>fx</i></span>' +
        '<span class="c-solar" aria-hidden="true"></span>' +
        '<button type="button" class="c-ic" data-act="hist" aria-label="Verlauf" title="Verlauf"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 7v5l3 2M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button type="button" class="c-ic" data-act="close" aria-label="Schließen" title="Schließen (Esc)"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
      "</header>" +
      '<div class="c-lcd" aria-live="polite">' +
        '<div class="c-flags"><span data-f="shift">2nd</span><span data-f="mode">DEG</span><span data-f="fmt">NORM</span><span data-f="mem">M</span></div>' +
        '<div class="c-expr" id="c-expr"></div>' +
        '<div class="c-res" id="c-res">0</div>' +
      "</div>" +
      '<div class="c-pop" id="c-pop" hidden></div>' +
      '<div class="c-keys" id="c-keys"></div>' +
    "</section>";
  document.body.appendChild(root);
  const $ = s => root.querySelector(s);
  const panel = $("#calc"), fab = $("#calc-fab"), exprEl = $("#c-expr"), resEl = $("#c-res"), pop = $("#c-pop");

  // Tasten: [Beschriftung, 2nd-Beschriftung, Aktion, 2nd-Aktion, Klasse]
  const KEYS = [
    ["2nd", "", "shift", "", "mode"], ["DEG", "", "deg", "", "mode"], ["NORM", "", "fmt", "", "mode"], ["π", "e", "pi", "e", "fn"], ["Konst", "", "const", "", "mode"],
    ["sin", "sin⁻¹", "f:sin", "f:asin", "fn"], ["cos", "cos⁻¹", "f:cos", "f:acos", "fn"], ["tan", "tan⁻¹", "f:tan", "f:atan", "fn"], ["log", "10ˣ", "f:log", "f:tenx", "fn"], ["ln", "eˣ", "f:ln", "f:expx", "fn"],
    ["x²", "x³", "t:^2", "t:^3", "fn"], ["xʸ", "ˣ√y", "t:^", "t:~", "fn"], ["√", "³√", "f:sqrt", "f:cbrt", "fn"], ["(", "", "t:(", "", "fn"], [")", "", "t:)", "", "fn"],
    ["x⁻¹", "", "t:^-1", "", "fn"], ["n!", "", "t:!", "", "fn"], ["%", "", "t:%", "", "fn"], ["M+", "M−", "m+", "m-", "fn"], ["MR", "MC", "mr", "mc", "fn"],
    ["7", "", "d:7", "", "num"], ["8", "", "d:8", "", "num"], ["9", "", "d:9", "", "num"], ["DEL", "", "del", "", "del"], ["AC", "", "ac", "", "del"],
    ["4", "", "d:4", "", "num"], ["5", "", "d:5", "", "num"], ["6", "", "d:6", "", "num"], ["×", "", "o:*", "", "op"], ["÷", "", "o:/", "", "op"],
    ["1", "", "d:1", "", "num"], ["2", "", "d:2", "", "num"], ["3", "", "d:3", "", "num"], ["+", "", "o:+", "", "op"], ["−", "", "o:-", "", "op"],
    ["0", "", "d:0", "", "num"], [",", "", "d:.", "", "num"], ["×10ˣ", "", "exp", "", "fn"], ["Ans", "", "ans", "", "fn"], ["=", "", "eq", "", "eq"]
  ];
  $("#c-keys").innerHTML = KEYS.map((k, i) =>
    '<button type="button" class="ck ' + k[4] + '" data-i="' + i + '">' + (k[1] ? '<small>' + k[1] + "</small>" : "") + "<span>" + k[0] + "</span></button>").join("");

  function updateFlags() {
    root.querySelector('[data-f="shift"]').classList.toggle("on", shift);
    root.querySelector('[data-f="mode"]').textContent = st.deg ? "DEG" : "RAD";
    root.querySelector('[data-f="fmt"]').textContent = st.sci ? "SCI" : "NORM";
    root.querySelector('[data-f="mem"]').classList.toggle("on", !!st.mem);
    const set = (i, txt) => { const b = root.querySelector('.ck[data-i="' + i + '"] span'); if (b) b.textContent = txt; };
    set(1, st.deg ? "DEG" : "RAD"); set(2, st.sci ? "SCI" : "NORM");
    root.querySelector('.ck[data-i="0"]').classList.toggle("act", shift);
    root.querySelectorAll(".ck").forEach(b => b.classList.toggle("sh", shift));
  }
  function show() {
    exprEl.innerHTML = renderExpr() || "&nbsp;";
    if (errMsg) { resEl.textContent = errMsg; resEl.classList.add("err"); }
    else { resEl.innerHTML = resultHtml || "0"; resEl.classList.remove("err"); }
    exprEl.scrollLeft = exprEl.scrollWidth;
    updateFlags();
  }
  function srcOf() { return toks.map(t => t.v).join(""); }
  function liveCalc() { // Vorschau, solange man tippt
    errMsg = "";
    if (!toks.length) { resultHtml = justEvaluated ? resultHtml : ""; return; }
    try { resultHtml = fmt(evaluate(srcOf(), lastAns)); } catch (e) { /* unvollständig: Ergebnis bleibt stehen */ }
  }
  function insertTok(t, startsNew) {
    if (justEvaluated) {
      justEvaluated = false;
      if (!startsNew) toks = [T("Ans", "Ans", "c")]; // Rechnen mit dem letzten Ergebnis weiter
      else toks = [];
    }
    errMsg = "";
    toks.push(t);
    liveCalc(); show();
  }
  function equals() {
    if (!toks.length) return;
    try {
      const v = evaluate(srcOf(), lastAns);
      const disp = renderExpr();
      resultHtml = fmt(v);
      st.hist.unshift({ e: disp, r: resultHtml, v: plainNum(v) });
      st.hist = st.hist.slice(0, 30);
      lastAns = v; justEvaluated = true; errMsg = "";
      persist();
    } catch (e) { errMsg = e.message || "Fehler"; }
    show();
  }
  function setShift(v) { shift = v; updateFlags(); }
  function memAdd(sign) {
    let v;
    try { v = toks.length ? evaluate(srcOf(), lastAns) : lastAns; } catch (e) { errMsg = "Math-Fehler"; show(); return; }
    st.mem += sign * v; persist(); updateFlags();
  }
  function act(a) {
    if (a === "shift") { setShift(!shift); return; }
    const was = shift; setShift(false);
    if (a === "deg") { st.deg = !st.deg; persist(); liveCalc(); show(); return; }
    if (a === "fmt") { st.sci = !st.sci; persist(); if (justEvaluated) { try { resultHtml = fmt(lastAns); } catch (e) { /* */ } } else liveCalc(); show(); return; }
    if (a === "const") { togglePop("const"); return; }
    if (a === "pi") { insertTok(was ? T("e", "e", "c") : T("π", "pi", "c"), true); return; }
    if (a === "e") { insertTok(T("e", "e", "c"), true); return; }
    if (a === "ac") { toks = []; resultHtml = ""; errMsg = ""; justEvaluated = false; show(); return; }
    if (a === "del") {
      if (justEvaluated) { toks = []; resultHtml = ""; justEvaluated = false; show(); return; }
      toks.pop(); errMsg = ""; resultHtml = ""; liveCalc(); show(); return;
    }
    if (a === "eq") { equals(); return; }
    if (a === "ans") { insertTok(T("Ans", "Ans", "c"), true); return; }
    if (a === "exp") {
      const last = toks[toks.length - 1];
      if (justEvaluated || !(last && (isDigit(last) || last.d === ")"))) insertTok(T("1", "1", "d"), true);
      insertTok(T("·10", "E", "E"), false); return;
    }
    if (a === "m+") { memAdd(1); return; }
    if (a === "m-") { memAdd(-1); return; }
    if (a === "mc") { st.mem = 0; persist(); updateFlags(); return; }
    if (a === "mr") { insertTok(T(esc(fmt(st.mem).replace(/<[^>]+>/g, "")), "(" + plainNum(st.mem) + ")", "c"), true); return; }
    const [k, arg] = [a.slice(0, a.indexOf(":")), a.slice(a.indexOf(":") + 1)];
    if (k === "d") { insertTok(T(arg === "." ? "," : arg, arg, "d"), true); return; }
    if (k === "o") { // Operator: nach "=" mit Ans weiterrechnen
      insertTok(T(arg === "*" ? "×" : arg === "/" ? "÷" : arg === "-" ? "−" : arg, arg, "o"), false); return;
    }
    if (k === "f") { insertTok(FUNC_T[arg], true); return; }
    if (k === "t") {
      const map = { "^2": ["<sup>2</sup>", "^2"], "^3": ["<sup>3</sup>", "^3"], "^-1": ["<sup>−1</sup>", "^(-1)"], "^": ["^", "^"], "~": ["ˣ√", "~"], "!": ["!", "!"], "%": ["%", "%"], "(": ["(", "("], ")": [")", ")"] };
      const m = map[arg];
      insertTok(T(m[0], m[1], "o"), arg === "(");
      return;
    }
  }

  $("#c-keys").addEventListener("click", e => {
    const b = e.target.closest(".ck"); if (!b) return;
    const k = KEYS[+b.dataset.i];
    const a = shift && k[3] ? k[3] : k[2];
    closePop();
    act(a);
  });

  // Popups: Konstanten und Verlauf
  function closePop() { pop.hidden = true; pop.dataset.kind = ""; }
  function togglePop(kind) {
    if (!pop.hidden && pop.dataset.kind === kind) { closePop(); return; }
    pop.dataset.kind = kind; pop.hidden = false;
    if (kind === "const") {
      pop.innerHTML = '<div class="c-pop-h">Konstanten einfügen</div>' + CONST.map((c, i) =>
        '<button type="button" class="c-row" data-const="' + i + '"><b>' + c[0] + "</b><span>" + c[1] + '</span><em>' + fmt(c[2]) + " " + c[3] + "</em></button>").join("");
    } else {
      pop.innerHTML = '<div class="c-pop-h">Verlauf <button type="button" class="c-clear" data-clear="1">Leeren</button></div>' +
        (st.hist.length ? st.hist.map((h, i) => '<button type="button" class="c-row hist" data-hist="' + i + '"><span class="he">' + h.e + '</span><em>= ' + h.r + "</em></button>").join("") : '<p class="c-none">Noch nichts gerechnet.</p>');
    }
  }
  pop.addEventListener("click", e => {
    const c = e.target.closest("[data-const]");
    if (c) { const k = CONST[+c.dataset.const]; insertTok(T(k[0], "(" + plainNum(k[2]) + ")", "c"), true); closePop(); return; }
    const h = e.target.closest("[data-hist]");
    if (h) { const x = st.hist[+h.dataset.hist]; insertTok(T(x.r, "(" + x.v + ")", "c"), true); closePop(); return; }
    if (e.target.closest("[data-clear]")) { st.hist = []; persist(); togglePop("hist"); togglePop("hist"); }
  });

  // Öffnen, Schließen, Ziehen
  function setOpen(v) {
    open = v && enabled;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    fab.classList.toggle("on", open);
    if (!open) closePop();
    if (open) show();
  }
  fab.addEventListener("click", () => setOpen(!open));
  root.querySelector('[data-act="close"]').addEventListener("click", () => setOpen(false));
  root.querySelector('[data-act="hist"]').addEventListener("click", () => togglePop("hist"));
  exprEl.addEventListener("click", () => closePop());

  // Verschieben am Kopf (Maus und Touch)
  (function drag() {
    const h = $("#calc-drag"); let sx, sy, ox, oy, on = false;
    h.addEventListener("pointerdown", e => {
      if (e.target.closest("button")) return;
      const r = panel.getBoundingClientRect(); on = true; sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      h.setPointerCapture(e.pointerId);
    });
    h.addEventListener("pointermove", e => {
      if (!on) return;
      const w = panel.offsetWidth, hh = panel.offsetHeight;
      const x = Math.min(Math.max(0, ox + e.clientX - sx), innerWidth - w);
      const y = Math.min(Math.max(0, oy + e.clientY - sy), innerHeight - hh);
      panel.style.left = x + "px"; panel.style.top = y + "px"; panel.style.right = "auto"; panel.style.bottom = "auto";
    });
    const end = () => { on = false; };
    h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end);
  })();

  // Tastatur (nur wenn kein Eingabefeld der Seite den Fokus hat)
  document.addEventListener("keydown", e => {
    const tg = e.target, typing = tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.isContentEditable);
    if (!enabled || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!open) { if (!typing && (e.key === "c" || e.key === "C") && !document.querySelector(".dlg:not([hidden])")) { setOpen(true); e.preventDefault(); } return; }
    if (e.key === "Escape") { if (!pop.hidden) closePop(); else setOpen(false); return; }
    if (typing && !panel.contains(tg)) return;
    if (tg && tg.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return; // Taste auslösen lassen
    const k = e.key; let a = null;
    if (/^[0-9]$/.test(k)) a = "d:" + k;
    else if (k === "." || k === ",") a = "d:.";
    else if (k === "+") a = "o:+"; else if (k === "-") a = "o:-"; else if (k === "*") a = "o:*"; else if (k === "/") a = "o:/";
    else if (k === "^") a = "t:^"; else if (k === "(") a = "t:("; else if (k === ")") a = "t:)"; else if (k === "!") a = "t:!"; else if (k === "%") a = "t:%";
    else if (k === "Enter" || k === "=") a = "eq";
    else if (k === "Backspace") a = "del";
    else if (k === "Delete") a = "ac";
    else if (k === "p" || k === "P") a = "pi";
    if (a) { e.preventDefault(); closePop(); act(a); }
  });

  window.PHYS_CALC = {
    enable(v) {
      enabled = !!v;
      root.hidden = !enabled;
      if (!enabled) setOpen(false);
    },
    open: () => setOpen(true),
    evaluate: (s, a) => evaluate(s, a || 0)
  };
  root.hidden = false;
  updateFlags();
})();
