// src/services/cacheService.ts

interface CacheEntry {
    value: any;
    timestamp: number;
  }
  
  class CacheService {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly TTL = 1000 * 60 * 5; // 5 minutes
  
    set(key: string, value: any) {
      this.cache.set(key, {
        value,
        timestamp: Date.now()
      });
    }
  
    get(key: string): any | null {
      const entry = this.cache.get(key);
      if (!entry) return null;
      
      if (Date.now() - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        return null;
      }
      
      return entry.value;
    }
  
    clear() {
      this.cache.clear();
    }
  }
  
  export const cacheService = new CacheService();