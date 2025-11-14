# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Purpose**: Pure HTML streaming overlays and control panels for OBS Studio

**Philosophy**: Zero build step, maximum portability, localhost-based workflow

**Tech Stack**:
- Pure HTML5 + CSS3
- Tailwind CSS v4 via CDN
- Vanilla JavaScript (ES6+)
- localStorage for persistence
- Optional OBS WebSocket v5 integration

## Development Commands

```bash
# Start development server (Node.js - recommended)
npm start

# Alternative Python server
python3 server/serve.py

# Server runs on http://localhost:8080

# Test overlays in browser
open http://localhost:8080/widgets/overlays/logo-overlay.html
open http://localhost:8080/widgets/overlays/live-overlay.html
open http://localhost:8080/widgets/overlays/indicators-overlay.html

# Test unified controller
open http://localhost:8080/widgets/controllers/overlays-controller.html
```

## Critical Architecture Decisions

### 1. **Zero Build Philosophy**
This project intentionally avoids ALL build tools. Never suggest Webpack, Vite, TypeScript, Sass, or any transpilation. All code must run directly in the browser.

### 2. **Modular Controller Architecture**
The project uses a **unified controller** (`overlays-controller.html`) that manages multiple widgets via accordion UI, with widget-specific logic separated into individual JavaScript modules (`widgets/js/{widget-name}-widget.js`). This replaces the older one-controller-per-widget pattern.

**Key Components**:
- **Unified Controller**: `widgets/controllers/overlays-controller.html` - Single OBS Custom Dock managing all widgets
- **Widget Modules**: `widgets/js/{widget}-widget.js` - Isolated logic for each widget (logo, live, etc.)
- **Shared Utilities**: `widgets/js/obs-connection.js`, `widgets/js/accordion.js` - Common functionality
- **Independent Overlays**: `widgets/overlays/{widget}-overlay.html` - Each overlay still self-contained

### 3. **localStorage as State Manager**
Communication between Controller (dock) and Overlay (browser source) happens via localStorage, not direct messaging:
- **Key Pattern**: `obs-{widget-name}-config`
- **Sync Mechanism**: Storage events + 1s polling fallback (for OBS CEF compatibility)
- **Critical**: Always provide DEFAULT_CONFIG object with all possible config keys
- **Widget Modules**: Each widget module (`widgets/js/{widget}-widget.js`) exports `load{Widget}Config()`, `save{Widget}Config()`, `init{Widget}()`, and event handlers

## Project Structure

```
carlosromanxyz-obs-studio/
├── widgets/
│   ├── controllers/
│   │   └── overlays-controller.html  # Unified controller (OBS Custom Dock)
│   ├── overlays/                     # OBS Browser Source visuals
│   │   ├── logo-overlay.html         # Logo widget overlay
│   │   ├── live-overlay.html         # Live indicator overlay
│   │   └── indicators-overlay.html   # Economic indicators overlay
│   └── js/                           # Widget logic modules
│       ├── logo-widget.js            # Logo widget controller logic
│       ├── live-widget.js            # Live widget controller logic
│       ├── indicators-widget.js      # Economic indicators controller logic
│       ├── indicators-data.js        # Economic indicators API utility
│       ├── obs-connection.js         # OBS WebSocket connection
│       └── accordion.js              # Accordion UI utility
├── server/
│   ├── serve.js                      # Node.js HTTP server (CORS enabled)
│   └── serve.py                      # Python HTTP server alternative
├── docs/
│   └── SETUP.md                      # Detailed setup instructions
├── package.json
└── README.md
```

## Widget Development Pattern

When adding a new widget, follow this modular pattern (see `logo-widget.js` and `logo-overlay.html` as reference):

### 1. Create Overlay (`widgets/overlays/{widget-name}-overlay.html`)
- Include Tailwind CDN and brand color config
- Define `DEFAULT_CONFIG` with `isVisible` key and widget-specific keys
- Implement `loadConfig()`, `applyConfig()` functions
- Add storage event listener + 1s polling fallback
- Body must have `background: transparent` for OBS
- Apply config on `DOMContentLoaded`

