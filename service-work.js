const CACHE_NAME = 'aimealo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/bootstrap/css/bootstrap-grid.min.css',
  '/assets/bootstrap/css/bootstrap-reboot.min.css',
  '/assets/theme/css/style.css',
  '/assets/mobirise/css/mbr-additional.css?v=ozQKJX',
  '/assets/images/mbr.png',
  '/assets/bootstrap/js/bootstrap.bundle.min.js',
  '/assets/theme/js/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});