/**
 * Economic Indicators Data Utility
 * Fetches Chilean economic indicators from Boostr API with cache-first strategy
 */

const API_BASE = 'https://api.boostr.cl/economy/indicator'
const CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours (matches API cache-control)
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Indicator configuration
const INDICATORS = {
  uf: { label: 'UF', unit: '$' },
  utm: { label: 'UTM', unit: '$' },
  ipc: { label: 'IPC', unit: '%' },
  dolar: { label: 'Dólar', unit: '$' }
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp) {
  if (!timestamp) return false
  const now = Date.now()
  return (now - timestamp) < CACHE_TTL
}

/**
 * Load indicator from localStorage cache
 */
function loadFromCache(indicator) {
  try {
    const cached = localStorage.getItem(`obs-indicator-${indicator}`)
    if (!cached) return null

    const data = JSON.parse(cached)

    if (!isCacheValid(data.timestamp)) {
      localStorage.removeItem(`obs-indicator-${indicator}`)
      return null
    }

    return data
  } catch (error) {
    console.error(`Failed to load ${indicator} from cache:`, error)
    return null
  }
}

/**
 * Save indicator to localStorage cache
 */
function saveToCache(indicator, data) {
  try {
    const cacheData = {
      ...data,
      timestamp: Date.now()
    }
    localStorage.setItem(`obs-indicator-${indicator}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error(`Failed to save ${indicator} to cache:`, error)
  }
}

/**
 * Fetch single indicator from API
 */
async function fetchIndicatorFromAPI(indicator) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${API_BASE}/${indicator}.json`, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'default'
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Validate response structure
    if (!data || typeof data.value !== 'number') {
      throw new Error('Invalid API response structure')
    }

    return {
      indicator,
      value: data.value,
      unit: data.unit || INDICATORS[indicator].unit,
      date: data.date || new Date().toISOString()
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout (${REQUEST_TIMEOUT / 1000}s)`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get indicator with cache-first strategy
 * @param {string} indicator - Indicator name (uf, utm, ipc, dolar)
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} Indicator data
 */
async function getIndicator(indicator, forceRefresh = false) {
  // Try cache first unless force refresh
  if (!forceRefresh) {
    const cached = loadFromCache(indicator)
    if (cached) {
      console.log(`📊 ${indicator.toUpperCase()}: Cache hit`)
      return cached
    }
  }

  // Fetch from API
  console.log(`📊 ${indicator.toUpperCase()}: Fetching from API...`)
  const data = await fetchIndicatorFromAPI(indicator)

  // Save to cache
  saveToCache(indicator, data)

  return data
}

/**
 * Get all indicators (parallel fetching)
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} Object with indicator results and errors
 */
async function getAllIndicators(forceRefresh = false) {
  const indicatorNames = Object.keys(INDICATORS)

  // Fetch all in parallel
  const results = await Promise.allSettled(
    indicatorNames.map(indicator => getIndicator(indicator, forceRefresh))
  )

  // Separate successes and failures
  const data = {}
  const errors = {}

  results.forEach((result, index) => {
    const indicator = indicatorNames[index]

    if (result.status === 'fulfilled') {
      data[indicator] = result.value
    } else {
      errors[indicator] = result.reason.message || 'Unknown error'
      console.error(`Failed to fetch ${indicator}:`, result.reason)
    }
  })

  return { data, errors, hasErrors: Object.keys(errors).length > 0 }
}

/**
 * Clear all cached indicators
 */
function clearCache() {
  Object.keys(INDICATORS).forEach(indicator => {
    localStorage.removeItem(`obs-indicator-${indicator}`)
  })
  console.log('📊 Indicators cache cleared')
}

/**
 * Format indicator value for display
 */
function formatValue(value, indicator) {
  const config = INDICATORS[indicator]
  const formatted = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  return `${config.unit}${formatted}`
}
