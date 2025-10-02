// Naves con slots y sprites creativos
const ships = [
    { id: 'basic', name: 'Nave Antigua pero Funcional', sprite: [[0,12,0],[12,2,12],[12,2,12],[0,12,0]], color: '#666666', stats: {hp: 80, speed: 3, damage: 8, fireRate: 1}, slots: {weapon: 1, shield: 1, engine: 1}, price: 0, isBasic: true },
    { id: 'titan', name: 'Titan', sprite: [[0,1,1,0],[1,2,2,1],[1,2,2,1],[3,1,1,3]], color: '#ff9900', stats: {hp: 150, speed: 2, damage: 16, fireRate: 1}, slots: {weapon: 3, shield: 3, engine: 2} },
    { id: 'astra', name: 'Astra', sprite: [[0,4,0],[4,2,4],[4,2,4],[0,4,0]], color: '#ff66ff', stats: {hp: 130, speed: 3, damage: 14, fireRate: 1}, slots: {weapon: 3, shield: 2, engine: 2} },
    { id: 'nebula', name: 'Nebula', sprite: [[0,5,5,0],[5,2,2,5],[5,2,2,5],[0,5,5,0]], color: '#8888ff', stats: {hp: 115, speed: 4, damage: 13, fireRate: 1}, slots: {weapon: 2, shield: 2, engine: 2} },
    { id: 'spectre', name: 'Spectre', sprite: [[0,6,0],[6,2,6],[6,2,6],[0,6,0]], color: '#ffff33', stats: {hp: 110, speed: 5, damage: 11, fireRate: 1}, slots: {weapon: 2, shield: 2, engine: 1} },
    { id: 'phantom', name: 'Phantom', sprite: [[0,7,0],[7,2,7],[7,2,7],[0,7,0]], color: '#00ff99', stats: {hp: 105, speed: 5, damage: 10, fireRate: 1}, slots: {weapon: 2, shield: 1, engine: 2} },
    { id: 'nova', name: 'Nova', sprite: [[0,8,0],[8,2,8],[8,2,8],[0,8,0]], color: '#ff3333', stats: {hp: 120, speed: 4, damage: 12, fireRate: 1}, slots: {weapon: 2, shield: 1, engine: 1} },
    { id: 'blaze', name: 'Blaze', sprite: [[0,9,0],[9,2,9],[9,2,9],[0,9,0]], color: '#ff4444', stats: {hp: 95, speed: 6, damage: 9, fireRate: 1}, slots: {weapon: 1, shield: 1, engine: 2} },
    { id: 'comet', name: 'Comet', sprite: [[0,10,0],[10,2,10],[10,2,10],[0,10,0]], color: '#00ffff', stats: {hp: 80, speed: 7, damage: 8, fireRate: 1}, slots: {weapon: 1, shield: 1, engine: 2} },
    { id: 'vortex', name: 'Vortex', sprite: [[0,11,0],[11,2,11],[11,2,11],[0,11,0]], color: '#33ff33', stats: {hp: 90, speed: 6, damage: 9, fireRate: 1}, slots: {weapon: 1, shield: 1, engine: 1} },
    { id: 'delta', name: 'Delta', sprite: [[0,3,0],[3,2,3],[3,2,3],[0,3,0]], color: '#00bfff', stats: {hp: 100, speed: 5, damage: 10, fireRate: 1}, slots: {weapon: 1, shield: 1, engine: 1} },
];

// Reducir la velocidad base de todas las naves a la mitad
ships.forEach(ship => {
    ship.stats.speed = Math.max(1, ship.stats.speed / 2);
});

