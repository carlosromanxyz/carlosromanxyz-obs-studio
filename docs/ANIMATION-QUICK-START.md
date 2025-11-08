# Entrance Animation Quick Start Guide

## TL;DR

Add state-driven entrance animations to any widget overlay in 6 steps:

```javascript
// 1. Add state tracking
let previousConfig = null;
let isAnimating = false;

// 2. Detect state changes
function detectStateChange(prev, curr) {
  if (prev === null) return true;
  return prev.isVisible !== curr.isVisible;
}

// 3. Update applyConfig() to check for changes
function applyConfig(config) {
  const isStateChange = detectStateChange(previousConfig, config);
  if (!isStateChange && previousConfig !== null) return;

  if (!config.isVisible) {
    hideImmediate();
  } else {
    const wasHidden = !previousConfig || !previousConfig.isVisible;
    if (wasHidden) playEntranceAnimation(config);
    else updateState(config);
  }

  previousConfig = { ...config };
}

// 4. Define CSS animations
// 5. Create playEntranceAnimation()
// 6. Test!
```

---

## Step-by-Step Implementation

### Step 1: Add State Tracking Variables

Add these at the top of your `<script>` block:

```javascript
// BEFORE (existing)
const DEFAULT_CONFIG = {
  isVisible: true,
  // ... other properties
};

// ADD (new)
let previousConfig = null;  // Tracks last applied config
let isAnimating = false;    // Animation in-progress flag
let animationTimeouts = []; // For cleanup (if using setTimeout)
```

---

### Step 2: Create State Change Detection Function

Add this function before `applyConfig()`:

```javascript
function detectStateChange(prev, curr) {
  // Always trigger on initial load
  if (prev === null) return true;

  // Add all properties that should trigger animations when changed
  return (
    prev.isVisible !== curr.isVisible ||
    prev.someOtherProperty !== curr.someOtherProperty
  );
}
```

**Customize the comparison:**
- Add any config properties that should trigger re-animation
- For most widgets, `isVisible` is sufficient
- For complex widgets, add other state properties

---

### Step 3: Update `applyConfig()` Function

Replace your existing `applyConfig()` with this pattern:

```javascript
function applyConfig(config) {
  // NEW: Detect if config actually changed
  const isStateChange = detectStateChange(previousConfig, config);

  // NEW: Skip if no change (prevents polling interference)
  if (!isStateChange && previousConfig !== null) {
    return;
  }

  // NEW: Cancel in-flight animations on state change
  if (isAnimating) {
    cancelAllAnimations();
  }

  // EXISTING: Handle visibility
  if (!config.isVisible) {
    hideImmediate(); // Your existing hide function
  } else {
    // NEW: Check if transitioning from hidden state
    const wasHidden = previousConfig === null || !previousConfig.isVisible;

    if (wasHidden) {
      // NEW: Play entrance animation
      playEntranceAnimation(config);
    } else {
      // EXISTING: Already visible, just update state
      updateVisibleState(config);
    }
  }

  // NEW: Cache current config as previous
  previousConfig = { ...config };

  console.log('📺 Overlay updated:', config);
}
```

---

### Step 4: Define CSS Animations

Add these to your `<style>` block:

```css
/* ============================================ */
/* ENTRANCE ANIMATIONS */
/* ============================================ */

/* Simple fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade + scale up */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade + scale up with bounce */
@keyframes fadeInScaleBounce {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade + slide from right */
@keyframes fadeInSlideRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animation classes with timing */
.animate-entrance-main {
  animation: fadeInScale 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.animate-entrance-secondary {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.6s;
  opacity: 0;
}

.animate-entrance-tertiary {
  animation: fadeInSlideRight 0.5s ease-out forwards;
  animation-delay: 1.0s;
  opacity: 0;
}

/* Reset class - removes animation, sets final state */
.reset-entrance {
  animation: none !important;
  opacity: 1;
  transform: scale(1) translateX(0);
}
```

**Customize animations:**
- Adjust `animation-delay` for stagger timing
- Use different keyframes for different effects
- Keep `opacity: 0` as initial state on animation classes

---

### Step 5: Create `playEntranceAnimation()` Function

Add this function (customize element IDs to match your HTML):

