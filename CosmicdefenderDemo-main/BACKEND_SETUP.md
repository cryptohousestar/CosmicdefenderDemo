# Instrucciones para el backend y base de datos

1. Crea una base de datos gratuita en Neon (https://neon.tech/).
2. Copia la URL de conexión y colócala en un archivo `.env.local` en la raíz del proyecto:
   
   DATABASE_URL=postgresql://usuario:password@host:puerto/dbname

3. Asegúrate de tener una tabla `users` en tu base de datos con al menos los campos:
   - id (serial, primary key)
   - username (text)
   - email (text)

   Puedes crearla con:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username TEXT NOT NULL,
     email TEXT NOT NULL
   );
   ```

4. Despliega el proyecto en Vercel y configura la variable de entorno `DATABASE_URL` en el dashboard de Vercel.

5. Accede a `/api/users` para ver la lista de usuarios.

6. Para migrar a otro backend en el futuro, reutiliza la lógica de `/backend/db.js` en Express/Fastify, etc.

---

Consulta ROADMAP.md para el plan completo.