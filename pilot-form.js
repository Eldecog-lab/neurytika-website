(function(){
 'use strict';
 var form=document.querySelector('.pilot-form');if(!form)return;
 var lang=document.documentElement.lang,c={en:{sending:'Sending your evaluation request…',done:'Thank you. Your evaluation request has been accepted by the submission service for delivery to our team.',error:'Delivery has not been confirmed. Please try again; your details are still here.'},fr:{sending:'Envoi de votre demande d’évaluation…',done:'Merci. Votre demande d’évaluation a été acceptée par le service de transmission pour être envoyée à notre équipe.',error:'L’envoi n’a pas été confirmé. Réessayez ; vos informations sont toujours présentes.'},es:{sending:'Enviando su solicitud de evaluación…',done:'Gracias. El servicio de transmisión ha aceptado su solicitud de evaluación para enviarla a nuestro equipo.',error:'El envío no se ha confirmado. Inténtelo de nuevo; sus datos siguen aquí.'}}[lang];if(!c)return;
 var busy=false,done=false,button=form.querySelector('button[type="submit"]'),status=form.querySelector('.pilot-status');
 form.addEventListener('submit',async function(event){
  event.preventDefault();if(busy||done||!form.reportValidity()||form.elements._honey.value)return;
  var fields=['name','organization','email','sector','problem','data','timing'],payload={};
  for(var i=0;i<fields.length;i++){var field=form.elements[fields[i]];if(!field.value.trim()){field.focus();return;}payload[fields[i]]=field.value.trim();}
  busy=true;button.disabled=true;status.textContent=c.sending;
  var test=window.NeurytikaAudience?window.NeurytikaAudience.isTestSubmission(payload.name):/^TEST\b/i.test(payload.name);
  Object.assign(payload,{_subject:(test?'[TEST] ':'')+'Neurytika technology evaluation ['+lang+']',_template:'table',_honey:'',test_submission:test?'YES':'NO',request_type:'technology_evaluation',processing_notice:form.querySelector('.pilot-consent span').textContent,source:location.origin+location.pathname,language:lang,submitted_at:new Date().toISOString()});
  var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},25000);
  try{var response=await fetch('https://formsubmit.co/ajax/f667a3546b4871bed81cc55c801cd7a0',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});var result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw Error('unconfirmed');done=true;if(!test&&window.NeurytikaAudience)window.NeurytikaAudience.track('generate_lead');form.reset();Array.from(form.children).forEach(function(child){if(child!==status)child.hidden=true;});status.textContent=c.done;}catch(_){status.textContent=c.error;}finally{clearTimeout(timer);busy=false;button.disabled=done;}
 });
}());
