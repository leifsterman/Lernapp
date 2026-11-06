/* Offline-Cache für die Haupt-App (mit allen Themen) und den zusätzlichen Entladungs-Lernweg. */
const CACHE = "physikq1-v27";
const ASSETS = ["./", "./index.html", "./entladung.html", "./icon.svg", "./manifest.webmanifest"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request);
    const online = () => fetch(e.request).then(r => {
      if (r.ok) cache.put(e.request, r.clone());
      return r;
    });
    // HTML-Navigation bevorzugt den aktuellen Stand; sonst bleibt bei jeder
    // ersten Aktualisierung eine veraltete Simulation aus dem Cache sichtbar.
    if (e.request.mode === "navigate") {
      return online().catch(() => hit || Response.error());
    }
    // Statische Dateien können für schnelle Offline-Nutzung im Cache bleiben.
    if (hit) { online().catch(() => {}); return hit; }
    return online().catch(() => Response.error());
  }));
});
