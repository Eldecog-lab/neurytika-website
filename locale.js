/* Browser preference applies at English entry URLs; explicit locale URLs stay shareable. */
(function () {
  'use strict';
  var routes = {"home":{"en":"","fr":"fr/","es":"es/"},"customer-retention":{"en":"customer-retention/","fr":"fr/fidelisation-clients/","es":"es/fidelizacion-clientes/"},"lead-qualification":{"en":"lead-qualification/","fr":"fr/qualification-prospects/","es":"es/calificacion-leads/"},"quality-control":{"en":"quality-control/","fr":"fr/controle-qualite/","es":"es/control-calidad/"},"fraud-detection":{"en":"fraud-detection/","fr":"fr/detection-fraude/","es":"es/deteccion-fraude/"},"predictive-analytics":{"en":"predictive-analytics/","fr":"fr/analyse-predictive/","es":"es/analitica-predictiva/"},"on-premise-ai":{"en":"on-premise-ai/","fr":"fr/ia-sur-site/","es":"es/ia-local/"},"data-sovereignty-ai":{"en":"data-sovereignty-ai/","fr":"fr/souverainete-donnees-ia/","es":"es/soberania-datos-ia/"},"generative-ai-vs-predictive-ai":{"en":"generative-ai-vs-predictive-ai/","fr":"fr/ia-generative-vs-ia-predictive/","es":"es/ia-generativa-vs-ia-predictiva/"},"embedded-ai-aerospace":{"en":"embedded-ai-aerospace/","fr":"fr/ia-embarquee-aeronautique-spatial/","es":"es/ia-embarcada-aeroespacial/"},"company":{"en":"company/","fr":"fr/societe/","es":"es/empresa/"},"technology-evaluation":{"en":"technology-evaluation/","fr":"fr/evaluation-technologique/","es":"es/evaluacion-tecnologica/"},"intelligence-decision-support":{"en":"intelligence-decision-support/","fr":"fr/analyse-aide-decision/","es":"es/analisis-apoyo-decision/"},"maritime-surveillance-ai":{"en":"maritime-surveillance-ai/","fr":"fr/surveillance-maritime/","es":"es/vigilancia-maritima/"},"interactive-demo":{"en":"interactive-demo/","fr":"fr/demonstration-interactive/","es":"es/demostracion-interactiva/"},"quiz":{"en":"find-your-ai/","fr":"fr/trouver-votre-solution/","es":"es/encuentre-su-solucion/"}};
  var supported = ['en', 'fr', 'es'];
  var storageKey = 'neurytika-language';
  function preferredLanguage(languages) {
    for (var i = 0; i < languages.length; i++) {
      var code = String(languages[i]).toLowerCase().split(/[-_]/)[0];
      if (supported.indexOf(code) !== -1) return code;
    }
    return 'en';
  }
  // Export the pure preference rule for regression checks without a browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { preferredLanguage: preferredLanguage, routes: routes };
    return;
  }
  var page = document.documentElement.getAttribute('data-page-key');
  var current = document.documentElement.lang;
  if (!routes[page]) return;
  var params = new URLSearchParams(location.search);
  var explicit = params.get('lang');
  var saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (_) {}
  function remember(language) {
    try { localStorage.setItem(storageKey, language); } catch (_) {}
  }
  if (supported.indexOf(explicit) !== -1) remember(explicit);
  // A language-specific URL is an intentional destination (search, share or switch).
  // Automatic negotiation starts from the unchanged English URLs.
  if (current === 'en') {
    var wanted = supported.indexOf(explicit) !== -1 ? explicit :
      supported.indexOf(saved) !== -1 ? saved :
      preferredLanguage(navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
    if (wanted !== current) {
      var next = new URL('/neurytika-website/' + routes[page][wanted], location.origin);
      next.search = location.search;
      next.hash = location.hash;
      location.replace(next.href);
      return;
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('[data-language]');
    function updateHashes() {
      links.forEach(function (link) {
        var target = new URL(link.href);
        target.hash = location.hash;
        link.href = target.href;
      });
    }
    updateHashes();
    window.addEventListener('hashchange', updateHashes);
    links.forEach(function (link) {
      link.addEventListener('click', function () { remember(link.getAttribute('data-language')); });
    });
  });
}());
