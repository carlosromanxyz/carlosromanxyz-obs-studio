/**
 * Indicators Widget Controller
 */

// Config por defecto
const DEFAULT_INDICATORS_CONFIG = {
  isVisible: false,
  indicators: {
    uf: null,
    utm: null,
    ipc: null,
    dolar: null
  },
  lastUpdated: null,
  isLoading: false,
  errors: {}
}

// Cargar config desde localStorage
function loadIndicatorsConfig() {
  const saved = localStorage.getItem('obs-indicators-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_INDICATORS_CONFIG
}

// Guardar config en localStorage
function saveIndicatorsConfig(config) {
  localStorage.setItem('obs-indicators-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('indicators-config-updated', {
    detail: config
  }))
}

// Handlers
function handleIndicatorsToggle(checked) {
  const config = loadIndicatorsConfig()
  config.isVisible = checked
  saveIndicatorsConfig(config)
  console.log('Indicators - Visible:', checked)

  // Auto-fetch on first show if no data
  if (checked && !config.lastUpdated) {
    handleIndicatorsRefresh()
  }
}

async function handleIndicatorsRefresh() {
  const config = loadIndicatorsConfig()

  // Update loading state
  config.isLoading = true
  config.errors = {}
  saveIndicatorsConfig(config)

  // Update UI
  updateRefreshButton(true)

  try {
    // Fetch all indicators (force refresh)
    const result = await getAllIndicators(true)

    // Update config with results
    config.indicators = result.data
    config.errors = result.errors
    config.lastUpdated = Date.now()
    config.isLoading = false

    saveIndicatorsConfig(config)

    console.log('📊 Indicators refreshed:', result)

    // Show feedback
    if (result.hasErrors) {
      showRefreshFeedback('Actualizado con errores', 'warning')
    } else {
      showRefreshFeedback('Actualizado correctamente', 'success')
    }

  } catch (error) {
    config.isLoading = false
    config.errors = { general: error.message }
    saveIndicatorsConfig(config)

    console.error('Failed to refresh indicators:', error)
    showRefreshFeedback('Error al actualizar', 'error')
  } finally {
    updateRefreshButton(false)
  }
}

// Update refresh button state
function updateRefreshButton(isLoading) {
  const button = document.getElementById('indicators-refresh-btn')
  const icon = button.querySelector('svg')

  if (isLoading) {
    button.disabled = true
    icon.classList.add('animate-spin')
  } else {
    button.disabled = false
    icon.classList.remove('animate-spin')
  }
}

// Show temporary feedback message
function showRefreshFeedback(message, type = 'success') {
  const feedbackEl = document.getElementById('indicators-feedback')
  if (!feedbackEl) return

  // Set message and style
  feedbackEl.textContent = message
  feedbackEl.className = 'text-xs mt-2 transition-opacity duration-300'

  if (type === 'success') {
    feedbackEl.classList.add('text-green-400')
  } else if (type === 'warning') {
    feedbackEl.classList.add('text-yellow-400')
  } else if (type === 'error') {
    feedbackEl.classList.add('text-red-400')
  }

  // Show
  feedbackEl.style.opacity = '1'

  // Hide after 3 seconds
  setTimeout(() => {
    feedbackEl.style.opacity = '0'
  }, 3000)
}

// Update last updated timestamp display
function updateLastUpdatedDisplay() {
  const config = loadIndicatorsConfig()
  const timestampEl = document.getElementById('indicators-timestamp')

  if (!timestampEl || !config.lastUpdated) return

  const date = new Date(config.lastUpdated)
  const formatted = new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)

  timestampEl.textContent = `Última actualización: ${formatted}`
}

// Inicializar
function initIndicatorsWidget() {
  const config = loadIndicatorsConfig()
  document.getElementById('indicators-toggle').checked = config.isVisible

  // Update last updated display
  updateLastUpdatedDisplay()

  // Auto-refresh display every minute
  setInterval(updateLastUpdatedDisplay, 60000)

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-indicators-config')) {
    saveIndicatorsConfig(config)
  }
}
