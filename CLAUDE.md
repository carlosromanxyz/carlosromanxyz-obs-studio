# CLAUDE.md

This file provides guidance to Claude Code when working with the OBS Studio widgets repository.

## Project Overview

**Purpose**: Pure HTML streaming overlays and control panels for OBS Studio

**Philosophy**: Zero build step, maximum portability, localhost-based workflow

**Tech Stack**:
- Pure HTML5 + CSS3
- Tailwind CSS v4 via CDN
- Vanilla JavaScript (ES6+)
- localStorage for persistence
- Optional OBS WebSocket v5 integration

## Quick Start

```bash
# Start server (choose one)
npm start                 # Node.js (recommended)
python3 server/serve.py   # Python alternative

# Server runs on http://localhost:8080
```

## Project Structure

```
carlosromanxyz-obs-studio/
├── widgets/
│   ├── controllers/              # OBS Custom Dock control panels
│   │   └── logo-controller.html  # Logo widget controls
│   └── overlays/                 # OBS Browser Source visuals
│       └── logo-overlay.html     # Logo overlay display
├── server/
│   ├── serve.js                  # Node.js HTTP server (CORS enabled)
│   └── serve.py                  # Python HTTP server alternative
├── docs/
│   └── SETUP.md                  # Detailed setup instructions
├── assets/
│   └── images/                   # Future: Static images
├── scripts/                      # Future: Utility scripts
├── package.json                  # npm scripts
├── .gitignore
└── README.md                     # Main documentation
```

## Architecture Principles

### 1. Zero Build Step
- **NO bundlers**: No Webpack, Vite, Parcel, esbuild
- **NO transpilers**: No Babel, TypeScript compiler, SWC
- **NO preprocessors**: No Sass, Less, PostCSS build step
- **YES to CDN**: Tailwind CSS via `<script src="https://cdn.tailwindcss.com">`
- **YES to native**: Modern browser APIs, ES6+ features

### 2. Pure HTML Components
- All UI components are pure HTML structures
- Logo rendered as HTML/SVG layers (NOT image files)
- CSS-only animations (no animation libraries)
- Vanilla JavaScript for interactivity

### 3. localStorage Persistence
- **Key Pattern**: `obs-{widget-name}-config`
- **Sync Strategy**: Storage events + polling fallback
- **Default Configs**: Always provide DEFAULT_CONFIG object

### 4. Dual Monitor System
- **Preview Mode** (`isPreview: true`): Testing/staging changes
- **On-Air Mode** (`isVisible: true`): Live streaming view
- Both can be active simultaneously
- Controllers toggle both independently

### 5. OBS WebSocket (Optional)
- **NOT required**: Widgets work without it
- **Use case**: Advanced automation, scene switching
- **Version**: OBS WebSocket v5.x
- **Library**: `obs-websocket-js` via CDN

## Widget Development Pattern

### Overlay Structure (Browser Source)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Name</title>

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tailwind Config -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'brand-primary': '#b1d900',   // Pear
            'brand-accent': '#82a000',    // Apple Green
            'brand-dark': '#5c7000',      // Avocado
            'brand-darker': '#525252',    // Davys Gray
            'brand-black': '#000000',     // Black
          }
        }
      }
    }
  </script>

  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: transparent;
    }

    /* Custom animations */
  </style>
</head>
<body>
  <!-- Widget HTML structure -->

  <script>
    // Default config
    const DEFAULT_CONFIG = {
      isPreview: false,
      isVisible: false,
      // ... widget-specific options
    }

    // Load config from localStorage
    function loadConfig() {
      const saved = localStorage.getItem('obs-widget-name-config')
      if (saved) {
        return JSON.parse(saved)
      }
      return DEFAULT_CONFIG
    }

    // Apply config to overlay
    function applyConfig(config) {
      const shouldShow = config.isPreview || config.isVisible

      if (!shouldShow) {
        hideOverlay()
        return
      }

      showOverlay()
      // ... apply widget-specific options
    }

    // Listen for storage changes (cross-window sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'obs-widget-name-config') {
        const config = loadConfig()
        applyConfig(config)
      }
    })

    // Polling fallback (1s interval)
    setInterval(() => {
      const config = loadConfig()
      applyConfig(config)
    }, 1000)

    // Apply initial config
    window.addEventListener('DOMContentLoaded', () => {
      const config = loadConfig()
      applyConfig(config)
    })
  </script>
