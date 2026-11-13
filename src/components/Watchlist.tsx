import React from 'react';
import { WATCHLIST_LIMIT, type WatchlistItem } from '../hooks/useWatchlist';

interface WatchlistProps {
  items: WatchlistItem[];
  onRemove: (id: string) => void;
  onCompare: (item: WatchlistItem) => void;
}

const fmtSaved = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? 'unknown date'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Saved medicine searches. Shows the DEMO price at save time only.
 * It deliberately never shows price changes or alerts: demo prices are
 * deterministic, so any change shown would be invented.
 */
const Watchlist: React.FC<WatchlistProps> = ({ items, onRemove, onCompare }) => (
  <section aria-labelledby="watchlist-heading" className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
    <div className="flex items-center justify-between gap-2 mb-3">
      <div>
        <h2 id="watchlist-heading" className="text-sm font-bold text-gray-900">Saved medicines</h2>
        <p className="text-[11px] text-gray-400">{items.length} of {WATCHLIST_LIMIT} saved · stored in this browser only</p>
      </div>
      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">DEMO</span>
    </div>

    {items.length === 0 ? (
      <p className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
        Nothing saved yet. Search for a medicine, then choose "Save to watchlist" to keep it here for next time.
      </p>
    ) : (
      <ul className="divide-y divide-gray-100">
        {items.map(item => (
          <li key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {item.name}{item.dosage && ` ${item.dosage}`} <span className="font-normal text-gray-500">· {item.quantity} pills</span>
              </p>
              <p className="text-[11px] text-gray-500">
                Demo price when saved: <span className="font-semibold text-gray-700">${item.savedPrice.toFixed(2)}</span>
                {' · '}saved {fmtSaved(item.savedAt)}
                {item.showGeneric && ' · generic'}
                {item.hasInsurance && ' · insurance'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCompare(item)}
                aria-label={`Compare ${item.name} again`}
                className="px-3 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Compare again
              </button>
              <button
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.name} from watchlist`}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default Watchlist;