// Asignar precios fijos de 50 a 1000 monedas a las naves, de peor a mejor
const shipPrices = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
// Orden de menor a mayor poder (Basic, Delta, Vortex, Comet, Blaze, Phantom, Spectre, Nova, Nebula, Astra, Titan)
const shipOrder = ['basic','delta','vortex','comet','blaze','phantom','spectre','nova','nebula','astra','titan'];
ships.forEach(ship => {
    if (ship.price === undefined) { // Solo asignar precio si no está definido (0 es válido)
    const idx = shipOrder.indexOf(ship.id);
    ship.price = shipPrices[idx];
    }
});

function getShipPrice(ship) {
    return ship.price;
}

// Armas láser (de mayor a menor)
const weapons = [
    { id: 'laser-omega', name: 'Láser Omega', color: '#ff0000', stats: {damage: 10, fireRate: 1}, price: 1500 },
    { id: 'laser-gamma', name: 'Láser Gamma', color: '#ff6600', stats: {damage: 8, fireRate: 2}, price: 1200 },
    { id: 'laser-beta', name: 'Láser Beta', color: '#00bfff', stats: {damage: 6, fireRate: 3}, price: 900 },
    { id: 'laser-alpha', name: 'Láser Alpha', color: '#00ff00', stats: {damage: 4, fireRate: 3}, price: 600 },
];

// Asignar precios fijos de 100 a 700 monedas a los lasers, de menor a mayor
const weaponPrices = [100, 250, 400, 700]; // Alpha, Beta, Gamma, Omega
weapons.forEach((weapon, idx) => {
    weapon.price = weaponPrices[idx];
});

// Escudos (% vida extra)
const shields = [
    { id: 'shield-omega', name: 'Escudo Omega', color: '#b8860b', stats: {lifePercent: 40}, price: 1300 },
    { id: 'shield-gamma', name: 'Escudo Gamma', color: '#00ffff', stats: {lifePercent: 30}, price: 1000 },
    { id: 'shield-beta', name: 'Escudo Beta', color: '#ff00ff', stats: {lifePercent: 20}, price: 700 },
    { id: 'shield-alpha', name: 'Escudo Alpha', color: '#00bfff', stats: {lifePercent: 10}, price: 400 },
];

// Asignar precios fijos de 50 a 400 monedas a los escudos, de peor a mejor
const shieldPrices = [50, 150, 250, 400]; // Alpha, Beta, Gamma, Omega
shields.forEach((shield, idx) => {
    shield.price = shieldPrices[idx];
});

// Motores (velocidad extra)
const engines = [
    { id: 'engine-omega', name: 'Motor Omega', color: '#ffd700', stats: {speed: 4}, price: 1200 },
    { id: 'engine-gamma', name: 'Motor Gamma', color: '#ff6600', stats: {speed: 3}, price: 900 },
    { id: 'engine-beta', name: 'Motor Beta', color: '#00bfff', stats: {speed: 2}, price: 600 },
    { id: 'engine-alpha', name: 'Motor Alpha', color: '#00ff00', stats: {speed: 1}, price: 300 },
];

// Asignar precios fijos de 80 a 500 monedas a los motores, de menor a mayor
const enginePrices = [80, 180, 320, 500]; // Alpha, Beta, Gamma, Omega
engines.forEach((engine, idx) => {
    engine.price = enginePrices[idx];
});

// Inventario vacío 6x5
let inventory = Array(30).fill(null);
// Equipo actual
let equipped = { ship: null, weapon: null, shield: null, engine: null };
// Modo venta
let sellMode = false;

// Cargar monedas desde localStorage
let coins = parseInt(localStorage.getItem('coins') || '0');

function renderShipSprite(sprite, color, details = null) {
    // Triángulo neon con glow y detalles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(32, 40);
    // Glow exterior
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(-22, 20); ctx.lineTo(22, 20); ctx.closePath();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    // Triángulo principal
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(-22, 20); ctx.lineTo(22, 20); ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = '#181824cc';
    ctx.fill();
    // Detalles neon
    if (details) details(ctx);
    ctx.restore();
    return canvas;
}

