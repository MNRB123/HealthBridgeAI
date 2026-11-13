import { useLocalStorage } from './useLocalStorage';

export interface WatchlistItem {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  showGeneric: boolean;
  hasInsurance: boolean;
  /** Best DEMO price at the moment of saving. Never a real price. */
  savedPrice: number;
  savedAt: string;
}

export const WATCHLIST_LIMIT = 10;
export type ToggleResult = 'added' | 'removed' | 'full';

export function makeWatchlistId(name: string, dosage: string, quantity: string): string {
  return `${name.trim().toLowerCase()}|${dosage}|${quantity}`;
}

/** Guards against missing or hand-edited storage so a bad value can never crash the page. */
function isWatchlistItem(x: unknown): x is WatchlistItem {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.dosage === 'string' &&
    typeof o.quantity === 'string' &&
    typeof o.showGeneric === 'boolean' &&
    typeof o.hasInsurance === 'boolean' &&
    typeof o.savedPrice === 'number' &&
    Number.isFinite(o.savedPrice) &&
    typeof o.savedAt === 'string'
  );
}

export function useWatchlist() {
  const [raw, setRaw] = useLocalStorage<unknown>('hb_watchlist', []);
  const items: WatchlistItem[] = Array.isArray(raw) ? raw.filter(isWatchlistItem) : [];

  const has = (id: string) => items.some(i => i.id === id);

  const toggle = (item: WatchlistItem): ToggleResult => {
    if (has(item.id)) {
      setRaw(items.filter(i => i.id !== item.id));
      return 'removed';
    }
    if (items.length >= WATCHLIST_LIMIT) return 'full';
    setRaw([item, ...items]);
    return 'added';
  };

  const remove = (id: string) => setRaw(items.filter(i => i.id !== id));

  return { items, has, toggle, remove, isFull: items.length >= WATCHLIST_LIMIT };
}
