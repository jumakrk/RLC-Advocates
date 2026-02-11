const CACHE_NAME = 'rlc-advocates-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/shared/css/global.css',
    '/homepage/homepage.css',
    '/shared/js/global.js',
    '/Images/rlc-small-logo.png',
    '/Images/rlc-favicon.png',
    '/Images/rlc-white-logo.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Activate new service worker immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // For HTML, JS, and CSS files: use network-first strategy
    // This ensures code updates are always picked up
    if (event.request.url.match(/\.(html|js|css)$/i) || event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache the fresh response
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, fall back to cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For images and other assets: use cache-first strategy for performance
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request.clone()).then(
                    (response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
