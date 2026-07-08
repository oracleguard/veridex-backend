const cacheStore = new Map();

export function setCache(key: string, value: any, ttl: number = 3600) {
  cacheStore.set(key, value);
  setTimeout(() => cacheStore.delete(key), ttl * 1000);
}

export function getCache(key: string) {
  return cacheStore.get(key);
}
