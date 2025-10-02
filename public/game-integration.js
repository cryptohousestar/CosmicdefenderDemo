// Cosmic Defender - Game Integration System
// Integra el juego con el sistema de servidores, wallet y recompensas

class GameIntegration {
    constructor() {
        this.serverId = null;
        this.sessionToken = null;
        this.walletAddress = null;
        this.gameConfig = null;
        this.userConfig = null;
        this.sessionStartTime = null;
        this.isConnected = false;
        this.rewardsInterval = null;
        this.lastRewardTime = 0;
        
        // Configuración por defecto
        this.defaultConfig = {
            rewards: {
                starFluxPerMinute: 1,
                maticPerHour: 0.001,
                expMultiplier: 1.0
            },
            world: {
                size: { width: 8000, height: 8000 },
                enemyDensity: 0.8,
                powerUpFrequency: 0.6,
                background: 'space-1'
            },
            features: {
                pvp: true,
                clans: true,
                market: true,
                achievements: true
            }
        };
    }

    // Inicializar integración con datos del servidor
    async initialize(serverId, sessionToken, walletAddress) {
        try {
            console.log('🚀 Initializing game integration...');
            
            this.serverId = serverId;
            this.sessionToken = sessionToken;
            this.walletAddress = walletAddress;
            this.sessionStartTime = Date.now();

            // Cargar configuración del servidor
            await this.loadGameConfig();
            
            // Inicializar sesión de juego
            await this.initializeGameSession();
            
            // Configurar tracking de recompensas
            this.setupRewardsTracking();
            
            this.isConnected = true;
            console.log('✅ Game integration initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Game integration error:', error);
            return false;
        }
    }

    // Cargar configuración específica del servidor
    async loadGameConfig() {
        try {
            const response = await fetch(`/api/game/config?serverId=${this.serverId}&wallet=${this.walletAddress}`);
            
            if (!response.ok) {
                throw new Error('Failed to load game config');
            }

            const data = await response.json();
            this.gameConfig = data.server;
            this.userConfig = data.user;
            
            console.log('📋 Game config loaded:', this.gameConfig);
            console.log('👤 User config loaded:', this.userConfig);
            
        } catch (error) {
            console.error('❌ Config loading error:', error);
            // Usar configuración por defecto
            this.gameConfig = this.defaultConfig;
            this.userConfig = {
                equippedNFTs: { ship: null, weapon: null, shield: null, engine: null },
                fuelStatus: { hasActiveFuel: false, bonusMultiplier: 1.0 },
                gameStats: { level: 1, experience: 0 }
            };
        }
    }

    // Inicializar sesión de juego
    async initializeGameSession() {
        try {
            const response = await fetch('/api/game/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: this.walletAddress,
                    serverId: this.serverId,
                    sessionToken: this.sessionToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to initialize game session');
            }

            const data = await response.json();
            console.log('🎮 Game session initialized:', data.session);
            
        } catch (error) {
            console.error('❌ Session initialization error:', error);
        }
    }

    // Configurar tracking de recompensas
    setupRewardsTracking() {
        // Enviar recompensas cada 5 minutos
        this.rewardsInterval = setInterval(() => {
            this.sendRewards();
        }, 5 * 60 * 1000); // 5 minutos
        
        console.log('💰 Rewards tracking setup complete');
    }

