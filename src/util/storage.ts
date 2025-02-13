import { jsonStringify } from "./string"
import { CACHE_PREFIX } from "./common.constants"

function getKey(key: string) {
  return `${CACHE_PREFIX}${key}`
}

export function cacheExist(key: string): boolean {
  const cacheKey = getKey(key)
  if (typeof window === "undefined") return false
  try {
    return cacheKey in window.localStorage
  } catch (error) {
    return false
  }
}
export function loadStorageData<T>(key: string, initialValue: T): T {
  const cacheKey = getKey(key)
  try {
    if (typeof window === "undefined") return initialValue

    const item = window.localStorage.getItem(cacheKey)
    return item ? JSON.parse(item) : initialValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${cacheKey}":`, error)
    return initialValue
  }
}

export function save2StorageData<T>(key: string, storedValue: T) {
  const cacheKey = getKey(key)
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(cacheKey, jsonStringify(storedValue))
  } catch (error) {
    console.warn(`Error setting localStorage key "${cacheKey}":`, error)
  }
}

export function deleteStorageData(key: string) {
  const cacheKey = getKey(key)
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(cacheKey)
  } catch (error) {
    console.warn(`Error deleting localStorage key "${cacheKey}":`, error)
  }
}
/**
 * unshift array to storage
 * @param key
 * @param val
 */
export function unShit2ArrayStorageData<T>(key: string, val: T) {
  const cacheKey = getKey(key)
  const array = loadStorageData<T[]>(cacheKey, [])
  array.unshift(val)
  save2StorageData(cacheKey, array)
}
