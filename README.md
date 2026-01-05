# 🎧 SoundScript

> A fully frontend, CDN-powered music streaming architecture built to study real-world performance, modularity, and media delivery design.

[**Live Demo**](https://dipsana.github.io/soundscript/)

**SoundScript** is a modular, CDN-powered client-side music streaming platform that delivers a modern experience using a **pure CDN media architecture** — no backend, no frameworks, no shortcuts.

It features:

* Real-time queue engine
* Modular audio core
* Event-driven UI system
* CDN-powered media plane
* Responsive multi-device interface
* Dynamic album detection
* Draggable Mini bar, UI, and state persistence

This project is an architectural learning build focused on **performance, correctness, and maintainability**.

---

## 🔖 Tech Stack

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat\&logo=html5\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat\&logo=css3\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat\&logo=javascript\&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
![GitHub CDN](https://img.shields.io/badge/GitHub-CDN-181717?style=flat\&logo=github\&logoColor=white)

---

## 📦 Project Status

* **Project Name:** SoundScript
* **Status:** Stable (Production‑Ready)
* **Current Version:** v1.0.1
* **Release Type:** Bug‑fix & Polish
* **Media Delivery:** External CDN (soundscript‑cdn)
* **Architecture:** Modular Vanilla JS (no frameworks)

---

## 📋 Recent Updates (v1.0.1)

| Date       | Version | Highlights                                                                |
|------------|---------|---------------------------------------------------------------------------|
| 2026‑01‑05 | v1.0.1  | Mobile drag fixes, swipe logic, loader refactor, UI polish, bug squashing |
| 2026‑01‑04 | v1.0.0  | Initial stable production release with full CDN architecture              |

*For detailed changes, see [CHANGELOG.md](CHANGELOG.md)*

---

## 📂 Project Structure

```text
soundscript/
│
├── assets/
│   ├── font/
│   ├── icons/
│   ├── favicon.png
│   └── preview.png
│
├── css/
│   ├── animations.css
│   ├── base.css
│   ├── components.css
│   ├── utilities.css
│   ├── comp-resp.css
│   └── utils-resp.css
│
├── js/
│   ├── init.js
│   ├── gen-util.js
│   ├── gen-main.js
│   ├── music-manager.js
│   ├── event-emitter.js
│   ├── card-slider.js
│   ├── nav.js
│   ├── search-bar.js
│   └── ui-util.js
│
├── index.html
│
├── CHANGELOG.md
├── LICENSE
├── README.md
├── SECURITY.md
├── SRS.pdf
└── SRS.docx
```

---

## 🏠 Architecture

💡 **USER → SoundScript App (Logic Plane) → SoundScript-CDN (Media Plane)**

* App logic is fully independent
* CDN holds only static media
* Both are versioned separately

---

## 🌐 CDN Switching

```js
export const CDN_BASE =
  'https://raw.githubusercontent.com/dipsana/soundscript-cdn/main';
```

> CDN and application versions are intentionally decoupled to allow independent media upgrades without application redeployment.

---

## ✨ Features

| Feature        | Description                        |
| -------------- | ---------------------------------- |
| Dynamic Albums | Zero-hardcoded album discovery     |
| Queue Engine   | Event-driven playback controller   |
| Mini Bar       | Draggable floating player UI       |
| Seek Bar       | Color-synced real-time timeline    |
| Search         | Partial title resolver             |
| Stats          | Persistent local playback tracking |
| Responsive     | Multi-device adaptive layout       |

---

## 🧩 Tech Stack

| Layer   | Technology         |
| ------- | ------------------ |
| UI      | HTML5, CSS3        |
| Logic   | Vanilla JavaScript |
| Audio   | Web Audio API      |
| Storage | LocalStorage       |
| Media   | GitHub CDN         |

---

## 🛠️ Local Development

```bash
npx serve .
```

---

## 📦 CDN Repository

Media files are stored separately:

> [https://github.com/dipsana/soundscript-cdn](https://github.com/dipsana/soundscript-cdn)

---

## 🧾 Deployment Readiness

SoundScript v1.0.1 is:

* Path-stable
* Cache-safe
* CDN-optimized
* Mobile-production-ready
* Framework-independent

---

## 📈 Learning Outcomes

* Modular architecture
* CDN media separation
* Event-driven UI design
* Performance-optimized rendering
* State preservation logic
* Professional project structuring

---

## 🔮 Future Roadmap

* Playlist creator
* Shuffle engine
* Full search
* Backend auth
* Cloudflare CDN mirror
* Multilingual UI

---

## 🙋‍♂️ Contributors

**Dipsana Roy** — Creator & Maintainer

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 📚 References

1. IEEE Software Requirements Specification (SRS) Standards
2. MDN Web Docs — Web Audio API, HTML, CSS & JavaScript specifications
3. DeepSeek — Core learning support & architectural validation
4. ChatGPT — Documentation & architectural validation
