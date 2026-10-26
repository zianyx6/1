export class CdpSession {
  constructor(target) {
    const url = new URL(target.webSocketDebuggerUrl);
    if(url.protocol!=='ws:' || !['127.0.0.1','localhost','[::1]'].includes(url.hostname) || url.username || url.password) throw new Error('Only loopback CDP allowed');
    this.ws=new WebSocket(url); this.pending=new Map(); this.next=0;
  }
  async open() {
    await new Promise((resolve,reject)=>{ const timer=setTimeout(()=>reject(new Error('CDP connect timeout')),5000); this.ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});this.ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('CDP connection failed'));},{once:true}); });
    this.ws.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data);}catch{return;}const p=this.pending.get(m.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);});
    this.ws.addEventListener('close',()=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('CDP closed'));}this.pending.clear();});
    return this;
  }
  send(method,params={}) {return new Promise((resolve,reject)=>{const id=++this.next;const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(method+' timeout'));},7000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
  async evaluate(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:false});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result?.value;}
  close(){this.ws.close();}
}
export async function targetsAt(port){
 const r=await fetch(`http://127.0.0.1:${port}/json/list`,{redirect:'error',signal:AbortSignal.timeout(2000)});
 if(!r.ok)throw new Error('CDP unavailable');
 return (await r.json()).filter(t=>t.type==='page'&&t.url?.startsWith('app://'));
}
