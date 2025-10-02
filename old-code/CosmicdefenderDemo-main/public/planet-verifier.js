// Planet Verifier for Cosmic Defender
// Este script verifica que todos los archivos de planetas existan y sean accesibles

class PlanetVerifier {
    constructor() {
        this.planets = [
            { name: 'Mercurio', file: 'mercury.html', icon: '☿' },
            { name: 'Venus', file: 'venus.html', icon: '♀' },
            { name: 'Tierra', file: 'earth.html', icon: '♁' },
            { name: 'Marte', file: 'mars.html', icon: '♂' },
            { name: 'Júpiter', file: 'jupiter.html', icon: '♃' },
            { name: 'Saturno', file: 'saturn.html', icon: '♄' },
            { name: 'Urano', file: 'uranus.html', icon: '♅' },
            { name: 'Neptuno', file: 'neptune.html', icon: '♆' },
            { name: 'Plutón', file: 'pluto.html', icon: '♇' }
        ];
        this.verificationResults = {};
        this.init();
    }

    init() {
        console.log('🔍 Planet Verifier inicializado');
        this.verifyAllPlanets();
        this.createVerificationUI();
    }

    async verifyAllPlanets() {
        console.log('🔍 Verificando archivos de planetas...');
        
        for (const planet of this.planets) {
            try {
                const response = await fetch(planet.file, { method: 'HEAD' });
                this.verificationResults[planet.name] = {
                    exists: response.ok,
                    status: response.status,
                    statusText: response.statusText
                };
                console.log(`${planet.icon} ${planet.name}: ${response.ok ? '✅ OK' : '❌ Error'}`);
            } catch (error) {
                this.verificationResults[planet.name] = {
                    exists: false,
                    error: error.message
                };
                console.log(`${planet.icon} ${planet.name}: ❌ Error - ${error.message}`);
            }
        }

        this.updateVerificationUI();
        this.logSummary();
    }

    createVerificationUI() {
        const verificationPanel = document.createElement('div');
        verificationPanel.id = 'planetVerificationPanel';
        verificationPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #0066ff;
            border-radius: 10px;
            padding: 15px;
            color: #ffffff;
            font-family: Arial, sans-serif;
            z-index: 10000;
            min-width: 300px;
            max-height: 400px;
            overflow-y: auto;
        `;

        verificationPanel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #0066ff;">🔍 Verificación de Planetas</h3>
            <div id="planetVerificationResults">
                <div style="color: #ccc; font-style: italic;">Verificando...</div>
            </div>
            <div style="margin-top: 10px;">
                <button id="reverifyPlanets" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                    Reverificar
                </button>
                <button id="testPlanetNavigation" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px 10px; margin-left: 5px; border-radius: 5px; cursor: pointer;">
                    Probar Navegación
                </button>
            </div>
        `;

        document.body.appendChild(verificationPanel);

        // Event listeners
        document.getElementById('reverifyPlanets').addEventListener('click', () => {
            this.verifyAllPlanets();
        });

        document.getElementById('testPlanetNavigation').addEventListener('click', () => {
            this.testPlanetNavigation();
        });
    }

    updateVerificationUI() {
        const resultsDiv = document.getElementById('planetVerificationResults');
        if (!resultsDiv) return;

        let html = '';
        for (const planet of this.planets) {
            const result = this.verificationResults[planet.name];
            const status = result.exists ? '✅' : '❌';
            const color = result.exists ? '#00ff00' : '#ff0000';
            
            html += `
                <div style="margin-bottom: 5px; font-size: 12px;">
                    <span style="color: ${color};">${status}</span>
                    <span style="color: #fff;">${planet.icon} ${planet.name}</span>
                    <span style="color: #ccc;">(${planet.file})</span>
                    ${result.exists ? '' : `<span style="color: #ff6666;"> - ${result.error || `Status: ${result.status}`}</span>`}
                </div>
            `;
        }

        resultsDiv.innerHTML = html;
    }

    logSummary() {
        const total = this.planets.length;
        const working = Object.values(this.verificationResults).filter(r => r.exists).length;
        const broken = total - working;

        console.log('📊 Resumen de verificación:');
        console.log(`Total planetas: ${total}`);
        console.log(`✅ Funcionando: ${working}`);
        console.log(`❌ Con problemas: ${broken}`);

        if (broken > 0) {
            console.warn('⚠️ Algunos planetas tienen problemas. Revisa los archivos HTML.');
        } else {
            console.log('🎉 Todos los planetas están funcionando correctamente!');
        }
    }

    testPlanetNavigation() {
        console.log('🧪 Probando navegación a planetas...');
        
        // Probar navegación a un planeta aleatorio que funcione
        const workingPlanets = this.planets.filter(planet => 
            this.verificationResults[planet.name]?.exists
        );

        if (workingPlanets.length === 0) {
            console.error('❌ No hay planetas funcionando para probar');
            return;
        }

        const randomPlanet = workingPlanets[Math.floor(Math.random() * workingPlanets.length)];
        console.log(`🧪 Probando navegación a ${randomPlanet.name}...`);

        // Simular click en un portal de ese planeta
        if (window.game && window.game.planetPortals) {
            const targetPortal = window.game.planetPortals.find(p => p.planet === randomPlanet.file.replace('.html', ''));
            if (targetPortal) {
                console.log(`🎯 Simulando click en portal de ${targetPortal.name}`);
                window.game.mouse.clicked = true;
                window.game.mouse.x = window.game.worldToScreen(targetPortal.x, targetPortal.y).x;
                window.game.mouse.y = window.game.worldToScreen(targetPortal.y, targetPortal.y).y;
            } else {
                console.log(`❌ No se encontró portal para ${randomPlanet.name}`);
            }
        } else {
            console.log('❌ Juego no está listo para probar navegación');
        }
    }

    // Función para obtener el estado de un planeta específico
    getPlanetStatus(planetName) {
        return this.verificationResults[planetName];
    }

    // Función para obtener todos los planetas que funcionan
    getWorkingPlanets() {
        return this.planets.filter(planet => 
            this.verificationResults[planet.name]?.exists
        );
    }
}

// Función para inicializar el verificador cuando la página esté lista
function initPlanetVerifier() {
    if (!window.planetVerifier) {
        window.planetVerifier = new PlanetVerifier();
        console.log('🔍 Planet Verifier inicializado');
    }
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanetVerifier);
} else {
    initPlanetVerifier();
}

// Exportar para uso global
window.PlanetVerifier = PlanetVerifier;
window.initPlanetVerifier = initPlanetVerifier; 