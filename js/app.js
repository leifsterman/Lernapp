/* Physik-Lernapp: Karteikasten (Leitner, 5 Fächer), Lernrunden, Sync. */
(function () {
  "use strict";
  const TOPICS = window.PHYS_TOPICS, CARDS = window.PHYS_CARDS, DIA = window.PHYS_DIAGRAMS;
  const $ = (s, r) => (r || document).querySelector(s);
  const KEY = "physikq1.v2";
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fächer: 0 = neu (noch nicht geübt), 1 bis 5
  const BOX_NAME = ["Neu", "Nochmal", "Wackelig", "Geht so", "Sitzt", "Gemeistert"];
  const BOX_TAB = ["Neu", "Fach 1", "Fach 2", "Fach 3", "Fach 4", "Fach 5"];

  // ------------------------------------------------------------ Speicher
  let store = { progress: {}, sel: null, theme: null, resetAt: 0, sync: null, pick: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* ohne Speicher weiter */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignorieren */ } }

  const byId = {}; CARDS.forEach(c => { byId[c.id] = c; });
  const topicTitle = {}, topicHue = {};
  TOPICS.forEach((t, i) => { topicTitle[t.id] = t.title; topicHue[t.id] = (i * 31 + 205) % 360; });
  if (!Array.isArray(store.sel)) store.sel = TOPICS.map(t => t.id);

  // Eintrag je Karte: { b: Fach 1..5, t: Zeitstempel }. Ältere Formate ({s}, Text) umwandeln.
  function norm(e) {
    if (!e) return null;
    if (typeof e === "string") return { b: e === "known" ? 3 : 1, t: 1 };
    if (typeof e.b === "number" && e.b >= 1 && e.b <= 5) return { b: Math.round(e.b), t: +e.t || 1 };
    if (e.s === "known" || e.s === "weak") return { b: e.s === "known" ? 3 : 1, t: +e.t || 1 };
    return null;
  }
  Object.keys(store.progress).forEach(id => {
    const n = norm(store.progress[id]);
    if (n && byId[id]) store.progress[id] = n; else delete store.progress[id];
  });
  const boxOf = id => (store.progress[id] ? store.progress[id].b : 0);

  // ------------------------------------------------------------ Theme
  function applyTheme() {
    if (store.theme) document.documentElement.setAttribute("data-theme", store.theme);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme();
  $("#btn-theme").addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
      (!store.theme && !window.matchMedia("(prefers-color-scheme: light)").matches);
    store.theme = dark ? "light" : "dark";
    applyTheme(); save();
  });

  // ------------------------------------------------------------ Screens
  const screens = { start: $("#screen-start"), quiz: $("#screen-quiz"), end: $("#screen-end") };
  let active = false;
  function show(name) {
    for (const k in screens) screens[k].hidden = k !== name;
    window.scrollTo(0, 0);
    active = name === "quiz";
    if (!active) setFullscreen(false);
  }

  // ------------------------------------------------------------ Karteikasten
  function selectedCards() { return CARDS.filter(c => store.sel.includes(c.topic)); }
  function counts(cards) {
    const n = [0, 0, 0, 0, 0, 0];
    cards.forEach(c => { n[boxOf(c.id)]++; });
    return n;
  }
  function poolFor(pick) {
    const sel = selectedCards();
    return pick === null || pick === undefined ? sel : sel.filter(c => boxOf(c.id) === pick);
  }
  function weakCards() { return selectedCards().filter(c => { const b = boxOf(c.id); return b === 1 || b === 2; }); }

  function renderDrawer(el, mini) {
    const n = counts(selectedCards());
    let html = "";
    for (let i = 0; i < 6; i++) {
      const vis = n[i] === 0 ? 0 : Math.min(6, Math.ceil(n[i] / 3)); // Stapelhöhe wächst mit der Kartenzahl
      let stack = "";
      for (let k = 0; k < vis; k++) stack += '<i style="--i:' + k + '"></i>';
      html += '<button type="button" class="slot' + (n[i] === 0 ? " empty" : "") + (!mini && store.pick === i ? " sel" : "") +
        '" data-slot="' + i + '" aria-label="' + BOX_TAB[i] + ": " + n[i] + ' Karten"' + (mini ? ' tabindex="-1"' : "") + ">" +
        '<span class="tab">' + (mini ? (i === 0 ? "N" : i) : BOX_TAB[i]) + '</span><span class="n">' + n[i] + "</span>" +
        '<span class="stack">' + stack + "</span></button>";
    }
    el.innerHTML = html;
  }

  function renderRing() {
    const all = CARDS.length;
    const done = CARDS.filter(c => boxOf(c.id) >= 4).length;
    const pct = Math.round(done / all * 100);
    const R = 40, C = 2 * Math.PI * R;
    $("#ring").innerHTML =
      '<svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="' + R + '" fill="none" stroke-width="10"/>' +
      '<circle class="fg" cx="50" cy="50" r="' + R + '" fill="none" stroke-width="10" stroke-dasharray="' + C.toFixed(1) +
      '" stroke-dashoffset="' + (C * (1 - done / all)).toFixed(1) + '"/></svg>' +
      '<div class="num"><span>' + pct + ' %</span><small>sitzt</small></div>';
    $("#ring").setAttribute("aria-label", "Gesamtfortschritt: " + pct + " Prozent der Karten in Fach 4 oder 5");
  }

  function renderDrawerInfo() {
    const info = $("#drawer-info");
    const sel = selectedCards().length;
    $("#drawer-total").textContent = sel + " Karten gewählt";
    if (store.pick === null) info.innerHTML = "Tippe ein Fach an, um nur dessen Karten zu üben.";
    else {
      const k = poolFor(store.pick).length;
      info.innerHTML = "<b>" + (store.pick === 0 ? "Neue Karten" : "Fach " + store.pick + " · " + BOX_NAME[store.pick]) + "</b>: " + k +
        (k === 1 ? " Karte" : " Karten") + ". Starte unten eine Runde nur damit.";
    }
  }

  // ------------------------------------------------------------ Übersicht
  function countdownText() {
    const d = new Date().getDay(); // 0 So … 5 Fr
    const n = (5 - d + 7) % 7;
    if (n === 0) return "Heute ist Freitag. Viel Erfolg!";
    if (n === 1) return "Morgen ist Freitag";
    return "Noch " + n + " Tage bis Freitag";
  }
  $("#countdown").textContent = countdownText();

  function renderTopics() {
    const ul = $("#topic-list");
    ul.innerHTML = "";
    TOPICS.forEach(t => {
      const cs = CARDS.filter(c => c.topic === t.id);
      const g = cs.filter(c => boxOf(c.id) >= 4).length;
      const y = cs.filter(c => boxOf(c.id) === 3).length;
      const r = cs.filter(c => boxOf(c.id) === 1 || boxOf(c.id) === 2).length;
      const li = document.createElement("li");
      li.innerHTML =
        '<label class="topic" style="--h:' + topicHue[t.id] + '">' +
        '<input type="checkbox" data-topic="' + t.id + '"' + (store.sel.includes(t.id) ? " checked" : "") + ">" +
        '<span class="t-name">' + t.title + "</span>" +
        '<span class="t-stat">' + g + "/" + cs.length + "</span>" +
        '<span class="t-sub">' + t.sub + "</span>" +
        '<span class="t-bar"><span class="g" style="width:' + (g / cs.length * 100) + '%"></span>' +
        '<span class="y" style="width:' + (y / cs.length * 100) + '%"></span>' +
        '<span class="r" style="width:' + (r / cs.length * 100) + '%"></span></span>' +
        "</label>";
      ul.appendChild(li);
    });
    refreshHome();
  }

  function refreshHome() {
    renderDrawer($("#drawer"), false);
    renderDrawerInfo();
    renderRing();
    const all = poolFor(store.pick).length, weak = weakCards().length;
    $("#start-count").textContent = "(" + all + " Karten)";
    $("#weak-count").textContent = "(" + weak + ")";
    $("#btn-start").disabled = all === 0;
    $("#btn-weak").disabled = weak === 0;
  }

  $("#drawer").addEventListener("click", e => {
    const s = e.target.closest(".slot");
    if (!s) return;
    const i = +s.getAttribute("data-slot");
    store.pick = store.pick === i ? null : i;
    save(); refreshHome();
  });
  $("#topic-list").addEventListener("change", e => {
    const id = e.target.getAttribute("data-topic");
    if (!id) return;
    store.sel = store.sel.filter(x => x !== id);
    if (e.target.checked) store.sel.push(id);
    save(); refreshHome();
  });
  $("#sel-all").addEventListener("click", () => { store.sel = TOPICS.map(t => t.id); save(); renderTopics(); });
  $("#sel-none").addEventListener("click", () => { store.sel = []; save(); renderTopics(); });
  $("#btn-reset").addEventListener("click", function () {
    if (this.dataset.armed === "1") {
      store.progress = {}; store.resetAt = Date.now(); store.pick = null; save(); renderTopics(); syncNow();
      this.textContent = "Lernfortschritt zurücksetzen"; this.dataset.armed = "";
    } else {
      this.dataset.armed = "1"; this.textContent = "Wirklich zurücksetzen? Nochmal tippen.";
      setTimeout(() => { this.dataset.armed = ""; this.textContent = "Lernfortschritt zurücksetzen"; }, 4000);
    }
  });

  // ------------------------------------------------------------ Quiz
  let deck = [], total = 0, current = null, flipped = false;
  let missed = new Set(), firstTry = {}, moved = { up: 0, down: 0 };
  const cardEl = $("#card"), ratingEl = $("#rating");

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startSession(mode) {
    const pool = mode === "weak" ? weakCards() : poolFor(store.pick);
    if (!pool.length) return;
    deck = shuffle(pool.slice());
    total = deck.length;
    missed = new Set(); firstTry = {}; moved = { up: 0, down: 0 };
    show("quiz");
    renderDrawer($("#mini-drawer"), true);
    loadCard();
  }

  function render(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }
  }

  // Zu breite abgesetzte Formeln schrittweise verkleinern (statt seitlich zu scrollen)
  function fitDisplays() {
    cardEl.querySelectorAll(".back-body .katex-display").forEach(el => {
      el.style.fontSize = "";
      let size = 100;
      while (el.scrollWidth > el.clientWidth + 1 && size > 68) {
        size -= 4;
        el.style.fontSize = size + "%";
      }
    });
  }

  function setChip(el, b) {
    el.textContent = b === 0 ? "Neu" : "Fach " + b;
    el.style.setProperty("--c", "var(--b" + b + ")");
  }

  function loadCard() {
    if (!deck.length) { finish(); return; }
    current = deck[0];
    const c = current;
    $("#cards-left").textContent = deck.length;
    const done = total - deck.length;
    $("#progress-bar").style.width = (done / total * 100) + "%";
    $("#progress").setAttribute("aria-valuenow", Math.round(done / total * 100));

    cardEl.style.setProperty("--h", topicHue[c.topic]);
    setChip($("#front-box"), boxOf(c.id));
    setChip($("#back-box"), boxOf(c.id));

    const front = $("#front-body"), back = $("#back-body");
    front.classList.toggle("big", c.type === "size");
    if (c.type === "size") {
      $("#front-tag").textContent = "Physikalische Größe";
      front.innerHTML = c.front;
      $("#back-tag").textContent = c.front;
      back.innerHTML =
        '<div class="size-grid"><div><p class="k">Formelzeichen</p><p class="v">' + c.symbol + "</p></div>" +
        '<div><p class="k">SI-Einheit (antippen)</p><button type="button" class="unit-btn" id="unit-btn">' + c.unit + "</button>" +
        '<div class="unit-info" id="unit-info" hidden>' + c.unitInfo + "</div></div></div>" +
        '<div class="formula-box"><span class="k">Definition / Formel</span>' + c.formula + "</div>" +
        (c.extra ? '<p class="extra">' + c.extra + "</p>" : "");
    } else {
      $("#front-tag").textContent = c.calc ? "Rechenaufgabe" : topicTitle[c.topic];
      front.innerHTML = c.front;
      $("#back-tag").textContent = topicTitle[c.topic];
      back.innerHTML = (c.calc ? '<div class="q-recap">' + c.front + "</div>" : "") + c.back + (c.diagram && DIA[c.diagram] ? DIA[c.diagram]() : "");
    }

    // ohne Drehanimation zurücksetzen, damit die neue Rückseite nicht kurz sichtbar ist
    cardEl.classList.add("noanim");
    cardEl.classList.remove("flipped");
    flipped = false;
    ratingEl.classList.remove("show");
    ratingEl.setAttribute("aria-hidden", "true");
    render(cardEl);
    fitDisplays();
    void cardEl.offsetWidth;
    cardEl.classList.remove("noanim");
  }

  function flip() {
    if (flipped || !current) return;
    flipped = true;
    cardEl.classList.add("flipped");
    ratingEl.classList.add("show");
    ratingEl.setAttribute("aria-hidden", "false");
  }

  // Karte fliegt ins Zielfach (mini-Kasten oben)
  function flyTo(box) {
    const target = $('#mini-drawer .slot[data-slot="' + box + '"]');
    if (!target || reduceMotion || !cardEl.getBoundingClientRect) return;
    const a = cardEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "fly";
    fly.style.setProperty("--c", "var(--b" + box + ")");
    fly.style.left = (a.left + a.width / 2) + "px";
    fly.style.top = (a.top + Math.min(a.height / 2, 160)) + "px";
    document.body.appendChild(fly);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - (a.top + Math.min(a.height / 2, 160));
    const anim = fly.animate([
      { transform: "translate(0,0) scale(1.5) rotate(0deg)", opacity: 1 },
      { transform: "translate(" + dx * 0.6 + "px," + (dy * 0.6 - 30) + "px) scale(.9) rotate(-6deg)", opacity: 1, offset: .6 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.25) rotate(0deg)", opacity: .2 }
    ], { duration: 520, easing: "cubic-bezier(.4,.1,.3,1)" });
    anim.onfinish = () => {
      fly.remove();
      const s = $('#mini-drawer .slot[data-slot="' + box + '"]');
      if (s) { s.classList.add("pulse"); setTimeout(() => s.classList.remove("pulse"), 650); }
    };
  }

  function rate(r) {
    if (!flipped || !current) return;
    const c = deck.shift();
    const cur = boxOf(c.id);
    if (!(c.id in firstTry)) firstTry[c.id] = r;
    let nb;
    if (r === "wrong") {
      missed.add(c.id);
      nb = 1;
      deck.splice(Math.min(deck.length, 3), 0, c); // bald wieder
    } else if (r === "partial") {
      missed.add(c.id);
      nb = cur === 0 ? 2 : cur;
      deck.push(c); // ans Ende
    } else {
      nb = missed.has(c.id) ? Math.max(cur, 1) : (cur === 0 ? 3 : Math.min(5, cur + 1));
    }
    if (nb > cur && cur !== 0) moved.up++; else if (nb < cur) moved.down++;
    store.progress[c.id] = { b: nb, t: Date.now() };
    save();
    schedulePush();
    flyTo(nb);
    renderDrawer($("#mini-drawer"), true);
    loadCard();
  }

  // ------------------------------------------------------------ Ende, Konfetti
  function confetti() {
    if (reduceMotion) return;
    const cv = $("#confetti"), ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const colors = ["#e5604d", "#e8913f", "#d9b341", "#8cc760", "#3fb57a", "#5aa9ff", "#3e7bff"];
    const ps = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, s: 5 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[(Math.random() * colors.length) | 0]
    }));
    const t0 = performance.now();
    (function tick(now) {
      const t = now - t0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => {
        p.vy += .38; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 2600);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t < 2600) requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  function finish() {
    show("end");
    const ids = Object.keys(firstTry);
    const right = ids.filter(id => firstTry[id] === "correct").length;
    let txt = total + " Karten durch. " + right + " davon beim ersten Mal gewusst";
    txt += missed.size ? ", " + missed.size + " nochmal wiederholt." : ".";
    if (moved.up) txt += " " + moved.up + (moved.up === 1 ? " Karte" : " Karten") + " ein Fach weiter.";
    $("#end-summary").textContent = txt;
    renderTopics();
    renderDrawer($("#end-drawer"), false);
    $("#end-drawer .slot.sel") && $("#end-drawer .slot.sel").classList.remove("sel");
    $("#btn-end-weak").hidden = weakCards().length === 0;
    if (right > 0) confetti();
    syncNow();
  }

  // ------------------------------------------------------------ Vollbild / Fokus
  function setFullscreen(on) {
    const root = document.documentElement;
    root.classList.toggle("fs", !!on);
    if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  function toggleFullscreen() {
    const root = document.documentElement;
    if (root.classList.contains("fs")) { setFullscreen(false); return; }
    root.classList.add("fs"); // Fokus-Modus gilt immer, echtes Vollbild zusätzlich wo möglich (nicht auf dem iPhone)
    if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  }
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) document.documentElement.classList.remove("fs");
  });
  $("#btn-fs").addEventListener("click", toggleFullscreen);

  // ------------------------------------------------------------ Ereignisse
  cardEl.addEventListener("click", e => {
    if (e.target.closest(".unit-btn")) {
      const info = $("#unit-info");
      if (info) { info.hidden = !info.hidden; render(info); }
      return;
    }
    if (!flipped) flip();
  });
  ratingEl.addEventListener("click", e => {
    const b = e.target.closest("[data-rate]");
    if (b) rate(b.getAttribute("data-rate"));
  });
  $("#btn-start").addEventListener("click", () => startSession("all"));
  $("#btn-weak").addEventListener("click", () => startSession("weak"));
  $("#btn-again").addEventListener("click", () => startSession("all"));
  $("#btn-end-weak").addEventListener("click", () => startSession("weak"));
  function home() { renderTopics(); show("start"); }
  $("#btn-end-home").addEventListener("click", home);
  $("#btn-quit").addEventListener("click", home);
  $("#btn-home").addEventListener("click", home);

  document.addEventListener("keydown", e => {
    if (!active || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target.tagName;
    if (e.key === "Escape") {
      if (document.documentElement.classList.contains("fs")) setFullscreen(false); else home();
      return;
    }
    if ((e.key === "f" || e.key === "F") && tag !== "INPUT") { toggleFullscreen(); return; }
    if ((e.key === " " || e.key === "Enter") && tag !== "BUTTON") {
      e.preventDefault();
      if (!flipped) flip();
      return;
    }
    if (e.key === "1") rate("wrong");
    else if (e.key === "2") rate("partial");
    else if (e.key === "3") rate("correct");
  });

  // ------------------------------------------------------------ Sync (Supabase, Lerncode)
  const CFG = window.PHYS_SYNC;
  const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // ohne I, L, O, 0, 1
  const fmtCode = c => c.slice(0, 4) + "-" + c.slice(4);
  const normCode = s => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  function newCode() {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    return Array.from(buf, b => ALPHA[b % ALPHA.length]).join("");
  }
  async function rpc(fn, body) {
    const r = await fetch(CFG.url + "/rest/v1/rpc/" + fn, {
      method: "POST", keepalive: true,
      headers: { apikey: CFG.key, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  // Neuere Einträge gewinnen; ein Zurücksetzen (resetAt) löscht ältere Einträge auf allen Geräten
  function mergeData(remote) {
    if (!remote || typeof remote !== "object") return;
    const reset = Math.max(store.resetAt || 0, remote.resetAt || 0);
    const out = {};
    const rp = remote.progress || {};
    new Set(Object.keys(rp).concat(Object.keys(store.progress))).forEach(id => {
      if (!byId[id]) return;
      const a = norm(store.progress[id]), b = norm(rp[id]);
      const pick = !a ? b : !b ? a : (b.t > a.t ? b : a);
      if (pick && pick.t >= reset) out[id] = pick;
    });
    store.progress = out;
    store.resetAt = reset;
  }
  function setStatus(msg, err) {
    const el = $("#sync-status");
    el.textContent = msg || "";
    el.classList.toggle("err", !!err);
  }
  let syncing = false, again = false, pushTimer = null;
  async function syncNow() {
    if (!CFG || !store.sync) return;
    if (syncing) { again = true; return; }
    syncing = true;
    clearTimeout(pushTimer);
    try {
      setStatus("Synchronisiere …");
      const res = await rpc("lern_load", { p_code: store.sync.code });
      if (res && res.data) mergeData(res.data);
      save();
      await rpc("lern_save", { p_code: store.sync.code, p_name: store.sync.name || "", p_data: { progress: store.progress, resetAt: store.resetAt } });
      const d = new Date();
      setStatus("Synchronisiert um " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + " Uhr");
      if (!active) renderTopics();
    } catch (e) {
      setStatus("Gerade offline. Es wird später synchronisiert.", true);
    }
    syncing = false;
    if (again) { again = false; syncNow(); }
  }
  function schedulePush() {
    if (!CFG || !store.sync) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(syncNow, 2000);
  }
  function renderSync() {
    const panel = $("#sync-panel");
    if (!CFG) { panel.hidden = true; return; }
    const on = !!store.sync;
    $("#sync-off").hidden = on;
    $("#sync-on").hidden = !on;
    if (on) {
      $("#sync-who").textContent = store.sync.name ? "Verbunden als " + store.sync.name : "Verbunden";
      $("#sync-code-show").textContent = fmtCode(store.sync.code);
    } else setStatus("");
  }
  $("#sync-create").addEventListener("click", async () => {
    const name = $("#sync-name").value.trim();
    if (!name) { setStatus("Bitte zuerst deinen Namen eintragen.", true); $("#sync-name").focus(); return; }
    store.sync = { code: newCode(), name };
    save(); renderSync(); await syncNow();
  });
  $("#sync-join").addEventListener("click", async () => {
    const code = normCode($("#sync-code").value);
    if (code.length !== 8) { setStatus("Der Code hat 8 Zeichen, z. B. K7M2-QX9P.", true); return; }
    setStatus("Suche Code …");
    try {
      const res = await rpc("lern_load", { p_code: code });
      if (!res) { setStatus("Diesen Code gibt es nicht. Tippfehler?", true); return; }
      store.sync = { code, name: res.name || "" };
      save(); renderSync(); await syncNow();
    } catch (e) { setStatus("Keine Verbindung. Versuche es gleich nochmal.", true); }
  });
  $("#sync-copy").addEventListener("click", () => {
    const t = fmtCode(store.sync.code);
    const done = () => setStatus("Code kopiert: " + t);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => setStatus("Code: " + t));
    else setStatus("Code: " + t);
  });
  $("#sync-leave").addEventListener("click", () => {
    store.sync = null; save(); renderSync();
    setStatus("Getrennt. Dein Fortschritt bleibt auf diesem Gerät.");
  });
  document.addEventListener("visibilitychange", () => { if (!syncing) syncNow(); });
  window.addEventListener("online", syncNow);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active) fitDisplays(); });

  // ------------------------------------------------------------ Start
  renderTopics();
  renderSync();
  show("start");
  syncNow();

  // Offline-Fähigkeit (nur über https/localhost)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }
})();
