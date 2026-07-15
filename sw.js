const CACHE_NAME = "aerosky-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./assets/icon.svg"
];

// Install Event
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  // Let API requests go directly to network, fallback with custom error on failure
  if (url.includes("open-meteo.com")) {
    e.respondWith(
      fetch(e.request).catch(() => {
        return new Response(JSON.stringify({ error: "offline", message: "Network unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Standard static assets: cache-first with network fallback & background update (stale-while-revalidate)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fetch fails, silently consume error and use cache
        });

      return cachedResponse || fetchPromise;
    })
  );
});
