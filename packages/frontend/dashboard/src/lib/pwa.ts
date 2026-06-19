'use client';

export function register(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {})
        .catch(() => {});
    });
  }
}

export function checkOnlineStatus(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function listenToOnlineChanges(
  onOnline: () => void,
  onOffline: () => void,
): () => void {
  const handleOnline = () => onOnline();
  const handleOffline = () => onOffline();

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function cacheApiResponse(
  request: RequestInfo,
  cacheName: string = 'api-cache',
): Promise<Response | undefined> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await caches.open(cacheName);
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    return cached;
  }
}
