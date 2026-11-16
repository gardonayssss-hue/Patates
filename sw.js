/* PatatoMax service worker - SURUM'u her guncellemede degistir (her teslimde yeni sw.js verilir) */
const VERSION='2026-11-16-1';
const CACHE='patatomax-'+VERSION;
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))));
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});

/* Ag oncelikli: internet varsa HER ZAMAN en yeni dosya gelir, yoksa onbellekten acilir (cevrimdisi oyun) */
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const net=await Promise.race([
        fetch(r,{cache:'no-cache'}),
        new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),6000))
      ]);
      if(net&&net.ok){cache.put(r,net.clone());return net}
      const old=await cache.match(r,{ignoreSearch:true});
      return old||net;
    }catch(_){
      const hit=await cache.match(r,{ignoreSearch:true});
      if(hit)return hit;
      if(r.mode==='navigate'){const idx=await cache.match('./index.html');if(idx)return idx}
      return Response.error();
    }
  })());
});
