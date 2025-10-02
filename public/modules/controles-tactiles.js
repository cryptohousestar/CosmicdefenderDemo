class TouchControls {
    constructor() {
        console.log('[TouchControls] Creando instancia de controles táctiles...');
        this.moveJoystick = null;
        this.aimJoystick = null;
        this.activeJoystick = null;
        this.init();
    }

    init() {
        this.createMoveJoystick();
        this.createAimJoystick();
        this.setupEventListeners();
    }

    createMoveJoystick() {
        const container = document.createElement('div');
        container.id = 'move-joystick-container';
        container.className = 'hud-zone hud-joystick movement-zone';
        document.body.appendChild(container);

        const knob = document.createElement('div');
        knob.id = 'move-joystick-knob';
        knob.className = 'joystick-knob';
        container.appendChild(knob);

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
        container.className = 'hud-zone hud-joystick';
        document.body.appendChild(container);

        const knob = document.createElement('div');
        knob.id = 'aim-joystick-knob';
        knob.className = 'joystick-knob';
        container.appendChild(knob);

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
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

        this.moveJoystick.container.addEventListener('mousedown', (e) => this.handleMouseDown(e, this.moveJoystick), false);
        this.aimJoystick.container.addEventListener('mousedown', (e) => this.handleMouseDown(e, this.aimJoystick), false);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    }

    handleMouseDown(event, joystick) {
        event.preventDefault();
        this.activeJoystick = joystick;
        joystick.active = true;
        joystick.container.classList.add('active');
        const rect = joystick.container.getBoundingClientRect();
        joystick.center.x = rect.left + rect.width / 2;
        joystick.center.y = rect.top + rect.height / 2;

        if (joystick.type === 'aim') {
            document.dispatchEvent(new CustomEvent('mobile-input', { detail: { type: 'fire', payload: { active: true } } }));
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
            document.dispatchEvent(new CustomEvent('mobile-input', { detail: { type: 'fire', payload: { active: false } } }));
        }

        this.activeJoystick.active = false;
        this.activeJoystick.container.classList.remove('active');
        this.activeJoystick.knob.style.transform = 'translate(-50%, -50%)';
        this.activeJoystick = null;
    }

    handleTouchStart(event) {
        let isJoystickTouch = false;
        for (const touch of event.changedTouches) {
            const moveRect = this.moveJoystick.container.getBoundingClientRect();
            if (touch.clientX >= moveRect.left && touch.clientX <= moveRect.right &&
                touch.clientY >= moveRect.top && touch.clientY <= moveRect.bottom) {
                this.moveJoystick.active = true;
                this.moveJoystick.touchId = touch.identifier;
                this.moveJoystick.container.classList.add('active');
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
                this.aimJoystick.container.classList.add('active');
                const rect = this.aimJoystick.container.getBoundingClientRect();
                this.aimJoystick.center.x = rect.left + rect.width / 2;
                this.aimJoystick.center.y = rect.top + rect.height / 2;
                document.dispatchEvent(new CustomEvent('mobile-input', { detail: { type: 'fire', payload: { active: true } } }));
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
        for (const touch of event.changedTouches) {
            if (this.moveJoystick.active && touch.identifier === this.moveJoystick.touchId) {
                this.moveJoystick.active = false;
                this.moveJoystick.touchId = null;
                this.moveJoystick.container.classList.remove('active');
                this.moveJoystick.container.classList.remove('movement-zone');
                this.moveJoystick.knob.style.transform = 'translate(-50%, -50%)';
                this.resetGameKeys();
            }
            if (this.aimJoystick.active && touch.identifier === this.aimJoystick.touchId) {
                this.aimJoystick.active = false;
                this.aimJoystick.touchId = null;
                this.aimJoystick.container.classList.remove('active');
                this.aimJoystick.knob.style.transform = 'translate(-50%, -50%)';
                document.dispatchEvent(new CustomEvent('mobile-input', { detail: { type: 'fire', payload: { active: false } } }));
            }
        }
    }

    updateJoystick(joystick, pointer, callback) {
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

        if (joystick.type === 'move') {
            const ROTATION_ZONE = 0.5;
            if (distance / maxDistance > ROTATION_ZONE) {
                joystick.container.classList.add('movement-zone');
            } else {
                joystick.container.classList.remove('movement-zone');
            }
        }

        callback(angle, distance);
    }

    updateGameKeys(angle, distance) {
        const moveEvent = new CustomEvent('mobile-input', {
            detail: { type: 'move', payload: { angle, distance } }
        });
        document.dispatchEvent(moveEvent);
    }

    resetGameKeys() {
        const moveEvent = new CustomEvent('mobile-input', {
            detail: { type: 'move', payload: { angle: 0, distance: 0 } }
        });
        document.dispatchEvent(moveEvent);
    }

    updateAim(angle, distance) {
        const aimEvent = new CustomEvent('mobile-input', {
            detail: { type: 'aim', payload: { angle, distance } }
        });
        document.dispatchEvent(aimEvent);
    }
}