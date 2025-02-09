import { useState, useEffect, useCallback } from "react"
import { loadStorageData, save2StorageData } from "@/util/storage"

type Dispatch<A> = (value: A) => void
type SetStorageValue<T> = Dispatch<T | ((prevState: T) => T)>

/**
 * 自定义的 useLocalStorage 钩子
 * @param key 存储的键名
 * @param initialValue 初始值
 * @returns 一个数组，包含当前值和一个更新值的函数
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
): [T, SetStorageValue<T>] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 监听值的变化并更新到 localStorage
  useEffect(() => {
    const data = loadStorageData(key, initialValue)
    setStoredValue(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听值的变化并更新到 localStorage
  // useEffect(() => {
  //   if (typeof window === "undefined") return
  //   try {
  //     window.localStorage.setItem(key, JSON.stringify(storedValue))
  //   } catch (error) {
  //     console.warn(`Error setting localStorage key "${key}":`, error)
  //   }
  // }, [key, storedValue])

  const save = useCallback(
    (val: T | ((prevState: T) => T)) => {
      setStoredValue((prev: T) => {
        const newValue =
          typeof val === "function" ? (val as (prevState: T) => T)(prev) : val
        save2StorageData(key, newValue)
        return newValue
      })
    },
    [key],
  )

  return [storedValue, save]
}
