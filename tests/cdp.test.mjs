import test from 'node:test';
import assert from 'node:assert/strict';
import {CdpSession} from '../cdp.mjs';
test('CDP refuses remote, credential-bearing and non-WebSocket endpoints',()=>{
 for(const url of ['ws://example.com:9335/page','wss://127.0.0.1:9335/page','http://127.0.0.1:9335/page','ws://user:pass@127.0.0.1:9335/page']){
  assert.throws(()=>new CdpSession({webSocketDebuggerUrl:url}));
 }
});