### 2. Create Widget Module (`widgets/js/{widget-name}-widget.js`)
- Export `DEFAULT_{WIDGET}_CONFIG` constant
- Export `load{Widget}Config()` - reads from localStorage
- Export `save{Widget}Config(config)` - saves and dispatches custom event
- Export event handler functions (e.g., `handleVisibleToggle()`)
- Export `init{Widget}()` - initializes UI state from config

### 3. Update Unified Controller (`widgets/controllers/overlays-controller.html`)
- Add accordion section for widget in HTML
- Include widget module script: `<script src="../js/{widget-name}-widget.js"></script>`
- Call `init{Widget}()` in `DOMContentLoaded` listener
- Wire up event handlers to accordion controls

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

## Animation Standards

**Performance Requirements**: Only use GPU-accelerated CSS properties (`transform`, `opacity`). Never animate `margin`, `top`, `left`, or `background-color` as they cause layout thrashing.

**Timing Standards**:
- Micro-interactions: 0.2s (hover, focus)
- Standard transitions: 0.4-0.5s (opacity, small movements)
- Entrances: 0.6-0.8s (full component animations)
- Infinite loops: 2s minimum (to avoid distraction)

**Easing**: Use `cubic-bezier(0.25, 0.1, 0.25, 1.0)` for smooth, natural motion.

## localStorage Sync Pattern

**Why dual sync?** OBS's Chromium Embedded Framework (CEF) sometimes blocks storage events between browser source and dock contexts. The polling fallback ensures widgets stay in sync.

**Implementation requirements**:
1. Overlay: Listen to storage events + poll every 1s
2. Controller: Save to localStorage + dispatch custom event
3. Both: Use identical localStorage key
4. Both: Include DEFAULT_CONFIG with all possible keys

## OBS Studio Integration

### Browser Source Configuration (Per Widget)
Add each widget as a separate OBS Browser Source:
- **URL**: `http://localhost:8080/widgets/overlays/{widget-name}.html`
- **Dimensions**: 1920x1080
- **FPS**: 60
- **Custom CSS**:
  ```css
  body {
    background-color: rgba(0, 0, 0, 0);
    margin: 0px auto;
    overflow: hidden;
  }
  ```

### Custom Dock Configuration (Unified Controller)
Only need ONE Custom Dock for all widgets:
- **URL**: `http://localhost:8080/widgets/controllers/overlays-controller.html`
- **Placement**: Dock can be tabbed with any panel or placed on separate monitor
- Controls all widgets via accordion UI

### Aspect Ratio Support
Widgets can adapt positioning based on aspect ratio (16:9 vs 4:3). Currently implemented in `live-overlay.html` via `aspectRatio` config key. Future widgets should follow this pattern.

## Server Configuration

Both `server/serve.js` (Node.js) and `server/serve.py` (Python) serve identical functionality:
- CORS enabled for OBS browser sources
- Directory traversal protection
- Default port: 8080 (configurable in respective files)
- Custom MIME types for common web assets

## Adding a New Widget

Follow this step-by-step process:

1. **Create Overlay** (`widgets/overlays/{widget-name}-overlay.html`):
   - Copy `logo-overlay.html` or `live-overlay.html` as template
   - Update localStorage key to `obs-{widget-name}-config`
   - Define `DEFAULT_CONFIG` with `isVisible` key minimum
   - Implement widget-specific HTML/CSS structure
   - Add `loadConfig()`, `applyConfig()` functions
   - Add storage listener + 1s polling fallback

2. **Create Widget Module** (`widgets/js/{widget-name}-widget.js`):
   - Copy `logo-widget.js` or `live-widget.js` as template
   - Define `DEFAULT_{WIDGET}_CONFIG`
   - Implement `load{Widget}Config()`, `save{Widget}Config()`
   - Create event handlers for UI controls
   - Implement `init{Widget}()` initialization function

