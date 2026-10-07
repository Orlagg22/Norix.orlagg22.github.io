/* Noryx · service worker
   - La página (HTML) se pide SIEMPRE primero a la red: cada vez que subes una versión nueva
     del código, los usuarios la reciben sin que tengas que tocar este archivo.
   - Si no hay internet, se usa la última copia guardada (la app abre sin conexión).
   - Los llamados a APIs (Supabase, Pollinations, Google…) no se tocan: van directo a la red.
   Subir VERSION solo hace falta si cambias los íconos o este archivo. */
const VERSION = 'noryx-v1';
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const r = await fetch(req, { cache: 'no-cache' });
    if (r && r.ok) c.put(req, r.clone());
    return r;
  } catch (e) {
    return (await c.match(req)) || (await c.match('./')) || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('/sw.js')) return;
    const isPage = req.mode === 'navigate' || /\.html?$/.test(url.pathname) || url.pathname.endsWith('/');
    e.respondWith(isPage ? networkFirst(req) : staleWhileRevalidate(req));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
