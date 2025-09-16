// Lógica de acceso a la base de datos PostgreSQL usando pg
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function getUsers() {
  const res = await pool.query('SELECT id, username, email FROM users');
  return res.rows;
}

// Puedes agregar más funciones reutilizables aquí para otros endpoints
