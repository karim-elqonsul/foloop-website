import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let tick=null, created=0, observerCallback, reduced=false, consoleAvailable=true;
const listeners=new Map();
const query={get matches(){return reduced},addEventListener(){},removeEventListener(){}};
const document={hidden:false,getElementById:()=>consoleAvailable?{}:null,addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:event=>listeners.delete(event)};
const context=vm.createContext({Set,URL,Math,Number,String,Array,t:en=>en,document,window:{IntersectionObserver:true},matchMedia:()=>query,
 IntersectionObserver:class{constructor(fn){observerCallback=fn}observe(){}disconnect(){}},
 setInterval:(fn,delay)=>(assert.equal(delay,3200),tick=fn,++created),clearInterval:()=>{tick=null}
});
vm.runInContext(fs.readFileSync(new URL('../docs/experience.js',import.meta.url),'utf8')+'\nupdateHero=()=>{};this.state=()=>({mode:heroMode,step:heroStage,playing:heroPlaying,wanted:heroAutoWanted});',context);
context.bindHeroMotion();observerCallback([{intersectionRatio:.7}]);assert.equal(context.state().playing,true);
observerCallback([{intersectionRatio:.9}]);assert.equal(created,1,'observer updates retain the current interval');
tick();assert.equal(context.state().step,1);tick();tick();tick();assert.equal(context.state().mode,'inbox');
for(let i=0;i<4;i++)tick();assert.equal(context.state().mode,'automation');
for(let i=0;i<4;i++)tick();assert.equal(context.state().mode,'crm');
observerCallback([{intersectionRatio:0}]);assert.equal(context.state().playing,false);
observerCallback([{intersectionRatio:.7}]);assert.equal(context.state().playing,true);
document.hidden=true;listeners.get('visibilitychange')();assert.equal(context.state().playing,false);
document.hidden=false;listeners.get('visibilitychange')();assert.equal(context.state().playing,true);
context.stopHeroDemo();observerCallback([{intersectionRatio:.8}]);assert.equal(context.state().playing,false,'manual pause remains paused');
context.runHeroDemo();assert.equal(context.state().playing,true);
context.bindHeroMotion();observerCallback([{intersectionRatio:.8}]);assert.equal(context.state().playing,true,'language rendering preserves playback intent');
reduced=true;context.handleHeroMotionChange();assert.equal(context.state().playing,false);
context.runHeroDemo();assert.equal(context.state().playing,true,'explicit play is available with reduced motion');
consoleAvailable=false;context.bindHeroMotion();assert.equal(tick,null);assert.equal(listeners.size,0,'pricing navigation cleans up playback');
console.log('Hero checks passed: autoplay, three views, visibility, stable intervals, explicit pause, reduced motion and cleanup');
