const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const report=require('../quiz-report.js'),engine=require('../quiz-engine.js'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../quiz-copy.js'),'utf8'),ctx);
const routes=JSON.parse(fs.readFileSync(require.resolve('../i18n/routes.json')));
for(const lang of ['en','fr','es']){
 const c=ctx.window.NeurytikaQuizCopy[lang];
 for(const [output,data] of [['classify','ready'],['classify','starting'],['generate','documents'],['both','documents']]){
  const a={goal:'fraud',output,data,hosting:'local',timing:'soon'},r=engine.recommend(a),p=report.profile(c,r),mail=report.build(c,r,a,'TEST',routes,lang);
  assert(mail.includes(p.title));assert(mail.includes(c.local));p.steps.forEach(x=>assert(mail.includes(x)));assert(mail.includes(report.demo(c,r)));c.questions.forEach(q=>assert(mail.includes(q.title)));
  const dest=new URL(report.demo(c,r));assert.equal(dest.hostname,'formsubmit.co');assert(dest.searchParams.get('subject').includes(p.title));
  if(output==='both')assert(mail.includes(c.prepareStep));
 }
}
console.log('12 localized email reports match displayed recommendations, preparation steps, all answers and demo links.');
