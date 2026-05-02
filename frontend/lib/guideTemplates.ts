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
    name: 'Guía de Builds',
    category: 'BUILDS',
    difficulty: 'INTERMEDIO',
    content: `<h1>Título del Build</h1>
<h2>Introducción</h2>
<p>Describe brevemente el propósito y características principales de este build.</p>

<h2>Equipamiento</h2>
<p>Detalla los equipos recomendados para este build:</p>
<ul>
  <li>Arma principal: [Tu arma aquí]</li>
  <li>Armadura: [Tu armadura aquí]</li>
  <li>Accesorios: [Tus accesorios aquí]</li>
</ul>

<h2>Habilidades</h2>
<p>Las habilidades clave para este build son:</p>
<ul>
  <li>Habilidad 1: [Descripción]</li>
  <li>Habilidad 2: [Descripción]</li>
  <li>Habilidad 3: [Descripción]</li>
</ul>

<h2>Rotación de Combate</h2>
<p>El orden recomendado de ataques es:</p>
<ol>
  <li>Primer ataque</li>
  <li>Segundo ataque</li>
  <li>Tercer ataque</li>
</ol>

<h2>Matchups</h2>
<p>Esta build es efectiva contra: [enemigos]</p>
<p>Tiene dificultad contra: [enemigos]</p>

<h2>Tips y Trucos</h2>
<p>Consejos para maximizar el potencial de este build...</p>`,
  },
  {
    id: 'pvp',
    name: 'Guía de PvP',
    category: 'PVP',
    difficulty: 'AVANZADO',
    content: `<h1>Guía de PvP - [Nombre del Personaje/Estrategia]</h1>

<h2>Introducción</h2>
<p>Presenta la estrategia de PvP que vas a explicar.</p>

<h2>Estrategia General</h2>
<p>Explica los principios fundamentales de esta estrategia:</p>
<ul>
  <li>Principio 1</li>
  <li>Principio 2</li>
  <li>Principio 3</li>
</ul>

<h2>Builds Recomendados</h2>
<p>Los mejores builds para esta estrategia:</p>
<ul>
  <li>Build 1: [Descripción]</li>
  <li>Build 2: [Descripción]</li>
</ul>

<h2>Tácticas Defensivas</h2>
<p>Cómo defenderse contra estrategias opuestas...</p>

<h2>Tácticas Ofensivas</h2>
<p>Cómo atacar y presionar a los enemigos...</p>

<h2>Errores Comunes a Evitar</h2>
<p>Errores que muchos jugadores cometen en PvP:</p>
<ul>
  <li>Error 1</li>
  <li>Error 2</li>
  <li>Error 3</li>
</ul>`,
  },
  {
    id: 'pve',
    name: 'Guía de PvE',
    category: 'MISIONES',
    difficulty: 'INTERMEDIO',
    content: `<h1>Guía de PvE - [Nombre del Jefe/Dungeon]</h1>

<h2>Introducción</h2>
<p>Descripción general del contenido PvE que cubrirás.</p>

<h2>Requisitos Previos</h2>
<p>Qué necesitas antes de intentar este contenido:</p>
<ul>
  <li>Nivel mínimo: [X]</li>
  <li>Build recomendada: [Descripción]</li>
  <li>Items necesarios: [Descripción]</li>
</ul>

<h2>Jefes Principales</h2>
<p>Detalles sobre cada jefe que enfrentarás...</p>

<h2>Mecánicas Clave</h2>
<p>Las mecánicas importantes que debes conocer:</p>
<ul>
  <li>Mecánica 1: [Descripción]</li>
  <li>Mecánica 2: [Descripción]</li>
  <li>Mecánica 3: [Descripción]</li>
</ul>

<h2>Rotación de Combate</h2>
<p>La mejor secuencia de ataques para este contenido...</p>

<h2>Recompensas</h2>
<p>Qué drops y recompensas puedes esperar...</p>

<h2>Tips Finales</h2>
<p>Consejos adicionales para tener éxito...</p>`,
  },
  {
    id: 'tutorial',
    name: 'Tutorial Paso a Paso',
    category: 'GENERAL',
    difficulty: 'BASICO',
    content: `<h1>Tutorial: [Nombre del Tutorial]</h1>

<h2>Objetivo</h2>
<p>En esta guía aprenderás cómo [objetivo del tutorial].</p>

<h2>Requisitos</h2>
<p>Antes de comenzar, necesitas:</p>
<ul>
  <li>Requisito 1</li>
  <li>Requisito 2</li>
  <li>Requisito 3</li>
</ul>

<h2>Paso 1: [Primer paso]</h2>
<p>Explicación detallada del primer paso...</p>

<h2>Paso 2: [Segundo paso]</h2>
<p>Explicación detallada del segundo paso...</p>

<h2>Paso 3: [Tercer paso]</h2>
<p>Explicación detallada del tercer paso...</p>

<h2>Paso 4: [Cuarto paso]</h2>
<p>Explicación detallada del cuarto paso...</p>

<h2>Verificación</h2>
<p>Cómo saber si completaste correctamente los pasos...</p>

<h2>Próximos Pasos</h2>
<p>Qué hacer después de completar este tutorial...</p>

<h2>Solución de Problemas</h2>
<p>Si algo no funciona como se esperaba, intenta esto...</p>`,
  },
]
