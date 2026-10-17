const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(require.resolve('../analytics.js'),'utf8');
function setup(choice,host='eldecog-lab.github.io',mode=null,query='?email=private-email@example.com'){
 const local=new Map(),appended=[],handlers={};if(mode)local.set('neurytika-audience-mode-v1',mode);if(choice)local.set('neurytika-audience-v1',JSON.stringify({choice,at:Date.now()}));
 class Node{constructor(){this.nodes={};this.dataset={};this.listeners={};}setAttribute(k,v){this[k]=v;}querySelector(s){return this.nodes[s]||(this.nodes[s]=new Node());}appendChild(n){appended.push(n);}addEventListener(k,f){this.listeners[k]=f;}focus(){}closest(){return null;}}
 const footer=new Node(),document={documentElement:{lang:'fr',dataset:{pageKey:'quiz'}},title:'Quiz',referrer:'https://www.google.com/search?q=private-email@example.com',cookie:'',head:new Node(),body:new Node(),createElement:()=>new Node(),querySelector:s=>s==='footer'?footer:null,addEventListener:(k,f)=>handlers[k]=f};
 const ctx={document,location:{hostname:host,origin:'https://'+host,pathname:'/neurytika-website/fr/trouver-votre-solution/',search:query,hash:'#secret'},localStorage:{getItem:k=>local.get(k),setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},URL,URLSearchParams,Date,window:{addEventListener:(k,f)=>handlers[k]=f}};vm.runInNewContext(code,ctx);return {ctx,appended,panel:appended[0],local,handlers};
}
let t=setup();assert(!t.ctx.window.dataLayer);assert(!t.appended.some(x=>x.src));
function choose(t,choice){t.panel.listeners.click({target:{closest:()=>({dataset:{audience:choice}})}});}
choose(t,'accept');assert(t.appended.some(x=>x.src&&x.src.startsWith('https://www.googletagmanager.com/gtag/js?id=')));
const events=()=>t.ctx.window.dataLayer.filter(x=>x[0]==='event');assert.equal(events().length,1);assert.equal(events()[0][1],'page_view');
t.ctx.window.NeurytikaAudience.track('quiz_complete',{email:'private-email@example.com',name:'PRIVATE',step_number:3});let e=events().at(-1);assert.equal(e[1],'quiz_complete');assert.equal(e[2].step_number,3);assert(!('email'in e[2]));assert(!JSON.stringify(e).includes('private-email'));assert.equal(e[2].page_referrer,'https://www.google.com/');assert(!e[2].page_location.includes('?'));
const n=events().length;t.ctx.window.NeurytikaAudience.track('unknown_event');assert.equal(events().length,n);choose(t,'deny');t.ctx.window.NeurytikaAudience.track('quiz_complete');assert.equal(events().length,n);assert(JSON.parse(t.local.get('neurytika-audience-v1')).choice==='deny');
assert(!setup('deny').ctx.window.dataLayer);assert(!setup('accept','127.0.0.1').ctx.window.dataLayer);assert(setup('accept').ctx.window.dataLayer);
const demo=fs.readFileSync(require.resolve('../demo-form.js'),'utf8');assert(demo.indexOf("track('generate_lead')")>demo.indexOf("throw Error('unconfirmed')"));
console.log('Verified no analytics before consent/after refusal, withdrawal, no personal data or URL queries, event allowlist, local-preview exclusion and confirmed-only lead conversion.');

let internal=setup('accept','eldecog-lab.github.io','internal');assert(!internal.ctx.window.dataLayer);internal.ctx.window.NeurytikaAudience.track('generate_lead');assert(!internal.ctx.window.dataLayer);
let qa=setup('accept','eldecog-lab.github.io','test');assert(qa.ctx.window.dataLayer);let qaEvent=qa.ctx.window.dataLayer.find(x=>x[0]==='event');assert.equal(qaEvent[2].send_to,'G-SQFJCLWF18');assert(qa.ctx.window.dataLayer.find(x=>x[0]==='config')[2].debug_mode);assert(qa.ctx.window.NeurytikaAudience.isTestSubmission('TEST DEMO CHECK'));qa.ctx.window.NeurytikaAudience.track('generate_lead');assert.equal(qa.ctx.window.dataLayer.filter(x=>x[0]==='event').at(-1)[1],'generate_lead');
let synthetic=setup('accept');let count=synthetic.ctx.window.dataLayer.filter(x=>x[0]==='event').length;assert(synthetic.ctx.window.NeurytikaAudience.isTestSubmission('TEST DEMO ANALYTICS'));synthetic.ctx.window.NeurytikaAudience.track('generate_lead');assert.equal(synthetic.ctx.window.dataLayer.filter(x=>x[0]==='event').length,count);assert.equal(synthetic.local.get('neurytika-audience-mode-v1'),'internal');
let normal=setup('accept');assert(!normal.ctx.window.NeurytikaAudience.isTestSubmission('Alex Martin'));assert(normal.ctx.window.dataLayer.find(x=>x[0]==='event')[2].send_to!=='G-SQFJCLWF18');
let marked=setup('accept','eldecog-lab.github.io',null,'?audience=internal');assert(!marked.ctx.window.dataLayer);assert.equal(marked.local.get('neurytika-audience-mode-v1'),'internal');
let reset=setup('accept','eldecog-lab.github.io','internal','?audience=public');assert(reset.ctx.window.dataLayer);assert(!reset.local.has('neurytika-audience-mode-v1'));
let broadcast=setup('accept');count=broadcast.ctx.window.dataLayer.filter(x=>x[0]==='event').length;broadcast.local.set('neurytika-audience-mode-v1','internal');broadcast.handlers.storage({key:'neurytika-audience-mode-v1',newValue:'internal'});broadcast.ctx.window.NeurytikaAudience.track('quiz_complete');assert.equal(broadcast.ctx.window.dataLayer.filter(x=>x[0]==='event').length,count);
console.log('Internal browsers send nothing; QA events use only the separate test property; mode persists, cross-tab exclusion works, recognized synthetic submissions cannot become production leads, real visitors remain measurable.');
for(const mode of ['public','internal','test']){
 const w=setup('accept','eldecog-lab.github.io',mode);
 for(const name of ['demo_start','demo_step','demo_complete','demo_pilot_click'])w.ctx.window.NeurytikaAudience.track(name,{step_number:2,email:'NEVER-SEND@example.org'});
 const sent=(w.ctx.window.dataLayer||[]).filter(x=>x[0]==='event'&&/^demo_(start|step|complete|pilot_click)$/.test(x[1]));
 assert.equal(sent.length,mode==='internal'?0:4);for(const e of sent){assert.equal(e[2].send_to,mode==='test'?'G-SQFJCLWF18':'G-B31298QHG3');assert(!JSON.stringify(e).includes('NEVER-SEND'));}
}
console.log('Interactive demo events respect consent routing, internal exclusions and personal-data filtering.');
