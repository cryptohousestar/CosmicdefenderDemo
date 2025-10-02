/**
 * @fileoverview Este archivo actúa como un puente entre los módulos de UI desacoplados
 * y la instancia principal del juego (window.game). Escucha eventos personalizados
 * y los traduce en acciones directas sobre el estado del juego.
 */

document.addEventListener('mobile-input', (event) => {
    if (!window.game) {
        console.warn('Puente de entrada: Se recibió un evento, pero window.game no está disponible.');
        return;
    }

    const { type, payload } = event.detail;
    const game = window.game;

    // Asegurar que las propiedades existan en el objeto game
    if (!game.touchAim) game.touchAim = {};
    if (!game.keys) game.keys = {};

    switch (type) {
        case 'move':
            handleMove(game, payload);
            break;
        case 'aim':
            handleAim(game, payload);
            break;
        case 'fire':
            handleFire(game, payload);
            break;
        default:
            // No hacer nada para tipos de eventos desconocidos
            break;
    }
});

/**
 * Traduce el ángulo y la distancia de un joystick de movimiento a pulsaciones de teclas virtuales en el juego.
 * @param {object} game La instancia del juego.
 * @param {object} payload El contenido del evento con { angle, distance }.
 */
function handleMove(game, payload) {
    // Resetea las teclas de movimiento vertical
    game.keys['w'] = false;
    game.keys['s'] = false;
    game.keys['a'] = false; // Ignoramos el strafe
    game.keys['d'] = false; // Ignoramos el strafe

    if (payload.distance < 20) return; // Zona muerta un poco más grande

    const degrees = payload.angle * 180 / Math.PI;

    // Si el joystick se mueve principalmente hacia ARRIBA (-45 a -135 grados)
    if (degrees > -135 && degrees < -45) {
        game.keys['w'] = true; // Activa la tecla para ir ADELANTE
    }
    // Si el joystick se mueve principalmente hacia ABAJO (45 a 135 grados)
    else if (degrees > 45 && degrees < 135) {
        game.keys['s'] = true; // Activa la tecla para ir ATRÁS
    }
}

/**
 * Actualiza el estado del apuntado táctil en el juego.
 * @param {object} game La instancia del juego.
 * @param {object} payload El contenido del evento con { angle, distance }.
 */
function handleAim(game, payload) {
    game.mouse.clicked = true; // Añadido para disparo automático
    if (payload.distance > 10) { // Zona muerta
        game.touchAim.active = true;
        game.touchAim.angle = payload.angle;
    } else {
        game.touchAim.active = false;
    }
}

/**
 * Actualiza el estado del disparo táctil en el juego.
 * @param {object} game La instancia del juego.
 * @param {object} payload El contenido del evento con { active }.
 */
function handleFire(game, payload) {
    game.mouse.clicked = payload.active;
}
