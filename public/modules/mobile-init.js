/**
 * @fileoverview Punto de entrada principal para toda la lógica específica de la versión móvil.
 * Se encarga de cargar y orquestar los diferentes módulos móviles.
 */

console.log('[Móvil-Init] Script de inicialización cargado.');

// Configuración central para los módulos móviles
const MOBILE_MODULES = [
    'modules/input-bridge.js',
    'modules/controles-tactiles.js',
    'modules/skills-tactiles.js'
];

/**
 * Carga dinámicamente un script en el DOM.
 * @param {string} path La ruta al script a cargar.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el script ha cargado.
 */
function loadModule(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Error al cargar el módulo: ${path}`));
        document.head.appendChild(script);
    });
}

/**
 * Registra el Service Worker para la funcionalidad PWA.
 * Se ejecuta después de que la app principal se ha cargado para no interferir.
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw-movil.js').then(registration => {
                console.log('[Móvil-Init] Service Worker registrado con éxito:', registration);
            }).catch(error => {
                console.log('[Móvil-Init] Fallo en el registro del Service Worker:', error);
            });
        });
    }
}

/**
 * Función principal de inicialización móvil.
 * Espera a que el juego base (window.game) esté listo y luego carga todos los módulos móviles.
 */
async function initializeMobileExperience() {
    console.log('[Móvil-Init] Esperando a que la instancia del juego esté lista...');

    const waitForGame = new Promise(resolve => {
        const interval = setInterval(() => {
            if (window.game) {
                clearInterval(interval);
                console.log('[Móvil-Init] ¡Instancia del juego detectada!');
                resolve();
            }
        }, 100);
    });

    await waitForGame;

    console.log(`[Móvil-Init] Cargando ${MOBILE_MODULES.length} módulos móviles...`);

    try {
        for (const modulePath of MOBILE_MODULES) {
            await loadModule(modulePath);
            console.log(`[Móvil-Init] Módulo cargado: ${modulePath}`);
        }
        console.log('[Móvil-Init] Todos los módulos móviles se han cargado.');

        // Ahora que todos los scripts están cargados, inicializamos los controles.
        new TouchControls();

        // Inicializar botones de skills móviles
        new MobileSkillButtons();

        // Finalmente, registramos el Service Worker para la funcionalidad PWA.
        registerServiceWorker();

    } catch (error) {
        console.error('[Móvil-Init] Fallo crítico al cargar un módulo móvil:', error);
    }
}

// Iniciar el proceso de inicialización móvil tan pronto como el DOM esté listo.
document.addEventListener('DOMContentLoaded', initializeMobileExperience);
