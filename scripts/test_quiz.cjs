const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const engine=require('../quiz-engine.js');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../quiz-copy.js'),'utf8'),ctx);
const copy=ctx.window.NeurytikaQuizCopy;
let count=0;
for(const goal of ['retention','leads','fraud','quality','content','other'])
for(const output of ['classify','generate','both','unsure'])
for(const data of ['ready','structured','documents','starting'])
for(const hosting of ['local','cloud','unsure'])
for(const timing of ['soon','quarter','explore']) {
  const r=engine.recommend({goal,output,data,hosting,timing});
  for(const lang of ['en','fr','es']) assert(copy[lang].profiles[r.profile]);
  if(output==='generate') assert.equal(r.profile,'generative');
  if(output==='both') assert.equal(r.profile,'hybrid');
  if(output==='classify'&&data!=='ready') assert.equal(r.profile,'prepare');
  if(output==='classify'&&data==='ready') assert.equal(r.profile,'predictive');
  if(output==='unsure'&&goal==='content') assert.equal(r.profile,'generative');
  if(goal==='fraud') assert.equal(r.topic,'fraud-detection');
  assert.equal(r.deployment,hosting==='unsure'?'explore':hosting);
  count++;
}
// A successful HTTP request alone is insufficient to release the result.
for(const bad of [null,{}, {success:false},{success:'false'},{success:'yes'}]) assert.equal(!!engine.accepted(bad),false);
assert(engine.accepted({success:true}));assert(engine.accepted({success:'true'}));
for(const lang of ['en','fr','es']) {
 assert.equal(copy[lang].questions.length,5);
 for(const q of copy[lang].questions) assert(q.options.every(o=>o.length===4));
 for(const p of Object.values(copy[lang].profiles)) assert.equal(p.steps.length,3);
}
console.log(count+' recommendation combinations, three language catalogs and delivery acknowledgements verified.');
const now=Date.now(),complete={goal:'fraud',output:'both',data:'documents',hosting:'local',timing:'soon'};
const draft={version:2,at:now,answers:complete,step:5,completed:true,followup:true,submissionId:'test-id'};
assert.equal(engine.restore(JSON.stringify(draft),now).completed,true);
assert.equal(engine.restore(JSON.stringify({...draft,at:now-7200001}),now).step,-1);
assert.equal(engine.restore('not json',now).step,-1);
assert.equal(engine.restore(JSON.stringify({...draft,answers:{goal:'fraud'}}),now).completed,false);
assert.equal(engine.restore(JSON.stringify({...draft,answers:{goal:'fraud'}}),now).step,1);
assert.equal(engine.restore(JSON.stringify({...draft,answers:{goal:'invented'}}),now).step,0);
assert.equal(engine.restore(JSON.stringify({...draft,answers:{...complete,email:'must not be retained'}}),now).answers.email,undefined);
console.log('Session restoration validates choices, expiry and completeness; unrelated contact fields are excluded.');
