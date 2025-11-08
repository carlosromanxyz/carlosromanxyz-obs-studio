# State-Driven Animation Pattern for Vanilla JS Overlays

## Overview

This document describes the **State Transition Manager Pattern** for triggering entrance animations in vanilla JavaScript overlays, inspired by React + Framer Motion patterns but implemented for zero-build environments.

## Problem Statement

**Source Pattern (React + Framer Motion):**
```tsx
const [logoVisible, setLogoVisible] = useState(false);

<AnimatePresence mode='wait'>
  {logoVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Challenges in Vanilla JS + localStorage:**
1. No automatic re-render on state change
2. Polling can trigger config application unnecessarily
3. No built-in mount/unmount animation system
4. Need to detect actual state transitions, not just current state

## Solution: State Transition Manager Pattern

### Core Concepts

1. **Previous State Tracking**: Cache previous config to detect transitions
2. **Animation State Machine**: Track whether animations are in progress
3. **Idempotent Config Application**: Only trigger animations on actual changes
4. **CSS Animation Classes**: Declarative animations with staggered delays
5. **Cleanup Management**: Cancel in-flight animations on rapid toggles

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ localStorage Sync (storage events + 1s polling)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ applyConfig(config)                                         │
│  ├─ detectStateChange(prev, curr) → boolean                │
│  ├─ Skip if no change (prevents polling interference)      │
│  └─ Route to correct handler based on transition           │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│ hideLogoImmediate()  │  │ playEntranceAnimation│
│  (isVisible: false)  │  │  (false → true)      │
└──────────────────────┘  └──────────┬───────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
            ┌────────────┐  ┌────────────┐  ┌────────────┐
            │ CSS Anim 1 │  │ CSS Anim 2 │  │ CSS Anim 3 │
            │ delay: 0.2s│  │ delay: 0.8s│  │ delay: 1.0s│
            └────────────┘  └────────────┘  └────────────┘
```

## Implementation

### 1. State Tracking Variables

```javascript
let previousConfig = null;  // Tracks last applied config
let isAnimating = false;    // Animation in-progress flag
let animationTimeouts = []; // Cleanup array for setTimeout IDs
```

### 2. State Change Detection

```javascript
function detectStateChange(prev, curr) {
  if (prev === null) return true; // Initial load always triggers

  // Compare relevant properties
  return (
    prev.isVisible !== curr.isVisible ||
    prev.showText !== curr.showText
  );
}
```

### 3. Idempotent Config Application

```javascript
function applyConfig(config) {
  const isStateChange = detectStateChange(previousConfig, config);

  // CRITICAL: Skip if no actual change (prevents polling interference)
  if (!isStateChange && previousConfig !== null) {
    return;
  }

  // Cancel in-flight animations on new state change
  if (isAnimating) {
    cancelAllAnimations();
  }

  // Route based on visibility transition
  if (!config.isVisible) {
    hideLogoImmediate();
  } else {
    const wasHidden = previousConfig === null || !previousConfig.isVisible;

    if (wasHidden) {
      playEntranceAnimation(config); // Animate entrance
    } else {
      // Already visible, just update other properties
      updateVisibleState(config);
    }
  }

  // Cache current config as previous
  previousConfig = { ...config };
}
```

### 4. CSS Animation Classes (Preferred Approach)

**Why CSS classes over JS setTimeout chains?**
- GPU-accelerated by default
- Declarative timing (easier to adjust)
- Better performance (compositor thread)
- Easier to maintain and debug

```css
/* Define keyframes */
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

/* Apply with staggered delays */
.animate-entrance-circle-outer {
  animation: fadeInScale 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards;
  animation-delay: 0.2s;
  opacity: 0; /* Initial state */
}

.animate-entrance-braces {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;
}
```

### 5. JavaScript Animation Trigger

```javascript
function playEntranceAnimation(config) {
  isAnimating = true;

  const greenCircle = document.getElementById('circle-outer');
  const braces = document.querySelectorAll('.brace');
  const dots = document.querySelectorAll('.pulse-dot');

  // Reset classes (in case re-triggering)
  [greenCircle, ...braces, ...dots].forEach(el => {
    el.classList.remove('animate-entrance-circle-outer',
                        'animate-entrance-braces',
                        'animate-entrance-dots');
  });

  // Force reflow to reset animations
  void document.body.offsetWidth;

  // Apply animation classes
  greenCircle.classList.add('animate-entrance-circle-outer');
  braces.forEach(brace => brace.classList.add('animate-entrance-braces'));
  dots.forEach(dot => dot.classList.add('animate-entrance-dots'));

  // Listen for completion on last element
  const lastElement = dots[dots.length - 1];
  lastElement.addEventListener('animationend', () => {
    isAnimating = false;

    // Clean up animation classes
    [greenCircle, ...braces, ...dots].forEach(el => {
      el.classList.remove('animate-entrance-circle-outer',
                          'animate-entrance-braces',
                          'animate-entrance-dots');
      el.classList.add('reset-entrance'); // Final state
    });

    // Trigger next phase (e.g., text appearance)
    if (config.showText) {
      showLogoWithText();
    }
  }, { once: true });
}
```

