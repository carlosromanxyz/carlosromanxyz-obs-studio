#!/usr/bin/env node

/**
 * Simple HTTP Server for OBS Studio Widgets
 *
 * Serves static files with CORS enabled for local development.
 * Use this to host widget HTML files for OBS Browser Sources and Docks.
 *
 * Usage:
 *   node server/serve.js
 *   npm start (if package.json configured)
 *
 * Server runs on: http://localhost:8080
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8080
const ROOT_DIR = path.join(__dirname, '..')

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

const server = http.createServer((req, res) => {
  // Parse URL and remove query parameters
  let filePath = req.url.split('?')[0]

  // Default to index.html for root path
  if (filePath === '/') {
    filePath = '/index.html'
  }

  // Build full file path
  const fullPath = path.join(ROOT_DIR, filePath)

  // Security: Prevent directory traversal
  if (!fullPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('403 Forbidden')
    return
  }

  // Read and serve file
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 Not Found')
        console.log(`❌ 404: ${filePath}`)
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('500 Internal Server Error')
        console.error(`❌ 500: ${filePath}`, err)
      }
      return
    }

    // Get MIME type from extension
    const ext = path.extname(fullPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    // CORS headers for cross-origin requests
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache',
    })

    res.end(data)
    console.log(`✅ ${req.method} ${filePath}`)
  })
})

server.listen(PORT, () => {
  console.clear()
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎬  OBS Studio Widgets Server                      ║
║                                                       ║
║   Status:  RUNNING                                    ║
║   Port:    ${PORT}                                        ║
║   URL:     http://localhost:${PORT}                       ║
║                                                       ║
║   📂 Serving from: ${ROOT_DIR.slice(-30).padEnd(30)} ║
║                                                       ║
║   Press Ctrl+C to stop                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

📌 Available Widgets:

  🎨 Logo Overlay (Browser Source):
     http://localhost:${PORT}/widgets/overlays/logo-overlay.html

  🎛️  Logo Controller (Dock):
     http://localhost:${PORT}/widgets/controllers/logo-controller.html

🔧 OBS Setup:
  1. Add Browser Source → Use overlay URLs above
  2. Add Custom Dock → Use controller URLs above
  3. Configure in OBS → Advanced Scene Switcher (optional)

`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Server stopped\n')
  process.exit(0)
})
