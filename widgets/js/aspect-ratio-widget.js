/**
 * Global Aspect Ratio Controller
 * Manages aspect ratio settings for all overlays (16:9 vs 4:3 safe zones)
 */

// Config por defecto
const DEFAULT_GLOBAL_CONFIG = {
  aspectRatio: '16:9' // '16:9' or '4:3'
}

// Cargar config global desde localStorage
function loadGlobalConfig() {
  const saved = localStorage.getItem('obs-global-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_GLOBAL_CONFIG
}

// Guardar config global en localStorage
function saveGlobalConfig(config) {
  localStorage.setItem('obs-global-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('global-config-updated', {
    detail: config
  }))
  console.log('Global config updated:', config)
}

// Handler para cambio de aspect ratio (toggle)
function handleAspectRatioToggle(checked) {
  const config = loadGlobalConfig()
  config.aspectRatio = checked ? '4:3' : '16:9'
  saveGlobalConfig(config)
  updateAspectRatioLabel(checked)
  console.log('Aspect ratio changed to:', config.aspectRatio)
}

// Actualizar label del toggle
function updateAspectRatioLabel(is43) {
  const label = document.getElementById('aspect-ratio-label')
  if (label) {
    if (is43) {
      label.textContent = 'Activado - 4:3 Safe zone'
    } else {
      label.textContent = 'Desactivado - 16:9 Widescreen'
    }
  }
}

// Inicializar widget de aspect ratio
function initAspectRatioWidget() {
  const config = loadGlobalConfig()

  // Set initial toggle state
  const toggle = document.getElementById('aspect-ratio-toggle')
  const is43 = config.aspectRatio === '4:3'

  if (toggle) {
    toggle.checked = is43
    updateAspectRatioLabel(is43)
  }

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-global-config')) {
    saveGlobalConfig(config)
  }
}
