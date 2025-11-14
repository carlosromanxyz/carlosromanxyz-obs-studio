# YouTube Carousel Widget - Adaptado del Portfolio

## Concepto (basado en carlosromanxyz-portfolio-2025)

Carrusel de **videos de YouTube embebidos en pantalla completa** que rotan automáticamente con transiciones de **fade**. Similar al componente del portfolio pero adaptado a pure HTML/Vanilla JS.

---

## Diferencias Clave con el Portfolio

| Portfolio (Next.js/React) | OBS Studio (Pure HTML) |
|---------------------------|------------------------|
| Embla Carousel library | Pure CSS/JS transitions |
| Framer Motion animations | CSS keyframes + transitions |
| Supabase realtime | localStorage + polling |
| React hooks | Vanilla JavaScript |
| API routes | Static localStorage |

---

## Diseño Visual

```
PANTALLA COMPLETA (1920x1080)

┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│     ┌────────────────────────────────────────────┐      │
│     │                                            │      │
│     │                                            │      │
│     │       VIDEO YOUTUBE EMBEBIDO              │      │
│     │          (1920 x 1080)                    │      │
│     │           autoplay + muted                │      │
│     │                                            │      │
│     │                                            │      │
│     │                                            │      │
│     └────────────────────────────────────────────┘      │
│                                                          │
│  🔴 EN VIVO  |  SANTIAGO     ← Indicador (top-left)    │
│                                con fade cuando cambia   │
│                                                          │
└──────────────────────────────────────────────────────────┘

Video 1 (opacity: 1)
   ↓ (después de 10s)
fade out (0.5s) → opacity: 0
   ↓
Video 2 opacity: 0 → fade in (0.5s) → opacity: 1
   ↓ (después de 10s)
fade out (0.5s) → opacity: 0
   ↓
Video 3... (ciclo infinito)
```

---

## Estructura HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>YouTube Carousel</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-transparent m-0 overflow-hidden">

  <!-- Carousel Container (Fullscreen) -->
  <div id="youtube-carousel" class="fixed inset-0 w-full h-full">

    <!-- Slide 1 -->
    <div class="carousel-slide active" data-index="0">
      <iframe
        src="https://www.youtube-nocookie.com/embed/VIDEO_ID_1?autoplay=1&mute=1&controls=0&loop=1&playlist=VIDEO_ID_1"
        class="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Slide 2 -->
    <div class="carousel-slide" data-index="1">
      <iframe
        src="https://www.youtube-nocookie.com/embed/VIDEO_ID_2?autoplay=1&mute=1&controls=0&loop=1&playlist=VIDEO_ID_2"
        class="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Slide 3... -->
  </div>

  <!-- Location Indicator (overlay on top) -->
  <div id="location-indicator" class="fixed top-32 left-28 z-40">
    <div class="flex rounded-lg border-2 border-brand-primary overflow-hidden bg-gradient-to-t from-zinc-900 to-black">
      <span class="bg-gradient-to-t from-brand-dark to-brand-accent uppercase text-white px-8 py-2 text-2xl font-semibold">
        EN VIVO
      </span>
      <span id="location-text" class="bg-gradient-to-t from-black to-zinc-900 text-white px-8 py-2 text-2xl">
        SANTIAGO
      </span>
    </div>
  </div>

</body>
</html>
```

---

## CSS para Transiciones

```css
/* Carousel slide transitions */
.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0);
  pointer-events: none;
}

.carousel-slide.active {
  opacity: 1;
  pointer-events: auto;
}

/* Location indicator fade */
#location-indicator {
  transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

#location-indicator.fade-out {
  opacity: 0;
}

/* Aspect ratio responsive positioning */
#location-indicator.aspect-16-9 {
  left: 112px; /* left-28 */
}

#location-indicator.aspect-4-3 {
  left: 384px; /* left-96 */
}
```

---

## JavaScript Logic

```javascript
// Config
const DEFAULT_CONFIG = {
  isVisible: false,
  intervalSeconds: 10,
  currentIndex: 0,
  videos: [
    { videoId: 'dQw4w9WgXcQ', location: 'SANTIAGO' },
    { videoId: 'oHg5SJYRHA0', location: 'VALPARAÍSO' },
    { videoId: '9bZkp7q19f0', location: 'CONCEPCIÓN' }
  ]
}

