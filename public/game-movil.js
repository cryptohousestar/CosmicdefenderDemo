// Cosmic Defender - Space RPG Game

const LogManager = {
  enabled: false, // Interruptor para encender/apagar logs
  logs: [],
  maxLogs: 50, // Aumentado para mejor depuración
  logTypes: {},
  logTimestamps: {},
  minInterval: 1000, // 1 segundo entre logs iguales

  log(type, message, data = null) {
    if (!this.enabled) return; // Si está apagado, no hacer nada

    const key = `${type}:${message}`;
    const now = Date.now();

    // Si el mensaje se logueó hace menos de X segundos, ignorar para no spamear
    if (
      this.logTimestamps[key] &&
      now - this.logTimestamps[key] < this.minInterval
    ) {
      return;
    }

    this.logTimestamps[key] = now;

    // Add to logs array
    this.logs.push({ type, message, data, timestamp: now });

    // Remove old logs if we exceed maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Actually log to console
    if (type === "error") {
      console.error(message, data);
    } else if (type === "warn") {
      console.warn(message, data);
    } else {
      console.log(message, data);
    }
  },
  clear() {
    this.logs = [];
    this.logTypes = {};
    this.logTimestamps = {};
  },
};

// Sistema de optimización dinámica para aprovechar mejor los recursos del dispositivo
const PerformanceOptimizer = {
  // Detección de capacidades del dispositivo
  deviceCapabilities: {
    cpuCores: navigator.hardwareConcurrency || 4,
    memory: navigator.deviceMemory || 4, // GB
    connection: navigator.connection
      ? navigator.connection.effectiveType
      : "4g",
    fps: 60,
    lastFrameTime: 0,
    frameCount: 0,
    averageFrameTime: 16.67, // 60 FPS por defecto
    performanceMode: "auto", // auto, low, medium, high, ultra
  },

  // Configuraciones de calidad por nivel
  qualitySettings: {
    low: {
      maxBots: 10,
      maxParticles: 50,
      maxBullets: 100,
      starCount: 3000, // Miles de estrellas para fondo espacial denso
      updateInterval: 50, // ms
      renderQuality: 0.5,
      enableShadows: false,
      enableParticles: false,
      enableDamageNumbers: false,
      enableMinimap: true,
      enableSatellites: false,
    },
    medium: {
      maxBots: 20,
      maxParticles: 100,
      maxBullets: 200,
      starCount: 5000, // Miles de estrellas para fondo espacial denso
      updateInterval: 33, // ~30 FPS
      renderQuality: 0.75,
      enableShadows: false,
      enableParticles: true,
      enableDamageNumbers: true,
      enableMinimap: true,
      enableSatellites: true,
    },
    high: {
      maxBots: 30,
      maxParticles: 200,
      maxBullets: 300,
      starCount: 7000, // Miles de estrellas para fondo espacial denso
      updateInterval: 16, // ~60 FPS
      renderQuality: 1.0,
      enableShadows: true,
      enableParticles: true,
      enableDamageNumbers: true,
      enableMinimap: true,
      enableSatellites: true,
    },
    ultra: {
      maxBots: 50,
      maxParticles: 500,
      maxBullets: 500,
      starCount: 10000, // Miles de estrellas para fondo espacial denso
      updateInterval: 16, // ~60 FPS
      renderQuality: 1.0,
      enableShadows: true,
      enableParticles: true,
      enableDamageNumbers: true,
      enableMinimap: true,
      enableSatellites: true,
    },
    extreme: {
      maxBots: 100,
      maxParticles: 1000,
      maxBullets: 1000,
      starCount: 15000, // Miles de estrellas para fondo espacial denso
      updateInterval: 8, // ~120 FPS
      renderQuality: 1.0,
      enableShadows: true,
      enableParticles: true,
      enableDamageNumbers: true,
      enableMinimap: true,
      enableSatellites: true,
      enableAdvancedAI: true,
      enablePhysics: true,
    },
  },

  // Detectar capacidades del dispositivo
  detectCapabilities() {
    // Detectar CPU
    this.deviceCapabilities.cpuCores = navigator.hardwareConcurrency || 4;

    // Detectar memoria
    this.deviceCapabilities.memory = navigator.deviceMemory || 4;

    // Detectar conexión
    if (navigator.connection) {
      this.deviceCapabilities.connection = navigator.connection.effectiveType;
    }

    // Detectar si es dispositivo móvil
    this.deviceCapabilities.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Detectar si tiene GPU acelerada
    this.deviceCapabilities.hasGPU = this.detectGPU();

    console.log("Device Capabilities:", this.deviceCapabilities);
  },

  // Detectar GPU
  detectGPU() {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return false;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return (
        renderer !==
        "ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_4_0 ps_4_0)"
      );
    }
    return true;
  },

  // Determinar configuración óptima basada en capacidades
  determineOptimalSettings() {
    let performanceMode = "high"; // Por defecto más agresivo

    // Usar configuración guardada si existe
    const savedMode = localStorage.getItem("performanceMode");
    if (
      savedMode &&
      ["low", "medium", "high", "ultra", "extreme"].includes(savedMode)
    ) {
      performanceMode = savedMode;
      this.deviceCapabilities.performanceMode = performanceMode;
      console.log("Usando modo guardado:", performanceMode);
      return this.qualitySettings[performanceMode] || this.qualitySettings.high;
    }

    // Configuración más agresiva por defecto
    if (this.deviceCapabilities.cpuCores >= 4) {
      performanceMode = "ultra";
    } else if (this.deviceCapabilities.cpuCores >= 2) {
      performanceMode = "high";
    } else {
      performanceMode = "medium";
    }

    // Solo degradar si es absolutamente necesario
    if (this.deviceCapabilities.memory < 2) {
      performanceMode = "low";
    } else if (this.deviceCapabilities.memory < 4) {
      if (performanceMode === "ultra") performanceMode = "high";
    }

    // No degradar por conexión lenta (juego offline)
    // if (this.deviceCapabilities.connection === 'slow-2g' || this.deviceCapabilities.connection === '2g') {
    //     performanceMode = 'low';
    // }

    // Móviles modernos pueden manejar más
    if (this.deviceCapabilities.isMobile) {
      if (performanceMode === "ultra") performanceMode = "high";
      // No degradar más en móviles
    }

    // GPU no es crítico para este juego
    // if (!this.deviceCapabilities.hasGPU) {
    //     if (performanceMode === 'ultra') performanceMode = 'high';
    //     if (performanceMode === 'high') performanceMode = 'medium';
    // }

    this.deviceCapabilities.performanceMode = performanceMode;
    console.log("Optimal Performance Mode:", performanceMode);

    return this.qualitySettings[performanceMode];
  },

  // Actualizar FPS y ajustar dinámicamente
  updatePerformanceMetrics(deltaTime) {
    this.deviceCapabilities.frameCount++;
    this.deviceCapabilities.lastFrameTime = deltaTime;

    // Calcular FPS promedio cada 60 frames
    if (this.deviceCapabilities.frameCount % 60 === 0) {
      this.deviceCapabilities.fps = Math.round(
        1000 / this.deviceCapabilities.averageFrameTime,
      );
      this.deviceCapabilities.averageFrameTime = deltaTime;

      // Solo degradar si el rendimiento es muy bajo (más tolerante)
      if (
        this.deviceCapabilities.fps < 20 &&
        this.deviceCapabilities.performanceMode !== "low"
      ) {
        this.downgradePerformance();
      } else if (
        this.deviceCapabilities.fps > 100 &&
        this.deviceCapabilities.performanceMode !== "extreme"
      ) {
        this.upgradePerformance();
      }
    }
  },

  // Degradar rendimiento
  downgradePerformance() {
    const modes = ["extreme", "ultra", "high", "medium", "low"];
    const currentIndex = modes.indexOf(this.deviceCapabilities.performanceMode);
    if (currentIndex < modes.length - 1) {
      this.deviceCapabilities.performanceMode = modes[currentIndex + 1];
      console.log(
        "Performance downgraded to:",
        this.deviceCapabilities.performanceMode,
      );
    }
  },

  // Mejorar rendimiento
  upgradePerformance() {
    const modes = ["ultra", "high", "medium", "low"];
    const currentIndex = modes.indexOf(this.deviceCapabilities.performanceMode);
    if (currentIndex > 0) {
      this.deviceCapabilities.performanceMode = modes[currentIndex - 1];
      console.log(
        "Performance upgraded to:",
        this.deviceCapabilities.performanceMode,
      );
    }
  },

  // Obtener configuración actual
  getCurrentSettings() {
    return this.qualitySettings[this.deviceCapabilities.performanceMode];
  },

  // Inicializar optimizador
  init() {
    this.detectCapabilities();
    const settings = this.determineOptimalSettings();
    console.log("Performance Optimizer initialized with settings:", settings);
    return settings;
  },
};

// Posiciones por defecto de los widgets principales
const DEFAULT_WIDGET_POSITIONS = {
  // minimapContainer eliminado - ahora es fijo en esquina superior derecha
  playerStats: { x: 10, y: 10 }, // Esquina superior izquierda
  notifications: { x: 20, y: 600 },
  widgetConfigButton: { x: 20, y: 20 },
  widgetControlPanel: { x: 20, y: 80 }, // Este debe estar oculto por defecto
  widgetInstructions: { x: 20, y: 200 }, // Este debe estar oculto por defecto
  skillsWidget: { x: window.innerWidth - 430, y: window.innerHeight - 100 },
};

// Helper para validar si una posición es válida (dentro de la pantalla y no NaN)
function isValidWidgetPosition(pos) {
  if (!pos) return false;
  if (typeof pos.x !== "number" || typeof pos.y !== "number") return false;
  if (isNaN(pos.x) || isNaN(pos.y)) return false;
  if (pos.x < 0 || pos.x > window.innerWidth) return false;
  if (pos.y < 0 || pos.y > window.innerHeight) return false;
  return true;
}

class CosmicDefender {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Inicializar sistema de optimización
    this.performanceSettings = PerformanceOptimizer.init();
    this.logManager = LogManager;
    this.lastFrameTime = 0;
    this.frameCount = 0;

    // Inicializar Web Worker para IA de bots (si está disponible)
    this.botWorker = null;
    this.useWebWorkers = PerformanceOptimizer.deviceCapabilities.cpuCores > 1;
    if (this.useWebWorkers && typeof Worker !== "undefined") {
      try {
        this.botWorker = new Worker("bot-worker.js");
        this.botWorker.onmessage = (e) => this.handleBotWorkerMessage(e);
        console.log("Web Worker para bots inicializado");
      } catch (error) {
        console.warn("No se pudo inicializar Web Worker:", error);
        this.useWebWorkers = false;
      }
    }

    // Game Integration System
    this.gameIntegration = null;
    this.serverId = null;
    this.sessionToken = null;
    this.walletAddress = null;

    // Server-specific configuration
    this.starFluxPerMinute = 1;
    this.maticPerHour = 0.001;
    this.expMultiplier = 1.0;
    this.enemyDensity = 0.8;
    this.powerUpFrequency = 0.6;

