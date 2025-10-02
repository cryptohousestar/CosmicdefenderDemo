# Backend para CosmicdefenderDemo en Vercel

## Estructura
- `/api/game/config.js` — Devuelve configuración del juego y usuario (GET)
- `/api/game/session.js` — Inicializa sesión de juego (POST)
- `/api/game/rewards.js` — Guarda y responde recompensas (POST)
- `/backend/game.js` — Lógica de negocio y acceso a datos (reutilizable)

## Variables de entorno
- `DATABASE_URL` — URL de conexión a PostgreSQL (Neon, Railway, etc.)

## Migración futura
- Toda la lógica de negocio está en `/backend/` para que puedas migrar fácilmente a Express/Fastify/Docker.
- Solo deberás crear un servidor Express y reutilizar los métodos de `/backend/game.js`.

## Endpoints usados por el frontend
- `GET /api/game/config?serverId=...&wallet=...`
- `POST /api/game/session` (body: `{ walletAddress, serverId, sessionToken }`)
- `POST /api/game/rewards` (body: `{ walletAddress, serverId, sessionToken, gameData }`)

## Notas
- Puedes ampliar `/backend/game.js` para guardar y leer datos reales de la base de datos.
- El backend está listo para producción en Vercel y para migrar a cualquier otro entorno.