// Global state
let currentIndex = 0
let intervalId = null
let slides = []

// Load config
function loadConfig() {
  const saved = localStorage.getItem('obs-youtube-carousel-config')
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG
}

// Load global config for aspect ratio
function loadGlobalConfig() {
  const saved = localStorage.getItem('obs-global-config')
  return saved ? JSON.parse(saved) : { aspectRatio: '16:9' }
}

// Initialize carousel
function initCarousel() {
  const config = loadConfig()
  const globalConfig = loadGlobalConfig()

  slides = document.querySelectorAll('.carousel-slide')

  if (!config.isVisible || slides.length === 0) {
    document.getElementById('youtube-carousel').classList.add('hidden')
    return
  }

  // Apply aspect ratio to location indicator
  const indicator = document.getElementById('location-indicator')
  indicator.className = globalConfig.aspectRatio === '4:3'
    ? 'fixed top-32 left-96 z-40'
    : 'fixed top-32 left-28 z-40'

  // Start autoplay
  startAutoplay(config.intervalSeconds)
}

// Transition to next slide
function nextSlide() {
  const config = loadConfig()

  // Fade out current
  slides[currentIndex].classList.remove('active')

  // Update index
  currentIndex = (currentIndex + 1) % slides.length

  // Update location with fade
  updateLocation(config.videos[currentIndex].location)

  // Fade in next (after a small delay to ensure clean transition)
  setTimeout(() => {
    slides[currentIndex].classList.add('active')
  }, 100)
}

// Update location indicator with fade
function updateLocation(newLocation) {
  const indicator = document.getElementById('location-indicator')
  const locationText = document.getElementById('location-text')

  // Fade out
  indicator.classList.add('fade-out')

  // Update text after fade out
  setTimeout(() => {
    locationText.textContent = newLocation
    indicator.classList.remove('fade-out')
  }, 500)
}

// Start autoplay
function startAutoplay(intervalSeconds) {
  if (intervalId) {
    clearInterval(intervalId)
  }

  intervalId = setInterval(() => {
    nextSlide()
  }, intervalSeconds * 1000)
}

// Stop autoplay
function stopAutoplay() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Apply config changes
function applyConfig() {
  const config = loadConfig()
  const globalConfig = loadGlobalConfig()

  const carousel = document.getElementById('youtube-carousel')
  const indicator = document.getElementById('location-indicator')

  if (config.isVisible) {
    carousel.classList.remove('hidden')
    indicator.classList.remove('hidden')
    startAutoplay(config.intervalSeconds)
  } else {
    carousel.classList.add('hidden')
    indicator.classList.add('hidden')
    stopAutoplay()
  }

  // Update aspect ratio positioning
  indicator.className = globalConfig.aspectRatio === '4:3'
    ? 'fixed top-32 left-96 z-40'
    : 'fixed top-32 left-28 z-40'
}

// Listen for config changes
window.addEventListener('storage', (e) => {
  if (e.key === 'obs-youtube-carousel-config' || e.key === 'obs-global-config') {
    applyConfig()
  }
})

