import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let tick=null,created=0,observedCallback=null,reduced=false;
const elements=new Map();
for(const id of ['journey','journey-play','journey-preview','journey-range'])elements.set(id,{classList:{toggle(){}},setAttribute(){},style:{setProperty(){}},getBoundingClientRect:()=>({left:0,top:0}),innerHTML:''});
const context=vm.createContext({Set,FormData,URL,Math,Number,String,Array,performance:{now:()=>0},t:en=>en,icon:()=>'',
 document:{hidden:false,getElementById:id=>elements.get(id)},
 matchMedia:()=>({matches:reduced}),
 IntersectionObserver:class{constructor(cb){observedCallback=cb}observe(){}disconnect(){}},
 setInterval:fn=>(tick=fn,created++,created),clearInterval:()=>{tick=null}
});
const code='let currentJourney=0;'+fs.readFileSync(new URL('../docs/experience.js',import.meta.url),'utf8')+fs.readFileSync(new URL('../docs/refinements.js',import.meta.url),'utf8')+'\nupdateJourney=i=>currentJourney=i;this.state=()=>({step:currentJourney,playing:journeyIsPlaying,wanted:journeyAutoWanted});';
vm.runInContext(code,context);
context.bindJourneyControl();observedCallback([{intersectionRatio:.1}]);assert.equal(context.state().playing,false);
observedCallback([{intersectionRatio:.6}]);assert.equal(context.state().playing,true);assert.equal(created,1);
observedCallback([{intersectionRatio:.8}]);assert.equal(created,1,'visibility changes must not keep restarting the timer');
tick();assert.equal(context.state().step,1);tick();tick();tick();assert.equal(context.state().step,0,'four stages loop back to the start');
observedCallback([{intersectionRatio:0}]);assert.equal(context.state().playing,false);
observedCallback([{intersectionRatio:.8}]);assert.equal(context.state().playing,true);
context.stopJourney();assert.equal(context.state().wanted,false);assert.equal(tick,null);
observedCallback([{intersectionRatio:.8}]);assert.equal(context.state().playing,false,'explicit pause is retained');
context.playJourney();assert.equal(context.state().playing,true);
elements.get('journey-range').oninput({target:{value:'2'}});assert.equal(context.state().step,2);assert.equal(context.state().playing,false);
context.document.hidden=true;context.document.onvisibilitychange();assert.equal(context.state().playing,false);
console.log('Journey checks passed: autoplay, repeat loop, pause out of view, timer stability and manual control');
