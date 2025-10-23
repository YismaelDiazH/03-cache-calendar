// Actualizamos las versiones del caché para forzar la actualización
const APP_SHELL_CACHE = 'app-shell-v3';
const DYNAMIC_CACHE = 'dynamic-cache-v3';

// Archivos del App Shell (los mismos 5 archivos + la raíz)
const ASSETS_APP_SHELL = [
    './',
    './index.html',
    './CalendarPage.html',
    './FormPage.html',
    './Estilos.css',
    './main.js',
    './manifest.json', // <-- Agregado
    './images/icons/icon-192x192.png', // <-- Agregado
    './images/icons/icon-512x512.png', // <-- Agregado
    './images/icons/apple-touch-icon-180x180.png' // <-- Agregado
];

// --- FASE DE INSTALACIÓN ---
// Guarda el App Shell en el caché estático
self.addEventListener('install', event => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
        .then(cache => {
            console.log('[SW] Guardando en caché el App Shell:', ASSETS_APP_SHELL);
            // .addAll() falla si una sola petición falla.
            return cache.addAll(ASSETS_APP_SHELL);
        })
    );
});

// --- FASE DE ACTIVACIÓN ---
// Limpia cachés antiguos
self.addEventListener('activate', event => {
    console.log('[SW] Activado.');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                // Filtramos los cachés que no sean los actuales
                .filter(key => key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE)
                // Borramos los cachés viejos (como v1, v2)
                .map(key => {
                    console.log(`[SW] Borrando caché antiguo: ${key}`);
                    return caches.delete(key);
                })
            );
        })
    );
});

// --- FASE DE FETCH ---
// Implementa la estrategia "Cache First, Network Fallback"
self.addEventListener('fetch', event => {
    event.respondWith(
        // 1. INTENTAR: Buscar el recurso en TODAS las cachés
        caches.match(event.request)
        .then(response => {
            // 2. ÉXITO: Si se encuentra en caché (Cache Hit), lo devolvemos inmediatamente.
            if (response) {
                console.log(`[Cache] Devolviendo ${event.request.url}`);
                return response;
            }

            // 3. FALLA (Cache Miss): Si no está en caché, vamos a la red.
            console.log(`[Red] Buscando en la red ${event.request.url}`);
            return fetch(event.request)
                .then(networkResponse => {
                    // 4. ÉXITO DE RED: Clonamos la respuesta.
                    const responseToCache = networkResponse.clone();

                    // 5. CACHEO: Abrimos la caché DINÁMICA
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            
                            // ----- ¡LA CORRECCIÓN ESTÁ AQUÍ! -----
                            // Solo guardamos peticiones GET.
                            // Ya NO comprobamos 'networkResponse.status === 200'.
                            // Esto permite guardar respuestas 'opaque' (status 0) de CDNs.
                            if (event.request.method === 'GET') {
                                console.log(`[Cache] Guardando en caché dinámico ${event.request.url}`);
                                cache.put(event.request, responseToCache);
                            }
                            // ------------------------------------
                            
                        });
                    
                    // 6. DEVOLVER: Devolvemos la respuesta de la red al navegador.
                    return networkResponse;
                })
                .catch(() => {
                    // 7. FALLA TOTAL: Tanto caché como red fallaron.
                    console.error(`[Error] Falló la caché y la red para ${event.request.url}`);
                    // Aquí podrías devolver una respuesta de fallback genérica si quisieras
                    // return new Response("<h1>Sin conexión</h1><p>No se pudo cargar el recurso.</p>", { headers: { 'Content-Type': 'text/html' } });
                });
        })
    );
});