const shipDetails = {
    basic: ctx => { 
        ctx.save(); 
        ctx.strokeStyle = '#333333'; 
        ctx.lineWidth = 1; 
        // Dibujar grietas
        ctx.beginPath(); 
        ctx.moveTo(-8, -5); ctx.lineTo(-2, -2); ctx.lineTo(2, 2); ctx.lineTo(8, 5); 
        ctx.moveTo(-6, 8); ctx.lineTo(0, 4); ctx.lineTo(6, 0); 
        ctx.moveTo(-4, -8); ctx.lineTo(4, -4); 
        ctx.stroke(); 
        ctx.restore(); 
    },
    titan: ctx => { ctx.save(); ctx.strokeStyle = '#00fff7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.restore(); },
    astra: ctx => { ctx.save(); ctx.strokeStyle = '#ff00ea'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 10, 7, 0, Math.PI); ctx.stroke(); ctx.restore(); },
    nebula: ctx => { ctx.save(); ctx.strokeStyle = '#ffe600'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(8, 12); ctx.stroke(); ctx.restore(); },
    spectre: ctx => { ctx.save(); ctx.strokeStyle = '#00ff6a'; ctx.lineWidth = 2; ctx.setLineDash([3,2]); ctx.strokeRect(-8, 2, 16, 8); ctx.setLineDash([]); ctx.restore(); },
    phantom: ctx => { ctx.save(); ctx.strokeStyle = '#ff00c8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 15, 4, 0, 2*Math.PI); ctx.stroke(); ctx.restore(); },
    nova: ctx => { ctx.save(); ctx.strokeStyle = '#00fff7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 18); ctx.lineTo(6, 18); ctx.stroke(); ctx.restore(); },
    blaze: ctx => { ctx.save(); ctx.strokeStyle = '#ffea00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 14); ctx.lineTo(4, 14); ctx.stroke(); ctx.restore(); },
    comet: ctx => { ctx.save(); ctx.strokeStyle = '#00ffea'; ctx.lineWidth = 2; ctx.setLineDash([2,2]); ctx.strokeRect(-6, 8, 12, 6); ctx.setLineDash([]); ctx.restore(); },
    vortex: ctx => { ctx.save(); ctx.strokeStyle = '#ff00ea'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 18, 3, 0, 2*Math.PI); ctx.stroke(); ctx.restore(); },
    delta: ctx => { ctx.save(); ctx.strokeStyle = '#ffe600'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(8, 8); ctx.stroke(); ctx.restore(); }
};

// Tooltip global
let globalTooltip = null;
function createGlobalTooltip() {
    globalTooltip = document.createElement('div');
    globalTooltip.className = 'pixel-tooltip';
    globalTooltip.style.position = 'fixed';
    globalTooltip.style.pointerEvents = 'none';
    globalTooltip.style.opacity = '0';
    globalTooltip.style.zIndex = '99999';
    document.body.appendChild(globalTooltip);
}
createGlobalTooltip();

function showGlobalTooltip(text, x, y) {
    globalTooltip.innerText = text;
    globalTooltip.style.left = x + 18 + 'px';
    globalTooltip.style.top = y + 18 + 'px';
    globalTooltip.style.opacity = '1';
}
function hideGlobalTooltip() {
    globalTooltip.style.opacity = '0';
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    const allItems = [
        ...ships.map(ship => ({ ...ship, type: 'ship', price: getShipPrice(ship) })),
        ...weapons.map(w => ({ ...w, type: 'weapon' })),
        ...shields.map(s => ({ ...s, type: 'shield' })),
        ...engines.map(e => ({ ...e, type: 'engine' })),
    ];
    allItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        let tooltipText = '';
        if (item.type === 'ship') {
            tooltipText = `Nave: ${item.name}\nVida: ${item.stats.hp}\nVelocidad: ${item.stats.speed}\nDaño: ${item.stats.damage}\nPrecio: ${item.price}\nSlots: Arma(${item.slots.weapon}) Escudo(${item.slots.shield}) Motor(${item.slots.engine})`;
            div.appendChild(renderShipSprite(item.sprite, item.color, shipDetails[item.id]));
        } else if (item.type === 'weapon') {
            tooltipText = `Arma Láser: ${item.name}\nDaño extra: +${item.stats.damage}\nCadencia: ${item.stats.fireRate}\nPrecio: ${item.price}`;
            div.appendChild(renderWeaponSprite(item));
        } else if (item.type === 'shield') {
            tooltipText = `Escudo: ${item.name}\n% Vida extra: +${item.stats.lifePercent}%\nPrecio: ${item.price}`;
            div.appendChild(renderShieldSprite(item));
        } else if (item.type === 'engine') {
            tooltipText = `Motor: ${item.name}\nVelocidad extra: +${item.stats.speed}\nPrecio: ${item.price}`;
            div.appendChild(renderEngineSprite(item));
        }
        // Precio
        const price = document.createElement('div');
        price.textContent = item.price + '💰';
        price.style.fontSize = '11px';
        price.style.textAlign = 'center';
        div.appendChild(price);
        div.onclick = () => buyItem(item);
        div.onmousemove = e => showGlobalTooltip(tooltipText, e.clientX, e.clientY);
        div.onmouseleave = hideGlobalTooltip;
        grid.appendChild(div);
    });
}

