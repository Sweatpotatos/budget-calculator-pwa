const CACHE_NAME = 'budget-cache-v2';
const urlsToCache = [
    '/',  // Will cache index.html
    '/index.html',
    '/styles.css',
    '/bundle.js',
    '/manifest.json',
    // If using external resources, add their full URLs:
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});