```javascript
function playEntranceAnimation(config) {
  isAnimating = true;

  // Get elements to animate (CUSTOMIZE THESE IDs)
  const mainElement = document.getElementById('your-main-element');
  const secondaryElement = document.getElementById('your-secondary-element');
  const tertiaryElement = document.getElementById('your-tertiary-element');

  const elements = [mainElement, secondaryElement, tertiaryElement];
  const animationClasses = [
    'animate-entrance-main',
    'animate-entrance-secondary',
    'animate-entrance-tertiary'
  ];

  // Reset any previous animations
  elements.forEach(el => {
    animationClasses.forEach(className => {
      el.classList.remove(className);
    });
    el.classList.remove('reset-entrance');
  });

  // Force reflow to restart animations
  void document.body.offsetWidth;

  // Make container visible
  const container = document.getElementById('your-container');
  container.style.opacity = '1';

  // Apply animation classes
  mainElement.classList.add('animate-entrance-main');
  secondaryElement.classList.add('animate-entrance-secondary');
  tertiaryElement.classList.add('animate-entrance-tertiary');

  // Listen for completion on last animating element
  const lastElement = tertiaryElement;

  lastElement.addEventListener('animationend', () => {
    isAnimating = false;

    // Clean up animation classes
    elements.forEach(el => {
      animationClasses.forEach(className => {
        el.classList.remove(className);
      });
      el.classList.add('reset-entrance');
    });

    // Apply any post-animation state (optional)
    if (config.someProperty) {
      applyPostAnimationState(config);
    }
  }, { once: true });
}
```

**Customize this function:**
- Replace element IDs with your actual IDs
- Add/remove elements as needed
- Adjust which element is the "last" for `animationend` listener
- Add post-animation logic if needed

---

### Step 6: Add Helper Functions

Add these utility functions:

```javascript
function hideImmediate() {
  const container = document.getElementById('your-container');
  container.style.opacity = '0';
  isAnimating = false;
}

function cancelAllAnimations() {
  // Clear any setTimeout IDs (if you're using them)
  animationTimeouts.forEach(timeout => clearTimeout(timeout));
  animationTimeouts = [];
  isAnimating = false;

  // Remove all animation classes
  const animatedElements = document.querySelectorAll('[class*="animate-entrance-"]');
  animatedElements.forEach(el => {
    el.className = el.className.replace(/animate-entrance-\S+/g, '');
  });
}
```

---

## Complete Minimal Example

Here's a minimal working example for a simple overlay:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Animated Overlay</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: transparent;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-entrance {
      animation: fadeIn 0.5s ease-out forwards;
      animation-delay: 0.2s;
      opacity: 0;
    }

    .reset-entrance {
      animation: none !important;
      opacity: 1;
    }
  </style>
</head>
<body>

  <div id="overlay-container">
    <div id="content" class="text-white text-2xl">
      Hello, OBS!
    </div>
  </div>

  <script>
    const DEFAULT_CONFIG = { isVisible: true };

    let previousConfig = null;
    let isAnimating = false;

    function loadConfig() {
      const saved = localStorage.getItem('obs-simple-overlay-config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    }

    function detectStateChange(prev, curr) {
      if (prev === null) return true;
      return prev.isVisible !== curr.isVisible;
    }

    function applyConfig(config) {
      const isStateChange = detectStateChange(previousConfig, config);
      if (!isStateChange && previousConfig !== null) return;

      if (!config.isVisible) {
        hideImmediate();
      } else {
        const wasHidden = !previousConfig || !previousConfig.isVisible;
        if (wasHidden) playEntranceAnimation();
        else showImmediate();
      }

      previousConfig = { ...config };
    }

    function playEntranceAnimation() {
      isAnimating = true;

      const content = document.getElementById('content');
      const container = document.getElementById('overlay-container');

      // Reset
      content.classList.remove('animate-entrance', 'reset-entrance');
      void document.body.offsetWidth;

      // Animate
      container.style.opacity = '1';
      content.classList.add('animate-entrance');

      // Cleanup
      content.addEventListener('animationend', () => {
        isAnimating = false;
        content.classList.remove('animate-entrance');
        content.classList.add('reset-entrance');
      }, { once: true });
    }

    function hideImmediate() {
      document.getElementById('overlay-container').style.opacity = '0';
      isAnimating = false;
    }

    function showImmediate() {
      document.getElementById('overlay-container').style.opacity = '1';
    }

    // Sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'obs-simple-overlay-config') {
        applyConfig(loadConfig());
      }
    });

    setInterval(() => applyConfig(loadConfig()), 1000);

    window.addEventListener('DOMContentLoaded', () => {
      applyConfig(loadConfig());
    });
  </script>
