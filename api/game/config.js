import { getGameConfig } from '../../../backend/game';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { serverId, wallet } = req.query;
    try {
      const config = await getGameConfig(serverId, wallet);
      res.status(200).json(config);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener configuración del juego' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
