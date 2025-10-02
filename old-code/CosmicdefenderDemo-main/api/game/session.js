import { initializeSession } from '../../../backend/game';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { walletAddress, serverId, sessionToken } = req.body;
      const session = await initializeSession(walletAddress, serverId, sessionToken);
      res.status(200).json({ session });
    } catch (error) {
      res.status(500).json({ error: 'Error al inicializar sesión' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
