import WebStorageCache from 'web-storage-cache'

type StorageType = 'localStorage' | 'sessionStorage'

export const useCache = (storageType: StorageType = 'sessionStorage') => {
  const wsCache: WebStorageCache = new WebStorageCache({ storage: storageType })

  return {
    wsCache,
  }
}