### 6. Animation Cleanup

```javascript
function cancelAllAnimations() {
  // Clear any pending setTimeout IDs
  animationTimeouts.forEach(timeout => clearTimeout(timeout));
  animationTimeouts = [];
  isAnimating = false;

  // Remove animation classes immediately
  const animatedElements = document.querySelectorAll('[class*="animate-entrance-"]');
  animatedElements.forEach(el => {
    el.className = el.className.replace(/animate-entrance-\S+/g, '');
  });
}
```

## Edge Cases Handled

### 1. Rapid Toggling

**Problem**: User toggles visibility multiple times quickly
**Solution**: Cancel in-flight animations before starting new ones

```javascript
if (isAnimating) {
  cancelAllAnimations();
}
```

### 2. Page Refresh While Visible

**Problem**: If `isVisible=true` in localStorage, should animate on page load
**Solution**: Treat `previousConfig === null` as "was hidden"

```javascript
const wasHidden = previousConfig === null || !previousConfig.isVisible;

if (wasHidden) {
  playEntranceAnimation(config); // ✅ Animates on page load
}
```

### 3. localStorage Polling Interference

**Problem**: 1s polling calls `applyConfig()` repeatedly with same config
**Solution**: Skip processing if no actual state change

```javascript
if (!isStateChange && previousConfig !== null) {
  return; // ✅ No unnecessary DOM manipulation
}
```

### 4. Animation Re-triggering

**Problem**: CSS animations won't restart if class is already applied
**Solution**: Remove class, force reflow, re-apply class

```javascript
element.classList.remove('animate-entrance-circle-outer');
void document.body.offsetWidth; // Force reflow
element.classList.add('animate-entrance-circle-outer'); // ✅ Restarts animation
```

## Animation Timing Strategy

### React + Framer Motion Timings (Source)

```typescript
// Outer circle
transition={{ duration: 0.5, delay: 0.2 }}

// Braces
transition={{ duration: 0.5, delay: 0.8 }}

// Dots
transition={{ duration: 0.5, delay: 1.0 }}
```

### Vanilla JS CSS Timings (Target)

```css
/* Match React timing exactly */
.animate-entrance-circle-outer {
  animation-delay: 0.2s;  /* Same as Framer Motion */
  animation-duration: 0.5s;
}

.animate-entrance-braces {
  animation-delay: 0.8s;
  animation-duration: 0.5s;
}

.animate-entrance-dots {
  animation-delay: 1.0s;
  animation-duration: 0.5s;
}
```

**Timeline Visualization:**

```
0ms ──────────────────────────────────────────────────────────────> 1500ms
     │                  │                      │            │
     │                  │                      │            └─ Dots fade complete (1500ms)
     │                  │                      └─ Dots start fading (1000ms)
     │                  └─ Braces start fading (800ms)
     └─ Circles start animating (200ms)
```

## Performance Considerations

### GPU-Accelerated Properties

✅ **ONLY animate these:**
- `opacity`
- `transform` (translate, scale, rotate)

❌ **NEVER animate these:**
- `margin`, `padding`
- `top`, `left`, `right`, `bottom`
- `width`, `height`
- `background-color` (use `opacity` on overlay instead)

### Why?

- GPU properties run on compositor thread (60fps, no jank)
- Layout properties force synchronous reflow on main thread (janky)

### Example Conversion

**BAD (layout thrashing):**
```javascript
element.style.left = '100px'; // Forces reflow every frame
```

**GOOD (GPU-accelerated):**
```javascript
element.style.transform = 'translateX(100px)'; // Compositor thread
```

## OBS CEF Compatibility

### Supported APIs
✅ CSS transitions/animations
✅ `classList` API
✅ `setTimeout` / `setInterval`
✅ `animationend` event
✅ `localStorage`

### Avoid (not needed, but noting for reference)
❌ Web Animations API (not in older CEF)
❌ CSS `@supports` queries (unnecessary complexity)
❌ IntersectionObserver (not needed for this use case)

## Testing Strategy

### 1. Browser Testing (First)