</body>
</html>
```

### Controller Structure (Custom Dock)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Controller</title>

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- OBS WebSocket Library (optional) -->
  <script src="https://cdn.jsdelivr.net/npm/obs-websocket-js@5.0.3/dist/obs-ws.min.js"></script>
</head>
<body class="bg-zinc-900 text-white p-4 min-h-screen">

  <!-- Header -->
  <div class="mb-6">
    <h2 class="text-xl font-bold text-brand-primary">
      🎨 Widget Controller
    </h2>
  </div>

  <!-- Connection Status (optional) -->
  <div class="mb-4">
    <span id="status">Not connected</span>
  </div>

  <!-- Controls -->
  <div class="space-y-3">
    <!-- Preview Toggle (Yellow) -->
    <label class="flex items-center justify-between">
      <span>Preview 🟡</span>
      <input
        type="checkbox"
        id="preview-toggle"
        onchange="handlePreviewToggle(this.checked)"
      >
    </label>

    <!-- On Air Toggle (Red) -->
    <label class="flex items-center justify-between">
      <span>On Air 🔴</span>
      <input
        type="checkbox"
        id="onair-toggle"
        onchange="handleOnAirToggle(this.checked)"
      >
    </label>
  </div>

  <script>
    const obs = new OBSWebSocket.OBSWebSocket()
    let isOBSConnected = false

    const DEFAULT_CONFIG = {
      isPreview: false,
      isVisible: false,
    }

    function loadConfig() {
      const saved = localStorage.getItem('obs-widget-name-config')
      if (saved) return JSON.parse(saved)
      return DEFAULT_CONFIG
    }

    function saveConfig(config) {
      localStorage.setItem('obs-widget-name-config', JSON.stringify(config))

      // Dispatch event for overlay to catch
      window.dispatchEvent(new CustomEvent('widget-config-updated', {
        detail: config
      }))
    }

    function handlePreviewToggle(checked) {
      const config = loadConfig()
      config.isPreview = checked
      saveConfig(config)
    }

    function handleOnAirToggle(checked) {
      const config = loadConfig()
      config.isVisible = checked
      saveConfig(config)
    }

    // Optional: Connect to OBS WebSocket
    async function connectOBS() {
      try {
        await obs.connect('ws://localhost:4455', 'your-password')
        isOBSConnected = true
        document.getElementById('status').textContent = 'Connected'
      } catch (error) {
        console.log('OBS WebSocket not available (optional)')
      }
    }

    // Restore state on load
    window.addEventListener('DOMContentLoaded', () => {
      const config = loadConfig()
      document.getElementById('preview-toggle').checked = config.isPreview
      document.getElementById('onair-toggle').checked = config.isVisible

      connectOBS()
    })
  </script>
</body>
</html>
```

## Brand Colors

Official Carlos Román brand palette:

```javascript
colors: {
  'brand-primary': '#b1d900',   // Pear - Primary accent
  'brand-accent': '#82a000',    // Apple Green - Secondary accent
  'brand-dark': '#5c7000',      // Avocado - Dark variant
  'brand-darker': '#525252',    // Davys Gray - Neutral gray
  'brand-black': '#000000',     // Black - Maximum contrast
}
```

**Usage Guidelines**:
- Use `brand-primary` for interactive elements, borders, active states
- Use `brand-accent` for hover states, secondary buttons
- Use `brand-dark` for subtle accents, disabled states
- Use `brand-darker` for backgrounds, containers
- Use `brand-black` for maximum contrast text/backgrounds

## Animation Patterns

### CSS Transitions (Preferred)

```css
/* Smooth property changes */
.element {
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

/* Specific properties only (better performance) */
.element {
  transition: opacity 0.4s ease-out,
              transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}
```

### CSS Keyframes (Infinite/Complex)

```css
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.pulse-dot {
  animation: pulse-scale 2s ease-in-out infinite;
}

/* Stagger animations */
.pulse-dot:nth-child(2) {
  animation-delay: 0.5s;
}
```

### Standard Timing

- **Micro-interactions**: 0.2s (hover, focus)
- **Standard transitions**: 0.4-0.5s (opacity, small movements)
- **Entrances**: 0.6-0.8s (full component animations)
- **Infinite loops**: 2s minimum (to avoid distraction)

