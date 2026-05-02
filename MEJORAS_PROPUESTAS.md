# 💡 Mejoras Propuestas para Sección de Guías

Documento de propuestas de features futuras para expandir la sección de guías basado en análisis de UX y engagement.

---

## 🎯 Mejoras Propuestas por Prioridad

### 📍 FASE 1: Corto Plazo (2-3 semanas)

#### 1. **Vista Previa en Tiempo Real (Preview Split)**
**Complejidad:** Media | **Impacto:** Alto | **Usuarios:** Autores

- **Problema:** Autores no ven cómo se vería la guía antes de publicar
- **Solución:** Editor + Preview lado a lado en `/guides/create`
- **Especificación:**
  - Split 50/50 en desktop (izquierda editor, derecha preview)
  - Full editor en móvil con botón "Previsualizar"
  - Preview actualiza en tiempo real mientras edita
  - Botón "Copiar HTML" para preview
- **Beneficio:** +25% mejor calidad de guías
- **Estimado:** 6-8 horas desarrollo

#### 2. **Sistema de Reacciones Rápidas (Emojis)**
**Complejidad:** Baja | **Impacto:** Medio | **Usuarios:** Todos

- **Problema:** Comentarios son formales, falta engagement rápido
- **Solución:** Reacciones tipo Discord (❤️, 🔥, 👏, 😂, 🤔)
- **Ubicación:** Final de cada guía o como alternativa a votación
- **Especificación:**
  - Click emoji → Toggle on/off
  - Mostrar conteo al lado
  - Múltiples emojis por usuario
  - Tooltip con nombres de usuarios que reaccionaron
- **Beneficio:** +50% más engagement, menos fricción
- **Estimado:** 4-6 horas desarrollo

#### 3. **Guías Destacadas / Top Trending**
**Complejidad:** Baja | **Impacto:** Medio | **Usuarios:** Todos

- **Problema:** No hay forma de descubrir guías buenas rápidamente
- **Solución:** Algoritmo simple: `score = (vistas * 0.3) + (comentarios * 0.4) + (votos_útil * 0.3)`
- **Ubicación:** 
  - Top 5 en sidebar derecho de `/guides`
  - "Trending esta semana" carrusel
  - "Recomendado para ti" basado en categoría preferida
- **Especificación:**
  - Cachear cálculo cada 6 horas
  - Mostrar 3 líneas máximo
  - Link directo a guía
- **Beneficio:** +30% mejor descubrimiento
- **Estimado:** 4-5 horas desarrollo

#### 4. **Editor Markdown Mejorado - Tablero**
**Complejidad:** Media | **Impacto:** Medio | **Usuarios:** Autores

- **Problema:** No hay forma fácil de insertar tablas en markdown
- **Solución:** Botón en toolbar que abre modal para crear tabla
- **Especificación:**
  - Modal con inputs: filas, columnas
  - Preview de tabla mientras escribes
  - Genera markdown table: `| Header | Header |`
  - Botón "Insertar"
- **Beneficio:** +40% más guías con tablas (comparativas, builds)
- **Estimado:** 3-4 horas desarrollo

---

### 📍 FASE 2: Mediano Plazo (1 mes)

#### 5. **Notificaciones al Autor**
**Complejidad:** Media | **Impacto:** Alto | **Usuarios:** Autores

- **Problema:** Autores no saben cuándo reciben comentarios o actualización de badges
- **Solución:** Sistema de notificaciones in-app + opcional email
- **Eventos que notifican:**
  - Nuevo comentario en la guía
  - Asignación de badge (OFFICIAL, TRENDING, etc.)
  - Guía alcanza 100 vistas
  - Nuevo voto útil (cada 10?)
- **Especificación:**
  - Badge rojo en navbar con número de notificaciones
  - Dropdown lista de notificaciones
  - Email diario resumen (opcional)
  - Link directo a guía desde notificación
- **Beneficio:** +60% retención de autores
- **Estimado:** 10-12 horas desarrollo

