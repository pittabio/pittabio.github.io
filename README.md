<p>
  <a href="https://pittabio.github.io">
    <img src="media/banner/readme-image.png" alt="Fabio Pittaccio Portfolio Banner" style="width: 800px;">
  </a>
</p>

# Fabio Pittaccio · Gameplay Developer Portfolio

This repository contains the source code for my professional portfolio, hosted on GitHub Pages. The site is designed to showcase my technical expertise in **Unreal Engine 5**, **C++**, and **Gameplay Programming**.

🔗 **Live Site:** [pittabio.github.io](https://pittabio.github.io)

---

## 🛠 Tech Stack

While I am primarily a Gameplay Developer, I built this portfolio with a focus on clean architecture, scalability, and performance:

- **SSG & Build:** [Jekyll 4.4+](https://jekyllrb.com/) powered by **Dart Sass** (`sass-embedded`), built and deployed via custom **GitHub Actions** CI/CD.
- **Templating:** Modular Liquid architecture with shared layouts (`default`, `project`) and reusable components.
- **Frontend:** Vanilla HTML5, modern SCSS (mixins, CSS Grid, custom properties), and vanilla ES6+ JavaScript.
- **Localization:** Custom zero-dependency **i18n** engine with dynamic JSON loading and baseurl auto-prefixing.
- **Analytics & Privacy:** [Umami](https://umami.is/) (privacy-first, cookie-free, EU-hosted) and YouTube-NoCookie embeds.

## 🚀 Key Features

### 1. Advanced Localization (i18n)
The site uses a custom JavaScript engine that dynamically fetches and injects translations from localized JSON files (`/locales/`), allowing for a seamless language switch without page reloads.

### 2. SEO & Open Graph Optimization
- Fully optimized for search engines using a modular Jekyll approach.
- Custom **Open Graph** and **Twitter Cards** implementation for high-quality social sharing previews.
- Dynamic Sitemap generation and `robots.txt` configuration for efficient crawling.

### 3. Modular Architecture
Used Jekyll `_includes` to manage repetitive components (favicons, SEO, analytics, privacy banners) to maintain a **DRY (Don't Repeat Yourself)** codebase.

### 4. Privacy-First by Design (GDPR)
Built with a strong privacy-by-default philosophy, eliminating the need for intrusive cookie consent banners:
- **Cookie-Free Analytics:** Powered by [Umami](https://umami.is/), an open-source and privacy-focused analytics platform hosted in the EU that does not store personal data or use tracking cookies.
- **Privacy-Enhanced Media:** Video embeds use YouTube's `youtube-nocookie.com` domain to prevent third-party profiling prior to playback.
- **Transparent Disclosures:** Dedicated privacy and licenses page detailing data flows, contact form retention periods, and infrastructure hosting.

## 📁 Key Project Structure

```text
.
├── _data/          # Jekyll data files (YAML) rendered via Liquid
├── _includes/      # Modular Liquid components (Navigation, cards, UI sections)
├── _layouts/       # Base page layouts (default.html, project.html)
├── _sass/          # SCSS partials (*.scss) compiled into the site stylesheets
├── favicon/        # Cross-platform icons and manifest files
├── locales/        # i18n JSON data: Organized by [language]/[page].json
├── media/          # Global assets, game media, and technical PDF diagrams
├── projects/       # Detailed project pages and technical archives
├── scripts/        # Custom i18n engine and UI interaction logic
├── style/          # Sass entry point (core.scss): imports partials from _sass/
├── _config.yml     # Global Jekyll settings and plugin configurations
├── Gemfile         # Ruby dependencies and Jekyll plugin declarations
└── robots.txt      # Crawler instructions and sitemap reference
```

## 📄 License
This repository is governed by a dual-license approach:

- **Source Code:** Copyright © 2026 Fabio Pittaccio. The source code is provided for viewing and study purposes only. You are not authorized to copy, redistribute, or use this code for commercial purposes or to create derivative works without explicit permission.
- **Content:** Unless otherwise stated, all original content (text, images, and projects documentation) is licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).

For full details, please refer to the [LICENSE](LICENSE) file.

---

Developed with 💖 by **Fabio Pittaccio**
<br>
Gameplay Developer focused on ***Unreal Engine 5 & C++***
