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

### 1. **Rotación Automática**
- Cambia de stream cada 8-10 segundos
- Transición suave con fade + slide
- Pausa automática al hacer hover (en controller)

### 2. **Información Mostrada**
- **Thumbnail**: Imagen del stream en vivo (desde YouTube API)
- **Nombre del canal**: Con icono 📺
- **Título del stream**: Truncado con "..." si es muy largo
- **Viewers en vivo**: Contador actualizado (ej: 👁 12,345)
- **Duración del stream**: Tiempo que lleva en vivo (ej: ⏱ 2:34:15)
- **Indicador LIVE**: Badge rojo pulsante

### 3. **Indicadores de Navegación**
- **Dots de paginación**: Muestran cuántos streams hay y cuál está activo
- **Navegación manual** (solo en controller): Botones anterior/siguiente

---

## Posicionamiento en Overlay

**Opción A - Esquina inferior derecha** (Recomendado)
```
┌─────────────────────────────────────┐
│  Logo            🔴 EN VIVO         │
│                  SANTIAGO           │
│                                     │
│                                     │
│                                     │
│                                     │
│ 📊 Indicadores      [YouTube] ←──  │
│ UF: $38,234         Carousel        │
│ UTM: $65,432                        │
└─────────────────────────────────────┘
```

**Opción B - Centro inferior**
```
┌─────────────────────────────────────┐
│  Logo            🔴 EN VIVO         │
│                  SANTIAGO           │
│                                     │
│                                     │
│         [YouTube Carousel]          │
│                                     │
│ 📊 Indicadores                      │
└─────────────────────────────────────┘
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

### Entrada del Widget
```
1. Container: fadeInScaleY (0.6s) desde abajo
2. Header: fadeInUp (0.5s) delay 0.2s
3. Thumbnail: fadeIn (0.5s) delay 0.4s
4. Info: fadeInUp (0.5s) delay 0.6s
5. Dots: fadeIn (0.5s) delay 0.8s

Total: 1.3s
```

### Rotación entre Streams
```
1. Fade out current (0.3s)
2. Slide out left (0.3s)
3. Slide in right new stream (0.3s)
4. Fade in new (0.3s)

Total: 0.6s overlap animation
```

### Indicador LIVE
```
Pulse scale animation (2s infinite)
0% → 100%: scale(1)
50%: scale(1.1)
Opacity: 1 → 0.8 → 1
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
