// Service Worker for Movie Recommendation System
const CACHE_NAME = 'movie-recommendation-system-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.error('Error caching static assets:', err))
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
});

// Helper function to determine if a request should be cached
function shouldCache(url) {
  // Cache images, CSS, and JS files
  if (
    url.includes('/assets/') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.webp') ||
    url.endsWith('.svg') ||
    url.endsWith('.css') ||
    url.endsWith('.js')
  ) {
    return true;
  }
  return false;
}

// Fetch event - network first with cache fallback for API requests
// Cache first with network fallback for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // For API requests, use network first strategy
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request);
        })
    );
    return;
  }

  // For static assets, use cache first strategy
  if (shouldCache(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, networkResponse.clone());
                  });
              })
              .catch(() => {
                // Silently fail if background update fails
              });
              
            return cachedResponse;
          }
          
          // If not in cache, fetch from network and cache
          return fetch(request)
            .then((response) => {
              // Cache the fetched response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
                
              return response;
            });
        })
    );
    return;
  }

  // For other requests, use network first strategy
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
}); 