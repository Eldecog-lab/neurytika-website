# Website languages

English pages at their original URLs are the source templates. French pages live under `/fr/` and Spanish pages under `/es/`. All versions are complete static HTML.

To update translated copy, edit `i18n/translations.json` (keys are the exact English strings), then run `python3 scripts/build_i18n.py` with `beautifulsoup4` installed. Update the catalog when adding English content. The build also refreshes the route table, language alternatives, canonical URLs, structured data and all three sitemaps.

The header selector preserves the current page and section. Explicit choices are stored locally in the visitor's browser. On an English entry URL, `locale.js` uses that choice or the first supported language in the browser's ordered preferences (including regional variants). English is the fallback. Direct French and Spanish URLs retain their language, making links and search results predictable. `?lang=en`, `?lang=fr` and `?lang=es` can express a choice even when local storage is unavailable. The site works without JavaScript through its static language links.

## AI Compass quiz

There are now 11 pages per language (33 total). The quiz lives at `/find-your-ai/`, `/fr/trouver-votre-solution/` and `/es/encuentre-su-solucion/`. Static introductions are translated through the catalog; interactive copy is maintained in `quiz-copy.js`.

`quiz-engine.js` implements the transparent recommendation rules. This questionnaire guides visitors toward predictive AI, data preparation, generative tools or a combined workflow; it does not run an ERC model on visitor data. Run `node scripts/test_quiz.cjs` and `node scripts/test_locale.cjs` after changes.

The contact step submits name, email, organization, all five answers (readable labels and structured codes), recommendation, data readiness, deployment preference, timing, optional follow-up preference, processing notice version, timestamp and submission ID to the activated FormSubmit masked endpoint. The receiving mailbox is not present in site source. Results are shown only after an explicit successful provider acknowledgement. On delivery errors the form retains its entries and supports retry. Contact details remain only in page memory, including while moving back and forward; they are excluded from browser storage and URLs. Non-personal choices, progress and confirmed result are retained in session storage for two hours so changing language or reloading preserves progress and avoids resubmitting a confirmed result. No analytics or public repository stores lead data. FormSubmit forwards the complete record to the sales mailbox. Its service documentation describes its 30-day submission archive; emails remain in the mailbox under the company's own handling practices.

The Gmail delivery filter is limited to `from:submissions@formsubmit.co` and `subject:"Neurytika AI Compass"`, with the Never Spam action, as authorized by the owner. This is mailbox configuration, not a site script.
