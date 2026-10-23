/* Scripted educational scenario, not an ERC inference endpoint.
   Notes remain in memory and are never sent to analytics or a server. */
(function(root){
 'use strict';
 function proposal(updated){return updated?'revised':'original';}
 function record(c,s){return [c.record,c.case,c.notice,'',c.sourceTitle+':',c.facts.map(function(f,i){return f+' — '+c.sources[i];}).join('\n'),'',c.proposalLabel+' (1): '+c.original,c.proposalLabel+' (2): '+c[proposal(s.updated)],s.updated?c.updated:c.notUpdated,c.combination,s.updated?c.changeText:c.counter,c.remainText,'',c.decisionLabel+': '+c.options[s.choice],c.reason+': '+s.reason,'',c.learnTitle,s.learned?c.learnDone:c.learnNo,s.learned?c.learnCheck:''].join('\n');}
 if(typeof module==='object'&&module.exports){module.exports={proposal:proposal,record:record};return;}
 var shell=document.getElementById('grid-demo'),c=(root.NeurytikaGridCopy||{})[document.documentElement.lang];if(!shell||!c)return;
 var state={step:0,checked:false,updated:false,choice:'',reason:'',confirmed:false,learningValidated:false,learned:false},started=false,completed=false;
 var body=document.getElementById('grid-body'),heading=document.getElementById('grid-heading'),next=document.getElementById('grid-next'),back=document.getElementById('grid-back');
 function el(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
 function track(name,params){if(root.NeurytikaAudience)root.NeurytikaAudience.track(name,params);}
 function begin(){if(!started){started=true;track('demo_start');}}
 function button(text,fn,cls){var b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;}
 function card(label,text,cls){var n=el('div',undefined,cls||'grid-card');n.append(el('span',label,'grid-label'),el('p',text));return n;}
 function announce(text){document.getElementById('grid-announcement').textContent=text;}
 function proposalCard(){return card(c.proposalLabel,c[proposal(state.updated)],'grid-proposal');}
 function render(focus){
  heading.textContent=c.headings[state.step];body.replaceChildren();
  shell.querySelectorAll('[data-step]').forEach(function(li){if(Number(li.dataset.step)===state.step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  back.hidden=state.step===0;next.hidden=state.step===3;next.textContent=c.next;
  if(state.step===0){body.append(el('p',c.question,'grid-question'),el('p',c.purpose),card(c.case,c.facts.join(' · ')));}
  if(state.step===1){body.append(proposalCard(),el('p',c.combination),card(c.counterTitle,state.updated?c.changeText:c.counter));var details=el('details');details.append(el('summary',c.sourceTitle));c.facts.forEach(function(f,i){details.append(card(f,c.sources[i]));});body.append(details);}
  if(state.step===2){body.append(el('p',c.expert));var label=el('label',undefined,'grid-check'),check=el('input');check.type='checkbox';check.checked=state.checked;check.id='grid-verified';label.append(check,el('span',c.check));body.append(label);
   var update=button(c.update,function(){state.updated=true;state.confirmed=false;render(false);announce(c.updated);document.getElementById('grid-update').focus();},'button');update.id='grid-update';update.disabled=!state.checked||state.updated;
   check.addEventListener('change',function(){state.checked=check.checked;state.updated=false;state.confirmed=false;render(false);document.getElementById('grid-verified').focus();});body.append(update,proposalCard());
   if(state.updated)body.append(card(c.changed,c.changeText),card(c.remains,c.remainText));else body.append(el('p',c.pending,'grid-muted'));
  }
  if(state.step===3){body.append(proposalCard(),el('p',state.updated?c.updated:c.notUpdated,'grid-muted'));
   var form=el('form'),fieldset=el('fieldset');fieldset.append(el('legend',c.decisionLabel));c.options.forEach(function(text,i){var l=el('label',undefined,'grid-option'),input=el('input');input.type='radio';input.name='decision';input.value=String(i);input.required=true;input.checked=state.choice===String(i);input.addEventListener('change',function(){state.choice=String(i);invalidate();});l.append(input,el('span',text));fieldset.append(l);});form.append(fieldset);
   var label=el('label',c.reason);label.htmlFor='grid-reason';var area=el('textarea');area.id='grid-reason';area.rows=3;area.maxLength=1600;area.required=true;area.placeholder=c.placeholder;area.value=state.reason;area.addEventListener('input',function(){state.reason=area.value;invalidate();});form.append(label,area);
   form.append(button(c.suggest,function(){if(state.choice===''){announce(c.validation);fieldset.querySelector('input').focus();return;}state.reason=c.suggestions[Number(state.choice)];area.value=state.reason;invalidate();area.focus();},'grid-text-button'));
   var submit=el('button',c.confirm,'button');submit.type='submit';form.append(submit);form.addEventListener('submit',function(e){e.preventDefault();if(state.choice===''||!state.reason.trim()){announce(c.validation);area.focus();return;}state.confirmed=true;if(!completed){completed=true;track('demo_complete');}render(false);document.getElementById('grid-confirmed').focus();});body.append(form,el('p',c.local,'grid-muted'));
   if(state.confirmed){var result=el('section',undefined,'grid-confirmed');result.id='grid-confirmed';result.tabIndex=-1;result.append(el('h3',c.confirmed),el('p',c.options[Number(state.choice)]),el('p',state.reason,'grid-note'));result.append(button(c.download,function(){var blob=new Blob([record(c,state)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='Neurytika-GRID-014-'+document.documentElement.lang+'.txt';document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);},'button'));body.append(result);
    var learning=el('section',undefined,'grid-learning');learning.append(el('h3',c.learnTitle),el('p',c.learnIntro));
    var learningLabel=el('label',undefined,'grid-check'),verified=el('input');verified.type='checkbox';verified.checked=state.learningValidated;verified.disabled=state.learned;learningLabel.append(verified,el('span',c.learnCheck));learning.append(learningLabel);
    var learn=button(c.learnButton,function(){state.learned=true;render(false);document.getElementById('grid-learned').focus();},'button');learn.disabled=!state.learningValidated||state.learned;
    verified.addEventListener('change',function(){state.learningValidated=verified.checked;learn.disabled=!verified.checked||state.learned;});learning.append(learn);
    if(state.learned){var learned=card(c.learnDone,c.learnResult);learned.id='grid-learned';learned.tabIndex=-1;learning.append(learned);}
    var source=el('a',c.learnSource,'text-link');source.href='https://doi.org/10.1016/j.neucom.2025.131797';learning.append(source);body.append(learning);
   }
   body.append(button(c.reset,function(){state={step:0,checked:false,updated:false,choice:'',reason:'',confirmed:false,learningValidated:false,learned:false};render(true);},'grid-text-button'));
  }
  if(focus){heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'auto'});}
 }
 function invalidate(){state.confirmed=false;var old=document.getElementById('grid-confirmed');if(old)old.remove();var learning=body.querySelector('.grid-learning');if(learning)learning.remove();}
 next.addEventListener('click',function(){begin();if(state.step<3){state.step++;track('demo_step',{step_number:state.step+1});render(true);}});
 back.addEventListener('click',function(){if(state.step>0){state.step--;render(true);}});
 document.addEventListener('click',function(e){if(e.target.closest('.demo-pilot-link'))track('demo_pilot_click');});
 shell.querySelector('.grid-controls').hidden=false;render(false);
})(typeof window==='object'?window:globalThis);