    this.gameState = "menu"; // menu, playing, shipSelect, connecting
    this.gameObjects = [];
    this.particles = [];
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];

    // Sistema de docking en ISS
    this.dockedAtISS = false;
    this.playerPositionBeforeDocking = null;
    this.powerUps = [];
    this.coinObjects = [];
    this.damageNumbers = [];
    this.score = 0;
    this.coins = 0;
    this.level = 1;
    this.exp = 0;
    this.expToNext = 100;
    this.skillPoints = 0; // Puntos de habilidad disponibles
    this.achievements = []; // Logros desbloqueados
    this.killStreak = 0; // Racha de kills
    this.lastKillTime = 0; // Tiempo del último kill
    this.minimapDisabled = false; // Controla si el minimapa está desactivado
    this.player = null;
    this.selectedShip = 0;
    this.keys = {};
    this.mouse = { x: 0, y: 0, clicked: false };
    this.touchAim = { active: false, angle: 0 }; // Controles táctiles para móvil
    this.lastShot = 0;
    this.abilityCooldown = 0;
    this.portalCooldown = false;

    // Development speed control
    this.speedMultiplier = 1.0; // Multiplicador de velocidad para desarrollo
    this.baseSpeed = 5; // Velocidad base de la nave

    // Widget system
    this.widgets = [];
    this.isWidgetEditMode = false;
    this.draggedWidget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.widgetStates = {}; // Estados de visibilidad de widgets

    // World map properties
    this.worldSize = 8000; // 4x larger map
    this.camera = { x: 0, y: 0 };
    this.mapGrid = [];
    this.obstacles = [];

    // Dungeon/Portal system inspired by RotMG
    this.portals = [];
    this.dungeons = [];
    this.activeDungeon = null;
    this.portalSpawnTimer = 0;
    this.portalSpawnInterval = 30000; // 30 seconds

    // Planet portals system - Posiciones estáticas mejor distribuidas
    this.planetPortals = [
      {
        name: "Mercurio",
        planet: "mercury",
        x: 1200,
        y: 1200,
        color: "#8B4513",
        icon: "☿",
        description: "Planeta más cercano al Sol",
        difficulty: 1,
      },
      {
        name: "Venus",
        planet: "venus",
        x: 6800,
        y: 1200,
        color: "#FFD700",
        icon: "♀",
        description: "Planeta del amor y la belleza",
        difficulty: 2,
      },
      {
        name: "Tierra",
        planet: "earth",
        x: 1200,
        y: 6800,
        color: "#4169E1",
        icon: "♁",
        description: "Nuestro hogar azul",
        difficulty: 3,
      },
      {
        name: "Marte",
        planet: "mars",
        x: 6800,
        y: 6800,
        color: "#DC143C",
        icon: "♂",
        description: "El planeta rojo",
        difficulty: 4,
      },
      {
        name: "Júpiter",
        planet: "jupiter",
        x: 2500,
        y: 2500,
        color: "#DAA520",
        icon: "♃",
        description: "El gigante gaseoso",
        difficulty: 5,
      },
      {
        name: "Saturno",
        planet: "saturn",
        x: 5500,
        y: 2500,
        color: "#F4A460",
        icon: "♄",
        description: "El señor de los anillos",
        difficulty: 6,
      },
      {
        name: "Urano",
        planet: "uranus",
        x: 2500,
        y: 5500,
        color: "#40E0D0",
        icon: "♅",
        description: "El planeta inclinado",
        difficulty: 7,
      },
      {
        name: "Neptuno",
        planet: "neptune",
        x: 5500,
        y: 5500,
        color: "#1E90FF",
        icon: "♆",
        description: "El planeta azul profundo",
        difficulty: 8,
      },
      {
        name: "Plutón",
        planet: "pluto",
        x: 4000,
        y: 2500,
        color: "#696969",
        icon: "♇",
        description: "El planeta enano",
        difficulty: 9,
      },
    ];

    // Boss system
    this.bosses = [];
    this.bossSpawnTimer = 0;
    this.bossSpawnInterval = 60000; // 1 minute

    // Clan system - now Space Stations in Earth's orbit
    this.clans = [
      {
        name: "Estación Alpha",
        color: "#0066ff",
        base: { x: 500, y: 500 },
        enemies: [],
        type: "space_station",
        faction: "Federación Terrestre",
        description: "Estación militar de la Federación",
      },
      {
        name: "Estación Beta",
        color: "#ff3333",
        base: { x: 7500, y: 500 },
        enemies: [],
        type: "space_station",
        faction: "Alianza Marciana",
        description: "Base de operaciones marciana",
      },
      {
        name: "Estación Gamma",
        color: "#33ff33",
        base: { x: 500, y: 7500 },
        enemies: [],
        type: "space_station",
        faction: "Confederación Lunar",
        description: "Estación lunar en órbita",
      },
      {
        name: "Estación Delta",
        color: "#ffff33",
        base: { x: 7500, y: 7500 },
        enemies: [],
        type: "space_station",
        faction: "Imperio Joviano",
        description: "Base de las lunas de Júpiter",
      },
    ];

    // Sistema de Bandos - Especializaciones dentro de cada clan
    this.bandos = [
      {
        name: "Asalto",
        icon: "⚔️",
        description: "Especialista en combate directo y daño máximo",
        stats: {
          damage: 3,
          speed: 1,
          health: 2,
          fireRate: -0.1,
        },
        bonus: {
          title: "Bonus de Asalto",
          description: "+50% daño crítico, +25% velocidad de disparo",
        },
        color: "#ff4444",
      },
      {
        name: "Defensa",
        icon: "🛡️",
        description: "Especialista en supervivencia y protección",
        stats: {
          damage: -1,
          speed: -1,
          health: 4,
          fireRate: 0,
        },
        bonus: {
          title: "Bonus de Defensa",
          description: "+100% vida, regeneración de escudo automática",
        },
        color: "#4444ff",
      },
      {
        name: "Velocidad",
        icon: "⚡",
        description: "Especialista en movilidad y esquiva",
        stats: {
          damage: -1,
          speed: 4,
          health: 1,
          fireRate: 0.1,
        },
        bonus: {
          title: "Bonus de Velocidad",
          description: "+75% velocidad, +50% cadencia de disparo",
        },
        color: "#44ff44",
      },
      {
        name: "Soporte",
        icon: "🔧",
        description: "Especialista en utilidad y apoyo de equipo",
        stats: {
          damage: 0,
          speed: 0,
          health: 2,
          fireRate: 0.2,
        },
        bonus: {
          title: "Bonus de Soporte",
          description: "Habilidades de curación, buffs de equipo",
        },
        color: "#ffff44",
      },
    ];

    // Earth properties for background
    this.earth = {
      x: this.worldSize / 2,
      y: this.worldSize / 2,
      radius: 1200,
      rotation: 0,
      rotationSpeed: 0.001,
    };

    // Satellite system
    this.satellites = [];
    this.satelliteSpawnTimer = 0;
    this.satelliteSpawnInterval = 15000; // 15 seconds

    this.playerClan = null;
    this.playerBando = null;
    this.hasShip = false; // Indica si el jugador tiene una nave
    this.shipDestroyed = false; // Indica si la nave fue destruida

    // Equipment system initialization
    this.equipment = {
      ship: null,
      weapon: null,
      shield: null,
      engine: null,
    };

    // En el constructor (agregar al inicio del constructor de CosmicDefender):
    this.earthImage = new Image();
    this.earthImage.onload = () => {
      console.log("Imagen de la Tierra cargada correctamente");
    };
    this.earthImage.onerror = () => {
      alert(
        "No se pudo cargar la imagen de la Tierra. Verifica la ruta: recursos_graficos/tierra(1).png",
      );
      console.error("Error al cargar la imagen de la Tierra");
    };
    this.earthImage.src = "recursos_graficos/tierra(1).png";

    // Enemy spawning
    this.enemySpawnTimer = 0;
    this.maxEnemies = 50; // More enemies for larger map

    // Nave básica oxidada - única nave disponible
    this.basicShip = {
      name: "Nave Oxidada",
      icon: "🛸",
      description: "Nave básica oxidada y desgastada",
      speed: 4,
      damage: 2,
      fireRate: 0.5,
      health: 80,
      ability: "Disparo Básico",
      class: "Basic",
      role: "Starter",
      specialAbility: "None",
      specialDescription: "Sin habilidades especiales",
      color: "#8B4513", // Marrón oxidado
      rustLevel: 0.8, // Nivel de oxidación (0-1)
    };

    // Equipment system with rarity levels (inspired by RotMG)
    this.equipment = {
      weapon: {
        name: "Basic Laser Gun",
        damage: 1,
        icon: "🔫",
        rarity: "Common",
        tier: 1,
      },
      shield: {
        name: "Basic Shield",
        defense: 0,
        icon: "🛡️",
        rarity: "Common",
        tier: 1,
      },
      engine: {
        name: "Basic Engine",
        speed: 0,
        icon: "⚡",
        rarity: "Common",
        tier: 1,
      },
    };

    // Sistema de logros
    this.achievementsList = [
      {
        id: "firstKill",
        name: "Primera Sangre",
        description: "Mata tu primer enemigo",
        reward: 50,
        unlocked: false,
      },
      {
        id: "killStreak5",
        name: "Máquina de Matar",
        description: "Mata 5 enemigos seguidos",
        reward: 100,
        unlocked: false,
      },
      {
        id: "killStreak10",
        name: "Asesino",
        description: "Mata 10 enemigos seguidos",
        reward: 200,
        unlocked: false,
      },
      {
        id: "survive5min",
        name: "Sobreviviente",
        description: "Sobrevive 5 minutos",
        reward: 150,
        unlocked: false,
      },
      {
        id: "level5",
        name: "Veterano",
        description: "Alcanza nivel 5",
        reward: 300,
        unlocked: false,
      },
      {
        id: "level10",
        name: "Experto",
        description: "Alcanza nivel 10",
        reward: 500,
        unlocked: false,
      },
      {
        id: "completePlanet",
        name: "Conquistador",
        description: "Completa un planeta",
        reward: 1000,
        unlocked: false,
      },
      {
        id: "richPlayer",
        name: "Rico",
        description: "Acumula 1000 monedas",
        reward: 200,
        unlocked: false,
      },
    ];

    // Sistema de habilidades
    this.skills = {
      q: {
        name: "Ráfaga Rápida",
        icon: "⚡",
        cooldown: 0,
        maxCooldown: 5000,
        description: "Dispara 5 proyectiles rápidamente",
      },
      e: {
        name: "Escudo Temporal",
        icon: "🛡️",
        cooldown: 0,
        maxCooldown: 8000,
        description: "Escudo que bloquea daño por 3 segundos",
      },
      r: {
        name: "Turbo Boost",
        icon: "🚀",
        cooldown: 0,
        maxCooldown: 6000,
        description: "Aumenta velocidad por 5 segundos",
      },
      t: {
        name: "Mega Disparo",
        icon: "💥",
        cooldown: 0,
        maxCooldown: 10000,
        description: "Dispara un proyectil masivo",
      },
      f: {
        name: "Campo de Fuerza",
        icon: "🌀",
        cooldown: 0,
        maxCooldown: 15000,
        description: "Empuja enemigos lejos",
      },
    };

    // Item database inspired by RotMG
    this.itemDatabase = {
      weapons: [
        {
          name: "Laser Pistol",
          damage: 1,
          icon: "🔫",
          rarity: "Common",
          tier: 1,
        },
        {
          name: "Plasma Rifle",
          damage: 3,
          icon: "🔫",
          rarity: "Uncommon",
          tier: 2,
        },
        {
          name: "Quantum Cannon",
          damage: 5,
          icon: "🔫",
          rarity: "Rare",
          tier: 3,
        },
        {
          name: "Void Blaster",
          damage: 8,
          icon: "🔫",
          rarity: "Epic",
          tier: 4,
        },
        {
          name: "Cosmic Destroyer",
          damage: 12,
          icon: "🔫",
          rarity: "Legendary",
          tier: 5,
        },
      ],
      shields: [
        {
          name: "Basic Shield",
          defense: 0,
          icon: "🛡️",
          rarity: "Common",
          tier: 1,
        },
        {
          name: "Reinforced Shield",
          defense: 2,
          icon: "🛡️",
          rarity: "Uncommon",
          tier: 2,
        },
        {
          name: "Energy Barrier",
          defense: 4,
          icon: "🛡️",
          rarity: "Rare",
          tier: 3,
        },
        {
          name: "Quantum Shield",
          defense: 6,
          icon: "🛡️",
          rarity: "Epic",
          tier: 4,
        },
        {
          name: "Cosmic Aegis",
          defense: 10,
          icon: "🛡️",
          rarity: "Legendary",
          tier: 5,
        },
      ],
      engines: [
        {
          name: "Basic Engine",
          speed: 0,
          icon: "⚡",
          rarity: "Common",
          tier: 1,
        },
        {
          name: "Turbo Engine",
          speed: 1,
          icon: "⚡",
          rarity: "Uncommon",
          tier: 2,
        },
        {
          name: "Quantum Drive",
          speed: 2,
          icon: "⚡",
          rarity: "Rare",
          tier: 3,
        },
        { name: "Warp Engine", speed: 3, icon: "⚡", rarity: "Epic", tier: 4 },
        {
          name: "Cosmic Thruster",
          speed: 5,
          icon: "⚡",
          rarity: "Legendary",
          tier: 5,
        },
      ],
    };

    // Multiplayer system
    this.maxPlayers = 40;
    this.players = []; // All players including bots
    this.bots = []; // Bot players
    this.humanPlayers = []; // Human players
    this.playerName = "Player";

    // 1. Añade la clave de mapeo de skills por defecto y su carga/guardado
    this.DEFAULT_SKILL_KEYMAP = ["q", "e", "r", "t", "f"];

    // En el constructor de CosmicDefender, carga el mapeo de teclas personalizado si existe
    this.skillKeyMap = JSON.parse(
      localStorage.getItem("skillKeyMap") ||
        JSON.stringify(this.DEFAULT_SKILL_KEYMAP),
    );

    this.init();
    // Asegurar que los paneles principales NO sean widgets
    setTimeout(() => {
      document.getElementById("gameMenu")?.classList.remove("widget");
      document.getElementById("clanSelector")?.classList.remove("widget");
      document.getElementById("shipSelector")?.classList.remove("widget");
      this.hideAllWidgets();
    }, 100);

    // 1. Eliminar la creación del contenedor HTML del minimapa
    // 2. Añadir propiedades para la posición del minimapa como widget
    // En el constructor de CosmicDefender, agrega:
    this.minimapWidget = {
      x: 100, // posición inicial X
      y: 100, // posición inicial Y
      width: 150,
      height: 170, // 150 minimapa + 20 título
      dragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
    };
    this.selectedSkillIdx = null;
  }

  init() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Inicializar monedas si no existen
    localStorage.setItem("coins", "0");

    this.listenersRegistered = false; // Nueva bandera para listeners
    this.setupEventListeners();
    this.setupUI();
    // speedControl eliminado - no es necesario para juego móvil
    this.createWidgetSystem(); // Crear sistema de widgets movibles

    // Check if we have integration data from URL parameters
    this.checkIntegrationData();

    this.showMenu(); // Mostrar menú principal
    this.gameLoop();
  }

  resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Zoom in 30%: reducir baseWidth/Height en 30% (1200 * 0.7 = 840)
            const baseWidth = 840; // Reducido 30% para zoom in
            const baseHeight = 560; // Reducido 30% para zoom in

            // Calculate scale to fit the screen while maintaining aspect ratio (letterboxing)
            this.scale = Math.min(this.canvas.width / baseWidth, this.canvas.height / baseHeight);

            // Calculate offsets to center the scaled content
            this.renderOffsetX = (this.canvas.width - (baseWidth * this.scale)) / 2;
            this.renderOffsetY = (this.canvas.height - (baseHeight * this.scale)) / 2;
        }
  // Check for integration data from URL parameters
  checkIntegrationData() {
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get("serverId");
    const sessionToken = urlParams.get("sessionToken");
    const walletAddress = urlParams.get("wallet");

    if (serverId && sessionToken && walletAddress) {
      console.log("🔗 Integration data found in URL");
      this.connectToServer(serverId, sessionToken, walletAddress);
    } else {
      console.log("📋 No integration data found, using standalone mode");
    }
  }

  // Connect to server with integration
  async connectToServer(serverId, sessionToken, walletAddress) {
    try {
      console.log("🚀 Connecting to server:", serverId);

      this.serverId = serverId;
      this.sessionToken = sessionToken;
      this.walletAddress = walletAddress;

      // Initialize game integration
      this.gameIntegration = new GameIntegration();
      const success = await this.gameIntegration.initialize(
        serverId,
        sessionToken,
        walletAddress,
      );

      if (success) {
        // Apply server configuration
        this.gameIntegration.applyServerConfig(this);

        // Check if user can play
        if (this.gameIntegration.canPlay()) {
          console.log("✅ User can play, starting game...");
          this.gameState = "connecting";
          this.showConnectingScreen();
        } else {
          console.log(
            "❌ User cannot play:",
            this.gameIntegration.getPlayabilityMessage(),
          );
          this.showPlayabilityError(
            this.gameIntegration.getPlayabilityMessage(),
          );
        }
      } else {
        console.error("❌ Failed to initialize game integration");
        this.showConnectionError();
      }
    } catch (error) {
      console.error("❌ Connection error:", error);
      this.showConnectionError();
    }
  }

  // Show connecting screen
  showConnectingScreen() {
    const menuContainer = document.getElementById("menuContainer");
    if (menuContainer) {
      menuContainer.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h2>🚀 Connecting to ${this.serverId}</h2>
                    <div class="loading-spinner"></div>
                    <p>Loading game configuration...</p>
                </div>
            `;
    }

    // Simulate loading time and start game
    setTimeout(() => {
      this.startGame();
    }, 2000);
  }

  // Show playability error
  showPlayabilityError(message) {
    const menuContainer = document.getElementById("menuContainer");
    if (menuContainer) {
      menuContainer.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h2>❌ Cannot Play</h2>
                    <p style="color: #ff6b6b;">${message}</p>
                    <button onclick="window.location.href='/servers'" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Back to Server Selection</button>
                </div>
            `;
    }
  }

  // Show connection error
  showConnectionError() {
    const menuContainer = document.getElementById("menuContainer");
    if (menuContainer) {
      menuContainer.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h2>❌ Connection Failed</h2>
                    <p style="color: #ff6b6b;">Failed to connect to server</p>
                    <button onclick="window.location.href='/servers'" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Back to Server Selection</button>
                </div>
            `;
    }
  }

  setupEventListeners() {
    if (this.listenersRegistered) return; // Evitar duplicados
    this.listenersRegistered = true;

    // Funciones nombradas para poder remover si es necesario
    this._onKeyDown = (e) => {
      const pressedKey = e.key.toLowerCase();
      this.keys[pressedKey] = true;
      if (pressedKey === "i") {
        e.preventDefault();
        this.toggleInventory();
      }
      if (pressedKey === "c") {
        e.preventDefault();
        this.toggleSkillTree();
      }
      // Busca la habilidad asociada a la tecla presionada
      const idx = this.skillKeyMap.indexOf(pressedKey);
      if (idx !== -1) {
        const skillKey = this.DEFAULT_SKILL_KEYMAP[idx];
        this.useSkill(skillKey);
      }
    };
    this._onKeyUp = (e) => {
      this.keys[e.key.toLowerCase()] = false;
    };
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };
    this._onMouseClick = () => {
      LogManager.log("debug", "[Disparo P1] Click detectado.");
      this.mouse.clicked = true;
    };

    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("keyup", this._onKeyUp);
    this.canvas.addEventListener("mousemove", this._onMouseMove);
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouse.clicked = true;
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouse.clicked = false;
    });

    // Listeners de botones principales (solo si existen)
    const startGameBtn = document.getElementById("startGame");
    if (startGameBtn && !startGameBtn._listenerAdded) {
      startGameBtn.addEventListener("click", () => {
        this.startGame();
      });
      startGameBtn._listenerAdded = true;
    }
    const selectClanBtn = document.getElementById("selectClan");
    if (selectClanBtn && !selectClanBtn._listenerAdded) {
      selectClanBtn.addEventListener("click", () => {
        this.showClanSelector();
      });
      selectClanBtn._listenerAdded = true;
    }
    const goToDungeonsBtn = document.getElementById("goToDungeons");
    if (goToDungeonsBtn && !goToDungeonsBtn._listenerAdded) {
      goToDungeonsBtn.addEventListener("click", () => {
        window.location.href = "mercury.html";
      });
      goToDungeonsBtn._listenerAdded = true;
    }
    const goToMarketBtn = document.getElementById("goToMarket");
    if (goToMarketBtn && !goToMarketBtn._listenerAdded) {
      goToMarketBtn.addEventListener("click", () => {
        window.open("market.html", "_blank");
      });
      goToMarketBtn._listenerAdded = true;
    }
    const addCoinsBtn = document.getElementById("addCoins");
    if (addCoinsBtn && !addCoinsBtn._listenerAdded) {
      addCoinsBtn.addEventListener("click", () => {
        this.addTestCoins(100);
      });
      addCoinsBtn._listenerAdded = true;
    }
    const debugClanBtn = document.getElementById("debugClan");
    if (debugClanBtn && !debugClanBtn._listenerAdded) {
      debugClanBtn.addEventListener("click", () => {
        this.debugClanSelector();
      });
      debugClanBtn._listenerAdded = true;
    }
    const backToMenuFromClanBtn = document.getElementById("backToMenuFromClan");
    if (backToMenuFromClanBtn && !backToMenuFromClanBtn._listenerAdded) {
      backToMenuFromClanBtn.addEventListener("click", () => {
        this.showMenu();
      });
      backToMenuFromClanBtn._listenerAdded = true;
    }
    const confirmClanBtn = document.getElementById("confirmClan");
    if (confirmClanBtn && !confirmClanBtn._listenerAdded) {
      confirmClanBtn.addEventListener("click", () => {
        if (this.playerClan !== null) {
          // Ir al market en lugar del menú
          showMarketInIframe();
        }
      });
      confirmClanBtn._listenerAdded = true;
    }
    const confirmBandoBtn = document.getElementById("confirmBando");
    if (confirmBandoBtn && !confirmBandoBtn._listenerAdded) {
      confirmBandoBtn.addEventListener("click", () => {
        if (this.playerBando !== null) {
          this.showMenu();
          const startButton = document.getElementById("startGame");
          if (startButton) {
            startButton.disabled = false;
            startButton.textContent = `Iniciar Juego (${this.clans[this.playerClan].name} - ${this.bandos[this.playerBando].name})`;
          }
        }
      });
      confirmBandoBtn._listenerAdded = true;
    }
    const backToClanSelectorBtn = document.getElementById("backToClanSelector");
    if (backToClanSelectorBtn && !backToClanSelectorBtn._listenerAdded) {
      backToClanSelectorBtn.addEventListener("click", () => {
        this.showClanSelector();
      });
      backToClanSelectorBtn._listenerAdded = true;
    }
    window.game = this;
  }

  setupUI() {
    // UI setup for basic ship only
    this.checkShipStatus();
  }

  checkShipStatus() {
    // Verificar si el jugador tiene una nave
    const hasShip = localStorage.getItem("hasShip");
    this.hasShip = hasShip === "true";

    // Actualizar monedas en el menú
    this.updateMenuCoins();

    // Actualizar UI si el juego está activo
    if (this.gameState === "playing" && this.player) {
      this.updateUI();
    }
  }

  updateMenuCoins() {
    const currentCoins = parseInt(localStorage.getItem("coins") || "0");
    const coinsElement = document.getElementById("coins");
    if (coinsElement) {
      coinsElement.textContent = currentCoins;
    }
  }

  // Función para agregar monedas de prueba (solo para desarrollo)
  addTestCoins(amount = 100) {
    console.log("=== AGREGANDO MONEDAS ===");
    console.log(
      "Monedas actuales en localStorage:",
      localStorage.getItem("coins"),
    );

    const currentCoins = parseInt(localStorage.getItem("coins") || "0");
    console.log("Monedas actuales parseadas:", currentCoins);

    const newCoins = currentCoins + amount;
    console.log("Nuevas monedas calculadas:", newCoins);

    localStorage.setItem("coins", newCoins.toString());
    console.log(
      "Monedas guardadas en localStorage:",
      localStorage.getItem("coins"),
    );

    // Verificar que se guardó correctamente
    const verifyCoins = localStorage.getItem("coins");
    console.log("Verificación de monedas guardadas:", verifyCoins);

    this.coins = newCoins;
    this.updateMenuCoins();
    this.updateUI();

    console.log("=== FIN AGREGAR MONEDAS ===");
    alert(
      `Se agregaron ${amount} monedas. Total: ${newCoins}\nVerifica la consola para más detalles.`,
    );
  }

  // Función de debug para el clan selector
  debugClanSelector() {
    console.log("=== DEBUG CLAN SELECTOR ===");
    console.log("Clans data:", this.clans);
    console.log("Player clan:", this.playerClan);

    const clanSelector = document.getElementById("clanSelector");
    const clansGrid = document.getElementById("clansGrid");

    console.log("Clan selector element:", clanSelector);
    console.log("Clans grid element:", clansGrid);

    if (clanSelector) {
      console.log("Clan selector display:", clanSelector.style.display);
      console.log(
        "Clan selector visibility:",
        window.getComputedStyle(clanSelector).visibility,
      );
      console.log(
        "Clan selector z-index:",
        window.getComputedStyle(clanSelector).zIndex,
      );
    }

    if (clansGrid) {
      console.log("Clans grid children:", clansGrid.children.length);
      console.log("Clans grid HTML:", clansGrid.innerHTML);
    }

    // Agregar event listener global para detectar navegación
    window.addEventListener("beforeunload", (e) => {
      console.log("=== NAVEGACIÓN DETECTADA ===");
      console.log("Event:", e);
      console.log("Current URL:", window.location.href);
      console.log("Target URL:", e.target.location?.href);
    });

    // Forzar mostrar el selector
    this.showClanSelector();

    alert("Debug info enviada a la consola. Revisa F12 > Console");
  }

  // createSpeedControl eliminado - no es necesario para juego móvil

  registerAllGameWidgets() {
    // Registrar widgets del juego
    this.registerGameWidgets();

    // Registrar widgets dinámicos
    this.registerDynamicWidgets();

    // Registrar widgets post-juego
    this.registerPostGameWidgets();

    // Registrar panel de performance
    // performancePanel eliminado - no es necesario para juego móvil

    // Forzar actualización del panel
    this.forceUpdateWidgetPanel();
  }

  registerGameWidgets() {
    // Widgets de la interfaz principal
    this.registerWidget(
      "playerStats",
      ".player-stats",
      { x: 10, y: 10 },
      "Estadísticas del Jugador",
    );

    // Widgets de botones de tienda (se crean dinámicamente)
    this.registerWidget(
      "tiendaBtn",
      "#tiendaBtn",
      { x: window.innerWidth / 2 - 100, y: 80 },
      "Botón de Tienda",
      true,
    );

    // Widgets de notificaciones (futuros)
    this.registerWidget(
      "notifications",
      null,
      { x: 10, y: window.innerHeight - 100 },
      "Notificaciones",
      true,
    );

    // Crear contenedor para el minimapa existente
    this.createMinimapContainer();

    // Registrar elementos que pueden no existir aún
    this.registerDynamicWidgets();
  }

  registerDynamicWidgets() {
    // Registrar elementos que se crean dinámicamente durante el juego
    setTimeout(() => {
      // Intentar registrar elementos que pueden aparecer más tarde
      this.registerWidget(
        "tiendaBtn",
        "#tiendaBtn",
        { x: window.innerWidth / 2 - 100, y: 80 },
        "Botón de Tienda",
      );
    }, 1000);
  }

  registerPostGameWidgets() {
    // Registrar widgets que aparecen después de iniciar el juego
    setTimeout(() => {
      // Botón de tienda (se crea en updateUI)
      this.registerWidget(
        "tiendaBtn",
        "#tiendaBtn",
        { x: window.innerWidth / 2 - 100, y: 80 },
        "Botón de Tienda",
      );

      // Actualizar el panel de control
      this.updateWidgetControlPanel();
    }, 2000);
  }

  forceUpdateWidgetPanel() {
    // Forzar actualización del panel de control
    if (this.isWidgetEditMode) {
      this.updateWidgetControlPanel();
    }
  }

  registerWidget(id, selector, defaultPosition, name, isDynamic = false) {
    let element = null;

    if (selector) {
      element = document.querySelector(selector);
    }

    // Si el elemento no existe y es dinámico, lo creamos
    if (!element && isDynamic) {
      element = this.createDynamicWidget(id, name);
    }

    if (element) {
      // Verificar si ya está registrado
      if (element.classList.contains("widget")) {
        return; // Ya está registrado
      }

      // Agregar clases y atributos para el sistema de widgets
      element.className += " widget";
      element.dataset.widgetId = id;
      element.dataset.widgetName = name;

      // Establecer posición por defecto si no tiene posición fija
      if (element.style.position !== "fixed") {
        element.style.position = "fixed";
        element.style.left = defaultPosition.x + "px";
        element.style.top = defaultPosition.y + "px";
        element.style.zIndex = "1000";
      }

      // Agregar al sistema
      this.addWidget(element, id, defaultPosition, name);

      // Inicializar estado
      if (!this.widgetStates[id]) {
        this.widgetStates[id] = { visible: true, position: defaultPosition };
      }

      // Actualizar panel de control si está en modo edición
      if (this.isWidgetEditMode) {
        this.updateWidgetControlPanel();
      }
    }
  }

  createDynamicWidget(id, name) {
    let element = null;

    switch (id) {
      case "notifications":
        element = document.createElement("div");
        element.id = "notificationsContainer";
        element.style.cssText = `
                    position: fixed;
                    width: 300px;
                    height: 100px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #ffff00;
                    border-radius: 5px;
                    z-index: 1000;
                    color: white;
                    padding: 10px;
                    font-size: 12px;
                `;
        element.innerHTML = `<div style="font-weight: bold; margin-bottom: 5px;">${name}</div><div>Área para notificaciones</div>`;
        document.body.appendChild(element);
        break;
    }

    return element;
  }

  createMinimapContainer() {
    console.log("🔍 Iniciando createMinimapContainer...");

    let minimapDiv = document.getElementById("minimapContainer");
    if (!minimapDiv) {
      console.log("📝 Creando nuevo minimapContainer");
      minimapDiv = document.createElement("div");
      minimapDiv.id = "minimapContainer";
      // Fijado en esquina superior derecha, siempre visible
      minimapDiv.style.cssText = `
        position: fixed;
        right: 5px;
        top: 5px;
        z-index: 9999;
        pointer-events: auto;
        display: block !important;
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid #00ff88;
        border-radius: 6px;
        padding: 4px;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        width: 112px;
        height: 126px;
      `;
      document.body.appendChild(minimapDiv);
      console.log("✅ minimapDiv creado y agregado al body");
    } else {
      console.log("ℹ️ minimapContainer ya existe");
    }

    // Si ya existe un canvas, no crear otro
    let minimapCanvas = minimapDiv.querySelector("canvas");
    if (!minimapCanvas) {
      console.log("📝 Creando nuevo canvas del minimapa");
      minimapCanvas = document.createElement("canvas");
      minimapCanvas.id = "minimapCanvas";
      minimapCanvas.width = 105;  // 150 * 0.7 = 105 (reducido 30%)
      minimapCanvas.height = 119; // 170 * 0.7 = 119 (reducido 30%)
      minimapCanvas.style.cssText = `
        display: block;
        border-radius: 4px;
      `;
      minimapDiv.appendChild(minimapCanvas);
      console.log("✅ Canvas del minimapa creado");
    } else {
      console.log("ℹ️ Canvas del minimapa ya existe");
    }

    // Asegurar que esté visible
    minimapDiv.style.display = "block";

    console.log("✅ Minimapa configurado - posición:", {
      right: minimapDiv.style.right,
      top: minimapDiv.style.top,
      display: minimapDiv.style.display,
      zIndex: minimapDiv.style.zIndex
    });

    // NO registrar como widget - está siempre fijo y activo
    // this.registerWidget(...) eliminado
  }

  createWidgetSystem() {
    // Nuevo sistema simplificado de botones individuales para mostrar/ocultar widgets
    this.createWidgetToggleButtons();

    // Los elementos fijos (minimapa y estadísticas) no necesitan botones
    // ya que están siempre visibles
  }

  createWidgetToggleButtons() {
    // Botones de toggle eliminados - ya no se usan
    // El botón de configuración de calidad se crea en showQualityMenu()
  }

  // DESHABILITADO - Sistema antiguo de widgets reemplazado por botones individuales
  createWidgetInstructions() {
    // Función deshabilitada - ya no se usa el sistema antiguo de widgets
  }

  // DESHABILITADO - Sistema antiguo de widgets reemplazado por botones individuales
  toggleWidgetEditMode() {
    // Función deshabilitada - ya no se usa el sistema antiguo de widgets
    return;

    /* CÓDIGO ANTIGUO DESHABILITADO
    this.isWidgetEditMode = !this.isWidgetEditMode;
    const configButton = document.getElementById("widgetConfigButton");
    const instructions = document.getElementById("widgetInstructions");
    const controlPanel = document.getElementById("widgetControlPanel");

    // Asegurar que el botón de configuración siempre esté visible y encima
    configButton.style.display = "block";
    configButton.style.zIndex = "99999";
    configButton.style.pointerEvents = "auto";

    if (this.isWidgetEditMode) {
      // Entrar en modo edición
      configButton.innerHTML = "✅ Terminar";
      configButton.style.borderColor = "#00ff00";
      configButton.style.color = "#00ff00";
      instructions.style.display = "block";
      controlPanel.style.display = "block";

      // Actualizar panel de control
      this.updateWidgetControlPanel();

      // Agregar botón de resetear
      this.createResetButton();

      // Hacer widgets movibles
      this.makeWidgetsDraggable();

      // Forzar registro de widgets existentes
      this.forceRegisterExistingWidgets();

      // PARCHE: Eliminar widgets no utilizados y arreglar funcionalidad
      setTimeout(() => {
        this.removeUnusedWidgets();
        this.forceWidgetDraggability();
        this.fixPlayerStatsWidget();
        this.debugWidgetMovement(); // Debug para diagnosticar problemas
      }, 100);

      // 4. Agrega el botón 'Guardar cambios' junto a 'Terminar' en el panel de edición de widgets
      if (!document.getElementById("saveWidgetsButton")) {
        const saveBtn = document.createElement("button");
        saveBtn.id = "saveWidgetsButton";
        saveBtn.className = "widget";
        saveBtn.dataset.widgetId = "saveWidgetsButton";
        saveBtn.dataset.widgetName = "Botón Guardar";
        saveBtn.innerHTML = "💾 Guardar cambios";
        saveBtn.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 320px;
                    background: rgba(0, 255, 0, 0.8);
                    border: 2px solid #00ff00;
                    border-radius: 8px;
                    padding: 10px 15px;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 10001;
                    display: block;
                    transition: background 0.2s;
                `;
        saveBtn.onclick = () => {
          this.saveWidgetPositions();
          this.saveWidgetStates();
          localStorage.setItem("skillKeyMap", JSON.stringify(this.skillKeyMap));
          saveBtn.style.background = "rgba(0,200,0,1)";
          saveBtn.innerHTML = "✔ Guardado";
          setTimeout(() => {
            saveBtn.style.background = "rgba(0,255,0,0.8)";
            saveBtn.innerHTML = "💾 Guardar cambios";
          }, 1200);
        };
        document.body.appendChild(saveBtn);
        this.addWidget(
          saveBtn,
          "saveWidgetsButton",
          { x: 320, y: 20 },
          "Botón Guardar",
        );
      }
    } else {
      // Salir del modo edición
      configButton.innerHTML = "⚙️ Configurar UI";
      configButton.style.borderColor = "#ff6b35";
      configButton.style.color = "white";
      instructions.style.display = "none";
      controlPanel.style.display = "none";

      // Remover botón de resetear
      this.removeResetButton();

      // Hacer widgets no movibles
      this.makeWidgetsStatic();

      // Guardar posiciones y estados
      this.saveWidgetPositions();
      this.saveWidgetStates();

      // Al salir del modo edición, elimina el botón si existe
      const saveBtn = document.getElementById("saveWidgetsButton");
      if (saveBtn) saveBtn.remove();
    }
    FIN CÓDIGO ANTIGUO DESHABILITADO */
  }

  createResetButton() {
    if (document.getElementById("resetWidgetsButton")) return;

    const resetButton = document.createElement("button");
    resetButton.id = "resetWidgetsButton";
    resetButton.className = "widget";
    resetButton.dataset.widgetId = "resetWidgetsButton";
    resetButton.dataset.widgetName = "Botón Resetear";
    resetButton.innerHTML = "🔄 Resetear Posiciones";
    resetButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 200px;
            background: rgba(255, 0, 0, 0.8);
            border: 2px solid #ff0000;
            border-radius: 8px;
            padding: 10px 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
            display: none;
        `;

    resetButton.onclick = () => {
      this.resetWidgetPositions();
    };

    document.body.appendChild(resetButton);

    // Agregar al sistema de widgets
    this.addWidget(
      resetButton,
      "resetWidgetsButton",
      { x: 200, y: 20 },
      "Botón Resetear",
    );
  }

  removeResetButton() {
    const resetButton = document.getElementById("resetWidgetsButton");
    if (resetButton) {
      resetButton.remove();
    }
  }

  makeWidgetsDraggable() {
    document.querySelectorAll(".widget").forEach((widget) => {
      widget.style.cursor = "move";
      widget.style.border = "2px solid #00ff00";
      widget.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.5)";

      // Remover eventos anteriores para evitar duplicados
      widget.removeEventListener("mousedown", (e) =>
        this.startWidgetDrag(e, widget),
      );

      // Agregar eventos de drag
      widget.addEventListener("mousedown", (e) =>
        this.startWidgetDrag(e, widget),
      );

      LogManager.log(
        "info",
        `Widget ${widget.dataset.widgetName || widget.id} hecho arrastrable`,
      );
    });

    LogManager.log(
      "info",
      `Total de widgets arrastrables: ${document.querySelectorAll(".widget").length}`,
    );
  }

  makeWidgetsStatic() {
    document.querySelectorAll(".widget").forEach((widget) => {
      widget.style.cursor = "default";
      widget.style.border = "2px solid #00ff00";
      widget.style.boxShadow = "none";

      // Remover eventos de drag
      widget.removeEventListener("mousedown", (e) =>
        this.startWidgetDrag(e, widget),
      );
    });
  }

  startWidgetDrag(e, widget) {
    if (!this.isWidgetEditMode) return;

    // Permitir arrastrar desde cualquier parte del widget
    // Solo evitar arrastrar si se hace clic en elementos interactivos específicos
    const target = e.target;

    // Evitar arrastrar si se hace clic en botones, inputs, o elementos con clase 'no-drag'
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.closest("button") ||
      target.classList.contains("no-drag") ||
      target.closest(".no-drag")
    ) {
      return; // No arrastrar si se hace clic en un elemento interactivo
    }

    e.preventDefault();
    e.stopPropagation();

    this.draggedWidget = widget;

    const rect = widget.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    // Agregar clase visual para indicar que se está arrastrando
    widget.style.opacity = "0.8";
    widget.style.transform = "scale(1.02)";

    document.addEventListener("mousemove", this.handleWidgetDrag);
    document.addEventListener("mouseup", this.stopWidgetDrag);

    LogManager.log(
      "info",
      `Iniciando arrastre de widget: ${widget.dataset.widgetName || widget.id}`,
    );
  }

  handleWidgetDrag = (e) => {
    if (!this.draggedWidget) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    // Mantener dentro de los límites de la pantalla
    const maxX = window.innerWidth - this.draggedWidget.offsetWidth;
    const maxY = window.innerHeight - this.draggedWidget.offsetHeight;

    this.draggedWidget.style.left = Math.max(0, Math.min(x, maxX)) + "px";
    this.draggedWidget.style.top = Math.max(0, Math.min(y, maxY)) + "px";
  };

  stopWidgetDrag = () => {
    if (this.draggedWidget) {
      // Restaurar apariencia normal
      this.draggedWidget.style.opacity = "1";
      this.draggedWidget.style.transform = "scale(1)";

      LogManager.log(
        "info",
        `Finalizado arrastre de widget: ${this.draggedWidget.dataset.widgetName || this.draggedWidget.id}`,
      );
      this.draggedWidget = null;
    }

    document.removeEventListener("mousemove", this.handleWidgetDrag);
    document.removeEventListener("mouseup", this.stopWidgetDrag);
  };

  addWidget(element, type, defaultPosition, name = "") {
    this.widgets.push({
      element: element,
      type: type,
      defaultPosition: defaultPosition,
      name: name,
    });
  }

  saveWidgetPositions() {
    const positions = {};
    this.widgets.forEach((widget) => {
      const rect = widget.element.getBoundingClientRect();
      positions[widget.type] = {
        x: rect.left,
        y: rect.top,
      };
    });

    localStorage.setItem("widgetPositions", JSON.stringify(positions));
    LogManager.log("info", "Posiciones de widgets guardadas");
  }

  // Modifica loadWidgetPositions para validar la config guardada y usar la default si es inválida
  loadWidgetPositions() {
    const saved = localStorage.getItem("widgetPositions");
    let positions = {};
    let useDefault = false;
    if (saved) {
      try {
        positions = JSON.parse(saved);
        // Verifica que todos los widgets principales tengan posición válida
        for (const key of Object.keys(DEFAULT_WIDGET_POSITIONS)) {
          if (!isValidWidgetPosition(positions[key])) {
            useDefault = true;
            break;
          }
        }
      } catch (e) {
        useDefault = true;
      }
    } else {
      useDefault = true;
    }
    this.widgets.forEach((widget) => {
      let pos;
      if (!useDefault && positions[widget.type]) {
        pos = positions[widget.type];
      } else {
        pos = DEFAULT_WIDGET_POSITIONS[widget.type];
      }
      if (pos) {
        widget.element.style.left = pos.x + "px";
        widget.element.style.top = pos.y + "px";
      }
      // Visibilidad: si hay guardada y es válida, úsala, si no, por defecto
      if (
        !useDefault &&
        positions[widget.type] &&
        typeof positions[widget.type].visible !== "undefined"
      ) {
        widget.element.style.display = positions[widget.type].visible
          ? "block"
          : "none";
      } else {
        // Por defecto: paneles de edición ocultos, principales visibles
        if (
          widget.type === "widgetControlPanel" ||
          widget.type === "widgetInstructions"
        ) {
          widget.element.style.display = "none";
        }
        if (
          widget.type === "widgetConfigButton" ||
          ["playerStats", "minimapContainer", "notifications"].includes(
            widget.type,
          )
        ) {
          widget.element.style.display = "block";
        }
      }
    });
    LogManager.log(
      "info",
      useDefault
        ? "Se usaron posiciones por defecto para widgets"
        : "Posiciones y visibilidad de widgets cargadas de localStorage",
    );
  }

  resetWidgetPositions() {
    this.widgets.forEach((widget) => {
      const pos = widget.defaultPosition;
      widget.element.style.left = pos.x + "px";
      widget.element.style.top = pos.y + "px";
    });

    localStorage.removeItem("widgetPositions");
    LogManager.log("info", "Posiciones de widgets reseteadas");
  }

  createWidgetControlPanel() {
    const controlPanel = document.createElement("div");
    controlPanel.id = "widgetControlPanel";
    controlPanel.className = "widget";
    controlPanel.dataset.widgetId = "widgetControlPanel";
    controlPanel.dataset.widgetName = "Control de Widgets";
    controlPanel.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff6b35;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10002;
            display: none;
            max-width: 250px;
            max-height: 400px;
            overflow-y: auto;
            cursor: move;
            user-select: none;
        `;

    controlPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 15px; color: #ff6b35; text-align: center;">
                🎛️ Control de Widgets
            </div>
            <div id="widgetList" style="margin-bottom: 15px;">
                <!-- Lista de widgets se generará dinámicamente -->
            </div>
            <div style="border-top: 1px solid #333; padding-top: 10px;">
                <button id="showAllWidgets" style="width: 100%; margin-bottom: 5px; padding: 5px; background: #00ff00; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    👁️ Mostrar Todos
                </button>
                <button id="hideAllWidgets" style="width: 100%; margin-bottom: 5px; padding: 5px; background: #ff0000; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    🙈 Ocultar Todos
                </button>
                <button id="resetAllWidgets" style="width: 100%; padding: 5px; background: #ff6b35; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    🔄 Resetear Todo
                </button>
            </div>
        `;

    document.body.appendChild(controlPanel);

    // Eventos de los botones
    document.getElementById("showAllWidgets").onclick = () =>
      this.showAllWidgets();
    document.getElementById("hideAllWidgets").onclick = () =>
      this.hideAllWidgets();
    document.getElementById("resetAllWidgets").onclick = () =>
      this.resetAllWidgets();

    // Agregar al sistema de widgets
    this.addWidget(
      controlPanel,
      "widgetControlPanel",
      { x: 20, y: 80 },
      "Control de Widgets",
    );
  }

  updateWidgetControlPanel() {
    const widgetList = document.getElementById("widgetList");
    if (!widgetList) return;

    widgetList.innerHTML = "";

    // Ordenar widgets por nombre para mejor organización
    const sortedWidgets = [...this.widgets].sort((a, b) => {
      const nameA = a.name || a.type;
      const nameB = b.name || b.type;
      return nameA.localeCompare(nameB);
    });

    sortedWidgets.forEach((widget) => {
      const isVisible = this.widgetStates[widget.type]?.visible !== false;

      const widgetItem = document.createElement("div");
      widgetItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                padding: 5px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            `;

      widgetItem.innerHTML = `
                <div style="flex: 1; margin-right: 10px;">
                    <div style="font-weight: bold; font-size: 11px;">${widget.name || widget.type}</div>
                    <div style="font-size: 10px; color: #ccc;">${isVisible ? "Visible" : "Oculto"}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="game.toggleWidgetVisibility('${widget.type}')"
                            style="padding: 3px 6px; background: ${isVisible ? "#ff0000" : "#00ff00"}; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 10px;">
                        ${isVisible ? "🙈" : "👁️"}
                    </button>
                    <button onclick="game.resetWidgetPosition('${widget.type}')"
                            style="padding: 3px 6px; background: #666; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 10px;">
                        🔄
                    </button>
                </div>
            `;

      widgetList.appendChild(widgetItem);
    });
  }

  toggleWidgetVisibility(widgetType) {
    const widget = this.widgets.find((w) => w.type === widgetType);
    if (!widget) return;

    const currentState = this.widgetStates[widgetType] || { visible: true };
    currentState.visible = !currentState.visible;
    this.widgetStates[widgetType] = currentState;

    widget.element.style.display = currentState.visible ? "block" : "none";

    this.updateWidgetControlPanel();
    this.saveWidgetStates();

    LogManager.log(
      "info",
      `Widget ${widgetType} ${currentState.visible ? "mostrado" : "oculto"}`,
    );
  }

  resetWidgetPosition(widgetType) {
    const widget = this.widgets.find((w) => w.type === widgetType);
    if (!widget) return;

    const pos = widget.defaultPosition;
    widget.element.style.left = pos.x + "px";
    widget.element.style.top = pos.y + "px";

    // Actualizar estado
    if (this.widgetStates[widgetType]) {
      this.widgetStates[widgetType].position = pos;
    }

    this.saveWidgetStates();
    LogManager.log("info", `Posición de widget ${widgetType} reseteada`);
  }

  showAllWidgets() {
    this.widgets.forEach((widget) => {
      widget.element.style.display = "block";
      if (this.widgetStates[widget.type]) {
        this.widgetStates[widget.type].visible = true;
      }
    });

    // Asegurar que el botón de configuración esté siempre encima
    const configButton = document.getElementById("widgetConfigButton");
    if (configButton) {
      configButton.style.display = "block";
      configButton.style.zIndex = "99999";
      configButton.style.pointerEvents = "auto";
    }

    // PARCHE: Eliminar widgets no utilizados y arreglar funcionalidad
    setTimeout(() => {
      this.removeUnusedWidgets();
      this.forceWidgetDraggability();
      this.fixPlayerStatsWidget();
    }, 200);

    this.updateWidgetControlPanel();
    this.saveWidgetStates();
    LogManager.log("info", "Todos los widgets mostrados");
  }

  hideAllWidgets() {
    this.widgets.forEach((widget) => {
      widget.element.style.display = "none";
      if (this.widgetStates[widget.type]) {
        this.widgetStates[widget.type].visible = false;
      }
    });

    this.updateWidgetControlPanel();
    this.saveWidgetStates();
    LogManager.log("info", "Todos los widgets ocultos");
  }

  setupDefaultWidgets() {
    this.hideAllWidgets(); // Primero, ocultar todos

    // Luego, mostrar solo los widgets deseados
    const defaultWidgets = [
      "widgetConfigButton",
      "playerStats",
      "skillsWidget",
    ];
    this.widgets.forEach((widget) => {
      if (defaultWidgets.includes(widget.type)) {
        widget.element.style.display = "block";
        if (this.widgetStates[widget.type]) {
          this.widgetStates[widget.type].visible = true;
        }
      }
    });
    this.saveWidgetStates();
    LogManager.log("info", "Visibilidad de widgets por defecto aplicada.");
  }

  resetAllWidgets() {
    this.widgets.forEach((widget) => {
      const pos = widget.defaultPosition;
      widget.element.style.left = pos.x + "px";
      widget.element.style.top = pos.y + "px";
      widget.element.style.display = "block";

      this.widgetStates[widget.type] = { visible: true, position: pos };
    });

    this.updateWidgetControlPanel();
    this.saveWidgetStates();
    this.resetWidgetPositions();
    LogManager.log("info", "Todos los widgets reseteados");
  }

  saveWidgetStates() {
    localStorage.setItem("widgetStates", JSON.stringify(this.widgetStates));
  }

  loadWidgetStates() {
    const saved = localStorage.getItem("widgetStates");
    if (saved) {
      this.widgetStates = JSON.parse(saved);

      // Aplicar estados guardados
      this.widgets.forEach((widget) => {
        const state = this.widgetStates[widget.type];
        if (state) {
          widget.element.style.display = state.visible ? "block" : "none";
          if (state.position) {
            widget.element.style.left = state.position.x + "px";
            widget.element.style.top = state.position.y + "px";
          }
        }
      });

      // Asegurar que el botón de configuración esté siempre visible
      this.ensureConfigButtonVisible();

      LogManager.log("info", "Estados de widgets cargados");
    }
  }

  ensureConfigButtonVisible() {
    const configButton = document.getElementById("widgetConfigButton");
    if (configButton && this.gameState === "playing") {
      configButton.style.display = "block";
      configButton.style.zIndex = "99999";
      configButton.style.pointerEvents = "auto";
    }
  }

  // PARCHE: Forzar registro y funcionalidad de widgets problemáticos
  forceWidgetDraggability() {
    // Lista de widgets que pueden tener problemas de arrastre
    const problemWidgets = [
      { id: "minimapContainer", name: "Minimapa" },
      { selector: ".player-stats", name: "Estadísticas del Jugador" },
    ];

    problemWidgets.forEach((widgetInfo) => {
      let element = null;

      // Buscar por ID o selector
      if (widgetInfo.id) {
        element = document.getElementById(widgetInfo.id);
      } else if (widgetInfo.selector) {
        element = document.querySelector(widgetInfo.selector);
      }

      if (element && !element.classList.contains("widget")) {
        // Forzar registro como widget
        element.className += " widget";
        element.dataset.widgetId = widgetInfo.id || widgetInfo.selector;
        element.dataset.widgetName = widgetInfo.name;

        // Asegurar que tenga posición fija
        if (element.style.position !== "fixed") {
          element.style.position = "fixed";
          element.style.zIndex = "1000";
        }

        // Agregar al sistema de widgets si no está registrado
        const existingWidget = this.widgets.find((w) => w.element === element);
        if (!existingWidget) {
          const rect = element.getBoundingClientRect();
          this.addWidget(
            element,
            widgetInfo.id || widgetInfo.selector,
            { x: rect.left, y: rect.top },
            widgetInfo.name,
          );
        }

        console.log(`Widget forzado registrado: ${widgetInfo.name}`);
      }
    });

    // Forzar que todos los widgets sean arrastrables
    document.querySelectorAll(".widget").forEach((widget) => {
      // Asegurar que tenga los estilos necesarios para arrastre
      widget.style.cursor = this.isWidgetEditMode ? "move" : "default";
      widget.style.userSelect = "none";
      widget.style.pointerEvents = "auto";

      // Remover eventos anteriores y agregar nuevos
      widget.removeEventListener("mousedown", (e) =>
        this.startWidgetDrag(e, widget),
      );
      if (this.isWidgetEditMode) {
        widget.addEventListener("mousedown", (e) =>
          this.startWidgetDrag(e, widget),
        );
      }
    });

    console.log(
      `Total de widgets forzados: ${document.querySelectorAll(".widget").length}`,
    );
  }

  // PARCHE: Eliminar widgets no utilizados
  removeUnusedWidgets() {
    // Eliminar panel de inventario del sistema de widgets
    const inventoryPanel = document.getElementById("inventoryPanel");
    if (inventoryPanel) {
      inventoryPanel.classList.remove("widget");
      delete inventoryPanel.dataset.widgetId;
      delete inventoryPanel.dataset.widgetName;
      console.log("Widget de inventario removido del sistema");
    }

    // Eliminar información de controles del sistema de widgets
    const controlsInfo = document.querySelector(".controls-info");
    if (controlsInfo) {
      controlsInfo.classList.remove("widget");
      delete controlsInfo.dataset.widgetId;
      delete controlsInfo.dataset.widgetName;
      console.log("Widget de información de controles removido del sistema");
    }

    // Remover de la lista de widgets
    this.widgets = this.widgets.filter(
      (widget) =>
        widget.type !== "inventoryPanel" && widget.type !== "controlsInfo",
    );

    // PARCHE ADICIONAL: Eliminar elementos del DOM si aún existen
    if (inventoryPanel) {
      inventoryPanel.remove();
      console.log("Elemento de inventario eliminado del DOM");
    }

    if (controlsInfo) {
      controlsInfo.remove();
      console.log("Elemento de controles eliminado del DOM");
    }

    console.log("Widgets no utilizados eliminados del sistema");
  }

  // PARCHE: Verificar y arreglar widgets que no se mueven
  debugWidgetMovement() {
    console.log("=== DEBUG WIDGET MOVEMENT ===");

    const allWidgets = document.querySelectorAll(".widget");
    console.log(`Total widgets encontrados: ${allWidgets.length}`);

    allWidgets.forEach((widget, index) => {
      const widgetName =
        widget.dataset.widgetName || widget.id || `Widget ${index}`;
      const hasPosition = widget.style.position === "fixed";
      const hasZIndex = widget.style.zIndex !== "";
      const hasCursor = widget.style.cursor === "move";
      const hasUserSelect = widget.style.userSelect === "none";

      console.log(`Widget: ${widgetName}`);
      console.log(`  - Position fixed: ${hasPosition}`);
      console.log(`  - Z-index: ${hasZIndex}`);
      console.log(`  - Cursor move: ${hasCursor}`);
      console.log(`  - User-select none: ${hasUserSelect}`);
      console.log(`  - Classes: ${widget.className}`);

      // Arreglar automáticamente si falta algo
      if (!hasPosition) {
        widget.style.position = "fixed";
        console.log(`  -> Arreglado: position fixed`);
      }
      if (!hasZIndex) {
        widget.style.zIndex = "1000";
        console.log(`  -> Arreglado: z-index 1000`);
      }
      if (this.isWidgetEditMode && !hasCursor) {
        widget.style.cursor = "move";
        console.log(`  -> Arreglado: cursor move`);
      }
      if (!hasUserSelect) {
        widget.style.userSelect = "none";
        console.log(`  -> Arreglado: user-select none`);
      }
    });

    console.log("=== FIN DEBUG WIDGET MOVEMENT ===");
  }

  // PARCHE: Arreglar específicamente las estadísticas del jugador
  fixPlayerStatsWidget() {
    const playerStats = document.querySelector(".player-stats");
    if (playerStats) {
      // Forzar que sea un widget
      if (!playerStats.classList.contains("widget")) {
        playerStats.classList.add("widget");
        playerStats.dataset.widgetId = "playerStats";
        playerStats.dataset.widgetName = "Estadísticas del Jugador";
      }

      // Asegurar estilos necesarios para arrastre
      playerStats.style.position = "fixed";
      playerStats.style.zIndex = "1000";
      playerStats.style.userSelect = "none";
      playerStats.style.pointerEvents = "auto";

      // Agregar al sistema si no está
      const existingWidget = this.widgets.find(
        (w) => w.element === playerStats,
      );
      if (!existingWidget) {
        const rect = playerStats.getBoundingClientRect();
        this.addWidget(
          playerStats,
          "playerStats",
          { x: rect.left, y: rect.top },
          "Estadísticas del Jugador",
        );
      }

      // Forzar event listener de arrastre
      playerStats.removeEventListener("mousedown", (e) =>
        this.startWidgetDrag(e, playerStats),
      );
      if (this.isWidgetEditMode) {
        playerStats.addEventListener("mousedown", (e) =>
          this.startWidgetDrag(e, playerStats),
        );
        playerStats.style.cursor = "move";
      }

      console.log("Estadísticas del jugador arregladas para arrastre");
    }
  }

  updateSpeedDisplay() {
    const speedValue = document.getElementById("speedValue");
    if (speedValue) {
      let speedText = `Velocidad: ${this.speedMultiplier.toFixed(1)}x`;
      if (this.speedMultiplier === 1.0) {
        speedText += " (Normal)";
      } else if (this.speedMultiplier < 1.0) {
        speedText += " (Lenta)";
      } else {
        speedText += " (Rápida)";
      }
      speedValue.textContent = speedText;
    }
  }

  updatePlayerSpeed() {
    if (this.player) {
      const ship = this.basicShip;
      this.player.speed = ship.speed * this.speedMultiplier * 10;
      LogManager.log(
        "info",
        `Velocidad actualizada: ${this.player.speed.toFixed(1)} (${this.speedMultiplier.toFixed(1)}x)`,
      );
    }
  }

  populateClanSelector() {
    console.log("populateClanSelector called"); // Debug log
    const clansGrid = document.getElementById("clansGrid");
    if (!clansGrid) {
      console.error("clansGrid element not found!");
      return;
    }

    console.log("Clearing clans grid...");
    clansGrid.innerHTML = "";

    console.log("Number of clans:", this.clans.length);
    console.log("Clans data:", this.clans);

    this.clans.forEach((clan, index) => {
      console.log(`Creating clan element for: ${clan.name} (index: ${index})`);

      const clanElement = document.createElement("div");
      clanElement.className = `clan-option ${index === this.playerClan ? "selected" : ""}`;
      clanElement.style.borderColor = clan.color;
      clanElement.style.cursor = "pointer";
      clanElement.style.pointerEvents = "auto";

      clanElement.innerHTML = `
                <div class="clan-icon" style="color: ${clan.color}">🏰</div>
                <div class="clan-name" style="color: ${clan.color}">${clan.name}</div>
                <div class="clan-description">Guerra espacial</div>
                <div class="clan-base-info">Esquina ${index + 1}</div>
            `;

      // Agregar event listener con más debug
      clanElement.addEventListener("click", (e) => {
        console.log("=== CLAN CLICKED ===");
        console.log("Clan clicked:", index, clan.name);
        console.log("Event target:", e.target);
        console.log("Event currentTarget:", e.currentTarget);
        console.log("Event type:", e.type);

        this.playerClan = index;
        this.updateClanSelector();

        console.log("Player clan set to:", this.playerClan);
        console.log("Clan seleccionado exitosamente");
      });

      // Agregar event listener de mouseover para debug
      clanElement.addEventListener("mouseover", () => {
        console.log("Mouse over clan:", clan.name);
      });

      clansGrid.appendChild(clanElement);
      console.log("Clan element created and appended:", clan.name);
    });

    console.log("Total clan elements created:", clansGrid.children.length);
    console.log("Clans grid HTML:", clansGrid.innerHTML);
  }

  updateClanSelector() {
    console.log("=== UPDATE CLAN SELECTOR ===");
    console.log("Player clan:", this.playerClan);

    const clanOptions = document.querySelectorAll(".clan-option");
    const confirmButton = document.getElementById("confirmClan");

    console.log("Found clan options:", clanOptions.length);
    console.log("Confirm button:", confirmButton);

    clanOptions.forEach((option, index) => {
      option.classList.remove("selected");
      if (index === this.playerClan) {
        option.classList.add("selected");
        console.log(`Clan ${index} marked as selected`);
      }
    });

    // Show/hide confirm button
    if (this.playerClan !== null && confirmButton) {
      confirmButton.style.display = "inline-block";
      console.log("Confirm button shown");
    } else if (confirmButton) {
      confirmButton.style.display = "none";
      console.log("Confirm button hidden");
    }

    console.log("Update clan selector completed");
  }

  isGameReady() {
    // Verificar que hay clan seleccionado
    if (this.playerClan === null) return false;

    // Verificar que hasShip es true
    if (!this.hasShip) return false;

    // Verificar que realmente hay una nave equipada
    const equippedData = localStorage.getItem("equipped");
    if (!equippedData) return false;

    const equipped = JSON.parse(equippedData);
    if (!equipped.ship) return false;

    return true;
  }

  showMenu() {
    // Remover prevención de navegación si existe
    if (this.removeNavigationPrevention) {
      this.removeNavigationPrevention();
    }

    const gameMenu = document.getElementById("gameMenu");
    const clanSelector = document.getElementById("clanSelector");
    const bandoSelector = document.getElementById("bandoSelector");
    const shipSelector = document.getElementById("shipSelector");

    if (gameMenu) gameMenu.style.display = "block";
    if (clanSelector) clanSelector.style.display = "none";
    if (bandoSelector) bandoSelector.style.display = "none";
    if (shipSelector) shipSelector.style.display = "none";

    // Actualizar botón de iniciar juego si hay clan seleccionado
    const startButton = document.getElementById("startGame");
    if (startButton && this.playerClan !== null) {
      startButton.textContent = `Iniciar Juego (${this.clans[this.playerClan].name})`;
      startButton.disabled = false;
      startButton.style.background = "#4CAF50";
      startButton.style.cursor = "pointer";
    }

    // Ocultar widgets
    this.hideAllWidgets();
    // Verificar estado de nave
    this.checkShipStatus();
  }

  dockAtISS() {
    // Guardar posición antes de dockear
    if (!this.player) return;

    this.dockedAtISS = true;
    this.playerPositionBeforeDocking = {
      x: this.player.x,
      y: this.player.y
    };

    console.log("🚀 Nave dockeando en ISS...");

    // Crear o mostrar iframe del market
    let marketIframe = document.getElementById("marketIframe");
    if (!marketIframe) {
      marketIframe = document.createElement("iframe");
      marketIframe.id = "marketIframe";
      marketIframe.src = "market.html";
      marketIframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        z-index: 10000;
        background: #000;
      `;
      document.body.appendChild(marketIframe);

      // Ocultar el botón amarillo STAR ENGINE cuando el iframe cargue
      marketIframe.onload = () => {
        try {
          const iframeDoc = marketIframe.contentDocument || marketIframe.contentWindow.document;
          const starEngineButtons = iframeDoc.querySelectorAll('button');
          starEngineButtons.forEach(btn => {
            if (btn.textContent.includes('STAR ENGINE')) {
              btn.style.display = 'none';
            }
          });
        } catch (e) {
          console.warn('No se pudo acceder al contenido del iframe:', e);
        }
      };
    } else {
      marketIframe.style.display = "block";

      // Ocultar el botón amarillo STAR ENGINE también cuando se muestra de nuevo
      try {
        const iframeDoc = marketIframe.contentDocument || marketIframe.contentWindow.document;
        const starEngineButtons = iframeDoc.querySelectorAll('button');
        starEngineButtons.forEach(btn => {
          if (btn.textContent.includes('STAR ENGINE')) {
            btn.style.display = 'none';
          }
        });
      } catch (e) {
        console.warn('No se pudo acceder al contenido del iframe:', e);
      }
    }

    // Crear botón de salir del market
    let exitMarketBtn = document.getElementById("exitMarketBtn");
    if (!exitMarketBtn) {
      exitMarketBtn = document.createElement("button");
      exitMarketBtn.id = "exitMarketBtn";
      exitMarketBtn.textContent = "← Salir al Espacio";
      exitMarketBtn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 12px 24px;
        background: rgba(220, 38, 38, 0.9);
        color: white;
        border: 2px solid #ff4444;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: all 0.3s;
      `;
      exitMarketBtn.onmouseover = () => {
        exitMarketBtn.style.background = "rgba(220, 38, 38, 1)";
        exitMarketBtn.style.transform = "scale(1.05)";
      };
      exitMarketBtn.onmouseout = () => {
        exitMarketBtn.style.background = "rgba(220, 38, 38, 0.9)";
        exitMarketBtn.style.transform = "scale(1)";
      };
      exitMarketBtn.onclick = () => {
        this.undockFromISS();
      };
      document.body.appendChild(exitMarketBtn);
    } else {
      exitMarketBtn.style.display = "block";
    }

    // Ocultar todos los widgets del juego
    this.hideAllWidgets();
  }

  undockFromISS() {
    console.log("🚀 Nave saliendo de ISS...");

    this.dockedAtISS = false;

    // Posicionar nave en la ISS actual
    if (this.player && this.iss) {
      this.player.x = this.iss.x;
      this.player.y = this.iss.y + 40; // Salir por el puerto de atraque
    }

    // Ocultar iframe del market
    const marketIframe = document.getElementById("marketIframe");
    if (marketIframe) {
      marketIframe.style.display = "none";

      // Mostrar el botón amarillo STAR ENGINE de nuevo cuando se oculta el iframe
      try {
        const iframeDoc = marketIframe.contentDocument || marketIframe.contentWindow.document;
        const starEngineButtons = iframeDoc.querySelectorAll('button');
        starEngineButtons.forEach(btn => {
          if (btn.textContent.includes('STAR ENGINE')) {
            btn.style.display = 'block';
          }
        });
      } catch (e) {
        console.warn('No se pudo acceder al contenido del iframe:', e);
      }
    }

    // Ocultar botón de salir
    const exitMarketBtn = document.getElementById("exitMarketBtn");
    if (exitMarketBtn) {
      exitMarketBtn.style.display = "none";
    }

    // Mostrar widgets del juego
    this.showAllWidgets();

    // Mensaje de undocking
    this.addDamageNumber(
      "UNDOCKING",
      this.player.x,
      this.player.y - 30,
      "#00ffff"
    );
  }

  showClanSelector() {
    console.log("showClanSelector called"); // Debug log

    const gameMenu = document.getElementById("gameMenu");
    if (gameMenu) gameMenu.style.display = "none";

    const clanSel = document.getElementById("clanSelector");
    if (clanSel) {
      clanSel.style.display = "block";
    }

    const bandoSelector = document.getElementById("bandoSelector");
    if (bandoSelector) bandoSelector.style.display = "none";

    const shipSelector = document.getElementById("shipSelector");
    if (shipSelector) shipSelector.style.display = "none";

    this.populateClanSelector();
    this.hideAllWidgets();
  }

  showBandoSelector() {
    const gameMenu = document.getElementById("gameMenu");
    const clanSelector = document.getElementById("clanSelector");
    const shipSelector = document.getElementById("shipSelector");
    const bandoSelector = document.getElementById("bandoSelector");

    if (gameMenu) gameMenu.style.display = "none";
    if (clanSelector) clanSelector.style.display = "none";
    if (shipSelector) shipSelector.style.display = "none";
    if (bandoSelector) bandoSelector.style.display = "flex";

    this.populateBandoSelector();
  }

  populateBandoSelector() {
    const bandosGrid = document.getElementById("bandosGrid");
    const selectedClanName = document.getElementById("selectedClanName");
    const confirmButton = document.getElementById("confirmBando");

    if (!bandosGrid || !selectedClanName || !confirmButton) {
      console.error("Elementos del bando selector no encontrados");
      return;
    }

    // Mostrar el clan seleccionado
    if (this.playerClan !== null && this.clans[this.playerClan]) {
      selectedClanName.textContent = this.clans[this.playerClan].name;
    }

    // Limpiar grid
    bandosGrid.innerHTML = "";

    // Crear opciones de bandos
    this.bandos.forEach((bando, index) => {
      const bandoOption = document.createElement("div");
      bandoOption.className = "bando-option";
      bandoOption.onclick = () => this.selectBando(index);

      bandoOption.innerHTML = `
                <div class="bando-icon">${bando.icon}</div>
                <div class="bando-name">${bando.name}</div>
                <div class="bando-description">${bando.description}</div>
                <div class="bando-stats">
                    <div class="bando-stat">
                        <span class="bando-stat-label">Daño</span>
                        <span class="bando-stat-value">${bando.stats.damage > 0 ? "+" : ""}${bando.stats.damage}</span>
                    </div>
                    <div class="bando-stat">
                        <span class="bando-stat-label">Velocidad</span>
                        <span class="bando-stat-value">${bando.stats.speed > 0 ? "+" : ""}${bando.stats.speed}</span>
                    </div>
                    <div class="bando-stat">
                        <span class="bando-stat-label">Vida</span>
                        <span class="bando-stat-value">${bando.stats.health > 0 ? "+" : ""}${bando.stats.health * 20}</span>
                    </div>
                    <div class="bando-stat">
                        <span class="bando-stat-label">Cadencia</span>
                        <span class="bando-stat-value">${bando.stats.fireRate > 0 ? "+" : ""}${bando.stats.fireRate}s</span>
                    </div>
                </div>
                <div class="bando-bonus">
                    <div class="bando-bonus-title">${bando.bonus.title}</div>
                    <div class="bando-bonus-description">${bando.bonus.description}</div>
                </div>
            `;

      bandosGrid.appendChild(bandoOption);
    });

    // Ocultar botón de confirmar hasta que se seleccione un bando
    confirmButton.style.display = "none";
  }

  selectBando(bandoIndex) {
    // Remover selección anterior
    document.querySelectorAll(".bando-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Seleccionar nuevo bando
    const bandoOptions = document.querySelectorAll(".bando-option");
    if (bandoOptions[bandoIndex]) {
      bandoOptions[bandoIndex].classList.add("selected");
    }
    this.playerBando = bandoIndex;

    // Mostrar botón de confirmar
    const confirmButton = document.getElementById("confirmBando");
    if (confirmButton) {
      confirmButton.style.display = "block";
    }
  }

  startGame() {
    const gameMenu = document.getElementById("gameMenu");
    const clanSelector = document.getElementById("clanSelector");
    const bandoSelector = document.getElementById("bandoSelector");
    const shipSelector = document.getElementById("shipSelector");

    if (gameMenu) gameMenu.style.display = "none";
    if (clanSelector) clanSelector.style.display = "none";
    if (bandoSelector) bandoSelector.style.display = "none";
    if (shipSelector) shipSelector.style.display = "none";

    // Check if we have game integration
    if (this.gameIntegration && this.gameIntegration.isConnected) {
      console.log("🎮 Starting game with integration");
      this.startGameWithIntegration();
    } else {
      console.log("🎮 Starting game in standalone mode");
      this.startGameStandalone();
    }
  }

  // Start game with server integration
  startGameWithIntegration() {
    // Cambiar estado del juego a playing
    this.gameState = "playing";

    // Aplicar visibilidad de widgets por defecto
    this.setupDefaultWidgets();

    // Asegurar que el botón de configuración esté siempre visible
    const configButton = document.getElementById("widgetConfigButton");
    if (configButton) {
      configButton.style.display = "block";
      configButton.style.zIndex = "99999";
      configButton.style.pointerEvents = "auto";
    }

    // Initialize world first (this creates centralSafeZone)
    this.initializeWorld();

    // Get user configuration from integration
    const userConfig = this.gameIntegration.userConfig;
    const equippedShip = userConfig?.equippedNFTs?.ship;

    if (!equippedShip) {
      console.error("❌ No ship NFT equipped");
      this.showPlayabilityError("No ship NFT equipped");
      return;
    }

    // Spawn player in their clan base
    const playerClanBase = this.clans[this.playerClan].base;
    const baseSize = this.playerClan === 1 ? 300 : 200;

    let spawnX, spawnY;
    do {
      spawnX = playerClanBase.x + baseSize / 2 + (Math.random() - 0.5) * 100;
      spawnY = playerClanBase.y + baseSize / 2 + (Math.random() - 0.5) * 100;
    } while (
      spawnX < playerClanBase.x + 50 ||
      spawnX > playerClanBase.x + baseSize - 50 ||
      spawnY < playerClanBase.y + 50 ||
      spawnY > playerClanBase.y + baseSize - 50
    );

    // Create player with NFT stats
    this.player = {
      x: spawnX,
      y: spawnY,
      width: 40,
      height: 40,
      speed: equippedShip.stats.speed * this.speedMultiplier,
      health: equippedShip.stats.hp,
      maxHealth: equippedShip.stats.hp,
      damage: equippedShip.stats.damage,
      fireRate: 1.0, // Default fire rate
      name: "Player",
      shipName: equippedShip.name,
      ability: "none",
      lastEnemyShot: 0,
      clan: 0, // Default clan
      bando: null,
      isHuman: true,
      angle: 0,
      id: "player",
      // NFT specific properties
      nftTokenId: equippedShip.tokenId,
      nftRarity: equippedShip.rarity,
    };

    // Apply weapon, shield, and engine stats if equipped
    const equippedWeapon = userConfig?.equippedNFTs?.weapon;
    const equippedShield = userConfig?.equippedNFTs?.shield;
    const equippedEngine = userConfig?.equippedNFTs?.engine;

    if (equippedWeapon) {
      this.player.damage += equippedWeapon.stats.damage || 0;
      this.player.fireRate =
        equippedWeapon.stats.fireRate || this.player.fireRate;
    }

    if (equippedShield) {
      this.player.shield = equippedShield.stats.shield || 0;
      this.player.maxShield = equippedShield.stats.shield || 0;
    }

    if (equippedEngine) {
      this.player.speed += equippedEngine.stats.speed || 0;
    }

    // Define safe zone
    this.safeZone = {
      x: this.centralSafeZone.x - 100,
      y: this.centralSafeZone.y - 100,
      width: this.centralSafeZone.width + 200,
      height: this.centralSafeZone.height + 200,
    };

    // Initialize multiplayer system
    this.initializeMultiplayer();

    console.log("✅ Game started with integration");
  }

  // Start game in standalone mode (original functionality)
  startGameStandalone() {
    // Cambiar estado del juego a playing
    this.gameState = "playing";

    // Crear minimapa al iniciar el juego
    console.log("🗺️ Llamando a createMinimapContainer desde startGameStandalone");
    this.createMinimapContainer();

    // Aplicar visibilidad de widgets por defecto
    this.setupDefaultWidgets();

    // Asegurar que el botón de configuración esté siempre visible
    const configButton = document.getElementById("widgetConfigButton");
    if (configButton) {
      configButton.style.display = "block";
      configButton.style.zIndex = "99999";
      configButton.style.pointerEvents = "auto";
    }

    if (!this.isGameReady()) {
      if (this.playerClan === null) {
        alert("Por favor selecciona un clan primero");
      } else if (!this.hasShip) {
        alert(
          "Necesitas comprar una nave primero. La nave básica es gratuita.",
        );
      } else {
        // Verificar si hay nave equipada
        const equippedData = localStorage.getItem("equipped");
        if (!equippedData || !JSON.parse(equippedData).ship) {
          alert(
            "Necesitas equipar una nave para poder despegar. Ve al market y equipa una nave.",
          );
        }
      }
      return;
    }

    // Initialize world first (this creates centralSafeZone)
    this.initializeWorld();

    // Initialize player at their clan base (outside the base structure)
    const ship = this.basicShip;
    const playerClan = this.clans[this.playerClan];
    const playerBando =
      this.playerBando !== null ? this.bandos[this.playerBando] : null;

    // Spawn player in their clan base
    const playerClanBase = this.clans[this.playerClan].base;
    const baseSize = this.playerClan === 1 ? 300 : 200;

    let spawnX, spawnY;
    do {
      spawnX = playerClanBase.x + baseSize / 2 + (Math.random() - 0.5) * 100;
      spawnY = playerClanBase.y + baseSize / 2 + (Math.random() - 0.5) * 100;
    } while (
      spawnX < playerClanBase.x + 50 ||
      spawnX > playerClanBase.x + baseSize - 50 ||
      spawnY < playerClanBase.y + 50 ||
      spawnY > playerClanBase.y + baseSize - 50
    );

    // Aplicar bonos del bando seleccionado
    let baseSpeed = ship.speed;
    let baseHealth = ship.health;
    let baseDamage = ship.damage;
    let baseFireRate = ship.fireRate;

    if (playerBando) {
      baseSpeed += playerBando.stats.speed;
      baseHealth += playerBando.stats.health * 20;
      baseDamage += playerBando.stats.damage;
      baseFireRate += playerBando.stats.fireRate;
    }

    this.player = {
      x: spawnX,
      y: spawnY,
      width: 40,
      height: 40,
      speed: baseSpeed * this.speedMultiplier * 10, // Velocidad con multiplicador de desarrollo x10
      health: baseHealth,
      maxHealth: baseHealth,
      damage: baseDamage,
      fireRate: baseFireRate,
      name: this.playerName,
      shipName: ship.name,
      ability: ship.ability,
      lastEnemyShot: 0,
      clan: this.playerClan,
      bando: this.playerBando,
      isHuman: true,
      angle: 0, // For triangular ship rotation
      id: "player",
    };

    // Define safe zone (base should be inside the safe zone)
    this.safeZone = {
      x: playerClan.base.x - 100, // Extend 100px in each direction from base
      y: playerClan.base.y - 100,
      width: 400, // Base (200) + 100px on each side
      height: 400,
    };

    // Initialize multiplayer system (this will add the player and bots)
    this.initializeMultiplayer();

    // Load equipment from market
    this.loadEquipmentFromMarket();

    // Registrar widgets que aparecen después de iniciar el juego
    this.registerPostGameWidgets();

    // Registrar widgets inmediatamente después de iniciar
    setTimeout(() => {
      this.registerWidget(
        "tiendaBtn",
        "#tiendaBtn",
        { x: window.innerWidth / 2 - 100, y: 80 },
        "Botón de Tienda",
      );
      this.forceUpdateWidgetPanel();
    }, 100);

    this.gameObjects = [];
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.powerUps = [];
    this.coinObjects = [];
    this.damageNumbers = [];
    this.score = 0;
    this.coins = 0;
    this.lastShot = 0;
    this.abilityCooldown = 0;
    this.enemySpawnTimer = 0;

    this.updateUI();
  }

  updateUI() {
    // Verificar que el jugador existe antes de actualizar UI
    if (!this.player) return;

    const levelElement = document.getElementById("level");
    if (levelElement) levelElement.textContent = this.level;

    const expElement = document.getElementById("exp");
    if (expElement) expElement.textContent = `${this.exp}/${this.expToNext}`;

    const hpElement = document.getElementById("hp");
    if (hpElement)
      hpElement.textContent = `${this.player.health}/${this.player.maxHealth}`;

    const scoreElement = document.getElementById("score");
    if (scoreElement) scoreElement.textContent = this.score;

    const coinsElement = document.getElementById("coins");
    if (coinsElement) coinsElement.textContent = this.coins;

    const shipNameElement = document.getElementById("ship-name");
    if (shipNameElement) shipNameElement.textContent = this.player.name;

    // Update ship status
    const shipInfoElement = document.getElementById("shipInfo");
    if (shipInfoElement) {
      if (this.hasShip) {
        shipInfoElement.textContent = "Disponible";
      } else {
        shipInfoElement.textContent = "No disponible";
      }
    }

    // Actualizar puntos de habilidad si existe el elemento
    const skillPointsElement = document.getElementById("skillPoints");
    if (skillPointsElement) {
      skillPointsElement.textContent = this.skillPoints;
    }

    // Load equipment from localStorage and update player
    this.loadEquipmentFromMarket();

    // Calculate total stats with equipment
    const engineSpeed =
      this.equipment.engine && this.equipment.engine.speed
        ? this.equipment.engine.speed
        : 0;
    const weaponDamage = this.equipment.weapon
      ? this.equipment.weapon.damage
      : 0;
    const totalSpeed = this.player.speed + engineSpeed;
    const totalDamage = this.player.damage + weaponDamage;

    const speedElement = document.getElementById("speed");
    if (speedElement) speedElement.textContent = totalSpeed;

    const damageElement = document.getElementById("damage");
    if (damageElement) damageElement.textContent = totalDamage;

    const fireRateElement = document.getElementById("fire-rate");
    if (fireRateElement) fireRateElement.textContent = this.player.fireRate;

    const hpDisplayElement = document.getElementById("hp-display");
    if (hpDisplayElement)
      hpDisplayElement.textContent = `${this.player.health}/${this.player.maxHealth}`;

    // Mostrar botón de tienda si el jugador está en la zona neutral
    let tiendaBtn = document.getElementById("tiendaBtn");
    if (!tiendaBtn) {
      tiendaBtn = document.createElement("button");
      tiendaBtn.id = "tiendaBtn";
      tiendaBtn.textContent = "🛒"; // Solo icono, más compacto
      tiendaBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 9999;
        width: 50px;
        height: 50px;
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        font-size: 24px;
        border: 2px solid #00ff88;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      tiendaBtn.onclick = () => {
        this.dockAtISS();
      };
      document.body.appendChild(tiendaBtn);

      // Registrar el botón de tienda como widget
      this.registerWidget(
        "tiendaBtn",
        "#tiendaBtn",
        { x: window.innerWidth / 2 - 100, y: 80 },
        "Botón de Tienda",
      );
      this.forceUpdateWidgetPanel();
    }
    // Show shop button only if player is in central safe zone
    const dx = this.player.x - this.iss.x;
    const dy = this.player.y - this.iss.y;
    const distanceToISS = Math.sqrt(dx * dx + dy * dy);

    if (this.iss && distanceToISS <= this.centralSafeZone.radius) {
      tiendaBtn.style.opacity = "1";
      tiendaBtn.style.pointerEvents = "auto";
    } else {
      tiendaBtn.style.opacity = "0";
      tiendaBtn.style.pointerEvents = "none";
    }

    // Actualizar información de rendimiento
    this.updatePerformanceUI();
  }

  updatePerformanceUI() {
    // Panel de rendimiento eliminado - no es necesario para juego móvil
    // La funcionalidad de cambio de modo de rendimiento se mantiene disponible
  }

  togglePerformanceMode() {
    const modes = ["low", "medium", "high", "ultra", "extreme"];
    const currentIndex = modes.indexOf(
      PerformanceOptimizer.deviceCapabilities.performanceMode,
    );
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];

    PerformanceOptimizer.deviceCapabilities.performanceMode = newMode;
    this.performanceSettings = PerformanceOptimizer.getCurrentSettings();

    // Guardar configuración
    localStorage.setItem("performanceMode", newMode);

    console.log(`Modo de rendimiento cambiado a: ${newMode}`);

    // Mostrar notificación
    this.showPerformanceModeNotification(newMode);
  }

  showPerformanceModeNotification(mode) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1001;
            border: 2px solid #00ff00;
        `;
    notification.textContent = `Modo de rendimiento: ${mode.toUpperCase()}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  handleBotWorkerMessage(e) {
    const { type, results, actions } = e.data;

    switch (type) {
      case "ready":
        console.log("Bot Worker listo. Esperando datos del mundo...");
        // La inicialización se enviará desde initializeWorld()
        break;

      case "botResults":
        if (results && Array.isArray(results)) {
          results.forEach((updatedBot) => {
            const bot = this.bots.find((b) => b.id === updatedBot.id);
            if (bot) {
              Object.assign(bot, updatedBot);
            }
          });
        }

        if (actions && Array.isArray(actions)) {
          actions.forEach((action) => {
            const bot = this.bots.find((b) => b.id === action.botId);
            if (!bot) return;

            switch (action.type) {
              case "shoot":
                this.botShoot(bot); // bot.angle is already updated by the worker
                break;
              case "megaShot":
                this.botMegaShot(bot);
                break;
            }
          });
        }
        break;
    }
  }

  loadEquipmentFromMarket() {
    const equippedData = localStorage.getItem("equipped");
    if (equippedData) {
      const equipped = JSON.parse(equippedData);

      // Update equipment system
      if (equipped.ship) {
        this.equipment.ship = equipped.ship;
        // Update player stats based on equipped ship
        this.player.maxHealth = equipped.ship.stats.hp;
        this.player.health = Math.min(
          this.player.health,
          this.player.maxHealth,
        );
        this.player.speed =
          equipped.ship.stats.speed * this.speedMultiplier * 10; // Velocidad con multiplicador de desarrollo x10
        this.player.damage = equipped.ship.stats.damage;
        this.player.shipColor = equipped.ship.color; // Store ship color
        this.player.skinColor = equipped.ship.color; // Apply ship color as skin
      } else {
        // Si no hay nave equipada, simplemente marcarlo
        this.hasShip = false;
        localStorage.setItem("hasShip", "false");
        console.error(
          "No ship equipped, but game started. Player will not be a ghost, but might not be fully functional.",
        );
        return;
      }

      if (equipped.weapon) {
        this.equipment.weapon = equipped.weapon;
        // Fire rate is handled in the shoot function
      }

      if (equipped.shield) {
        this.equipment.shield = equipped.shield;
        // Shield percentage is applied to max health
        const baseHealth = this.equipment.ship
          ? this.equipment.ship.stats.hp
          : this.player.maxHealth;
        const shieldBonus = Math.floor(
          baseHealth * (equipped.shield.stats.lifePercent / 100),
        );
        this.player.maxHealth = baseHealth + shieldBonus;
        this.player.health = Math.min(
          this.player.health,
          this.player.maxHealth,
        );
      }

      if (equipped.engine) {
        this.equipment.engine = equipped.engine;
        // Speed bonus is applied in movement calculations
      }
    } else {
      // Si no hay equipo guardado, no se puede jugar
      this.hasShip = false;
      localStorage.setItem("hasShip", "false");
    }
  }

  toggleInventory() {
    const panel = document.getElementById("inventoryPanel");

    if (panel.style.display === "none") {
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  }

  closeInventory() {
    const panel = document.getElementById("inventoryPanel");
    if (panel) {
      panel.style.display = "none";
    }
  }

  spawnEnemies() {
    // Disabled traditional enemy spawning - only bots with advanced AI remain
    // this.enemySpawnTimer++;
    // if (this.enemySpawnTimer > 300 && this.enemies.length < this.maxEnemies) { // Spawn every 5 seconds
    //     // Spawn enemies for all clans (including player's clan)
    //     this.clans.forEach((clan, clanIndex) => {
    //         if (Math.random() < 0.3) {
    //             this.spawnEnemyForClan(clanIndex);
    //         }
    //     });
    //     this.enemySpawnTimer = 0;
    // }
  }

  spawnPowerUp() {
    if (Math.random() < 0.005) {
      const powerUp = {
        x: Math.random() * (this.canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 2,
        type: Math.random() < 0.5 ? "health" : "damage",
        collected: false,
      };
      this.powerUps.push(powerUp);
    }
  }

  updatePlayer() {
    // Validate player coordinates
    if (!this.player || !isFinite(this.player.x) || !isFinite(this.player.y)) {
      // Reset player to safe position if coordinates are invalid
      if (this.player) {
        const playerClan = this.clans[this.playerClan];
        this.player.x = playerClan.base.x + 200;
        this.player.y = playerClan.base.y + 200;
      }
      return;
    }

    // Si es un fantasma, no permitir movimiento ni disparo
    if (this.player.isGhost) {
      return;
    }

    // Movement in world coordinates
    let newX = this.player.x;
    let newY = this.player.y;
    const engineSpeed =
      this.equipment.engine && this.equipment.engine.speed
        ? this.equipment.engine.speed
        : 0;
    const totalSpeed = this.player.speed + engineSpeed;

    // Validate totalSpeed to prevent NaN
    if (!isFinite(totalSpeed)) {
      return;
    }

    // Update player angle
    if (this.touchAim && this.touchAim.active) {
      // Aiming with touch joystick
      this.player.angle = this.touchAim.angle;
    } else {
      // Aiming with mouse
      const worldMouse = this.screenToWorld(this.mouse.x, this.mouse.y);
      const dx = worldMouse.x - (this.player.x + this.player.width / 2);
      const dy = worldMouse.y - (this.player.y + this.player.height / 2);
      this.player.angle = Math.atan2(dy, dx);
    }
    // Movimiento hacia donde apunta el mouse (W/↑)
    if (this.keys["w"] || this.keys["arrowup"]) {
      newX = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.width,
          newX + Math.cos(this.player.angle) * totalSpeed,
        ),
      );
      newY = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.height,
          newY + Math.sin(this.player.angle) * totalSpeed,
        ),
      );
    }
    // Strafe (A/← y D/→)
    if (this.keys["a"] || this.keys["arrowleft"]) {
      const strafeAngle = this.player.angle - Math.PI / 2;
      newX = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.width,
          newX + Math.cos(strafeAngle) * totalSpeed,
        ),
      );
      newY = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.height,
          newY + Math.sin(strafeAngle) * totalSpeed,
        ),
      );
    }
    if (this.keys["d"] || this.keys["arrowright"]) {
      const strafeAngle = this.player.angle + Math.PI / 2;
      newX = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.width,
          newX + Math.cos(strafeAngle) * totalSpeed,
        ),
      );
      newY = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.height,
          newY + Math.sin(strafeAngle) * totalSpeed,
        ),
      );
    }
    // Retroceso (S/↓)
    if (this.keys["s"] || this.keys["arrowdown"]) {
      newX = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.width,
          newX - Math.cos(this.player.angle) * totalSpeed,
        ),
      );
      newY = Math.max(
        0,
        Math.min(
          this.worldSize - this.player.height,
          newY - Math.sin(this.player.angle) * totalSpeed,
        ),
      );
    }

    // Validate new coordinates before applying
    if (!isFinite(newX) || !isFinite(newY)) {
      return;
    }

    // Check collision with obstacles (allow passing through player's base)
    let canMove = true;
    this.obstacles.forEach((obstacle) => {
      if (
        this.checkCollision(
          {
            x: newX,
            y: newY,
            width: this.player.width,
            height: this.player.height,
          },
          obstacle,
        )
      ) {
        // Allow passing through player's base structure
        if (obstacle.type === "base" && obstacle.clan === this.playerClan) {
          // Can pass through
        } else {
          canMove = false;
        }
      }
    });

    if (canMove) {
      this.player.x = newX;
      this.player.y = newY;
    }

    // Final validation after movement
    if (!isFinite(this.player.x) || !isFinite(this.player.y)) {
      // Reset to last valid position
      this.player.x = newX;
      this.player.y = newY;
    }

    // Shooting with mouse click
    LogManager.log("debug", "[Disparo P2] updatePlayer: Verificando disparo.", {
      isGhost: this.player.isGhost,
      mouseClicked: this.mouse.clicked,
      fireRateCooldown: Date.now() - this.lastShot > this.getFireRate() * 1000,
    });
    if (
      this.mouse.clicked &&
      Date.now() - this.lastShot > 1000 / this.getFireRate()
    ) {
      this.shoot();
      this.lastShot = Date.now();
    }
    this.mouse.clicked = false;
  }

  getFireRate() {
    let totalFireRate = 0;
    if (this.equipment.ship && this.equipment.ship.stats && this.equipment.ship.stats.fireRate) {
        totalFireRate += this.equipment.ship.stats.fireRate;
    }
    if (this.equipment.weapon && this.equipment.weapon.stats && this.equipment.weapon.stats.fireRate) {
        totalFireRate += this.equipment.weapon.stats.fireRate;
    }
    return totalFireRate > 0 ? totalFireRate : 1; // Devuelve al menos 1 para evitar división por cero
  }

  botShoot(bot) {
    const bullet = {
      x: bot.x + bot.width / 2,
      y: bot.y + bot.height / 2,
      width: 4,
      height: 4,
      speed: 6,
      damage: bot.damage,
      angle: bot.angle, // Usar angle en lugar de vx/vy
      owner: bot.id,
      shooterClan: bot.clan,
    };
    this.bullets.push(bullet);
  }

  botMegaShot(bot) {
    // Disparar 3 balas en diferentes ángulos
    for (let i = -1; i <= 1; i++) {
      const angle = bot.angle + i * 0.3; // 0.3 radianes = ~17 grados
      const bullet = {
        x: bot.x + bot.width / 2,
        y: bot.y + bot.height / 2,
        width: 6,
        height: 6,
        speed: 8,
        damage: bot.damage * 2, // Doble daño
        angle: angle, // Usar angle en lugar de vx/vy
        owner: bot.id,
        shooterClan: bot.clan,
        type: "mega",
      };
      this.bullets.push(bullet);
    }
  }

  botShoot(bot) {
    const bullet = {
      x: bot.x + bot.width / 2,
      y: bot.y + bot.height / 2,
      width: 4,
      height: 4,
      speed: 6,
      damage: bot.damage,
      angle: bot.angle, // Usar angle en lugar de vx/vy
      owner: bot.id,
      shooterClan: bot.clan,
    };
    this.bullets.push(bullet);
  }

  botMegaShot(bot) {
    // Disparar 3 balas en diferentes ángulos
    for (let i = -1; i <= 1; i++) {
      const angle = bot.angle + i * 0.3; // 0.3 radianes = ~17 grados
      const bullet = {
        x: bot.x + bot.width / 2,
        y: bot.y + bot.height / 2,
        width: 6,
        height: 6,
        speed: 8,
        damage: bot.damage * 2, // Doble daño
        angle: angle, // Usar angle en lugar de vx/vy
        owner: bot.id,
        shooterClan: bot.clan,
        type: "mega",
      };
      this.bullets.push(bullet);
    }
  }

  updateBots() {
    // Always use Web Worker if available for performance
    if (this.useWebWorkers && this.botWorker) {
      // Send current bot and player data to the worker
      this.botWorker.postMessage({
        type: "updateBots",
        data: {
          bots: this.bots,
          worldData: {
            // Only send dynamic data
            players: this.players,
          },
        },
      });
    }
    // Fallback AI logic is now removed and lives entirely in bot-worker.js
  }

  respawnPlayer(player) {
    if (player.isHuman) {
      // Human player - nave destruida, remover del equipo
      this.shipDestroyed = true;

      // Remover nave del equipo (se mantiene en inventario)
      const equippedData = localStorage.getItem("equipped");
      if (equippedData) {
        const equipped = JSON.parse(equippedData);
        equipped.ship = null;
        equipped.weapon = null;
        equipped.shield = null;
        equipped.engine = null;
        localStorage.setItem("equipped", JSON.stringify(equipped));
      }

      // Marcar que no tiene nave equipada
      localStorage.setItem("hasShip", "false");
      this.hasShip = false;

      // Mostrar pantalla de nave destruida
      this.showShipDestroyedScreen();

      // Detener el juego
      this.gameState = "shipDestroyed";
    } else {
      // Bot respawn with explosion
      // Create explosion particles
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 40 + Math.random() * 30,
          color: player.isBoss
            ? "#ff00ff"
            : player.isElite
              ? "#FF6B35"
              : "#ffff00",
        });
      }

      const clan = this.clans[player.clan];
      const safeZone = this.clanSafeZones.find(
        (zone) => zone.clan === player.clan,
      );

      // Spawn in the clan's safe zone
      const spawnX = safeZone.x + 100 + Math.random() * 200; // Within safe zone
      const spawnY = safeZone.y + 100 + Math.random() * 200; // Within safe zone

      player.x = spawnX;
      player.y = spawnY;
      player.health = player.maxHealth;
      player.target = null;
      player.state = "patrol";

      // Add respawn message after a delay
      setTimeout(() => {
        this.addDamageNumber(
          "RESPAWN",
          spawnX + player.width / 2,
          spawnY - 20,
          "#00ff00",
        );
      }, 1000);
    }
  }

  showShipDestroyedScreen() {
    // Crear pantalla de nave destruida
    const destroyedScreen = document.createElement("div");
    destroyedScreen.id = "shipDestroyedScreen";
    destroyedScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            color: white;
            font-family: Arial, sans-serif;
        `;

    destroyedScreen.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1 style="color: #ff4444; font-size: 48px; margin-bottom: 20px;">💥 NAVE DESTRUIDA</h1>
                <p style="font-size: 24px; margin-bottom: 30px;">Tu nave ha sido destruida</p>
                <p style="font-size: 18px; margin-bottom: 20px; color: #ccc;">La nave se ha guardado en tu inventario</p>
                <p style="font-size: 16px; margin-bottom: 40px; color: #888;">Necesitas equipar una nave para continuar jugando</p>
                <button id="backToMenuFromDestroyed" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    margin: 10px;
                ">Volver al Menú</button>
            </div>
        `;

    document.body.appendChild(destroyedScreen);

    // Event listener
    document
      .getElementById("backToMenuFromDestroyed")
      .addEventListener("click", () => {
        document.body.removeChild(destroyedScreen);
        this.showMenu();
      });
  }

  shoot() {
    LogManager.log(
      "debug",
      "[Disparo P3] shoot(): Creando y añadiendo bala al array.",
    );
    const weaponDamage =
      this.equipment.weapon && this.equipment.weapon.damage
        ? this.equipment.weapon.damage
        : 0;
    const totalDamage = this.player.damage + weaponDamage;

    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y + this.player.height / 2 - 2,
      width: 4,
      height: 4,
      speed: 8,
      angle: this.player.angle,
      damage: totalDamage,
      shooterClan: this.playerClan,
      owner: "player",
    });
  }

  useAbility() {
    const ship = this.basicShip;

    switch (ship.ability) {
      case "Ráfaga":
        // Rapid fire for 3 seconds
        for (let i = 0; i < 10; i++) {
          setTimeout(() => this.shoot(), i * 100);
        }
        break;
      case "Turbo":
        // Speed boost for 5 seconds
        this.player.speed *= 2;
        setTimeout(() => (this.player.speed /= 2), 5000);
        break;
      case "Mega Disparo":
        // Powerful single shot
        const megaBullet = {
          x: this.player.x + this.player.width / 2 - 8,
          y: this.player.y,
          width: 16,
          height: 20,
          speed: 6,
          damage: this.player.damage * 3,
        };
        this.bullets.push(megaBullet);
        break;
      case "Escudo":
        // Temporary invincibility
        this.player.invincible = true;
        setTimeout(() => (this.player.invincible = false), 3000);
        break;
    }

    // Add ability particles - REMOVED to prevent covering ships
    /*
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: '#ff6b35'
            });
        }
        */
  }

  updateEnemies() {
    this.enemies.forEach((enemy, index) => {
      const distanceToPlayer = this.getDistance(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y,
      );

      // Update enemy state based on distance to player
      if (distanceToPlayer < enemy.detectionRange) {
        enemy.state = "chase";
      } else {
        enemy.state = "patrol";
      }

      // Move enemy based on state
      if (enemy.state === "chase") {
        // Move towards player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }

        // Shoot at player if close enough
        if (
          distanceToPlayer < 200 &&
          Date.now() - enemy.lastShot > enemy.fireRate * 1000
        ) {
          this.enemyShoot(enemy);
          enemy.lastShot = Date.now();
        }
      } else {
        // Patrol behavior - random movement
        if (Math.random() < 0.02) {
          enemy.patrolDirection = Math.random() * Math.PI * 2;
        }

        if (enemy.patrolDirection !== undefined) {
          enemy.x += Math.cos(enemy.patrolDirection) * enemy.speed * 0.5;
          enemy.y += Math.sin(enemy.patrolDirection) * enemy.speed * 0.5;
        }
      }

      // Keep enemy within world bounds
      enemy.x = Math.max(0, Math.min(enemy.x, this.worldSize - enemy.width));
      enemy.y = Math.max(0, Math.min(enemy.y, this.worldSize - enemy.height));

      // Check collision with obstacles
      this.obstacles.forEach((obstacle) => {
        if (this.checkCollision(enemy, obstacle)) {
          // Simple collision response - move enemy back
          const overlapX = Math.min(
            enemy.x + enemy.width - obstacle.x,
            obstacle.x + obstacle.width - enemy.x,
          );
          const overlapY = Math.min(
            enemy.y + enemy.height - obstacle.y,
            obstacle.y + obstacle.height - enemy.y,
          );

          if (overlapX < overlapY) {
            if (enemy.x < obstacle.x) {
              enemy.x = obstacle.x - enemy.width;
            } else {
              enemy.x = obstacle.x + obstacle.width;
            }
          } else {
            if (enemy.y < obstacle.y) {
              enemy.y = obstacle.y - enemy.height;
            } else {
              enemy.y = obstacle.y + obstacle.height;
            }
          }
        }
      });
    });
  }

  enemyShoot(enemy) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const bullet = {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        width: 6,
        height: 6,
        speed: 3,
        damage: enemy.damage,
        vx: (dx / distance) * 3,
        vy: (dy / distance) * 3,
      };
      this.enemyBullets.push(bullet);
    }
  }

  updateBullets() {
    // Limitar el número de balas según la configuración de rendimiento
    const maxBullets = this.performanceSettings.maxBullets;
    if (this.bullets.length > maxBullets) {
      this.bullets.splice(maxBullets);
    }

    this.bullets.forEach((bullet, bulletIndex) => {
      LogManager.log(
        "debug",
        "[Disparo P4] updateBullets: Actualizando posición de la bala.",
        { bulletX: bullet.x, bulletY: bullet.y },
      );
      // Move bullet using angle
      bullet.x += Math.cos(bullet.angle) * bullet.speed;
      bullet.y += Math.sin(bullet.angle) * bullet.speed;

      // Remove bullets that are off world
      if (
        bullet.x < 0 ||
        bullet.x > this.worldSize ||
        bullet.y < 0 ||
        bullet.y > this.worldSize
      ) {
        this.bullets.splice(bulletIndex, 1);
        return;
      }

      // Check collision with obstacles (except player's base)
      this.obstacles.forEach((obstacle) => {
        if (this.checkCollision(bullet, obstacle)) {
          // Allow bullets to pass through player's base
          if (obstacle.type === "base" && obstacle.clan === this.playerClan) {
            // Can pass through
          } else {
            // Bullet hits obstacle - verificar si es destructible
            if (obstacle.isDestructible && !obstacle.isDestroyed) {
              obstacle.health -= bullet.damage;

              // Mostrar número de daño
              this.addDamageNumber(
                bullet.damage,
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2,
                "#ff8800"
              );

              // Verificar si la estructura fue destruida
              if (obstacle.health <= 0) {
                this.destroyStructure(obstacle, obstacle.type, bullet.owner);
              }
            }

            this.bullets.splice(bulletIndex, 1);
            return;
          }
        }
      });

      // Check collision with orbital satellites
      if (this.orbitalSatellites) {
        this.orbitalSatellites.forEach(satellite => {
          if (!satellite.isDestroyed && this.checkCollision(bullet, satellite)) {
            satellite.health -= bullet.damage;

            // Mostrar número de daño
            this.addDamageNumber(
              bullet.damage,
              satellite.x,
              satellite.y,
              "#00ffff"
            );

            // Verificar destrucción
            if (satellite.health <= 0) {
              this.destroyStructure(satellite, 'satellite', bullet.owner);
            }

            this.bullets.splice(bulletIndex, 1);
            return;
          }
        });
      }

      // Check collision with orbital towers
      if (this.orbitalTowers) {
        this.orbitalTowers.forEach(tower => {
          if (!tower.isDestroyed && this.checkCollision(bullet, tower)) {
            tower.health -= bullet.damage;

            // Mostrar número de daño
            this.addDamageNumber(
              bullet.damage,
              tower.x,
              tower.y,
              "#ff0000"
            );

            // Verificar destrucción
            if (tower.health <= 0) {
              this.destroyStructure(tower, 'tower', bullet.owner);
            }

            this.bullets.splice(bulletIndex, 1);
            return;
          }
        });
      }

      // Check collision with players (for bot bullets and player bullets)
      if (bullet.owner) {
        this.players.forEach((player, playerIndex) => {
          if (player.health > 0) {
            // Determine shooter clan
            let shooterClan = null;
            if (bullet.owner === "player") {
              shooterClan = this.playerClan;
            } else {
              shooterClan = this.bots.find((b) => b.id === bullet.owner)?.clan;
            }

            // Check if this is friendly fire (same clan)
            if (shooterClan !== null && player.clan === shooterClan) {
              // LogManager.log('info', `Friendly fire prevented: ${bullet.owner} (${this.clans[shooterClan].name}) -> ${player.name} (${this.clans[player.clan].name})`);
              return; // Skip - same clan, no damage
            }

            // Check collision with enemy players
            if (shooterClan !== null && player.clan !== shooterClan) {
              // Check if player is in their safe zone (protected)
              const isInSafeZone = this.isPlayerInSafeZone(player);

              // Don't damage players in their safe zone
              if (!isInSafeZone && this.checkCollision(bullet, player)) {
                // Calcular daño final (considerar escudo de bots)
                let finalDamage = bullet.damage;
                if (!player.isHuman && player.shieldActive) {
                  finalDamage = Math.floor(bullet.damage * 0.5); // 50% menos daño con escudo
                }

                // Trackear quién hizo el último daño
                player.lastDamageFrom = bullet.owner;

                // LogManager.log('info', `Damage dealt: ${bullet.owner} (${this.clans[shooterClan].name}) -> ${player.name} (${this.clans[player.clan].name}) = ${finalDamage}`);
                player.health -= finalDamage;
                this.bullets.splice(bulletIndex, 1);

                // Add damage number
                this.addDamageNumber(
                  finalDamage,
                  player.x + player.width / 2,
                  player.y + player.height / 2,
                  "#ff0000",
                );

                // Si el jugador murió, dropear monedas
                if (player.health <= 0) {
                  // Dropear monedas siempre que alguien mate a un bot
                  this.dropCoins(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    "bot",
                    player.isElite,
                    player.isBoss,
                    player.lastDamageFrom, // Quién lo mató
                  );
                  const botType = player.isBoss ? "(BOSS)" : player.isElite ? "(ELITE)" : "(NORMAL)";
                  console.log(
                    `💰 ${player.name} ${botType} dropeó monedas (último hit: ${player.lastDamageFrom})`,
                  );
                }

                // Add hit particles - REMOVED to prevent covering ships
                /*
                                for (let i = 0; i < 8; i++) {
                                    this.particles.push({
                                        x: player.x + player.width / 2,
                                        y: player.y + player.height / 2,
                                        vx: (Math.random() - 0.5) * 3,
                                        vy: (Math.random() - 0.5) * 3,
                                        life: 15,
                                        color: '#ff0000'
                                    });
                                }
                                */

                // Check if player died
                if (player.health <= 0) {
                  this.respawnPlayer(player);
                }
                return;
              }
            }
          }
        });
      }
    });
  }

  updateEnemyBullets() {
    this.enemyBullets.forEach((bullet, bulletIndex) => {
      // Move bullet
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // Remove bullets that are off world
      if (
        bullet.x < 0 ||
        bullet.x > this.worldSize ||
        bullet.y < 0 ||
        bullet.y > this.worldSize
      ) {
        this.enemyBullets.splice(bulletIndex, 1);
        return;
      }

      // Check collision with obstacles (except player's base)
      this.obstacles.forEach((obstacle) => {
        if (this.checkCollision(bullet, obstacle)) {
          // Allow bullets to pass through player's base
          if (obstacle.type === "base" && obstacle.clan === this.playerClan) {
            // Can pass through
          } else {
            // Bullet hits obstacle - verificar si es destructible
            if (obstacle.isDestructible && !obstacle.isDestroyed) {
              obstacle.health -= bullet.damage;

              // Mostrar número de daño
              this.addDamageNumber(
                bullet.damage,
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2,
                "#ff8800"
              );

              // Verificar si la estructura fue destruida
              if (obstacle.health <= 0) {
                this.destroyStructure(obstacle, obstacle.type, bullet.owner);
              }
            }

            this.enemyBullets.splice(bulletIndex, 1);
            return;
          }
        }
      });

      // Check collision with orbital satellites
      if (this.orbitalSatellites) {
        this.orbitalSatellites.forEach(satellite => {
          if (!satellite.isDestroyed && this.checkCollision(bullet, satellite)) {
            satellite.health -= bullet.damage;

            this.addDamageNumber(
              bullet.damage,
              satellite.x,
              satellite.y,
              "#00ffff"
            );

            if (satellite.health <= 0) {
              this.destroyStructure(satellite, 'satellite', bullet.owner);
            }

            this.enemyBullets.splice(bulletIndex, 1);
            return;
          }
        });
      }

      // Check collision with orbital towers
      if (this.orbitalTowers) {
        this.orbitalTowers.forEach(tower => {
          if (!tower.isDestroyed && this.checkCollision(bullet, tower)) {
            tower.health -= bullet.damage;

            this.addDamageNumber(
              bullet.damage,
              tower.x,
              tower.y,
              "#ff0000"
            );

            if (tower.health <= 0) {
              this.destroyStructure(tower, 'tower', bullet.owner);
            }

            this.enemyBullets.splice(bulletIndex, 1);
            return;
          }
        });
      }

      // Check collision with player
      if (this.checkCollision(bullet, this.player)) {
        // Check if player is in their safe zone (protected)
        const isInSafeZone = this.isPlayerInSafeZone(this.player);

        // Don't damage player in their safe zone
        if (!isInSafeZone && !this.player.invincible) {
          const actualDamage = Math.max(
            1,
            bullet.damage - this.equipment.shield.defense,
          );
          this.player.health -= actualDamage;

          // Add damage number for player
          this.addDamageNumber(
            actualDamage,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            "#ff0000",
          );

          // Add hit particles
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: this.player.x + this.player.width / 2,
              y: this.player.y + this.player.height / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 20,
              color: "#ff0000",
            });
          }

          // If player dies, respawn them
          if (this.player.health <= 0) {
            this.respawnPlayer(this.player);
          }
        }

        this.enemyBullets.splice(bulletIndex, 1);
      }
    });
  }

  addDamageNumber(damage, x, y, color) {
    this.damageNumbers.push({
      value: damage,
      x: x,
      y: y,
      color: color,
      life: 60,
      vy: -1,
      vx: (Math.random() - 0.5) * 2,
      isText: typeof damage === "string",
    });
  }

  dropCoins(x, y, enemyType, isElite = false, isBoss = false, droppedBy = null) {
    // Determinar cantidad de monedas basado en el tipo de enemigo
    let coinCount = 1;
    let coinValue = 1;

    if (enemyType === "bot") {
      if (isBoss) {
        coinCount = 5; // Bots Boss dropean 5 monedas
        coinValue = 5; // Cada moneda vale 5 (total: 25 coins)
      } else if (isElite) {
        coinCount = 3; // Bots elite dropean 3 monedas
        coinValue = 2; // Cada moneda vale 2 (total: 6 coins)
      } else {
        coinCount = 1; // Bots normales dropean 1 moneda
        coinValue = 1; // Cada moneda vale 1 (total: 1 coin)
      }
    } else if (enemyType === "base") {
      coinCount = 10; // Bases dropean 10 monedas
      coinValue = 10; // Cada moneda vale 10 (total: 100 coins)
    } else if (enemyType === "satellite") {
      coinCount = 5; // Satélites dropean 5 monedas
      coinValue = 5; // Cada moneda vale 5 (total: 25 coins)
    } else if (enemyType === "tower") {
      coinCount = 3; // Torres dropean 3 monedas
      coinValue = 3; // Cada moneda vale 3 (total: 9 coins)
    }

    // Dropear las monedas
    const now = Date.now();
    for (let i = 0; i < coinCount; i++) {
      this.coinObjects.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        width: 12,
        height: 12,
        value: coinValue,
        collected: false,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 300, // 5 seconds to collect
        droppedBy: droppedBy, // Quién dropeó la moneda
        droppedAt: now, // Timestamp de cuando se dropeó
      });
    }
  }

  updatePowerUps() {
    this.powerUps.forEach((powerUp, index) => {
      powerUp.y += powerUp.speed;

      // Check collision with player
      if (this.checkCollision(powerUp, this.player)) {
        if (powerUp.type === "health") {
          this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + 30,
          );
        } else {
          this.player.damage += 5;
        }
        this.powerUps.splice(index, 1);

        // Add collection particles
        for (let i = 0; i < 10; i++) {
          this.particles.push({
            x: powerUp.x + powerUp.width / 2,
            y: powerUp.y + powerUp.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 20,
            color: "#00ff00",
          });
        }
      }

      // Remove power-ups that are off screen
      if (powerUp.y > this.canvas.height + 20) {
        this.powerUps.splice(index, 1);
      }
    });
  }

  updateParticles() {
    // Limitar partículas según la configuración de rendimiento
    const maxParticles = this.performanceSettings.maxParticles;
    if (this.particles.length > maxParticles) {
      this.particles.splice(0, this.particles.length - maxParticles);
    }

    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  updateDamageNumbers() {
    this.damageNumbers.forEach((number, index) => {
      number.x += number.vx;
      number.y += number.vy;
      number.life--;

      if (number.life <= 0) {
        this.damageNumbers.splice(index, 1);
      }
    });
  }

  updateCoins() {
    const now = Date.now();

    this.coinObjects.forEach((coin, index) => {
      // Move coin slightly
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.life--;

      // Check collision with player (el jugador siempre puede recoger)
      if (this.checkCollision(coin, this.player)) {
        this.coins += coin.value;
        this.coinObjects.splice(index, 1);

        // Add collection particles (reduced for performance)
        for (let i = 0; i < 2; i++) {
          this.particles.push({
            x: coin.x + coin.width / 2,
            y: coin.y + coin.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 10,
            color: "#ffd700",
          });
        }
        return;
      }

      // Check collision with bots (solo después de 3 segundos)
      const coinAge = now - (coin.droppedAt || 0);
      const canBotsCollect = coinAge >= 3000; // 3 segundos

      if (canBotsCollect) {
        this.players.forEach((player) => {
          if (!player.isHuman && player.health > 0 && this.checkCollision(coin, player)) {
            // Bot recoge la moneda (no la añade al jugador, simplemente desaparece)
            this.coinObjects.splice(index, 1);

            // Pequeña partícula para indicar que un bot recogió la moneda
            this.particles.push({
              x: coin.x + coin.width / 2,
              y: coin.y + coin.height / 2,
              vx: 0,
              vy: -1,
              life: 15,
              color: "#888888",
            });
          }
        });
      }

      // Remove coins that have expired
      if (coin.life <= 0) {
        this.coinObjects.splice(index, 1);
      }
    });
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  levelUp() {
    this.level++;
    this.exp -= this.expToNext;
    this.expToNext = Math.floor(this.expToNext * 1.2);

    // Dar 5 puntos de habilidad por nivel
    this.skillPoints += 5;

    // Level up effects
    this.player.maxHealth += 20;
    this.player.health = this.player.maxHealth;
    this.player.damage += 5;

    // Add level up particles (reduced for performance)
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        color: "#ffff00",
      });
    }

    // Verificar logros de nivel
    this.checkAchievements();

    this.updateUI();
  }

  // Sistema de logros
  checkAchievements() {
    // Logro de nivel
    if (this.level >= 5 && !this.achievements.includes("level5")) {
      this.unlockAchievement("level5");
    }
    if (this.level >= 10 && !this.achievements.includes("level10")) {
      this.unlockAchievement("level10");
    }

    // Logro de monedas
    if (this.coins >= 1000 && !this.achievements.includes("richPlayer")) {
      this.unlockAchievement("richPlayer");
    }
  }

  checkKillAchievements() {
    // Primer kill
    if (!this.achievements.includes("firstKill")) {
      this.unlockAchievement("firstKill");
    }

    // Racha de kills
    if (this.killStreak >= 5 && !this.achievements.includes("killStreak5")) {
      this.unlockAchievement("killStreak5");
    }
    if (this.killStreak >= 10 && !this.achievements.includes("killStreak10")) {
      this.unlockAchievement("killStreak10");
    }
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievementsList.find(
      (a) => a.id === achievementId,
    );
    if (achievement && !this.achievements.includes(achievementId)) {
      this.achievements.push(achievementId);
      this.coins += achievement.reward;

      // Mostrar notificación
      this.showAchievementNotification(achievement);
    }
  }

  showAchievementNotification(achievement) {
    // Crear notificación temporal
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            border: 2px solid #ff6b35;
            border-radius: 15px;
            padding: 20px;
            color: #000;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            animation: achievementPop 2s ease-out;
        `;
    notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
            <div>¡Logro Desbloqueado!</div>
            <div style="font-size: 16px; margin-top: 5px;">${achievement.name}</div>
            <div style="font-size: 14px; margin-top: 5px;">+${achievement.reward} monedas</div>
        `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Sistema de habilidades
  useSkill(key) {
    const skill = this.skills[key];
    if (!skill || skill.cooldown > 0) return;

    skill.cooldown = skill.maxCooldown;

    switch (key) {
      case "q": // Ráfaga Rápida
        this.useRapidFire();
        break;
      case "e": // Escudo Temporal
        this.useTemporaryShield();
        break;
      case "r": // Turbo Boost
        this.useTurboBoost();
        break;
      case "t": // Mega Disparo
        this.useMegaShot();
        break;
      case "f": // Campo de Fuerza
        this.useForceField();
        break;
    }
    // NO renderizar widget de skills en móvil (usamos botones táctiles)
    // this.renderSkillsWidget();
  }

  useRapidFire() {
    // Disparar 5 proyectiles rápidamente
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const angle = this.player.angle + (i - 2) * 0.2;
        this.shootAtAngle(angle);
      }, i * 100);
    }
  }

  useTemporaryShield() {
    this.player.invincible = true;
    setTimeout(() => {
      this.player.invincible = false;
    }, 3000);
  }

  useTurboBoost() {
    const originalSpeed = this.player.speed;
    this.player.speed *= 2;
    setTimeout(() => {
      this.player.speed = originalSpeed;
    }, 5000);
  }

  useMegaShot() {
    const bullet = {
      x: this.player.x + this.player.width / 2 - 4,
      y: this.player.y + this.player.height / 2 - 4,
      width: 8,
      height: 8,
      speed: 10,
      angle: this.player.angle,
      damage: this.player.damage * 3,
      isPlayerBullet: true,
      owner: "player",
      isMegaShot: true,
    };
    this.bullets.push(bullet);
  }

  useForceField() {
    // Empujar enemigos lejos
    this.enemies.forEach((enemy) => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        enemy.x += (dx / distance) * 100;
        enemy.y += (dy / distance) * 100;
      }
    });
  }

  shootAtAngle(angle) {
    const bullet = {
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y + this.player.height / 2 - 2,
      width: 4,
      height: 4,
      speed: 8,
      angle: angle,
      damage: this.player.damage,
      isPlayerBullet: true,
      owner: "player",
    };
    this.bullets.push(bullet);
  }

  // Sistema de árbol de habilidades
  toggleSkillTree() {
    const skillTreePanel = document.getElementById("skillTreePanel");
    if (skillTreePanel) {
      skillTreePanel.style.display =
        skillTreePanel.style.display === "none" ? "block" : "none";
    } else {
      this.createSkillTreePanel();
    }
  }

  createSkillTreePanel() {
    const panel = document.createElement("div");
    panel.id = "skillTreePanel";
    panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 600px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ffff;
            border-radius: 15px;
            padding: 20px;
            z-index: 1000;
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;

    panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #00ffff; margin: 0;">🌳 Árbol de Habilidades</h2>
                <button onclick="this.parentElement.parentElement.style.display='none'" style="background: #ff0000; border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✕</button>
            </div>

            <div style="margin-bottom: 20px; padding: 10px; background: rgba(0, 255, 255, 0.1); border-radius: 10px;">
                <div>Puntos de Habilidad Disponibles: <span style="color: #ffff00; font-weight: bold;">${this.skillPoints}</span></div>
                <div>Nivel Actual: <span style="color: #00ff00; font-weight: bold;">${this.level}</span></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3 style="color: #00ffff; margin-bottom: 15px;">⚔️ Habilidades de Combate</h3>
                    <div id="combatSkills"></div>
                </div>
                <div>
                    <h3 style="color: #00ffff; margin-bottom: 15px;">🛡️ Habilidades Defensivas</h3>
                    <div id="defenseSkills"></div>
                </div>
            </div>

            <div style="margin-top: 20px; padding: 10px; background: rgba(255, 255, 0, 0.1); border-radius: 10px;">
                <h3 style="color: #ffff00; margin-bottom: 10px;">🎮 Controles de Habilidades</h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                    <div style="text-align: center; padding: 5px; background: rgba(0, 255, 255, 0.2); border-radius: 5px;">
                        <div style="font-weight: bold;">Q</div>
                        <div style="font-size: 12px;">Ráfaga Rápida</div>
                    </div>
                    <div style="text-align: center; padding: 5px; background: rgba(0, 255, 255, 0.2); border-radius: 5px;">
                        <div style="font-weight: bold;">E</div>
                        <div style="font-size: 12px;">Escudo Temporal</div>
                    </div>
                    <div style="text-align: center; padding: 5px; background: rgba(0, 255, 255, 0.2); border-radius: 5px;">
                        <div style="font-weight: bold;">R</div>
                        <div style="font-size: 12px;">Turbo Boost</div>
                    </div>
                    <div style="text-align: center; padding: 5px; background: rgba(0, 255, 255, 0.2); border-radius: 5px;">
                        <div style="font-weight: bold;">T</div>
                        <div style="font-size: 12px;">Mega Disparo</div>
                    </div>
                    <div style="text-align: center; padding: 5px; background: rgba(0, 255, 255, 0.2); border-radius: 5px;">
                        <div style="font-weight: bold;">F</div>
                        <div style="font-size: 12px;">Campo de Fuerza</div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(panel);
    this.populateSkillTree();
  }

  populateSkillTree() {
    const combatSkills = document.getElementById("combatSkills");
    const defenseSkills = document.getElementById("defenseSkills");

    if (!combatSkills || !defenseSkills) return;

    // Habilidades de combate
    const combatSkillList = [
      {
        name: "Ráfaga Rápida",
        description: "Dispara 5 proyectiles rápidamente",
        cost: 2,
        icon: "⚡",
      },
      {
        name: "Mega Disparo",
        description: "Dispara un proyectil masivo",
        cost: 3,
        icon: "💥",
      },
      {
        name: "Campo de Fuerza",
        description: "Empuja enemigos lejos",
        cost: 4,
        icon: "🌀",
      },
    ];

    // Habilidades defensivas
    const defenseSkillList = [
      {
        name: "Escudo Temporal",
        description: "Escudo que bloquea daño por 3 segundos",
        cost: 2,
        icon: "🛡️",
      },
      {
        name: "Turbo Boost",
        description: "Aumenta velocidad por 5 segundos",
        cost: 3,
        icon: "🚀",
      },
      {
        name: "Regeneración",
        description: "Regenera 1 HP por segundo",
        cost: 5,
        icon: "💚",
      },
    ];

    combatSkills.innerHTML = combatSkillList
      .map(
        (skill) => `
            <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 0, 0, 0.2); border-radius: 8px; border: 1px solid #ff0000;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold;">${skill.icon} ${skill.name}</div>
                        <div style="font-size: 12px; color: #ccc;">${skill.description}</div>
                    </div>
                    <button onclick="game.upgradeSkill('${skill.name}')"
                            style="background: ${this.skillPoints >= skill.cost ? "#00ff00" : "#666"};
                                   border: none; color: white; padding: 5px 10px;
                                   border-radius: 5px; cursor: ${this.skillPoints >= skill.cost ? "pointer" : "not-allowed"};">
                        ${skill.cost} pts
                    </button>
                </div>
            </div>
        `,
      )
      .join("");

    defenseSkills.innerHTML = defenseSkillList
      .map(
        (skill) => `
            <div style="margin-bottom: 10px; padding: 10px; background: rgba(0, 0, 255, 0.2); border-radius: 8px; border: 1px solid #0000ff;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold;">${skill.icon} ${skill.name}</div>
                        <div style="font-size: 12px; color: #ccc;">${skill.description}</div>
                    </div>
                    <button onclick="game.upgradeSkill('${skill.name}')"
                            style="background: ${this.skillPoints >= skill.cost ? "#00ff00" : "#666"};
                                   border: none; color: white; padding: 5px 10px;
                                   border-radius: 5px; cursor: ${this.skillPoints >= skill.cost ? "pointer" : "not-allowed"};">
                        ${skill.cost} pts
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  upgradeSkill(skillName) {
    // Implementar sistema de mejora de habilidades
    const skillCosts = {
      "Ráfaga Rápida": 2,
      "Mega Disparo": 3,
      "Campo de Fuerza": 4,
      "Escudo Temporal": 2,
      "Turbo Boost": 3,
      Regeneración: 5,
    };

    const cost = skillCosts[skillName];
    if (this.skillPoints >= cost) {
      this.skillPoints -= cost;
      this.populateSkillTree(); // Actualizar panel

      // Mostrar notificación
      this.showSkillUpgradeNotification(skillName);
    }
  }

  showSkillUpgradeNotification(skillName) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00ff00, #00cc00);
            border: 2px solid #ffffff;
            border-radius: 10px;
            padding: 15px;
            color: #000;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            z-index: 1001;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
        `;
    notification.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 5px;">⭐</div>
            <div>¡Habilidad Mejorada!</div>
            <div style="font-size: 14px; margin-top: 5px;">${skillName}</div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  drawSafeZone() {
    // Draw all clan safe zones
    this.clanSafeZones.forEach((safeZone) => {
      const screenPos = this.worldToScreen(safeZone.x, safeZone.y);

      // Use clan color for safe zone
      const clanColor = safeZone.color;
      const isPlayerClan = safeZone.clan === this.playerClan;

      // Draw safe zone with semi-transparent clan color
      this.ctx.fillStyle = isPlayerClan
        ? "rgba(0, 255, 0, 0.1)"
        : `rgba(${parseInt(clanColor.slice(1, 3), 16)}, ${parseInt(clanColor.slice(3, 5), 16)}, ${parseInt(clanColor.slice(5, 7), 16)}, 0.1)`;
      this.ctx.fillRect(
        screenPos.x,
        screenPos.y,
        safeZone.width,
        safeZone.height,
      );

      // Draw safe zone border
      this.ctx.strokeStyle = isPlayerClan ? "#00ff00" : clanColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([10, 5]);
      this.ctx.strokeRect(
        screenPos.x,
        screenPos.y,
        safeZone.width,
        safeZone.height,
      );
      this.ctx.setLineDash([]);
      this.ctx.lineWidth = 1;

      // Add safe zone text
      this.ctx.fillStyle = isPlayerClan ? "#00ff00" : clanColor;
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      const clanName = this.clans[safeZone.clan].name;
      this.ctx.fillText(
        `ZONA ${clanName}`,
        screenPos.x + safeZone.width / 2,
        screenPos.y + 20,
      );
    });
  }

  drawStars() {
    const starCount = this.performanceSettings.starCount;

    // Dibujar estrellas basadas en posición de la cámara para que cubran todo el mundo
    for (let i = 0; i < starCount; i++) {
      // Generar posición de estrella en el mundo usando hash para distribución aleatoria
      const hash1 = ((i * 2654435761) ^ (i >> 16)) >>> 0;
      const hash2 = ((i * 1597334677) ^ (i >> 8)) >>> 0;
      const worldX = (hash1 % this.worldSize);
      const worldY = (hash2 % this.worldSize);

      // Convertir a coordenadas de pantalla
      const screenPos = this.worldToScreen(worldX, worldY);

      // Solo dibujar si está visible en pantalla
      if (screenPos.x >= -10 && screenPos.x <= this.canvas.width + 10 &&
          screenPos.y >= -10 && screenPos.y <= this.canvas.height + 10) {

        // Determinar tipo de estrella (basado en índice para consistencia)
        const starType = i % 100;

        // Diferentes tamaños y brillos para variedad
        let size, brightness, color;

        if (starType < 5) {
          // 5% - Estrellas grandes y brillantes
          size = 2.5;
          brightness = 1.0;
          color = this.getStarColor(i % 7);
        } else if (starType < 15) {
          // 10% - Estrellas medianas brillantes
          size = 1.8;
          brightness = 0.9;
          color = this.getStarColor(i % 7);
        } else if (starType < 40) {
          // 25% - Estrellas medianas
          size = 1.3;
          brightness = 0.7;
          color = "#ffffff";
        } else {
          // 60% - Estrellas pequeñas y tenues
          size = 0.8;
          brightness = 0.5;
          color = "#ffffff";
        }

        // Dibujar estrella con brillo
        this.ctx.save();
        this.ctx.globalAlpha = brightness;

        // Agregar efecto de brillo para estrellas más grandes
        if (size > 1.5) {
          this.ctx.shadowBlur = 3;
          this.ctx.shadowColor = color;
        }

        this.ctx.fillStyle = color;

        // Dibujar estrella como círculo para estrellas grandes, pixel para pequeñas
        if (size > 1.2) {
          this.ctx.beginPath();
          this.ctx.arc(screenPos.x, screenPos.y, size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
        }

        this.ctx.restore();
      }
    }
  }

  getStarColor(type) {
    // Diferentes colores estelares realistas
    const colors = [
      "#ffffff", // Blanco (como nuestro Sol)
      "#ffe9c5", // Amarillo-blanco
      "#ffd2a1", // Naranja
      "#aabfff", // Azul-blanco (estrellas calientes)
      "#c9d8ff", // Azul claro
      "#ffcc6f", // Amarillo dorado
      "#ff9966", // Rojo-naranja (estrellas frías)
    ];
    return colors[type];
  }

  drawHealthBar(entity, x, y, width = 40, height = 4, yOffset = -25) {
    // entity debe tener propiedades: health, maxHealth
    if (!entity || entity.health === undefined || entity.maxHealth === undefined) return;

    const healthPercentage = Math.max(0, Math.min(1, entity.health / entity.maxHealth));
    const screenPos = this.worldToScreen(x, y);
    const centerX = screenPos.x + (entity.width || 0) / 2;
    const barY = screenPos.y + yOffset;

    // Borde de la barra (fondo rojo)
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillRect(
      centerX - width / 2,
      barY,
      width,
      height
    );

    // Barra de vida (verde)
    this.ctx.fillStyle = "#00ff00";
    this.ctx.fillRect(
      centerX - width / 2,
      barY,
      width * healthPercentage,
      height
    );

    // Borde negro para contraste
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      centerX - width / 2,
      barY,
      width,
      height
    );
  }

  drawPlayer() {
    if (!this.player) {
      LogManager.log("warn", "Player is null in drawPlayer");
      return;
    }

    const screenPos = this.worldToScreen(this.player.x, this.player.y);

    // Debug: Log player position
    LogManager.log(
      "info",
      `Drawing player at world (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}) -> screen (${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`,
    );

    // Si es un fantasma, solo dibujarlo si es el jugador local
    if (this.player.isGhost) {
      if (this.player.id === "player") {
        this.drawGhostShip(this.player);
      }
      return;
    }

    // Use ship color from equipment if available, otherwise use clan color
    let shipColor = this.player.shipColor || this.clans[this.player.clan].color;

    this.drawTriangularShip(this.player, shipColor, "#181824cc");

    // Draw health bar
    this.drawHealthBar(this.player, this.player.x, this.player.y, 40, 4, -25);

    // Draw player name
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    let displayName = this.player.name;
    if (!this.player.isHuman && this.player.isElite) {
      displayName += " [ELITE]";
      this.ctx.fillStyle = "#FF6B35"; // Color naranja para elite
    }
    this.ctx.fillText(
      displayName,
      screenPos.x + this.player.width / 2,
      screenPos.y - 35, // Movido más arriba para dejar espacio a la barra de vida
    );
  }

  drawTriangularShip(player, borderColor, fillColor) {
    const screenPos = this.worldToScreen(player.x, player.y);
    const centerX = screenPos.x + player.width / 2;
    const centerY = screenPos.y + player.height / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(player.angle);

    // Dibuja el cuerpo principal
    this.ctx.beginPath();
    this.ctx.moveTo(player.width / 2, 0); // Punta
    this.ctx.lineTo(-player.width / 2, -player.height / 2); // Atrás izq
    this.ctx.lineTo(-player.width / 2, player.height / 2); // Atrás der
    this.ctx.closePath();

    if (!player.isHuman) {
      if (player.isBoss) {
        this.ctx.fillStyle = "#9400D3"; // Jefe: Violeta oscuro
      } else if (player.isElite) {
        this.ctx.fillStyle = "#FF6B35"; // Elite: Naranja
      } else {
        this.ctx.fillStyle = "#FFD700"; // Normal: Amarillo
      }
    } else {
      this.ctx.fillStyle = "#181824"; // Jugador: negro
    }
    this.ctx.fill();

    // Si el jugador tiene skin, dibujarla encima del negro (no sobre la punta)
    if (player.isHuman && player.skinColor) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.7; // Skin semitransparente
      this.ctx.beginPath();
      this.ctx.moveTo(player.width / 2 - 8, 0); // Empieza después de la punta
      this.ctx.lineTo(-player.width / 2, -player.height / 2);
      this.ctx.lineTo(-player.width / 2, player.height / 2);
      this.ctx.closePath();
      this.ctx.fillStyle = player.skinColor;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Borde
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = player.isBoss ? 3 : 2; // Borde más grueso para jefes
    this.ctx.stroke();

    // Punta de la nave (nariz) del color del clan/base
    if (player.clan !== undefined) {
      const clanColor = this.clans[player.clan].color;
      this.ctx.fillStyle = clanColor;
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(player.width / 2, 0);
      this.ctx.lineTo(player.width / 2 - 8, -4);
      this.ctx.lineTo(player.width / 2 - 8, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Efectos visuales para bots con habilidades activas
    if (!player.isHuman) {
      this.drawBotSkillEffects(player, centerX, centerY);
    }
  }

  drawBotSkillEffects(bot, centerX, centerY) {
    const time = Date.now();

    // Rapid Fire - Efecto de fuego
    if (bot.rapidFireActive) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillStyle = "#ff4444";
      for (let i = 0; i < 3; i++) {
        const angle = (time / 100 + i * 2) % (Math.PI * 2);
        const radius = 25 + Math.sin(time / 200) * 5;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    // Shield - Efecto de escudo
    if (bot.shieldActive) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeStyle = "#00aaff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Turbo Boost - Efecto de velocidad
    if (bot.turboBoostActive) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = "#ffff00";
      for (let i = 0; i < 5; i++) {
        const x = centerX - i * 8 - Math.sin(time / 100) * 5;
        const y = centerY + Math.cos(time / 100 + i) * 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    // Force Field - Efecto de campo de fuerza
    if (bot.forceFieldActive) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.4;
      this.ctx.strokeStyle = "#ff00ff";
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const radius = 35 + i * 5 + Math.sin(time / 300) * 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
  }

  drawGhostShip(player) {
    const screenPos = this.worldToScreen(player.x, player.y);
    const centerX = screenPos.x + player.width / 2;
    const centerY = screenPos.y + player.height / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(player.angle);

    // Fantasma semitransparente sin skin
    this.ctx.globalAlpha = 0.3;

    // Dibuja el cuerpo principal (gris semitransparente)
    this.ctx.beginPath();
    this.ctx.moveTo(player.width / 2, 0); // Punta
    this.ctx.lineTo(-player.width / 2, -player.height / 2); // Atrás izq
    this.ctx.lineTo(-player.width / 2, player.height / 2); // Atrás der
    this.ctx.closePath();

    this.ctx.fillStyle = "#666666"; // Gris para fantasma
    this.ctx.fill();

    // Borde semitransparente
    this.ctx.strokeStyle = "#888888";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Punta de la nave del color del clan (más tenue)
    if (player.clan !== undefined) {
      const clanColor = this.clans[player.clan].color;
      this.ctx.fillStyle = clanColor;
      this.ctx.globalAlpha = 0.5;
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(player.width / 2, 0);
      this.ctx.lineTo(player.width / 2 - 8, -4);
      this.ctx.lineTo(player.width / 2 - 8, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Texto "FANTASMA" encima
    this.ctx.fillStyle = "#888888";
    this.ctx.font = "10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("FANTASMA", centerX, screenPos.y - 15);
  }

  drawRustSpots(ctx, width, height) {
    // Draw random rust spots
    const rustSpots = 8;
    for (let i = 0; i < rustSpots; i++) {
      const x = (Math.random() - 0.5) * width * 0.8;
      const y = (Math.random() - 0.5) * height * 0.8;
      const radius = Math.random() * 3 + 1;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#A0522D"; // Marrón rojizo
      ctx.fill();
    }
  }

  drawRaidIndicator(player) {
    if (player.id !== "player") {
      const healthBarWidth = 40;
      const healthBarHeight = 4;
      const healthPercentage = player.health / player.maxHealth;

      this.ctx.fillStyle = "#ff0000";
      this.ctx.fillRect(
        centerX - healthBarWidth / 2,
        screenPos.y - 25,
        healthBarWidth,
        healthBarHeight,
      );

      this.ctx.fillStyle = "#00ff00";
      this.ctx.fillRect(
        centerX - healthBarWidth / 2,
        screenPos.y - 25,
        healthBarWidth * healthPercentage,
        healthBarHeight,
      );
    }
  }

  drawRaidIndicator(player) {
    const screenPos = this.worldToScreen(player.x, player.y);
    const centerX = screenPos.x + player.width / 2;
    const centerY = screenPos.y + player.height / 2;

    // Draw raid indicator (red triangle above player)
    this.ctx.fillStyle = "#ff0000";
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, screenPos.y - 25);
    this.ctx.lineTo(centerX - 8, screenPos.y - 15);
    this.ctx.lineTo(centerX + 8, screenPos.y - 15);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw "RAID" text
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("RAID", centerX, screenPos.y - 35);
  }

  drawAssaultIndicator(player) {
    const screenPos = this.worldToScreen(player.x, player.y);
    const centerX = screenPos.x + player.width / 2;
    const centerY = screenPos.y + player.height / 2;

    // Draw assault indicator (red cross above player)
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 10, screenPos.y - 25);
    this.ctx.lineTo(centerX + 10, screenPos.y - 15);
    this.ctx.moveTo(centerX + 10, screenPos.y - 25);
    this.ctx.lineTo(centerX - 10, screenPos.y - 15);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    // Draw "ASSAULT" text
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("ASSAULT", centerX, screenPos.y - 40);
  }

  drawAllyIndicator(player) {
    const screenPos = this.worldToScreen(player.x, player.y);
    const centerX = screenPos.x + player.width / 2;
    const centerY = screenPos.y + player.height / 2;

    // Draw ally indicator (green shield above player)
    this.ctx.fillStyle = "#00ff00";
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;

    // Draw shield shape
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, screenPos.y - 35);
    this.ctx.lineTo(centerX - 8, screenPos.y - 25);
    this.ctx.lineTo(centerX - 8, screenPos.y - 15);
    this.ctx.lineTo(centerX + 8, screenPos.y - 15);
    this.ctx.lineTo(centerX + 8, screenPos.y - 25);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Draw "ALLY" text
    this.ctx.fillStyle = "#00ff00";
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("ALLY", centerX, screenPos.y - 45);
  }

  drawEnemy(enemy) {
    const screenPos = this.worldToScreen(enemy.x, enemy.y);

    if (enemy.type === "asteroid") {
      this.ctx.fillStyle = "#8b4513";
    } else if (enemy.clan !== undefined) {
      // Clan enemy
      this.ctx.fillStyle = enemy.state === "chase" ? enemy.color : enemy.color;
      this.ctx.shadowColor = enemy.color;
      this.ctx.shadowBlur = 5;
      this.ctx.fillRect(screenPos.x, screenPos.y, enemy.width, enemy.height);
      this.ctx.shadowBlur = 0;
    } else {
      // Regular enemy
      this.ctx.fillStyle = enemy.state === "chase" ? "#ff4444" : "#ff0000";
      this.ctx.fillRect(screenPos.x, screenPos.y, enemy.width, enemy.height);
    }

    // Draw health bar
    const healthPercent = enemy.health / enemy.maxHealth;
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillRect(screenPos.x, screenPos.y - 10, enemy.width, 5);
    this.ctx.fillStyle = "#00ff00";
    this.ctx.fillRect(
      screenPos.x,
      screenPos.y - 10,
      enemy.width * healthPercent,
      5,
    );
  }

  drawBullet(bullet) {
    LogManager.log(
      "debug",
      "[Disparo P5] drawBullet: Renderizando la bala en el canvas.",
      { bulletX: bullet.x, bulletY: bullet.y },
    );
    const screenPos = this.worldToScreen(bullet.x, bullet.y);

    if (!isFinite(screenPos.x) || !isFinite(screenPos.y)) {
      return;
    }

    this.ctx.save();
    this.ctx.translate(screenPos.x, screenPos.y);
    this.ctx.rotate(bullet.angle);

    if (bullet.isUltimate) {
      // Draw ultimate bullet with special effects
      this.ctx.fillStyle = "#ff0000";
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );
      this.ctx.strokeStyle = "#ffff00";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );

      // Add glow effect
      this.ctx.shadowColor = "#ff0000";
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );
      this.ctx.shadowBlur = 0;
    } else if (bullet.isMega) {
      // Draw mega bullet
      this.ctx.fillStyle = "#ff6b35";
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );
    } else {
      // Draw regular bullet
      this.ctx.fillStyle = "#00ff00";
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height,
      );
    }

    this.ctx.restore();
  }

  drawEnemyBullet(bullet) {
    const screenPos = this.worldToScreen(bullet.x, bullet.y);
    this.ctx.fillStyle = "#ff6666";
    this.ctx.fillRect(screenPos.x, screenPos.y, bullet.width, bullet.height);

    // Bullet glow
    this.ctx.shadowColor = "#ff6666";
    this.ctx.shadowBlur = 5;
    this.ctx.fillRect(screenPos.x, screenPos.y, bullet.width, bullet.height);
    this.ctx.shadowBlur = 0;
  }

  drawBlueBase(screenPos, obstacle) {
    const cx = screenPos.x + obstacle.width / 2;
    const cy = screenPos.y + obstacle.height / 2;
    const size = obstacle.width;
    const time = Date.now() / 1000;

    this.ctx.save();

    // 1. ESTRUCTURA HEXAGONAL PRINCIPAL
    this.ctx.fillStyle = "#0a0a1a";
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * size * 0.45;
      const y = cy + Math.sin(angle) * size * 0.45;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Borde azul cibernético
    this.ctx.strokeStyle = "#3b82f6";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 2. ANILLOS CONCÉNTRICOS (efecto de escudo)
    for (let i = 0; i < 3; i++) {
      const ringRadius = size * (0.35 - i * 0.1);
      const alpha = 0.3 - i * 0.1;
      this.ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 3. NÚCLEO CENTRAL ROTATORIO
    const coreRotation = time * 0.5;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(coreRotation);

    // Gradiente del núcleo
    const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
    coreGradient.addColorStop(0, "#60a5fa");
    coreGradient.addColorStop(0.6, "#3b82f6");
    coreGradient.addColorStop(1, "#1e40af");
    this.ctx.fillStyle = coreGradient;

    // Hexágono interior rotatorio
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle) * size * 0.12;
      const y = Math.sin(angle) * size * 0.12;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = "#93c5fd";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // 4. CIRCUITOS NEÓN (líneas que pulsan)
    const pulseBrightness = 0.5 + Math.sin(time * 3) * 0.5;
    this.ctx.strokeStyle = `rgba(59, 130, 246, ${pulseBrightness})`;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 8]);
    this.ctx.lineDashOffset = -(time * 30) % 16;

    // Circuitos desde el centro hacia los vértices
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const endX = cx + Math.cos(angle) * size * 0.45;
      const endY = cy + Math.sin(angle) * size * 0.45;

      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // 5. NODOS DE DATOS en cada vértice (pulsan alternados)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const nodeX = cx + Math.cos(angle) * size * 0.45;
      const nodeY = cy + Math.sin(angle) * size * 0.45;
      const nodePulse = 0.7 + Math.sin(time * 4 + i) * 0.3;

      const nodeGradient = this.ctx.createRadialGradient(
        nodeX, nodeY, 0,
        nodeX, nodeY, size * 0.05 * nodePulse
      );
      nodeGradient.addColorStop(0, "#60a5fa");
      nodeGradient.addColorStop(0.5, "#3b82f6");
      nodeGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

      this.ctx.fillStyle = nodeGradient;
      this.ctx.beginPath();
      this.ctx.arc(nodeX, nodeY, size * 0.05 * nodePulse, 0, Math.PI * 2);
      this.ctx.fill();

      // Núcleo blanco del nodo
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(nodeX, nodeY, size * 0.018, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 6. PANELES TECNOLÓGICOS (rectángulos con datos)
    const panelPositions = [
      { x: cx - size * 0.25, y: cy - size * 0.15 },
      { x: cx + size * 0.1, y: cy - size * 0.15 },
      { x: cx - size * 0.25, y: cy + size * 0.05 },
      { x: cx + size * 0.1, y: cy + size * 0.05 }
    ];

    panelPositions.forEach((pos, idx) => {
      this.ctx.fillStyle = "#000033";
      this.ctx.fillRect(pos.x, pos.y, size * 0.15, size * 0.08);
      this.ctx.strokeStyle = "#3b82f6";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(pos.x, pos.y, size * 0.15, size * 0.08);

      // Líneas de "datos" parpadeando
      const dataAlpha = Math.abs(Math.sin(time * 2 + idx)) * 0.7 + 0.3;
      this.ctx.strokeStyle = `rgba(59, 130, 246, ${dataAlpha})`;
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x + size * 0.01, pos.y + size * 0.02 + i * size * 0.02);
        this.ctx.lineTo(pos.x + size * 0.14, pos.y + size * 0.02 + i * size * 0.02);
        this.ctx.stroke();
      }
    });

    // 7. EMISORES DE ENERGÍA (cuatro esquinas)
    const emitters = [
      { x: cx - size * 0.35, y: cy - size * 0.2 },
      { x: cx + size * 0.35, y: cy - size * 0.2 },
      { x: cx - size * 0.35, y: cy + size * 0.2 },
      { x: cx + size * 0.35, y: cy + size * 0.2 }
    ];

    const emitterPulse = Math.abs(Math.sin(time * 6)) * 0.5 + 0.5;
    emitters.forEach(emitter => {
      this.ctx.fillStyle = `rgba(96, 165, 250, ${emitterPulse})`;
      this.ctx.fillRect(
        emitter.x - size * 0.015,
        emitter.y - size * 0.015,
        size * 0.03,
        size * 0.03
      );

      this.ctx.strokeStyle = "#60a5fa";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        emitter.x - size * 0.015,
        emitter.y - size * 0.015,
        size * 0.03,
        size * 0.03
      );
    });

    // 8. EFECTO DE ESCANEO (línea que se mueve verticalmente)
    const scanY = cy - size * 0.4 + ((time * 50) % (size * 0.8));
    const scanGradient = this.ctx.createLinearGradient(
      cx - size * 0.4, scanY - 2,
      cx - size * 0.4, scanY + 2
    );
    scanGradient.addColorStop(0, "rgba(59, 130, 246, 0)");
    scanGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.8)");
    scanGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    this.ctx.fillStyle = scanGradient;
    this.ctx.fillRect(cx - size * 0.4, scanY - 2, size * 0.8, 4);

    // 9. LOGO CIBERNÉTICO (triángulo digital)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + size * 0.22);
    this.ctx.lineTo(cx - size * 0.05, cy + size * 0.32);
    this.ctx.lineTo(cx + size * 0.05, cy + size * 0.32);
    this.ctx.closePath();
    this.ctx.fill();

    // Puntos adicionales del logo
    this.ctx.fillRect(cx - size * 0.02, cy + size * 0.25, size * 0.04, size * 0.02);

    // 10. PULSO ELECTROMAGNÉTICO (onda expansiva periódica)
    const pulseTime = (time * 0.7) % 2;
    if (pulseTime < 1) {
      const pulseRadius = size * 0.5 * pulseTime;
      const pulseAlpha = 1 - pulseTime;
      this.ctx.strokeStyle = `rgba(59, 130, 246, ${pulseAlpha * 0.6})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawRedBase(screenPos, obstacle) {
    const cx = screenPos.x + obstacle.width / 2;
    const cy = screenPos.y + obstacle.height / 2;
    const size = obstacle.width;
    const time = Date.now() / 1000; // Tiempo para animaciones

    this.ctx.save();

    // 1. ESTRUCTURA PRINCIPAL - Forma de diamante/rombo
    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size * 0.5); // Arriba
    this.ctx.lineTo(cx + size * 0.35, cy - size * 0.15); // Derecha arriba
    this.ctx.lineTo(cx + size * 0.4, cy + size * 0.1); // Derecha medio
    this.ctx.lineTo(cx + size * 0.3, cy + size * 0.45); // Derecha abajo
    this.ctx.lineTo(cx, cy + size * 0.5); // Abajo
    this.ctx.lineTo(cx - size * 0.3, cy + size * 0.45); // Izquierda abajo
    this.ctx.lineTo(cx - size * 0.4, cy + size * 0.1); // Izquierda medio
    this.ctx.lineTo(cx - size * 0.35, cy - size * 0.15); // Izquierda arriba
    this.ctx.closePath();
    this.ctx.fill();

    // Borde rojo brillante
    this.ctx.strokeStyle = "#ef4444";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 2. PLATAFORMAS LATERALES (asimétricas)
    // Plataforma derecha superior
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(cx + size * 0.35, cy - size * 0.2, size * 0.15, size * 0.12);
    this.ctx.strokeStyle = "#dc2626";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx + size * 0.35, cy - size * 0.2, size * 0.15, size * 0.12);

    // Plataforma izquierda inferior
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(cx - size * 0.5, cy + size * 0.05, size * 0.12, size * 0.2);
    this.ctx.strokeStyle = "#dc2626";
    this.ctx.strokeRect(cx - size * 0.5, cy + size * 0.05, size * 0.12, size * 0.2);

    // 3. TORRE DE COMANDO CENTRAL (cilindro elevado que rota)
    const towerRotation = time * 0.3; // Rotación lenta
    this.ctx.save();
    this.ctx.translate(cx, cy - size * 0.1);
    this.ctx.rotate(towerRotation);

    // Gradiente radial para la torre
    const towerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
    towerGradient.addColorStop(0, "#ff4444");
    towerGradient.addColorStop(0.6, "#dc2626");
    towerGradient.addColorStop(1, "#991b1b");
    this.ctx.fillStyle = towerGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    this.ctx.fill();

    // Borde de torre
    this.ctx.strokeStyle = "#ef4444";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // 4. CIRCUITOS DE ENERGÍA (líneas que fluyen)
    const flowOffset = (time * 50) % 100; // Flujo continuo
    this.ctx.strokeStyle = "#ff1a1a";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.lineDashOffset = -flowOffset;

    // Circuito 1: desde torre a esquina derecha
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size * 0.1);
    this.ctx.quadraticCurveTo(cx + size * 0.2, cy - size * 0.3, cx + size * 0.3, cy + size * 0.45);
    this.ctx.stroke();

    // Circuito 2: desde torre a esquina izquierda
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size * 0.1);
    this.ctx.quadraticCurveTo(cx - size * 0.2, cy + size * 0.1, cx - size * 0.3, cy + size * 0.45);
    this.ctx.stroke();

    // Circuito 3: horizontal
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size * 0.3, cy);
    this.ctx.lineTo(cx + size * 0.3, cy);
    this.ctx.stroke();

    this.ctx.setLineDash([]); // Reset dash

    // 5. ESFERAS DE ESCUDO en las 4 esquinas (pulsan sincronizadas)
    const shieldPulse = 0.8 + Math.sin(time * 2) * 0.2; // Pulsación suave
    const spheres = [
      { x: cx - size * 0.35, y: cy - size * 0.15 },
      { x: cx + size * 0.35, y: cy - size * 0.15 },
      { x: cx - size * 0.3, y: cy + size * 0.45 },
      { x: cx + size * 0.3, y: cy + size * 0.45 }
    ];

    spheres.forEach(sphere => {
      const sphereGradient = this.ctx.createRadialGradient(
        sphere.x, sphere.y, 0,
        sphere.x, sphere.y, size * 0.04 * shieldPulse
      );
      sphereGradient.addColorStop(0, "#ff1a1a");
      sphereGradient.addColorStop(0.5, "#ef4444");
      sphereGradient.addColorStop(1, "rgba(239, 68, 68, 0)");

      this.ctx.fillStyle = sphereGradient;
      this.ctx.beginPath();
      this.ctx.arc(sphere.x, sphere.y, size * 0.04 * shieldPulse, 0, Math.PI * 2);
      this.ctx.fill();

      // Núcleo de esfera
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(sphere.x, sphere.y, size * 0.015, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 6. VENTANAS INTELIGENTES (tiras con luz neón)
    this.ctx.fillStyle = "#000000";
    this.ctx.strokeStyle = "#ff1a1a";
    this.ctx.lineWidth = 1;

    // Ventanas horizontales
    for (let i = 0; i < 4; i++) {
      const wy = cy - size * 0.3 + i * size * 0.15;
      this.ctx.fillRect(cx - size * 0.25, wy, size * 0.5, size * 0.04);
      this.ctx.strokeRect(cx - size * 0.25, wy, size * 0.5, size * 0.04);
    }

    // 7. PROPULSORES DE POSICIONAMIENTO (micro-pulsos)
    const thrusterPulse = Math.abs(Math.sin(time * 5)) * 0.5 + 0.5;
    const thrusters = [
      { x: cx - size * 0.4, y: cy + size * 0.3 },
      { x: cx + size * 0.4, y: cy + size * 0.3 }
    ];

    thrusters.forEach(thruster => {
      this.ctx.fillStyle = `rgba(59, 130, 246, ${thrusterPulse})`;
      this.ctx.beginPath();
      this.ctx.arc(thruster.x, thruster.y, size * 0.02, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 8. PANELES HOLOGRÁFICOS (aparecen/desaparecen)
    const holoAlpha = Math.abs(Math.sin(time * 0.8)) * 0.4 + 0.2;
    this.ctx.fillStyle = `rgba(255, 26, 26, ${holoAlpha})`;
    this.ctx.fillRect(cx - size * 0.15, cy - size * 0.4, size * 0.08, size * 0.15);
    this.ctx.fillRect(cx + size * 0.07, cy - size * 0.4, size * 0.08, size * 0.15);

    // 9. LOGO DEL CLAN (triángulo con bordes curvos)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + size * 0.05);
    this.ctx.lineTo(cx - size * 0.06, cy + size * 0.15);
    this.ctx.lineTo(cx + size * 0.06, cy + size * 0.15);
    this.ctx.closePath();
    this.ctx.fill();

    // 10. ONDAS DE ENERGÍA desde el centro (periódicas)
    const waveTime = (time * 0.5) % 2;
    if (waveTime < 1) {
      const waveRadius = size * 0.5 * waveTime;
      const waveAlpha = 1 - waveTime;
      this.ctx.strokeStyle = `rgba(239, 68, 68, ${waveAlpha * 0.5})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawGreenBase(screenPos, obstacle) {
    const cx = screenPos.x + obstacle.width / 2;
    const cy = screenPos.y + obstacle.height / 2;
    const size = obstacle.width;
    const time = Date.now() / 1000;

    this.ctx.save();

    // 1. ESTRUCTURA ORGÁNICA - Forma de hoja/célula
    this.ctx.fillStyle = "#0a1a0a";
    this.ctx.beginPath();

    // Crear forma orgánica con curvas bezier
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const variation = Math.sin(angle * 3 + time) * 0.05; // Pulsación orgánica
      const radius = size * (0.45 + variation);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        const prevAngle = ((i - 1) / segments) * Math.PI * 2;
        const prevRadius = size * (0.45 + Math.sin(prevAngle * 3 + time) * 0.05);
        const prevX = cx + Math.cos(prevAngle) * prevRadius;
        const prevY = cy + Math.sin(prevAngle) * prevRadius;

        const cpAngle = (prevAngle + angle) / 2;
        const cpRadius = size * 0.5;
        const cpX = cx + Math.cos(cpAngle) * cpRadius;
        const cpY = cy + Math.sin(cpAngle) * cpRadius;

        this.ctx.quadraticCurveTo(cpX, cpY, x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Borde verde brillante con pulso
    const borderPulse = 0.8 + Math.sin(time * 2) * 0.2;
    this.ctx.strokeStyle = `rgba(34, 197, 94, ${borderPulse})`;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 2. MEMBRANA INTERNA (capas concéntricas orgánicas)
    for (let layer = 0; layer < 3; layer++) {
      const layerSize = 0.35 - layer * 0.08;
      const layerAlpha = 0.3 - layer * 0.08;

      this.ctx.strokeStyle = `rgba(74, 222, 128, ${layerAlpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const variation = Math.sin(angle * 2 + time + layer) * 0.03;
        const radius = size * (layerSize + variation);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // 3. NÚCLEO BIO-LUMINISCENTE
    const coreGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
    coreGradient.addColorStop(0, "#a7f3d0");
    coreGradient.addColorStop(0.4, "#4ade80");
    coreGradient.addColorStop(0.7, "#22c55e");
    coreGradient.addColorStop(1, "#15803d");
    this.ctx.fillStyle = coreGradient;

    const corePulse = 0.9 + Math.sin(time * 3) * 0.1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size * 0.15 * corePulse, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. VENAS ORGÁNICAS (ramificaciones desde el centro)
    this.ctx.strokeStyle = `rgba(34, 197, 94, 0.6)`;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineDashOffset = -(time * 20) % 10;

    const veins = 6;
    for (let i = 0; i < veins; i++) {
      const angle = (i / veins) * Math.PI * 2;
      const endX = cx + Math.cos(angle) * size * 0.45;
      const endY = cy + Math.sin(angle) * size * 0.45;

      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);

      // Vena con curva
      const cpAngle = angle + Math.sin(time + i) * 0.3;
      const cpX = cx + Math.cos(cpAngle) * size * 0.25;
      const cpY = cy + Math.sin(cpAngle) * size * 0.25;

      this.ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // 5. ESPORANGI OS BIOLUMINISCENTES (puntos de luz)
    for (let i = 0; i < veins; i++) {
      const angle = (i / veins) * Math.PI * 2;
      const sporeX = cx + Math.cos(angle) * size * 0.45;
      const sporeY = cy + Math.sin(angle) * size * 0.45;
      const sporePulse = 0.6 + Math.sin(time * 5 + i) * 0.4;

      const sporeGradient = this.ctx.createRadialGradient(
        sporeX, sporeY, 0,
        sporeX, sporeY, size * 0.06 * sporePulse
      );
      sporeGradient.addColorStop(0, "#a7f3d0");
      sporeGradient.addColorStop(0.5, "#4ade80");
      sporeGradient.addColorStop(1, "rgba(74, 222, 128, 0)");

      this.ctx.fillStyle = sporeGradient;
      this.ctx.beginPath();
      this.ctx.arc(sporeX, sporeY, size * 0.06 * sporePulse, 0, Math.PI * 2);
      this.ctx.fill();

      // Núcleo del esporangio
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(sporeX, sporeY, size * 0.02, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 6. CÁPSULAS DE CULTIVO (pods orgánicos)
    const pods = [
      { x: cx - size * 0.28, y: cy - size * 0.18 },
      { x: cx + size * 0.28, y: cy - size * 0.18 },
      { x: cx - size * 0.32, y: cy + size * 0.15 },
      { x: cx + size * 0.32, y: cy + size * 0.15 }
    ];

    pods.forEach((pod, idx) => {
      const podPulse = 0.8 + Math.sin(time * 2 + idx) * 0.2;

      // Pod con forma oval
      this.ctx.fillStyle = "#052e16";
      this.ctx.beginPath();
      this.ctx.ellipse(pod.x, pod.y, size * 0.08 * podPulse, size * 0.12 * podPulse, idx * 0.3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = "#22c55e";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Luz interior del pod
      const podLight = Math.abs(Math.sin(time * 3 + idx)) * 0.6 + 0.4;
      this.ctx.fillStyle = `rgba(74, 222, 128, ${podLight})`;
      this.ctx.beginPath();
      this.ctx.ellipse(pod.x, pod.y, size * 0.05, size * 0.08, idx * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 7. TENTÁCULOS DE SENSORES (apéndices móviles)
    const tentacles = 4;
    for (let i = 0; i < tentacles; i++) {
      const baseAngle = i * (Math.PI * 2 / tentacles) + Math.PI / 4;
      const baseX = cx + Math.cos(baseAngle) * size * 0.35;
      const baseY = cy + Math.sin(baseAngle) * size * 0.35;

      const tentacleWave = Math.sin(time * 2 + i) * 0.2;
      const endAngle = baseAngle + tentacleWave;
      const endX = baseX + Math.cos(endAngle) * size * 0.15;
      const endY = baseY + Math.sin(endAngle) * size * 0.15;

      this.ctx.strokeStyle = `rgba(34, 197, 94, 0.7)`;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(baseX, baseY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Punta luminosa
      this.ctx.fillStyle = "#4ade80";
      this.ctx.beginPath();
      this.ctx.arc(endX, endY, size * 0.015, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 8. ESPORAS FLOTANTES (partículas ambientales)
    for (let i = 0; i < 8; i++) {
      const sporeAngle = (i / 8) * Math.PI * 2 + time * 0.5;
      const sporeRadius = size * 0.25 + Math.sin(time + i) * size * 0.1;
      const sporeX = cx + Math.cos(sporeAngle) * sporeRadius;
      const sporeY = cy + Math.sin(sporeAngle) * sporeRadius;
      const sporeAlpha = Math.abs(Math.sin(time * 2 + i)) * 0.5 + 0.3;

      this.ctx.fillStyle = `rgba(167, 243, 208, ${sporeAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sporeX, sporeY, size * 0.012, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 9. SÍMBOLO ORGÁNICO (espiral de ADN simplificada)
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const spiralPoints = 12;
    for (let i = 0; i < spiralPoints; i++) {
      const t = i / spiralPoints;
      const spiralAngle = t * Math.PI * 2;
      const spiralRadius = size * 0.08 * (1 - t * 0.5);
      const sx = cx + Math.cos(spiralAngle + time) * spiralRadius;
      const sy = cy + size * 0.2 - t * size * 0.15;

      if (i === 0) this.ctx.moveTo(sx, sy);
      else this.ctx.lineTo(sx, sy);
    }
    this.ctx.stroke();

    // 10. ONDA BIOLÓGICA (pulso expansivo)
    const bioWaveTime = (time * 0.8) % 2;
    if (bioWaveTime < 1) {
      const bioWaveRadius = size * 0.5 * bioWaveTime;
      const bioWaveAlpha = (1 - bioWaveTime) * 0.6;
      this.ctx.strokeStyle = `rgba(74, 222, 128, ${bioWaveAlpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, bioWaveRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawYellowBase(screenPos, obstacle) {
    const cx = screenPos.x + obstacle.width / 2;
    const cy = screenPos.y + obstacle.height / 2;
    const size = obstacle.width;
    const time = Date.now() / 1000;

    this.ctx.save();

    // 1. ESTRUCTURA PRINCIPAL - Estrella de 8 puntas (solar)
    this.ctx.fillStyle = "#1a1a0a";
    this.ctx.beginPath();

    const points = 8;
    const outerRadius = size * 0.45;
    const innerRadius = size * 0.3;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Borde dorado brillante
    const glowIntensity = 0.8 + Math.sin(time * 3) * 0.2;
    this.ctx.strokeStyle = `rgba(234, 179, 8, ${glowIntensity})`;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 2. ANILLOS DE ENERGÍA (capas concéntricas rotatorias)
    for (let ring = 0; ring < 3; ring++) {
      const ringRotation = time * (0.3 + ring * 0.1);
      const ringRadius = size * (0.25 - ring * 0.06);
      const ringAlpha = 0.4 - ring * 0.1;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(ringRotation);

      this.ctx.strokeStyle = `rgba(250, 204, 21, ${ringAlpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([8, 8]);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.setLineDash([]);
      this.ctx.restore();
    }

    // 3. NÚCLEO SOLAR (esfera de plasma)
    const coreGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.18);
    coreGradient.addColorStop(0, "#fef3c7");
    coreGradient.addColorStop(0.3, "#fde047");
    coreGradient.addColorStop(0.6, "#facc15");
    coreGradient.addColorStop(0.8, "#eab308");
    coreGradient.addColorStop(1, "#a16207");
    this.ctx.fillStyle = coreGradient;

    const corePulse = 0.85 + Math.sin(time * 4) * 0.15;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size * 0.18 * corePulse, 0, Math.PI * 2);
    this.ctx.fill();

    // Resplandor del núcleo
    this.ctx.shadowColor = "#fde047";
    this.ctx.shadowBlur = 20 * corePulse;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 4. RAYOS SOLARES (líneas radiantes)
    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const rayAngle = (i / rays) * Math.PI * 2 + time * 0.5;
      const rayLength = size * (0.35 + Math.sin(time * 3 + i) * 0.1);
      const rayAlpha = 0.5 + Math.sin(time * 2 + i) * 0.3;

      const startRadius = size * 0.18;
      const startX = cx + Math.cos(rayAngle) * startRadius;
      const startY = cy + Math.sin(rayAngle) * startRadius;
      const endX = cx + Math.cos(rayAngle) * rayLength;
      const endY = cy + Math.sin(rayAngle) * rayLength;

      const rayGradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
      rayGradient.addColorStop(0, `rgba(250, 204, 21, ${rayAlpha})`);
      rayGradient.addColorStop(1, "rgba(250, 204, 21, 0)");

      this.ctx.strokeStyle = rayGradient;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // 5. COLECTORES SOLARES (paneles en las puntas)
    for (let i = 0; i < points; i++) {
      const collectorAngle = (i * Math.PI * 2) / points - Math.PI / 2;
      const collectorX = cx + Math.cos(collectorAngle) * outerRadius;
      const collectorY = cy + Math.sin(collectorAngle) * outerRadius;
      const collectorPulse = 0.8 + Math.sin(time * 5 + i) * 0.2;

      // Panel solar
      this.ctx.save();
      this.ctx.translate(collectorX, collectorY);
      this.ctx.rotate(collectorAngle + Math.PI / 2);

      const panelGradient = this.ctx.createLinearGradient(0, -size * 0.04, 0, size * 0.04);
      panelGradient.addColorStop(0, "#713f12");
      panelGradient.addColorStop(0.5, "#fbbf24");
      panelGradient.addColorStop(1, "#713f12");
      this.ctx.fillStyle = panelGradient;
      this.ctx.fillRect(-size * 0.06, -size * 0.04, size * 0.12, size * 0.08);

      this.ctx.strokeStyle = "#eab308";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-size * 0.06, -size * 0.04, size * 0.12, size * 0.08);

      // Cristal del panel (efecto brillante)
      const crystalAlpha = Math.abs(Math.sin(time * 4 + i)) * 0.5 + 0.3;
      this.ctx.fillStyle = `rgba(254, 243, 199, ${crystalAlpha})`;
      this.ctx.fillRect(-size * 0.05, -size * 0.03, size * 0.1, size * 0.06);

      this.ctx.restore();

      // LED de estado
      this.ctx.fillStyle = `rgba(253, 224, 71, ${collectorPulse})`;
      this.ctx.beginPath();
      this.ctx.arc(collectorX, collectorY, size * 0.02, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 6. CIRCUITOS DE ENERGÍA (conexiones luminosas)
    this.ctx.strokeStyle = `rgba(250, 204, 21, 0.6)`;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineDashOffset = -(time * 30) % 10;

    for (let i = 0; i < points; i++) {
      const angle1 = (i * Math.PI * 2) / points - Math.PI / 2;
      const angle2 = ((i + 2) * Math.PI * 2) / points - Math.PI / 2;

      const x1 = cx + Math.cos(angle1) * innerRadius;
      const y1 = cy + Math.sin(angle1) * innerRadius;
      const x2 = cx + Math.cos(angle2) * innerRadius;
      const y2 = cy + Math.sin(angle2) * innerRadius;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // 7. CONDENSADORES DE ENERGÍA (esferas en órbita)
    const orbiters = 4;
    for (let i = 0; i < orbiters; i++) {
      const orbitAngle = (i / orbiters) * Math.PI * 2 + time * 1.5;
      const orbitRadius = size * 0.35;
      const orbiterX = cx + Math.cos(orbitAngle) * orbitRadius;
      const orbiterY = cy + Math.sin(orbitAngle) * orbitRadius;

      const orbiterGradient = this.ctx.createRadialGradient(
        orbiterX, orbiterY, 0,
        orbiterX, orbiterY, size * 0.04
      );
      orbiterGradient.addColorStop(0, "#fef3c7");
      orbiterGradient.addColorStop(0.5, "#fde047");
      orbiterGradient.addColorStop(1, "rgba(253, 224, 71, 0)");

      this.ctx.fillStyle = orbiterGradient;
      this.ctx.beginPath();
      this.ctx.arc(orbiterX, orbiterY, size * 0.04, 0, Math.PI * 2);
      this.ctx.fill();

      // Núcleo sólido
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(orbiterX, orbiterY, size * 0.015, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 8. CÉLULAS FOTOVOLTAICAS (rectángulos decorativos)
    const cells = [
      { x: cx - size * 0.12, y: cy - size * 0.08 },
      { x: cx + size * 0.02, y: cy - size * 0.08 },
      { x: cx - size * 0.12, y: cy + size * 0.02 },
      { x: cx + size * 0.02, y: cy + size * 0.02 }
    ];

    cells.forEach((cell, idx) => {
      const cellPulse = Math.abs(Math.sin(time * 3 + idx)) * 0.4 + 0.6;

      this.ctx.fillStyle = "#713f12";
      this.ctx.fillRect(cell.x, cell.y, size * 0.1, size * 0.06);

      this.ctx.strokeStyle = "#fbbf24";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(cell.x, cell.y, size * 0.1, size * 0.06);

      // Líneas de división
      for (let i = 1; i < 3; i++) {
        this.ctx.strokeStyle = `rgba(234, 179, 8, ${cellPulse})`;
        this.ctx.beginPath();
        this.ctx.moveTo(cell.x + (size * 0.1 * i) / 3, cell.y);
        this.ctx.lineTo(cell.x + (size * 0.1 * i) / 3, cell.y + size * 0.06);
        this.ctx.stroke();
      }
    });

    // 9. SÍMBOLO SOLAR (icono central)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold ${size * 0.08}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("☼", cx, cy + size * 0.28);

    // 10. LLAMARADAS SOLARES (ondas expansivas)
    const flareTime = (time * 0.6) % 2;
    if (flareTime < 1) {
      const flareRadius = size * 0.5 * flareTime;
      const flareAlpha = (1 - flareTime) * 0.5;
      this.ctx.strokeStyle = `rgba(250, 204, 21, ${flareAlpha})`;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, flareRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawObstacle(obstacle) {
    // No dibujar estructuras destruidas
    if (obstacle.isDestroyed) return;

    const screenPos = this.worldToScreen(obstacle.x, obstacle.y);

    if (obstacle.type === "base") {
      // Draw clan base según el clan
      if (obstacle.clan === 0) {
        // CLAN AZUL - Base Cibernética
        this.drawBlueBase(screenPos, obstacle);
      } else if (obstacle.clan === 1) {
        // CLAN ROJO - Ciudadela Escarlata
        this.drawRedBase(screenPos, obstacle);
      } else if (obstacle.clan === 2) {
        // CLAN VERDE - Colonia Bio-Orgánica
        this.drawGreenBase(screenPos, obstacle);
      } else if (obstacle.clan === 3) {
        // CLAN AMARILLO - Estación Solar
        this.drawYellowBase(screenPos, obstacle);
      } else {
        // Otras bases (por ahora mantener diseño simple)
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(
          screenPos.x,
          screenPos.y,
          obstacle.width,
          obstacle.height,
        );

        // Add base glow
        this.ctx.shadowColor = obstacle.color;
        this.ctx.shadowBlur = 15;
        this.ctx.strokeRect(
          screenPos.x,
          screenPos.y,
          obstacle.width,
          obstacle.height,
        );
        this.ctx.shadowBlur = 0;

        // Add base text
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          "BASE",
          screenPos.x + obstacle.width / 2,
          screenPos.y + obstacle.height / 2 + 5,
        );
      }

      // Draw health bar for base (después de dibujar la base)
      if (obstacle.health !== undefined && obstacle.maxHealth !== undefined) {
        this.drawHealthBar(obstacle, obstacle.x, obstacle.y, 80, 6, -15);
      }
    } else if (obstacle.type === "defense") {
      // Draw base defense
      this.ctx.fillStyle = obstacle.color;
      this.ctx.fillRect(
        screenPos.x,
        screenPos.y,
        obstacle.width,
        obstacle.height,
      );

      // Add defense glow
      this.ctx.shadowColor = obstacle.color;
      this.ctx.shadowBlur = 8;
      this.ctx.strokeRect(
        screenPos.x,
        screenPos.y,
        obstacle.width,
        obstacle.height,
      );
      this.ctx.shadowBlur = 0;
    } else {
      // Regular obstacle - meteorito o chatarra espacial
      this.ctx.save();

      if (obstacle.type === "asteroid") {
        // METEORITO - Forma irregular con textura rocosa
        const cx = screenPos.x + obstacle.width / 2;
        const cy = screenPos.y + obstacle.height / 2;
        const radius = Math.max(obstacle.width, obstacle.height) / 1.5; // Más grande para llenar mejor el área

        // Base del meteorito con gradiente
        const gradient = this.ctx.createRadialGradient(cx - radius/3, cy - radius/3, 0, cx, cy, radius);
        gradient.addColorStop(0, "#8b7355");
        gradient.addColorStop(0.6, "#654321");
        gradient.addColorStop(1, "#3d2817");
        this.ctx.fillStyle = gradient;

        // Dibujar forma irregular del meteorito
        this.ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          // Usar hash del índice del obstáculo para variación consistente
          const hash = ((obstacle.x * 73) + (obstacle.y * 137)) % 100;
          const variance = 0.7 + ((hash + i * 13) % 30) / 100;
          const r = radius * variance;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Agregar cráteres y detalles
        this.ctx.fillStyle = "#4a3319";
        const craters = 3;
        for (let i = 0; i < craters; i++) {
          const hash = ((obstacle.x + i * 51) * 91 + obstacle.y * 73) % 100;
          const craterX = cx + (hash - 50) / 100 * radius;
          const craterY = cy + ((obstacle.y + i * 37) % 100 - 50) / 100 * radius;
          const craterR = radius / 5;
          this.ctx.beginPath();
          this.ctx.arc(craterX, craterY, craterR, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Borde rocoso oscuro
        this.ctx.strokeStyle = "#2d1f11";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

      } else {
        // CHATARRA ESPACIAL - Diferentes tipos de satélites rotos
        const cx = screenPos.x + obstacle.width / 2;
        const cy = screenPos.y + obstacle.height / 2;
        // Usar un hash mejor para distribución más uniforme
        const hash = Math.floor((obstacle.x * 2654435761 + obstacle.y * 1597334677) >>> 0);
        const debrisType = Math.abs(hash) % 3; // 3 tipos de chatarra

        if (debrisType === 0) {
          // SATÉLITE CIRCULAR ROTO - Estilo plato/antena
          const radius = Math.max(obstacle.width, obstacle.height) / 1.5; // Más grande para llenar mejor el área

          // Base circular metálica
          const gradient = this.ctx.createRadialGradient(cx - radius/4, cy - radius/4, 0, cx, cy, radius);
          gradient.addColorStop(0, "#7a7a7a");
          gradient.addColorStop(0.5, "#5a5a5a");
          gradient.addColorStop(1, "#3a3a3a");
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          this.ctx.fill();

          // Anillos concéntricos del satélite
          this.ctx.strokeStyle = "#4a4a4a";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
          this.ctx.stroke();

          // Partes rotas/dañadas
          this.ctx.fillStyle = "#2a2a2a";
          const breakAngle = (hash * 0.1) % (Math.PI * 2);
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius, breakAngle, breakAngle + Math.PI / 3);
          this.ctx.lineTo(cx, cy);
          this.ctx.fill();

          // Óxido en bordes
          this.ctx.fillStyle = "#8b4513";
          for (let i = 0; i < 3; i++) {
            const angle = breakAngle + i * 0.3;
            const ox = cx + Math.cos(angle) * radius * 0.8;
            const oy = cy + Math.sin(angle) * radius * 0.8;
            this.ctx.fillRect(ox - 2, oy - 2, 4, 4);
          }

        } else if (debrisType === 1) {
          // SATÉLITE TRIANGULAR - Estilo módulo espacial
          const size = Math.max(obstacle.width, obstacle.height) * 1.3; // Más grande para llenar mejor el área

          // Base triangular
          this.ctx.fillStyle = "#5a5a5a";
          this.ctx.beginPath();
          this.ctx.moveTo(cx, cy - size/2);
          this.ctx.lineTo(cx + size/2, cy + size/2);
          this.ctx.lineTo(cx - size/2, cy + size/2);
          this.ctx.closePath();
          this.ctx.fill();

          // Paneles solares rotos
          this.ctx.fillStyle = "#1a3a5a";
          this.ctx.fillRect(cx - size/2, cy, size * 0.3, size * 0.4);
          this.ctx.fillRect(cx + size/5, cy, size * 0.3, size * 0.4);

          // Líneas de paneles solares
          this.ctx.strokeStyle = "#0a1a2a";
          this.ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(cx - size/2, cy + i * size * 0.15);
            this.ctx.lineTo(cx - size/5, cy + i * size * 0.15);
            this.ctx.stroke();
          }

          // Borde metálico
          this.ctx.strokeStyle = "#3a3a3a";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(cx, cy - size/2);
          this.ctx.lineTo(cx + size/2, cy + size/2);
          this.ctx.lineTo(cx - size/2, cy + size/2);
          this.ctx.closePath();
          this.ctx.stroke();

          // Daño en una esquina
          this.ctx.fillStyle = "#2a2a2a";
          this.ctx.beginPath();
          this.ctx.moveTo(cx + size/2, cy + size/2);
          this.ctx.lineTo(cx + size/3, cy + size/3);
          this.ctx.lineTo(cx + size/2, cy + size/3);
          this.ctx.fill();

        } else {
          // ESTRUCTURA RECTANGULAR - Estilo estación espacial rota
          // Base metálica con módulos
          this.ctx.fillStyle = "#5a5a5a";
          this.ctx.fillRect(screenPos.x, screenPos.y, obstacle.width, obstacle.height);

          // Módulo central más oscuro
          this.ctx.fillStyle = "#3a3a3a";
          this.ctx.fillRect(
            screenPos.x + obstacle.width * 0.3,
            screenPos.y + obstacle.height * 0.2,
            obstacle.width * 0.4,
            obstacle.height * 0.6
          );

          // Paneles solares a los lados
          this.ctx.fillStyle = "#1a3a5a";
          this.ctx.fillRect(screenPos.x, screenPos.y + obstacle.height * 0.3, obstacle.width * 0.25, obstacle.height * 0.15);
          this.ctx.fillRect(screenPos.x + obstacle.width * 0.75, screenPos.y + obstacle.height * 0.5, obstacle.width * 0.25, obstacle.height * 0.15);

          // Antena rota
          this.ctx.strokeStyle = "#6a6a6a";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(cx, screenPos.y);
          this.ctx.lineTo(cx + obstacle.width * 0.2, screenPos.y - obstacle.height * 0.3);
          this.ctx.stroke();

          // Detalles de ventanas/luces
          this.ctx.fillStyle = "#1a1a1a";
          const windows = 4;
          for (let i = 0; i < windows; i++) {
            const wx = screenPos.x + obstacle.width * 0.35 + i * obstacle.width * 0.1;
            const wy = screenPos.y + obstacle.height * 0.4;
            this.ctx.fillRect(wx, wy, obstacle.width * 0.05, obstacle.height * 0.1);
          }

          // Óxido y daño
          this.ctx.fillStyle = "#8b4513";
          for (let i = 0; i < 5; i++) {
            const hash2 = ((obstacle.x + i * 67) * 103 + obstacle.y * 59) % 100;
            const dx = screenPos.x + (hash2 / 100) * obstacle.width;
            const dy = screenPos.y + (((obstacle.y + i * 41) % 100) / 100) * obstacle.height;
            this.ctx.fillRect(dx, dy, 3, 3);
          }

          // Borde desgastado
          this.ctx.strokeStyle = "#2a2a2a";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(screenPos.x, screenPos.y, obstacle.width, obstacle.height);
        }
      }

      this.ctx.restore();
    }
  }

  drawMinimap() {
    // No dibujar si el minimapa está desactivado
    if (this.minimapDisabled) {
      const minimapDiv = document.getElementById("minimapContainer");
      if (minimapDiv) {
        const minimapCanvas = minimapDiv.querySelector("canvas");
        if (minimapCanvas) {
          const ctx = minimapCanvas.getContext("2d");
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
          ctx.fillStyle = "#ff0000";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("SEÑAL PERDIDA", minimapCanvas.width / 2, minimapCanvas.height / 2 - 10);
          ctx.fillText("Torre destruida", minimapCanvas.width / 2, minimapCanvas.height / 2 + 10);
        }
      }
      return;
    }

    // Usar el canvas del minimapa
    const minimapDiv = document.getElementById("minimapContainer");
    if (!minimapDiv) return;
    const minimapCanvas = minimapDiv.querySelector("canvas");
    if (!minimapCanvas) return;
    const ctx = minimapCanvas.getContext("2d");

    // Agregar event listener para click en el minimapa (solo una vez)
    if (!minimapCanvas._clickListenerAdded) {
      minimapCanvas.addEventListener("click", (e) => {
        this.showFullMap();
      });
      minimapCanvas._clickListenerAdded = true;
      minimapCanvas.style.cursor = "pointer";
    }
    ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    // Usar las dimensiones reales del canvas en lugar de valores fijos
    const w = { x: 0, y: 0, width: minimapCanvas.width, height: minimapCanvas.height };
    const titleHeight = 14; // Reducido proporcionalmente
    const minimapSize = Math.min(w.width, w.height - titleHeight); // Usar el espacio disponible
    const minimapX = w.x;
    const minimapY = w.y + titleHeight;
    const scale = minimapSize / this.worldSize;

    // Fondo y borde del widget
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(w.x, w.y, w.width, w.height);
    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.width, w.height);
    ctx.restore();

    // Título
    ctx.save();
    ctx.fillStyle = "rgba(0,255,255,0.18)";
    ctx.fillRect(w.x, w.y, w.width, titleHeight);
    ctx.font = "bold 10px Arial"; // Reducido proporcionalmente
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🗺️ Minimapa", w.x + w.width / 2, w.y + titleHeight / 2);
    ctx.restore();

    // Fondo y borde del minimapa
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.restore();

    // Draw player on minimap
    if (
      this.player &&
      this.player.x !== undefined &&
      this.player.y !== undefined
    ) {
      ctx.fillStyle = "#ff2222"; // Rojo intenso
      ctx.beginPath();
      ctx.arc(
        minimapX + this.player.x * scale + 1.5,
        minimapY + this.player.y * scale + 1.5,
        3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Draw enemies on minimap
    this.enemies.forEach((enemy) => {
      ctx.fillStyle = enemy.type === "asteroid" ? "#8b4513" : "#ff0000";
      ctx.fillRect(
        minimapX + enemy.x * scale,
        minimapY + enemy.y * scale,
        2,
        2,
      );
    });
    // Draw bots on minimap
    this.bots.forEach((bot) => {
      if (bot && bot.x !== undefined && bot.y !== undefined) {
        // Color según el clan del bot
        const botColor = this.clans[bot.clan]?.color || "#ffaa00";
        ctx.fillStyle = botColor;
        ctx.beginPath();
        ctx.arc(
          minimapX + bot.x * scale,
          minimapY + bot.y * scale,
          2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });
    // Draw obstacles on minimap
    this.obstacles.forEach((obstacle) => {
      if (obstacle.type === "base") {
        ctx.fillStyle = obstacle.color;
      } else if (obstacle.type === "defense") {
        ctx.fillStyle = obstacle.color;
      } else {
        ctx.fillStyle = "#666666";
      }
      ctx.fillRect(
        minimapX + obstacle.x * scale,
        minimapY + obstacle.y * scale,
        Math.max(1, obstacle.width * scale),
        Math.max(1, obstacle.height * scale),
      );
    });
    // Draw coins on minimap
    this.coinObjects.forEach((coin) => {
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(minimapX + coin.x * scale, minimapY + coin.y * scale, 1, 1);
    });
    // Draw planet portals on minimap
    this.planetPortals.forEach((portal) => {
      ctx.fillStyle = portal.color;
      ctx.fillRect(
        minimapX + portal.x * scale,
        minimapY + portal.y * scale,
        4,
        4,
      );
      // Draw portal icon
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        portal.icon,
        minimapX + portal.x * scale + 2,
        minimapY + portal.y * scale + 6,
      );
      // Draw difficulty number
      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 6px Arial";
      ctx.fillText(
        portal.difficulty,
        minimapX + portal.x * scale + 2,
        minimapY + portal.y * scale + 12,
      );
    });
    // Estación espacial central en el minimapa
    if (this.centralSafeZone) {
      const sprite = [
        [0, 3, 3, 0, 1, 1, 0, 3, 3, 0],
        [3, 3, 3, 1, 2, 2, 1, 3, 3, 3],
        [3, 3, 1, 2, 2, 2, 2, 1, 3, 3],
        [0, 1, 2, 2, 1, 1, 2, 2, 1, 0],
        [1, 2, 2, 1, 4, 4, 1, 2, 2, 1],
        [1, 2, 2, 1, 4, 4, 1, 2, 2, 1],
        [0, 1, 2, 2, 1, 1, 2, 2, 1, 0],
        [3, 3, 1, 2, 2, 2, 2, 1, 3, 3],
        [3, 3, 3, 1, 2, 2, 1, 3, 3, 3],
        [0, 3, 3, 0, 1, 1, 0, 3, 3, 0],
      ];
      const colors = {
        1: "#bbbbbb",
        2: "#ffffff",
        3: "#00bfff",
        4: "#ff6600",
      };
      const pixel = 18 * scale;
      const spriteWidth = sprite[0].length * pixel;
      const spriteHeight = sprite.length * pixel;
      const offsetX = minimapX + (this.worldSize / 2) * scale - spriteWidth / 2;
      const offsetY =
        minimapY + (this.worldSize / 2) * scale - spriteHeight / 2;
      for (let y = 0; y < sprite.length; y++) {
        for (let x = 0; x < sprite[0].length; x++) {
          const val = sprite[y][x];
          if (val) {
            ctx.fillStyle = colors[val];
            ctx.fillRect(
              offsetX + x * pixel,
              offsetY + y * pixel,
              pixel,
              pixel,
            );
            ctx.strokeStyle = "#888";
            ctx.strokeRect(
              offsetX + x * pixel,
              offsetY + y * pixel,
              pixel,
              pixel,
            );
          }
        }
      }
    }
  }

  showFullMap() {
    // Crear ventana modal del mapa completo
    const modal = document.createElement("div");
    modal.id = "fullMapModal";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        `;

    // Crear contenedor scrolleable del mapa
    const mapContainer = document.createElement("div");
    mapContainer.style.cssText = `
            background: #000;
            border: 3px solid #00eaff;
            border-radius: 10px;
            padding: 20px;
            position: relative;
            max-width: 95vw;
            max-height: 95vh;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            cursor: grab;
        `;

    // Crear canvas del mapa completo (más grande para mejor detalle)
    const fullMapCanvas = document.createElement("canvas");
    fullMapCanvas.width = 800;  // Más grande para ver mejor los detalles
    fullMapCanvas.height = 800;
    fullMapCanvas.style.cssText = `
            border: 2px solid #00eaff;
            display: block;
            touch-action: none;
        `;

    // Título del mapa
    const title = document.createElement("div");
    title.style.cssText = `
            color: #00eaff;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            font-family: Arial, sans-serif;
        `;
    title.textContent = "🗺️ Mapa Completo del Juego";

    // Botón de cerrar
    const closeButton = document.createElement("button");
    closeButton.textContent = "✕ Cerrar";
    closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;

    // Event listeners
    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // Funcionalidad de arrastre con touch/mouse
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    mapContainer.addEventListener("mousedown", (e) => {
      isDragging = true;
      mapContainer.style.cursor = "grabbing";
      startX = e.pageX - mapContainer.offsetLeft;
      startY = e.pageY - mapContainer.offsetTop;
      scrollLeft = mapContainer.scrollLeft;
      scrollTop = mapContainer.scrollTop;
    });

    mapContainer.addEventListener("touchstart", (e) => {
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.pageX - mapContainer.offsetLeft;
      startY = touch.pageY - mapContainer.offsetTop;
      scrollLeft = mapContainer.scrollLeft;
      scrollTop = mapContainer.scrollTop;
    });

    mapContainer.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - mapContainer.offsetLeft;
      const y = e.pageY - mapContainer.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      mapContainer.scrollLeft = scrollLeft - walkX;
      mapContainer.scrollTop = scrollTop - walkY;
    });

    mapContainer.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.pageX - mapContainer.offsetLeft;
      const y = touch.pageY - mapContainer.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      mapContainer.scrollLeft = scrollLeft - walkX;
      mapContainer.scrollTop = scrollTop - walkY;
    });

    mapContainer.addEventListener("mouseup", () => {
      isDragging = false;
      mapContainer.style.cursor = "grab";
    });

    mapContainer.addEventListener("mouseleave", () => {
      isDragging = false;
      mapContainer.style.cursor = "grab";
    });

    mapContainer.addEventListener("touchend", () => {
      isDragging = false;
    });

    // Agregar elementos al DOM
    mapContainer.appendChild(title);
    mapContainer.appendChild(closeButton);
    mapContainer.appendChild(fullMapCanvas);
    modal.appendChild(mapContainer);
    document.body.appendChild(modal);

    // Dibujar el mapa completo
    this.drawFullMap(fullMapCanvas);

    // Actualizar el mapa cada segundo
    const updateInterval = setInterval(() => {
      if (!document.getElementById("fullMapModal")) {
        clearInterval(updateInterval);
        return;
      }
      this.drawFullMap(fullMapCanvas);
    }, 1000);
  }

  drawFullMap(canvas) {
    const ctx = canvas.getContext("2d");
    const mapSize = 800; // Actualizado a 800 (tamaño del canvas)
    const scale = mapSize / this.worldSize;

    // Limpiar canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar borde del mundo
    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, mapSize, mapSize);

    // Dibujar estaciones espaciales (clanes)
    this.clans.forEach((clan, index) => {
      const x = clan.base.x * scale;
      const y = clan.base.y * scale;

      // Dibujar base
      ctx.fillStyle = clan.color;
      ctx.fillRect(x - 8, y - 8, 16, 16);

      // Dibujar nombre de la estación
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(clan.name, x, y - 15);

      // Dibujar número de jugadores en esta estación
      const playersInClan = this.players.filter((p) => p.clan === index).length;
      ctx.fillStyle = "#ffff00";
      ctx.font = "8px Arial";
      ctx.fillText(`${playersInClan} jugadores`, x, y + 20);
    });

    // Dibujar estación espacial central
    const centerX = (this.worldSize / 2) * scale;
    const centerY = (this.worldSize / 2) * scale;
    ctx.fillStyle = "#00bfff";
    ctx.fillRect(centerX - 12, centerY - 12, 24, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Estación Central", centerX, centerY - 20);

    // Dibujar portales planetarios
    this.planetPortals.forEach((portal) => {
      const x = portal.x * scale;
      const y = portal.y * scale;

      // Dibujar portal
      ctx.fillStyle = portal.color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Dibujar icono del planeta
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(portal.icon, x, y + 3);

      // Dibujar nombre y dificultad
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px Arial";
      ctx.fillText(portal.name, x, y - 12);
      ctx.fillStyle = "#ffff00";
      ctx.fillText(`Nivel ${portal.difficulty}`, x, y + 15);
    });

    // Dibujar todos los jugadores
    this.players.forEach((player) => {
      if (player && player.x !== undefined && player.y !== undefined) {
        const x = player.x * scale;
        const y = player.y * scale;

        // Color según el clan
        const clanColor = this.clans[player.clan]?.color || "#ffffff";

        // Dibujar jugador
        ctx.fillStyle = clanColor;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Borde blanco
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Indicador de elite
        if (player.isElite) {
          ctx.fillStyle = "#ff6600";
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Nombre del jugador
        ctx.fillStyle = "#ffffff";
        ctx.font = "7px Arial";
        ctx.textAlign = "center";
        let displayName = player.name;
        if (player.isElite) {
          displayName += " [ELITE]";
        }
        ctx.fillText(displayName, x, y - 8);

        // Indicador de jugador local
        if (player.id === "player") {
          ctx.fillStyle = "#ff0000";
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });

    // Dibujar todos los bots
    this.bots.forEach((bot) => {
      if (bot && bot.x !== undefined && bot.y !== undefined) {
        const x = bot.x * scale;
        const y = bot.y * scale;

        // Color según el clan
        const clanColor = this.clans[bot.clan]?.color || "#ffaa00";

        // Dibujar bot
        ctx.fillStyle = clanColor;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Borde para diferenciarlo de jugadores
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Nombre del bot (más pequeño que jugadores)
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "6px Arial";
        ctx.textAlign = "center";
        ctx.fillText(bot.name || "Bot", x, y - 7);
      }
    });

    // Dibujar leyenda
    this.drawMapLegend(ctx, mapSize);

    // Dibujar estadísticas
    this.drawMapStats(ctx, mapSize);
  }

  drawMapLegend(ctx, mapSize) {
    const legendX = mapSize + 15;
    const legendY = 20;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Leyenda:", legendX, legendY);

    const legendItems = [
      { color: "#ff0000", text: "Tu posición" },
      { color: "#00bfff", text: "Estación Central" },
      { color: "#ffff00", text: "Portales (Nivel)" },
      { color: "#ff6600", text: "Jugadores Elite" },
    ];

    legendItems.forEach((item, index) => {
      const y = legendY + 25 + index * 18;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(legendX, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      ctx.fillText(item.text, legendX + 12, y);
    });
  }

  drawMapStats(ctx, mapSize) {
    const statsX = mapSize + 15;
    const statsY = 130;

    ctx.fillStyle = "#00eaff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Estadísticas:", statsX, statsY);

    const totalPlayers = this.players.length;
    const humanPlayers = this.humanPlayers.length;
    const botPlayers = this.bots.length;
    const elitePlayers = this.players.filter((p) => p.isElite).length;

    const stats = [
      `Total jugadores: ${totalPlayers}`,
      `Jugadores humanos: ${humanPlayers}`,
      `Bots IA: ${botPlayers}`,
      `Jugadores Elite: ${elitePlayers}`,
    ];

    stats.forEach((stat, index) => {
      const y = statsY + 20 + index * 18;
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      ctx.fillText(stat, statsX, y);
    });
  }

  drawCoin(coin) {
    const screenPos = this.worldToScreen(coin.x, coin.y);

    // Draw coin with golden color and glow
    this.ctx.fillStyle = "#ffd700";
    this.ctx.shadowColor = "#ffd700";
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(screenPos.x, screenPos.y, coin.width, coin.height);
    this.ctx.shadowBlur = 0;

    // Add coin symbol
    this.ctx.fillStyle = "#b8860b";
    this.ctx.font = "8px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "$",
      screenPos.x + coin.width / 2,
      screenPos.y + coin.height / 2 + 2,
    );
  }

  drawDamageNumber(number) {
    const screenPos = this.worldToScreen(number.x, number.y);

    // Set font and color
    this.ctx.font = number.isText ? "bold 14px Arial" : "bold 16px Arial";
    this.ctx.fillStyle = number.color;
    this.ctx.textAlign = "center";

    // Add outline for better visibility
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(number.value.toString(), screenPos.x, screenPos.y);

    // Draw the number/text
    this.ctx.fillText(number.value.toString(), screenPos.x, screenPos.y);

    // Reset line width
    this.ctx.lineWidth = 1;
  }

  drawPowerUp(powerUp) {
    const screenPos = this.worldToScreen(powerUp.x, powerUp.y);
    this.ctx.fillStyle = powerUp.type === "health" ? "#00ff00" : "#ff6b35";
    this.ctx.fillRect(screenPos.x, screenPos.y, powerUp.width, powerUp.height);

    // Power-up glow
    this.ctx.shadowColor = powerUp.type === "health" ? "#00ff00" : "#ff6b35";
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(screenPos.x, screenPos.y, powerUp.width, powerUp.height);
    this.ctx.shadowBlur = 0;
  }

  drawParticle(particle) {
    const screenPos = this.worldToScreen(particle.x, particle.y);
    this.ctx.fillStyle = particle.color;
    this.ctx.globalAlpha = particle.life / 30;
    this.ctx.fillRect(screenPos.x, screenPos.y, 3, 3);
    this.ctx.globalAlpha = 1;
  }

  initializeMultiplayer() {
    // Clear existing players
    this.players = [];
    this.bots = [];
    this.humanPlayers = [];

    // Add human player
    this.players.push(this.player);
    this.humanPlayers.push(this.player);

    // Create bots to fill the remaining slots
    const botNames = [
      "Alpha",
      "Beta",
      "Gamma",
      "Delta",
      "Echo",
      "Foxtrot",
      "Golf",
      "Hotel",
      "India",
      "Juliet",
      "Kilo",
      "Lima",
      "Mike",
      "November",
      "Oscar",
      "Papa",
      "Quebec",
      "Romeo",
      "Sierra",
      "Tango",
      "Uniform",
      "Victor",
      "Whiskey",
      "Xray",
      "Yankee",
      "Zulu",
      "Ace",
      "King",
      "Queen",
      "Jack",
      "Spade",
      "Heart",
      "Diamond",
      "Club",
      "Star",
      "Moon",
      "Sun",
      "Earth",
      "Mars",
      "Jupiter",
    ];

    for (let i = 0; i < this.maxPlayers - 1; i++) {
      const bot = this.createBot(botNames[i], i);
      this.players.push(bot);
      this.bots.push(bot);

      // Debug: Log bot clan assignment
      LogManager.log(
        "info",
        `Bot ${bot.name} assigned to clan: ${this.clans[bot.clan].name} (index: ${bot.clan})`,
      );
    }
  }

  createBot(name, index) {
    // Distribute bots evenly across clans (including player's clan)
    const clanIndex = index % this.clans.length;
    const clan = this.clans[clanIndex];
    const ship = this.basicShip; // Usar la nave básica para todos los bots

    // Find spawn position in clan's safe zone
    let spawnX, spawnY;
    do {
      spawnX = clan.base.x + (Math.random() - 0.5) * 300;
      spawnY = clan.base.y + (Math.random() - 0.5) * 300;
    } while (
      spawnX < 0 ||
      spawnX > this.worldSize - 40 ||
      spawnY < 0 ||
      spawnY > this.worldSize - 40
    );

    // Determinar el tipo de bot (Jefe, Elite o Común)
    const rand = Math.random();
    let isBoss = false;
    let isElite = false;
    if (rand < 0.05) {
      // 5% de ser Jefe
      isBoss = true;
    } else if (rand < 0.75) {
      // 70% de ser Elite (del 5% al 75%)
      isElite = true;
    }
    // El 25% restante son comunes

    // Debug: Log bot spawn position
    LogManager.log(
      "info",
      `Bot ${name} (${isBoss ? "JEFE" : isElite ? "ELITE" : "NORMAL"}) spawning at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)}) for clan ${clan.name}`,
    );

    const bot = {
      x: spawnX,
      y: spawnY,
      width: isBoss ? 60 : 40, // Los jefes son más grandes
      height: isBoss ? 60 : 40,
      speed: isBoss ? ship.speed * 0.8 : isElite ? ship.speed : ship.speed / 2, // Jefes un poco más lentos pero fuertes
      health: isBoss ? ship.health * 5 : ship.health, // Jefes con 5x de vida
      maxHealth: isBoss ? ship.health * 5 : ship.health,
      damage: isBoss ? ship.damage * 2 : ship.damage, // Jefes con 2x de daño
      fireRate: isBoss ? ship.fireRate * 1.2 : ship.fireRate,
      name: name,
      shipName: ship.name,
      ability: ship.ability,
      lastShot: 0,
      clan: clanIndex,
      isHuman: false,
      angle: Math.random() * Math.PI * 2,
      id: `bot_${index}`,
      target: null,
      state: "patrol", // patrol, chase, attack
      patrolTimer: 0,
      isElite: isElite,
      isBoss: isBoss, // Nueva propiedad para jefes
      lastDamageFrom: null, // Trackear quién hizo el último daño
      // SKILLS SOLO PARA BOTS ELITE (y Jefes)
      skills:
        isElite || isBoss
          ? {
              Q: { cooldown: 0, lastUsed: 0 }, // Rapid Fire
              E: { cooldown: 0, lastUsed: 0 }, // Shield
              R: { cooldown: 0, lastUsed: 0 }, // Turbo Boost
              T: { cooldown: 0, lastUsed: 0 }, // Mega Shot
              F: { cooldown: 0, lastUsed: 0 }, // Force Field
            }
          : null,
      skillCooldowns:
        isElite || isBoss
          ? {
              Q: 8000, // 8 segundos
              E: 12000, // 12 segundos
              R: 10000, // 10 segundos
              T: 15000, // 15 segundos
              F: 20000, // 20 segundos
            }
          : null,
    };

    return bot;
  }

  initializeWorld() {
    // Create obstacles and terrain
    this.obstacles = [];
    for (let i = 0; i < 200; i++) {
      // More obstacles for larger map
      let tries = 0;
      let valid = false;
      let obs = null;
      while (!valid && tries < 20) {
        obs = {
          x: Math.random() * this.worldSize,
          y: Math.random() * this.worldSize,
          width: 50 + Math.random() * 100,
          height: 50 + Math.random() * 100,
          type: Math.random() < 0.5 ? "asteroid" : "debris",
        };
        valid = true;
        // No colisión con bases
        for (const clan of this.clans) {
          if (
            obs.x < clan.base.x + 200 &&
            obs.x + obs.width > clan.base.x &&
            obs.y < clan.base.y + 200 &&
            obs.y + obs.height > clan.base.y
          ) {
            valid = false;
            break;
          }
        }
        // No colisión con safe zones (buffer ampliado a 400px)
        for (const clan of this.clans) {
          const baseSize = clan === this.clans[1] ? 300 : 200; // Base roja es más grande
          const buffer = 400; // Buffer ampliado para evitar que bots se tranquen
          const safe = {
            x: clan.base.x - buffer,
            y: clan.base.y - buffer,
            width: baseSize + (buffer * 2),
            height: baseSize + (buffer * 2),
          };
          if (
            obs.x < safe.x + safe.width &&
            obs.x + obs.width > safe.x &&
            obs.y < safe.y + safe.height &&
            obs.y + obs.height > safe.y
          ) {
            valid = false;
            break;
          }
        }
        // No colisión con estación espacial central (circular)
        if (this.iss && this.centralSafeZone) {
          const obsCenterX = obs.x + obs.width / 2;
          const obsCenterY = obs.y + obs.height / 2;
          const distToISS = Math.sqrt(
            (obsCenterX - this.iss.x) ** 2 + (obsCenterY - this.iss.y) ** 2
          );

          if (distToISS < this.centralSafeZone.radius + 100) {
            valid = false;
          }
        }
        tries++;
      }
      if (valid) this.obstacles.push(obs);
    }

    // Create clan bases and safe zones
    this.clanSafeZones = [];
    this.clans.forEach((clan, index) => {
      // Base structure (clan 1 - rojo es más grande)
      const baseSize = index === 1 ? 300 : 200; // Base roja x1.5
      const baseHP = index === 1 ? 5000 : 3000; // Clan rojo tiene más HP
      this.obstacles.push({
        x: clan.base.x,
        y: clan.base.y,
        width: baseSize,
        height: baseSize,
        type: "base",
        clan: index,
        color: clan.color,
        maxHealth: baseHP,
        health: baseHP,
        isDestructible: true,
        respawnTime: 300000, // 5 minutos en ms
        isDestroyed: false
      });

      // Create safe zone for each clan
      this.clanSafeZones.push({
        x: clan.base.x - 100,
        y: clan.base.y - 100,
        width: 400,
        height: 400,
        clan: index,
        color: clan.color,
      });

      // Base defenses REMOVIDAS - causaban que los bots quedaran atrapados
    });

    // Crear satélites orbitales para cada clan
    this.orbitalSatellites = [];
    this.clans.forEach((clan, index) => {
      this.orbitalSatellites.push({
        clanId: index,
        name: clan.name,
        orbitRadius: 400, // Radio de órbita alrededor de la base
        orbitSpeed: 0.3 + index * 0.1, // Velocidades diferentes para cada clan
        orbitAngle: index * (Math.PI / 2), // Ángulo inicial diferente
        x: 0, // Se calculará en update
        y: 0,
        width: 80, // Tamaño para colisiones
        height: 80,
        maxHealth: 1000,
        health: 1000,
        isDestructible: true,
        respawnTime: 300000, // 5 minutos
        isDestroyed: false,
        destroyedAt: 0
      });
    });

    // Crear torres de comunicaciones orbitales para cada clan
    this.orbitalTowers = [];
    this.clans.forEach((clan, index) => {
      this.orbitalTowers.push({
        clanId: index,
        orbitRadius: 500, // Más lejos que el satélite
        orbitSpeed: 0.15 + index * 0.05, // Más lenta que el satélite
        orbitAngle: index * (Math.PI / 2) + Math.PI, // Ángulo opuesto al satélite
        x: 0, // Se calculará en update
        y: 0,
        width: 100, // Tamaño para colisiones
        height: 100,
        maxHealth: 1500,
        health: 1500,
        isDestructible: true,
        respawnTime: 300000, // 5 minutos
        isDestroyed: false,
        destroyedAt: 0
      });
    });

    // Spawn initial enemies for each clan - DISABLED
    // this.clans.forEach((clan, clanIndex) => {
    //     if (clanIndex !== this.playerClan) { // Don't spawn enemies for player's clan
    //         for (let i = 0; i < 8; i++) {
    //             this.spawnEnemyForClan(clanIndex);
    //         }
    //     }
    // });

    // Crear ISS orbital y zona segura circular
    this.iss = {
      orbitRadius: 800, // Radio de órbita alrededor de la Tierra
      orbitSpeed: 0.1, // Velocidad de rotación
      orbitAngle: 0, // Ángulo inicial
      x: 0, // Se calculará en update
      y: 0,
      size: 200 // Tamaño de la estación
    };

    // Zona segura circular que orbita con la ISS
    this.centralSafeZone = {
      x: 0, // Se calculará dinámicamente
      y: 0,
      radius: 350, // Radio del círculo de zona segura
      width: 700, // Para compatibilidad con código existente
      height: 700
    };

    // Send initial world data to the worker now that it's ready
    if (this.useWebWorkers && this.botWorker) {
      console.log("Enviando datos del mundo al worker.");
      this.botWorker.postMessage({
        type: "init",
        data: {
          worldData: {
            worldSize: this.worldSize,
            clans: this.clans,
            clanSafeZones: this.clanSafeZones,
            centralSafeZone: this.centralSafeZone,
            obstacles: this.obstacles,
            players: this.players,
          },
          performanceSettings: this.performanceSettings,
        },
      });
    }
  }

  spawnEnemyForClan(clanIndex) {
    if (this.enemies.length >= this.maxEnemies) return;

    const clan = this.clans[clanIndex];
    let x, y;

    // Spawn near clan base, but not in other clans' safe zones
    do {
      x = clan.base.x + (Math.random() - 0.5) * 400;
      y = clan.base.y + (Math.random() - 0.5) * 400;
    } while (
      x < 0 ||
      x > this.worldSize ||
      y < 0 ||
      y > this.worldSize ||
      this.isInAnySafeZone(x, y, clanIndex)
    );

    const enemy = {
      x: x,
      y: y,
      width: 30 + Math.random() * 20,
      height: 30 + Math.random() * 20,
      speed: 1 + Math.random() * 2,
      health: 50,
      maxHealth: 50,
      damage: 2,
      type: "enemy",
      lastShot: 0,
      fireRate: 1 + Math.random() * 2,
      detectionRange: 150 + Math.random() * 100,
      state: "patrol",
      clan: clanIndex,
      color: clan.color,
    };
    this.enemies.push(enemy);
  }

  spawnEnemyAtRandomLocation() {
    if (this.enemies.length >= this.maxEnemies) return;

    let x, y;
    do {
      x = Math.random() * this.worldSize;
      y = Math.random() * this.worldSize;
    } while (
      this.getDistance(x, y, this.player.x, this.player.y) < 200 ||
      this.isInAnySafeZone(x, y)
    );

    const enemy = {
      x: x,
      y: y,
      width: 30 + Math.random() * 20,
      height: 30 + Math.random() * 20,
      speed: 1 + Math.random() * 2,
      health: 50,
      maxHealth: 50,
      damage: 2,
      type: Math.random() < 0.3 ? "asteroid" : "enemy",
      lastShot: 0,
      fireRate: 1 + Math.random() * 2,
      detectionRange: 150 + Math.random() * 100,
      state: "patrol", // patrol, chase, attack
    };
    this.enemies.push(enemy);
  }

  getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  isInAnySafeZone(x, y, excludeClan = null) {
    return this.clanSafeZones.some((safeZone) => {
      // Skip checking the clan's own safe zone
      if (excludeClan !== null && safeZone.clan === excludeClan) {
        return false;
      }

      return (
        x >= safeZone.x &&
        x <= safeZone.x + safeZone.width &&
        y >= safeZone.y &&
        y <= safeZone.y + safeZone.height
      );
    });
  }

  isPlayerInSafeZone(player) {
    // Zona neutral central (circular)
    if (this.iss && this.centralSafeZone) {
      const dx = player.x - this.iss.x;
      const dy = player.y - this.iss.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.centralSafeZone.radius) {
        return true;
      }
    }
    // Zonas de clan
    const playerSafeZone = this.clanSafeZones.find(
      (zone) => zone.clan === player.clan,
    );
    if (!playerSafeZone) return false;
    return (
      player.x >= playerSafeZone.x &&
      player.x <= playerSafeZone.x + playerSafeZone.width &&
      player.y >= playerSafeZone.y &&
      player.y <= playerSafeZone.y + playerSafeZone.height
    );
  }

  startBaseAssault(bot) {
    // Bot has reached enemy base, start assault tactics
    bot.state = "assault";
    bot.assaultTimer = 0;
    bot.assaultTarget = null;

    // Add assault particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: bot.x + bot.width / 2,
        y: bot.y + bot.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 25,
        color: "#ff0000",
      });
    }
  }

  updateCamera() {
    // Validate player coordinates before updating camera
    if (!this.player || !isFinite(this.player.x) || !isFinite(this.player.y)) {
      LogManager.log(
        "warn",
        "Invalid player coordinates in updateCamera:",
        this.player,
      );
      return;
    }

    // Calculate camera position
    // Ajuste: -200 mueve la cámara a la izquierda, haciendo que la nave se vea más a la derecha/centro
    let newCameraX = this.player.x - this.canvas.width / 2 - 200;
    let newCameraY = this.player.y - this.canvas.height / 2;

    // Validate camera coordinates
    if (!isFinite(newCameraX) || !isFinite(newCameraY)) {
      LogManager.log("warn", "Invalid camera coordinates calculated:", {
        newCameraX,
        newCameraY,
        playerX: this.player.x,
        playerY: this.player.y,
      });
      return;
    }

    this.camera.x = newCameraX;
    this.camera.y = newCameraY;

    // Keep camera within world bounds
    this.camera.x = Math.max(
      0,
      Math.min(this.camera.x, this.worldSize - this.canvas.width),
    );
    this.camera.y = Math.max(
      0,
      Math.min(this.camera.y, this.worldSize - this.canvas.height),
    );

    // Debug: Log camera position (cada 5 segundos)
    const now = Date.now();
    if (!this.lastCameraLog || now - this.lastCameraLog > 5000) {
      LogManager.log(
        "info",
        `Camera at (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)}) following player at (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`,
      );
      this.lastCameraLog = now;
    }

    // Final validation
    if (!isFinite(this.camera.x) || !isFinite(this.camera.y)) {
      LogManager.log(
        "error",
        "Camera coordinates became invalid after bounds check:",
        this.camera,
      );
      this.camera.x = 0;
      this.camera.y = 0;
    }
  }

  worldToScreen(worldX, worldY) {
    // Validate input coordinates
    if (
      !isFinite(worldX) ||
      !isFinite(worldY) ||
      !isFinite(this.camera.x) ||
      !isFinite(this.camera.y)
    ) {
      LogManager.log("warn", "Invalid coordinates in worldToScreen:", {
        worldX,
        worldY,
        cameraX: this.camera.x,
        cameraY: this.camera.y,
      });
      return { x: 0, y: 0 };
    }

    const screenX = worldX - this.camera.x;
    const screenY = worldY - this.camera.y;

    // Solo log cada 5 segundos para evitar spam
    const now = Date.now();
    if (!this.lastWorldToScreenLog || now - this.lastWorldToScreenLog > 5000) {
      LogManager.log(
        "info",
        `World (${worldX.toFixed(0)}, ${worldY.toFixed(0)}) -> Screen (${screenX.toFixed(0)}, ${screenY.toFixed(0)}) [Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)})]`,
      );
      this.lastWorldToScreenLog = now;
    }

    return { x: screenX, y: screenY };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.camera.x,
      y: screenY + this.camera.y,
    };
  }

  update() {
    // No actualizar si el jugador está dockeado en la ISS
    if (this.dockedAtISS) return;

    if (this.gameState === "playing" && this.player) {
      // Log cada 5 segundos para evitar spam
      const now = Date.now();
      if (!this.lastUpdateLog || now - this.lastUpdateLog > 5000) {
        LogManager.log(
          "info",
          `Updating game - Player at (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`,
        );
        this.lastUpdateLog = now;
      }

      this.updatePlayer();
      this.updateBots();
      this.updateCamera();
      this.spawnEnemies();
      // this.updateEnemies(); // Disabled - only bots with advanced AI remain
      this.updateBullets();
      this.updateEnemyBullets();
      this.updateCoins();
      this.updateDamageNumbers();
      this.updatePowerUps();
      this.updateParticles();
      this.updateSatellites(); // Add satellite updates
      this.updateSkillCooldowns();
      this.updateUI();
      // Guardar si el jugador está en el safe zone central (circular)
      let inCentralSafeZone = false;
      if (this.iss && this.centralSafeZone) {
        const pdx = this.player.x - this.iss.x;
        const pdy = this.player.y - this.iss.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist <= this.centralSafeZone.radius) {
          inCentralSafeZone = true;
        }
      }
      localStorage.setItem(
        "inCentralSafeZone",
        inCentralSafeZone ? "true" : "false",
      );

      // The mouse clicked state is now handled by mousedown/mouseup events    } else {
      LogManager.log(
        "warn",
        `Update skipped - GameState: ${this.gameState}, Player: ${!!this.player}`,
      );
    }
  }

  updateSkillCooldowns() {
    // Actualizar cooldowns de habilidades
    Object.keys(this.skills).forEach((key) => {
      if (this.skills[key].cooldown > 0) {
        this.skills[key].cooldown -= 16; // ~60 FPS
      }
    });
    // NO renderizar widget de skills en móvil (usamos botones táctiles)
    // this.renderSkillsWidget();
  }

  render() {
    // Clear canvas and draw background BEFORE transformations
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars background BEFORE transformations (optimizado según configuración)
    // Las estrellas usan worldToScreen() que ya calcula las coordenadas de pantalla correctas
    this.drawStars();

    this.ctx.save();
    this.ctx.translate(this.renderOffsetX, this.renderOffsetY);
    this.ctx.scale(this.scale, this.scale);

    // The original render content starts here, now scaled
    // Log cada 5 segundos para evitar spam
    const now = Date.now();
    if (!this.lastRenderLog || now - this.lastRenderLog > 5000) {
        // LogManager.log('info', `=== RENDER CALLED === GameState: ${this.gameState}, Player: ${!!this.player}`);
        this.lastRenderLog = now;
    }

    // Debug: Log render state
    // LogManager.log('info', `Rendering - GameState: ${this.gameState}, Player: ${this.player ? 'exists' : 'null'}, Players: ${this.players ? this.players.length : 0}`);


    if (this.gameState === 'playing' && this.player) {
        // LogManager.log('info', '=== DRAWING GAME ELEMENTS ===');

        // Draw Earth in the background
        this.drawEarth();

                    // Draw satellites (solo si está habilitado)
        if (this.performanceSettings.enableSatellites) {
            this.satellites.forEach(satellite => this.drawSatellite(satellite));
        }

        // Dibujar satélites orbitales de clanes (siempre visibles)
        if (this.orbitalSatellites) {
            this.orbitalSatellites.forEach(satellite => this.drawSatellite(satellite));
        }

        // Draw planet portals
        this.drawPlanetPortals();

        // Debug: dibujar portal de prueba
        // this.drawDebugPortals();

        // Draw space stations (clan bases)
        this.drawSpaceStations();

        // Draw safe zone
        this.drawSafeZone();

        // Draw obstacles
        this.obstacles.forEach(obstacle => this.drawObstacle(obstacle));

        // Draw enemies - DISABLED
        // this.enemies.forEach(enemy => this.drawEnemy(enemy));

        // Draw bullets
        this.bullets.forEach(bullet => this.drawBullet(bullet));
        this.enemyBullets.forEach(bullet => this.drawEnemyBullet(bullet));

        // Draw power-ups
        this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));

        // Draw coins
        this.coinObjects.forEach(coin => this.drawCoin(coin));

        // Draw particles (solo si está habilitado)
        if (this.performanceSettings.enableParticles) {
        this.particles.forEach(particle => this.drawParticle(particle));
        }

        // Draw damage numbers (solo si está habilitado)
        if (this.performanceSettings.enableDamageNumbers) {
        this.damageNumbers.forEach(number => this.drawDamageNumber(number));
        }

        // Draw all players (bots)
        // LogManager.log('info', `Drawing ${this.players.length} players/bots`);
        this.players.forEach((player, index) => {
            if (player.health > 0 && !player.isHuman) { // Only draw bots, not the player
                const screenPos = this.worldToScreen(player.x, player.y);
                const clanColor = this.clans[player.clan].color;
                const isAlly = player.clan === this.playerClan;

                this.drawTriangularShip(player, clanColor, 'unused');

                // Draw health bar for bot
                this.drawHealthBar(player, player.x, player.y, 40, 4, -25);

                // Draw ally indicator
                if (isAlly) {
                    this.drawAllyIndicator(player);
                }

                // Draw bot name and title
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                let displayName = player.name;

                if (player.isBoss) {
                    displayName += ' [JEFE]';
                    this.ctx.fillStyle = '#ff00ff'; // Magenta for Boss
                } else if (player.isElite) {
                    displayName += ' [ELITE]';
                    this.ctx.fillStyle = '#FF6B35'; // Orange for Elite
                }
                this.ctx.fillText(displayName, screenPos.x + player.width / 2, screenPos.y - 35); // Movido más arriba
            }
        });

        // Draw player separately - ensure it's always drawn (except when docked)
        if (this.player && this.player.health > 0 && !this.dockedAtISS) {
            // LogManager.log('info', '=== DRAWING PLAYER ===');
            this.drawPlayer();
        } else if (this.dockedAtISS) {
            // LogManager.log('info', 'Player docked at ISS - not rendering');
        } else {
            // LogManager.log('warn', `Player not drawn - exists: ${!!this.player}, health: ${this.player?.health}`);
        }

        // Draw minimap (solo si está habilitado)
        if (this.performanceSettings.enableMinimap) {
        this.drawMinimap();
        }

        // Zona segura neutral
        this.drawCentralSafeZone();

        // Dibuja una estación espacial simple estilo pixel art en el centro
        this.drawCentralStation();
    }

    // Draw damage numbers
    this.damageNumbers.forEach(number => this.drawDamageNumber(number));

    this.ctx.restore();
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Actualizar métricas de rendimiento
    PerformanceOptimizer.updatePerformanceMetrics(deltaTime);

    // Obtener configuración actual de rendimiento
    this.performanceSettings = PerformanceOptimizer.getCurrentSettings();

    // Solo actualizar si ha pasado el tiempo suficiente según la configuración
    if (deltaTime >= this.performanceSettings.updateInterval) {
      this.update();
      this.checkStructureRespawns(); // Verificar respawns de estructuras
      this.lastFrameTime = currentTime;
    }

    // Renderizar siempre para mantener FPS consistente
    this.render();

    // Log cada 5 segundos para evitar spam
    const now = Date.now();
    if (!this.lastGameLoopLog || now - this.lastGameLoopLog > 5000) {
      LogManager.log(
        "info",
        `=== GAME LOOP RUNNING === GameState: ${this.gameState}, FPS: ${PerformanceOptimizer.deviceCapabilities.fps}, Mode: ${PerformanceOptimizer.deviceCapabilities.performanceMode}`,
      );
      this.lastGameLoopLog = now;
    }

    requestAnimationFrame(() => this.gameLoop());
    // NO renderizar widget de skills en móvil (usamos botones táctiles)
    // this.renderSkillsWidget();
  }

  drawCentralSafeZone() {
    if (!this.iss) return;

    const screenPos = this.worldToScreen(this.iss.x, this.iss.y);
    const radius = this.centralSafeZone.radius;

    this.ctx.save();

    // Círculo de zona segura con líneas punteadas
    this.ctx.strokeStyle = "#00ffff";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([15, 10]);
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Relleno semi-transparente
    this.ctx.globalAlpha = 0.08;
    this.ctx.fillStyle = "#00ffff";
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    this.ctx.restore();
  }

  drawCentralStation() {
    if (!this.iss) return;

    const screenPos = this.worldToScreen(this.iss.x, this.iss.y);
    const time = Date.now() / 1000;

    this.ctx.save();

    // DISEÑO MEJORADO DE LA ISS
    const solarPanelWidth = 100;
    const solarPanelHeight = 180;

    // 1. PANELES SOLARES IZQUIERDOS (arriba y abajo)
    const leftPanels = [
      { y: -70 },
      { y: 70 }
    ];

    leftPanels.forEach((panel, idx) => {
      this.ctx.save();
      this.ctx.translate(screenPos.x - 180, screenPos.y + panel.y);

      // Panel solar con gradiente azul
      const solarGradient = this.ctx.createLinearGradient(
        -solarPanelWidth / 2, -solarPanelHeight / 2,
        solarPanelWidth / 2, solarPanelHeight / 2
      );
      solarGradient.addColorStop(0, "#001a4d");
      solarGradient.addColorStop(0.5, "#003d99");
      solarGradient.addColorStop(1, "#001a4d");
      this.ctx.fillStyle = solarGradient;
      this.ctx.fillRect(
        -solarPanelWidth / 2,
        -solarPanelHeight / 2,
        solarPanelWidth,
        solarPanelHeight
      );

      // Grid de celdas solares
      this.ctx.strokeStyle = "#000d26";
      this.ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const cellY = -solarPanelHeight / 2 + (solarPanelHeight / 6) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(-solarPanelWidth / 2, cellY);
        this.ctx.lineTo(solarPanelWidth / 2, cellY);
        this.ctx.stroke();
      }
      for (let i = 0; i <= 3; i++) {
        const cellX = -solarPanelWidth / 2 + (solarPanelWidth / 3) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(cellX, -solarPanelHeight / 2);
        this.ctx.lineTo(cellX, solarPanelHeight / 2);
        this.ctx.stroke();
      }

      // Borde del panel
      this.ctx.strokeStyle = "#4d4d4d";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        -solarPanelWidth / 2,
        -solarPanelHeight / 2,
        solarPanelWidth,
        solarPanelHeight
      );

      this.ctx.restore();

      // Brazo de soporte horizontal
      this.ctx.strokeStyle = "#909090";
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x - 180, screenPos.y + panel.y);
      this.ctx.lineTo(screenPos.x - 80, screenPos.y + panel.y);
      this.ctx.stroke();
    });

    // 2. PANELES SOLARES DERECHOS (arriba y abajo)
    const rightPanels = [
      { y: -70 },
      { y: 70 }
    ];

    rightPanels.forEach((panel, idx) => {
      this.ctx.save();
      this.ctx.translate(screenPos.x + 180, screenPos.y + panel.y);

      // Panel solar
      const solarGradient = this.ctx.createLinearGradient(
        -solarPanelWidth / 2, -solarPanelHeight / 2,
        solarPanelWidth / 2, solarPanelHeight / 2
      );
      solarGradient.addColorStop(0, "#001a4d");
      solarGradient.addColorStop(0.5, "#003d99");
      solarGradient.addColorStop(1, "#001a4d");
      this.ctx.fillStyle = solarGradient;
      this.ctx.fillRect(
        -solarPanelWidth / 2,
        -solarPanelHeight / 2,
        solarPanelWidth,
        solarPanelHeight
      );

      // Grid de celdas
      this.ctx.strokeStyle = "#000d26";
      this.ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const cellY = -solarPanelHeight / 2 + (solarPanelHeight / 6) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(-solarPanelWidth / 2, cellY);
        this.ctx.lineTo(solarPanelWidth / 2, cellY);
        this.ctx.stroke();
      }
      for (let i = 0; i <= 3; i++) {
        const cellX = -solarPanelWidth / 2 + (solarPanelWidth / 3) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(cellX, -solarPanelHeight / 2);
        this.ctx.lineTo(cellX, solarPanelHeight / 2);
        this.ctx.stroke();
      }

      // Borde
      this.ctx.strokeStyle = "#4d4d4d";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        -solarPanelWidth / 2,
        -solarPanelHeight / 2,
        solarPanelWidth,
        solarPanelHeight
      );

      this.ctx.restore();

      // Brazo de soporte horizontal
      this.ctx.strokeStyle = "#909090";
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x + 80, screenPos.y + panel.y);
      this.ctx.lineTo(screenPos.x + 180, screenPos.y + panel.y);
      this.ctx.stroke();
    });

    // 3. VIGA CENTRAL (columna vertebral de la ISS)
    this.ctx.fillStyle = "#707070";
    this.ctx.fillRect(screenPos.x - 80, screenPos.y - 8, 160, 16);
    this.ctx.strokeStyle = "#505050";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(screenPos.x - 80, screenPos.y - 8, 160, 16);

    // Detalles de la viga
    for (let i = 0; i < 5; i++) {
      const segmentX = screenPos.x - 70 + i * 35;
      this.ctx.strokeStyle = "#606060";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(segmentX, screenPos.y - 8);
      this.ctx.lineTo(segmentX, screenPos.y + 8);
      this.ctx.stroke();
    }

    // 4. MÓDULOS HABITABLES (conectados a la viga)
    const modules = [
      { x: -130, y: 0, width: 50, height: 32, label: "Nauka" },
      { x: -50, y: 0, width: 70, height: 38, label: "Zarya" },
      { x: 20, y: 0, width: 60, height: 35, label: "Unity" },
      { x: 75, y: 0, width: 50, height: 30, label: "Destiny" }
    ];

    modules.forEach((mod, idx) => {
      const mx = screenPos.x + mod.x;
      const my = screenPos.y + mod.y;

      // Gradiente metálico
      const modGradient = this.ctx.createLinearGradient(
        mx, my - mod.height / 2,
        mx, my + mod.height / 2
      );
      modGradient.addColorStop(0, "#999999");
      modGradient.addColorStop(0.5, "#dddddd");
      modGradient.addColorStop(1, "#999999");
      this.ctx.fillStyle = modGradient;
      this.ctx.fillRect(mx, my - mod.height / 2, mod.width, mod.height);

      // Bordes
      this.ctx.strokeStyle = "#555555";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(mx, my - mod.height / 2, mod.width, mod.height);

      // Conectores entre módulos
      if (idx > 0) {
        const prevMod = modules[idx - 1];
        this.ctx.strokeStyle = "#707070";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(screenPos.x + prevMod.x + prevMod.width, screenPos.y + prevMod.y);
        this.ctx.lineTo(mx, my);
        this.ctx.stroke();
      }

      // Ventanas
      const windowCount = Math.floor(mod.width / 18);
      for (let i = 0; i < windowCount; i++) {
        const wx = mx + (mod.width / (windowCount + 1)) * (i + 1);
        const wy = my;
        const windowBlink = Math.abs(Math.sin(time * 2 + idx + i)) * 0.3 + 0.7;

        this.ctx.fillStyle = `rgba(255, 255, 150, ${windowBlink})`;
        this.ctx.fillRect(wx - 3, wy - 5, 6, 10);

        this.ctx.strokeStyle = "#707070";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(wx - 3, wy - 5, 6, 10);
      }
    });

    // 5. ANTENA PARABÓLICA en el módulo central
    const dishX = screenPos.x + 20;
    const dishY = screenPos.y - 45;

    this.ctx.save();
    this.ctx.translate(dishX, dishY);
    this.ctx.rotate(time * 0.3);

    const dishGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    dishGradient.addColorStop(0, "#d0d0d0");
    dishGradient.addColorStop(1, "#808080");
    this.ctx.fillStyle = dishGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 25, 15, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = "#555555";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // Soporte de antena
    this.ctx.strokeStyle = "#808080";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(dishX, dishY);
    this.ctx.lineTo(dishX, screenPos.y - 18);
    this.ctx.stroke();

    // 6. LUCES DE NAVEGACIÓN
    const navLights = [
      { x: screenPos.x - 80, y: screenPos.y, color: "#ff0000" },
      { x: screenPos.x + 80, y: screenPos.y, color: "#00ff00" },
      { x: screenPos.x, y: screenPos.y - 20, color: "#ffffff" }
    ];

    navLights.forEach((light, idx) => {
      const blinkPhase = (time * 2 + idx) % 1;
      if (blinkPhase > 0.5) {
        this.ctx.fillStyle = light.color;
        this.ctx.beginPath();
        this.ctx.arc(light.x, light.y, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowColor = light.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });

    // 7. PUERTO DE ATRAQUE (docking port)
    this.ctx.fillStyle = "#606060";
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y + 25, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#404040";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Indicador de puerto
    const portBlink = Math.abs(Math.sin(time * 3)) * 0.5 + 0.5;
    this.ctx.fillStyle = `rgba(0, 255, 255, ${portBlink})`;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y + 25, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 8. TEXTO ISSIV
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("ISSIV", screenPos.x, screenPos.y + 100);
    this.ctx.font = "10px Arial";
    this.ctx.fillText("Zona Neutral - Market", screenPos.x, screenPos.y + 115);

    this.ctx.restore();
  }

  // New functions for Earth orbit PvP map
  drawEarth() {
    if (!this.earthImage.complete || this.earthImage.naturalWidth === 0) return; // Esperar a que cargue correctamente
    const screenPos = this.worldToScreen(this.earth.x, this.earth.y);
    const earthDisplayRadius = this.earth.radius;
    const size = earthDisplayRadius * 2;

    this.ctx.save();
    // Crear un path circular para recortar
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, earthDisplayRadius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.clip();

    this.ctx.globalAlpha = 0.95;
    this.ctx.drawImage(
      this.earthImage,
      screenPos.x - earthDisplayRadius,
      screenPos.y - earthDisplayRadius,
      size,
      size,
    );
    this.ctx.restore();
  }

  drawSpaceStations() {
    // Dibujar torres de comunicaciones orbitales
    if (this.orbitalTowers) {
      this.orbitalTowers.forEach(tower => {
        // No dibujar si está destruida
        if (tower.isDestroyed) return;

        const screenPos = this.worldToScreen(tower.x, tower.y);
        const clan = this.clans[tower.clanId];

        // Diseños mejorados según el clan
        if (tower.clanId === 0) {
          // TORRE AZUL - Antena de datos cibernética
          this.drawBlueTower(screenPos);
        } else if (tower.clanId === 1) {
          // TORRE ROJA - Torre de comunicaciones orbital
          this.drawRedTower(screenPos);
        } else if (tower.clanId === 2) {
          // TORRE VERDE - Estación bio-orgánica
          this.drawGreenTower(screenPos);
        } else if (tower.clanId === 3) {
          // TORRE AMARILLA - Colector solar
          this.drawYellowTower(screenPos);
        }

        // Draw station name para todas
        this.ctx.fillStyle = clan.color;
        this.ctx.font = "bold 14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(clan.name, screenPos.x, screenPos.y + 80);
        this.ctx.font = "10px Arial";
        this.ctx.fillText(clan.faction, screenPos.x, screenPos.y + 95);

        // Draw health bar for tower
        if (tower.health !== undefined && tower.maxHealth !== undefined) {
          this.drawHealthBar(tower, tower.x, tower.y, 70, 6, -70);
        }
      });
    }
  }

  drawBlueTower(screenPos) {
    const time = Date.now() / 1000;
    const size = 100;

    this.ctx.save();

    // Base hexagonal cibernética
    this.ctx.fillStyle = "#0a0a1a";
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = screenPos.x + Math.cos(angle) * size * 0.3;
      const y = screenPos.y + Math.sin(angle) * size * 0.3;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = "#3b82f6";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Antena principal de datos
    this.ctx.strokeStyle = "#60a5fa";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y);
    this.ctx.lineTo(screenPos.x, screenPos.y - size * 0.6);
    this.ctx.stroke();

    // Plato receptor en la punta
    const dishRotation = time * 0.8;
    this.ctx.save();
    this.ctx.translate(screenPos.x, screenPos.y - size * 0.6);
    this.ctx.rotate(dishRotation);

    const dishGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.2);
    dishGradient.addColorStop(0, "#93c5fd");
    dishGradient.addColorStop(0.6, "#3b82f6");
    dishGradient.addColorStop(1, "#1e40af");
    this.ctx.fillStyle = dishGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.2, size * 0.12, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#60a5fa";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // Pulsos de datos (ondas)
    for (let i = 0; i < 3; i++) {
      const wavePulse = ((time * 2 + i * 0.6) % 2);
      if (wavePulse < 1) {
        const alpha = 1 - wavePulse;
        const radius = size * 0.15 + wavePulse * size * 0.25;
        this.ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y - size * 0.6, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    // Nodos de transmisión en el perímetro
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const nodeX = screenPos.x + Math.cos(angle) * size * 0.3;
      const nodeY = screenPos.y + Math.sin(angle) * size * 0.3;
      const nodeBlink = Math.abs(Math.sin(time * 4 + i)) * 0.5 + 0.5;

      this.ctx.fillStyle = `rgba(96, 165, 250, ${nodeBlink})`;
      this.ctx.beginPath();
      this.ctx.arc(nodeX, nodeY, size * 0.025, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawRedTower(screenPos) {
    const time = Date.now() / 1000;
    const size = 100; // Más pequeña que la base principal

    this.ctx.save();

    // ESTRUCTURA SECUNDARIA - Torre de comunicaciones
    // Base octogonal
    this.ctx.fillStyle = "#1a0a0a";
    this.ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = screenPos.x + Math.cos(angle) * size * 0.4;
      const y = screenPos.y + Math.sin(angle) * size * 0.4;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Borde rojo
    this.ctx.strokeStyle = "#dc2626";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Torre central que pulsa
    const pulse = 0.9 + Math.sin(time * 3) * 0.1;
    const towerGradient = this.ctx.createRadialGradient(
      screenPos.x, screenPos.y - size * 0.05, 0,
      screenPos.x, screenPos.y, size * 0.25 * pulse
    );
    towerGradient.addColorStop(0, "#ff4444");
    towerGradient.addColorStop(0.5, "#dc2626");
    towerGradient.addColorStop(1, "#7f1d1d");
    this.ctx.fillStyle = towerGradient;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, size * 0.25 * pulse, 0, Math.PI * 2);
    this.ctx.fill();

    // Anillos de comunicación
    for (let i = 0; i < 3; i++) {
      const ringPulse = ((time * 2 + i * 0.5) % 2);
      if (ringPulse < 1) {
        const alpha = 1 - ringPulse;
        const radius = size * 0.25 + ringPulse * size * 0.3;
        this.ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.6})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    // Antenas en las esquinas
    const antennaPositions = [
      { angle: 0 },
      { angle: Math.PI / 2 },
      { angle: Math.PI },
      { angle: Math.PI * 1.5 }
    ];

    antennaPositions.forEach((pos, idx) => {
      const x = screenPos.x + Math.cos(pos.angle) * size * 0.4;
      const y = screenPos.y + Math.sin(pos.angle) * size * 0.4;

      // Base de antena
      this.ctx.fillStyle = "#991b1b";
      this.ctx.fillRect(x - 4, y - 4, 8, 8);

      // Línea de antena
      this.ctx.strokeStyle = "#dc2626";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      const endX = x + Math.cos(pos.angle) * size * 0.2;
      const endY = y + Math.sin(pos.angle) * size * 0.2;
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Luz parpadeante en la punta
      const blinkPhase = (time * 4 + idx * 0.5) % 1;
      if (blinkPhase > 0.5) {
        this.ctx.fillStyle = "#ff1a1a";
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Paneles laterales
    this.ctx.fillStyle = "#2a0a0a";
    this.ctx.fillRect(screenPos.x - size * 0.5, screenPos.y - size * 0.1, size * 0.15, size * 0.2);
    this.ctx.fillRect(screenPos.x + size * 0.35, screenPos.y - size * 0.1, size * 0.15, size * 0.2);

    // Detalles en paneles
    this.ctx.strokeStyle = "#dc2626";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(screenPos.x - size * 0.5, screenPos.y - size * 0.1, size * 0.15, size * 0.2);
    this.ctx.strokeRect(screenPos.x + size * 0.35, screenPos.y - size * 0.1, size * 0.15, size * 0.2);

    // Ventanas con luz
    for (let i = 0; i < 3; i++) {
      const wx = screenPos.x - size * 0.45;
      const wy = screenPos.y - size * 0.05 + i * size * 0.06;
      this.ctx.fillStyle = "#ff1a1a";
      this.ctx.fillRect(wx, wy, size * 0.08, size * 0.03);
    }

    // Circuitos de energía
    this.ctx.strokeStyle = "#ff1a1a";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineDashOffset = -(time * 30) % 10;

    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y);
    this.ctx.lineTo(screenPos.x - size * 0.4, screenPos.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y);
    this.ctx.lineTo(screenPos.x + size * 0.4, screenPos.y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);

    this.ctx.restore();
  }

  drawGreenTower(screenPos) {
    const time = Date.now() / 1000;
    const size = 100;

    this.ctx.save();

    // Base orgánica con forma de flor
    this.ctx.fillStyle = "#0a1a0a";
    this.ctx.beginPath();

    const petals = 6;
    for (let i = 0; i <= petals * 2; i++) {
      const angle = (i / (petals * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? size * 0.35 : size * 0.25;
      const variation = Math.sin(time * 2 + i) * 0.05;
      const r = radius * (1 + variation);
      const x = screenPos.x + Math.cos(angle) * r;
      const y = screenPos.y + Math.sin(angle) * r;

      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = "#22c55e";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Tallo central bio-luminiscente
    const stemGradient = this.ctx.createLinearGradient(
      screenPos.x, screenPos.y,
      screenPos.x, screenPos.y - size * 0.6
    );
    stemGradient.addColorStop(0, "#15803d");
    stemGradient.addColorStop(0.5, "#22c55e");
    stemGradient.addColorStop(1, "#4ade80");
    this.ctx.strokeStyle = stemGradient;
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y);
    this.ctx.lineTo(screenPos.x, screenPos.y - size * 0.6);
    this.ctx.stroke();

    // Cápsula receptora en la punta (bulbo orgánico)
    const bulbY = screenPos.y - size * 0.6;
    const bulbPulse = 0.9 + Math.sin(time * 3) * 0.1;

    const bulbGradient = this.ctx.createRadialGradient(
      screenPos.x, bulbY, 0,
      screenPos.x, bulbY, size * 0.15 * bulbPulse
    );
    bulbGradient.addColorStop(0, "#a7f3d0");
    bulbGradient.addColorStop(0.5, "#4ade80");
    bulbGradient.addColorStop(1, "#15803d");
    this.ctx.fillStyle = bulbGradient;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, bulbY, size * 0.15 * bulbPulse, 0, Math.PI * 2);
    this.ctx.fill();

    // Pulsos bio-eléctricos
    for (let i = 0; i < 3; i++) {
      const pulseCycle = ((time * 2 + i * 0.5) % 2);
      if (pulseCycle < 1) {
        const alpha = 1 - pulseCycle;
        const radius = size * 0.15 + pulseCycle * size * 0.25;
        this.ctx.strokeStyle = `rgba(74, 222, 128, ${alpha * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, bulbY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    // Esporas flotantes alrededor
    for (let i = 0; i < 5; i++) {
      const sporeAngle = (i / 5) * Math.PI * 2 + time;
      const sporeRadius = size * 0.3;
      const sporeX = screenPos.x + Math.cos(sporeAngle) * sporeRadius;
      const sporeY = bulbY + Math.sin(sporeAngle) * sporeRadius * 0.5;
      const sporeAlpha = Math.abs(Math.sin(time * 2 + i)) * 0.6 + 0.4;

      this.ctx.fillStyle = `rgba(167, 243, 208, ${sporeAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sporeX, sporeY, size * 0.02, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Raíces/tentáculos en la base
    const roots = 4;
    for (let i = 0; i < roots; i++) {
      const rootAngle = (i / roots) * Math.PI * 2 + Math.PI / 4;
      const rootWave = Math.sin(time * 2 + i) * 0.15;
      const rootEndAngle = rootAngle + rootWave;

      const rootStartX = screenPos.x + Math.cos(rootAngle) * size * 0.25;
      const rootStartY = screenPos.y + Math.sin(rootAngle) * size * 0.25;
      const rootEndX = rootStartX + Math.cos(rootEndAngle) * size * 0.2;
      const rootEndY = rootStartY + Math.sin(rootEndAngle) * size * 0.2;

      this.ctx.strokeStyle = `rgba(34, 197, 94, 0.7)`;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(rootStartX, rootStartY);
      this.ctx.lineTo(rootEndX, rootEndY);
      this.ctx.stroke();

      // Punta luminosa
      this.ctx.fillStyle = "#4ade80";
      this.ctx.beginPath();
      this.ctx.arc(rootEndX, rootEndY, size * 0.02, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Nodos bioluminiscentes en los pétalos
    for (let i = 0; i < petals; i++) {
      const nodeAngle = (i / petals) * Math.PI * 2;
      const nodeX = screenPos.x + Math.cos(nodeAngle) * size * 0.35;
      const nodeY = screenPos.y + Math.sin(nodeAngle) * size * 0.35;
      const nodeBlink = Math.abs(Math.sin(time * 4 + i)) * 0.5 + 0.5;

      this.ctx.fillStyle = `rgba(167, 243, 208, ${nodeBlink})`;
      this.ctx.beginPath();
      this.ctx.arc(nodeX, nodeY, size * 0.03, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawYellowTower(screenPos) {
    const time = Date.now() / 1000;
    const size = 100;

    this.ctx.save();

    // Base en forma de estrella de 4 puntas
    this.ctx.fillStyle = "#1a1a0a";
    this.ctx.beginPath();

    const starPoints = 4;
    for (let i = 0; i < starPoints * 2; i++) {
      const angle = (i * Math.PI) / starPoints - Math.PI / 2;
      const radius = i % 2 === 0 ? size * 0.35 : size * 0.2;
      const x = screenPos.x + Math.cos(angle) * radius;
      const y = screenPos.y + Math.sin(angle) * radius;

      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = "#eab308";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Columna de energía solar
    const columnGradient = this.ctx.createLinearGradient(
      screenPos.x - size * 0.05, screenPos.y,
      screenPos.x + size * 0.05, screenPos.y
    );
    columnGradient.addColorStop(0, "#713f12");
    columnGradient.addColorStop(0.5, "#fbbf24");
    columnGradient.addColorStop(1, "#713f12");
    this.ctx.fillStyle = columnGradient;
    this.ctx.fillRect(
      screenPos.x - size * 0.05,
      screenPos.y - size * 0.65,
      size * 0.1,
      size * 0.65
    );

    this.ctx.strokeStyle = "#eab308";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      screenPos.x - size * 0.05,
      screenPos.y - size * 0.65,
      size * 0.1,
      size * 0.65
    );

    // Colector solar en la punta (rombo giratorio)
    const collectorY = screenPos.y - size * 0.65;
    const collectorRotation = time * 0.6;

    this.ctx.save();
    this.ctx.translate(screenPos.x, collectorY);
    this.ctx.rotate(collectorRotation);

    const collectorGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.18);
    collectorGradient.addColorStop(0, "#fef3c7");
    collectorGradient.addColorStop(0.4, "#fde047");
    collectorGradient.addColorStop(0.7, "#facc15");
    collectorGradient.addColorStop(1, "#eab308");
    this.ctx.fillStyle = collectorGradient;

    // Rombo
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size * 0.18);
    this.ctx.lineTo(size * 0.12, 0);
    this.ctx.lineTo(0, size * 0.18);
    this.ctx.lineTo(-size * 0.12, 0);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = "#fbbf24";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Cristales en el rombo
    this.ctx.fillStyle = "rgba(254, 243, 199, 0.6)";
    this.ctx.fillRect(-size * 0.08, -size * 0.04, size * 0.16, size * 0.08);

    this.ctx.restore();

    // Resplandor del colector
    this.ctx.shadowColor = "#fde047";
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = `rgba(253, 224, 71, 0.3)`;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, collectorY, size * 0.25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Rayos de energía
    const rayCount = 8;
    for (let i = 0; i < rayCount; i++) {
      const rayAngle = (i / rayCount) * Math.PI * 2 + time;
      const rayLength = size * 0.25 + Math.sin(time * 3 + i) * size * 0.05;
      const rayAlpha = 0.4 + Math.sin(time * 2 + i) * 0.3;

      const rayStartX = screenPos.x + Math.cos(rayAngle) * size * 0.2;
      const rayStartY = collectorY + Math.sin(rayAngle) * size * 0.2;
      const rayEndX = screenPos.x + Math.cos(rayAngle) * rayLength;
      const rayEndY = collectorY + Math.sin(rayAngle) * rayLength;

      const rayGradient = this.ctx.createLinearGradient(rayStartX, rayStartY, rayEndX, rayEndY);
      rayGradient.addColorStop(0, `rgba(250, 204, 21, ${rayAlpha})`);
      rayGradient.addColorStop(1, "rgba(250, 204, 21, 0)");

      this.ctx.strokeStyle = rayGradient;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(rayStartX, rayStartY);
      this.ctx.lineTo(rayEndX, rayEndY);
      this.ctx.stroke();
    }

    // Paneles solares laterales
    const panelPositions = [
      { x: screenPos.x - size * 0.4, y: screenPos.y - size * 0.3 },
      { x: screenPos.x + size * 0.3, y: screenPos.y - size * 0.3 }
    ];

    panelPositions.forEach((panel, idx) => {
      this.ctx.fillStyle = "#713f12";
      this.ctx.fillRect(panel.x, panel.y, size * 0.12, size * 0.25);

      this.ctx.strokeStyle = "#fbbf24";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(panel.x, panel.y, size * 0.12, size * 0.25);

      // Celdas del panel
      const cellAlpha = Math.abs(Math.sin(time * 3 + idx)) * 0.4 + 0.4;
      for (let i = 0; i < 4; i++) {
        this.ctx.strokeStyle = `rgba(250, 204, 21, ${cellAlpha})`;
        this.ctx.beginPath();
        this.ctx.moveTo(panel.x, panel.y + (size * 0.25 * i) / 4);
        this.ctx.lineTo(panel.x + size * 0.12, panel.y + (size * 0.25 * i) / 4);
        this.ctx.stroke();
      }
    });

    // Emisores de energía en las puntas de la estrella
    for (let i = 0; i < starPoints; i++) {
      const emitterAngle = (i * Math.PI * 2) / starPoints - Math.PI / 2;
      const emitterX = screenPos.x + Math.cos(emitterAngle) * size * 0.35;
      const emitterY = screenPos.y + Math.sin(emitterAngle) * size * 0.35;
      const emitterPulse = Math.abs(Math.sin(time * 5 + i)) * 0.5 + 0.5;

      this.ctx.fillStyle = `rgba(253, 224, 71, ${emitterPulse})`;
      this.ctx.beginPath();
      this.ctx.arc(emitterX, emitterY, size * 0.03, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawSatellite(satellite) {
    // No dibujar si está destruido
    if (satellite.isDestroyed) return;

    const screenPos = this.worldToScreen(satellite.x, satellite.y);

    // Si es un satélite orbital de clan, dibujarlo diferente
    if (satellite.clanId !== undefined) {
      this.drawOrbitalSatellite(screenPos, satellite);
      return;
    }

    // Satélites genéricos mejorados
    this.ctx.save();
    const time = Date.now() / 1000;

    // Cuerpo central con gradiente
    const bodyGradient = this.ctx.createLinearGradient(screenPos.x - 10, screenPos.y, screenPos.x + 10, screenPos.y);
    bodyGradient.addColorStop(0, "#a0a0a0");
    bodyGradient.addColorStop(0.5, "#e0e0e0");
    bodyGradient.addColorStop(1, "#a0a0a0");
    this.ctx.fillStyle = bodyGradient;
    this.ctx.fillRect(screenPos.x - 10, screenPos.y - 6, 20, 12);

    // Detalles del cuerpo
    this.ctx.strokeStyle = "#606060";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(screenPos.x - 10, screenPos.y - 6, 20, 12);

    // Paneles solares mejorados
    this.ctx.fillStyle = "#1a4d7a";
    this.ctx.fillRect(screenPos.x - 28, screenPos.y - 4, 14, 8);
    this.ctx.fillRect(screenPos.x + 14, screenPos.y - 4, 14, 8);

    // Líneas de celdas solares
    this.ctx.strokeStyle = "#0a2a4a";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x - 28, screenPos.y - 4 + i * 3);
      this.ctx.lineTo(screenPos.x - 14, screenPos.y - 4 + i * 3);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x + 14, screenPos.y - 4 + i * 3);
      this.ctx.lineTo(screenPos.x + 28, screenPos.y - 4 + i * 3);
      this.ctx.stroke();
    }

    // Antena con plato
    this.ctx.strokeStyle = "#c0c0c0";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y - 6);
    this.ctx.lineTo(screenPos.x, screenPos.y - 16);
    this.ctx.stroke();

    // Plato de antena
    this.ctx.fillStyle = "#d0d0d0";
    this.ctx.beginPath();
    this.ctx.ellipse(screenPos.x, screenPos.y - 16, 6, 3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Luz parpadeante mejorada
    const blinkAlpha = Math.abs(Math.sin(time * 3));
    this.ctx.fillStyle = `rgba(0, 255, 0, ${blinkAlpha})`;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Draw health bar for satellite
    if (satellite.health !== undefined && satellite.maxHealth !== undefined) {
      this.drawHealthBar(satellite, satellite.x, satellite.y, 50, 5, -25);
    }
  }

  drawOrbitalSatellite(screenPos, satellite) {
    const time = Date.now() / 1000;
    const clan = this.clans[satellite.clanId];

    this.ctx.save();

    // Satélite orbital elegante y grande
    const size = 40;

    // Cuerpo principal hexagonal
    const bodyGradient = this.ctx.createRadialGradient(screenPos.x, screenPos.y - size * 0.1, 0, screenPos.x, screenPos.y, size * 0.4);
    bodyGradient.addColorStop(0, "#f0f0f0");
    bodyGradient.addColorStop(0.6, clan.color);
    bodyGradient.addColorStop(1, "#404040");
    this.ctx.fillStyle = bodyGradient;

    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = screenPos.x + Math.cos(angle) * size * 0.3;
      const y = screenPos.y + Math.sin(angle) * size * 0.3;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = clan.color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Paneles solares grandes
    this.ctx.fillStyle = "#0d3a5a";
    this.ctx.fillRect(screenPos.x - size, screenPos.y - size * 0.15, size * 0.6, size * 0.3);
    this.ctx.fillRect(screenPos.x + size * 0.4, screenPos.y - size * 0.15, size * 0.6, size * 0.3);

    // Celdas solares
    this.ctx.strokeStyle = "#0a2030";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x - size, screenPos.y - size * 0.15 + i * size * 0.08);
      this.ctx.lineTo(screenPos.x - size * 0.4, screenPos.y - size * 0.15 + i * size * 0.08);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x + size * 0.4, screenPos.y - size * 0.15 + i * size * 0.08);
      this.ctx.lineTo(screenPos.x + size, screenPos.y - size * 0.15 + i * size * 0.08);
      this.ctx.stroke();
    }

    // Antena parabólica rotando
    this.ctx.save();
    this.ctx.translate(screenPos.x, screenPos.y - size * 0.4);
    this.ctx.rotate(time * 0.5);

    const dishGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
    dishGradient.addColorStop(0, "#ffffff");
    dishGradient.addColorStop(1, "#a0a0a0");
    this.ctx.fillStyle = dishGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.25, size * 0.15, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#606060";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // Luces indicadoras parpadeantes
    const blinkPhase = (time * 2) % (Math.PI * 2);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const lx = screenPos.x + Math.cos(angle) * size * 0.3;
      const ly = screenPos.y + Math.sin(angle) * size * 0.3;
      const brightness = Math.max(0, Math.sin(blinkPhase + i));
      this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      this.ctx.beginPath();
      this.ctx.arc(lx, ly, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Nombre del satélite
    this.ctx.fillStyle = clan.color;
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(satellite.name, screenPos.x, screenPos.y + size * 0.6);

    this.ctx.restore();

    // Draw health bar for orbital satellite
    if (satellite.health !== undefined && satellite.maxHealth !== undefined) {
      this.drawHealthBar(satellite, satellite.x, satellite.y, 60, 5, -55);
    }
  }

  spawnSatellite() {
    if (this.satellites.length >= 10) return;

    let x, y;
    do {
      x = Math.random() * this.worldSize;
      y = Math.random() * this.worldSize;
    } while (
      this.getDistance(x, y, this.earth.x, this.earth.y) <
      this.earth.radius + 200
    );

    this.satellites.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 30000, // 30 seconds
    });
  }

  destroyStructure(structure, type, destroyedBy = null) {
    structure.isDestroyed = true;
    structure.destroyedAt = Date.now();

    // Dropear monedas si fue destruido por alguien
    if (destroyedBy) {
      const posX = structure.x + (structure.width || 50) / 2;
      const posY = structure.y + (structure.height || 50) / 2;
      this.dropCoins(posX, posY, type, false, false, destroyedBy);

      console.log(`💰 ${type.toUpperCase()} destruido por ${destroyedBy} - dropeó monedas`);
    }

    // Efectos según el tipo
    if (type === 'satellite') {
      console.log(`🛰️ Satélite del ${this.clans[structure.clanId].name} destruido!`);

      // Desactivar tracking de bots para cualquier clan
      console.log(`📡 Satélite del clan ${structure.clanId} destruido - Bots del clan pierden navegación a bases enemigas`);
      // Enviar evento al worker
      if (this.useWebWorkers && this.botWorker) {
        this.botWorker.postMessage({
          type: 'disableSatellite',
          data: { clanId: structure.clanId }
        });
      }

      // Explosión de partículas
      for (let i = 0; i < 30; i++) {
        this.particles.push({
          x: structure.x,
          y: structure.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 40,
          color: "#00ffff"
        });
      }
    }
    else if (type === 'tower') {
      console.log(`🗼 Torre de comunicaciones del ${this.clans[structure.clanId].name} destruida!`);

      // Si es la torre del clan del jugador, desactivar minimapa
      if (structure.clanId === this.playerClan) {
        console.log(`📵 Torre del clan ${this.playerClan} destruida - Minimapa desactivado`);
        this.minimapDisabled = true;
      }

      // Explosión de partículas
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: structure.x,
          y: structure.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 50,
          color: "#ff0000"
        });
      }
    }
    else if (type === 'base') {
      console.log(`🏭 Base del ${this.clans[structure.clan].name} destruida!`);

      // Explosión masiva
      for (let i = 0; i < 100; i++) {
        this.particles.push({
          x: structure.x + structure.width / 2,
          y: structure.y + structure.height / 2,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 80,
          color: structure.color
        });
      }
    }

    // Mensaje en pantalla
    this.addDamageNumber(
      "DESTRUIDO",
      structure.x + (structure.width || 50),
      structure.y - 20,
      "#ff0000"
    );
  }

  checkStructureRespawns() {
    const now = Date.now();

    // Check bases
    this.obstacles.forEach(obstacle => {
      if (obstacle.isDestructible && obstacle.isDestroyed) {
        if (now - obstacle.destroyedAt >= obstacle.respawnTime) {
          console.log(`Respawneando ${obstacle.type} del clan ${obstacle.clan}`);
          obstacle.health = obstacle.maxHealth;
          obstacle.isDestroyed = false;
          obstacle.destroyedAt = 0;

          // Efecto de respawn
          for (let i = 0; i < 20; i++) {
            this.particles.push({
              x: obstacle.x + obstacle.width / 2,
              y: obstacle.y + obstacle.height / 2,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 30,
              color: "#00ff00"
            });
          }
        }
      }
    });

    // Check satellites
    if (this.orbitalSatellites) {
      this.orbitalSatellites.forEach(satellite => {
        if (satellite.isDestroyed && now - satellite.destroyedAt >= satellite.respawnTime) {
          console.log(`🛰️ Respawneando satélite del ${this.clans[satellite.clanId].name}`);
          satellite.health = satellite.maxHealth;
          satellite.isDestroyed = false;
          satellite.destroyedAt = 0;

          // Reactivar navegación para cualquier clan
          if (this.useWebWorkers && this.botWorker) {
            console.log(`📡 Satélite del clan ${satellite.clanId} respawneado - Bots recuperan navegación`);
            this.botWorker.postMessage({
              type: 'enableSatellite',
              data: { clanId: satellite.clanId }
            });
          }
        }
      });
    }

    // Check towers
    if (this.orbitalTowers) {
      this.orbitalTowers.forEach(tower => {
        if (tower.isDestroyed && now - tower.destroyedAt >= tower.respawnTime) {
          console.log(`🗼 Respawneando torre del ${this.clans[tower.clanId].name}`);
          tower.health = tower.maxHealth;
          tower.isDestroyed = false;
          tower.destroyedAt = 0;

          // Reactivar minimapa si es la torre del clan del jugador
          if (tower.clanId === this.playerClan) {
            console.log(`📵 Torre del clan ${this.playerClan} respawneada - Minimapa reactivado`);
            this.minimapDisabled = false;
          }
        }
      });
    }
  }

  updateSatellites() {
    // Actualizar ISS orbital
    if (this.iss) {
      this.iss.orbitAngle += this.iss.orbitSpeed * 0.01;

      // Calcular posición orbital alrededor de la Tierra
      const earthCenterX = this.earth.x;
      const earthCenterY = this.earth.y;

      this.iss.x = earthCenterX + Math.cos(this.iss.orbitAngle) * this.iss.orbitRadius;
      this.iss.y = earthCenterY + Math.sin(this.iss.orbitAngle) * this.iss.orbitRadius;

      // Actualizar zona segura circular con la ISS
      this.centralSafeZone.x = this.iss.x - this.centralSafeZone.radius;
      this.centralSafeZone.y = this.iss.y - this.centralSafeZone.radius;
    }

    // Actualizar satélites orbitales de clanes
    if (this.orbitalSatellites) {
      this.orbitalSatellites.forEach(satellite => {
        // Actualizar ángulo orbital
        satellite.orbitAngle += satellite.orbitSpeed * 0.01;

        // Calcular posición orbital alrededor de la base del clan
        const clan = this.clans[satellite.clanId];
        const baseSize = satellite.clanId === 1 ? 300 : 200;
        const baseX = clan.base.x + baseSize / 2; // Centro de la base
        const baseY = clan.base.y + baseSize / 2;

        satellite.x = baseX + Math.cos(satellite.orbitAngle) * satellite.orbitRadius;
        satellite.y = baseY + Math.sin(satellite.orbitAngle) * satellite.orbitRadius;
      });
    }

    // Actualizar torres de comunicaciones orbitales
    if (this.orbitalTowers) {
      this.orbitalTowers.forEach(tower => {
        // Actualizar ángulo orbital (más lento que satélites)
        tower.orbitAngle += tower.orbitSpeed * 0.01;

        // Calcular posición orbital alrededor de la base del clan
        const clan = this.clans[tower.clanId];
        const baseSize = tower.clanId === 1 ? 300 : 200;
        const baseX = clan.base.x + baseSize / 2; // Centro de la base
        const baseY = clan.base.y + baseSize / 2;

        tower.x = baseX + Math.cos(tower.orbitAngle) * tower.orbitRadius;
        tower.y = baseY + Math.sin(tower.orbitAngle) * tower.orbitRadius;
      });
    }

    // Actualizar satélites genéricos
    this.satellites.forEach((satellite, index) => {
      // Move satellite
      satellite.x += satellite.vx;
      satellite.y += satellite.vy;

      // Keep in world bounds
      if (satellite.x < 0 || satellite.x > this.worldSize) satellite.vx *= -1;
      if (satellite.y < 0 || satellite.y > this.worldSize) satellite.vy *= -1;

      // Remove old satellites
      satellite.life -= 16; // Assuming 60 FPS
      if (satellite.life <= 0) {
        this.satellites.splice(index, 1);
      }
    });

    // Spawn new satellites
    this.satelliteSpawnTimer += 16;
    if (this.satelliteSpawnTimer >= this.satelliteSpawnInterval) {
      this.spawnSatellite();
      this.satelliteSpawnTimer = 0;
    }
  }

  drawPlanetPortals() {
    // Antes de dibujar los portales, eliminar cualquier portal de depuración
    this.planetPortals = this.planetPortals.filter((portal) => !portal.debug);

    this.planetPortals.forEach((portal) => {
      const screenPos = this.worldToScreen(portal.x, portal.y);
      const portalRadius = 40;

      // Verificar si el portal está en la pantalla
      const isOnScreen =
        screenPos.x > -100 &&
        screenPos.x < this.canvas.width + 100 &&
        screenPos.y > -100 &&
        screenPos.y < this.canvas.height + 100;

      if (!isOnScreen) {
        return;
      }

      // Efecto de pulso del portal
      const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
      const currentRadius = portalRadius * pulse;

      // Dibujar círculo exterior (aura)
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = portal.color;
      this.ctx.beginPath();
      this.ctx.arc(
        screenPos.x,
        screenPos.y,
        currentRadius + 10,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.restore();

      // Dibujar círculo principal del portal
      this.ctx.save();
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillStyle = portal.color;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Dibujar borde del portal
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, currentRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Dibujar icono del planeta
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 24px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(portal.icon, screenPos.x, screenPos.y);

      // Dibujar nombre del planeta
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        portal.name,
        screenPos.x,
        screenPos.y + currentRadius + 20,
      );

      // Dibujar descripción
      this.ctx.fillStyle = "#cccccc";
      this.ctx.font = "10px Arial";
      this.ctx.fillText(
        portal.description,
        screenPos.x,
        screenPos.y + currentRadius + 35,
      );

      // Efecto de partículas alrededor del portal
      if (Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = currentRadius + Math.random() * 20;
        const particleX = screenPos.x + Math.cos(angle) * distance;
        const particleY = screenPos.y + Math.sin(angle) * distance;

        this.particles.push({
          x: particleX,
          y: particleY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 30,
          color: portal.color,
        });
      }

      // Verificar si el jugador está cerca del portal
      if (this.player) {
        const distance = this.getDistance(
          this.player.x,
          this.player.y,
          portal.x,
          portal.y,
        );
        if (distance < currentRadius + 50) {
          // Mostrar indicador de interacción
          this.ctx.fillStyle = "#00ff00";
          this.ctx.font = "bold 16px Arial";
          this.ctx.textAlign = "center";
          this.ctx.fillText(
            "CLICK PARA ENTRAR",
            screenPos.x,
            screenPos.y - currentRadius - 30,
          );

          // Mostrar información del portal
          this.showPortalInfo(portal, screenPos, currentRadius);

          // Verificar si el jugador hace click en el portal (mejorado)
          if (this.mouse.clicked) {
            const mouseWorld = this.screenToWorld(this.mouse.x, this.mouse.y);
            const mouseDistance = this.getDistance(
              mouseWorld.x,
              mouseWorld.y,
              portal.x,
              portal.y,
            );

            if (mouseDistance < currentRadius + 20) {
              // Aumentar área de click
              console.log(
                `Portal clicked: ${portal.name} at distance ${mouseDistance}`,
              );
              this.enterPlanetPortal(portal);
            }
          }
        }
      }
    });
  }

  showPortalInfo(portal, screenPos, radius) {
    // Crear panel de información del portal
    const infoPanel = document.createElement("div");
    infoPanel.id = "portalInfoPanel";
    infoPanel.style.cssText = `
            position: fixed;
            top: ${screenPos.y - radius - 120}px;
            left: ${screenPos.x - 150}px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${portal.color};
            border-radius: 10px;
            padding: 15px;
            color: #ffffff;
            font-family: Arial, sans-serif;
            z-index: 1000;
            pointer-events: none;
        `;

    infoPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <div style="font-size: 24px; margin-bottom: 5px;">${portal.icon}</div>
                <div style="font-size: 18px; font-weight: bold; color: ${portal.color};">${portal.name}</div>
            </div>
            <div style="font-size: 12px; text-align: center; margin-bottom: 10px;">
                ${portal.description}
            </div>
            <div style="text-align: center; font-size: 14px; color: #00ff00;">
                ⚡ Haz click para viajar
            </div>
        `;

    // Remover panel anterior si existe
    const existingPanel = document.getElementById("portalInfoPanel");
    if (existingPanel) {
      existingPanel.remove();
    }

    document.body.appendChild(infoPanel);

    // Remover panel después de un tiempo
    setTimeout(() => {
      if (infoPanel.parentNode) {
        infoPanel.remove();
      }
    }, 3000);
  }

  enterPlanetPortal(portal) {
    // Prevent multiple portal entries
    if (this.portalCooldown) return;
    this.portalCooldown = true;

    // Efectos visuales de entrada al portal
    const screenPos = this.worldToScreen(portal.x, portal.y);

    // Explosión de partículas
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x: screenPos.x,
        y: screenPos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60,
        color: portal.color,
      });
    }

    // Efecto de ondas
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.addDamageNumber("¡PORTAL!", portal.x, portal.y, "#00ff00");
      }, i * 200);
    }

    // Efecto de pantalla completa
    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${portal.color}40 0%, transparent 70%);
            z-index: 9999;
            pointer-events: none;
            animation: portalEffect 2s ease-out;
        `;

    // Agregar CSS para la animación
    if (!document.getElementById("portalEffectCSS")) {
      const style = document.createElement("style");
      style.id = "portalEffectCSS";
      style.textContent = `
                @keyframes portalEffect {
                    0% { opacity: 0; transform: scale(0.1); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0; transform: scale(2); }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    // Mensaje de transición
    const message = document.createElement("div");
    message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            text-shadow: 2px 2px 4px #000;
        `;
    message.innerHTML = `
            <div>🌌</div>
            <div>Viajando a ${portal.name}...</div>
        `;
    document.body.appendChild(message);

    // Navegar al planeta después de los efectos
    setTimeout(() => {
      window.location.href = `${portal.planet}.html`;
    }, 2000);

    // Limpiar elementos después de la transición
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (message.parentNode) message.parentNode.removeChild(message);
    }, 2500);

    // Reset cooldown after 3 seconds
    setTimeout(() => {
      this.portalCooldown = false;
    }, 3000);
  }

  openInventory() {
    const panel = document.getElementById("inventoryPanel");
    if (panel) {
      panel.style.display = "block";
    }
  }

  forceRegisterExistingWidgets() {
    // Registrar elementos que pueden no estar registrados aún
    const elementsToRegister = [
      {
        id: "tiendaBtn",
        selector: "#tiendaBtn",
        name: "Botón de Tienda",
        pos: { x: window.innerWidth / 2 - 100, y: 80 },
      },
      {
        id: "playerStats",
        selector: ".player-stats",
        name: "Estadísticas del Jugador",
        pos: { x: 10, y: 10 },
      },
      {
        id: "widgetInstructions",
        selector: "#widgetInstructions",
        name: "Instrucciones de Widgets",
        pos: { x: 20, y: window.innerHeight - 200 },
      },
      {
        id: "widgetControlPanel",
        selector: "#widgetControlPanel",
        name: "Control de Widgets",
        pos: { x: 20, y: 80 },
      },
      {
        id: "resetWidgetsButton",
        selector: "#resetWidgetsButton",
        name: "Botón Resetear",
        pos: { x: 200, y: 20 },
      },
    ];

    elementsToRegister.forEach((item) => {
      const element = document.querySelector(item.selector);
      if (element && !element.classList.contains("widget")) {
        // Registrar el elemento como widget
        element.className += " widget";
        element.dataset.widgetId = item.id;
        element.dataset.widgetName = item.name;

        // Asegurar que tenga posición fija
        if (element.style.position !== "fixed") {
          element.style.position = "fixed";
          element.style.left = item.pos.x + "px";
          element.style.top = item.pos.y + "px";
          element.style.zIndex = "1000";
        }

        // Agregar al sistema
        this.addWidget(element, item.id, item.pos, item.name);

        LogManager.log("info", `Widget forzado registrado: ${item.name}`);
      }
    });

    // Actualizar panel de control
    this.updateWidgetControlPanel();

    LogManager.log("info", "Registro forzado de widgets completado");
  }

  cleanup() {
    // Limpiar Web Worker
    if (this.botWorker) {
      this.botWorker.terminate();
      this.botWorker = null;
    }

    // Limpiar integración del juego
    if (this.gameIntegration) {
      this.gameIntegration.cleanup();
      this.gameIntegration = null;
    }

    // Limpiar otros recursos
    this.particles = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.damageNumbers = [];
    this.coinObjects = [];

    console.log("Recursos del juego limpiados");
  }

  // Agrega la función a la clase CosmicDefender
  renderSkillsWidget() {
    const skillsWidget = document.getElementById("skillsWidget");
    if (!skillsWidget) return;

    const skillKeys = this.skillKeyMap;
    skillsWidget.innerHTML = "";

    // Header de arrastre
    let header = document.getElementById("skillsWidgetHeader");
    if (!header) {
      header = document.createElement("div");
      header.id = "skillsWidgetHeader";
      header.textContent = "Skills";
      header.style.cssText = `
                width: 100%; height: 16px; background: rgba(0,0,0,0.25); color: #fff; font-size: 11px; font-weight: bold;
                text-align: center; border-radius: 6px 6px 0 0; cursor: move; user-select: none; letter-spacing: 1px; margin-bottom: 1px;`;
      skillsWidget.prepend(header);
    }

    // Hacer solo el header arrastrable en modo edición
    if (this.isWidgetEditMode) {
      header.style.pointerEvents = "auto";
      header.onmousedown = (e) => this.startWidgetDrag(e, skillsWidget);
      header.style.cursor = "move";
    } else {
      header.onmousedown = null;
      header.style.cursor = "";
    }

    // Skills en disposición horizontal
    skillKeys.forEach((key, idx) => {
      const skill = this.skills[key];
      const container = document.createElement("div");
      container.style.cssText = `
                width: 50px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
                border: 2px solid #3399ff; border-radius: 8px; margin: 1px; background: rgba(0,0,0,0.7); box-sizing: border-box; transition: border 0.2s, background 0.2s;
                z-index: 10001; pointer-events: auto; cursor: pointer;`;
      container.dataset.skillKey = key;

      const icon = document.createElement("div");
      icon.textContent = skill.icon;
      icon.style.cssText = `font-size: 20px; margin-bottom: 1px; position: relative; pointer-events: none;`;

      if (skill.cooldown > 0) {
        const cd = document.createElement("div");
        cd.textContent = (skill.cooldown / 1000).toFixed(1) + "s";
        cd.style.cssText = `
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    text-align: center;
                    color: #ffd700;
                    font-size: 10px;
                    font-weight: bold;
                    text-shadow: 0 0 4px #000, 0 0 2px #ffd700;
                    pointer-events: none;
                    z-index: 2;
                `;
        icon.appendChild(cd);
        icon.style.opacity = 0.5;
      } else {
        icon.style.opacity = 1;
      }

      const name = document.createElement("div");
      name.textContent = key.toUpperCase();
      name.style.cssText = `font-size: 9px; color: #fff; font-weight: bold; margin-bottom: 1px; pointer-events: none;`;
      container.title = skill.name + ": " + skill.description;

      container.appendChild(icon);
      container.appendChild(name);
      skillsWidget.appendChild(container);
    });
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  const game = new CosmicDefender();

  // Limpiar recursos cuando se cierre la página
  window.addEventListener("beforeunload", () => {
    game.cleanup();
  });
});

