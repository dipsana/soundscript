# 🔐 Security Policy

## 📦 Project Name: SoundScript

**Version:** v1.0.2
**Status:** Stable
**Architecture:** Frontend-Only, Configurable Media Source (GitHub CDN / Local Assets)

---

## 🛡️ Overview

SoundScript is a **fully client-side, CDN-powered music streaming application**.  
It contains **no backend servers, no authentication layers, and no remote code execution paths**.

Media can be served either from a static GitHub CDN or from a local media library. In both cases, SoundScript remains a fully client-side application with no backend services.

Because of this architecture, SoundScript is **inherently resistant to server-side attack vectors**.

---

## 🔒 Data Handling

| Data Type        | Storage Location | Notes                         |
| ---------------- | ---------------- | ----------------------------- |
| Play counts      | LocalStorage     | Stored locally on user device |
| Likes / Dislikes | LocalStorage     | Never transmitted externally  |
| UI State         | LocalStorage     | Session-persistent            |
| Media Assets     | CDN (static)     | GitHub CDN or Local Assets    |

**No personal information, credentials, or user identifiers are collected.**

---

## 🌐 Media Security

SoundScript uses a **read‑only static CDN** (`soundscript‑cdn`) for:

* MP3 audio files
* Album artwork
* Artist images
* Metadata JSON

CDN assets:

* Contain no executable scripts
* Are immutable between versions
* Cannot modify application behavior

---

## 🧱 Client-Side Isolation

* No cookies are used
* No session tokens are generated
* No background network polling
* No WebSocket connections
* No dynamic remote script injection

This eliminates risks of:

* XSS via remote payloads
* CSRF
* Session hijacking
* Account data leakage

---

## ⚠️ Known Security Boundaries

* **LocalStorage data is not encrypted** — though it contains only non-sensitive playback stats.
* **CDN content is public accessible** — anyone with the CDN URL can access media files.
* **Browser extensions** could potentially interfere with or observe playback state.

---

## 🐞 Reporting Vulnerabilities

If you discover a security issue:

* Open a GitHub Security Advisory (preferred), or create a GitHub Issue if the issue is not sensitive.
* Or contact the maintainer directly

Please include:

* Description of the issue
* Steps to reproduce
* Browser & device information

All valid security reports will be reviewed promptly.

---

## 🔐 Third-Party Dependencies

SoundScript intentionally minimizes external dependencies.

Runtime technologies include:

* Browser Web Audio API
* LocalStorage
* GitHub Pages (online version)
* GitHub CDN (optional media delivery)

No third-party JavaScript frameworks or analytics libraries are required for normal operation.

---

## 📈 Future Security Scope

Future releases will continue to prioritize a minimal attack surface while preserving SoundScript's frontend-only architecture.

Potential security improvements include:

* Optional integrity verification for media metadata
* Stronger validation of locally loaded media assets
* Content Security Policy (CSP) recommendations
* Additional safeguards against invalid or malformed media metadata
* Ongoing security reviews as new features are introduced

The security policy will be updated as the project's architecture evolves.

---

## 🏁 Final Note

SoundScript v1.0.2 is a frontend-only application with a deliberately minimal attack surface.

No accounts.
No trackers.
No telemetry.

Your playback statistics stay on your device.
Your media remains under your control—whether streamed from the GitHub CDN or loaded from your local library.
