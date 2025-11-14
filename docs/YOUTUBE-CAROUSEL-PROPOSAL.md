# Propuesta: YouTube Live Slideshow Widget

## Concepto General

Carrusel tipo slideshow que muestra **pantallas completas** de información de diferentes streams en vivo de YouTube. Cada pantalla ocupa todo el espacio del widget y va rotando con transiciones de **fade in/out** suaves.

---

## Diseño Visual - Pantalla Individual

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   ┌──────────────────────────────────────────────────┐   │
│   │                                                  │   │
│   │                                                  │   │
│   │                                                  │   │
│   │           Thumbnail del Stream                   │   │ ← Imagen grande (480x270px)
│   │              (16:9 ratio)                        │   │
│   │                                                  │   │
│   │                                                  │   │
│   │                                                  │   │
│   └──────────────────────────────────────────────────┘   │
│                                                           │
│   🔴 EN VIVO                                              │ ← Badge "EN VIVO" pulsante
│                                                           │
│   📺 Nombre del Canal                                     │ ← Canal en texto grande
│   Título completo del stream en vivo que se está         │ ← Título (2 líneas max)
│   transmitiendo en este momento                          │
│                                                           │
│   👁 12,345 viewers  •  ⏱ En vivo desde hace 2h 34m     │ ← Stats
│                                                           │
│                      ● ● ○ ○ ○                            │ ← Indicadores
└───────────────────────────────────────────────────────────┘
    Width: 520px / Height: ~400px
```

---

## Características Principales

### 1. **Transición Tipo Slideshow**
- Cada pantalla completa muestra un stream diferente
- **Fade out → Fade in** entre pantallas (sin slides laterales)
- Rotación automática cada 10-12 segundos
- Toda la pantalla desaparece suavemente y aparece la siguiente

### 2. **Cada Pantalla Muestra**
- **Thumbnail grande**: 480x270px (16:9) - imagen prominente del stream
- **Badge "EN VIVO"**: Rojo pulsante en la esquina
- **Nombre del canal**: Texto grande y legible
- **Título completo**: 2 líneas máximo, sin truncar agresivamente
- **Estadísticas**:
  - 👁 Viewers actuales (ej: 12,345)
  - ⏱ Tiempo en vivo (ej: "En vivo desde hace 2h 34m")
- **Indicadores**: Dots mostrando posición actual (ej: ● ● ○ ○)

### 3. **Animación de Transición**
```
Pantalla Actual                     Nueva Pantalla
     100% opacity                        0% opacity
          ↓                                  ↓
     Fade out (0.5s)                   Esperando...
          ↓                                  ↓
      0% opacity                         0% opacity
          ↓                                  ↓
      (hidden)                        Fade in (0.5s)
                                            ↓
                                       100% opacity

Total: 1s de transición suave
```

---

## Ejemplo de Secuencia de Transición

```
T=0s - Mostrando Stream #1 (CodeWithMe)
┌────────────────────────────────┐
│  [Thumbnail: Coding setup]     │
│                                │
│  🔴 EN VIVO                    │  opacity: 100%
│  📺 CodeWithMe                 │
│  Building a REST API in Go     │
│  👁 2,345  ⏱ 1h 23m           │
│        ● ○ ○                   │
└────────────────────────────────┘

T=10s - Fade out inicia
┌────────────────────────────────┐
│  [Thumbnail: Coding setup]     │
│                                │
│  🔴 EN VIVO                    │  opacity: 50%
│  📺 CodeWithMe                 │  (desapareciendo)
│  Building a REST API in Go     │
│  👁 2,345  ⏱ 1h 23m           │
│        ● ○ ○                   │
└────────────────────────────────┘

T=10.5s - Fade out completo, preparando siguiente
┌────────────────────────────────┐
│                                │
│                                │
│                                │  opacity: 0%
│         (vacío)                │  (cambio de contenido)
│                                │
│                                │
│                                │
└────────────────────────────────┘

T=10.6s - Fade in del Stream #2 inicia
┌────────────────────────────────┐
│  [Thumbnail: Gaming screen]    │
│                                │
│  🔴 EN VIVO                    │  opacity: 30%
│  📺 GamingPro                  │  (apareciendo)
│  Valorant Ranked Grind         │
│  👁 5,678  ⏱ 3h 45m           │
│        ○ ● ○                   │
└────────────────────────────────┘

T=11s - Stream #2 completamente visible
┌────────────────────────────────┐
│  [Thumbnail: Gaming screen]    │
│                                │
│  🔴 EN VIVO                    │  opacity: 100%
│  📺 GamingPro                  │
│  Valorant Ranked Grind         │
│  👁 5,678  ⏱ 3h 45m           │
│        ○ ● ○                   │
└────────────────────────────────┘

