import { saveRewards } from '../../../backend/game';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { walletAddress, serverId, sessionToken, gameData } = req.body;
      const rewards = await saveRewards(walletAddress, serverId, sessionToken, gameData);
      res.status(200).json({ rewards });
    } catch (error) {
      res.status(500).json({ error: 'Error al guardar recompensas' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
