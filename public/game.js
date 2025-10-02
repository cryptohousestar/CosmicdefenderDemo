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
      starCount: 50,
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
      starCount: 100,
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
      starCount: 150,
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
      starCount: 200,
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
      starCount: 300,
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
  minimapContainer: { x: 320, y: 20 },
  playerStats: { x: 20, y: 20 },
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
    this.player = null;
    this.selectedShip = 0;
    this.keys = {};
    this.mouse = { x: 0, y: 0, clicked: false };
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
    this.createSpeedControl(); // Crear barra de velocidad para desarrollo
    this.createWidgetSystem(); // Crear sistema de widgets movibles

    // Check if we have integration data from URL parameters
    this.checkIntegrationData();

    this.showMenu(); // Mostrar menú principal
    this.gameLoop();
  }

  resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            const baseWidth = 1200; // The game's design resolution
            const baseHeight = 800;

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

  createSpeedControl() {
    // Crear contenedor para el control de velocidad
    const speedContainer = document.createElement("div");
    speedContainer.id = "speedControl";
    speedContainer.className = "widget";
    speedContainer.dataset.widgetType = "speedControl";
    speedContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 15px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            color: white;
            min-width: 200px;
            cursor: move;
            user-select: none;
        `;

    // Título
    const title = document.createElement("div");
    title.textContent = "🚀 Control de Velocidad (DEV)";
    title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            color: #00ff00;
        `;

    // Barra de velocidad
    const speedSlider = document.createElement("input");
    speedSlider.type = "range";
    speedSlider.min = "0.1";
    speedSlider.max = "5.0";
    speedSlider.step = "0.1";
    speedSlider.value = "1.0";
    speedSlider.style.cssText = `
            width: 100%;
            height: 20px;
            margin: 10px 0;
            background: #333;
            outline: none;
            border-radius: 10px;
        `;

    // Valor actual
    const speedValue = document.createElement("div");
    speedValue.id = "speedValue";
    speedValue.textContent = "Velocidad: 1.0x (Normal)";
    speedValue.style.cssText = `
            text-align: center;
            margin: 5px 0;
            font-size: 12px;
        `;

    // Botones de control rápido
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
            display: flex;
            gap: 5px;
            margin-top: 10px;
        `;

    const buttons = [
      { text: "0.5x", value: 0.5, color: "#ff6666" },
      { text: "1.0x", value: 1.0, color: "#66ff66" },
      { text: "2.0x", value: 2.0, color: "#6666ff" },
      { text: "3.0x", value: 3.0, color: "#ffff66" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.textContent = btn.text;
      button.style.cssText = `
                flex: 1;
                padding: 5px;
                background: ${btn.color};
                border: none;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 10px;
            `;
      button.onclick = () => {
        speedSlider.value = btn.value;
        this.speedMultiplier = btn.value;
        this.updateSpeedDisplay();
        this.updatePlayerSpeed();
      };
      buttonContainer.appendChild(button);
    });

    // Evento del slider
    speedSlider.addEventListener("input", (e) => {
      this.speedMultiplier = parseFloat(e.target.value);
      this.updateSpeedDisplay();
      this.updatePlayerSpeed();
    });

    // Agregar elementos al contenedor
    speedContainer.appendChild(title);
    speedContainer.appendChild(speedSlider);
    speedContainer.appendChild(speedValue);
    speedContainer.appendChild(buttonContainer);

    // Agregar al documento
    document.body.appendChild(speedContainer);

    // Inicializar
    this.updateSpeedDisplay();

    // Agregar al sistema de widgets
    this.addWidget(speedContainer, "speedControl", { x: 20, y: 20 });
  }

  registerAllGameWidgets() {
    // Registrar widgets del juego
    this.registerGameWidgets();

    // Registrar widgets dinámicos
    this.registerDynamicWidgets();

    // Registrar widgets post-juego
    this.registerPostGameWidgets();

    // Registrar panel de performance
    this.registerWidget(
      "performancePanel",
      "#performancePanel",
      { x: window.innerWidth - 200, y: 10 },
      "Panel de Rendimiento",
    );

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
    let minimapDiv = document.getElementById("minimapContainer");
    if (!minimapDiv) {
      minimapDiv = document.createElement("div");
      minimapDiv.id = "minimapContainer";
      minimapDiv.style.position = "fixed";
      minimapDiv.style.left = "100px";
      minimapDiv.style.top = "100px";
      minimapDiv.style.zIndex = "1000";
      document.body.appendChild(minimapDiv);
    }
    // Si ya existe un canvas, no crear otro
    let minimapCanvas = minimapDiv.querySelector("canvas");
    if (!minimapCanvas) {
      minimapCanvas = document.createElement("canvas");
      minimapCanvas.id = "minimapCanvas";
      minimapCanvas.width = 150;
      minimapCanvas.height = 170;
      minimapDiv.appendChild(minimapCanvas);
    }
    // Registrar el contenedor como widget
    this.registerWidget(
      "minimapContainer",
      "#minimapContainer",
      { x: 100, y: 100 },
      "Minimapa",
      true,
    );
  }

  createWidgetSystem() {
    // Botón de configuración de widgets
    const configButton = document.createElement("button");
    configButton.id = "widgetConfigButton";
    configButton.className = "widget";
    configButton.dataset.widgetId = "widgetConfigButton";
    configButton.dataset.widgetName = "Botón Configurar UI";
    configButton.innerHTML = "⚙️ Configurar UI";
    configButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff6b35;
            border-radius: 8px;
            padding: 10px 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-weight: bold;
            cursor: pointer;
            z-index: 99999;
            transition: all 0.3s ease;
            display: block;
            pointer-events: auto;
        `;

    configButton.onmouseover = () => {
      configButton.style.background = "rgba(255, 107, 53, 0.3)";
      configButton.style.transform = "scale(1.05)";
    };

    configButton.onmouseout = () => {
      configButton.style.background = "rgba(0, 0, 0, 0.8)";
      configButton.style.transform = "scale(1)";
    };

    configButton.onclick = () => {
      this.toggleWidgetEditMode();
    };

    document.body.appendChild(configButton);

    // Agregar el botón de configuración al sistema de widgets
    this.addWidget(
      configButton,
      "widgetConfigButton",
      { x: 20, y: 20 },
      "Botón Configurar UI",
    );

    // Panel de instrucciones
    this.createWidgetInstructions();

    // Panel de control de widgets
    this.createWidgetControlPanel();

    // Cargar posiciones guardadas
    this.loadWidgetPositions();

    // Registrar todos los widgets del juego
    this.registerAllGameWidgets();

    // Crear el widget de skills si no existe
    let skillsWidget = document.getElementById("skillsWidget");
    if (!skillsWidget) {
      skillsWidget = document.createElement("div");
      skillsWidget.id = "skillsWidget";
      skillsWidget.className = "widget";
      skillsWidget.dataset.widgetId = "skillsWidget";
      skillsWidget.dataset.widgetName = "Skills";
      skillsWidget.style.cssText = `
                position: fixed;
                left: ${DEFAULT_WIDGET_POSITIONS.skillsWidget.x}px;
                top: ${DEFAULT_WIDGET_POSITIONS.skillsWidget.y}px;
                z-index: 1000;
                background: rgba(0,0,0,0.85);
                border: 2px solid #ff6b35;
                border-radius: 8px;
                padding: 8px 12px 6px 12px;
                display: flex;
                gap: 4px;
                box-shadow: 0 0 12px #ff6b35aa;
                align-items: center;
                flex-direction: row;
            `;
      document.body.appendChild(skillsWidget);
    }
    this.addWidget(
      skillsWidget,
      "skillsWidget",
      DEFAULT_WIDGET_POSITIONS.skillsWidget,
      "Skills",
    );
  }

  createWidgetInstructions() {
    const instructions = document.createElement("div");
    instructions.id = "widgetInstructions";
    instructions.className = "widget";
    instructions.dataset.widgetId = "widgetInstructions";
    instructions.dataset.widgetName = "Instrucciones de Widgets";
    instructions.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            display: none;
            max-width: 300px;
            cursor: move;
        `;

    instructions.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #00ff00;">📋 Instrucciones de Widgets</div>
            <div style="margin-bottom: 5px;">• <strong>Modo Edición:</strong> Haz clic en "⚙️ Configurar UI"</div>
            <div style="margin-bottom: 5px;">• <strong>Mover Widgets:</strong> Arrastra los widgets cuando estén en modo edición</div>
            <div style="margin-bottom: 5px;">• <strong>Guardar:</strong> Los cambios se guardan automáticamente</div>
            <div style="margin-bottom: 5px;">• <strong>Resetear:</strong> Haz clic en "🔄 Resetear Posiciones"</div>
            <div style="margin-bottom: 5px;">• <strong>Salir:</strong> Haz clic en "✅ Terminar"</div>
        `;

    document.body.appendChild(instructions);

    // Agregar al sistema de widgets
    this.addWidget(
      instructions,
      "widgetInstructions",
      { x: 20, y: window.innerHeight - 200 },
      "Instrucciones de Widgets",
    );
  }

  toggleWidgetEditMode() {
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

    // Spawn player in the central safe zone (central station)
    let spawnX, spawnY;
    do {
      spawnX =
        this.centralSafeZone.x +
        this.centralSafeZone.width / 2 +
        (Math.random() - 0.5) * 100;
      spawnY =
        this.centralSafeZone.y +
        this.centralSafeZone.height / 2 +
        (Math.random() - 0.5) * 100;
    } while (
      spawnX < this.centralSafeZone.x + 50 ||
      spawnX > this.centralSafeZone.x + this.centralSafeZone.width - 50 ||
      spawnY < this.centralSafeZone.y + 50 ||
      spawnY > this.centralSafeZone.y + this.centralSafeZone.height - 50
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

    // Spawn player in the central safe zone (central station)
    let spawnX, spawnY;
    do {
      spawnX =
        this.centralSafeZone.x +
        this.centralSafeZone.width / 2 +
        (Math.random() - 0.5) * 100;
      spawnY =
        this.centralSafeZone.y +
        this.centralSafeZone.height / 2 +
        (Math.random() - 0.5) * 100;
    } while (
      spawnX < this.centralSafeZone.x + 50 ||
      spawnX > this.centralSafeZone.x + this.centralSafeZone.width - 50 ||
      spawnY < this.centralSafeZone.y + 50 ||
      spawnY > this.centralSafeZone.y + this.centralSafeZone.height - 50
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
      tiendaBtn.textContent = "Tienda Espacial";
      tiendaBtn.style.position = "fixed";
      tiendaBtn.style.top = "80px";
      tiendaBtn.style.left = "50%";
      tiendaBtn.style.transform = "translateX(-50%)";
      tiendaBtn.style.zIndex = "1000";
      tiendaBtn.style.padding = "16px 32px";
      tiendaBtn.style.background = "#222";
      tiendaBtn.style.color = "#fff";
      tiendaBtn.style.fontSize = "20px";
      tiendaBtn.style.border = "2px solid #ff6b35";
      tiendaBtn.style.borderRadius = "12px";
      tiendaBtn.style.boxShadow = "0 0 10px #ff6b35aa";
      tiendaBtn.style.cursor = "pointer";
      tiendaBtn.onclick = () => {
        window.open("market.html", "_blank");
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
    // Show shop button if player is in central safe zone OR if player has no ship equipped
    if (
      (this.isPlayerInSafeZone(this.player) &&
        this.player.x >= this.centralSafeZone.x &&
        this.player.x <= this.centralSafeZone.x + this.centralSafeZone.width &&
        this.player.y >= this.centralSafeZone.y &&
        this.player.y <=
          this.centralSafeZone.y + this.centralSafeZone.height) ||
      !this.hasShip
    ) {
      tiendaBtn.style.display = "block";
    } else {
      tiendaBtn.style.display = "none";
    }

    // Actualizar información de rendimiento
    this.updatePerformanceUI();
  }

  updatePerformanceUI() {
    // Crear o actualizar el panel de rendimiento como widget
    let performancePanel = document.getElementById("performancePanel");
    if (!performancePanel) {
      performancePanel = document.createElement("div");
      performancePanel.id = "performancePanel";
      performancePanel.className = "widget";
      performancePanel.dataset.widgetId = "performancePanel";
      performancePanel.dataset.widgetName = "Panel de Rendimiento";
      performancePanel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
                border: 2px solid #00eaff;
                cursor: move;
                user-select: none;
            `;
      performancePanel.onclick = () => this.togglePerformanceMode();
      document.body.appendChild(performancePanel);

      // Agregar al sistema de widgets
      this.addWidget(
        performancePanel,
        "performancePanel",
        { x: window.innerWidth - 200, y: 10 },
        "Panel de Rendimiento",
      );
    }

    const fps = PerformanceOptimizer.deviceCapabilities.fps;
    const mode = PerformanceOptimizer.deviceCapabilities.performanceMode;
    const cpuCores = PerformanceOptimizer.deviceCapabilities.cpuCores;
    const memory = PerformanceOptimizer.deviceCapabilities.memory;

    performancePanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: #00eaff;">📊 Rendimiento</div>
            <div>FPS: ${fps}</div>
            <div>Modo: ${mode} (click para cambiar)</div>
            <div>CPU: ${cpuCores} núcleos</div>
            <div>RAM: ${memory}GB</div>
            <div>Web Workers: ${this.useWebWorkers ? "Sí" : "No"}</div>
            <div>Bots: ${this.bots.length}/${this.performanceSettings.maxBots}</div>
            <div>Partículas: ${this.particles.length}/${this.performanceSettings.maxParticles}</div>
            <div>Balas: ${this.bullets.length}/${this.performanceSettings.maxBullets}</div>
        `;
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
            // Bullet hits obstacle
            this.bullets.splice(bulletIndex, 1);

            // Add hit particles - REMOVED to prevent covering ships
            /*
                        for (let i = 0; i < 5; i++) {
                            this.particles.push({
                                x: bullet.x,
                                y: bullet.y,
                                vx: (Math.random() - 0.5) * 2,
                                vy: (Math.random() - 0.5) * 2,
                                life: 10,
                                color: '#888888'
                            });
                        }
                        */
            return;
          }
        }
      });

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

                // Si el jugador murió, dropear monedas solo si el último hit fue del jugador
                if (player.health <= 0) {
                  if (player.lastDamageFrom === "player") {
                    this.dropCoins(
                      player.x + player.width / 2,
                      player.y + player.height / 2,
                      "bot",
                      player.isElite,
                    );
                    console.log(
                      `💰 ${player.name} ${player.isElite ? "(ELITE)" : ""} dropeó monedas (último hit: jugador)`,
                    );
                  } else {
                    console.log(
                      `💀 ${player.name} ${player.isElite ? "(ELITE)" : ""} murió (último hit: ${player.lastDamageFrom})`,
                    );
                  }
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
            // Bullet hits obstacle
            this.enemyBullets.splice(bulletIndex, 1);

            // Add hit particles - REMOVED to prevent covering ships
            /*
                        for (let i = 0; i < 5; i++) {
                            this.particles.push({
                                x: bullet.x,
                                y: bullet.y,
                                vx: (Math.random() - 0.5) * 2,
                                vy: (Math.random() - 0.5) * 2,
                                life: 10,
                                color: '#888888'
                            });
                        }
                        */
            return;
          }
        }
      });

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

  dropCoins(x, y, enemyType, isElite = false) {
    // Determinar cantidad de monedas basado en el tipo de enemigo
    let coinCount = 1;
    let coinValue = 1;

    if (enemyType === "bot") {
      if (isElite) {
        coinCount = 3; // Bots elite dropean 3 monedas
        coinValue = 2; // Cada moneda vale 2
      } else {
        coinCount = 1; // Bots normales dropean 1 moneda
        coinValue = 1; // Cada moneda vale 1
      }
    }

    // Dropear las monedas
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
    this.coinObjects.forEach((coin, index) => {
      // Move coin slightly
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.life--;

      // Check collision with player
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
    this.renderSkillsWidget();
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
    this.ctx.fillStyle = "#ffffff";
    const starCount = this.performanceSettings.starCount;
    for (let i = 0; i < starCount; i++) {
      const x = (i * 37) % this.canvas.width;
      const y = (i * 73) % this.canvas.height;
      const size = (i % 3) + 1;
      this.ctx.fillRect(x, y, size, size);
    }
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
      screenPos.y - 10,
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

  drawObstacle(obstacle) {
    const screenPos = this.worldToScreen(obstacle.x, obstacle.y);

    if (obstacle.type === "base") {
      // Draw clan base
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
      // Regular obstacle
      this.ctx.fillStyle = obstacle.type === "asteroid" ? "#654321" : "#444444";
      this.ctx.fillRect(
        screenPos.x,
        screenPos.y,
        obstacle.width,
        obstacle.height,
      );

      // Add some texture
      this.ctx.strokeStyle = "#333333";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        screenPos.x,
        screenPos.y,
        obstacle.width,
        obstacle.height,
      );
    }
  }

  drawMinimap() {
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
    const w = { x: 0, y: 0, width: 150, height: 170 };
    const minimapSize = 150;
    const titleHeight = 20;
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
    ctx.font = "bold 13px Arial";
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
            cursor: pointer;
        `;

    // Crear contenedor del mapa
    const mapContainer = document.createElement("div");
    mapContainer.style.cssText = `
            background: #000;
            border: 3px solid #00eaff;
            border-radius: 10px;
            padding: 20px;
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
        `;

    // Crear canvas del mapa completo
    const fullMapCanvas = document.createElement("canvas");
    fullMapCanvas.width = 600;
    fullMapCanvas.height = 600;
    fullMapCanvas.style.cssText = `
            border: 2px solid #00eaff;
            cursor: default;
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
    const mapSize = 600;
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
        // No colisión con safe zones
        for (const clan of this.clans) {
          const safe = {
            x: clan.base.x - 100,
            y: clan.base.y - 100,
            width: 400,
            height: 400,
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
        tries++;
      }
      if (valid) this.obstacles.push(obs);
    }

    // Create clan bases and safe zones
    this.clanSafeZones = [];
    this.clans.forEach((clan, index) => {
      // Base structure
      this.obstacles.push({
        x: clan.base.x,
        y: clan.base.y,
        width: 200,
        height: 200,
        type: "base",
        clan: index,
        color: clan.color,
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

      // Base defenses (only for enemy clans to avoid blocking player spawn)
      if (index !== this.playerClan) {
        for (let i = 0; i < 5; i++) {
          this.obstacles.push({
            x: clan.base.x + Math.random() * 150,
            y: clan.base.y + Math.random() * 150,
            width: 30,
            height: 30,
            type: "defense",
            clan: index,
            color: clan.color,
          });
        }
      }
    });

    // Spawn initial enemies for each clan - DISABLED
    // this.clans.forEach((clan, clanIndex) => {
    //     if (clanIndex !== this.playerClan) { // Don't spawn enemies for player's clan
    //         for (let i = 0; i < 8; i++) {
    //             this.spawnEnemyForClan(clanIndex);
    //         }
    //     }
    // });

    // Crear zona segura neutral central
    this.centralSafeZone = {
      x: this.worldSize / 2 - 300,
      y: this.worldSize / 2 - 300,
      width: 600,
      height: 600,
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
    // Zona neutral central
    if (
      player.x >= this.centralSafeZone.x &&
      player.x <= this.centralSafeZone.x + this.centralSafeZone.width &&
      player.y >= this.centralSafeZone.y &&
      player.y <= this.centralSafeZone.y + this.centralSafeZone.height
    ) {
      return true;
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
    let newCameraX = this.player.x - this.canvas.width / 2;
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
      // Guardar si el jugador está en el safe zone central
      let inCentralSafeZone = false;
      if (
        this.centralSafeZone &&
        this.player.x >= this.centralSafeZone.x &&
        this.player.x <= this.centralSafeZone.x + this.centralSafeZone.width &&
        this.player.y >= this.centralSafeZone.y &&
        this.player.y <= this.centralSafeZone.y + this.centralSafeZone.height
      ) {
        inCentralSafeZone = true;
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
    this.renderSkillsWidget();
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.renderOffsetX, this.renderOffsetY);
    this.ctx.scale(this.scale, this.scale);

    // The original render content starts here, now scaled
    // Log cada 5 segundos para evitar spam
    const now = Date.now();
    if (!this.lastRenderLog || now - this.lastRenderLog > 5000) {
        // LogManager.log('info', `=== RENDER CALLED === GameState: ${this.gameState}, Player: ${!!this.player}`);
        this.lastRenderLog = now;
    }

    // Clear virtual canvas
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, 1200, 800);

    // Debug: Log render state
    // LogManager.log('info', `Rendering - GameState: ${this.gameState}, Player: ${this.player ? 'exists' : 'null'}, Players: ${this.players ? this.players.length : 0}`);

    // Draw stars background (optimizado según configuración)
    this.drawStars();

    if (this.gameState === 'playing' && this.player) {
        // LogManager.log('info', '=== DRAWING GAME ELEMENTS ===');

        // Draw Earth in the background
        this.drawEarth();

                    // Draw satellites (solo si está habilitado)
        if (this.performanceSettings.enableSatellites) {
            this.satellites.forEach(satellite => this.drawSatellite(satellite));
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
                this.ctx.fillText(displayName, screenPos.x + player.width / 2, screenPos.y - 10);
            }
        });

        // Draw player separately - ensure it's always drawn
        if (this.player && this.player.health > 0) {
            // LogManager.log('info', '=== DRAWING PLAYER ===');
            this.drawPlayer();
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
    this.renderSkillsWidget();
  }

  drawCentralSafeZone() {
    const zone = this.centralSafeZone;
    const screenPos = this.worldToScreen(zone.x, zone.y);
    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([12, 8]);
    this.ctx.strokeRect(screenPos.x, screenPos.y, zone.width, zone.height);
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(screenPos.x, screenPos.y, zone.width, zone.height);
    this.ctx.globalAlpha = 1.0;
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "ZONA SEGURA NEUTRAL",
      screenPos.x + zone.width / 2,
      screenPos.y + 30,
    );
    this.ctx.restore();
  }

  drawCentralStation() {
    // Dibuja una estación espacial estilo pixel art con paneles solares tipo H
    const baseX = this.worldSize / 2;
    const baseY = this.worldSize / 2;
    const pixel = 18;
    // Sprite con paneles solares azules y estructura central
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
      1: "#bbbbbb", // gris claro
      2: "#ffffff", // blanco
      3: "#00bfff", // azul panel solar
      4: "#ff6600", // naranja detalles centrales
    };
    const offsetX = baseX - (sprite[0].length / 2) * pixel;
    const offsetY = baseY - (sprite.length / 2) * pixel;
    for (let y = 0; y < sprite.length; y++) {
      for (let x = 0; x < sprite[0].length; x++) {
        const val = sprite[y][x];
        if (val) {
          const color = colors[val];
          const screen = this.worldToScreen(
            offsetX + x * pixel,
            offsetY + y * pixel,
          );
          this.ctx.fillStyle = color;
          this.ctx.fillRect(screen.x, screen.y, pixel, pixel);
          this.ctx.strokeStyle = "#888";
          this.ctx.strokeRect(screen.x, screen.y, pixel, pixel);
        }
      }
    }
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
    this.clans.forEach((clan, index) => {
      const screenPos = this.worldToScreen(clan.base.x, clan.base.y);
      const pixel = 12;

      // Different station designs for each faction
      let sprite, colors;

      switch (index) {
        case 0: // Federación Terrestre - Military station
          sprite = [
            [0, 0, 3, 3, 3, 3, 0, 0],
            [0, 3, 1, 1, 1, 1, 3, 0],
            [3, 1, 2, 2, 2, 2, 1, 3],
            [3, 1, 2, 4, 4, 2, 1, 3],
            [3, 1, 2, 4, 4, 2, 1, 3],
            [3, 1, 2, 2, 2, 2, 1, 3],
            [0, 3, 1, 1, 1, 1, 3, 0],
            [0, 0, 3, 3, 3, 3, 0, 0],
          ];
          colors = {
            1: "#bbbbbb",
            2: "#ffffff",
            3: "#0066ff",
            4: "#ff6600",
          };
          break;
        case 1: // Alianza Marciana - Red station
          sprite = [
            [0, 0, 3, 3, 0, 0],
            [0, 3, 1, 1, 3, 0],
            [3, 1, 2, 2, 1, 3],
            [3, 1, 2, 2, 1, 3],
            [0, 3, 1, 1, 3, 0],
            [0, 0, 3, 3, 0, 0],
          ];
          colors = {
            1: "#bbbbbb",
            2: "#ffffff",
            3: "#ff3333",
          };
          break;
        case 2: // Confederación Lunar - Green station
          sprite = [
            [0, 3, 3, 0],
            [3, 1, 1, 3],
            [3, 1, 1, 3],
            [0, 3, 3, 0],
          ];
          colors = {
            1: "#bbbbbb",
            3: "#33ff33",
          };
          break;
        case 3: // Imperio Joviano - Yellow station
          sprite = [
            [0, 0, 3, 3, 3, 0, 0],
            [0, 3, 1, 1, 1, 3, 0],
            [3, 1, 2, 2, 2, 1, 3],
            [3, 1, 2, 2, 2, 1, 3],
            [0, 3, 1, 1, 1, 3, 0],
            [0, 0, 3, 3, 3, 0, 0],
          ];
          colors = {
            1: "#bbbbbb",
            2: "#ffffff",
            3: "#ffff33",
          };
          break;
      }

      const offsetX = screenPos.x - (sprite[0].length / 2) * pixel;
      const offsetY = screenPos.y - (sprite.length / 2) * pixel;

      for (let y = 0; y < sprite.length; y++) {
        for (let x = 0; x < sprite[0].length; x++) {
          const val = sprite[y][x];
          if (val) {
            const color = colors[val];
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
              offsetX + x * pixel,
              offsetY + y * pixel,
              pixel,
              pixel,
            );
            this.ctx.strokeStyle = "#888";
            this.ctx.strokeRect(
              offsetX + x * pixel,
              offsetY + y * pixel,
              pixel,
              pixel,
            );
          }
        }
      }

      // Draw station name
      this.ctx.fillStyle = clan.color;
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(clan.name, screenPos.x, screenPos.y + 80);
      this.ctx.font = "10px Arial";
      this.ctx.fillText(clan.faction, screenPos.x, screenPos.y + 95);
    });
  }

  drawSatellite(satellite) {
    const screenPos = this.worldToScreen(satellite.x, satellite.y);

    // Draw satellite body
    this.ctx.fillStyle = "#cccccc";
    this.ctx.fillRect(screenPos.x - 8, screenPos.x - 4, 16, 8);

    // Draw solar panels
    this.ctx.fillStyle = "#00bfff";
    this.ctx.fillRect(screenPos.x - 20, screenPos.y - 2, 8, 4);
    this.ctx.fillRect(screenPos.x + 12, screenPos.y - 2, 8, 4);

    // Draw antenna
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y - 4);
    this.ctx.lineTo(screenPos.x, screenPos.y - 12);
    this.ctx.stroke();

    // Draw blinking light
    if (Math.floor(Date.now() / 500) % 2) {
      this.ctx.fillStyle = "#ffff00";
      this.ctx.fillRect(screenPos.x - 2, screenPos.y - 2, 4, 4);
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

  updateSatellites() {
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
  iframe.src = "market.html";
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
