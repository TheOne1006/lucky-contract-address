import { jsonStringify } from "./string"
export function loadStorageData<T>(key: string, initialValue: T): T {
  try {
    if (typeof window === "undefined") return initialValue

    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return initialValue
  }
}

export function save2StorageData<T>(key: string, storedValue: T) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, jsonStringify(storedValue))
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error)
  }
}

export function deleteStorageData(key: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Error deleting localStorage key "${key}":`, error)
  }
}
/**
 * unshift array to storage
 * @param key
 * @param val
 */
export function unShit2ArrayStorageData<T>(key: string, val: T) {
  const array = loadStorageData<T[]>(key, [])
  array.unshift(val)
  save2StorageData(key, array)
}
