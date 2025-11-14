/**
 * YouTube Carousel Widget Controller
 */

// Config por defecto
const DEFAULT_YOUTUBE_CONFIG = {
  isVisible: false,
  intervalSeconds: 10,
  videos: [
    // Example videos (disabled by default)
    // { videoId: 'dQw4w9WgXcQ', location: 'SANTIAGO', isEnabled: false },
    // { videoId: 'oHg5SJYRHA0', location: 'VALPARAÍSO', isEnabled: false }
  ]
}

// Cargar config desde localStorage
function loadYoutubeConfig() {
  const saved = localStorage.getItem('obs-youtube-carousel-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_YOUTUBE_CONFIG
}

// Guardar config en localStorage
function saveYoutubeConfig(config) {
  localStorage.setItem('obs-youtube-carousel-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('youtube-config-updated', {
    detail: config
  }))
}

// Handler para toggle principal
function handleYoutubeToggle(checked) {
  const config = loadYoutubeConfig()
  config.isVisible = checked
  saveYoutubeConfig(config)
  console.log('YouTube Carousel - Visible:', checked)
}

// Handler para cambio de intervalo
function handleYoutubeIntervalChange(value) {
  const interval = parseInt(value)
  if (interval < 5 || interval > 60) {
    alert('El intervalo debe estar entre 5 y 60 segundos')
    return
  }

  const config = loadYoutubeConfig()
  config.intervalSeconds = interval
  saveYoutubeConfig(config)
  console.log('YouTube Carousel - Interval:', interval)
}

// Handler para agregar video
function handleYoutubeAddVideo() {
  const videoId = prompt('ID del video de YouTube:\n(Ejemplo: dQw4w9WgXcQ de https://youtube.com/watch?v=dQw4w9WgXcQ)')

  if (!videoId) return

  // Validar formato básico de video ID (11 caracteres alfanuméricos)
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    alert('El ID del video no parece válido. Debe tener 11 caracteres.')
    return
  }

  const location = prompt('Ubicación para mostrar:\n(Ejemplo: SANTIAGO, VALPARAÍSO, etc.)')

  if (!location) return

  const config = loadYoutubeConfig()
  config.videos.push({
    videoId: videoId.trim(),
    location: location.trim().toUpperCase(),
    isEnabled: true
  })

  saveYoutubeConfig(config)
  refreshYoutubeVideosList()
  console.log('YouTube Carousel - Video added:', videoId, location)
}

// Handler para eliminar video
function handleYoutubeRemoveVideo(index) {
  if (!confirm('¿Eliminar este video del carrusel?')) return

  const config = loadYoutubeConfig()
  config.videos.splice(index, 1)
  saveYoutubeConfig(config)
  refreshYoutubeVideosList()
  console.log('YouTube Carousel - Video removed at index:', index)
}

// Handler para toggle de video individual
function handleYoutubeVideoToggle(index, checked) {
  const config = loadYoutubeConfig()
  if (config.videos[index]) {
    config.videos[index].isEnabled = checked
    saveYoutubeConfig(config)
    console.log('YouTube Carousel - Video toggled:', index, checked)
  }
}

// Refrescar lista de videos en el UI
function refreshYoutubeVideosList() {
  const config = loadYoutubeConfig()
  const container = document.getElementById('youtube-videos-list')
  const countEl = document.getElementById('youtube-count')

  if (!container || !countEl) return

  // Update count
  countEl.textContent = config.videos.length

  // Clear container
  container.innerHTML = ''

  if (config.videos.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-zinc-400 text-center py-4">
        No hay videos configurados.<br>
        Haz clic en "Agregar Video" para comenzar.
      </div>
    `
    return
  }

  // Render each video
  config.videos.forEach((video, index) => {
    const videoItem = document.createElement('div')
    videoItem.className = 'flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition-colors'

    videoItem.innerHTML = `
      <input
        type="checkbox"
        ${video.isEnabled !== false ? 'checked' : ''}
        onchange="handleYoutubeVideoToggle(${index}, this.checked)"
        class="w-4 h-4 text-brand-primary bg-zinc-600 border-zinc-500 rounded focus:ring-brand-primary focus:ring-2"
      >
      <div class="flex-1 min-w-0">
        <div class="text-sm text-white truncate">${video.location || 'Sin ubicación'}</div>
        <div class="text-xs text-zinc-400 truncate font-mono">${video.videoId}</div>
      </div>
      <button
        onclick="handleYoutubeRemoveVideo(${index})"
        class="text-red-400 hover:text-red-300 transition-colors"
        title="Eliminar video"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    `

    container.appendChild(videoItem)
  })
}

// Inicializar widget
function initYoutubeWidget() {
  const config = loadYoutubeConfig()

  // Set initial toggle state
  const toggle = document.getElementById('youtube-toggle')
  if (toggle) {
    toggle.checked = config.isVisible
  }

  // Set initial interval
  const intervalInput = document.getElementById('youtube-interval')
  if (intervalInput) {
    intervalInput.value = config.intervalSeconds
  }

  // Render videos list
  refreshYoutubeVideosList()

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-youtube-carousel-config')) {
    saveYoutubeConfig(config)
  }

  console.log('YouTube Carousel widget initialized')
}
