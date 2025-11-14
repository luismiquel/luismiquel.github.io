const CACHE_NAME = "lm-portafolio-v1";
const OFFLINE_URL = "offline.html";

// Archivos a cachear
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./about.html",
  "./apps.html",
  "./why.html",
  "./certificates.html",
  "./contact.html",
  "./offline.html",
  "./logo-lm.png",
  "./assets/Certificados_Luismi_Con_Portada.pdf",
  "./assets/aws-knowledge-aws-for-games-cloud-game-development.png",
  "./assets/aws-knowledge-cloud-essentials.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

// Instalación: cachear recursos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: Network First para navegación, Cache First para estáticos
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegación (HTML / rutas de páginas)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Estáticos: Cache First
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => cached || undefined);
    })
  );
});
