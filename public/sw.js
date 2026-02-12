const CACHE_NAME = "focus-flow-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo.png",
  "/logo-192.png",
  "/logo-180.png",
  "/favicon.ico",
  "/favicon-32.png",
  "/offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// SPA offline: for navigations, serve cached index.html when offline
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedIndex = await caches.match("/index.html");
        return cachedIndex || (await caches.match("/offline.html"));
      })
    );
    return;
  }

  // For other requests: cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for JS/CSS assets
        if (response.ok && event.request.url.match(/\.(js|css|woff2?|png|svg|ico)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response("Offline", { status: 503 }));
    })
  );
});

// Notification click: open/focus app and route to payload URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        // Focus existing client and navigate
        if ("focus" in client) {
          await client.focus();
        }
        if ("navigate" in client) {
          try {
            await client.navigate(url);
            return;
          } catch {
            // fallback to openWindow
          }
        }
      }
      await clients.openWindow(url);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});