function buyItem(item) {
    // Permitir comprar en cualquier lugar
    const hasShip = localStorage.getItem('hasShip') === 'true';
    if (coins < item.price) {
        alert('No tienes suficientes monedas.');
        return;
    }
    
    const idx = inventory.findIndex(i => i === null);
    if (idx === -1) {
        alert('Inventario lleno');
        return;
    }
    
    // Descontar monedas
    coins -= item.price;
    localStorage.setItem('coins', coins.toString());
    
    // Agregar al inventario
    inventory[idx] = item;
    saveInventory(); // Guardar inventario actualizado
    
    // Si es una nave y no hay nave equipada, equiparla automáticamente
    if (item.type === 'ship') {
        const equippedData = localStorage.getItem('equipped');
        let equipped = equippedData ? JSON.parse(equippedData) : { ship: null, weapon: null, shield: null, engine: null };
        
        if (!equipped.ship) {
            equipped.ship = item;
            equipped.weapon = null;
            equipped.shield = null;
            equipped.engine = null;
            localStorage.setItem('equipped', JSON.stringify(equipped));
            localStorage.setItem('hasShip', 'true');
            
            // Actualizar el estado local
            equipped = { ship: item, weapon: null, shield: null, engine: null };
            
            alert(`¡${item.name} comprada y equipada exitosamente!`);
        } else {
            alert(`¡${item.name} comprada y agregada al inventario!`);
        }
    } else {
        alert(`¡${item.name} comprada y agregada al inventario!`);
    }
    
    renderInventory();
    renderEquip();
    renderCoins();
    updateStatsDisplay();
}

