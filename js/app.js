/* Physik-Lernapp: Themenwahl, Lernrunden, Fortschritt (localStorage). */
(function () {
  "use strict";
  const TOPICS = window.PHYS_TOPICS, CARDS = window.PHYS_CARDS, DIA = window.PHYS_DIAGRAMS;
  const $ = (s, r) => (r || document).querySelector(s);
  const KEY = "physikq1.v2";

  // ------------------------------------------------------------ Speicher
  let store = { progress: {}, sel: null, theme: null, resetAt: 0, sync: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* ohne Speicher weiter */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignorieren */ } }

  const byId = {}; CARDS.forEach(c => { byId[c.id] = c; });
  const topicTitle = {}; TOPICS.forEach(t => { topicTitle[t.id] = t.title; });
  if (!Array.isArray(store.sel)) store.sel = TOPICS.map(t => t.id);
  // Fortschritt je Karte: { s: "known" | "weak", t: Zeitstempel }; ältere Speicherstände (nur Text) umwandeln
  Object.keys(store.progress).forEach(id => {
    const v = store.progress[id];
    if (typeof v === "string") store.progress[id] = { s: v, t: 1 };
  });
  const status = id => (store.progress[id] ? store.progress[id].s : "new");

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
  function show(name) {
    for (const k in screens) screens[k].hidden = k !== name;
    window.scrollTo(0, 0);
    active = name === "quiz";
  }
  let active = false;

  // ------------------------------------------------------------ Übersicht
  function countdownText() {
    const d = new Date().getDay(); // 0 So … 5 Fr
    const n = (5 - d + 7) % 7;
    if (n === 0) return "Heute ist Freitag. Viel Erfolg!";
    if (n === 1) return "Morgen ist Freitag";
    return "Noch " + n + " Tage bis Freitag";
  }
  $("#countdown").textContent = countdownText();

  function topicCards(id) { return CARDS.filter(c => c.topic === id); }

  function renderTopics() {
    const ul = $("#topic-list");
    ul.innerHTML = "";
    TOPICS.forEach(t => {
      const cs = topicCards(t.id);
      const known = cs.filter(c => status(c.id) === "known").length;
      const weak = cs.filter(c => status(c.id) === "weak").length;
      const li = document.createElement("li");
      li.innerHTML =
        '<label class="topic">' +
        '<input type="checkbox" data-topic="' + t.id + '"' + (store.sel.includes(t.id) ? " checked" : "") + ">" +
        '<span class="t-name">' + t.title + "</span>" +
        '<span class="t-stat">' + known + "/" + cs.length + "</span>" +
        '<span class="t-sub">' + t.sub + "</span>" +
        '<span class="t-bar"><span class="k" style="width:' + (known / cs.length * 100) + '%"></span>' +
        '<span class="w" style="width:' + (weak / cs.length * 100) + '%"></span></span>' +
        "</label>";
      ul.appendChild(li);
    });
    // Fachbegriffe wie ε₀ stehen als Unicode im Text, kein KaTeX nötig
    updateCounts();
  }

  function selectedCards() { return CARDS.filter(c => store.sel.includes(c.topic)); }
  function weakCards() { return selectedCards().filter(c => status(c.id) === "weak"); }
  function updateCounts() {
    const all = selectedCards().length, weak = weakCards().length;
    $("#start-count").textContent = "(" + all + " Karten)";
    $("#weak-count").textContent = "(" + weak + ")";
    $("#btn-start").disabled = all === 0;
    $("#btn-weak").disabled = weak === 0;
  }

  $("#topic-list").addEventListener("change", e => {
    const id = e.target.getAttribute("data-topic");
    if (!id) return;
    store.sel = store.sel.filter(x => x !== id);
    if (e.target.checked) store.sel.push(id);
    save(); updateCounts();
  });
  $("#sel-all").addEventListener("click", () => { store.sel = TOPICS.map(t => t.id); save(); renderTopics(); });
  $("#sel-none").addEventListener("click", () => { store.sel = []; save(); renderTopics(); });
  $("#btn-reset").addEventListener("click", function () {
    if (this.dataset.armed === "1") {
      store.progress = {}; store.resetAt = Date.now(); save(); renderTopics(); syncNow();
      this.textContent = "Lernfortschritt zurücksetzen"; this.dataset.armed = "";
    } else {
      this.dataset.armed = "1"; this.textContent = "Wirklich zurücksetzen? Nochmal tippen.";
      setTimeout(() => { this.dataset.armed = ""; this.textContent = "Lernfortschritt zurücksetzen"; }, 4000);
    }
  });

  // ------------------------------------------------------------ Quiz
  let deck = [], total = 0, current = null, flipped = false;
  let missed = new Set(), firstTry = {}, lastMode = "all";
  const cardEl = $("#card"), ratingEl = $("#rating");

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startSession(mode) {
    lastMode = mode;
    const pool = mode === "weak" ? weakCards() : selectedCards();
    if (!pool.length) return;
    deck = shuffle(pool.slice());
    total = deck.length;
    missed = new Set(); firstTry = {};
    show("quiz");
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

  function loadCard() {
    if (!deck.length) { finish(); return; }
    current = deck[0];
    const c = current;
    $("#cards-left").textContent = deck.length;
    const done = total - deck.length;
    $("#progress-bar").style.width = (done / total * 100) + "%";
    $("#progress").setAttribute("aria-valuenow", Math.round(done / total * 100));

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

  function rate(r) {
    if (!flipped || !current) return;
    const c = deck.shift();
    if (!(c.id in firstTry)) firstTry[c.id] = r;
    if (r === "wrong") {
      missed.add(c.id);
      deck.splice(Math.min(deck.length, 3), 0, c); // bald wieder
    } else if (r === "partial") {
      missed.add(c.id);
      deck.push(c); // ans Ende
    } else {
      store.progress[c.id] = { s: missed.has(c.id) ? "weak" : "known", t: Date.now() };
    }
    if (r !== "correct") store.progress[c.id] = { s: "weak", t: Date.now() };
    save();
    schedulePush();
    loadCard();
  }

  function finish() {
    show("end");
    const ids = Object.keys(firstTry);
    const right = ids.filter(id => firstTry[id] === "correct").length;
    $("#end-summary").textContent = total + " Karten durch. " + right + " davon beim ersten Mal gewusst" +
      (missed.size ? ", " + missed.size + " nochmal wiederholt." : ".");
    renderTopics();
    $("#btn-end-weak").hidden = weakCards().length === 0;
    syncNow();
  }

  // Ereignisse
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
    if (e.key === "Escape") { home(); return; }
    if ((e.key === " " || e.key === "Enter") && tag !== "BUTTON") {
      e.preventDefault();
      if (!flipped) flip();
      return;
    }
    if (e.key === "1") rate("wrong");
    else if (e.key === "2") rate("partial");
    else if (e.key === "3") rate("correct");
    else if (e.key === " " && flipped && tag !== "BUTTON") e.preventDefault();
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
    const all = Object.assign({}, remote.progress || {}, store.progress);
    Object.keys(all).forEach(id => {
      if (!byId[id]) return;
      const a = store.progress[id], b = remote.progress && remote.progress[id];
      const pick = !a ? b : !b ? a : (b.t > a.t ? b : a);
      if (pick && pick.t >= reset && (pick.s === "known" || pick.s === "weak")) out[id] = pick;
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
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow(); else if (!syncing) syncNow(); });
  window.addEventListener("online", syncNow);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active) fitDisplays(); });
  renderTopics();
  renderSync();
  show("start");
  syncNow();

  // Offline-Fähigkeit (nur über https/localhost)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }
})();
