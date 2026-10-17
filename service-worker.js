// Somente arquivos estáticos. Nunca cachear Auth, API, documentos ou CDN.
const CACHE='hsn-shell-v4';
const SHELL=['./','./index.html','./css/style.css','./js/config.js','./js/theme.js','./js/utils.js','./js/app.js','./js/finance.js','./js/import-rules.js','./js/phase4.js','./js/attachments.js','./js/document-parser.js','./js/ocr-reader.js','./js/document-reading.js','./js/alerts-engine.js','./js/phase3.js','./js/dates.js','./js/boletos.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
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
