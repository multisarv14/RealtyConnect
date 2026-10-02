/**
 * Workspace data store backed by the API (MongoDB).
 *
 * It keeps the synchronous getItem/setItem contract the modules were written
 * against: reads come from an in-memory copy loaded at sign-in, writes update
 * that copy immediately and are pushed to the server in the background.
 *
 * For list keys only the items that changed are sent, so two people working on
 * different records of the same list do not overwrite each other. Data changed
 * by others shows up on the next sign-in or page load.
 *
 * Keys not listed in shared/storeKeys.ts (UI preferences, routing hand-offs)
 * pass straight through to window.localStorage.
 */

import { isManagedKey, STORE_KEYS, type StorePatch } from '../../shared/storeKeys';
import { api, ApiError } from './api';

const DEBOUNCE_MS = 400;
const MAX_RETRY_MS = 30_000;
// Browsers cap the total size of keepalive request bodies at 64KB.
const KEEPALIVE_MAX_BYTES = 60_000;

/** Current JSON text per key - what the modules read. */
const cache = new Map<string, string>();
/** JSON text the server is known to hold per key. */
const synced = new Map<string, string>();
/** Values the server refused outright; retrying them unchanged is pointless. */
const rejected = new Map<string, string | undefined>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const inFlight = new Map<string, Promise<void>>();
const retryDelay = new Map<string, number>();
const errorListeners = new Set<(message: string) => void>();
let online = false;

type Item = Record<string, unknown> & { id: string | number };

function asIdList(value: unknown): Item[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<unknown>();
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const id = (item as Item).id;
    if ((typeof id !== 'string' && typeof id !== 'number') || id === '' || seen.has(id)) return null;
    seen.add(id);
  }
  return value as Item[];
}

function parse(text: string | undefined): unknown {
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function buildPatch(key: string, current: string | undefined): StorePatch | null {
  const base = synced.get(key);
  if (current === base) return null;
  if (current === undefined) return { type: 'clear' };

  const value = parse(current);
  if (value === undefined) {
    console.error(`[appStore] "${key}" holds a value that is not JSON; it was not saved.`);
    return null;
  }

  const items = STORE_KEYS[key].kind === 'list' ? asIdList(value) : null;
  if (!items) return { type: 'value', value };

  const baseItems = asIdList(parse(base)) ?? [];
  const baseText = new Map(baseItems.map(item => [item.id, JSON.stringify(item)]));
  const ids = new Set(items.map(item => item.id));
  const orderChanged = items.length !== baseItems.length || items.some((item, i) => baseItems[i].id !== item.id);
  return {
    type: 'list',
    upsert: items.filter(item => baseText.get(item.id) !== JSON.stringify(item)),
    remove: baseItems.filter(item => !ids.has(item.id)).map(item => item.id),
    order: orderChanged ? items.map(item => item.id) : undefined,
  };
}

function isDirty(key: string): boolean {
  const current = cache.get(key);
  return current !== synced.get(key) && !(rejected.has(key) && rejected.get(key) === current);
}

function schedule(key: string, delay = DEBOUNCE_MS) {
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void flush(key);
    }, delay)
  );
}

function flush(key: string, leaving = false): Promise<void> {
  const running = inFlight.get(key);
  if (running) return running;

  const current = cache.get(key);
  const patch = buildPatch(key, current);
  if (!patch) return Promise.resolve();

  const body = JSON.stringify(patch);
  const task = api('PATCH', `/store/${encodeURIComponent(key)}`, patch, { keepalive: leaving && body.length < KEEPALIVE_MAX_BYTES })
    .then(() => {
      if (current === undefined) synced.delete(key);
      else synced.set(key, current);
      rejected.delete(key);
      retryDelay.delete(key);
    })
    .catch(err => {
      const permanent = err instanceof ApiError && err.status >= 400 && err.status < 500 && ![401, 408, 429].includes(err.status);
      if (permanent) {
        rejected.set(key, current);
        errorListeners.forEach(listener => listener(`Could not save your changes: ${err.message}`));
        return;
      }
      const delay = Math.min((retryDelay.get(key) ?? 1000) * 2, MAX_RETRY_MS);
      if (!retryDelay.has(key)) {
        errorListeners.forEach(listener => listener('Could not reach the server. Your changes will be saved when the connection returns.'));
      }
      retryDelay.set(key, delay);
    })
    .finally(() => {
      inFlight.delete(key);
      if (online && isDirty(key) && !timers.has(key)) schedule(key, retryDelay.get(key) ?? DEBOUNCE_MS);
    });

  inFlight.set(key, task);
  return task;
}

export const appStore = {
  getItem(key: string): string | null {
    if (!isManagedKey(key)) return localStorage.getItem(key);
    return cache.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    if (!isManagedKey(key)) return localStorage.setItem(key, value);
    if (cache.get(key) === value) return;
    cache.set(key, value);
    if (online) schedule(key);
  },

  removeItem(key: string): void {
    if (!isManagedKey(key)) return localStorage.removeItem(key);
    if (!cache.delete(key)) return;
    if (online) schedule(key);
  },

  /** Loads everything the signed-in user can see. Call after authenticating, before rendering the workspace. */
  async hydrate(): Promise<void> {
    const { values } = await api<{ values: Record<string, unknown> }>('GET', '/store');
    this.reset();
    for (const [key, value] of Object.entries(values)) {
      if (!isManagedKey(key)) continue;
      const text = JSON.stringify(value);
      cache.set(key, text);
      synced.set(key, text);
    }
    online = true;
  },

  /** Pushes every pending change now. `leaving` marks requests to survive the page being closed. */
  async flushAll(leaving = false): Promise<void> {
    if (!online) return;
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    await Promise.all([...inFlight.values()]);
    await Promise.all([...new Set([...cache.keys(), ...synced.keys()])].filter(isDirty).map(key => flush(key, leaving)));
  },

  /** Forgets all workspace data (sign-out). Unsaved changes are dropped - call flushAll() first. */
  reset(): void {
    online = false;
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    cache.clear();
    synced.clear();
    rejected.clear();
    retryDelay.clear();
  },

  /** Subscribe to save failures (for user-facing notices). */
  onError(listener: (message: string) => void): () => void {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
  },
};

if (typeof document !== 'undefined') {
  // Last chance to save debounced edits when the tab is closed or hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void appStore.flushAll(true);
  });
}