... (espera 10 segundos) ...

T=21s - Ciclo se repite hacia Stream #3
```

---

## Posicionamiento en Overlay

**Opción A - Centro derecho** (Recomendado)
```
┌──────────────────────────────────────────┐
│  🔴 EN VIVO                   Logo       │
│  SANTIAGO                                │
│                                          │
│                    ┌──────────────────┐  │
│                    │                  │  │
│                    │   [Thumbnail]    │  │
│                    │                  │  │
│                    │  🔴 EN VIVO      │  │ ← YouTube Slideshow
│                    │  📺 Canal        │  │   (pantalla completa)
│                    │  Título Stream   │  │
│                    │  👁 12K  ⏱ 2h   │  │
│                    │     ● ○ ○        │  │
│                    └──────────────────┘  │
│ 📊 Indicadores                           │
│ UF: $38,234                              │
└──────────────────────────────────────────┘
```

**Opción B - Centro pantalla**
```
┌──────────────────────────────────────────┐
│  🔴 EN VIVO                   Logo       │
│  SANTIAGO                                │
│                                          │
│         ┌────────────────────┐           │
│         │                    │           │
│         │   [Thumbnail]      │           │
│         │                    │           │
│         │  🔴 EN VIVO        │           │ ← YouTube Slideshow
│         │  📺 Canal          │           │   (centrado)
│         │  Título Stream     │           │
│         │  👁 12K  ⏱ 2h     │           │
│         │      ● ○ ○         │           │
│         └────────────────────┘           │
│ 📊 Indicadores                           │
└──────────────────────────────────────────┘
```

---

## Configuración en Controller

```
┌─────────────────────────────────────────┐
│ YouTube Live Carousel            [ON]   │ ← Toggle principal
├─────────────────────────────────────────┤
│                                         │
│ Streams configurados (3)                │
│                                         │
│ 1. ● Canal Tech - Coding Live          │
│    📊 2.3K viewers                      │
│    [Eliminar]                           │
│                                         │
│ 2. ● Gaming Pro - Valorant Ranked      │
│    📊 856 viewers                       │
│    [Eliminar]                           │
│                                         │
│ 3. ● Music 24/7 - Lofi Beats           │
│    📊 15.2K viewers                     │
│    [Eliminar]                           │
│                                         │
│ [+ Agregar Stream]                      │
│                                         │
│ ⚙ Configuración                        │
│ • Intervalo: [8] segundos               │
│ • Auto-play: [ON]                       │
│ • Mostrar viewers: [ON]                 │
│ • Mostrar duración: [ON]                │
│                                         │
│ 🔄 Actualizar datos (cada 60s)         │
│ Última actualización: 14:30:45         │
└─────────────────────────────────────────┘
```

---

## Datos a Almacenar

### localStorage: `obs-youtube-config`

```javascript
{
  isVisible: false,
  streams: [
    {
      id: 'dQw4w9WgXcQ',           // YouTube video ID
      type: 'video',                // 'video' o 'channel'
      title: 'Coding Live Stream',
      channelName: 'Canal Tech',
      thumbnail: 'https://...',
      viewers: 2345,
      duration: '2:34:15',
      isLive: true,
      lastUpdated: 1699999999999
    },
    // ... más streams
  ],
  settings: {
    interval: 8000,               // ms entre rotaciones
    autoPlay: true,
    showViewers: true,
    showDuration: true
  },
  currentIndex: 0
}
```

---

## Integración con YouTube API

### Opción 1: YouTube Data API v3 (Recomendado)
**Ventajas:**
- Datos oficiales y precisos
- Información en tiempo real
- Thumbnails de alta calidad

**Requisitos:**
- API Key de Google Cloud Console
- Cuota diaria: 10,000 unidades (suficiente para ~500 requests/día)

**Endpoints necesarios:**
- `videos.list` - Información del video/stream
- `channels.list` - Información del canal

**Costo de cuota por request:**
- `videos.list`: ~3 unidades
- Para 5 streams actualizados cada 60s: ~720 unidades/día

### Opción 2: Scraping Público (Alternativa)
**Ventajas:**
- No requiere API key
- Sin límites de cuota

**Desventajas:**
- Puede romperse si YouTube cambia su HTML
- Menos confiable
- Datos menos precisos

---

## Flujo de Datos

```
Controller                    Overlay
    │                            │
    │ User adds YouTube URL      │
    │ (video ID extracted)       │
    ├──────────────────────────► │
    │ Save to localStorage       │
    │                            │
    │                            │
    │ ◄──── Poll every 60s ───── │
    │ Fetch YouTube API          │
    │ Update stream info         │
    │ (viewers, duration, etc)   │
    ├──────────────────────────► │
    │ Save updated data          │
    │                            │
    │                            │
    │                            │ Auto-rotate every 8s
    │                            │ ──► Show next stream
    │                            │      (fade transition)
