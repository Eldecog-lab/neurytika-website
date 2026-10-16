/* Browser preference applies at English entry URLs; explicit locale URLs stay shareable. */
(function () {
  'use strict';
  var routes = __ROUTES__;
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
