/* Imóveis e Investimentos RS: abre rápido e funciona sem internet depois da primeira visita. Ao publicar, aumente a versão. */
const CACHE='iirs-v2';
const BASE=['./','./index.html','./catalogo.json','./retrato.jpg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return; /* fotos da Innovar e Google Fonts vão direto */
  /* páginas e catálogo: rede primeiro (sempre atualizado), cache se estiver sem internet */
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
