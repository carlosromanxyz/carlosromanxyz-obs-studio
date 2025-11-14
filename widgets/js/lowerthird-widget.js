/**
 * Lower Third Widget Controller
 */

// Config por defecto
const DEFAULT_LOWERTHIRD_CONFIG = {
  textFirstLine: 'CARLOS ROMÁN',
  textSecondLine: 'full stack developer',
  isVisible: false,
  duration: 0  // 0 = no auto-hide, otherwise milliseconds
}

// Cargar config desde localStorage
function loadLowerthirdConfig() {
  const saved = localStorage.getItem('obs-lowerthird-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_LOWERTHIRD_CONFIG
}

// Guardar config en localStorage
function saveLowerthirdConfig(config) {
  localStorage.setItem('obs-lowerthird-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('lowerthird-config-updated', {
    detail: config
  }))
}

// Handler para toggle de visibilidad
function handleLowerthirdToggle(checked) {
  const config = loadLowerthirdConfig()
  config.isVisible = checked
  saveLowerthirdConfig(config)
  console.log('Lower Third - Visible:', checked)
}

// Handler para cambio de texto primera línea
function handleTextFirstLineInput(value) {
  const config = loadLowerthirdConfig()
  config.textFirstLine = value
  saveLowerthirdConfig(config)
  console.log('Lower Third - First Line:', value)
}

// Handler para cambio de texto segunda línea
function handleTextSecondLineInput(value) {
  const config = loadLowerthirdConfig()
  config.textSecondLine = value
  saveLowerthirdConfig(config)
  console.log('Lower Third - Second Line:', value)
}

// Handler para cambio de duración
function handleDurationChange(value) {
  const duration = parseInt(value)
  if (isNaN(duration) || duration < 0) {
    alert('La duración debe ser un número mayor o igual a 0')
    return
  }

  const config = loadLowerthirdConfig()
  config.duration = duration
  saveLowerthirdConfig(config)
  console.log('Lower Third - Duration:', duration)
}

// Inicializar widget
function initLowerthirdWidget() {
  const config = loadLowerthirdConfig()

  // Set initial toggle state
  const toggle = document.getElementById('lowerthird-toggle')
  if (toggle) {
    toggle.checked = config.isVisible
  }

  // Set initial text values
  const firstLineInput = document.getElementById('lowerthird-first-line')
  if (firstLineInput) {
    firstLineInput.value = config.textFirstLine
  }

  const secondLineInput = document.getElementById('lowerthird-second-line')
  if (secondLineInput) {
    secondLineInput.value = config.textSecondLine
  }

  // Set initial duration
  const durationInput = document.getElementById('lowerthird-duration')
  if (durationInput) {
    durationInput.value = config.duration
  }

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-lowerthird-config')) {
    saveLowerthirdConfig(config)
  }

  console.log('Lower Third widget initialized')
}
