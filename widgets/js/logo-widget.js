/**
 * Logo Widget Controller
 */

// Config por defecto
const DEFAULT_LOGO_CONFIG = {
  isVisible: true,
  showText: true
}

// Cargar config desde localStorage
function loadLogoConfig() {
  const saved = localStorage.getItem('obs-logo-config')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_LOGO_CONFIG
}

// Guardar config en localStorage
function saveLogoConfig(config) {
  localStorage.setItem('obs-logo-config', JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('logo-config-updated', {
    detail: config
  }))
}

// Handlers
function handleLogoVisibleToggle(checked) {
  const config = loadLogoConfig()
  config.isVisible = checked
  saveLogoConfig(config)
  console.log('Logo - Visible:', checked)
}

function handleShowTextToggle(checked) {
  const config = loadLogoConfig()
  config.showText = checked
  saveLogoConfig(config)
  console.log('Logo - Show text:', checked)
}

// Inicializar
function initLogoWidget() {
  const logoConfig = loadLogoConfig()
  document.getElementById('logo-visible-toggle').checked = logoConfig.isVisible
  document.getElementById('show-text-toggle').checked = logoConfig.showText

  // Guardar config inicial si no existe
  if (!localStorage.getItem('obs-logo-config')) {
    saveLogoConfig(logoConfig)
  }
}