function equipItemFromInventory(index) {
    const hasShip = localStorage.getItem('hasShip') === 'true';
    
    // Permitir equipar en cualquier lugar
    const item = inventory[index];
    if (!item) return;
    if (item.type === 'ship') {
        equipped.ship = item;
        equipped.weapon = null;
        equipped.shield = null;
        equipped.engine = null;
        saveEquipped();
        inventory[index] = null; // Eliminar del inventario después de equipar
        saveInventory(); // Guardar inventario actualizado
        localStorage.setItem('hasShip', 'true');
        renderEquip();
        updateStatsDisplay();
        alert(`¡${item.name} equipada exitosamente!`);
        return;
    }
    if (!equipped.ship) return;
    // Equipar mejoras solo si hay slots
    if (item.type === 'weapon' && countEquipped('weapon') < equipped.ship.slots.weapon) {
        equipped.weapon = item;
        inventory[index] = null; // Eliminar del inventario después de equipar
        saveInventory(); // Guardar inventario actualizado
    } else if (item.type === 'shield' && countEquipped('shield') < equipped.ship.slots.shield) {
        equipped.shield = item;
        inventory[index] = null; // Eliminar del inventario después de equipar
        saveInventory(); // Guardar inventario actualizado
    } else if (item.type === 'engine' && countEquipped('engine') < equipped.ship.slots.engine) {
        equipped.engine = item;
        inventory[index] = null; // Eliminar del inventario después de equipar
        saveInventory(); // Guardar inventario actualizado
    }
    saveEquipped();
    renderEquip();
    updateStatsDisplay();
}
function countEquipped(type) {
    // Solo 1 slot por tipo por ahora (puedes expandir a varios si quieres slots múltiples)
    return equipped[type] ? 1 : 0;
}
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    const hasShip = localStorage.getItem('hasShip') === 'true';
    // Se puede vender en cualquier lugar
    const canSell = true;
    for (let i = 0; i < 30; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
        if (inventory[i]) {
            slot.className = 'inventory-slot';
            if (inventory[i].type === 'ship') {
                slot.appendChild(renderShipSprite(inventory[i].sprite, inventory[i].color, shipDetails[inventory[i].id]));
            } else if (inventory[i].type === 'weapon') {
                slot.appendChild(renderWeaponSprite(inventory[i]));
            } else if (inventory[i].type === 'shield') {
                slot.appendChild(renderShieldSprite(inventory[i]));
            } else if (inventory[i].type === 'engine') {
                slot.appendChild(renderEngineSprite(inventory[i]));
            }
        }
        slot.onclick = () => {
            if (sellMode && inventory[i]) {
                // Permitir vender en cualquier lugar
                coins += Math.floor((inventory[i].price || 0) / 2);
                inventory[i] = null;
                saveInventory(); // Guardar inventario actualizado
                renderInventory();
                renderCoins();
                sellMode = false;
                document.getElementById('sell-btn').classList.remove('selected');
            } else if (inventory[i]) {
                equipItemFromInventory(i);
            }
        };
        grid.appendChild(slot);
    }
    // Botón de venta siempre habilitado
    const sellBtn = document.getElementById('sell-btn');
    if (sellBtn) {
        sellBtn.disabled = false;
        sellBtn.title = '';
    }
}

function renderCoins() {
    // Sincronizar monedas desde localStorage
    const storedCoins = localStorage.getItem('coins');
    coins = parseInt(storedCoins || '0');
    
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
        coinsDisplay.textContent = 'Monedas: ' + coins;
        console.log('Monedas actualizadas en market:', coins, 'desde localStorage:', storedCoins);
    } else {
        console.error('No se encontró el elemento coins-display');
    }
}

function renderEquip() {
    // Nave
    const shipSlot = document.getElementById('equip-ship');
    shipSlot.innerHTML = '';
    if (equipped.ship) {
        shipSlot.appendChild(renderShipSprite(equipped.ship.sprite, equipped.ship.color, shipDetails[equipped.ship.id]));
    } else {
        shipSlot.textContent = 'Nave';
    }
    // Arma
    const weaponSlot = document.getElementById('equip-weapon');
    weaponSlot.innerHTML = equipped.weapon ? '' : 'Arma';
    weaponSlot.style.background = equipped.weapon ? equipped.weapon.color : '#23233a';
    if (equipped.weapon) weaponSlot.appendChild(renderWeaponSprite(equipped.weapon));
    // Escudo
    const shieldSlot = document.getElementById('equip-shield');
    shieldSlot.innerHTML = equipped.shield ? '' : 'Escudo';
    shieldSlot.style.background = equipped.shield ? equipped.shield.color : '#23233a';
    if (equipped.shield) shieldSlot.appendChild(renderShieldSprite(equipped.shield));
    // Motor
    const engineSlot = document.getElementById('equip-engine');
    engineSlot.innerHTML = equipped.engine ? '' : 'Motor';
    engineSlot.style.background = equipped.engine ? equipped.engine.color : '#23233a';
    if (equipped.engine) engineSlot.appendChild(renderEngineSprite(equipped.engine));
}

