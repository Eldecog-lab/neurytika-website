const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const model=require('../demo-example.js');const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../demo-copy.js'),'utf8'),sandbox);const copy=sandbox.window.NeurytikaDemoCopy;
assert.equal(model.records.length,12);assert.equal(new Set(model.records.map(x=>x.id)).size,12);
for(const [id,category,support] of [['A','inspect',3],['B','monitor',3],['C','routine',4]]){
 const r=model.explain(id);assert.equal(r.category,category);assert.equal(r.support,support);assert.equal(r.total,4);assert.equal(Object.values(r.counts).reduce((a,b)=>a+b),r.total);
 assert(r.matches.every(x=>x.temperature===r.item.temperature&&x.vibration===r.item.vibration));
 for(const lang of ['en','fr','es']){const c=copy[lang];assert.equal(c.steps.length,3);assert.equal(c.assets.length,3);for(const key of [category,category+'Action','high','normal','count','allCount','human'])assert(c[key]);assert(c.count.includes('{support}')&&c.count.includes('{total}'));}
}
assert.throws(()=>model.explain('not-a-record'));assert.equal(model.explain('A').category,model.explain('A').category);
for(const l of ['fr','es'])assert.deepEqual(Object.keys(copy[l]).sort(),Object.keys(copy.en).sort());
console.log('Verified all fictional records, combination counts, alternative outcomes and three complete language catalogs.');
