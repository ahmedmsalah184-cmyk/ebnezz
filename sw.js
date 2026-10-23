/* يخزن ملفات التطبيق عشان يشتغل من غير نت. غيّر رقم النسخة لو عدلت الملفات. */
var V = 'ebn-ezz-v9';
var SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'logo.png', 'icon-192.png', 'icon-512.png', 'favicon.png'];

self.addEventListener('install', function (e) {
  /* كل ملف لوحده: لو ملف ناقص، التثبيت مايفشلش كله */
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var ok = url.origin === location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!ok) return;
  e.respondWith(caches.open(V).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? cache.match('index.html') : Response.error()); });
      return hit || net;
    });
  }));
});
