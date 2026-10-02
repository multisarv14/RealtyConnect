import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { appStore } from './appStore';

/**
 * useState that is loaded from, and saved to, the workspace store.
 * `initial` is only used when nothing has been saved under `key` yet.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const saved = appStore.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as T;
      } catch {
        // fall through to the initial value
      }
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    appStore.setItem(key, JSON.stringify(state));
  }, [key, state]);

  // Another person's change (e.g. a request delivered to this company) arrives through refresh().
  useEffect(() => appStore.onChange(changed => {
    if (changed !== key) return;
    const saved = appStore.getItem(key);
    if (saved === null) return;
    try {
      setState(JSON.parse(saved) as T);
    } catch {
      // keep the current state
    }
  }), [key]);

  return [state, setState];
}

/**
 * For modules that keep their own state: calls `apply` with the new value whenever the server copy
 * of `key` is replaced by a refresh.
 */
export function useStoreSync<T>(key: string, apply: (value: T) => void): void {
  const latest = useRef(apply);
  latest.current = apply;
  useEffect(() => appStore.onChange(changed => {
    if (changed !== key) return;
    const saved = appStore.getItem(key);
    if (saved === null) return;
    try {
      latest.current(JSON.parse(saved) as T);
    } catch {
      // ignore unreadable data
    }
  }), [key]);
}
