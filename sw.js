/* Offline-Cache: alles cachen, im Hintergrund aktualisieren. */
const CACHE = "physikq1-v22";
const ASSETS = ["./", "index.html", "css/style.css", "js/config.js", "js/cards.js", "js/diagrams.js", "js/trainer.js", "js/quiz.js", "js/sheets.js", "js/methods.js", "js/gfx.js", "js/sims.js", "js/sims2.js", "js/sims3.js", "js/sims4.js", "js/calculator.js", "js/app.js",
  "vendor/katex/katex.min.css", "vendor/katex/katex.min.js", "vendor/katex/auto-render.min.js",
  "icon.svg", "manifest.webmanifest"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
