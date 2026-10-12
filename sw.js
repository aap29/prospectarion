/* PROSPECTARION — funcionamento sem internet (V10.2)
   Com internet: busca a versão mais nova e guarda uma cópia.
   Sem internet: abre a última cópia guardada. Os dados do cliente
   ficam no aparelho e nunca passam por aqui. */
var CACHE = 'prospectarion-v10-4-7';
var ARQUIVOS = ['app.html', 'demo.html', 'teste.html', 'manifest-app.webmanifest', 'manifest-demo.webmanifest', 'manifest-teste.webmanifest', 'icone-192.png', 'icone-512.png'];

/* Endereço curto (…/teste) e completo (…/teste.html) usam a mesma cópia guardada */
function chave(url) {
  var u = new URL(url);
  if (u.origin !== self.location.origin) return null;
  var nome = u.pathname.split('/').pop();
  if (nome && nome.indexOf('.') === -1) nome += '.html';
  if (ARQUIVOS.indexOf(nome) === -1) return null;
  return new URL(nome, self.registration.scope).href;
}

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('prospectarion-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var k = chave(e.request.url);
  if (!k) return; /* o resto segue normal */
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok && !r.redirected) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(k, copia); }); }
      return r;
    }).catch(function () {
      return caches.match(k);
    })
  );
});
