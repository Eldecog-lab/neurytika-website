(function () {
 'use strict';
 var root=document.querySelector('[data-quiz-app]'); if(!root)return;
 var lang=document.documentElement.lang, c=window.NeurytikaQuizCopy[lang]||window.NeurytikaQuizCopy.en;
 var engine=window.NeurytikaQuizEngine, routes=JSON.parse(document.getElementById('quiz-routes').textContent);
 var stored=null;try{stored=sessionStorage.getItem('neurytika-quiz-v2');}catch(_){}
 var restored=engine.restore(stored,Date.now());
 var answers=restored.answers,step=restored.step,sending=false,submissionId=restored.submissionId,completed=restored.completed,followupChoice=restored.followup,contactDraft={};
 function save(){try{sessionStorage.setItem('neurytika-quiz-v2',JSON.stringify({version:2,at:Date.now(),answers:answers,step:step,completed:completed,followup:followupChoice,submissionId:submissionId}));}catch(_){}}
 var endpoint='https://formsubmit.co/ajax/f667a3546b4871bed81cc55c801cd7a0';
 function e(s){return String(s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x];});}
 function url(key){return '/neurytika-website/'+routes[key][lang];}
 var paths={people:'M8 27v-3c0-7 16-7 16 0v3M16 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10M25 9c7 4 7 12 1 16',target:'M16 3a13 13 0 1 0 13 13M16 9a7 7 0 1 0 7 7M16 16 29 3M22 3h7v7',shield:'M16 3 28 8v9c0 7-12 13-12 13S4 24 4 17V8zM10 16l4 4 8-9',check:'M5 5h22v22H5zM10 16l4 4 8-9',spark:'m16 2 4 10 10 4-10 4-4 10-4-10L2 16l10-4z',compass:'M16 3a13 13 0 1 0 0 26 13 13 0 0 0 0-26M22 10l-4 10-8 3 4-10z',connect:'M5 8h8v8H5zM19 18h8v8h-8zM13 12h10v6M9 16v6h10',table:'M4 5h24v23H4zM4 12h24M12 12v16M20 12v16M4 20h24',chart:'M4 28h25M8 23V13M16 23V6M24 23V10',document:'M6 3h13l7 7v20H6zM19 3v8h7M11 17h10M11 23h10',seed:'M16 29V15M16 20C3 20 3 8 3 8s13 0 13 12M16 15C16 3 29 3 29 3s0 12-13 12',server:'M4 4h24v10H4zM4 19h24v10H4zM9 9h1M9 24h1M17 9h7M17 24h7',cloud:'M8 25C-2 25-1 12 8 12 10 0 27 3 25 15c10 0 10 10 0 10z',rocket:'M12 22 7 17C12 5 23 3 29 3c0 6-2 17-14 22zM11 24l-7 5 2-8M20 10l3 3M8 13l-5 1 4 4M19 25l-1 5-4-4',calendar:'M4 6h24v23H4zM4 13h24M10 2v8M22 2v8M10 19h3M19 19h3'};
 function icon(name){return '<svg class="quiz-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.compass)+'"/></svg>';}
 function focus(){var h=root.querySelector('h2');if(h)h.focus({preventScroll:true});if(window.matchMedia('(max-width:700px)').matches)root.scrollIntoView({block:'start'});}
 function render(){
  save();
  document.querySelector('.quiz-page').classList.toggle('quiz-started',step>=0);
  if(completed){renderResult(engine.recommend(answers),followupChoice);return;}
  if(step<0){root.innerHTML='<div class="quiz-welcome">'+icon('compass')+'<p class="quiz-kicker">'+e(c.step)+' 1 '+e(c.of)+' 5</p><h2 tabindex="-1">'+e(c.introTitle)+'</h2><p>'+e(c.introText)+'</p><ul class="quiz-perks">'+c.introPoints.map(x=>'<li>'+icon('check')+e(x)+'</li>').join('')+'</ul><button class="button quiz-primary" id="quiz-start">'+e(c.start)+' <span aria-hidden="true">↗</span></button></div>';root.querySelector('#quiz-start').addEventListener('click',()=>{step=0;render();focus();});return;}
  if(step===5){renderContact();return;}
  var q=c.questions[step];
  root.innerHTML='<div class="quiz-progress-label"><span>'+e(c.step)+' '+(step+1)+' '+e(c.of)+' 5</span><span>'+(step*20)+'%</span></div><div class="quiz-progress" role="progressbar" aria-label="'+e(c.step)+'" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+step+'"><span style="width:'+(step*20)+'%"></span></div><fieldset class="quiz-question"><legend><h2 tabindex="-1">'+e(q.title)+'</h2></legend><p class="quiz-hint">'+e(q.hint)+'</p><div class="quiz-options">'+q.options.map(o=>'<label class="quiz-option"><input type="radio" name="'+q.key+'" value="'+o[0]+'" '+(answers[q.key]===o[0]?'checked':'')+'><span class="quiz-option-body">'+icon(o[3])+'<strong>'+e(o[1])+'</strong><span>'+e(o[2])+'</span><b aria-hidden="true">✓</b></span></label>').join('')+'</div></fieldset><div class="quiz-actions"><button class="quiz-back" type="button">← '+e(c.back)+'</button><button class="button quiz-primary" id="quiz-next" '+(!answers[q.key]?'disabled':'')+'>'+e(c.next)+' →</button></div>';
  root.querySelectorAll('input[type=radio]').forEach(x=>x.addEventListener('change',()=>{answers[q.key]=x.value;save();root.querySelector('#quiz-next').disabled=false;}));
  root.querySelector('.quiz-back').addEventListener('click',()=>{step--;render();focus();});
  root.querySelector('#quiz-next').addEventListener('click',()=>{if(!answers[q.key])return;step++;render();focus();});
 }
 function renderContact(){
  root.innerHTML='<p class="quiz-kicker">'+e(c.contactStep)+'</p><h2 tabindex="-1">'+e(c.contactTitle)+'</h2><p class="quiz-hint">'+e(c.contactIntro)+'</p><form id="quiz-contact"><div class="quiz-fields"><label>'+e(c.name)+'<input name="name" autocomplete="name" maxlength="120" required></label><label>'+e(c.email)+'<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>'+e(c.company)+'<input name="organization" autocomplete="organization" maxlength="160" required></label></div><div class="quiz-trap" aria-hidden="true"><label>Website<input name="_honey" tabindex="-1" autocomplete="off"></label></div><label class="quiz-check"><input type="checkbox" name="processing" required><span>'+e(c.consent)+'</span></label><label class="quiz-check"><input type="checkbox" name="followup"><span>'+e(c.followup)+'</span></label><details class="quiz-privacy"><summary>'+e(c.privacy)+'</summary><p>'+e(c.privacyText)+'</p><a href="https://formsubmit.co/el/yecudu?subject=Neurytika%20privacy%20request" target="_blank" rel="noopener">'+e(c.privacyLink)+' ↗</a><br><a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener">'+e(c.providerPrivacy)+' ↗</a></details><p id="quiz-error" class="quiz-error" role="alert" hidden></p><div class="quiz-actions"><button class="quiz-back" type="button">← '+e(c.back)+'</button><button type="submit" class="button quiz-primary">'+e(c.reveal)+' <span aria-hidden="true">↗</span></button></div><p class="quiz-send-status" role="status" aria-live="polite"></p></form>';
  var form=root.querySelector('form');
  ['name','email','organization'].forEach(k=>{form.elements[k].value=contactDraft[k]||'';});
  ['processing','followup'].forEach(k=>{form.elements[k].checked=contactDraft[k]===true;});
  form.addEventListener('input',()=>{['name','email','organization'].forEach(k=>contactDraft[k]=form.elements[k].value);['processing','followup'].forEach(k=>contactDraft[k]=form.elements[k].checked);});
  root.querySelector('.quiz-back').addEventListener('click',()=>{step=4;render();focus();});
  form.addEventListener('submit',submit);
 }
 function answerSummary(){return c.questions.map(q=>q.title+'\n'+q.options.find(o=>o[0]===answers[q.key])[1]).join('\n\n');}
 async function submit(event){
  event.preventDefault();var form=event.currentTarget;if(sending)return;
  ['name','organization'].forEach(k=>form.elements[k].value=form.elements[k].value.trim());
  if(!form.reportValidity())return;
  var fields=new FormData(form);if(fields.get('_honey'))return;
  sending=true;form.querySelector('button[type=submit]').disabled=true;form.querySelector('.quiz-back').disabled=true;
  var error=root.querySelector('#quiz-error');error.hidden=true;root.querySelector('[role=status]').textContent=c.sending;
  var result=engine.recommend(answers),profile=c.profiles[result.profile],followup=fields.get('followup')==='on';
  if(!submissionId)submissionId=crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
  var controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
  var payload={name:fields.get('name').trim(),email:fields.get('email').trim(),organization:fields.get('organization').trim(),_subject:'Neurytika AI Compass — '+result.profile+' ['+lang+']',_template:'table',_honey:'',message:answerSummary(),answers_json:JSON.stringify(answers),recommendation:profile.title,profile:result.profile,data_readiness:result.readiness,deployment:result.deployment,timing:answers.timing,expert_follow_up:followup?'REQUESTED':'NOT REQUESTED',processing_notice:c.consent,notice_version:'quiz-2026-10-16-v1',submission_id:submissionId,submitted_at:new Date().toISOString(),source:location.origin+location.pathname,language:lang};
  try {
   var response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   var data=await response.json();if(!response.ok||!engine.accepted(data))throw Error('unconfirmed');
   completed=true;followupChoice=followup;contactDraft={};save();renderResult(result,followup);
  }catch(_){error.textContent=c.error;error.hidden=false;root.querySelector('[role=status]').textContent='';form.querySelector('button[type=submit]').disabled=false;form.querySelector('.quiz-back').disabled=false;}
  finally {clearTimeout(timer);sending=false;}
 }
 function renderResult(result,followup){
  var p=Object.assign({},c.profiles[result.profile]);
  if(result.profile==='hybrid'&&result.readiness==='prepare')p.steps=[c.prepareStep,p.steps[1],p.steps[2]];
  var topic=result.profile==='generative'||result.profile==='hybrid'?'generative-ai-vs-predictive-ai':result.topic;
  var selections=[c.questions[0],c.questions[4]].map(q=>q.options.find(o=>o[0]===answers[q.key])[1]);
  root.innerHTML='<div class="quiz-result"><div class="quiz-result-symbol">'+icon(result.profile==='generative'?'spark':result.profile==='hybrid'?'connect':result.profile==='prepare'?'seed':'compass')+'</div><p class="quiz-kicker">'+e(c.resultLabel)+'</p><h2 tabindex="-1">'+e(p.title)+'</h2><p class="quiz-result-lead">'+e(p.body)+'</p><div class="quiz-result-tags">'+selections.map(x=>'<span>'+e(x)+'</span>').join('')+'</div><h3>'+e(c.reasons)+'</h3><ul>'+p.why.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul><h3>'+e(c.architecture)+'</h3><p>'+e(c[result.deployment])+'</p><h3>'+e(c.nextSteps)+'</h3><ol class="quiz-result-steps">'+p.steps.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol><a class="button" href="'+url(topic)+'">'+e(c.related)+' ↗</a><a class="quiz-result-link" href="https://formsubmit.co/el/yecudu?subject='+encodeURIComponent('Neurytika quiz: '+p.title)+'">'+e(c.resultContact)+' ↗</a><div class="quiz-received">'+icon('check')+'<p>'+e(c.sent)+'<br>'+e(followup?c.followupYes:c.followupNo)+'</p></div><div class="quiz-result-tools"><button type="button" id="quiz-print">'+e(c.print)+'</button><button type="button" id="quiz-restart">'+e(c.restart)+'</button></div></div>';
  root.querySelector('#quiz-print').addEventListener('click',()=>window.print());
  root.querySelector('#quiz-restart').addEventListener('click',()=>{answers={};step=0;submissionId=null;completed=false;followupChoice=false;contactDraft={};render();focus();});focus();
 }
 render();
}());