function renderWeaponSprite(w) {
    // Arma neon: cañón con rayo glow
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(32, 32);
    // Glow del rayo
    ctx.beginPath();
    ctx.moveTo(12, 0); ctx.lineTo(28, 0);
    ctx.strokeStyle = w.color;
    ctx.shadowColor = w.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Cañón
    ctx.beginPath();
    ctx.moveTo(-18, -6); ctx.lineTo(12, -6); ctx.lineTo(12, 6); ctx.lineTo(-18, 6); ctx.closePath();
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = w.color;
    ctx.stroke();
    ctx.restore();
    return canvas;
}
function renderShieldSprite(s) {
    // Escudo neon: burbuja con glow y reflejo
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(32, 36);
    // Glow
    ctx.beginPath();
    ctx.arc(0, 0, 22, Math.PI, 2 * Math.PI);
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    // Borde
    ctx.beginPath();
    ctx.arc(0, 0, 22, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = s.color;
    ctx.stroke();
    // Reflejo
    ctx.beginPath();
    ctx.arc(-8, -6, 7, Math.PI, 2 * Math.PI);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    return canvas;
}
function renderEngineSprite(e) {
    // Motor neon: cuerpo central, boquillas laterales, detalles y estela solo abajo
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(32, 38);
    // Estela de energía (solo abajo)
    ctx.beginPath();
    ctx.moveTo(-10, 16); ctx.lineTo(0, 32); ctx.lineTo(10, 16); ctx.closePath();
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 16;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = e.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    // Cuerpo central
    ctx.beginPath();
    ctx.rect(-12, -12, 24, 20);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = e.color;
    ctx.stroke();
    // Boquillas laterales
    ctx.save();
    ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(-14, 0, 4, 7, 0, 0, 2*Math.PI);
    ctx.ellipse(14, 0, 4, 7, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-14, 0, 4, 7, 0, 0, 2*Math.PI);
    ctx.ellipse(14, 0, 4, 7, 0, 0, 2*Math.PI);
    ctx.stroke();
    // Detalles mecánicos
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -8); ctx.lineTo(8, -8);
    ctx.moveTo(-8, -3); ctx.lineTo(8, -3);
    ctx.moveTo(-8, 3); ctx.lineTo(8, 3);
    ctx.moveTo(-8, 8); ctx.lineTo(8, 8);
    ctx.stroke();
    ctx.restore();
    return canvas;
}

function calculateShipStats() {
    if (!equipped.ship) {
        return {
            health: 0,
            defense: 0,
            attack: 0,
            fireRate: 0,
            shield: 0
        };
    }
    
    let health = equipped.ship.stats.hp;
    let defense = 0;
    let attack = equipped.ship.stats.damage;
    let fireRate = 1; // Base fire rate
    let shield = 0;
    
    // Aplicar bonus de escudo
    if (equipped.shield) {
        shield = equipped.shield.stats.lifePercent;
        health += Math.floor(health * (shield / 100));
    }
    
    // Aplicar bonus de arma
    if (equipped.weapon) {
        attack += equipped.weapon.stats.damage;
        // Ajustar fire rate basado en el tipo de arma
        if (equipped.weapon.stats.fireRate === 'muy alta') {
            fireRate = 3;
        } else if (equipped.weapon.stats.fireRate === 'alta') {
            fireRate = 2;
        } else if (equipped.weapon.stats.fireRate === 'media') {
            fireRate = 1.5;
        }
    }
    
    // Aplicar bonus de motor (velocidad no afecta stats de combate)
    
    return {
        health: health,
        defense: defense,
        attack: attack,
        fireRate: fireRate,
        shield: shield
    };
}

