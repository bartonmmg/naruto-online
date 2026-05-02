# 👤 Setup: Crear Usuarios de Prueba

## Opción 1: Usando el Script TypeScript (Recomendado)

### Paso 1: Ejecutar el script
```bash
cd backend
npm run dev  # Si no está corriendo ya

# En otra terminal:
npx ts-node create-test-users.ts
```

### Paso 2: Confirmar creación
```bash
# Verás en consola:
✅ Admin user created/updated:
   Email: admin@demo.local
   Username: admin_demo
   Role: ADMIN

✅ Regular user created/updated:
   Email: user@demo.local
   Username: demo_user
   Role: USER

🎉 Test users ready for testing!
```

---

## Opción 2: Registrar por UI

Si prefieres hacerlo manualmente a través de la interfaz:

### Crear usuario ADMIN:
1. Ir a `http://localhost:3000/auth/register`
2. Llenar formulario:
   - **Username:** admin_demo
   - **Email:** admin@demo.local
   - **Password:** Admin123!@#
   - **Repetir Password:** Admin123!@#
3. Click "Registrarse"
4. Necesita actualización manual en BD (ver Opción 3)

### Crear usuario regular:
1. Ir a `http://localhost:3000/auth/register`
2. Llenar formulario:
   - **Username:** demo_user
   - **Email:** user@demo.local
   - **Password:** User123!@#
   - **Repetir Password:** User123!@#
3. Click "Registrarse"
4. ¡Listo! Este usuario ya funciona como USER

---

## Opción 3: Actualización Manual en BD (SQLite)

Si ya registraste el admin por UI pero necesitas darle rol ADMIN:

### Paso 1: Abrir Prisma Studio
```bash
cd backend
npm run dev  # Backend corriendo

# En otra terminal:
npx prisma studio
```

### Paso 2: En la UI de Prisma Studio
1. Click en tabla "User"
2. Buscar usuario "admin_demo"
3. Cambiar campo `role` de "USER" a "ADMIN"
4. Click "Save"

### O directamente en SQLite:
```bash
# Abrir SQLite CLI
sqlite3 backend/prisma/dev.db

# Ejecutar SQL:
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@demo.local';

# Verificar:
SELECT username, email, role FROM User;

# Salir:
.quit
```

---

## ✅ Credenciales de Acceso

Una vez creados, usa estas credenciales para login:

### Admin
```
Email:    admin@demo.local
Password: Admin123!@#
```

### Usuario Regular
```
Email:    user@demo.local
Password: User123!@#
```

---

## 🧪 Verificación

### Paso 1: Login como Admin
1. Ir a `http://localhost:3000/auth/login`
2. Email: `admin@demo.local`
3. Password: `Admin123!@#`
4. Click "Entrar"
5. Deberías ser redirigido a `/dashboard`
6. En navbar deberías ver opción "Nueva Guía" (solo para ADMIN/MOD)

### Paso 2: Login como User Regular
1. Logout del admin (si aún estás logueado)
2. Ir a `http://localhost:3000/auth/login`
3. Email: `user@demo.local`
4. Password: `User123!@#`
5. Click "Entrar"
6. Deberías ser redirigido a `/dashboard`
7. En navbar NO deberías ver opción "Nueva Guía"

### Paso 3: Probar Features

Como ADMIN:
- ✅ Crear guía
- ✅ Asignar badges a guías
- ✅ Eliminar comentarios
- ✅ Editar cualquier guía

Como USER:
- ✅ Ver guías
- ✅ Votar útil/no útil
- ✅ Escribir comentarios
- ❌ No puede crear guía
- ❌ No puede asignar badges
- ❌ No puede eliminar comentarios

---

## 🔐 Seguridad en Testing

### ⚠️ IMPORTANTE:
- Estas credenciales son **SOLO para desarrollo local**
- Nunca usar en producción
- Cambiar contraseña si se exponen
- Base de datos de prueba se reinicia frecuentemente

### Credenciales Seguras en Producción:
- Usar contraseñas fuertes (>12 caracteres, mayúsculas, números, símbolos)
- No compartir credenciales por chat
- Usar 2FA si es posible
- Rotar contraseñas cada 3 meses

---

## 🚀 Próximas Pruebas Recomendadas

Con los usuarios creados, ejecuta este flujo de testing:

### 1. Como ADMIN:
```
1. Crear guía desde template
2. Asignar badge "OFFICIAL"
3. Verificar aparece en listing
4. Ver comentario de usuario regular
5. Eliminar comentario inapropiado
```

### 2. Como USER:
```
1. Abrir guía
2. Verificar vista se cuenta (header)
3. Recargar → verifica que NO sume vista extra
4. Votar útil → verifica contador aumenta
5. Escribir comentario
6. Intentar eliminar → botón no aparece (esperado)
7. Logout → login con otro usuario
8. Ver comentario del anterior usuario
```

### 3. Test de Vistas:
```
1. Usuario A abre guía → viewCount = X
2. Usuario A recarga → viewCount = X (sin cambios) ✅
3. Usuario B abre anónimo → viewCount = X+1 ✅
4. Usuario B recarga anónimo → viewCount = X+2 ✅
5. Usuario C login y abre → viewCount = X+3 ✅
6. Usuario C recarga → viewCount = X+3 (sin cambios) ✅
```

---

## 📞 Troubleshooting

### Problema: "Usuario ya existe"
**Solución:** El usuario ya fue creado. Login con sus credenciales.

### Problema: "Role sigue siendo USER"
**Solución:** Ejecuta actualización manual:
```bash
sqlite3 backend/prisma/dev.db "UPDATE User SET role='ADMIN' WHERE email='admin@demo.local';"
```

### Problema: Prisma Studio no abre
**Solución:** Verifica que el backend esté corriendo:
```bash
npm run dev --workspace=backend
```

### Problema: Contraseña incorrecta
**Solución:** Recrear usuario. Contraseña debe ser exactamente:
- Admin: `Admin123!@#`
- User: `User123!@#`

---

**Documento:** Setup Usuarios de Prueba
**Fecha:** 2 Mayo 2026
**Estado:** Listo para testing ✅
