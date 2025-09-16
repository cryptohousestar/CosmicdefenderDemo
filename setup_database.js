require('dotenv').config();
const { Pool } = require('pg');

const sql = `
  CREATE TABLE players (
    wallet_address TEXT PRIMARY KEY,
    username TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    experience BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE game_servers (
    server_id TEXT PRIMARY KEY,
    starflux_per_minute DECIMAL NOT NULL DEFAULT 1,
    matic_per_hour DECIMAL NOT NULL DEFAULT 0.001,
    exp_multiplier DECIMAL NOT NULL DEFAULT 1.0
  );

  CREATE TABLE game_sessions (
    session_id SERIAL PRIMARY KEY,
    player_wallet TEXT NOT NULL REFERENCES players(wallet_address),
    server_id TEXT NOT NULL REFERENCES game_servers(server_id),
    time_played_seconds INTEGER NOT NULL,
    starflux_earned DECIMAL NOT NULL,
    matic_earned DECIMAL NOT NULL,
    experience_gained BIGINT NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL
  );

  INSERT INTO game_servers (server_id, starflux_per_minute, matic_per_hour, exp_multiplier) 
  VALUES ('main-server', 1.5, 0.002, 1.2);
`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function setupDatabase() {
  console.log('Conectando a la base de datos y creando tablas...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('¡Éxito! Las tablas han sido creadas y los datos iniciales insertados.');
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

setupDatabase();
