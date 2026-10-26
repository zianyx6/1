(() => {
  if(window.__QUOTA_CORNER__)return;
  const key='quota-corner-ui-v1';
  let collapsed=false;try{collapsed=JSON.parse(localStorage.getItem(key)||'{}').collapsed===true;}catch{}
  const host=document.createElement('div');host.id='quota-corner';
  host.style.cssText='position:fixed;z-index:2147483000;display:inline-flex;flex-shrink:0;width:28px;height:28px;-webkit-app-region:no-drag;';
  const slot=document.createElement('span');slot.id='quota-corner-slot';slot.setAttribute('aria-hidden','true');slot.style.cssText='display:inline-flex;flex:0 0 28px;width:28px;height:28px;pointer-events:none;';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
  :host{color-scheme:inherit;font:12px/1.45 var(--font-ui-family,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif);--fallback-text:#243044;--fallback-surface:rgba(255,255,255,.97);--fallback-border:rgba(60,75,100,.14);--fallback-muted:#718096;--fallback-track:rgba(90,110,140,.11);--fallback-blue:#2195e8;--fallback-purple:#9b71ed;--fallback-shadow:0 7px 25px #14284814;color:var(--color-text-primary,var(--fallback-text));--surface:var(--color-surface-elevated-secondary,var(--app-color-background-elevated-secondary,var(--color-token-main-surface-primary,var(--fallback-surface))));--border:var(--color-token-border-default,var(--color-border-primary-outline,var(--fallback-border)));--muted:var(--color-text-secondary,var(--app-color-text-foreground-secondary,var(--fallback-muted)));--track:var(--color-background-secondary-soft-alpha,var(--fallback-track));--blue:var(--color-chart-blue,var(--fallback-blue));--purple:var(--color-chart-purple,var(--app-color-accent-purple,var(--fallback-purple)));--panel-shadow:var(--shadow-dropdown-overlay,var(--fallback-shadow));--hover:var(--color-background-primary-ghost-hover,var(--track));--good:var(--color-chart-green,#32af88);--warning:var(--color-text-caution-outline,#dca74a);}
  *{box-sizing:border-box}button{font:inherit;cursor:pointer;-webkit-app-region:no-drag}button:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
  .panel{position:absolute;top:36px;right:0;width:260px;max-width:calc(100vw - 28px);padding:14px 15px 12px;background:var(--surface);border:1px solid var(--border);border-radius:17px;box-shadow:var(--panel-shadow);backdrop-filter:blur(20px)}
  .head{display:flex;align-items:center;gap:6px;margin-bottom:15px}.title{font-size:13px;font-weight:650}.live{width:5px;height:5px;background:var(--good);border-radius:50%;margin-left:3px}.head small{font-size:10px;color:var(--muted)}.min{margin-left:auto;border:0;border-radius:6px;background:transparent;color:var(--muted);width:24px;height:24px;font-size:19px;line-height:20px}.min:hover{background:var(--hover)}
  .quota+.quota{margin-top:15px}.row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}.label{font-size:11px;color:var(--muted)}.value{font-size:19px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.7px}.value span{font-size:11px;margin-left:2px;letter-spacing:0}.blue{color:var(--blue)}.purple{color:var(--purple)}
  .track{height:7px;border-radius:7px;background:var(--track);overflow:hidden}.fill{height:100%;width:0;border-radius:7px;transition:width .65s ease;background:var(--blue)}.quota[data-kind="week"] .fill{background:var(--purple)}.reset{font-size:10px;color:var(--muted);margin-top:4px;min-height:14px}.stats{margin-top:13px;padding-top:10px;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:8px}.stat-label{font-size:10px;color:var(--muted)}.stat-value{font-size:13px;font-weight:600;margin-top:2px;font-variant-numeric:tabular-nums}.foot{margin-top:10px;font-size:10px;color:var(--muted);display:flex;justify-content:space-between}.status{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:175px}.badge{display:none;width:42px;height:42px;margin-left:auto;border:1px solid var(--border);border-radius:14px;background:var(--surface);box-shadow:0 4px 14px #14284818;padding:6px;position:relative}.badge svg{width:28px;height:28px;display:block;transform:rotate(-90deg)}circle{fill:none;stroke-width:3}.ring-track{stroke:var(--track)}.ring{stroke:var(--blue);stroke-linecap:round}.ring.week{stroke:var(--purple)}.spark{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;color:var(--muted)}
  .badge{display:block;width:28px;height:28px;padding:2px;border:0;border-radius:8px;box-shadow:none;background:transparent}.badge:hover{background:var(--hover)}.badge svg{width:24px;height:24px}.wrap{width:28px;height:28px}.collapsed .panel{display:none}.stale .live{background:var(--warning)}.stale .fill{opacity:.55}
  :host([data-client-scheme="dark"]){--fallback-text:#e4eaf3;--fallback-surface:rgba(35,38,45,.97);--fallback-border:rgba(255,255,255,.1);--fallback-muted:#96a0b0;--fallback-track:rgba(255,255,255,.075);--fallback-blue:#5bb9fa;--fallback-purple:#b696ff;--fallback-shadow:0 8px 28px #0005}
  @media(prefers-reduced-motion:reduce){.fill{transition:none}}
  </style><div class="wrap"><section class="panel" aria-label="Codex 额度剩余">
   <div class="head"><span class="title">用量</span><i class="live"></i><small>剩余额度</small><button class="min" title="收起为图标" aria-label="收起用量面板">−</button></div>
   <div class="quota" data-kind="hour"><div class="row"><span class="label">五小时额度</span><strong class="value blue">—</strong></div><div class="track" role="progressbar" aria-label="五小时剩余额度" aria-valuemin="0" aria-valuemax="100"><div class="fill"></div></div><div class="reset">等待数据</div></div>
   <div class="quota" data-kind="week"><div class="row"><span class="label">每周额度</span><strong class="value purple">—</strong></div><div class="track" role="progressbar" aria-label="每周剩余额度" aria-valuemin="0" aria-valuemax="100"><div class="fill"></div></div><div class="reset">等待数据</div></div>
   <div class="stats"><div><div class="stat-label">本会话 Token</div><div class="stat-value tokens">—</div></div><div><div class="stat-label">缓存命中率</div><div class="stat-value cache">—</div></div></div>
   <div class="foot"><span class="status">连接中…</span><span>30 秒刷新</span></div>
  </section><button class="badge" aria-label="展开用量面板" title="展开用量面板"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="ring-track" cx="16" cy="16" r="13"/><circle class="ring hour" cx="16" cy="16" r="13" pathLength="100" stroke-dasharray="0 100"/><circle class="ring-track" cx="16" cy="16" r="8"/><circle class="ring week" cx="16" cy="16" r="8" pathLength="100" stroke-dasharray="0 100"/></svg><span class="spark">·</span></button></div>`;
  const wrap=root.querySelector('.wrap');
  const systemTheme=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
  function syncTheme(){
    const html=document.documentElement,body=document.body;
    const computed=getComputedStyle(body||html).colorScheme||getComputedStyle(html).colorScheme;
    let scheme=/^(light|dark)$/.test(computed?.trim())?computed.trim():null;
    if(!scheme){
      for(const node of [html,body].filter(Boolean)){
        const declared=['data-theme','data-color-scheme','data-color-mode'].map(a=>node.getAttribute(a)).find(v=>v==='light'||v==='dark');
        if(declared){scheme=declared;break;}
        if(node.classList.contains('dark')||node.classList.contains('light')){scheme=node.classList.contains('dark')?'dark':'light';break;}
      }
    }
    scheme??=systemTheme?.matches?'dark':'light';
    host.dataset.clientScheme=scheme;host.style.colorScheme=scheme;
  }
  const themeObserver=new MutationObserver(syncTheme);
  const themeAttributes=['class','style','data-theme','data-color-scheme','data-color-mode'];
  for(const node of [document.documentElement,document.body].filter(Boolean))themeObserver.observe(node,{attributes:true,attributeFilter:themeAttributes});
  systemTheme?.addEventListener?.('change',syncTheme);syncTheme();
  const setCollapsed=value=>{collapsed=value;wrap.classList.toggle('collapsed',value);host.dataset.collapsed=String(value);root.querySelector('.badge').setAttribute('aria-expanded',String(!value));root.querySelector('.badge').setAttribute('aria-label',value?'展开用量面板':'收起用量面板');try{localStorage.setItem(key,JSON.stringify({collapsed:value}));}catch{}};
  root.querySelector('.min').onclick=()=>setCollapsed(true);root.querySelector('.badge').onclick=()=>setCollapsed(!collapsed);setCollapsed(collapsed);
  const pct=v=>typeof v==='number'&&Number.isFinite(v)?Math.min(100,Math.max(0,v)):null;
  let last=null,heartbeat=0;
  function update(data){
    last=data;heartbeat=Date.now();
    for(const [kind,minutes] of [['hour',300],['week',10080]]){
      const w=data.windows?.find(w=>w.windowDurationMins===minutes),v=pct(w?.remainingPercent),q=root.querySelector('[data-kind="'+kind+'"]');
      q.querySelector('.value').textContent=v===null?'—':`${Math.round(v)}%`;
      q.querySelector('.fill').style.width=(v??0)+'%';
      const track=q.querySelector('.track');v===null?track.removeAttribute('aria-valuenow'):track.setAttribute('aria-valuenow',String(v));track.setAttribute('aria-valuetext',v===null?'暂无此周期数据':`剩余 ${Math.round(v)}%`);
      q.querySelector('.reset').textContent=w?.resetsAt?new Date(w.resetsAt*1000).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})+' 重置':v===null?'暂无此周期数据':'重置时间未知';
      root.querySelector('.ring.'+kind).setAttribute('stroke-dasharray',`${v??0} 100`);
    }
    root.querySelector('.tokens').textContent=typeof data.tokens==='number'?new Intl.NumberFormat('zh-CN',{notation:'compact',maximumFractionDigits:1}).format(data.tokens):'—';
    root.querySelector('.cache').textContent=typeof data.cache==='number'?data.cache.toFixed(1)+'%':'—';
    root.querySelector('.badge').title=(data.windows||[]).map(w=>`${w.label}剩余 ${w.remainingPercent??'—'}%`).join(' · ')+' · 点击展开';
    status();
  }
  function status(){const disconnected=Date.now()-heartbeat>12000,stale=disconnected||!last||last.status!=='ready'||Date.now()-(last.fetchedAt||0)>90000;wrap.classList.toggle('stale',stale);root.querySelector('.status').textContent=disconnected?'监视器已停止':stale?'数据暂不可用 · 保留上次结果':'已更新 '+new Date(last.fetchedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}
  function place(){
    const anchors=[...document.querySelectorAll('button.button-toolbar[aria-label="聊天操作"],button.button-toolbar[aria-label="Chat actions"],button.button-toolbar[aria-label="Conversation actions"]')];
    const anchor=anchors.find(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.top<130&&!e.closest('[inert],[aria-hidden="true"]');});
    if(anchor){if(slot.parentNode!==anchor.parentNode||slot.nextSibling!==anchor)anchor.parentNode.insertBefore(slot,anchor);const r=slot.getBoundingClientRect();host.style.top=r.top+'px';host.style.left=r.left+'px';host.style.right='';host.dataset.anchor='before-chat-actions';}
    else{slot.remove();host.style.left='';host.style.top='54px';host.style.right='18px';host.dataset.anchor='fallback';}
    if(!host.isConnected)(document.body||document.documentElement).append(host);
  }
  const timer=setInterval(()=>{place();status();},1000);
  window.__QUOTA_CORNER__={update,collapse:setCollapsed,snapshot:()=>({collapsed,theme:host.dataset.clientScheme,visible:host.isConnected,width:host.getBoundingClientRect().width,values:[...root.querySelectorAll('.value')].map(e=>e.textContent),tokens:root.querySelector('.tokens').textContent,cache:root.querySelector('.cache').textContent,last,heartbeat}),destroy(){clearInterval(timer);themeObserver.disconnect();systemTheme?.removeEventListener?.('change',syncTheme);host.remove();slot.remove();delete window.__QUOTA_CORNER__;}};
  place();
})();