// Polling fallback
setInterval(() => {
  applyConfig()
}, 1000)

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initCarousel()
})
```

---

## localStorage Config Structure

```javascript
{
  isVisible: false,
  intervalSeconds: 10,
  currentIndex: 0,
  videos: [
    {
      videoId: 'dQw4w9WgXcQ',      // YouTube video ID
      location: 'SANTIAGO',        // Location text for indicator
      isEnabled: true              // Can disable individual videos
    },
    {
      videoId: 'oHg5SJYRHA0',
      location: 'VALPARAÍSO',
      isEnabled: true
    }
  ]
}
```

---

## Controller UI (Unified Controller)

```html
<!-- YouTube Carousel Accordion -->
<div class="border border-zinc-700 rounded-lg overflow-hidden">
  <div class="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 transition-colors">
    <span class="text-sm font-medium flex-1 cursor-pointer" onclick="toggleAccordion('youtube')">
      YouTube Carousel
    </span>
    <!-- Toggle Switch -->
    <label class="relative cursor-pointer">
      <input
        type="checkbox"
        id="youtube-carousel-toggle"
        class="sr-only peer"
        onchange="handleYoutubeCarouselToggle(this.checked)"
      >
      <div class="w-11 h-6 bg-zinc-600 peer-checked:bg-brand-primary..."></div>
    </label>
    <!-- Chevron -->
    <svg id="youtube-chevron" class="w-4 h-4...">...</svg>
  </div>

  <!-- Content -->
  <div id="youtube-content" class="bg-zinc-800/50 border-t border-zinc-700 hidden">
    <div class="p-3 space-y-3">

      <!-- Interval Setting -->
      <label class="block">
        <span class="text-sm text-zinc-300">Intervalo (segundos)</span>
        <input
          type="number"
          id="youtube-interval"
          min="5"
          max="60"
          value="10"
          onchange="handleIntervalChange(this.value)"
          class="w-full mt-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
        >
      </label>

      <!-- Videos List -->
      <div class="space-y-2">
        <span class="text-sm text-zinc-300 font-medium">Videos configurados (3)</span>

        <!-- Video Item -->
        <div class="flex items-center gap-2 p-2 bg-zinc-700/50 rounded">
          <input type="checkbox" checked class="w-4 h-4">
          <div class="flex-1">
            <div class="text-sm text-white">Santiago - dQw4w9WgXcQ</div>
          </div>
          <button class="text-red-400 hover:text-red-300">
            <svg class="w-4 h-4"><!-- trash icon --></svg>
          </button>
        </div>

        <!-- Add button -->
        <button
          onclick="handleAddVideo()"
          class="w-full px-3 py-2 bg-brand-primary hover:bg-brand-accent text-black font-medium rounded"
        >
          + Agregar Video
        </button>
      </div>

    </div>
  </div>
</div>
```

---

## Widget Module (youtube-carousel-widget.js)

```javascript
const DEFAULT_YOUTUBE_CONFIG = {
  isVisible: false,
  intervalSeconds: 10,
  currentIndex: 0,
  videos: []
}

function loadYoutubeCarouselConfig() {
  const saved = localStorage.getItem('obs-youtube-carousel-config')
  return saved ? JSON.parse(saved) : DEFAULT_YOUTUBE_CONFIG
}

function saveYoutubeCarouselConfig(config) {
  localStorage.setItem('obs-youtube-carousel-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('youtube-carousel-config-updated', {
    detail: config
  }))
}

function handleYoutubeCarouselToggle(checked) {
  const config = loadYoutubeCarouselConfig()
  config.isVisible = checked
  saveYoutubeCarouselConfig(config)
}

function handleIntervalChange(value) {
  const config = loadYoutubeCarouselConfig()
  config.intervalSeconds = parseInt(value)
  saveYoutubeCarouselConfig(config)
}

function handleAddVideo() {
  const videoId = prompt('ID del video de YouTube:')
  const location = prompt('Ubicación:')

  if (videoId && location) {
    const config = loadYoutubeCarouselConfig()
    config.videos.push({
      videoId,
      location,
      isEnabled: true
    })
    saveYoutubeCarouselConfig(config)
    refreshVideosList()
  }
}

function initYoutubeCarouselWidget() {
  const config = loadYoutubeCarouselConfig()
  document.getElementById('youtube-carousel-toggle').checked = config.isVisible
  document.getElementById('youtube-interval').value = config.intervalSeconds
  refreshVideosList()
}
```

---

## Implementación Simplificada

Esta adaptación mantiene la esencia del portfolio:
- ✅ Videos de YouTube fullscreen embebidos
- ✅ Transiciones fade puras (CSS)
- ✅ Rotación automática
- ✅ Indicador "EN VIVO" + ubicación con fade
- ✅ Soporte aspect ratio (16:9 / 4:3)
- ✅ Pure HTML/Vanilla JS (sin dependencias)
- ✅ localStorage para config
- ✅ Polling fallback

**Diferencia principal**: En lugar de Embla Carousel, usamos CSS transitions + vanilla JS para controlar las transiciones.

---

## Próximos Pasos

1. ¿Te gusta este enfoque adaptado?
2. ¿Procedemos con la implementación?
3. ¿Algún ajuste al diseño o funcionalidad?
