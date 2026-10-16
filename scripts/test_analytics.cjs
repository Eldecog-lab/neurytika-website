const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(require.resolve('../analytics.js'),'utf8');
function setup(choice,host='eldecog-lab.github.io'){
 const local=new Map(),appended=[],handlers={};if(choice)local.set('neurytika-audience-v1',JSON.stringify({choice,at:Date.now()}));
 class Node{constructor(){this.nodes={};this.dataset={};this.listeners={};}setAttribute(k,v){this[k]=v;}querySelector(s){return this.nodes[s]||(this.nodes[s]=new Node());}appendChild(n){appended.push(n);}addEventListener(k,f){this.listeners[k]=f;}focus(){}closest(){return null;}}
 const footer=new Node(),document={documentElement:{lang:'fr',dataset:{pageKey:'quiz'}},title:'Quiz',referrer:'https://www.google.com/search?q=private-email@example.com',cookie:'',head:new Node(),body:new Node(),createElement:()=>new Node(),querySelector:s=>s==='footer'?footer:null,addEventListener:(k,f)=>handlers[k]=f};
 const ctx={document,location:{hostname:host,origin:'https://'+host,pathname:'/neurytika-website/fr/trouver-votre-solution/',search:'?email=private-email@example.com',hash:'#secret'},localStorage:{getItem:k=>local.get(k),setItem:(k,v)=>local.set(k,v)},URL,Date,window:{}};vm.runInNewContext(code,ctx);return {ctx,appended,panel:appended[0],local};
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
