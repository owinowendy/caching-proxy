
const cache = new Map();

export function getCachedResponse(key) {

  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry;
}

export function setCachedResponse(key, response, ttl) {

  cache.set(key, {
    ...response,
    expiresAt: Date.now() + ttl * 1000
  });

}

export function clearCache() {
  cache.clear();
}
