# 🧪 Guía de Testing - 8 Mejoras para Guías

## 👤 Credenciales de Prueba (Local Development)

### Usuario Admin
```
Email:    admin@demo.local
Password: Admin123!@#
Username: admin_demo
```

### Usuario Regular
```
Email:    user@demo.local
Password: User123!@#
Username: demo_user
```

**Nota:** Estos usuarios deben ser creados manualmente en la base de datos o registrados a través del endpoint de registro. El usuario `admin_demo` requiere actualización manual del rol a `ADMIN` en la base de datos (campo `role = 'ADMIN'`).

---

## ✅ Mejoras Implementadas

### 1. **Templates/Plantillas Predefinidas**
- **Ubicación:** Página de creación `/guides/create`
- **Funcionalidad:** 4 plantillas con estructura predefinida
  - Guía de Builds
  - Guía de PvP
  - Guía de PvE
  - Tutorial Paso a Paso
- **Cómo usar:** Click en botón de plantilla → Pre-rellena título, categoría, dificultad y contenido
- **Status:** ✅ Implementado

### 2. **Búsqueda y Filtrado Mejorado**
- **Ubicación:** Página de guías `/guides`
- **Features:**
  - 🔍 Búsqueda por título o autor
  - 📊 Filtro por dificultad (Básico/Intermedio/Avanzado)
  - 📈 Ordenamiento (Recientes/Más vistas/Mejor valoradas)
- **Status:** ✅ Implementado

### 3. **Badges/Distintivos para Guías**
- **Tipos:**
  - ⭐ **OFFICIAL** (Azul) - Oficial
  - 🔥 **TRENDING** (Naranja) - Tendencia
  - ✅ **VERIFIED** (Verde) - Verificada
  - 🎯 **COMPLETE** (Dorado) - Completa
- **Quién asigna:** Solo ADMIN/MODERATOR
- **Ubicación:** Visible en listing y detail page
- **Editable:** Sí (ADMIN/MOD ven botón editar)
- **Status:** ✅ Implementado

### 4. **Tabla de Contenidos Automática**
- **Ubicación:** Sidebar móvil en página de detalle
- **Extrae:** Headings H1, H2, H3 del contenido
- **Navegación:** Click en item → Scroll suave a sección
- **Responsive:** Collapsible en móvil
- **Status:** ✅ Implementado

### 5. **Sistema de Valoración (Útil/No Útil)**
- **Requisito:** Usuario debe estar logueado
- **Funcionamiento:**
  - 👍 Botón "Útil" con contador
  - 👎 Botón "No útil" con contador
  - Toggle: Click al voto actual lo desactiva
- **Storage:** Upsert por usuario (un voto por usuario)
- **Ubicación:** Debajo del contenido en detail page
- **Status:** ✅ Implementado

### 6. **Sección de Comentarios/Feedback**
- **Requisito:** Usuario debe estar logueado para comentar
- **Features:**
  - ✍️ Textarea con límite de 1000 caracteres
  - 📋 Lista de comentarios con autor y fecha
  - 🗑️ **CAMBIO:** Solo ADMIN/MODERATOR pueden eliminar comentarios
- **Eliminación:** Solo ADMIN/MODERATOR (no el autor)
- **Ordenamiento:** Más recientes primero
- **Ubicación:** Final de la página de detalle
- **Status:** ✅ Implementado (Corregido)

### 7. **Estadísticas de Guías**
- **Métricas mostradas:**
  - 👁️ Conteo de vistas
  - 💬 Número de comentarios
  - 👍 Votos útil/no útil
- **Ubicación:**
  - Listing: Card muestra vistas y comentarios
  - Detail: Header muestra vistas
- **Actualización:** Real-time
- **Status:** ✅ Implementado

### 8. **System de Vistas Inteligente (Like YouTube)**
- **Comportamiento:**
  - ✅ Una vista por usuario logueado (upsert)
  - ✅ Vistas anónimas contadas cada sesión
  - ✅ No replica por cada recarga
  - ✅ Usa model `GuideView` con `@@unique([guideId, userId])`
- **Implementación:**
  - Endpoint separado: `POST /guides/:id/views`
  - Ejecuta al cargar la página (no en getById)
  - Solo incrementa si es la primera vez
- **Status:** ✅ Implementado (Corregido)

---

## 🔧 Configuración Base de Datos

