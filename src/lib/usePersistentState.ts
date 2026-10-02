import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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

  return [state, setState];
}