#### 6. **Historial de Cambios Visual (Diff)**
**Complejidad:** Alta | **Impacto:** Medio | **Usuarios:** Autores + Mods

- **Problema:** No se ve qué cambió exactamente entre versiones
- **Solución:** Diff visual estilo GitHub con colores rojo/verde
- **Ubicación:** Modal que aparece desde "Historial" en detail page
- **Especificación:**
  - Click en historial → selecciona dos versiones
  - Muestra diff línea por línea
  - Rojo = removido, Verde = agregado
  - Botón "Revertir a esta versión" para ADMIN
  - Comentario automático: "Revertida por @admin a versión del 1-May"
- **Beneficio:** Mejor transparencia y control
- **Estimado:** 12-15 horas desarrollo

#### 7. **Dashboard de Analytics para Autores**
**Complejidad:** Alta | **Impacto:** Alto | **Usuarios:** Autores

- **Problema:** Autores no saben performance de sus guías
- **Solución:** Dashboard personalizado en `/dashboard/guides`
- **Especificación:**
  - Gráfico vistas última semana (líneas)
  - Gráfico comentarios vs votos (barras)
  - Tabla: Guía | Vistas | Comentarios | Rating | Badges
  - Card: Guía con más vistas, Guía con mejor rating, Total vistas
  - Filtro por período (semana, mes, año)
  - Export a CSV
- **Beneficio:** +40% engagement, motivación para crear más
- **Estimado:** 15-18 horas desarrollo

#### 8. **Sistema de Suscripción a Guías**
**Complejidad:** Media | **Impacto:** Medio | **Usuarios:** Lectores

- **Problema:** Usuarios no saben cuándo se actualiza una guía
- **Solución:** Botón "Suscribirse" para notificarse de actualizaciones
- **Especificación:**
  - Botón "🔔 Suscribirse" en header de guía
  - Notificación cuando autor actualiza (email + in-app)
  - Notificación cuando se agrega nuevo comentario (toggle)
  - Listar suscriptores en admin panel
  - Opción "Notificar suscriptores" antes de actualizar
- **Beneficio:** Mejor fidelización de lectores
- **Estimado:** 8-10 horas desarrollo

---

### 📍 FASE 3: Largo Plazo (2+ meses)

#### 9. **Colaboración entre Autores**
**Complejidad:** Muy Alta | **Impacto:** Alto | **Usuarios:** Autores

- **Problema:** Guías complejas necesitan múltiples perspectivas
- **Solución:** Co-autores con permisos granulares
- **Especificación:**
  - Rol "editor" (puede editar contenido)
  - Rol "revisor" (puede comentar pero no editar)
  - Historial muestra quién editó qué
  - Lock sections para evitar conflictos
  - Chat integrado en editor
- **Beneficio:** +50% calidad de guías complejas
- **Estimado:** 25-30 horas desarrollo

#### 10. **Sistema de Traducción Multi-idioma**
**Complejidad:** Muy Alta | **Impacto:** Medio | **Usuarios:** Comunidad internacional

- **Problema:** Solo en español, limita a ~50M de jugadores
- **Solución:** Framework para traducciones (inglés prioritario)
- **Especificación:**
  - Botón selector de idioma en navbar
  - En /guides: filtro por idioma
  - Autor puede marcar "Necesita traducción"
  - Community translators pueden agregar traducción
  - Badges: "Traducción oficial", "Community translation"
  - Sync updates: Si se actualiza ES, notifica a traductores
- **Beneficio:** +200% alcance potencial
- **Estimado:** 40-50 horas desarrollo

#### 11. **Integración Social & Embeds**
**Complejidad:** Media | **Impacto:** Medio | **Usuarios:** Todos

- **Problema:** Guías no son fácil de compartir
- **Solución:** Open Graph + Embed widget para Discord
- **Especificación:**
  - Meta tags OG: título, description, imagen
  - Link preview en Discord muestra imagen + descripción
  - Widget embebible: `<iframe src="app.com/guides/123/embed">`
  - Botón "Compartir en Discord"
  - Botón "Generar QR" para compartir en móvil
