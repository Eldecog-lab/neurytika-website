/* A transparent educational example, not the ERC inference engine.
 * These twelve fictional records illustrate counts for feature combinations.
 * Values are categories, not calibrated probabilities or performance results.
 */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NeurytikaExample=factory();})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 var records=[
 {id:'H01',temperature:'high',vibration:'high',outcome:'inspect'},
 {id:'H02',temperature:'high',vibration:'high',outcome:'inspect'},
 {id:'H03',temperature:'high',vibration:'high',outcome:'inspect'},
 {id:'H04',temperature:'high',vibration:'high',outcome:'monitor'},
 {id:'H05',temperature:'high',vibration:'normal',outcome:'monitor'},
 {id:'H06',temperature:'high',vibration:'normal',outcome:'monitor'},
 {id:'H07',temperature:'high',vibration:'normal',outcome:'monitor'},
 {id:'H08',temperature:'high',vibration:'normal',outcome:'inspect'},
 {id:'H09',temperature:'normal',vibration:'normal',outcome:'routine'},
 {id:'H10',temperature:'normal',vibration:'normal',outcome:'routine'},
 {id:'H11',temperature:'normal',vibration:'normal',outcome:'routine'},
 {id:'H12',temperature:'normal',vibration:'normal',outcome:'routine'}];
 var equipment=[{id:'A',temperature:'high',vibration:'high'},{id:'B',temperature:'high',vibration:'normal'},{id:'C',temperature:'normal',vibration:'normal'}];
 function explain(id){var item=equipment.find(function(x){return x.id===id;});if(!item)throw Error('Unknown example');var matches=records.filter(function(x){return x.temperature===item.temperature&&x.vibration===item.vibration;}),counts={inspect:0,monitor:0,routine:0};matches.forEach(function(x){counts[x.outcome]++;});var category=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0];return{item:item,matches:matches,counts:counts,total:matches.length,category:category,support:counts[category]};}
 return {equipment:equipment,records:records,explain:explain};
});
