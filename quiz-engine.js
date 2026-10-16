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
  var api={recommend:recommend,accepted:accepted};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.NeurytikaQuizEngine=api;
}(typeof window !== 'undefined' ? window : this));
