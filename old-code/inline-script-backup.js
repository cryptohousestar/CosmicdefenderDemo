
// touch-controls.js

class TouchControls {
    constructor(game) {
        this.game = game;
        this.moveJoystick = null;
        this.aimJoystick = null;
        this.activeJoystick = null; // To track which joystick is being moved by the mouse
        this.init();
    }

    init() {
        this.createMoveJoystick();
        this.createAimJoystick();
        this.setupEventListeners();
        this.game.touchAim = { angle: 0, active: false }; // Initialize touch aim object
    }

    createMoveJoystick() {
        const container = document.createElement('div');
        container.id = 'move-joystick-container';
        container.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50px;
            width: 150px;
            height: 150px;
            background: rgba(128, 128, 128, 0.3);
            border-radius: 50%;
            z-index: 10001;
        `;

        const knob = document.createElement('div');
        knob.id = 'move-joystick-knob';
        knob.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
        `;

        container.appendChild(knob);
        document.body.appendChild(container);

        this.moveJoystick = {
            container: container,
            knob: knob,
            active: false,
            touchId: null,
            center: { x: 0, y: 0 },
            position: { x: 0, y: 0 },
            type: 'move'
        };
    }

    createAimJoystick() {
        const container = document.createElement('div');
        container.id = 'aim-joystick-container';
        container.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 50px;
            width: 120px;
            height: 120px;
            background: rgba(128, 128, 128, 0.3);
            border-radius: 50%;
            z-index: 10001;
        `;

        const knob = document.createElement('div');
        knob.id = 'aim-joystick-knob';
        knob.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 80, 80, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
        `;

        container.appendChild(knob);
        document.body.appendChild(container);

        this.aimJoystick = {
            container: container,
            knob: knob,
            active: false,
            touchId: null,
            center: { x: 0, y: 0 },
            position: { x: 0, y: 0 },
            type: 'aim'
        };
    }

    setupEventListeners() {
        // Touch events
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

        // Mouse events
        this.moveJoystick.container.addEventListener('mousedown', (e) => this.handleMouseDown(e, this.moveJoystick), false);
        this.aimJoystick.container.addEventListener('mousedown', (e) => this.handleMouseDown(e, this.aimJoystick), false);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    }

    // --- Mouse Event Handlers ---
    handleMouseDown(event, joystick) {
        event.preventDefault();
        this.activeJoystick = joystick;
        joystick.active = true;
        const rect = joystick.container.getBoundingClientRect();
        joystick.center.x = rect.left + rect.width / 2;
        joystick.center.y = rect.top + rect.height / 2;

        if (joystick.type === 'aim') {
            this.game.mouse.clicked = true;
        }
    }

    handleMouseMove(event) {
        if (!this.activeJoystick || !this.activeJoystick.active) return;
        event.preventDefault();

        const callback = this.activeJoystick.type === 'move' ? this.updateGameKeys.bind(this) : this.updateAim.bind(this);
        this.updateJoystick(this.activeJoystick, event, callback);
    }

    handleMouseUp(event) {
        if (!this.activeJoystick) return;
        event.preventDefault();

        if (this.activeJoystick.type === 'move') {
            this.resetGameKeys();
        } else if (this.activeJoystick.type === 'aim') {
            this.game.mouse.clicked = false;
            this.game.touchAim.active = false;
        }

        this.activeJoystick.active = false;
        this.activeJoystick.knob.style.transform = 'translate(-50%, -50%)';
        this.activeJoystick = null;
    }


    // --- Touch Event Handlers ---
    handleTouchStart(event) {
        let isJoystickTouch = false;
        for (const touch of event.changedTouches) {
            const moveRect = this.moveJoystick.container.getBoundingClientRect();
            if (touch.clientX >= moveRect.left && touch.clientX <= moveRect.right &&
                touch.clientY >= moveRect.top && touch.clientY <= moveRect.bottom) {
                this.moveJoystick.active = true;
                this.moveJoystick.touchId = touch.identifier;
                const rect = this.moveJoystick.container.getBoundingClientRect();
                this.moveJoystick.center.x = rect.left + rect.width / 2;
                this.moveJoystick.center.y = rect.top + rect.height / 2;
                isJoystickTouch = true;
            }

            const aimRect = this.aimJoystick.container.getBoundingClientRect();
            if (touch.clientX >= aimRect.left && touch.clientX <= aimRect.right &&
                touch.clientY >= aimRect.top && touch.clientY <= aimRect.bottom) {
                this.aimJoystick.active = true;
                this.aimJoystick.touchId = touch.identifier;
                const rect = this.aimJoystick.container.getBoundingClientRect();
                this.aimJoystick.center.x = rect.left + rect.width / 2;
                this.aimJoystick.center.y = rect.top + rect.height / 2;
                this.game.mouse.clicked = true;
                isJoystickTouch = true;
            }
        }
        if (isJoystickTouch) {
            event.preventDefault();
        }
    }

