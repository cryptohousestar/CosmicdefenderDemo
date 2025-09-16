import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En producción, Neon requiere SSL. En desarrollo, puede que no.
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

// --- Lógica de Niveles ---
// Define cómo se calcula el nivel basado en la experiencia.
const experienceToLevel = (experience) => {
  return Math.floor(Math.pow(experience / 100, 0.5)) + 1;
};

// --- Funciones del Backend ---

// Obtener configuración del juego y datos del usuario
export async function getGameConfig(serverId, wallet) {
  if (!serverId || !wallet) {
    throw new Error('El ID del servidor y la wallet son obligatorios');
  }

  const client = await pool.connect();
  try {
    // 1. Obtener configuración del servidor
    const serverResult = await client.query('SELECT * FROM game_servers WHERE server_id = $1', [serverId]);
    if (serverResult.rows.length === 0) {
      throw new Error(`Servidor con id '${serverId}' no encontrado`);
    }
    const serverConfig = serverResult.rows[0];

    // 2. Obtener datos del jugador o crearlo si no existe
    let playerResult = await client.query('SELECT * FROM players WHERE wallet_address = $1', [wallet]);
    let player;

    if (playerResult.rows.length === 0) {
      // El jugador no existe, lo creamos con valores por defecto
      const newPlayerResult = await client.query(
        'INSERT INTO players (wallet_address, username, level, experience) VALUES ($1, $2, $3, $4) RETURNING *',
        [wallet, `player_${wallet.slice(0, 6)}`, 1, 0]
      );
      player = newPlayerResult.rows[0];
    } else {
      player = playerResult.rows[0];
    }

    // 3. Devolver la configuración combinada
    return {
      server: {
        id: serverConfig.server_id,
        rewards: {
          starFluxPerMinute: parseFloat(serverConfig.starflux_per_minute),
          maticPerHour: parseFloat(serverConfig.matic_per_hour),
          expMultiplier: parseFloat(serverConfig.exp_multiplier),
        },
        // Estos valores pueden ser añadidos a la tabla 'game_servers' si se desea
        world: { size: { width: 8000, height: 8000 }, enemyDensity: 0.8, powerUpFrequency: 0.6, background: 'space-1' },
        features: { pvp: true, clans: true, market: true, achievements: true }
      },
      user: {
        // Estos valores pueden ser expandidos con nuevas tablas (ej: player_inventory)
        equippedNFTs: { ship: null, weapon: null, shield: null, engine: null },
        fuelStatus: { hasActiveFuel: false, bonusMultiplier: 1.0 },
        gameStats: {
          level: player.level,
          experience: parseInt(player.experience, 10),
        }
      }
    };
  } finally {
    client.release();
  }
}

// Inicializar sesión de juego (sin cambios por ahora)
export async function initializeSession(walletAddress, serverId, sessionToken) {
  return {
    walletAddress,
    serverId,
    sessionToken,
    startedAt: new Date().toISOString()
  };
}

// Guardar recompensas del usuario
export async function saveRewards(walletAddress, serverId, sessionToken, gameData) {
  if (!walletAddress || !serverId || !gameData || gameData.timePlayed === undefined) {
    throw new Error('Faltan parámetros requeridos para guardar las recompensas.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Iniciar transacción

    // 1. Obtener multiplicadores del servidor
    const serverResult = await client.query('SELECT * FROM game_servers WHERE server_id = $1', [serverId]);
    if (serverResult.rows.length === 0) {
      throw new Error(`Servidor con id '${serverId}' no encontrado`);
    }
    const serverConfig = serverResult.rows[0];

    // 2. Calcular recompensas
    const timePlayedSeconds = gameData.timePlayed;
    const starFluxEarned = (timePlayedSeconds / 60) * parseFloat(serverConfig.starflux_per_minute);
    const maticEarned = (timePlayedSeconds / 3600) * parseFloat(serverConfig.matic_per_hour);
    const experienceGained = Math.floor(timePlayedSeconds * parseFloat(serverConfig.exp_multiplier));

    // 3. Guardar la sesión de juego en la base de datos
    await client.query(
      `INSERT INTO game_sessions (player_wallet, server_id, time_played_seconds, starflux_earned, matic_earned, experience_gained)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [walletAddress, serverId, timePlayedSeconds, starFluxEarned, maticEarned, experienceGained]
    );

    // 4. Actualizar la experiencia y nivel del jugador
    const playerResult = await client.query('SELECT experience FROM players WHERE wallet_address = $1 FOR UPDATE', [walletAddress]);
    if (playerResult.rows.length === 0) {
        throw new Error('El jugador no existe. Debe llamar a getGameConfig primero.');
    }
    const currentExperience = parseInt(playerResult.rows[0].experience, 10);
    const newExperience = currentExperience + experienceGained;
    const newLevel = experienceToLevel(newExperience);

    await client.query(
      'UPDATE players SET experience = $1, level = $2 WHERE wallet_address = $3',
      [newExperience, newLevel, walletAddress]
    );

    await client.query('COMMIT'); // Finalizar transacción

    // 5. Devolver las recompensas calculadas
    return {
      timePlayed: timePlayedSeconds,
      starFluxEarned: starFluxEarned,
      maticEarned: maticEarned,
      experienceGained: experienceGained,
      newLevel: newLevel,
      newExperience: newExperience
    };

  } catch (error) {
    await client.query('ROLLBACK'); // Revertir en caso de error
    console.error('Error en saveRewards:', error);
    throw new Error('Error al guardar las recompensas');
  } finally {
    client.release();
  }
}
