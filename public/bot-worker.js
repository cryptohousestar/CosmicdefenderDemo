// Cosmic Defender - Bot AI Web Worker (v3 - Advanced Tactical AI)

// --- GLOBAL STATE ---
let worldData = { players: [], obstacles: [], worldSize: 8000, clans: [], clanSafeZones: [], centralSafeZone: null };
let performanceSettings = {};
let satelliteStatus = {}; // Track which clan satellites are active

// --- HELPERS ---
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function checkCollisionWithObstacles(bot, newX, newY) {
    if (!worldData.obstacles) return false;

    for (const obstacle of worldData.obstacles) {
        // Skip bases del mismo clan
        if (obstacle.type === "base" && obstacle.clan === bot.clan) continue;

        // Detectar colisión AABB (Axis-Aligned Bounding Box)
        if (newX < obstacle.x + obstacle.width &&
            newX + bot.width > obstacle.x &&
            newY < obstacle.y + obstacle.height &&
            newY + bot.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function isPlayerInSafeZone(player, world) {
    if (!player || !world.clans[player.clan]) return false;
    if (world.centralSafeZone && player.x >= world.centralSafeZone.x && player.x <= world.centralSafeZone.x + world.centralSafeZone.width && player.y >= world.centralSafeZone.y && player.y <= world.centralSafeZone.y + world.centralSafeZone.height) return true;
    const playerSafeZone = world.clanSafeZones.find(zone => zone.clan === player.clan);
    if (!playerSafeZone) return false;
    return (player.x >= playerSafeZone.x && player.x <= playerSafeZone.x + playerSafeZone.width && player.y >= playerSafeZone.y && player.y <= playerSafeZone.y + playerSafeZone.height);
}

// --- TACTICAL AI CORE ---

function findBestTarget(bot) {
    let bestTarget = null;
    let maxScore = -1;
    const detectionRange = bot.isElite || bot.isBoss ? 800 : 450;

    // Primero buscar jugadores cercanos
    worldData.players.forEach(p => {
        if (p.id === bot.id || p.health <= 0 || typeof p.clan !== 'number' || p.clan === bot.clan || isPlayerInSafeZone(p, worldData)) {
            return;
        }
        const distance = getDistance(bot.x, bot.y, p.x, p.y);
        if (distance > detectionRange) return;

        let weight = p.isBoss ? 10 : (p.isHuman ? 5 : (p.isElite ? 3 : 1));
        const healthBonus = (1 - (p.health / p.maxHealth)) * 2.5;
        const score = (weight + healthBonus) / (distance + 1);

        if (score > maxScore) {
            maxScore = score;
            bestTarget = p;
        }
    });

    // Si tiene satélite activo, también puede buscar bases enemigas lejanas
    if (satelliteStatus[bot.clan] && !bestTarget && worldData.obstacles) {
        const baseDetectionRange = 2000; // Rango largo para bases
        worldData.obstacles.forEach(obstacle => {
            if (obstacle.type === 'base' && obstacle.clan !== bot.clan && !obstacle.isDestroyed) {
                const distance = getDistance(bot.x, bot.y, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
                if (distance < baseDetectionRange) {
                    // Crear un "target virtual" para la base
                    const baseTarget = {
                        id: `base_${obstacle.clan}`,
                        x: obstacle.x + obstacle.width / 2,
                        y: obstacle.y + obstacle.height / 2,
                        clan: obstacle.clan,
                        health: obstacle.health || 1000,
                        maxHealth: obstacle.maxHealth || 1000,
                        isBase: true
                    };
                    const score = 2 / (distance + 1); // Menor prioridad que jugadores
                    if (score > maxScore) {
                        maxScore = score;
                        bestTarget = baseTarget;
                    }
                }
            }
        });
    }

    return bestTarget;
}

function calculateBotAI(bot) {
    const actions = [];
    if ((bot.isElite || bot.isBoss) && bot.skills) {
        Object.keys(bot.skills).forEach(key => {
            if (bot.skills[key].cooldown > 0) bot.skills[key].cooldown -= 16;
        });
    }

    const isAggressive = bot.isElite || bot.isBoss;
    const searchFrequency = isAggressive ? 90 : 240;
    bot.patrolTimer = (bot.patrolTimer || 0) + 1;

    if (bot.state === 'chase' || bot.patrolTimer > searchFrequency) {
        const bestTarget = findBestTarget(bot);
        if (bestTarget) {
            if (bot.target?.id !== bestTarget.id) bot.state = 'chase';
            bot.target = bestTarget;
        } else {
            bot.target = null;
            bot.state = 'patrol';
        }
        bot.patrolTimer = 0;
    }

    switch (bot.state) {
        case 'patrol':
            if (typeof bot.angle !== 'number') bot.angle = Math.random() * Math.PI * 2;
            const newPatrolX = bot.x + Math.cos(bot.angle) * bot.speed * 0.5;
            const newPatrolY = bot.y + Math.sin(bot.angle) * bot.speed * 0.5;

            if (!checkCollisionWithObstacles(bot, newPatrolX, newPatrolY)) {
                bot.x = newPatrolX;
                bot.y = newPatrolY;
            } else {
                // Cambiar dirección al chocar con obstáculo
                bot.angle = Math.random() * Math.PI * 2;
            }
            break;
        case 'chase':
            if (bot.target) {
                const dx = bot.target.x - bot.x;
                const dy = bot.target.y - bot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    bot.angle = Math.atan2(dy, dx);

                    // Determinar rango óptimo según tipo de bot
                    let optimalRange = 200; // Bots normales: rango corto
                    let shootRange = 300;

                    if (bot.isBoss) {
                        optimalRange = 400; // Boss: rango largo
                        shootRange = 550;
                    } else if (bot.isElite) {
                        optimalRange = 300; // Elite: rango medio
                        shootRange = 450;
                    }

                    // Solo moverse si está fuera del rango óptimo
                    if (distance > optimalRange) {
                        // Acercarse al objetivo
                        const newChaseX = bot.x + Math.cos(bot.angle) * bot.speed;
                        const newChaseY = bot.y + Math.sin(bot.angle) * bot.speed;

                        if (!checkCollisionWithObstacles(bot, newChaseX, newChaseY)) {
                            bot.x = newChaseX;
                            bot.y = newChaseY;
                        } else {
                            // Intentar rodear el obstáculo
                            const avoidAngle = bot.angle + Math.PI / 3;
                            const avoidX = bot.x + Math.cos(avoidAngle) * bot.speed;
                            const avoidY = bot.y + Math.sin(avoidAngle) * bot.speed;

                            if (!checkCollisionWithObstacles(bot, avoidX, avoidY)) {
                                bot.x = avoidX;
                                bot.y = avoidY;
                            }
                        }
                    } else if (distance < optimalRange * 0.7) {
                        // Alejarse si está demasiado cerca (kiting)
                        const retreatX = bot.x - Math.cos(bot.angle) * bot.speed * 0.5;
                        const retreatY = bot.y - Math.sin(bot.angle) * bot.speed * 0.5;

                        if (!checkCollisionWithObstacles(bot, retreatX, retreatY)) {
                            bot.x = retreatX;
                            bot.y = retreatY;
                        }
                    }
                    // Si está en el rango óptimo, mantener posición y disparar

                    if (distance < shootRange && (Date.now() - (bot.lastShot || 0)) > bot.fireRate * 1000) {
                        actions.push({ type: 'shoot', botId: bot.id, angle: bot.angle });
                        bot.lastShot = Date.now();
                    }
                    if (isAggressive && bot.skills) {
                        actions.push(...useBotSkills(bot, distance));
                    }
                }
            }
            break;
    }

    bot.x = Math.max(0, Math.min(bot.x, worldData.worldSize - bot.width));
    bot.y = Math.max(0, Math.min(bot.y, worldData.worldSize - bot.height));
    if(isAggressive) checkBotSkillExpiration(bot);

    return { updatedBot: bot, botActions: actions };
}

function useBotSkills(bot, distance) {
    const actions = [];
    const now = Date.now();
    if (!bot.skills) return actions;

    if (bot.isBoss && bot.skills.T.cooldown <= 0 && distance < 450 && Math.random() < 0.4) {
        bot.skills.T.cooldown = bot.skillCooldowns.T;
        actions.push({ type: 'megaShot', botId: bot.id });
    }
    if (bot.skills.E.cooldown <= 0 && bot.health < bot.maxHealth * 0.6 && Math.random() < 0.5) {
        bot.skills.E.cooldown = bot.skillCooldowns.E;
        bot.shieldActive = true;
        bot.shieldEndTime = now + 5000;
    }
    if (bot.skills.R.cooldown <= 0 && distance > 350 && Math.random() < 0.3) {
        bot.skills.R.cooldown = bot.skillCooldowns.R;
        bot.turboBoostActive = true;
        bot.turboBoostEndTime = now + 4000;
        bot.originalSpeed = bot.speed;
        bot.speed = bot.speed * 1.5;
    }
    return actions;
}

function checkBotSkillExpiration(bot) {
    const now = Date.now();
    if (bot.shieldActive && now > bot.shieldEndTime) bot.shieldActive = false;
    if (bot.turboBoostActive && now > bot.turboBoostEndTime) {
        bot.turboBoostActive = false;
        bot.speed = bot.originalSpeed;
    }
}

self.onmessage = function(e) {
    const { type, data } = e.data;
    switch (type) {
        case 'init':
            worldData = data.worldData;
            performanceSettings = data.performanceSettings;
            // Inicializar todos los satélites como activos
            if (worldData.clans) {
                worldData.clans.forEach((clan, index) => {
                    satelliteStatus[index] = true;
                });
            }
            break;
        case 'updateBots':
            worldData.players = data.worldData.players;
            const botsToProcess = data.bots;
            const results = [];
            const actions = [];
            botsToProcess.forEach(bot => {
                const { updatedBot, botActions } = calculateBotAI(bot);
                results.push(updatedBot);
                if (botActions.length > 0) actions.push(...botActions);
            });
            self.postMessage({ type: 'botResults', results: results, actions: actions });
            break;
        case 'disableSatellite':
            console.log(`Worker: Desactivando satélite del clan ${data.clanId}`);
            satelliteStatus[data.clanId] = false;
            break;
        case 'enableSatellite':
            console.log(`Worker: Activando satélite del clan ${data.clanId}`);
            satelliteStatus[data.clanId] = true;
            break;
    }
};

self.postMessage({ type: 'ready' });