    // Enviar recompensas al servidor
    async sendRewards() {
        try {
            const currentTime = Date.now();
            const timePlayed = Math.floor((currentTime - this.sessionStartTime) / 1000);
            
            // Solo enviar si han pasado al menos 60 segundos desde la última vez
            if (currentTime - this.lastRewardTime < 60000) {
                return;
            }

            const response = await fetch('/api/game/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: this.walletAddress,
                    serverId: this.serverId,
                    sessionToken: this.sessionToken,
                    gameData: {
                        timePlayed: timePlayed,
                        level: this.userConfig?.gameStats?.level || 1,
                        experience: this.userConfig?.gameStats?.experience || 0
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('💰 Rewards sent:', data.rewards);
                this.lastRewardTime = currentTime;
                
                // Mostrar notificación de recompensas
                this.showRewardsNotification(data.rewards);
            }
            
        } catch (error) {
            console.error('❌ Rewards sending error:', error);
        }
    }

    // Mostrar notificación de recompensas
    showRewardsNotification(rewards) {
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.className = 'rewards-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
            ">
                <div style="font-weight: bold; margin-bottom: 5px;">💰 Rewards Earned!</div>
                <div>⏱️ Time: ${Math.floor(rewards.timePlayed / 60)}m ${rewards.timePlayed % 60}s</div>
                <div>⭐ StarFlux: +${rewards.starFluxEarned}</div>
                ${rewards.maticEarned > 0 ? `<div>🪙 MATIC: +${rewards.maticEarned.toFixed(6)}</div>` : ''}
                <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
                    Bonus: ${rewards.fuelBonus}x
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Aplicar configuración del servidor al juego
    applyServerConfig(gameInstance) {
        if (!this.gameConfig) return;

        console.log('⚙️ Applying server configuration...');

        // Aplicar configuración de mundo
        if (this.gameConfig.world) {
            gameInstance.worldSize = this.gameConfig.world.size;
            gameInstance.enemyDensity = this.gameConfig.world.enemyDensity;
            gameInstance.powerUpFrequency = this.gameConfig.world.powerUpFrequency;
        }

        // Aplicar configuración de recompensas
        if (this.gameConfig.rewards) {
            gameInstance.starFluxPerMinute = this.gameConfig.rewards.starFluxPerMinute;
            gameInstance.maticPerHour = this.gameConfig.rewards.maticPerHour;
            gameInstance.expMultiplier = this.gameConfig.rewards.expMultiplier;
        }

        // Aplicar configuración de usuario
        if (this.userConfig?.equippedNFTs?.ship) {
            this.applyNFTStats(gameInstance);
        }

        console.log('✅ Server configuration applied');
    }

    // Aplicar estadísticas de NFTs al juego
    applyNFTStats(gameInstance) {
        const ship = this.userConfig.equippedNFTs.ship;
        const weapon = this.userConfig.equippedNFTs.weapon;
        const shield = this.userConfig.equippedNFTs.shield;
        const engine = this.userConfig.equippedNFTs.engine;

        // Aplicar stats de nave
        if (ship) {
            gameInstance.player.hp = ship.stats.hp;
            gameInstance.player.maxHp = ship.stats.hp;
            gameInstance.player.speed = ship.stats.speed;
            gameInstance.player.damage = ship.stats.damage;
        }

        // Aplicar stats de arma
        if (weapon) {
            gameInstance.player.damage += weapon.stats.damage || 0;
            gameInstance.player.fireRate = weapon.stats.fireRate || gameInstance.player.fireRate;
        }

        // Aplicar stats de escudo
        if (shield) {
            gameInstance.player.shield = shield.stats.shield || 0;
            gameInstance.player.maxShield = shield.stats.shield || 0;
        }

        // Aplicar stats de motor
        if (engine) {
            gameInstance.player.speed += engine.stats.speed || 0;
            gameInstance.player.acceleration = engine.stats.acceleration || gameInstance.player.acceleration;
        }

        console.log('🎯 NFT stats applied to player');
    }

    // Verificar si el usuario puede jugar
    canPlay() {
        return this.isConnected && 
               this.userConfig?.fuelStatus?.hasActiveFuel && 
               this.userConfig?.equippedNFTs?.ship;
    }

    // Obtener mensaje de error si no puede jugar
    getPlayabilityMessage() {
        if (!this.isConnected) {
            return '❌ Not connected to server';
        }
        
        if (!this.userConfig?.equippedNFTs?.ship) {
            return '❌ No ship NFT equipped';
        }
        
        if (!this.userConfig?.fuelStatus?.hasActiveFuel) {
            return '⛽ No active fuel - purchase fuel to play';
        }
        
        return '✅ Ready to play!';
    }

    // Limpiar recursos al cerrar
    cleanup() {
        if (this.rewardsInterval) {
            clearInterval(this.rewardsInterval);
        }
        
        this.isConnected = false;
        console.log('🧹 Game integration cleaned up');
    }

    // Obtener configuración actual
    getConfig() {
        return {
            server: this.gameConfig,
            user: this.userConfig,
            session: {
                serverId: this.serverId,
                sessionToken: this.sessionToken,
                walletAddress: this.walletAddress,
                startTime: this.sessionStartTime
            }
        };
    }
}

// Exportar para uso global
window.GameIntegration = GameIntegration; 
 