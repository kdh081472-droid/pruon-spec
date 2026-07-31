// 최소한의 서비스워커: 앱을 "홈 화면에 추가"할 수 있게 해주는 용도
// (데이터는 항상 Supabase에서 최신으로 가져오므로 캐싱은 최소한으로만 사용)
const CACHE_NAME = "pruon-spec-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패하면 캐시(오프라인 대비) — 데이터는 항상 최신을 우선함
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