## localStorage Patterns

### Configuration Structure

```javascript
// Always provide defaults
const DEFAULT_CONFIG = {
  // Display state
  isPreview: false,
  isVisible: false,

  // Widget-specific options
  showText: true,
  position: 'top-right',
  size: 'medium',

  // ... more options
}
```

### Sync Pattern

```javascript
// 1. Storage event (primary sync method)
window.addEventListener('storage', (e) => {
  if (e.key === 'obs-widget-config') {
    const config = loadConfig()
    applyConfig(config)
  }
})

// 2. Polling fallback (for OBS CEF compatibility)
setInterval(() => {
  const config = loadConfig()
  applyConfig(config)
}, 1000)
```

### Save Pattern

```javascript
function saveConfig(config) {
  // 1. Save to localStorage
  localStorage.setItem('obs-widget-config', JSON.stringify(config))

  // 2. Dispatch custom event (same-window sync)
  window.dispatchEvent(new CustomEvent('widget-config-updated', {
    detail: config
  }))

  // 3. Update UI feedback
  updateLastSync()
}
```

## OBS Studio Integration

### Browser Source Settings

**Recommended Configuration**:
```
URL: http://localhost:8080/widgets/overlays/{widget-name}.html
Width: 1920
Height: 1080
FPS: 60
Custom CSS:
  body {
    background-color: rgba(0, 0, 0, 0);
    margin: 0px auto;
    overflow: hidden;
  }
```

