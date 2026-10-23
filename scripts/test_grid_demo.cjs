const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engine=require('../grid-demo.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../grid-demo-copy.js'),'utf8'),ctx);
const copy=ctx.window.NeurytikaGridCopy;
for(const lang of ['en','fr','es']){
 const c=copy[lang];assert.deepEqual(Object.keys(c),Object.keys(copy.en));
 for(const updated of [false,true]) for(const choice of ['0','1','2']){
  const r=engine.record(c,{updated,choice,reason:'Expert rationale <test>'});
  assert(r.includes(c.original));assert(r.includes(c[updated?'revised':'original']));assert(r.includes(c.options[choice]));assert(r.includes('Expert rationale <test>'));assert(r.includes(c.sources[0]));assert(!r.includes('undefined'));
 }
}
console.log('PASS: complete EN/FR/ES copy, both contexts, all three independent expert decisions and exported evidence.');

for(const lang of ['en','fr','es']) { const c=copy[lang]; const r=engine.record(c,{updated:true,choice:'1',reason:'Expert review',learned:true}); assert(r.includes(c.learnDone)); assert(r.includes(c.learnCheck)); assert(r.includes(c.options[1])); }
console.log('PASS: validated learning feedback remains distinct from expert decision in all languages.');
