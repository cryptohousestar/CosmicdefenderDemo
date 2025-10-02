/**
 * Service Worker Mínimo (No-Op)
 * ----------------------------------
 * Este service worker está intencionalmente casi vacío.
 * Su único propósito es existir para que el navegador active la funcionalidad de "Añadir a Pantalla de Inicio" (PWA).
 * NO intercepta peticiones de red ni guarda archivos en caché. El juego seguirá requiriendo conexión al servidor.
 */

self.addEventListener('install', (event) => {
  // No hacer nada aquí. El service worker se instalará y activará inmediatamente.
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // No hacer nada con las peticiones de red. El navegador las manejará de forma normal.
  return;
});