// ===== FUNCIONES PARA INTEGRACIÓN CON MARKET =====

// Función para mostrar market en iframe
function showMarketInIframe() {
  // Ocultar todos los menús
  const gameMenu = document.getElementById("gameMenu");
  const clanSelector = document.getElementById("clanSelector");
  const bandoSelector = document.getElementById("bandoSelector");

  if (gameMenu) gameMenu.style.display = "none";
  if (clanSelector) clanSelector.style.display = "none";
  if (bandoSelector) bandoSelector.style.display = "none";

  // Crear iframe del market
  const iframe = document.createElement("iframe");
  iframe.src = "mobile-market.html";
  iframe.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50px;
        width: calc(100vw - 100px);
        height: calc(100vh - 100px);
        border: 3px solid #00bfff;
        border-radius: 10px;
        z-index: 9999;
        background: #000;
        box-shadow: 0 0 20px rgba(0, 191, 255, 0.5);
    `;
  iframe.id = "marketIframe";

  document.body.appendChild(iframe);
}

// Función para volver del market al juego
window.startGameFromMarket = function () {
  // Remover iframe
  const iframe = document.getElementById("marketIframe");
  if (iframe) {
    iframe.remove();
  }

  // Actualizar estado de nave desde localStorage antes de iniciar
  if (window.game) {
    window.game.checkShipStatus(); // Actualizar this.hasShip desde localStorage
    window.game.startGame();
  }
};