    handleTouchMove(event) {
        let isJoystickMove = false;
        for (const touch of event.changedTouches) {
            if ((this.moveJoystick.active && touch.identifier === this.moveJoystick.touchId) ||
                (this.aimJoystick.active && touch.identifier === this.aimJoystick.touchId)) {
                isJoystickMove = true;
                break;
            }
        }

        if (isJoystickMove) {
            event.preventDefault();
            for (const touch of event.changedTouches) {
                if (this.moveJoystick.active && touch.identifier === this.moveJoystick.touchId) {
                    this.updateJoystick(this.moveJoystick, touch, this.updateGameKeys.bind(this));
                }
                if (this.aimJoystick.active && touch.identifier === this.aimJoystick.touchId) {
                    this.updateJoystick(this.aimJoystick, touch, this.updateAim.bind(this));
                }
            }
        }
    }

    handleTouchEnd(event) {
        // We don't prevent default here to allow clicks to register
        for (const touch of event.changedTouches) {
            if (this.moveJoystick.active && touch.identifier === this.moveJoystick.touchId) {
                this.moveJoystick.active = false;
                this.moveJoystick.touchId = null;
                this.moveJoystick.knob.style.transform = 'translate(-50%, -50%)';
                this.resetGameKeys();
            }
            if (this.aimJoystick.active && touch.identifier === this.aimJoystick.touchId) {
                this.aimJoystick.active = false;
                this.aimJoystick.touchId = null;
                this.aimJoystick.knob.style.transform = 'translate(-50%, -50%)';
                this.game.mouse.clicked = false;
                this.game.touchAim.active = false;
            }
        }
    }

    // --- Universal Update Logic ---
    updateJoystick(joystick, pointer, callback) { // pointer can be a touch or a mouse event
        const dx = pointer.clientX - joystick.center.x;
        const dy = pointer.clientY - joystick.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = joystick.container.offsetWidth / 2;
        const angle = Math.atan2(dy, dx);

        let newX, newY;
        if (distance > maxDistance) {
            newX = Math.cos(angle) * maxDistance;
            newY = Math.sin(angle) * maxDistance;
        } else {
            newX = dx;
            newY = dy;
        }

        joystick.knob.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
        callback(angle, distance);
    }

    updateGameKeys(angle, distance) {
        this.resetGameKeys();
        if (distance < 10) return; // Dead zone

        const degrees = angle * 180 / Math.PI;

        if (degrees > -112.5 && degrees <= -67.5) this.game.keys['w'] = true;
        else if (degrees > -67.5 && degrees <= -22.5) { this.game.keys['w'] = true; this.game.keys['d'] = true; }
        else if (degrees > -22.5 && degrees <= 22.5) this.game.keys['d'] = true;
        else if (degrees > 22.5 && degrees <= 67.5) { this.game.keys['s'] = true; this.game.keys['d'] = true; }
        else if (degrees > 67.5 && degrees <= 112.5) this.game.keys['s'] = true;
        else if (degrees > 112.5 && degrees <= 157.5) { this.game.keys['s'] = true; this.game.keys['a'] = true; }
        else if (degrees > 157.5 || degrees <= -157.5) this.game.keys['a'] = true;
        else if (degrees > -157.5 && degrees <= -112.5) { this.game.keys['w'] = true; this.game.keys['a'] = true; }
    }

    resetGameKeys() {
        this.game.keys['w'] = false;
        this.game.keys['a'] = false;
        this.game.keys['s'] = false;
        this.game.keys['d'] = false;
    }

    updateAim(angle, distance) {
        if (distance > 10) { // Dead zone
            this.game.touchAim.active = true;
            this.game.touchAim.angle = angle;
        } else {
            this.game.touchAim.active = false;
        }
    }
}

// Initialize touch controls when the game is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkGameInterval = setInterval(() => {
        if (window.game) {
            clearInterval(checkGameInterval);
            new TouchControls(window.game);
        }
    }, 100);
});