</body>
</html>
```

---

## Testing Checklist

After implementation, test these scenarios:

### Browser Testing (First)

```bash
npm start
open http://localhost:8080/widgets/overlays/your-overlay.html
```

- [ ] **Initial Load (Visible)**: Page loads with `isVisible: true` → should animate
- [ ] **Initial Load (Hidden)**: Page loads with `isVisible: false` → should be hidden (no animation)
- [ ] **Toggle ON**: Controller changes `isVisible: false → true` → should animate
- [ ] **Toggle OFF**: Controller changes `isVisible: true → false` → should hide immediately
- [ ] **Rapid Toggle**: Toggle ON/OFF/ON quickly → should cancel first animation and restart
- [ ] **Refresh While Visible**: Refresh page with `isVisible: true` → should re-animate
- [ ] **Polling Works**: Wait 1-2 seconds after controller toggle → overlay should update

### OBS Testing (After Browser)

- [ ] **Browser Source Loads**: Add overlay as Browser Source → appears correctly
- [ ] **Controller Sync**: Open Custom Dock controller → toggle updates overlay
- [ ] **Transparency**: Overlay background is transparent (only content visible)
- [ ] **Performance**: Animation runs at 60fps with no stuttering
- [ ] **Persistence**: Restart OBS → overlay remembers last state

---

## Common Issues & Solutions

### Issue: Animation doesn't restart when toggling

**Cause**: CSS animation class already applied
**Solution**: Remove class, force reflow, re-apply

```javascript
element.classList.remove('animate-entrance');
void document.body.offsetWidth; // ← Force reflow
element.classList.add('animate-entrance');
```

---

### Issue: Overlay updates immediately every second (no animation)

**Cause**: Polling triggers `applyConfig()` even when config hasn't changed
**Solution**: Ensure `detectStateChange()` returns false for identical configs

```javascript
if (!isStateChange && previousConfig !== null) {
  return; // ← This line prevents unnecessary processing
}
```

---

### Issue: Animation is choppy/janky

**Cause**: Animating layout properties instead of GPU properties
**Solution**: Only animate `opacity` and `transform`

```css
/* ❌ BAD - causes layout thrashing */
@keyframes badAnimation {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ GOOD - GPU accelerated */
@keyframes goodAnimation {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

---

### Issue: Animation plays on every config update (even text changes)

**Cause**: `detectStateChange()` returns true for all property changes
**Solution**: Only compare properties that should trigger entrance animation

```javascript
function detectStateChange(prev, curr) {
  if (prev === null) return true;

  // Only trigger animation if visibility changed
  // NOT if other properties like text, color, etc. changed
  return prev.isVisible !== curr.isVisible;
}
```

---

## Animation Timing Guide

Standard timing conventions:

```css
/* Micro-interactions (hover, focus) */
transition: 0.2s;

/* Standard transitions (show/hide elements) */
animation-duration: 0.4s;

/* Entrance animations (first element) */
animation-delay: 0.2s;
animation-duration: 0.5s;

/* Staggered elements (second, third, etc.) */
animation-delay: 0.6s; /* +0.4s from first */
animation-delay: 1.0s; /* +0.4s from second */

/* Infinite loops (pulse, rotate) */
animation-duration: 2s;
```

---

## GPU-Accelerated Properties Reference

**Only animate these for smooth 60fps:**

✅ **Opacity**
```css
animation: fadeIn 0.5s;
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

✅ **Transform (Translate)**
```css
animation: slideIn 0.5s;
@keyframes slideIn {
  from { transform: translateX(100px); }
  to { transform: translateX(0); }
}
```

✅ **Transform (Scale)**
```css
animation: scaleUp 0.5s;
@keyframes scaleUp {
  from { transform: scale(0.8); }
  to { transform: scale(1); }
}
```

✅ **Transform (Rotate)**
```css
animation: spin 2s infinite;
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

✅ **Transform (Combined)**
```css
animation: complexEntrance 0.5s;
@keyframes complexEntrance {
  from { transform: translateY(20px) scale(0.9); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
```

---

**Never animate these (causes layout thrashing):**

❌ `margin`, `padding`
❌ `top`, `left`, `right`, `bottom`
❌ `width`, `height`
❌ `background-color` (use `opacity` on overlay element instead)

---

## Next Steps

1. **Copy this pattern** to your overlay HTML file
2. **Customize** element IDs, animation classes, and timing
3. **Test in browser** with controller toggles
4. **Test in OBS** with Browser Source + Custom Dock
5. **Iterate** on timing and easing until it feels right

**Reference Implementations:**
- `/widgets/overlays/logo-overlay-enhanced.html` - Full example with multiple staggered elements
- `/docs/ANIMATION-PATTERN.md` - Detailed explanation of the pattern
- `/docs/REACT-VS-VANILLA-COMPARISON.md` - Comparison with React/Framer Motion approach

**Questions?** Check the troubleshooting section or reference the full pattern documentation.
