const APP_SHELL_CACHE = 'app-shell-v3';
const DYNAMIC_CACHE = 'dynamic-cache-v3';

const ASSETS_APP_SHELL = [
    './',
    './index.html',
    './CalendarPage.html',
    './FormPage.html',
    './Estilos.css',
    './main.js',
    './manifest.json', 
    './images/icons/icon-192x192.png', 
    './images/icons/icon-512x512.png', 
    './images/icons/apple-touch-icon-180x180.png'
];

self.addEventListener('install', event => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
        .then(cache => {
            console.log('[SW] Guardando en caché el App Shell:', ASSETS_APP_SHELL);
            return cache.addAll(ASSETS_APP_SHELL);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activado.');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE)
                .map(key => {
                    console.log(`[SW] Borrando caché antiguo: ${key}`);
                    return caches.delete(key);
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                console.log(`[Cache] Devolviendo ${event.request.url}`);
                return response;
            }

            console.log(`[Red] Buscando en la red ${event.request.url}`);
            return fetch(event.request)
                .then(networkResponse => {
                    const responseToCache = networkResponse.clone();

                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            
                            if (event.request.method === 'GET') {
                                console.log(`[Cache] Guardando en caché dinámico ${event.request.url}`);
                                cache.put(event.request, responseToCache);
                            }
                            
                        });
                    
                    return networkResponse;
                })
                .catch(() => {
                    console.error(`[Error] Falló la caché y la red para ${event.request.url}`);
                 });
        })
    );
});