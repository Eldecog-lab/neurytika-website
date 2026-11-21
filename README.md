# Celeste AI website

English, French and Spanish website for Celeste AI, the commercial offering from Celeste EcoFlyers. Neurytika is the prediction software, powered by the Evidence Ratio Classifier (ERC).

**Website:** https://ai.celeste.aero/

## Content and sources
Scientific descriptions follow the [Neurytika README](https://github.com/Eldecog-lab/Neurytika) and [V0 specification](https://github.com/Eldecog-lab/Neurytika/blob/main/docs/spec-mvp-v0.md).
The commercial offer follows the project owner’s description: software deployment on premises or in the cloud, with consulting for data preparation, model adaptation, evaluation, integration and training.

## Publishing
Static HTML and CSS, without build dependencies. GitHub Pages publishes from `main` at `/ (root)`.
Edit `index.html` and `styles.css` to update the site.

Includes semantic HTML, keyboard focus styles, responsive layout, a canonical URL, search/social metadata, JSON-LD, a sitemap and crawler guidance.

The software is maintained separately in [Eldecog-lab/Neurytika](https://github.com/Eldecog-lab/Neurytika).


## Domain and brand

The canonical domain is `https://ai.celeste.aero/` (GitHub Pages, `CNAME`). Wix DNS provides `ai.celeste.aero CNAME eldecog-lab.github.io`. The former GitHub Pages project URLs redirect permanently to the corresponding paths on the custom domain. Keep the repository and custom-domain association in place to preserve these redirects.

`Celeste AI` is the website and commercial brand; `Neurytika` remains the software name. `scripts/build_i18n.py` generates the shared brand, language alternatives and sitemaps. The route paths stay unchanged after removal of the former `/neurytika-website/` prefix.

Analytics retains production measurement ID `G-B31298QHG3`, consent requirements and the internal/test exclusions. Internal visits should use `?audience=internal` on the new domain; browser preferences stored on the former host cannot carry across domains.