- **Beneficio:** +30% tráfico orgánico desde redes
- **Estimado:** 6-8 horas desarrollo

#### 12. **Sistema de Reportes y Moderación**
**Complejidad:** Alta | **Impacto:** Medio | **Usuarios:** Mods + Comunidad

- **Problema:** No hay forma de reportar guías inapropiadas
- **Solución:** Sistema de reportes con cola de moderación
- **Especificación:**
  - Botón "Reportar" en cada guía
  - Modal: razón (spam, inapropiado, incorrecto, etc.)
  - Admin dashboard mostrando reportes pendientes
  - Acciones: Archivo, Advertencia al autor, Ocultar, Ban guía
  - Notificación al autor si se oculta con razón
  - Sistema de apelación
- **Beneficio:** Comunidad más sana
- **Estimado:** 12-15 horas desarrollo

---

## 📊 Matriz de Priorización

| Feature | Complejidad | Impacto | Esfuerzo | Prioridad |
|---------|:-:|:-:|:-:|:-:|
| Preview Split | 🟡 | 🟢 | 6h | **P1** |
| Reacciones Emojis | 🟢 | 🟡 | 4h | **P1** |
| Top Trending | 🟢 | 🟡 | 4h | **P1** |
| Tabla Markdown | 🟡 | 🟡 | 3h | **P1** |
| Notificaciones | 🟡 | 🟢 | 10h | **P2** |
| Diff Visual | 🔴 | 🟡 | 12h | **P2** |
| Analytics | 🔴 | 🟢 | 16h | **P2** |
| Suscripción | 🟡 | 🟡 | 8h | **P2** |
| Colaboración | 🔴 | 🟢 | 28h | **P3** |
| Traducción | 🔴 | 🟡 | 45h | **P3** |
| Social Embeds | 🟡 | 🟡 | 7h | **P3** |
| Reportes | 🔴 | 🟡 | 14h | **P3** |

---

## 💰 Estimación de ROI

### Phase 1 (17-23 horas)
- **Tiempo:** ~1 semana (1 dev)
- **Usuarios Beneficiados:** 100% (todas las mejoras)
- **ROI Esperado:** +35% engagement en primer mes

### Phase 2 (56-73 horas)
- **Tiempo:** ~2 semanas (1 dev)
- **Usuarios Beneficiados:** +40% (enfoque en retención)
- **ROI Esperado:** +60% guías nuevas por mes

### Phase 3 (124-158 horas)
- **Tiempo:** ~4 semanas (1 dev)
- **Usuarios Beneficiados:** +200% (nuevo mercado)
- **ROI Esperado:** +300% alcance global

---

## 🎨 Diseño & UX Considerations

- Mantener dark theme Akatsuki en todos los nuevos components
- Usar colores existentes: chakra-blue, accent-orange, power-red, nature-green, sage-gold
- Iconos de lucide-react para consistencia
- Responsive: mobile-first, después desktop
- Accesibilidad: WCAG 2.1 AA mínimo
- Dark mode nativo (ya implementado)

---

## ✅ Checklist para Implementación

- [ ] Establecer prioridades con stakeholders
- [ ] Crear issues en GitHub con especificaciones
- [ ] Asignar a desarrolladores
- [ ] Crear branches: `feat/guides-*`
- [ ] Implementar con TDD
- [ ] Code review antes de merge
- [ ] Testing manual + automatizado
- [ ] Documentar cambios en CLAUDE.md
- [ ] Actualizar UI docs con nuevos components
- [ ] Notificar a users en Discord/announcements

---

**Documento creado:** 2 Mayo 2026
**Propuestas:** 12 features  
**Estimación total:** ~160-180 horas desarrollo
**Impacto esperado:** +100% engagement, +50% guías nuevas, +200% alcance

---
