// Run with node scripts/test_locale.cjs. Tests real generated navigation code.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = path.join(__dirname, '..', 'locale.js');
const source = fs.readFileSync(file, 'utf8');
const { preferredLanguage } = require(file);
for (const [languages, expected] of [
  [['fr-FR'], 'fr'], [['es-MX'], 'es'], [['en-US', 'fr'], 'en'],
  [['de', 'es-ES'], 'es'], [['ja', 'de'], 'en'], [[], 'en'], [['FR_ca'], 'fr']
]) assert.equal(preferredLanguage(languages), expected);
function scenario({current='en', page='home', search='', saved=null, languages=['fr-FR'], hash='#solutions', denied=false}={}) {
  let redirected=null, stored=null;
  vm.runInNewContext(source, {
    document: {documentElement: {lang:current, getAttribute:()=>page}, addEventListener:()=>{}},
    navigator: {languages}, URL, URLSearchParams,
    location: {search, hash, origin:'https://eldecog-lab.github.io', replace:url=>redirected=url},
    localStorage: {
      getItem:()=>{if(denied) throw Error('disabled'); return saved;},
      setItem:(_,v)=>{if(denied) throw Error('disabled'); stored=v;}
    }
  });
  return {redirected, stored};
}
assert.equal(scenario().redirected, 'https://eldecog-lab.github.io/neurytika-website/fr/#solutions');
assert.equal(scenario({languages:['pt'], hash:''}).redirected, null);
assert.equal(scenario({search:'?lang=en'}).redirected, null);
assert.equal(scenario({saved:'en'}).redirected, null);
assert.match(scenario({saved:'es'}).redirected, /\/es\/#solutions$/);
assert.equal(scenario({current:'fr', saved:'es'}).redirected, null);
assert.match(scenario({page:'company', languages:['es-AR']}).redirected, /\/es\/empresa\/#solutions$/);
assert.match(scenario({denied:true}).redirected, /\/fr\/#solutions$/);
assert.equal(scenario({denied:true, search:'?lang=en'}).redirected, null);
assert.equal(scenario({search:'?lang=es'}).stored, 'es');
console.log('17 language preference and navigation checks passed.');
