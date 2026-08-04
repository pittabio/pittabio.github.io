<p>
  <a href="https://pittabio.github.io">
    <img src="media/readme-image.png" alt="Fabio Pittaccio Portfolio Banner" style="width: 800px;">
  </a>
</p>

# Fabio Pittaccio · Gameplay Developer Portfolio

This repository contains the source code for my professional portfolio, hosted on GitHub Pages. The site is designed to showcase my technical expertise in **Unreal Engine 5**, **C++**, and **Gameplay Programming**.

🔗 **Live Site:** [pittabio.github.io](https://pittabio.github.io)

---

## 🛠 Tech Stack

While I am primarily a Gameplay Developer, I built this portfolio with a focus on clean architecture, scalability, and performance:

- **SSG:** [Jekyll](https://jekyllrb.com/) (GitHub Pages native engine).
- **Templating:** Liquid for modular components and SEO management.
- **Frontend:** Vanilla HTML5, CSS3 (custom variables/grid/flexbox), and Modern JavaScript.
- **Localization:** Custom JSON-based **i18n** engine for multi-language support (EN/IT).
- **Analytics:** Google Analytics 4 with **Advanced Consent Mode** and a custom-built privacy banner.

## 🚀 Key Features

### 1. Advanced Localization (i18n)
The site uses a custom JavaScript engine that dynamically fetches and injects translations from localized JSON files (`/locales/`), allowing for a seamless language switch without page reloads.

### 2. SEO & Open Graph Optimization
- Fully optimized for search engines using a modular Jekyll approach.
- Custom **Open Graph** and **Twitter Cards** implementation for high-quality social sharing previews.
- Dynamic Sitemap generation and `robots.txt` configuration for efficient crawling.

### 3. Modular Architecture
Used Jekyll `_includes` to manage repetitive components (favicons, SEO, analytics, privacy banners) to maintain a **DRY (Don't Repeat Yourself)** codebase.

### 4. Privacy & Compliance (GDPR)
Implemented a custom-designed cookie consent banner that integrates directly with GA4 Advanced Consent Mode, ensuring anonymous tracking only upon user approval.

## 📁 Key Project Structure

```text
.
├── _includes/      # Modular Jekyll components (SEO, Analytics, Banner)
├── common/         # Shared HTML fragments (Global Header & Footer)
├── favicon/        # Cross-platform icons and manifest files
├── locales/        # i18n JSON data: Organized by [language]/[page].json
├── media/          # Global assets, game banners, and technical PDF diagrams
├── projects/       # Detailed project pages and technical archives
├── scripts/        # Custom i18n engine and UI interaction logic
├── style/          # Modular CSS architecture
├── _config.yml     # Global Jekyll settings
├── robots.txt      # Crawler instructions and sitemap link
└── sitemap.xml     # Search engine roadmap
```

## 📄 License
This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**.
<br>
You are free to share the link, but you may not use the code or design for commercial purposes or redistribute modified versions of the site.

---

Developed with 💖 by **Fabio Pittaccio** 
<br>
Gameplay Developer focused on ***Unreal Engine 5 & C++***