function updateStatsDisplay() {
    const stats = calculateShipStats();
    
    document.getElementById('stat-health').textContent = stats.health;
    document.getElementById('stat-defense').textContent = stats.defense;
    document.getElementById('stat-attack').textContent = stats.attack;
    document.getElementById('stat-fireRate').textContent = stats.fireRate.toFixed(1);
    document.getElementById('stat-shield').textContent = stats.shield + '%';
}

document.getElementById('sell-btn').onclick = () => {
    sellMode = !sellMode;
    document.getElementById('sell-btn').classList.toggle('selected', sellMode);
};

function saveEquipped() {
    localStorage.setItem('equipped', JSON.stringify(equipped));
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function loadEquipped() {
    const data = localStorage.getItem('equipped');
    if (data) {
        const eq = JSON.parse(data);
        equipped.ship = eq.ship;
        equipped.weapon = eq.weapon;
        equipped.shield = eq.shield;
        equipped.engine = eq.engine;
    }
    updateStatsDisplay(); // Ensure stats are displayed when loading equipped items
}

function loadInventory() {
    const saved = localStorage.getItem('inventory');
    if (saved) {
        inventory = JSON.parse(saved);
    }
}

// Inicializar
loadEquipped();
loadInventory(); // Cargar inventario guardado
renderCatalog();
renderInventory();
renderEquip();
renderCoins();
updateStatsDisplay(); 

// Función global para forzar actualización de monedas
window.forceUpdateCoins = function() {
    renderCoins();
    console.log('Forzando actualización de monedas...');
};

// Función para agregar monedas directamente desde el market (para pruebas)
window.addCoinsFromMarket = function(amount = 100) {
    console.log('=== AGREGANDO MONEDAS DESDE MARKET ===');
    const currentCoins = parseInt(localStorage.getItem('coins') || '0');
    const newCoins = currentCoins + amount;
    localStorage.setItem('coins', newCoins.toString());
    console.log(`Agregadas ${amount} monedas. Total: ${newCoins}`);
    renderCoins();
    alert(`Agregadas ${amount} monedas desde el market. Total: ${newCoins}`);
};

// Mostrar monedas actuales al cargar
console.log('Market cargado. Monedas actuales:', localStorage.getItem('coins'));

// Función de debug para verificar localStorage
window.debugLocalStorage = function() {
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('localStorage.getItem("coins"):', localStorage.getItem('coins'));
    console.log('localStorage.getItem("coins") === null:', localStorage.getItem('coins') === null);
    console.log('localStorage.getItem("coins") === undefined:', localStorage.getItem('coins') === undefined);
    console.log('localStorage.getItem("coins") === "":', localStorage.getItem('coins') === "");
    console.log('localStorage.length:', localStorage.length);
    console.log('Todas las claves en localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }
    console.log('=== FIN DEBUG ===');
};

// Ejecutar debug al cargar
debugLocalStorage();

// Sincronizar monedas cuando se abre la página
window.addEventListener('focus', () => {
    renderCoins();
});

// También sincronizar cuando se hace clic en la página
document.addEventListener('click', () => {
    renderCoins();
});

// Sincronizar cuando se carga la página
window.addEventListener('load', () => {
    renderCoins();
});

// Sincronizar cuando se hace scroll (por si acaso)
window.addEventListener('scroll', () => {
    renderCoins();
});

// Sincronizar cada 2 segundos para asegurar que esté actualizado
setInterval(() => {
    renderCoins();
}, 2000);

// Sincronizar cuando se hace cualquier interacción con el mouse
document.addEventListener('mousemove', () => {
    renderCoins();
});

// Sincronizar cuando se presiona cualquier tecla
document.addEventListener('keydown', () => {
    renderCoins();
}); 