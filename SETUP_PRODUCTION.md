# Setup Production (Render + Netlify)

## 1. Database Setup (Render PostgreSQL)

### Crear PostgreSQL en Render:
1. Ve a https://dashboard.render.com
2. Click en "New +" → "PostgreSQL"
3. Configura:
   - Name: `naruto-online-db` (o similar)
   - Database: `naruto_db`
   - User: `postgres`
   - Region: Selecciona la más cercana
   - Plan: Free tier está bien para empezar

### Obtener CONNECTION STRING:
4. Una vez creada, copia la "Internal Database URL"
5. Formato: `postgresql://user:password@host:5432/database`

## 2. Configurar Render Backend

### Agregar DATABASE_URL:
1. Ve a tu servicio backend en Render
2. Settings → Environment → Add Environment Variable
3. Key: `DATABASE_URL`
4. Value: (pega la conexión string de PostgreSQL)
5. Agrega también:
   - `JWT_SECRET`: alguna cadena aleatoria ≥32 caracteres (ej: `your-random-jwt-secret-min-32-chars-long`)
   - `FRONTEND_URL`: `https://naruto-online.netlify.app`
   - `NODE_ENV`: `production`

### Deploy:
6. Click en "Manual Deploy" o espera a que detecte el push
7. El build corrará migrations automáticamente

## 3. Configurar Netlify Frontend

### Agregar NEXT_PUBLIC_API_URL (Opcional):
1. Ve a https://app.netlify.com/sites/naruto-online/settings
2. Build & Deploy → Environment (si está disponible)
3. Agrega: `NEXT_PUBLIC_API_URL = https://naruto-online.onrender.com`

**Nota:** Si no está disponible, el fallback automático en `lib/config.ts` lo maneja.

## 4. Test

### Verificar Backend está UP:
```bash
curl https://naruto-online.onrender.com/health
```

### Verificar Frontend:
```bash
curl https://naruto-online.netlify.app
```

### Probar Register:
1. Ve a https://naruto-online.netlify.app/auth/register
2. Regístrate
3. Debería redirigir a `/dashboard`

## Troubleshooting

**Error: "the URL must start with protocol `file://`"**
- DATABASE_URL está vacío o configurado para SQLite
- Solución: Configurar CONNECTION STRING de PostgreSQL

**Error: "Cannot connect to database"**
- La IP de Render no puede acceder a la base de datos
- Solución: Usar "Internal Database URL" en lugar de "External"

**Error: "relation does not exist"**
- Las migrations no corrieron
- Solución: Render debería correr automáticamente. Si no:
  ```bash
  cd backend && npx prisma migrate deploy
  ```

## Desarrollo Local

Para desarrollo, usa SQLite:
```bash
# .env.local en backend/
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Variables de Entorno Requeridas

### Backend (.env en Render)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: ≥32 caracteres aleatorios
- `FRONTEND_URL`: https://naruto-online.netlify.app
- `BACKEND_PORT`: 4000 (default)
- `NODE_ENV`: production

### Frontend (.env.local en desarrollo)
- `NEXT_PUBLIC_API_URL`: http://localhost:4000 (dev) o https://naruto-online.onrender.com (prod)

---
**Última actualización:** 2026-04-12
