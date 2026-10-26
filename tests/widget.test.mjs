import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const source=await fs.readFile(new URL('../widget.js',import.meta.url),'utf8');
function setup(){
 const dom=new JSDOM('<!doctype html><html><body><aside><button aria-label="聊天操作">Sidebar</button></aside><header><button class="button-toolbar" aria-label="聊天操作">More</button></header></body></html>',{url:'https://local.test',runScripts:'outside-only'});
 let tick;
 const mediaListeners=new Set();
 const media={matches:false,addEventListener(_event,fn){mediaListeners.add(fn);},removeEventListener(_event,fn){mediaListeners.delete(fn);}};
 dom.window.matchMedia=()=>media;
 dom.window.setInterval=fn=>{tick=fn;return 1;};dom.window.clearInterval=()=>{};
 dom.window.HTMLElement.prototype.getBoundingClientRect=function(){return {x:100,y:56,left:100,top:56,right:128,bottom:84,width:28,height:28};};
 dom.window.eval(source);
 const state=()=>dom.window.__QUOTA_CORNER__;
 return {dom,state,root:()=>dom.window.document.getElementById('quota-corner').shadowRoot,tick:()=>tick(),systemDark:value=>{media.matches=value;for(const fn of mediaListeners)fn();},close:()=>{state()?.destroy();dom.window.close();}};
}
test('quota bars preserve distinct cycles and clamp out-of-range values',()=>{
 const a=setup();try{
  a.state().update({status:'ready',fetchedAt:Date.now(),windows:[{windowDurationMins:300,remainingPercent:35},{windowDurationMins:10080,remainingPercent:72}],tokens:125000,cache:91.23});
  assert.equal(a.root().querySelector('[data-kind="hour"] .fill').style.width,'35%');
  assert.equal(a.root().querySelector('[data-kind="week"] .fill').style.width,'72%');
  assert.equal(a.root().querySelector('.cache').textContent,'91.2%');
  a.state().update({status:'ready',fetchedAt:Date.now(),windows:[{windowDurationMins:300,remainingPercent:180},{windowDurationMins:10080,remainingPercent:-3}]});
  assert.equal(a.root().querySelector('[data-kind="hour"] .fill').style.width,'100%');
  assert.equal(a.root().querySelector('[data-kind="week"] .fill').style.width,'0%');
 }finally{a.close();}
});
test('unknown quota is not exposed as zero and zero remains a valid value',()=>{
 const a=setup();try{
  a.state().update({status:'error',windows:[],tokens:null,cache:null});
  assert.equal(a.root().querySelector('.value').textContent,'—');
  assert.equal(a.root().querySelector('.track').hasAttribute('aria-valuenow'),false);
  assert.equal(a.root().querySelector('.tokens').textContent,'—');
  a.state().update({status:'ready',fetchedAt:Date.now(),windows:[{windowDurationMins:300,remainingPercent:0}]});
  assert.equal(a.root().querySelector('.track').getAttribute('aria-valuenow'),'0');
 }finally{a.close();}
});
test('collapse and expand use buttons, persist on remount and clean up the slot',()=>{
 const a=setup();try{
  a.root().querySelector('.min').click();assert.equal(a.state().snapshot().collapsed,true);
  a.root().querySelector('.badge').click();assert.equal(a.state().snapshot().collapsed,false);
  a.root().querySelector('.badge').click();assert.equal(a.root().querySelector('.badge').getAttribute('aria-expanded'),'false');
  a.state().destroy();a.dom.window.eval(source);assert.equal(a.state().snapshot().collapsed,true);
  a.dom.window.eval(source);assert.equal(a.dom.window.document.querySelectorAll('#quota-corner').length,1);
  a.state().destroy();assert.equal(a.dom.window.document.getElementById('quota-corner-slot'),null);
 }finally{a.close();}
});
test('anchors before toolbar actions and excludes identically named sidebar actions',()=>{
 const a=setup();try{
  const slot=a.dom.window.document.getElementById('quota-corner-slot');
  assert.equal(slot.nextElementSibling.closest('header').tagName,'HEADER');
  assert.equal(a.dom.window.document.getElementById('quota-corner').parentElement.tagName,'BODY');
  slot.remove();a.tick();assert.equal(slot.isConnected,true);
 }finally{a.close();}
});
test('missing heartbeat marks stale data instead of presenting cached values as live',()=>{
 const a=setup();try{
  a.state().update({status:'ready',fetchedAt:Date.now(),windows:[{windowDurationMins:300,remainingPercent:40}]});
  const now=Date.now();a.dom.window.Date.now=()=>now+13000;a.tick();
  assert.equal(a.root().querySelector('.status').textContent,'监视器已停止');
  assert.equal(a.root().querySelector('.value').textContent,'40%');
 }finally{a.close();}
});
test('client theme changes override OS preference without remounting the widget',async()=>{
 const a=setup();try{
  const html=a.dom.window.document.documentElement,host=a.dom.window.document.getElementById('quota-corner');
  html.setAttribute('data-theme','dark');await Promise.resolve();
  assert.equal(a.state().snapshot().theme,'dark');
  html.setAttribute('data-theme','light');await Promise.resolve();
  assert.equal(a.state().snapshot().theme,'light');
  a.systemDark(true);assert.equal(a.state().snapshot().theme,'light');
  assert.equal(a.dom.window.document.getElementById('quota-corner'),host);
  html.style.colorScheme='dark';await Promise.resolve();
  assert.equal(a.state().snapshot().theme,'dark');
  html.style.colorScheme='light';await Promise.resolve();
  assert.equal(a.state().snapshot().theme,'light');
 }finally{a.close();}
});
