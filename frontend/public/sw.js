const CACHE_NAME = 'satyalabel-cache-v1';

const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/upload',
  '/history',
  '/rules',
  '/manifest.json',
  '/icon.svg',
  '/globals.css'
];

// Install event: Cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network first, fallback to cache for navigation and assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests unless they are specific APIs we want to cache
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('satyalabel-backend')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone and cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      })
  );
});
