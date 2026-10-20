// Somente arquivos estáticos. Nunca cachear Auth, API, documentos ou CDN.
const CACHE='hsn-shell-v7-zoho-connect';
const SHELL=['./','./index.html','./css/style.css','./css/layout.css','./js/layout.js','./js/config.js','./js/theme.js','./js/utils.js','./js/app.js','./js/zoho-connect.js','./js/finance.js','./js/import-rules.js','./js/phase4.js','./js/planning-engine.js','./js/phase5.js','./js/push-engine.js','./js/push.js','./js/attachments.js','./js/document-parser.js','./js/ocr-reader.js','./js/document-reading.js','./js/alerts-engine.js','./js/phase3.js','./js/dates.js','./js/boletos.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/badge-96.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('hsn-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
 const allowed=SHELL.map(path=>new URL(path,self.registration.scope).href);
 if(!allowed.includes(url.href)&&event.request.mode!=='navigate') return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok&&allowed.includes(url.href)){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
  return response;
 }).catch(async()=> (await caches.match(event.request))||(event.request.mode==='navigate'?await caches.match('./index.html'):null)||Response.error()));
});

// Push contém apenas resumos; nenhum token de acesso, chave privada ou documento.
self.addEventListener('message',event=>{
 if(event.data?.type==='HSN_PUSH_VERSION')event.ports?.[0]?.postMessage({pushVersion:6});
});
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const views=['alerts','commission_alerts','dda'],view=views.includes(data.view)?data.view:'alerts';
 const title=typeof data.title==='string'?data.title.slice(0,100):'Financeiro HSN';
 const body=typeof data.body==='string'?data.body.slice(0,700):'Abra o app para conferir seus avisos.';
 event.waitUntil(self.registration.showNotification(title,{body,icon:new URL('./icons/icon-192.png',self.registration.scope).href,
 badge:new URL('./icons/badge-96.png',self.registration.scope).href,
 tag:typeof data.tag==='string'?data.tag.slice(0,150):'hsn-aviso',renotify:false,data:{view}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const view=['alerts','commission_alerts','dda'].includes(event.notification.data?.view)?event.notification.data.view:'alerts';
 event.waitUntil((async()=>{const scope=new URL(self.registration.scope),url=new URL('./',scope);url.hash=view;
 const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of list){const current=new URL(client.url);if(current.origin===scope.origin&&current.pathname.startsWith(scope.pathname)){
 await client.focus();client.postMessage({type:'HSN_PUSH_OPEN',view});return;}}
 await self.clients.openWindow(url.href);
 })());
});
