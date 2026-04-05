# Naruto Online 🥋

Plataforma de comunidad para Naruto Online con sistema de XP, niveles y herramientas.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Prisma ORM)
- **Autenticación:** JWT + bcrypt
- **Styling:** Tailwind CSS

## 📋 Requisitos previos

- Node.js 18+ (usar nvm recomendado)
- npm o yarn
- PostgreSQL (local o Neon.tech para gratuito)

## 🛠️ Setup inicial

### 1. Clonar y entrar en el proyecto

```bash
cd naruto-app
```

### 2. Instalar dependencias (monorepo)

```bash
npm install
```

Esto instala deps en backend/ y frontend/ automáticamente.

### 3. Configurar variables de entorno

**Backend** - Crear `backend/.env`:
**Frontend** - Crear `frontend/.env.local`:

### 4. Configurar base de datos

### 5. Levantar el servidor

## 📁 Estructura del Proyecto

```
naruto-app/
├── backend/                    # API Express + Prisma
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── lib/
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
│
├── frontend/                   # Next.js + Tailwind
│   ├── app/
│   │   ├── page.tsx           # Landing
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   └── login/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/                # Button, Input
│   │   └── auth/              # AuthCard
│   └── .env.local
│
└── package.json              # Workspace root
```

## ✨ Features Futuro

- [ ] Sistema de misiones diarias
- [ ] Logros y badges
- [ ] Clanes/Aldeas
- [ ] Foros comunitarios
- [ ] Notificaciones push
- [ ] Avatar custom

---

**Hecho con 🧡 para la comunidad**
# Force rebuild
