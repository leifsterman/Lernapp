/* Physik-Lernapp: Themenwahl, Lernrunden, Fortschritt (localStorage). */
(function () {
  "use strict";
  const TOPICS = window.PHYS_TOPICS, CARDS = window.PHYS_CARDS, DIA = window.PHYS_DIAGRAMS;
  const $ = (s, r) => (r || document).querySelector(s);
  const KEY = "physikq1.v2";

  // ------------------------------------------------------------ Speicher
  let store = { progress: {}, sel: null, theme: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* ohne Speicher weiter */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignorieren */ } }

  const byId = {}; CARDS.forEach(c => { byId[c.id] = c; });
  const topicTitle = {}; TOPICS.forEach(t => { topicTitle[t.id] = t.title; });
  if (!Array.isArray(store.sel)) store.sel = TOPICS.map(t => t.id);
  const status = id => store.progress[id] || "new";

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
      store.progress = {}; save(); renderTopics();
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
      store.progress[c.id] = missed.has(c.id) ? "weak" : "known";
    }
    if (r !== "correct") store.progress[c.id] = "weak";
    save();
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

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (active) fitDisplays(); });
  renderTopics();
  show("start");

  // Offline-Fähigkeit (nur über https/localhost)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }
})();
