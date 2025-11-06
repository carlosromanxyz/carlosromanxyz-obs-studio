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
```

## Critical Architecture Decisions

### 1. **Zero Build Philosophy**
This project intentionally avoids ALL build tools. Never suggest Webpack, Vite, TypeScript, Sass, or any transpilation. All code must run directly in the browser.

### 2. **Dual-State System (Preview + On-Air)**
Widgets have two independent visibility states:
- `isPreview: true` - Shows in preview/testing (🟡 Yellow indicator)
- `isVisible: true` - Shows when live streaming (🔴 Red indicator)

Both can be active simultaneously. This allows testing changes without affecting the live stream.

### 3. **localStorage as State Manager**
Communication between Controller (dock) and Overlay (browser source) happens via localStorage, not direct messaging:
- **Key Pattern**: `obs-{widget-name}-config`
- **Sync Mechanism**: Storage events + 1s polling fallback (for OBS CEF compatibility)
- **Critical**: Always provide DEFAULT_CONFIG object with all possible config keys

### 4. **Widget Pair Pattern**
Every widget consists of TWO files that must share the same localStorage key:
- **Overlay** (`widgets/overlays/*.html`) - Visual display in Browser Source
- **Controller** (`widgets/controllers/*.html`) - Control panel in Custom Dock

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

## Widget Development Pattern

When creating a new widget, use `logo-overlay.html` and `logo-controller.html` as reference templates. Key implementation requirements:

### Overlay (Browser Source)
- Must include Tailwind CDN and brand color config
- Must have DEFAULT_CONFIG with at minimum `isPreview` and `isVisible` keys
- Must implement both storage event listener AND 1s polling fallback
- Must check `config.isPreview || config.isVisible` to determine visibility
- Body must have `background: transparent` for OBS chroma-free overlay

### Controller (Custom Dock)
- Must use same localStorage key as its paired overlay
- Must dispatch `widget-config-updated` custom event after saving config
- Must restore checkbox states on DOMContentLoaded
- Optional OBS WebSocket connection (don't block if unavailable)

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

### Browser Source Configuration
- **URL**: `http://localhost:8080/widgets/overlays/{widget-name}.html`
- **Dimensions**: 1920x1080
- **FPS**: 60
- **Custom CSS**: Required to set transparent background (see logo-overlay.html in OBS for exact CSS)

### Custom Dock Configuration
- **URL**: `http://localhost:8080/widgets/controllers/{widget-name}-controller.html`
- **Placement**: Dock can be tabbed with any panel or placed on separate monitor

### Aspect Ratio Support
Widgets should adapt positioning based on aspect ratio (16:9 vs 4:3). Currently hardcoded in each widget; future settings widget will make this configurable.

## Server Configuration

Both `server/serve.js` (Node.js) and `server/serve.py` (Python) serve identical functionality:
- CORS enabled for OBS browser sources
- Directory traversal protection
- Default port: 8080 (configurable in respective files)
- Custom MIME types for common web assets

## Adding a New Widget

1. **Create Overlay** (`widgets/overlays/{widget-name}.html`):
   - Copy `logo-overlay.html` as starting template
   - Update localStorage key to `obs-{widget-name}-config`
   - Implement widget-specific HTML/CSS structure
   - Ensure DEFAULT_CONFIG includes `isPreview` and `isVisible`

2. **Create Controller** (`widgets/controllers/{widget-name}-controller.html`):
   - Copy `logo-controller.html` as starting template
   - Use SAME localStorage key as overlay
   - Add widget-specific form controls
   - Implement save/load config functions

3. **Test Locally**:
   - Open overlay in browser tab
   - Open controller in separate browser tab
   - Verify Preview/On Air toggles update overlay within 1-2 seconds

4. **Test in OBS**:
   - Add Browser Source pointing to overlay URL
   - Add Custom Dock pointing to controller URL
   - Verify controls work from OBS dock

5. **Document**:
   - Add to README.md "Available Widgets" section
   - Update docs/SETUP.md with OBS configuration instructions

## Common Implementation Patterns

See `logo-overlay.html` and `logo-controller.html` for complete reference implementations of:
- Show/hide based on `isPreview || isVisible`
- Toggle handlers that load, modify, and save config
- Refresh button with visual feedback
- Storage event listeners + polling fallback
- Config restoration on page load

## Troubleshooting

### Black Screen in OBS Browser Source
1. Verify server is running (`npm start`)
2. Test URL in regular browser first
3. Check that widget config isn't set to hidden (open controller and enable Preview)
4. Debug via browser console: `localStorage.getItem('obs-{widget-name}-config')`

### Controller Not Updating Overlay
- Polling fallback means updates take 1-2 seconds - this is normal
- Verify both overlay and controller use identical localStorage key
- Check browser console for JavaScript errors

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

## Planned Features

Future widgets:
- Economic Indicators (UF, UTM, IPC, Dólar from Chilean APIs)
- Lower Third Graphics
- Live Status Indicator
- YouTube Carousel (Streamlink integration)

Future enhancements:
- Global settings widget (aspect ratio, theme customization)
- Scene-specific widget profiles
- Configuration import/export
