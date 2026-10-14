/* SOCIAL IMOB 360 PRO (versão de venda) — funcionamento sem internet.
   Com internet: busca a versão mais nova e guarda uma cópia.
   Sem internet: abre a última cópia guardada.
   Os dados ficam no aparelho (IndexedDB) e nunca passam por aqui. */
var CACHE = 'socialimobpro-v5-0-0';
var ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icone-v2-192.png', 'icone-v2-512.png', 'icone-v2-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('socialimobpro-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin || u.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;
  var chave = e.request.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : e.request.url;
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'}) : e.request).then(function (r) {
      if (r && r.ok && !r.redirected) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(chave, copia); }); }
      return r;
    }).catch(function () { return caches.match(chave).then(function (m) { return m || caches.match(e.request); }); })
  );
});