3. **Update Unified Controller** (`widgets/controllers/overlays-controller.html`):
   - Add accordion section in HTML for new widget
   - Include widget module: `<script src="../js/{widget-name}-widget.js"></script>`
   - Call `init{Widget}()` in `DOMContentLoaded` event
   - Wire up event handlers (onchange, onclick, oninput)

4. **Test Locally**:
   - Open overlay: `http://localhost:8080/widgets/overlays/{widget-name}-overlay.html`
   - Open controller: `http://localhost:8080/widgets/controllers/overlays-controller.html`
   - Toggle controls and verify overlay updates within 1-2 seconds
   - Check browser console for errors

5. **Test in OBS**:
   - Add Browser Source pointing to overlay URL
   - Refresh existing Custom Dock (or add if first widget)
   - Verify controls work from unified controller accordion

6. **Document**:
   - Add to README.md "What's Included" section
   - Update docs/SETUP.md if widget requires special OBS configuration

## Common Implementation Patterns

See reference implementations:
- **Overlays**: `logo-overlay.html` (animated element), `live-overlay.html` (text input, aspect ratio), `indicators-overlay.html` (external API data display)
- **Widget Modules**: `logo-widget.js` (toggle controls), `live-widget.js` (debounced text input), `indicators-widget.js` (async data fetching)
- **Data Utilities**: `indicators-data.js` (external API fetching with 4-hour cache-first strategy)
- **Shared Utilities**: `accordion.js` (accordion UI), `obs-connection.js` (optional WebSocket)

### External API Integration Pattern (Indicators Widget)
When fetching external data, follow this cache-first pattern:
1. **Data Utility Module** (`{widget}-data.js`):
   - Define API endpoints and cache TTL constants
   - Implement `loadFromCache()` to check localStorage validity
   - Implement `saveToCache()` with timestamp
   - Implement `fetchIndicator()` with timeout handling
   - Export async function that tries cache first, then network
2. **Widget Module** imports data utility and handles UI state (loading, errors)
3. **Overlay** displays data from config, refreshed via polling
4. **Controller** triggers refresh via button, shows last updated time

## Troubleshooting

### Black Screen in OBS Browser Source
1. Verify server is running (`npm start`)
2. Test URL in regular browser first
3. Check that widget config isn't set to hidden (open controller and toggle `isVisible`)
4. Debug via browser console: `localStorage.getItem('obs-{widget-name}-config')`

### Controller Not Updating Overlay
- Polling fallback means updates take 1-2 seconds - this is normal
- Verify both overlay and widget module use identical localStorage key pattern
- Check browser console for JavaScript errors
- Refresh browser source in OBS (right-click → Refresh)

### Unified Controller Not Loading Widget
- Check that widget module script is included in `overlays-controller.html`
- Verify `init{Widget}()` is called in `DOMContentLoaded` listener
- Check browser console for script loading errors or undefined function errors

### Performance Issues (Choppy Animations)
- Only animate `transform` and `opacity` (GPU-accelerated)
- Never animate `margin`, `top`, `left`, `width`, `height`, or `background-color`
- If still choppy, reduce polling from 1000ms to 2000ms in overlay

## Git Workflow

Commit message convention (conventional commits):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Visual/formatting changes
- `refactor:` - Code restructuring
- `perf:` - Performance improvements

## Security Notes

- Never commit API keys, passwords, or secrets
- CORS is enabled (required for OBS) but restricts this to localhost use only
- All CDN dependencies are read-only external resources

## Available Widgets

Current widgets in production:
- **Logo Widget** (`logo-overlay.html` + `logo-widget.js`) - Animated logo with text toggle
- **Live Widget** (`live-overlay.html` + `live-widget.js`) - "EN VIVO" indicator with location text
- **Economic Indicators Widget** (`indicators-overlay.html` + `indicators-widget.js` + `indicators-data.js`) - Chilean economic indicators (UF, UTM, IPC, Dólar) from Boostr API with 4-hour caching

Planned widgets:
- Lower Third Graphics
- YouTube Carousel (Streamlink integration)

Future enhancements:
- Global settings widget (aspect ratio, theme customization)
- Scene-specific widget profiles
- Configuration import/export