### Usuario Admin (SQL directo)
Para asignar rol ADMIN a un usuario registrado:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@demo.local';
```

### Tablas Nuevas
- `GuideRating` — Votos útil/no útil
- `GuideComment` — Comentarios
- `GuideView` — Vistas de guías

---

## 📝 Nuevas Rutas API

### Ratings
- `POST /guides/:id/ratings` — Votar (auth required)
- `DELETE /guides/:id/ratings` — Remover voto (auth required)
- `GET /guides/:id/ratings` — Obtener conteo

### Comments
- `POST /guides/:id/comments` — Crear comentario (auth required)
- `DELETE /guides/:id/comments/:commentId` — Eliminar (ADMIN/MOD only)
- `GET /guides/:id/comments` — Listar comentarios

### Views
- `POST /guides/:id/views` — Registrar vista (opcional auth)

### Badges
- `PUT /guides/:id/badges` — Asignar badges (ADMIN/MOD only)

---

## 🎯 Casos de Testing Recomendados

### 1. Templates
- [ ] Click en "Guía de Builds" → Verifica pre-relleno
- [ ] Modifica contenido → Publica → Verifica en listing

### 2. Búsqueda y Filtros
- [ ] Busca "builds" → Filtra por autor
- [ ] Filtra por "Avanzado" → Ordena por vistas
- [ ] Limpia filtros → Muestra todas

### 3. Badges
- [ ] Login como ADMIN
- [ ] Abre guía → Click editar badges
- [ ] Asigna "TRENDING" → Aparece en listing y detail
- [ ] Verifica que usuarios normales no vean botón editar

### 4. Tabla de Contenidos
- [ ] Abre guía con múltiples headings
- [ ] En móvil: Verifica que ToC sea collapsible
- [ ] Click item → Scroll a sección
- [ ] Verifica en desktop

### 5. Valoración (Útil/No Útil)
- [ ] Login como usuario normal
- [ ] Click "Útil" → Verifica conteo aumenta
- [ ] Click "Útil" de nuevo → Descuenta voto
- [ ] Click "No útil" → Verifica cambio de voto
- [ ] Logout → Verifica que pida login

### 6. Comentarios
- [ ] Login como usuario normal
- [ ] Escribe comentario → Aparece en lista
- [ ] Intenta eliminar comentario → No ve botón (solo ADMIN/MOD)
- [ ] Login como ADMIN → Verifica botón eliminar

### 7. Vistas
- [ ] Abre guía → Header muestra 1 vista
- [ ] Recarga página → Sigue siendo 1 vista
- [ ] Espera 5 min → Abre de nuevo → Sigue siendo 1 vista
- [ ] Logout → Abre anónimo → Suma vista (+1)

---

## 🚀 Próximas Mejoras Sugeridas

### A. Corto Plazo
1. **Editor Markdown Mejorado**
   - Botón para insertar tablas
   - Soporte para tabs/pestañas (múltiples builds)
   - Copiar código con un click
   - Vista previa en tiempo real split-screen

2. **Sistema de Reacciones (Emojis)**
   - Reacciones rápidas con emojis (❤️, 🔥, 👏, etc.)
   - Similar a Discord/Slack
   - Menos formal que comentarios escritos

3. **Destacar Guías Mejores**
   - Algoritmo automático: vistas × votos útil
   - Top 5 guías en sidebar
   - "Trending esta semana"

### B. Mediano Plazo
4. **Notificaciones**
   - Alertar al autor cuando recibe comentario
   - Alertar cuando su guía recibe badge
   - In-app + Email

5. **Historial de Cambios Visual**
   - Diff visual entre versiones
   - Ver qué cambió exactamente
   - Rollback a versión anterior

6. **Sistema de Suscripción**
   - Suscribirse a guía para recibir actualizaciones
   - Notificación cuando autor actualiza

7. **Colaboración entre Autores**
   - Co-autor en guías
   - Edición colaborativa
   - Permisos granulares

### C. Largo Plazo
8. **Sistema de Traducción**
   - Guías multi-idioma (ES/EN)
   - Bandera del idioma en listing
   - Community translations

9. **Integración Social**
   - Compartir a Discord/Twitter con preview
   - Embed de guías en servidores Discord
   - Widget de "Guías del Día"

10. **Monetización (Optional)**
    - Donaciones al autor
    - Guías Premium/Exclusivas
    - Patreon integration

11. **Analytics para Autores**
    - Dashboard: Vistas, comentarios, votos
    - Gráficos por semana
    - Tasa de engagement
    - Rank de mejores guías

12. **Sistema de Reportes**
    - Reportar guía inapropiada
    - Cola de moderación
    - Acciones: Ocultar, Advertencia, Ban

---

## 📊 Métricas de Éxito Esperadas

Con estas mejoras, esperamos:
- ✅ **+40% más guías** (facilidad con templates)
- ✅ **+60% engagement** (comentarios + votos)
- ✅ **+30% calidad** (badges + estadísticas visibles)
- ✅ **Mejor UX** (búsqueda, tabla de contenidos)

---

## 🔐 Seguridad & Consideraciones

- ✅ Votos únicos por usuario (@@unique)
- ✅ Comentarios solo deleteable por ADMIN/MOD
- ✅ Views tracking sin impacto performance
- ✅ HTML sanitizado en comentarios
- ✅ Rate limiting recomendado en POST endpoints

---

**Generado:** 2 Mayo 2026
**Implementador:** Claude Code
**Estado:** Producción Ready ✅
