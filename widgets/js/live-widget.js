/**
 * Live Widget Controller
 */

// Config por defecto
const DEFAULT_LIVE_CONFIG = {
  text: 'SANTIAGO',
  isVisible: false
}

// Cargar config desde localStorage
function loadLiveConfig() {
  const saved = localStorage.getItem('obs-live-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_LIVE_CONFIG
}

// Guardar config en localStorage
function saveLiveConfig(config) {
  localStorage.setItem('obs-live-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('live-config-updated', {
    detail: config
  }))
}

// Handlers
let liveLocationTimeout = null

function handleLiveToggle(checked) {
  const config = loadLiveConfig()
  config.isVisible = checked
  saveLiveConfig(config)
  console.log('Live - Visible:', checked)
}

function handleLiveLocationInput(value) {
  // Auto-save con debounce (800ms como en el original)
  clearTimeout(liveLocationTimeout)
  liveLocationTimeout = setTimeout(() => {
    const config = loadLiveConfig()
    config.text = value.toUpperCase()
    saveLiveConfig(config)
    console.log('Live - Location:', config.text)
  }, 800)
}

// Inicializar
function initLiveWidget() {
  const liveConfig = loadLiveConfig()
  document.getElementById('live-toggle').checked = liveConfig.isVisible
  document.getElementById('live-location-input').value = liveConfig.text

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-live-config')) {
    saveLiveConfig(liveConfig)
  }
}
