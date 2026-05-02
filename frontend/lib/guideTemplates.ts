export interface GuideTemplate {
  id: string
  name: string
  category: string
  difficulty: string
  content: string
}

export const GUIDE_TEMPLATES: GuideTemplate[] = [
  {
    id: 'builds',
    name: 'Guía de Build',
    category: 'BUILDS',
    difficulty: 'INTERMEDIO',
    content: `<h1>Build de [Personaje] - Guía Completa</h1>

<h2>Introducción</h2>
<p>Esta guía explica el build óptimo para <strong>[Personaje]</strong>, orientado a <strong>[PvP / PvE / Misiones]</strong>. Funciona bien desde el nivel [XX] en adelante.</p>

<h2>Estadísticas Objetivo</h2>
<ul>
  <li><strong>Ataque:</strong> [valor mínimo recomendado]</li>
  <li><strong>Defensa:</strong> [valor mínimo recomendado]</li>
  <li><strong>Velocidad:</strong> [valor mínimo recomendado]</li>
  <li><strong>Chakra:</strong> [valor mínimo recomendado]</li>
</ul>

<h2>Equipamiento Recomendado</h2>
<ul>
  <li><strong>Arma:</strong> [nombre del arma] — por [razón]</li>
  <li><strong>Armadura:</strong> [nombre] — por [razón]</li>
  <li><strong>Accesorio 1:</strong> [nombre] — por [razón]</li>
  <li><strong>Accesorio 2:</strong> [nombre] — por [razón]</li>
</ul>

<h2>Habilidades Esenciales</h2>
<ol>
  <li><strong>[Habilidad 1]:</strong> Úsala para [objetivo]. Nivel recomendado: [XX]</li>
  <li><strong>[Habilidad 2]:</strong> Úsala para [objetivo]. Nivel recomendado: [XX]</li>
  <li><strong>[Habilidad 3]:</strong> Úsala para [objetivo]. Nivel recomendado: [XX]</li>
</ol>

<h2>Rotación de Combate</h2>
<ol>
  <li>Abrir con [Habilidad X] para [efecto]</li>
  <li>Continuar con [Habilidad Y] cuando [condición]</li>
  <li>Finalizar con [Habilidad Z] para [efecto]</li>
</ol>

<h2>Matchups</h2>
<p><strong>Favorable contra:</strong> [tipos de enemigos] — porque [razón]</p>
<p><strong>Difícil contra:</strong> [tipos de enemigos] — porque [razón]</p>

<h2>Consejos Finales</h2>
<ul>
  <li>[Tip 1]</li>
  <li>[Tip 2]</li>
  <li>[Tip 3]</li>
</ul>`,
  },
  {
    id: 'pvp',
    name: 'Estrategia PvP',
    category: 'PVP',
    difficulty: 'AVANZADO',
    content: `<h1>Guía PvP: [Estrategia / Personaje]</h1>

<h2>¿Para quién es esta guía?</h2>
<p>Esta guía es para jugadores que ya dominan los básicos y quieren escalar en el ranking de PvP. Requiere nivel [XX]+ y conocer el sistema de combate.</p>

<h2>Principios Fundamentales</h2>
<ul>
  <li><strong>Posicionamiento:</strong> [explicación de cómo posicionarte]</li>
  <li><strong>Timing:</strong> [cuándo atacar, cuándo defender]</li>
  <li><strong>Recursos:</strong> [cómo administrar chakra / habilidades]</li>
</ul>

<h2>Build Óptimo para PvP</h2>
<ul>
  <li><strong>Prioridad de stats:</strong> [Velocidad > Ataque > etc.]</li>
  <li><strong>Equipo recomendado:</strong> [lista de items]</li>
  <li><strong>Habilidades activas:</strong> [lista con niveles recomendados]</li>
</ul>

<h2>Combos Principales</h2>
<ol>
  <li><strong>Combo de apertura:</strong> [Habilidad A] → [Habilidad B] → [Habilidad C]</li>
  <li><strong>Combo de seguimiento:</strong> [cuando el rival hace X, responder con Y]</li>
  <li><strong>Combo de cierre:</strong> [para rematar rivales con poca vida]</li>
</ol>

<h2>Cómo Jugar Contra [Arquetipo Rival]</h2>
<p>Si te enfrentás a [tipo de rival], la clave es <strong>[estrategia específica]</strong>. Evitá usar [habilidad] porque [razón].</p>

<h2>Errores Comunes a Evitar</h2>
<ul>
  <li>❌ [Error 1] — esto pasa cuando [situación]</li>
  <li>❌ [Error 2] — solución: [cómo evitarlo]</li>
  <li>❌ [Error 3] — solución: [cómo evitarlo]</li>
</ul>

<h2>Progresión Recomendada</h2>
<p>Para mejorar en PvP, seguí este orden: [paso 1] → [paso 2] → [paso 3]</p>`,
  },
  {
    id: 'pve',
    name: 'Guía de Misión / PvE',
    category: 'MISIONES',
    difficulty: 'INTERMEDIO',
    content: `<h1>[Nombre de la Misión / Dungeon / Jefe] - Guía Completa</h1>

<h2>Descripción</h2>
<p>Esta guía cubre <strong>[nombre del contenido]</strong>. Es una misión de tipo [tipo] disponible [frecuencia / condición de acceso].</p>

<h2>Requisitos para Intentarlo</h2>
<ul>
  <li><strong>Nivel mínimo:</strong> [XX]</li>
  <li><strong>Poder de combate recomendado:</strong> [XXXXX]+</li>
  <li><strong>Items necesarios:</strong> [lista de consumibles o equipos]</li>
  <li><strong>Formación recomendada:</strong> [tipo de equipo: tanque, DPS, soporte]</li>
</ul>

<h2>Mecánicas Clave</h2>
<ul>
  <li><strong>[Mecánica 1]:</strong> Aparece cuando [condición]. Hay que [acción].</li>
  <li><strong>[Mecánica 2]:</strong> Aparece cuando [condición]. Hay que [acción].</li>
  <li><strong>[Mecánica 3]:</strong> Es peligrosa porque [razón]. Contrarrestala con [solución].</li>
</ul>

<h2>Estrategia por Fase</h2>
<h3>Fase 1 (0%-60% HP)</h3>
<p>[Descripción de la fase y qué hacer]</p>

<h3>Fase 2 (60%-30% HP)</h3>
<p>[Cambios en el jefe y cómo adaptarse]</p>

<h3>Fase Final (30%-0% HP)</h3>
<p>[Ataques especiales y cómo sobrevivir para el cierre]</p>

<h2>Recompensas</h2>
<ul>
  <li><strong>Drop garantizado:</strong> [item]</li>
  <li><strong>Drop posible:</strong> [item] (X% de probabilidad)</li>
  <li><strong>Experiencia:</strong> [cantidad aproximada]</li>
</ul>

<h2>Tips Adicionales</h2>
<ul>
  <li>[Tip 1: consejo específico útil]</li>
  <li>[Tip 2: qué NO hacer]</li>
  <li>[Tip 3: truco para optimizar]</li>
</ul>`,
  },
  {
    id: 'tutorial',
    name: 'Tutorial Paso a Paso',
    category: 'GENERAL',
    difficulty: 'BASICO',
    content: `<h1>Cómo [Hacer algo específico en el juego]</h1>

<h2>¿Qué vas a aprender?</h2>
<p>En esta guía vas a aprender a <strong>[objetivo concreto]</strong>. Al terminar vas a poder [beneficio para el jugador].</p>

<h2>Antes de empezar</h2>
<p>Necesitás tener:</p>
<ul>
  <li>Nivel [XX] o superior</li>
  <li>[Item o recurso necesario]</li>
  <li>[Otro requisito si aplica]</li>
</ul>

<h2>Paso 1: [Nombre del primer paso]</h2>
<p>Primero, andá a <strong>[lugar / menú]</strong> y hacé click en <strong>[opción]</strong>.</p>
<p>Deberías ver [qué aparece en pantalla]. Si no lo ves, [qué verificar].</p>

<h2>Paso 2: [Nombre del segundo paso]</h2>
<p>[Instrucción clara]. Asegurate de [detalle importante].</p>

<h2>Paso 3: [Nombre del tercer paso]</h2>
<p>[Instrucción clara]. Esto puede tardar [tiempo aproximado].</p>

<h2>Paso 4: [Nombre del cuarto paso]</h2>
<p>[Instrucción clara]. Una vez hecho esto, vas a ver [resultado esperado].</p>

<h2>¿Cómo saber si lo hiciste bien?</h2>
<p>Si todo salió bien, deberías ver <strong>[indicador de éxito]</strong>. Tu [stat / item / progreso] debería mostrar [valor esperado].</p>

<h2>Problemas Frecuentes</h2>
<ul>
  <li><strong>Problema:</strong> [síntoma] → <strong>Solución:</strong> [qué hacer]</li>
  <li><strong>Problema:</strong> [síntoma] → <strong>Solución:</strong> [qué hacer]</li>
</ul>`,
  },
]
