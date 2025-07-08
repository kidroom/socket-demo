type StorageType = 'local' | 'session' | 'memory';

export class StorageManager<T> {
  private storage: Storage | Map<string, string>;
  private type: StorageType;

  constructor(type: StorageType = 'local') {
    this.type = type;
    
    if (type === 'local' && typeof window !== 'undefined') {
      this.storage = window.localStorage;
    } else if (type === 'session' && typeof window !== 'undefined') {
      this.storage = window.sessionStorage;
    } else {
      this.storage = new Map<string, string>();
    }
  }

  get(key: string): T | null {
    try {
      const item = this.storage instanceof Map 
        ? this.storage.get(key)
        : this.storage.getItem(key);
      
      if (!item) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting ${key} from ${this.type} storage:`, error);
      return null;
    }
  }

  set(key: string, value: T): void {
    try {
      const item = JSON.stringify(value);
      if (this.storage instanceof Map) {
        this.storage.set(key, item);
      } else {
        this.storage.setItem(key, item);
      }
    } catch (error) {
      console.error(`Error setting ${key} in ${this.type} storage:`, error);
    }
  }

  remove(key: string): void {
    if (this.storage instanceof Map) {
      this.storage.delete(key);
    } else {
      this.storage.removeItem(key);
    }
  }

  clear(): void {
    if (this.storage instanceof Map) {
      this.storage.clear();
    } else {
      this.storage.clear();
    }
  }
}
