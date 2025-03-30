const CACHE_NAME = 'budget-cache-v2';
const urlsToCache = [
    '/index.html',
    '/src/styles.css',
    '/src/app.js',
    '/src/budgetCalculator.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});