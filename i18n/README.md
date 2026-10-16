# Website languages

English pages at their original URLs are the source templates. French pages live under `/fr/` and Spanish pages under `/es/`. All versions are complete static HTML.

To update translated copy, edit `i18n/translations.json` (keys are the exact English strings), then run `python3 scripts/build_i18n.py` with `beautifulsoup4` installed. Update the catalog when adding English content. The build also refreshes the route table, language alternatives, canonical URLs, structured data and all three sitemaps.

The header selector preserves the current page and section. Explicit choices are stored locally in the visitor's browser. On an English entry URL, `locale.js` uses that choice or the first supported language in the browser's ordered preferences (including regional variants). English is the fallback. Direct French and Spanish URLs retain their language, making links and search results predictable. `?lang=en`, `?lang=fr` and `?lang=es` can express a choice even when local storage is unavailable. The site works without JavaScript through its static language links.
