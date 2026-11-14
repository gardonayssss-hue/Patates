const V='patates-v3',F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))));self.clients.claim()});
// Önce kayıtlı kopya (anında açılır), arkada güncellemeyi indirir
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(r=>{
        if(r&&r.ok&&new URL(e.request.url).origin===location.origin){
          const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));
        }
        return r;
      }).catch(()=>hit||caches.match('./index.html'));
      return hit||net;
    })
  );
});
