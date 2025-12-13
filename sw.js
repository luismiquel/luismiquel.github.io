self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) {}

    try {
      await self.registration.unregister();
    } catch (e) {}

    // Toma control para que el “apagador” aplique ya
    try {
      await self.clients.claim();
    } catch (e) {}
  })());
});

// No intercepta nada: deja pasar toda la red
self.addEventListener("fetch", () => {});
