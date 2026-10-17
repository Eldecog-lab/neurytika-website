(function(){
 'use strict';
 var shell=document.getElementById('walkthrough'),model=window.NeurytikaExample,c=(window.NeurytikaDemoCopy||{})[document.documentElement.lang];if(!shell||!model||!c)return;
 var step=0,selected='A',started=false,completed=false,choices=shell.querySelector('.demo-choices'),body=document.getElementById('demo-stage-body'),heading=document.getElementById('demo-stage-heading'),next=shell.querySelector('.demo-next'),back=shell.querySelector('.demo-back');
 function el(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
 function track(name,params){if(window.NeurytikaAudience)window.NeurytikaAudience.track(name,params);}
 function begin(){if(!started){started=true;track('demo_start');}}
 function format(s,values){return s.replace(/\{(\w+)\}/g,function(_,k){return values[k];});}
 function evidenceChips(result){var box=el('div',undefined,'demo-signals');['temperature','vibration'].forEach(function(key){var chip=el('div',undefined,'demo-signal '+result.item[key]);chip.append(el('span',c[key]),el('strong',c[result.item[key]]));box.append(chip);});return box;}
 model.equipment.forEach(function(item,i){var b=el('button',undefined,'demo-choice');b.type='button';b.dataset.example=item.id;b.append(el('span',item.id,'demo-choice-letter'),el('span',c.assets[i]));b.addEventListener('click',function(){begin();selected=item.id;step=0;render(false);shell.querySelector('.demo-announcement').textContent=c.assets[i]+'. '+c.steps[0];});choices.append(b);});
 function render(focus){
  var r=model.explain(selected),idx=model.equipment.findIndex(function(x){return x.id===selected;});
  shell.querySelectorAll('[data-example]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.example===selected));});
  shell.querySelectorAll('[data-progress]').forEach(function(li){if(Number(li.dataset.progress)===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');li.dataset.done=String(Number(li.dataset.progress)<step);});
  document.getElementById('demo-step-label').textContent=format(c.stepLabel,{step:step+1});heading.textContent=c.steps[step];body.replaceChildren();
  if(step===0){body.append(el('p',c.assets[idx],'demo-selected'),evidenceChips(r));var question=el('div',undefined,'demo-question');question.append(el('span','?','demo-question-mark'),el('p',c.compare));body.append(question);}
  if(step===1){body.append(el('p',c.pattern,'demo-selected'),evidenceChips(r));var result=el('div',undefined,'demo-result');result.append(el('span',c.exampleLabel,'demo-small'),el('h3',c[r.category]),el('p',format(c.count,r)));body.append(result);
   var bars=el('div',undefined,'demo-bars');bars.setAttribute('aria-label',c.countsTitle);Object.keys(r.counts).forEach(function(key){var row=el('div',undefined,'demo-bar-row');row.append(el('span',c[key]));var trackEl=el('div',undefined,'demo-bar-track'),fill=el('span',undefined,'demo-bar-fill '+key);fill.style.width=(r.counts[key]/r.total*100)+'%';trackEl.setAttribute('aria-hidden','true');trackEl.append(fill);row.append(trackEl,el('strong',r.counts[key]+'/'+r.total));bars.append(row);});body.append(bars);
   var sameTemperature=model.records.filter(function(x){return x.temperature===r.item.temperature;});body.append(el('p',format(c.allCount,{support:sameTemperature.filter(function(x){return x.outcome===r.category;}).length,total:sameTemperature.length}),'demo-small'));
   var details=el('details',undefined,'demo-records');details.append(el('summary',c.records));var table=el('table'),caption=el('caption',c.countsTitle);table.append(caption);var thead=el('thead'),tr=el('tr');[c.record,c.outcome].forEach(function(x){var th=el('th',x);th.scope='col';tr.append(th);});thead.append(tr);table.append(thead);var tbody=el('tbody');r.matches.forEach(function(x){var row=el('tr');row.append(el('td',x.id),el('td',c[x.outcome]));tbody.append(row);});table.append(tbody);details.append(table);body.append(details);
  }
  if(step===2){var result=el('div',undefined,'demo-action-card');result.append(el('span','✓','demo-action-check'),el('p',c.assets[idx],'demo-small'),el('h3',c[r.category]),el('p',c[r.category+'Action']),el('strong',c.human));body.append(result);var pilot=document.querySelector('.demo-pilot-link');if(pilot){var a=el('a',pilot.textContent,'text-link demo-pilot-link');a.href=pilot.href;body.append(a);}}
  back.hidden=step===0;back.textContent=c.back;next.textContent=step===0?c.next:step===1?c.action:c.restart;
  if(focus){heading.focus({preventScroll:true});var target=window.matchMedia('(max-width:850px)').matches?heading:shell;target.scrollIntoView({block:'start',behavior:'auto'});}
 }
 next.addEventListener('click',function(){begin();step=(step+1)%3;if(step>0)track('demo_step',{step_number:step+1});if(step===2&&!completed){completed=true;track('demo_complete');}render(true);});
 back.addEventListener('click',function(){if(step>0){step--;render(true);}});
 document.addEventListener('click',function(e){if(e.target.closest('.demo-pilot-link'))track('demo_pilot_click');});
 shell.classList.add('is-ready');render(false);
}());