**Advanced Options**:
- ✅ Shutdown source when not visible
- ✅ Refresh browser when scene becomes active
- ❌ Control audio via OBS (widgets don't use audio)

### Custom Dock Settings

**Configuration**:
```
Dock Name: {Widget Name} Controller
URL: http://localhost:8080/widgets/controllers/{widget-name}-controller.html
```

**Placement Tips**:
- Tab with Audio Mixer for quick access
- Side panel for always-visible controls
- Separate monitor for multi-monitor setups

### Aspect Ratio Positioning

Widgets should adapt to different aspect ratios:

**16:9 (Standard)**:
```javascript
// Logo positioning
top: 128px (32 * 4)
right: 112px (28 * 4)
```

**4:3 (Legacy)**:
```javascript
// Logo positioning
top: 128px (32 * 4)
right: 320px (80 * 4)
```

**Implementation**:
```javascript
const aspectRatio = '16:9' // From settings

const positionClasses = {
  'top-left': aspectRatio === '16:9' ? 'top-32 left-40' : 'top-32 left-80',
  'top-right': aspectRatio === '16:9' ? 'top-32 right-28' : 'top-32 right-80',
  // ... more positions
}
```

## Server Configuration

### Node.js Server (`server/serve.js`)

**Features**:
- CORS enabled for cross-origin requests
- Custom MIME types for all file extensions
- Security: Directory traversal prevention
- Logging: Request method + path
- Port: 8080 (configurable)

**Customization**:
```javascript
// Change port
const PORT = 8081

// Add custom MIME type
const MIME_TYPES = {
  '.custom': 'application/x-custom',
}
```

### Python Server (`server/serve.py`)

**Features**:
- Same CORS headers as Node.js
- SimpleHTTPRequestHandler base
- Cross-platform (macOS, Linux, Windows)

**Customization**:
```python
# Change port
PORT = 8081
```

## Development Workflow

### Adding a New Widget

1. **Create Overlay** (`widgets/overlays/{widget-name}.html`):
   - Copy logo-overlay.html as template
   - Implement widget-specific HTML structure
   - Add custom animations
   - Configure localStorage key

2. **Create Controller** (`widgets/controllers/{widget-name}-controller.html`):
   - Copy logo-controller.html as template
   - Add widget-specific controls
   - Implement toggle handlers
   - Match localStorage key with overlay

3. **Test Sync**:
   - Open overlay in browser
   - Open controller in another browser tab
   - Verify toggles update overlay in real-time

4. **Test in OBS**:
   - Add Browser Source (overlay URL)
   - Add Custom Dock (controller URL)
   - Verify toggles work from OBS dock

5. **Document**:
   - Add widget to README.md "Available Widgets" section
   - Add OBS setup instructions to docs/SETUP.md

### Testing Checklist

- [ ] Overlay loads without errors in regular browser
- [ ] Controller loads without errors in regular browser
- [ ] Storage sync works between tabs
- [ ] Preview toggle shows/hides overlay
- [ ] On Air toggle shows/hides overlay
- [ ] Both toggles work independently
- [ ] Refresh overlay button works
- [ ] Reset config button works
- [ ] Overlay works in OBS Browser Source
- [ ] Controller works in OBS Custom Dock
- [ ] Config persists after OBS restart
- [ ] Animations are smooth (60fps)

## Common Patterns

### Show/Hide Pattern

```javascript
function applyConfig(config) {
  const shouldShow = config.isPreview || config.isVisible

  if (!shouldShow) {
    hideOverlay()
    return
  }

  showOverlay()
}

function hideOverlay() {
  const container = document.getElementById('overlay-container')
  container.style.opacity = '0'
}

function showOverlay() {
  const container = document.getElementById('overlay-container')
  container.style.opacity = '1'
}
```

### Toggle Handler Pattern

```javascript
function handleToggle(toggleName, checked) {
  const config = loadConfig()
  config[toggleName] = checked
  saveConfig(config)

  console.log(`${toggleName}:`, checked)
}
```

### Refresh Button Pattern

```javascript
function refreshOverlay() {
  const config = loadConfig()
  window.dispatchEvent(new CustomEvent('widget-config-updated', {
    detail: config
  }))

  // Visual feedback
  const btn = event.target
  const originalText = btn.textContent
  btn.textContent = '✅ Refreshed!'
  setTimeout(() => {
    btn.textContent = originalText
  }, 1500)
}
```

## Troubleshooting

### Black Screen in OBS Browser Source

**Causes**:
1. Server not running
2. Wrong URL
3. Widget config set to hidden

**Debug**:
```bash
# Check server
curl http://localhost:8080/widgets/overlays/widget-name.html

# Check localStorage in browser console
localStorage.getItem('obs-widget-config')

# Force preview mode
localStorage.setItem('obs-widget-config', '{"isPreview":true,"isVisible":false}')
location.reload()
```

### Controller Not Updating Overlay

**Causes**:
1. Different localhost ports
2. Storage events blocked in OBS CEF

**Fix**:
- Widgets have 1s polling fallback - wait 1-2 seconds
- Verify both use same localStorage key
- Check browser console for errors

### Performance Issues

**Symptoms**: Choppy animations, high CPU

**Fixes**:
1. Use GPU-accelerated properties only:
   ```css
   /* Good */
   transform: translateX(-100px);
   opacity: 0.5;

   /* Bad */
   margin-left: -100px;
   background-color: rgba(0,0,0,0.5);
   ```

2. Reduce polling frequency:
   ```javascript
   // Default: 1000ms (every second)
   setInterval(() => {
     const config = loadConfig()
     applyConfig(config)
   }, 2000) // Change to 2 seconds
   ```

3. Disable animations in OBS:
   - Right-click Browser Source
   - Properties → Advanced
   - ❌ Disable "Use hardware acceleration"

## Git Workflow

### Committing Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add {widget-name} widget with {feature}"

# Push to GitHub
git push origin main
```

### Commit Message Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Formatting, visual changes
refactor: Code restructuring
perf: Performance improvements
test: Testing related changes
```

## Security Considerations

- **No secrets in code**: Never commit API keys, passwords
- **CORS enabled**: Required for OBS, but limits security
- **localhost only**: Widgets designed for local use
- **No external dependencies**: All CDN resources are read-only

## Future Enhancements

### Planned Widgets
- [ ] Camera Overlay (native OBS Video Capture Device)
- [ ] Economic Indicators (UF, UTM, IPC, Dólar)
- [ ] Lower Third Graphics
- [ ] Live Status Indicator
- [ ] YouTube Carousel (Streamlink integration)

### Planned Features
- [ ] Global settings widget (aspect ratio, theme)
- [ ] Keyboard shortcuts support
- [ ] Scene-specific widget profiles
- [ ] Widget templates/presets
- [ ] Import/Export configuration

## Additional Resources

- [OBS Studio Documentation](https://obsproject.com/wiki/)
- [OBS WebSocket Protocol](https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

**Author**: Carlos Román ([@carlosromanxyz](https://github.com/carlosromanxyz))

**Repository**: https://github.com/carlosromanxyz/carlosromanxyz-obs-studio
