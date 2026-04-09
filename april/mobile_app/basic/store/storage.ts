/**
 * Storage utility using expo-sqlite localStorage polyfill.
 * 
 * Per skill guidance: use localStorage polyfill for key-value data.
 * Includes subscription support for reactive updates with useSyncExternalStore.
 */
import './localStoragePolyfill';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      listeners.get(key)?.forEach((fn) => fn());
    } catch (e) {
      console.warn('[storage] set error:', e);
    }
  },

  subscribe(key: string, listener: Listener): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => listeners.get(key)?.delete(listener);
  },
};
