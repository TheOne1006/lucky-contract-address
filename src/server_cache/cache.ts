import { LRUCache } from "lru-cache"
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60, // 1小时
})

export function getCache(key: string) {
  return cache.get(key)
}

export function setCache(key: string, value: any) {
  cache.set(key, value)
}