```bash
# Start server
npm start

# Open overlay in browser
open http://localhost:8080/widgets/overlays/logo-overlay-enhanced.html

# Open controller in another tab
open http://localhost:8080/widgets/controllers/overlays-controller.html

# Test scenarios:
# - Toggle visibility OFF → ON (should animate)
# - Toggle visibility ON → OFF (instant hide)
# - Toggle text ON → OFF while visible (no entrance animation)
# - Refresh page with isVisible=true (should animate)
# - Rapid toggling (should cancel previous animation)
```

### 2. OBS Testing (After Browser)

```
1. Add Browser Source → logo-overlay-enhanced.html
2. Open Custom Dock → overlays-controller.html
3. Test same scenarios as browser
4. Verify 1-2 second sync delay (expected with polling)
5. Check transparency (body background should be transparent)
```

### 3. Console Debugging

```javascript
// Add to playEntranceAnimation()
console.log('🎬 Starting entrance animation', {
  wasHidden: previousConfig === null || !previousConfig.isVisible,
  currentConfig: config,
  previousConfig: previousConfig
});

// Add to detectStateChange()
console.log('🔍 State change detection', {
  prev: prev,
  curr: curr,
  changed: /* return value */
});
```

## Migration Guide

### Converting Existing Overlays

**Step 1**: Add state tracking variables
```javascript
let previousConfig = null;
let isAnimating = false;
let animationTimeouts = [];
```

**Step 2**: Add `detectStateChange()` function
```javascript
function detectStateChange(prev, curr) {
  if (prev === null) return true;
  return prev.isVisible !== curr.isVisible; // Add other properties as needed
}
```

**Step 3**: Update `applyConfig()` to check for changes
```javascript
function applyConfig(config) {
  const isStateChange = detectStateChange(previousConfig, config);

  if (!isStateChange && previousConfig !== null) {
    return; // Skip if no change
  }

  // ... existing logic

  previousConfig = { ...config }; // Cache current as previous
}
```

**Step 4**: Add entrance animation CSS
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-entrance {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
}
```

**Step 5**: Create `playEntranceAnimation()` function
```javascript
function playEntranceAnimation(config) {
  isAnimating = true;

  const element = document.getElementById('your-element');
  element.classList.remove('animate-entrance');
  void document.body.offsetWidth;
  element.classList.add('animate-entrance');

  element.addEventListener('animationend', () => {
    isAnimating = false;
    element.classList.remove('animate-entrance');
  }, { once: true });
}
```

**Step 6**: Update visibility logic in `applyConfig()`
```javascript
if (!config.isVisible) {
  hideImmediate();
} else {
  const wasHidden = previousConfig === null || !previousConfig.isVisible;

  if (wasHidden) {
    playEntranceAnimation(config); // NEW: Animate entrance
  } else {
    showImmediate(); // Already visible, just ensure visible
  }
}
```

## Best Practices

### 1. Always Cache Previous State
```javascript
// ✅ GOOD
previousConfig = { ...config };

// ❌ BAD (reference copy)
previousConfig = config;
```

### 2. Use `{ once: true }` for Event Listeners
```javascript
// ✅ GOOD (auto-removes listener)
element.addEventListener('animationend', handler, { once: true });

// ❌ BAD (memory leak if not manually removed)
element.addEventListener('animationend', handler);
```

### 3. Force Reflow Before Re-Triggering Animations
```javascript
// ✅ GOOD
element.classList.remove('animate-class');
void element.offsetWidth; // Force reflow
element.classList.add('animate-class');

// ❌ BAD (animation won't restart)
element.classList.remove('animate-class');
element.classList.add('animate-class');
```

### 4. Clean Up Timeouts
```javascript
// ✅ GOOD
animationTimeouts.push(setTimeout(() => {}, 1000));

function cancelAllAnimations() {
  animationTimeouts.forEach(timeout => clearTimeout(timeout));
  animationTimeouts = [];
}

// ❌ BAD (memory leak)
setTimeout(() => {}, 1000); // No reference to clear
```

## Summary

The **State Transition Manager Pattern** provides a robust, performant way to implement React/Framer Motion-style entrance animations in vanilla JavaScript environments without build tools. Key takeaways:

1. **Track previous state** to detect transitions, not just current state
2. **Skip unnecessary processing** to prevent polling interference
3. **Use CSS animations** with classes for GPU acceleration
4. **Handle edge cases** (rapid toggling, page refresh, re-triggering)
5. **Clean up resources** (timeouts, event listeners, animation classes)

This pattern works seamlessly with the existing localStorage sync mechanism and maintains OBS CEF compatibility while delivering smooth, professional animations comparable to modern framework implementations.

---

**Reference Implementation**: `/widgets/overlays/logo-overlay-enhanced.html`

**Related Documentation**:
- `CLAUDE.md` - Project architecture and patterns
- `docs/SETUP.md` - OBS integration setup
- `README.md` - Widget overview
