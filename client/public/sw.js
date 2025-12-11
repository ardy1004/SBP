// Service Worker for Salam Bumi Property
// Implements caching strategies for optimal performance

const CACHE_NAME = 'salam-bumi-v1.0.0';
const STATIC_CACHE = 'salam-bumi-static-v1.0.0';
const IMAGE_CACHE = 'salam-bumi-images-v1.0.0';
const API_CACHE = 'salam-bumi-api-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/index.html',
  '/assets/index-*.js',
  '/assets/index-*.css',
  '/assets/vendor-*.js',
  '/assets/vendor-*.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');

  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE &&
                cacheName !== IMAGE_CACHE &&
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (except allowed domains)
  if (!url.origin.includes('salambumi.xyz') &&
      !url.origin.includes('localhost') &&
      !url.origin.includes('imagedelivery.net')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy for API requests
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Tidak dapat terhubung ke server'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-while-revalidate strategy for HTML pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  return pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.ttf') ||
         pathname.includes('/static/') ||
         pathname.includes('/assets/') ||
         pathname === '/manifest.json' ||
         pathname === '/index.html';
}

function isImage(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ||
         url.hostname.includes('imagedelivery.net') ||
         url.hostname.includes('salambumi.xyz') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('salambumi.xyz') ||
         url.hostname.includes('supabase.co');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Performing background sync...');
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.url
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  console.log('Service Worker: Periodic content sync');
  // Implement content synchronization logic
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});