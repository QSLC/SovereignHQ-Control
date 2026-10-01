(function(root){
'use strict';
const integer=x=>Number.isInteger(x)&&x>=0;
const api={
 repositoryCoverage(checked,discovered){return integer(checked)&&integer(discovered)&&discovered>0&&checked<=discovered?checked/discovered:null},
 ciMergeReadiness(checks,checkedHead,currentHead,mergeable){if(!Array.isArray(checks)||!checks.length||typeof checkedHead!=='string'||!checkedHead||typeof currentHead!=='string'||!currentHead||typeof mergeable!=='boolean')return null;return checkedHead===currentHead&&mergeable&&checks.every(c=>c&&c.conclusion==='success')},
 evidenceFreshnessHours(now,sourceTime){return Number.isFinite(now)&&Number.isFinite(sourceTime)&&now>=sourceTime?(now-sourceTime)/3600000:null},
 sourceTaskProgress(completed,total){return integer(completed)&&integer(total)&&total>0&&completed<=total?completed/total:null}
};
if(typeof module==='object'&&module.exports)module.exports=Object.freeze(api);else root.EVEFormulas=Object.freeze(api);
})(typeof window==='object'?window:globalThis);
