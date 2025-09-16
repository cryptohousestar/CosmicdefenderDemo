import { getUsers } from '../backend/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
