import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CdpSession,targetsAt} from './cdp.mjs';
import {UsageClient,LocalCodexTokenTracker} from './vendor/usage-client.mjs';
import {isMainCodexRendererTarget,currentThreadSelectionExpression} from './vendor/current-thread.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const port=Number(arg('--port')||9335);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
const stateRoot=path.resolve(arg('--data')||path.join(process.env.LOCALAPPDATA||root,'QuotaCorner'));
await fs.mkdir(stateRoot,{recursive:true});
const remove=process.argv.includes('--remove');
if(remove){for(const target of (await targetsAt(port)).filter(isMainCodexRendererTarget)){const s=await new CdpSession(target).open();try{await s.evaluate(`(()=>{window.__QUOTA_CORNER__?.destroy();localStorage.removeItem('quota-corner-ui-v1');return !document.getElementById('quota-corner');})()`);}finally{s.close();}}process.exit(0);}
const command=arg('--cli');if(!command)throw new Error('Provide --cli with real Codex CLI path');
const lockPath=path.join(stateRoot,'runtime.lock');
let lock;
try{lock=await fs.open(lockPath,'wx');}catch(error){if(error.code!=='EEXIST')throw error;let old;try{old=JSON.parse(await fs.readFile(lockPath,'utf8'));process.kill(old.pid,0);}catch(e){if(e.code!=='ESRCH'&&!(e instanceof SyntaxError))throw new Error('QuotaCorner already running or lock inaccessible');await fs.rm(lockPath,{force:true});lock=await fs.open(lockPath,'wx');}if(!lock)throw new Error('QuotaCorner already running');}
await lock.writeFile(JSON.stringify({pid:process.pid,port}));await lock.close();
const sessions=new Map();let stopped=false,cycling=false,unreachableSince=null;
const collector=new UsageClient({command,refreshMs:30000});
// Session totals are reconstructed from local event logs; no daily ledger needed.
const tracker=new LocalCodexTokenTracker({counterPath:null});
const payload=await fs.readFile(path.join(root,'widget.js'),'utf8');
async function cycle(){
 if(cycling||stopped)return;cycling=true;
 try{
  const targets=(await targetsAt(port)).filter(isMainCodexRendererTarget);unreachableSince=null;
  for(const [id,s]of sessions)if(!targets.some(t=>t.id===id)){s.close();sessions.delete(id);}
  const threads=[];
  for(const target of targets){
   let session=sessions.get(target.id);
   try{
    if(!session){session=await new CdpSession(target).open();sessions.set(target.id,session);}
    const selection=await session.evaluate(currentThreadSelectionExpression());
    if(selection?.threadId)threads.push(selection.threadId);
    const local=tracker.getThreadView(selection?.threadId||null,Date.now());
    const view=collector.view;
    const data={status:view.status,fetchedAt:view.fetchedAt,windows:view.windows||[],tokens:local.currentTaskTokens??null,cache:local.cacheHitRate??null};
    await session.evaluate(payload);
    await session.evaluate(`window.__QUOTA_CORNER__?.update(${JSON.stringify(data)})`);
   }catch{session?.close();sessions.delete(target.id);}
  }
  tracker.setVisibleThreadIds(threads);
 }catch{unreachableSince??=Date.now();if(Date.now()-unreachableSince>60000)await shutdown();}
 finally{cycling=false;}
}
let timer;
async function shutdown(){if(stopped)return;stopped=true;clearInterval(timer);for(const s of sessions.values()){try{await s.evaluate('window.__QUOTA_CORNER__?.destroy()');}catch{}s.close();}await collector.stop();await tracker.stop();await fs.rm(lockPath,{force:true});process.exit(0);}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
try{
 await fs.writeFile(path.join(stateRoot,'state.json'),JSON.stringify({pid:process.pid,port,version:'0.1.0',root},null,2));
 await collector.start();
 if(collector.view.officialModelProvidersResolved)tracker.setOfficialModelProviders(collector.view.officialModelProviders);
 await tracker.start();await cycle();timer=setInterval(cycle,2000);
 console.log('QuotaCorner ready on loopback port '+port);
}catch(error){console.error(error.message);await shutdown();}
