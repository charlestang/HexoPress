import WebStorageCache from 'web-storage-cache'

export const useCache = () => {
  const wsCache: WebStorageCache = new WebStorageCache()

  return {
    wsCache
  }
}
