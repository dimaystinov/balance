const CACHE='spacemath-v2',META=new URL('__offline_complete__',self.registration.scope).href;
const SHELL=['./','index.html','style.css','app.js','engine.js','quiz-bank.js','manifest.webmanifest','icon.svg','vendor/katex/katex.min.css','vendor/katex/katex.min.js','vendor/katex/contrib/auto-render.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('spacemath-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(e.request);if(cached)return cached;const r=await fetch(e.request);if(r.ok)e.waitUntil(c.put(e.request,r.clone()));return r;}));});
let downloading=null;
self.addEventListener('message',e=>{const client=e.source;if(e.data?.type==='STATUS'){e.waitUntil(caches.open(CACHE).then(async c=>client?.postMessage({type:'STATUS',ready:!!await c.match(META)})));return;}if(e.data?.type!=='DOWNLOAD_ALL')return;
 if(downloading){client?.postMessage({type:'ERROR'});return;}
 downloading=(async()=>{try{const c=await caches.open(CACHE);const response=await fetch('offline-files.json');if(!response.ok)throw Error('manifest');const files=await response.json();let at=0,done=0;await Promise.all(Array.from({length:6},async()=>{while(at<files.length){const file=files[at++];if(!await c.match(file)){const r=await fetch(file);if(!r.ok)throw Error(file);await c.put(file,r);}done++;if(done%20===0||done===files.length)client?.postMessage({type:'PROGRESS',done,total:files.length});}}));await c.put(META,new Response('complete'));client?.postMessage({type:'DONE',ready:true});}catch{client?.postMessage({type:'ERROR'});}finally{downloading=null;}})();e.waitUntil(downloading);
});
