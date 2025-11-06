# Detailed Setup Guide

Complete walkthrough for setting up OBS Studio widgets system.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Server Configuration](#server-configuration)
3. [OBS Browser Source Setup](#obs-browser-source-setup)
4. [OBS Custom Dock Setup](#obs-custom-dock-setup)
5. [Testing Your Setup](#testing-your-setup)
6. [Advanced Configuration](#advanced-configuration)
7. [Exporting OBS Scenes](#exporting-obs-scenes)

---

## Initial Setup

### Step 1: Clone Repository

Open terminal and run:

```bash
cd ~/Development
git clone https://github.com/carlosromanxyz/carlosromanxyz-obs-studio.git
cd carlosromanxyz-obs-studio
```

### Step 2: Verify File Structure

Check that you have:

```bash
ls -la
# Should show:
# - widgets/
# - server/
# - docs/
# - package.json
# - README.md
```

### Step 3: Choose Your Server

You have two options:

**Option A: Node.js** (Recommended)
```bash
npm start
```

**Option B: Python**
```bash
python3 server/serve.py
```

Both servers do the same thing - pick whichever you have installed.

### Step 4: Verify Server is Running

Open browser and go to:
```
http://localhost:8080/widgets/overlays/logo-overlay.html
```

You should see a black screen (because config is default hidden). That's correct!

---

## Server Configuration

### Changing Server Port

If port 8080 is already in use:

**Node.js** (`server/serve.js`):
```javascript
// Line 17
const PORT = 8081  // Change to any available port
```

**Python** (`server/serve.py`):
```python
# Line 19
PORT = 8081  # Change to any available port
```

Then update all URLs in OBS to use new port.

### Auto-start Server on Boot (macOS/Linux)

Create a launch script:

```bash
# Create start.sh in repo root
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm start
EOF

chmod +x start.sh
```

Add to startup applications (varies by OS).

---

## OBS Browser Source Setup

### Step 1: Create Scene

1. Open OBS Studio
2. Create new scene (or use existing)
3. Right-click in **Sources** panel

### Step 2: Add Browser Source

1. Click **Add** (+) → **Browser**
2. Name it: `Logo Overlay`
3. Click **OK**

### Step 3: Configure Browser Source

In the Browser Source settings:

**URL**:
```
http://localhost:8080/widgets/overlays/logo-overlay.html
```

**Dimensions**:
- Width: `1920`
- Height: `1080`

**FPS**:
- Custom FPS: `60`

**Custom CSS**:
```css
body {
  background-color: rgba(0, 0, 0, 0);
  margin: 0px auto;
  overflow: hidden;
}
```

**Advanced Options** (leave default):
- ✅ Shutdown source when not visible
- ✅ Refresh browser when scene becomes active
- ❌ Control audio via OBS (not needed)

### Step 4: Position Browser Source

1. Click **OK** to create source
2. In preview, you won't see anything yet (logo is hidden by default)
3. Resize/reposition if needed (though it auto-positions at top-right)

---

## OBS Custom Dock Setup

### Step 1: Open Custom Browser Docks

1. In OBS menu: **View** → **Docks** → **Custom Browser Docks...**
2. Dialog opens with dock configuration

### Step 2: Add Logo Controller Dock

**Dock Name**:
```
Logo Controller
```

**URL**:
```
http://localhost:8080/widgets/controllers/logo-controller.html
```

### Step 3: Apply and Position

1. Click **Apply** (NOT Close yet)
2. New dock appears in OBS interface
3. Drag it to desired position:
   - Next to Scene Controls
   - In a separate monitor
   - Tabbed with other docks
4. Click **Close** in Custom Browser Docks dialog

### Step 4: (Optional) Add More Docks

Repeat for future widgets:
- Camera Controller
- Indicators Controller
- Lower Third Controller

---

## Testing Your Setup

### Test 1: Preview Toggle

1. In **Logo Controller** dock, toggle **Preview** ON (🟡 turns yellow)
2. In OBS preview, logo should appear at top-right
3. Toggle **Preview** OFF, logo disappears

✅ If this works, localStorage sync is working!

### Test 2: Show Text Toggle

1. Turn **Preview** ON
2. Toggle **Show Text** ON
3. Logo should move left, text appears with name
4. Text should rotate roles every 4 seconds

✅ If this works, animations are working!

### Test 3: On Air Toggle

1. Toggle **On Air** ON (🔴 turns red)
2. Logo should stay visible
3. Toggle **Preview** OFF
4. Logo should still be visible (because On Air is on)

✅ If this works, dual-mode system is working!

### Test 4: Refresh Overlay

1. Click **🔄 Refresh Overlay** button in controller
2. Button should change to "✅ Refreshed!" briefly
3. Overlay should reload with current config

✅ If this works, event system is working!

---

## Advanced Configuration

### Aspect Ratio Support

Logo automatically positions based on configured aspect ratio.

**Current Support**:
- 16:9 (Standard) - Default positioning
- 4:3 (Legacy) - Wider side margins

**Future**: Will be configurable via settings widget.

### Role Rotation

Edit roles in `logo-overlay.html`:

```javascript
// Line 113
const roles = [
  'Full Stack Developer',
  'Software Engineer',
  'Solutions Developer',
  'Your Custom Role'  // Add more roles here
]
```

### Animation Timing

Adjust animation speed in `logo-overlay.html`:

**Logo movement speed** (Line 50):
```css
.logo-transition {
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1.0);
  /* Change 0.8s to desired duration */
}
```

**Role rotation interval** (Line 201):
```javascript
roleInterval = setInterval(() => {
  // ...
}, 4000)  // Change 4000 to milliseconds between rotations
```

**Pulse animation speed** (Line 35-37):
```css
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
/* Change animation: duration in .pulse-dot class */
```

### Brand Colors

All colors are defined in Tailwind config (Line 12-21):

```javascript
colors: {
  'brand-primary': '#b1d900',   // Pear (lime accent)
  'brand-accent': '#82a000',    // Apple Green
  'brand-dark': '#5c7000',      // Avocado
  'brand-darker': '#525252',    // Davys Gray
  'brand-black': '#000000',     // Black
}
```

---

## Exporting OBS Scenes

To transfer your OBS setup to another PC:

### Step 1: Export Scene Collection

1. In OBS: **Scene Collection** → **Export**
2. Save to: `[repo]/obs-scenes/my-streaming-setup.json`
3. Commit to git:
   ```bash
   git add obs-scenes/
   git commit -m "Add OBS scene collection"
   git push
   ```

### Step 2: Import on Another PC

1. Clone repo on new PC
2. Start server: `npm start`
3. In OBS: **Scene Collection** → **Import**
4. Select `obs-scenes/my-streaming-setup.json`
5. ✅ All sources and docks configured!

**Important**: Ensure server is running BEFORE importing scene collection, or OBS will show errors for browser sources.

---

## Troubleshooting

### Browser Source Shows Black Screen

**Possible Causes**:
1. Server not running
2. Wrong URL
3. Logo config set to hidden

**Debug Steps**:
```bash
# 1. Check server is running
curl http://localhost:8080/widgets/overlays/logo-overlay.html
# Should return HTML content

# 2. Open in regular browser
open http://localhost:8080/widgets/overlays/logo-overlay.html

# 3. Open browser console (F12)
# Look for JavaScript errors

# 4. Check localStorage
localStorage.getItem('obs-logo-config')
# Should show: {"showText":false,"isPreview":false,"isVisible":false}

# 5. Set preview mode manually
localStorage.setItem('obs-logo-config', '{"showText":true,"isPreview":true,"isVisible":false}')
location.reload()
```

### Dock Not Updating Overlay

**Cause**: Storage events not firing between OBS browser contexts

**Fix**: Overlay has 1-second polling fallback - wait 1-2 seconds after toggling.

**Enhanced Fix**: Implement OBS WebSocket (see README.md).

### OBS Crashes When Adding Browser Source

**Cause**: Corrupted OBS browser cache

**Fix**:
```bash
# Close OBS first, then:
# macOS
rm -rf ~/Library/Application\ Support/obs-studio/plugin_config/obs-browser/

# Windows
del /s /q %APPDATA%\obs-studio\plugin_config\obs-browser\

# Linux
rm -rf ~/.config/obs-studio/plugin_config/obs-browser/

# Restart OBS
```

### Custom CSS Not Applied

**Symptom**: White background instead of transparent

**Cause**: Custom CSS field is empty

**Fix**: Copy-paste exact CSS from Step 3 of "OBS Browser Source Setup" above.

### Logo Appears in Wrong Position

**Cause**: Overlay URL has wrong aspect ratio

**Fix**: Logo auto-positions based on configured aspect ratio. Future settings widget will make this configurable.

---

## Next Steps

1. ✅ Set up additional widgets (coming soon)
2. ✅ Configure OBS WebSocket for advanced automation
3. ✅ Export scene collection for backup
4. ✅ Customize colors and animations
5. ✅ Create your own widgets

---

**Need help?** Open an issue on GitHub: https://github.com/carlosromanxyz/carlosromanxyz-obs-studio/issues
