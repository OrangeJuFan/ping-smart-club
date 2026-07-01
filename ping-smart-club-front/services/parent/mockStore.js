import { parentConfig } from './config'
import { clone, formatDateKey } from './date'
import { createInitialStore } from './mockSeed'

export const delay = () => new Promise(resolve => setTimeout(resolve, parentConfig.mockLatency))

export const createId = prefix => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`

export const readStore = () => {
  try {
    const store = uni.getStorageSync(parentConfig.storageKey)
    const isCurrent =
      store &&
      store.version === 1 &&
      store.generatedDate === formatDateKey(new Date()) &&
      Array.isArray(store.students) &&
      Array.isArray(store.schedules) &&
      Array.isArray(store.bookings)

    if (isCurrent) return store
  } catch (error) {
    console.warn('读取家长端缓存失败', error)
  }

  const store = createInitialStore()
  writeStore(store)
  return store
}

export const writeStore = store => {
  uni.setStorageSync(parentConfig.storageKey, store)
}

export const mutateStore = updater => {
  const store = readStore()
  const result = updater(store)
  writeStore(store)
  return clone(result)
}

export const getStoreSnapshot = () => clone(readStore())
