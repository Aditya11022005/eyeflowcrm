class StoreCache {
  constructor() {
    this.cache = new Map();
  }

  get(storeId, key) {
    if (!storeId) return null;
    const storeIdStr = storeId.toString();
    const storeMap = this.cache.get(storeIdStr);
    if (!storeMap) return null;

    const entry = storeMap.get(key);
    if (!entry) return null;

    // Check if the cache entry has expired
    if (Date.now() > entry.expiry) {
      storeMap.delete(key);
      return null;
    }

    return entry.value;
  }

  set(storeId, key, value, ttlMs = 120000) { // Default TTL: 2 minutes (120,000 ms)
    if (!storeId) return;
    const storeIdStr = storeId.toString();
    if (!this.cache.has(storeIdStr)) {
      this.cache.set(storeIdStr, new Map());
    }

    const storeMap = this.cache.get(storeIdStr);
    storeMap.set(key, {
      value,
      expiry: Date.now() + ttlMs
    });
  }

  invalidate(storeId) {
    if (!storeId) return;
    const storeIdStr = storeId.toString();
    this.cache.delete(storeIdStr);
    console.log(`[DSA-Cache] Cache invalidated for store: ${storeIdStr}`);
  }
}

export const dashboardCache = new StoreCache();
