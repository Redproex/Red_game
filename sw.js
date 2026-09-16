const CACHE_NAME = "redpro-archives-v3";

const BASE = "/Red_game/";

const FILES_TO_CACHE = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icon-192-1.png",
  BASE + "icon-512-1.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});


self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (!response || response.status !== 200) {
          return response;
        }

        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => {

            if (cached) {
              return cached;
            }

            return caches.match(BASE);
          });
      })
  );

});
