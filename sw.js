// Iron Log offline cache. The version changes on every build so phones pick up updates.
const CACHE='iron-log-f84b7b13c0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const keep=res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c))}return res};
  if(u.origin===location.origin){
    // the app itself: newest from the internet, the saved copy when offline
    e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));
  }else if(/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)){
    // fonts: saved copy first, they never change
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(keep)));
  }
});
