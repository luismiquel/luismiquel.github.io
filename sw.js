const CACHE_NAME = "lm-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Archivos a cachear (añade/quita según tu repo)
const ASSETS = [
  "/", "/index.html", "/style.css",
  "/about.html", "/apps.html", "/why.html",
  "/certificates.html", "/contact.html",
  "/assets/Certificados_Luismi_Con_Portada.pdf",
  "/assets/aws-knowledge-aws-for-games-cloud-game-development.png",
  "/assets/aws-knowledge-cloud-essentials.png",
  "/assets/icons/icon-192.png", "/assets/icons/icon-512.png",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Estrategia: Network First para HTML, Cache First para estáticos
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isHTML = req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Cache First para CSS/JS/IMG/PDF
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        return res;
      }).catch(() => cached) // si falla red, intenta caché
    )
  );
});
