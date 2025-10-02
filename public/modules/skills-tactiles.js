/**
 * @fileoverview Botones de skills táctiles para móvil
 * Crea botones pequeños y semitransparentes cerca del joystick izquierdo
 */

class MobileSkillButtons {
    constructor() {
        console.log('[MobileSkillButtons] Creando botones de skills táctiles...');
        this.skillButtons = [];
        this.init();
    }

    init() {
        this.createSkillButtonsContainer();
        this.createSkillButtons();
        this.setupEventListeners();
    }

    createSkillButtonsContainer() {
        const container = document.createElement('div');
        container.id = 'mobile-skills-container';
        container.className = 'mobile-skills-container';
        document.body.appendChild(container);
        this.container = container;
    }

    createSkillButtons() {
        if (!window.game || !window.game.skills) {
            console.warn('[MobileSkillButtons] window.game.skills no disponible aún');
            // Reintentar después de un momento
            setTimeout(() => this.createSkillButtons(), 100);
            return;
        }

        const skillKeys = window.game.skillKeyMap || ['q', 'e', 'r', 't', 'f'];

        skillKeys.forEach((key, index) => {
            const skill = window.game.skills[key];
            if (!skill) return;

            const button = document.createElement('div');
            button.id = `mobile-skill-${key}`;
            button.className = 'mobile-skill-button';
            button.dataset.skillKey = key;

            // Icono del skill
            const icon = document.createElement('div');
            icon.className = 'mobile-skill-icon';
            icon.textContent = skill.icon;

            // Tecla/nombre
            const label = document.createElement('div');
            label.className = 'mobile-skill-label';
            label.textContent = key.toUpperCase();

            // Cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'mobile-skill-cooldown-overlay';
            cooldownOverlay.style.display = 'none';

            // Cooldown text
            const cooldownText = document.createElement('div');
            cooldownText.className = 'mobile-skill-cooldown-text';
            cooldownText.style.display = 'none';

            button.appendChild(cooldownOverlay);
            button.appendChild(icon);
            button.appendChild(label);
            button.appendChild(cooldownText);

            this.container.appendChild(button);
            this.skillButtons.push({ button, key, cooldownOverlay, cooldownText });
        });
    }

    setupEventListeners() {
        this.skillButtons.forEach(({ button, key }) => {
            // Touch events
            button.addEventListener('touchstart', (e) => this.handleSkillTouch(e, key), { passive: false });

            // Mouse events para testing en desktop
            button.addEventListener('click', (e) => this.handleSkillClick(e, key), false);
        });

        // Actualizar cooldowns periódicamente
        this.updateInterval = setInterval(() => this.updateCooldowns(), 100);
    }

    handleSkillTouch(event, key) {
        event.preventDefault();
        event.stopPropagation();
        this.activateSkill(key);
    }

    handleSkillClick(event, key) {
        event.preventDefault();
        event.stopPropagation();
        this.activateSkill(key);
    }

    activateSkill(key) {
        if (!window.game) return;

        const skill = window.game.skills[key];
        if (!skill || skill.cooldown > 0) return;

        // Simular presión de tecla para activar el skill
        const keyEvent = new KeyboardEvent('keydown', {
            key: key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true
        });
        document.dispatchEvent(keyEvent);

        // Feedback visual
        const button = this.skillButtons.find(sb => sb.key === key);
        if (button) {
            button.button.classList.add('skill-active');
            setTimeout(() => button.button.classList.remove('skill-active'), 200);
        }

        console.log(`[MobileSkillButtons] Skill ${key.toUpperCase()} activado`);
    }

    updateCooldowns() {
        if (!window.game || !window.game.skills) return;

        this.skillButtons.forEach(({ key, button, cooldownOverlay, cooldownText }) => {
            const skill = window.game.skills[key];
            if (!skill) return;

            if (skill.cooldown > 0) {
                // Mostrar cooldown
                const seconds = (skill.cooldown / 1000).toFixed(1);
                cooldownText.textContent = `${seconds}s`;
                cooldownText.style.display = 'block';
                cooldownOverlay.style.display = 'block';
                button.classList.add('on-cooldown');

                // Calcular porcentaje para overlay
                const percentage = (skill.cooldown / skill.maxCooldown) * 100;
                cooldownOverlay.style.height = `${percentage}%`;
            } else {
                // Ocultar cooldown
                cooldownText.style.display = 'none';
                cooldownOverlay.style.display = 'none';
                button.classList.remove('on-cooldown');
            }
        });
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}
