// Nombre de la caché (cámbialo a v2, v3... cuando hagas cambios grandes)
const CACHE_NAME = "lm-portfolio-v1";

// Archivos que se precachean para funcionar incluso con mala conexión
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./about.html",
  "./apps.html",
  "./why.html",
  "./certificates.html",
  "./contact.html",
  "./manifest.webmanifest"
];

// Instalación: se abre la caché y se guardan los archivos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activación: limpia cachés antiguas que ya no se usen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch: intenta primero la red y, si falla, usa la caché
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Solo manejamos peticiones GET
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, la guardamos en caché para futuras visitas
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si no hay red, intentamos devolver lo que tengamos en caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si no está en caché y la petición es a la raíz, devolvemos index.html
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }

          // Si no hay nada mejor, dejamos que falle
          return Promise.reject("No hay respuesta en caché y no hay red.");
        });
      })
  );
});
