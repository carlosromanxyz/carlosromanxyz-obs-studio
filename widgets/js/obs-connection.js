/**
 * OBS WebSocket Connection Manager
 */

const obs = new OBSWebSocket()
let isOBSConnected = false

async function connectOBS() {
  console.log('🔌 Intentando conectar a OBS WebSocket...')
  console.log('   URL: ws://192.168.0.173:4455')

  try {
    await obs.connect('ws://192.168.0.173:4455', 'xUTvOpIlXmllpGKb')

    isOBSConnected = true
    document.getElementById('status').className =
      'px-2 py-0.5 text-[10px] font-medium rounded bg-green-900/50 text-green-400 border border-green-700/50'
    document.getElementById('status').textContent = 'Connected'

    console.log('✅ Connected to OBS WebSocket')
  } catch (error) {
    isOBSConnected = false
    document.getElementById('status').className =
      'px-2 py-0.5 text-[10px] font-medium rounded bg-yellow-900/50 text-yellow-400 border border-yellow-700/50'
    document.getElementById('status').textContent = 'Disconnected'

    console.error('❌ Error conectando a OBS WebSocket:', error)
    console.error('   Tipo de error:', error.code)
    console.error('   Mensaje:', error.message)
  }
}
