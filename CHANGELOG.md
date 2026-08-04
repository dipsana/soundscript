# 📜 CHANGELOG

All notable changes to this project will be documented in this file.

This project follows **Semantic Versioning**.

---

## [1.0.2] – 2026-08-04

### ✨ Added

* Configurable media source support (GitHub CDN or local assets)
* Complete offline workflow for personal music libraries
* Local media library setup documentation
* CDN switching through a single `CDN_BASE` configuration
* Playback statistics for Trending, Loved and Hated songs

### 🐛 Fixed

* Card slider synchronization when sections are hidden or restored
* Slider index calculation during dynamic layout changes
* `ResizeObserver` metric synchronization for hidden containers
* Invalid (`NaN`) slider index propagation during section transitions
* Improved playback state synchronization across navigation

### ♻️ Improved

* Refined project documentation and setup instructions
* Simplified local development workflow
* Clear separation between online and offline usage
* Better application stability during dynamic UI updates
* General code cleanup and internal synchronization improvements

---

## [1.0.1] – 2026-01-06

### 🐛 Bug Fixes & Polish

#### Fixed

* Mini-bar 2D drag calculation for modern browsers
* Mobile touch interference (`touch-action: none`)
* Seek-bar synchronization and drag coordinate precision
* Hamburger menu pre-load flicker (CSS-only toggle)
* Play-bar visibility flash during initial load
* Touch-swipe direction detection in the card slider
* Dynamic **Show All** button visibility
* Loading system race conditions
* UI synchronization across player and navigation modules

#### Refactored

* Replaced fragile `DOMContentLoaded` loader with manual control
* Added `hideSect()` and `showSect()` for reliable SPA-style navigation
* Removed deprecated `loadingPage()` implementation
* Simplified event listener dependencies

#### Improved

* Smoother mobile gesture handling
* More consistent UI feedback
* More reliable client-side navigation

---

## [1.0.0] – 2026-01-04

### 🎉 Initial Stable Release

The first stable release of **SoundScript**, introducing a modular frontend-only music streaming architecture powered by a configurable external media repository.

---

### 📦 Payload Metrics

| Category             | Size                      |
| :------------------- | :------------------------ |
| Documentation        | 131 KB (134,405 bytes)    |
| Source Code          | 99.8 KB (102,250 bytes)   |
| Local UI Assets      | 2.29 MB (2,407,432 bytes) |
| **Core Application** | **≈ 2.52 MB**             |

> Media files are intentionally excluded and served through the separate **SoundScript-CDN** repository.

---

### ✨ Core Features

* Modular Vanilla JavaScript architecture
* Event-driven playback engine
* Dynamic album discovery
* Real-time queue management
* Responsive multi-device interface
* Live search
* Persistent playback statistics
* Touch-enabled card slider system
* Floating mini player
* CDN-powered media delivery

---

### 🧠 Architecture

* Modular application structure
* Custom event emitter
* Configurable CDN abstraction layer
* LocalStorage-backed persistent state
* O(1) runtime data access after initialization

---

### 🎨 User Experience

* Responsive layouts
* Animated interface
* Mobile navigation
* Smart mini-player
* Interactive playback controls
* Smooth transitions and visual feedback

---

### 🛠️ Developer Experience

* Modular CSS architecture
* GitHub CDN integration
* Semantic Versioning
* MIT License
* Organized project structure

---

### 🔐 Security

* Local-only playback statistics
* Controlled application state mutation
* Static CDN-based media delivery

---

### 🚀 Release Notes

* Initial stable public release
* Foundation for future feature development