```

---

## Animaciones

### Entrada Inicial del Widget (Primera vez que aparece)
```
1. Todo el widget: fadeIn (0.8s)
   - Toda la pantalla aparece suavemente desde opacity 0 → 1

Total: 0.8s entrada suave
```

### Transición entre Pantallas (Slideshow)
```
IMPORTANTE: Solo fade, sin movimientos laterales

Pantalla Actual (Stream 1):
  opacity: 1
  ↓
  fadeOut (0.5s) → opacity: 0
  ↓
  display: none

Nueva Pantalla (Stream 2):
  display: block
  opacity: 0
  ↓
  fadeIn (0.5s) → opacity: 1

Total transición: 1s
```

### CSS Necesario
```css
.youtube-slide {
  transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

.youtube-slide.active {
  opacity: 1;
}

.youtube-slide.inactive {
  opacity: 0;
}
```

### Badge "EN VIVO" Pulsante
```
Pulse animation (2s infinite)
0%, 100%: scale(1), opacity: 1
50%: scale(1.1), opacity: 0.85

Color: #dc2626 (red-600)
```

---

## Manejo de Errores

### Stream Offline
```
┌─────────────────────────────────────┐
│  YOUTUBE LIVE                  ⚪ OFF│
├─────────────────────────────────────┤
│        ┌───────────────────┐        │
│        │                   │        │
│        │   [Offline Icon]  │        │
│        │                   │        │
│        └───────────────────┘        │
│                                     │
│  📺 Canal Tech                      │
│  Stream no disponible               │
│                                     │
│  ⚠ Stream offline o privado         │
└─────────────────────────────────────┘
```

### Sin Streams Configurados
```
┌─────────────────────────────────────┐
│  YOUTUBE LIVE                       │
├─────────────────────────────────────┤
│                                     │
│        No hay streams               │
│        configurados                 │
│                                     │
│  Configure streams desde el         │
│  controlador para comenzar          │
│                                     │
└─────────────────────────────────────┘
```

---

## Archivos a Crear

```
widgets/
├── overlays/
│   └── youtube-carousel-overlay.html
├── js/
│   ├── youtube-carousel-widget.js    # Controller logic
│   ├── youtube-api.js                # YouTube API utility
│   └── youtube-data.js               # Data fetching/caching
└── controllers/
    └── overlays-controller.html      # (actualizar con nueva sección)
```

---

## Preguntas para Decidir

1. **¿Usamos YouTube API oficial o scraping?**
   - API: Más confiable, requiere API key
   - Scraping: Sin límites, menos confiable

2. **¿Posición preferida?**
   - Opción A: Esquina inferior derecha
   - Opción B: Centro inferior
   - Otra ubicación

3. **¿Cuántos streams máximo?**
   - 3-5 streams recomendado
   - ¿Límite de 10?

4. **¿Mostrar thumbnail o solo texto?**
   - Con thumbnail (más visual, más ancho)
   - Solo texto (más compacto)

5. **¿Navegación manual en overlay?**
   - Solo en controller (más limpio)
   - También en overlay con flechas

---

## Estimación de Implementación

### Fase 1: Estructura Básica (2-3 horas)
- ✓ HTML/CSS del overlay
- ✓ Animaciones de entrada/salida
- ✓ Rotación automática básica
- ✓ Integración con unified controller

### Fase 2: YouTube Integration (2-3 horas)
- ✓ YouTube API utility
- ✓ Fetch de datos en tiempo real
- ✓ Cache y actualización periódica
- ✓ Manejo de errores

### Fase 3: Controller UI (1-2 horas)
- ✓ Formulario para agregar streams
- ✓ Lista de streams configurados
- ✓ Settings (interval, toggles)
- ✓ Preview en tiempo real

### Fase 4: Refinamiento (1 hora)
- ✓ Aspect ratio support
- ✓ Transiciones suaves
- ✓ Testing en OBS

**Total estimado: 6-9 horas**

---

## Notas Técnicas

- **GPU-Accelerated**: Solo `transform` y `opacity` en animaciones
- **Polling Strategy**: 60s para YouTube API, 1s para localStorage sync
- **Cache**: Guardar thumbnails en localStorage (base64) para reducir requests
- **Fallback**: Si API falla, mostrar última data conocida
- **Performance**: Lazy load thumbnails, solo cargar el visible

---

¿Te gusta esta propuesta? ¿Qué cambiarías o agregarías?
