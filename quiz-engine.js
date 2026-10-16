(function (root) {
  'use strict';
  function recommend(a) {
    var output = a.output === 'unsure' ? (a.goal === 'content' ? 'generate' : 'classify') : a.output;
    var profile = output === 'generate' ? 'generative' : output === 'both' ? 'hybrid' :
      a.data === 'ready' ? 'predictive' : 'prepare';
    var topic = {retention:'customer-retention',leads:'lead-qualification',fraud:'fraud-detection',quality:'quality-control'}[a.goal] || 'predictive-analytics';
    return {profile:profile, topic:topic, deployment:a.hosting==='local'?'local':a.hosting==='cloud'?'cloud':'explore', readiness:a.data==='ready'?'ready':'prepare', timing:a.timing};
  }
  function accepted(response) { return response && (response.success === true || response.success === 'true'); }
  function restore(raw,now) {
    var empty={answers:{},step:-1,completed:false,followup:false,submissionId:null};
    try {
      var v=JSON.parse(raw),choices={goal:['retention','leads','fraud','quality','content','other'],output:['classify','generate','both','unsure'],data:['ready','structured','documents','starting'],hosting:['local','cloud','unsure'],timing:['soon','quarter','explore']};
      if(!v||v.version!==2||typeof v.at!=='number'||now-v.at>7200000||v.at>now)return empty;
      var answers={};Object.keys(choices).forEach(k=>{if(v.answers&&choices[k].indexOf(v.answers[k])!==-1)answers[k]=v.answers[k];});
      var firstMissing=Object.keys(choices).findIndex(k=>!answers[k]);
      var step=Number.isInteger(v.step)&&v.step>=-1&&v.step<=5?v.step:-1;
      if(firstMissing!==-1&&step>firstMissing)step=firstMissing;
      return {answers:answers,step:step,completed:v.completed===true&&firstMissing===-1,followup:v.followup===true,submissionId:typeof v.submissionId==='string'&&v.submissionId.length<100?v.submissionId:null};
    }catch(_){return empty;}
  }
  var api={recommend:recommend,accepted:accepted,restore:restore};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.NeurytikaQuizEngine=api;
}(typeof window !== 'undefined' ? window : this));
