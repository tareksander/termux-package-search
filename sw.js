
const sw_version = 1;









const getCache = async () => {
    return await self.caches.open("v" + sw_version);
}




const initCache = async () => {
    let cache = await getCache();
    await cache.addAll([
        "/index.html",
        "/index.js",
        "/index.css",
        "https://unpkg.com/pako@2.0.4/dist/pako.min.js",
        "https://unpkg.com/localforage@1.10.0/dist/localforage.min.js",
    ]);
}

const clearOldCaches = async () => {
    for (let i = 1; i < sw_version; i++) {
        await self.caches.delete("v" + i);
    }
    await clients.claim()
}

const fetchResponse = async (r) => {
    let url = new URL(r.url);
    if (url.pathname === "/") {
        url.pathname = "/index.html";
    }
    const cacheResponse = await self.caches.match(url.toString());
    if (cacheResponse) {
        return cacheResponse;
    }
    return fetch(r);
}
 


oninstall = (ev) => {
    self.skipWaiting()
    ev.waitUntil(initCache());
}

onactivate = (ev) => {
    ev.waitUntil(clearOldCaches());
}

onfetch = (ev) => {
    ev.respondWith(fetchResponse(ev.request))
}


