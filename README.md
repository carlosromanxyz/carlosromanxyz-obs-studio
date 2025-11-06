# OBS Studio Widgets - Carlos Román

🎬 Pure HTML streaming overlays and control panels for OBS Studio

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/carlosromanxyz/carlosromanxyz-obs-studio.git
cd carlosromanxyz-obs-studio

# 2. Start local server (choose one):
npm start              # Node.js
python3 server/serve.py  # Python

# 3. Server runs on: http://localhost:8080
```

## 📦 What's Included

### ✅ Available Now
- **Logo Widget** - Animated logo overlay with text toggle
  - `/widgets/overlays/logo-overlay.html` - Browser Source
  - `/widgets/controllers/logo-controller.html` - Dock Control Panel

### 🚧 Coming Soon
- Camera Overlay (native OBS Video Capture Device)
- Economic Indicators Widget
- Lower Third Graphics
- Live Status Indicator
- More widgets...

## 🎯 Features

- ✅ **Zero Build Step** - Pure HTML + Tailwind CSS via CDN
- ✅ **Portable** - Works on any PC with git clone
- ✅ **localStorage Persistence** - Configuration survives OBS restarts
- ✅ **Dual Monitor System** - Preview + On-Air modes
- ✅ **Optional OBS WebSocket** - Advanced automation (not required)
- ✅ **Responsive** - Works in OBS Browser Sources and Docks

## 📋 Prerequisites

- **OBS Studio** 28.0+ ([Download](https://obsproject.com/))
- **Git** ([Download](https://git-scm.com/))
- **Node.js** 14+ OR **Python** 3.7+ (for local server)

## 🔧 OBS Setup

### 1. Add Browser Source (Overlay)

1. In OBS, right-click scene → **Add** → **Browser**
2. Configure:
   - **Name**: Logo Overlay
   - **URL**: `http://localhost:8080/widgets/overlays/logo-overlay.html`
   - **Width**: 1920
   - **Height**: 1080
   - **FPS**: 60
   - **Custom CSS**:
     ```css
     body {
       background-color: rgba(0, 0, 0, 0);
       margin: 0px auto;
       overflow: hidden;
     }
     ```
3. ✅ Click **OK**

### 2. Add Custom Dock (Control Panel)

1. In OBS, go to **View** → **Docks** → **Custom Browser Docks...**
2. Configure:
   - **Dock Name**: Logo Controller
   - **URL**: `http://localhost:8080/widgets/controllers/logo-controller.html`
3. ✅ Click **Apply**
4. Dock appears in OBS interface - drag it wherever you like!

### 3. Test It Out

1. In Logo Controller dock, toggle **Preview** (yellow indicator)
2. Logo should appear in overlay
3. Toggle **Show Text** to see name appear
4. Toggle **On Air** (red indicator) when ready to stream
5. Toggle **Preview** off to keep only on-air view

## 📁 Repository Structure

```
carlosromanxyz-obs-studio/
├── widgets/
│   ├── controllers/          # Dock control panels
│   │   └── logo-controller.html
│   └── overlays/             # Browser source visuals
│       └── logo-overlay.html
├── server/
│   ├── serve.js              # Node.js HTTP server
│   └── serve.py              # Python HTTP server
├── docs/
│   └── SETUP.md              # Detailed setup guide
├── package.json              # npm scripts
├── .gitignore
└── README.md
```

## 🎨 Brand Colors

This widget system uses the official Carlos Román brand colors:

- **Pear** (#b1d900) - Primary accent
- **Apple Green** (#82a000) - Secondary accent
- **Avocado** (#5c7000) - Dark variant
- **Davys Gray** (#525252) - Neutral gray
- **Black** (#000000) - Base

## 🧪 Widget Configuration

### Logo Widget

**localStorage Key**: `obs-logo-config`

**Default Configuration**:
```json
{
  "showText": false,
  "isPreview": false,
  "isVisible": false
}
```

**Control Toggles**:
- **Show Text** - Display name and role text next to logo
- **Preview** (🟡 Yellow) - Show in preview monitor (testing)
- **On Air** (🔴 Red) - Show in on-air monitor (live streaming)

**Animation Details**:
- Logo moves left when text appears (smooth 0.8s transition)
- Pulsing dots animation (2s infinite)
- Role text rotates every 4 seconds

## 🔌 OBS WebSocket (Optional)

The controller includes optional OBS WebSocket support for advanced automation.

**Setup** (if you want it):

1. Install [obs-websocket](https://github.com/obsproject/obs-websocket) plugin (usually included in OBS 28+)
2. In OBS: **Tools** → **WebSocket Server Settings**
3. Enable server on port **4455**
4. Set password (or leave blank)
5. Edit `logo-controller.html` line 173:
   ```javascript
   await obs.connect('ws://localhost:4455', 'your-password')
   ```

**Note**: WebSocket is NOT required. Widgets use localStorage which works perfectly without it.

## 🚀 Advanced Usage

### Export OBS Scene Collection

To share your OBS configuration:

1. In OBS: **Scene Collection** → **Export**
2. Save to `obs-scenes/` folder in this repo
3. Commit to git
4. Import on other PCs: **Scene Collection** → **Import**

### Custom Widget Development

Create new widgets following this pattern:

**Overlay** (`widgets/overlays/my-widget.html`):
- Pure HTML structure
- Tailwind CSS via CDN
- Load config from localStorage
- Listen for storage events
- Apply visual changes

**Controller** (`widgets/controllers/my-widget-controller.html`):
- Tailwind CSS form controls
- Save config to localStorage
- Dispatch custom events
- Update UI feedback

See `logo-overlay.html` and `logo-controller.html` as examples.

## 📖 Documentation

- [Detailed Setup Guide](docs/SETUP.md) - Step-by-step walkthrough
- [Widget Development Guide](docs/WIDGETS.md) - Create custom widgets (coming soon)

## 🐛 Troubleshooting

### Black screen in OBS Browser Source

**Cause**: Server not running or wrong URL

**Fix**:
1. Check server is running: `npm start`
2. Verify URL in browser first: `http://localhost:8080/widgets/overlays/logo-overlay.html`
3. Copy exact URL to OBS Browser Source

### Logo not updating when toggling controls

**Cause**: localStorage not syncing between dock and overlay

**Fix**:
1. Refresh browser source (right-click → **Refresh**)
2. Check browser console for errors
3. Verify same localhost URL in both dock and source

### Controller shows "Not connected" (OBS WebSocket)

**Cause**: OBS WebSocket not enabled or wrong password

**Fix**:
- WebSocket is OPTIONAL - widget works without it
- If you want it: Enable in **Tools** → **WebSocket Server Settings**
- Update password in `logo-controller.html` line 173

### Server won't start (port conflict)

**Cause**: Port 8080 already in use

**Fix**: Edit `server/serve.js` or `server/serve.py` and change PORT to 8081, 8082, etc.

## 🤝 Contributing

This is a personal OBS setup repository, but feel free to:
- Fork for your own use
- Suggest improvements via issues
- Share your custom widgets

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

**Carlos Román**
- GitHub: [@carlosromanxyz](https://github.com/carlosromanxyz)
- Portfolio: [carlosroman.xyz](https://carlosroman.xyz)

---

Made with ❤️ for streaming
