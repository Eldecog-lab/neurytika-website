(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NeurytikaQuizReport=factory();}(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function profile(copy,result){var p=Object.assign({},copy.profiles[result.profile]);p.steps=p.steps.slice();if(result.profile==='hybrid'&&result.readiness==='prepare')p.steps[0]=copy.prepareStep;return p;}
 function demo(copy,result){return 'https://formsubmit.co/el/yecudu?subject='+encodeURIComponent('Neurytika demo — '+copy.profiles[result.profile].title);}
 function build(copy,result,answers,name,routes,lang){
 var p=profile(copy,result),topic=result.profile==='generative'||result.profile==='hybrid'?'generative-ai-vs-predictive-ai':result.topic;
 return [copy.emailGreeting+' '+name+',',copy.emailIntro,p.title,p.body,copy.reasons+'\n'+p.why.map(x=>'• '+x).join('\n'),copy.architecture+'\n'+copy[result.deployment],copy.nextSteps+'\n'+p.steps.map((x,i)=>(i+1)+'. '+x).join('\n'),copy.emailDemo+'\n'+demo(copy,result),copy.related+'\nhttps://eldecog-lab.github.io/neurytika-website/'+routes[topic][lang],copy.emailAnswers+'\n'+copy.questions.map(q=>q.title+'\n'+q.options.find(o=>o[0]===answers[q.key])[1]).join('\n\n'),copy.emailClosing].join('\n\n');
 }
 return {profile:profile,demo:demo,build:build};
}));
