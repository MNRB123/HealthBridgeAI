import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import Watchlist from '../components/Watchlist';
import { useWatchlist, makeWatchlistId, type WatchlistItem } from '../hooks/useWatchlist';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PharmacyResult {
  id: string;
  pharmacy: string;
  logo: string;
  distance: string;
  price: number;
  genericPrice: number | null;
  inStock: boolean;
  rating: number;
  couponAvailable: boolean;
  savings: number;
  type: 'chain' | 'independent' | 'online';
}

interface DrugSuggestion {
  name: string;
  generic: string;
  dosages: string[];
  category: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_DRUGS: DrugSuggestion[] = [
  { name: 'Lisinopril', generic: 'Lisinopril', dosages: ['5mg', '10mg', '20mg', '40mg'], category: 'Blood Pressure' },
  { name: 'Atorvastatin', generic: 'Atorvastatin', dosages: ['10mg', '20mg', '40mg', '80mg'], category: 'Cholesterol' },
  { name: 'Metformin', generic: 'Metformin', dosages: ['500mg', '850mg', '1000mg'], category: 'Diabetes' },
  { name: 'Omeprazole', generic: 'Omeprazole', dosages: ['10mg', '20mg', '40mg'], category: 'Acid Reflux' },
  { name: 'Sertraline', generic: 'Sertraline', dosages: ['25mg', '50mg', '100mg'], category: 'Mental Health' },
  { name: 'Amlodipine', generic: 'Amlodipine', dosages: ['2.5mg', '5mg', '10mg'], category: 'Blood Pressure' },
  { name: 'Levothyroxine', generic: 'Levothyroxine', dosages: ['25mcg', '50mcg', '75mcg', '100mcg'], category: 'Thyroid' },
  { name: 'Albuterol', generic: 'Albuterol', dosages: ['90mcg', '108mcg'], category: 'Respiratory' },
];

const DEMO_RESULTS: PharmacyResult[] = [
  { id: '1', pharmacy: 'Demo Pharmacy One', logo: 'DP1', distance: '0.4 mi', price: 24.99, genericPrice: 8.49, inStock: true, rating: 4.2, couponAvailable: true, savings: 16.50, type: 'chain' },
  { id: '2', pharmacy: 'Demo Pharmacy Two', logo: 'DP2', distance: '0.7 mi', price: 27.49, genericPrice: 9.99, inStock: true, rating: 4.0, couponAvailable: true, savings: 17.50, type: 'chain' },
  { id: '3', pharmacy: 'Demo Pharmacy Three', logo: 'DP3', distance: '1.2 mi', price: 11.98, genericPrice: 4.00, inStock: true, rating: 3.8, couponAvailable: false, savings: 23.99, type: 'chain' },
  { id: '4', pharmacy: 'Demo Pharmacy Four', logo: 'DP4', distance: '2.1 mi', price: 9.89, genericPrice: 3.49, inStock: true, rating: 4.6, couponAvailable: false, savings: 24.50, type: 'chain' },
  { id: '5', pharmacy: 'Demo Pharmacy Five', logo: 'DP5', distance: '1.5 mi', price: 29.99, genericPrice: 11.49, inStock: false, rating: 3.6, couponAvailable: true, savings: 18.50, type: 'chain' },
  { id: '6', pharmacy: 'Demo Independent Rx', logo: 'MRX', distance: '0.9 mi', price: 18.75, genericPrice: 7.25, inStock: true, rating: 4.8, couponAvailable: true, savings: 20.75, type: 'independent' },
  { id: '7', pharmacy: 'Demo Mail-Order Pharmacy', logo: 'DMO', distance: 'Mail order', price: 7.20, genericPrice: 3.00, inStock: true, rating: 4.4, couponAvailable: true, savings: 25.99, type: 'online' },
];

// Demo price history (last 6 months, demo values)
const PRICE_HISTORY = [
  { month: 'Jun', brand: 32, generic: 12 },
  { month: 'Jul', brand: 30, generic: 11 },
  { month: 'Aug', brand: 28, generic: 10 },
  { month: 'Sep', brand: 27, generic: 9 },
  { month: 'Oct', brand: 25, generic: 9 },
  { month: 'Nov', brand: 24, generic: 8 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Deterministic demo price multiplier (0.6 - 1.8) so different drugs show different demo prices
function demoFactor(name: string): number {
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 0.6 + (h % 120) / 100;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
    <span className="text-[11px] text-gray-500 ml-1">{rating.toFixed(1)}</span>
  </div>
);

const LogoBadge: React.FC<{ initials: string; type: PharmacyResult['type'] }> = ({ initials, type }) => {
  const colors: Record<PharmacyResult['type'], string> = {
    chain: 'bg-primary-100 text-primary-700',
    independent: 'bg-success-100 text-success-700',
    online: 'bg-accent-100 text-accent-700',
  };
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[type]}`}>
      {initials}
    </div>
  );
};

// Price History Mini Chart
const PriceHistoryChart: React.FC<{ showGeneric: boolean }> = ({ showGeneric }) => {
  const maxVal = Math.max(...PRICE_HISTORY.map(d => d.brand));
  const chartH = 60;

  return (
    <div>
      <div className="flex items-end gap-1.5 h-16">
        {PRICE_HISTORY.map((d, i) => {
          const brandH = (d.brand / maxVal) * chartH;
          const genericH = (d.generic / maxVal) * chartH;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
              <div className="relative flex items-end gap-0.5 w-full justify-center" style={{ height: chartH }}>
                <div
                  className="w-2.5 rounded-t-sm bg-primary-200 group-hover:bg-primary-400 transition-colors"
                  style={{ height: brandH }}
                  title={`Brand $${d.brand}`}
                />
                {showGeneric && (
                  <div
                    className="w-2.5 rounded-t-sm bg-success-300 group-hover:bg-success-500 transition-colors"
                    style={{ height: genericH }}
                    title={`Generic $${d.generic}`}
                  />
                )}
              </div>
              <span className="text-[9px] text-gray-400">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary-200" />
          <span className="text-[10px] text-gray-500">Brand name</span>
        </div>
        {showGeneric && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-success-300" />
            <span className="text-[10px] text-gray-500">Generic</span>
          </div>
        )}
        <span className="text-[10px] text-gray-400 ml-auto">Demo Data Only</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MedicinePriceFinder: React.FC = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [couponFor, setCouponFor] = useState<PharmacyResult | null>(null);
  const watchlist = useWatchlist();
  const [watchMsg, setWatchMsg] = useState('');
  const [zip, setZip] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('30');
  const [showGeneric, setShowGeneric] = useState(true);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [searched, setSearched] = useState(!!params.get('q'));
  const [loading, setLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<DrugSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating' | 'savings'>('price');
  const [filterType, setFilterType] = useState<'all' | 'chain' | 'independent' | 'online'>('all');
  const [selectedResult, setSelectedResult] = useState<PharmacyResult | null>(null);

  const filteredSuggestions = DEMO_DRUGS.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) && query.length > 1
  );

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 1200);
  };

  const handleSelectDrug = (drug: DrugSuggestion) => {
    setQuery(drug.name);
    setSelectedDrug(drug);
    setDosage(drug.dosages[1] ?? drug.dosages[0]);
    setShowSuggestions(false);
  };

  const adjustedResults = useMemo(() => {
    const f = demoFactor(query) * (parseInt(quantity) / 30);
    return DEMO_RESULTS.map(r => {
      let price = round2(r.price * f);
      let generic = r.genericPrice !== null ? round2(r.genericPrice * f) : null;
      if (hasInsurance) {
        price = Math.min(price, 10);
        if (generic !== null) generic = Math.min(generic, 5);
      }
      return { ...r, price, genericPrice: generic, savings: round2(r.savings * f) };
    });
  }, [query, quantity, hasInsurance]);

  const sortedResults = [...adjustedResults]
    .filter(r => filterType === 'all' || r.type === filterType)
    .sort((a, b) => {
      const aPrice = showGeneric && a.genericPrice ? a.genericPrice : a.price;
      const bPrice = showGeneric && b.genericPrice ? b.genericPrice : b.price;
      if (sortBy === 'price') return aPrice - bPrice;
      if (sortBy === 'savings') return b.savings - a.savings;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') {
        const aDist = parseFloat(a.distance);
        const bDist = parseFloat(b.distance);
        if (isNaN(aDist)) return 1;
        if (isNaN(bDist)) return -1;
        return aDist - bDist;
      }
      return 0;
    });

  const bestPrice = Math.min(...sortedResults.map(r => showGeneric && r.genericPrice ? r.genericPrice : r.price));
  const avgPrice = (sortedResults.reduce((s, r) => s + (showGeneric && r.genericPrice ? r.genericPrice : r.price), 0) / sortedResults.length);
  const maxSavings = Math.max(...sortedResults.map(r => r.savings));

  // ── Watchlist ────────────────────────────────────────────────────────────
  const currentId = makeWatchlistId(query, dosage, quantity);
  const isSaved = watchlist.has(currentId);

  const handleToggleSave = () => {
    const result = watchlist.toggle({
      id: currentId,
      name: query.trim(),
      dosage,
      quantity,
      showGeneric,
      hasInsurance,
      savedPrice: bestPrice,
      savedAt: new Date().toISOString(),
    });
    setWatchMsg(result === 'full' ? 'Your watchlist is full (10 saved). Remove one to add another.' : '');
  };

  const handleCompare = (item: WatchlistItem) => {
    setQuery(item.name);
    setDosage(item.dosage);
    setQuantity(item.quantity);
    setShowGeneric(item.showGeneric);
    setHasInsurance(item.hasInsurance);
    setSelectedDrug(DEMO_DRUGS.find(d => d.name.toLowerCase() === item.name.toLowerCase()) ?? null);
    setWatchMsg('');
    setShowSuggestions(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Price Finder</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Compare prescription prices at pharmacies near you — <span className="font-medium text-primary-600">demo data only</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
          </svg>
          Demo — Not real prices
        </span>
      </div>

      {/* ── Search Form ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
          </svg>
          Search for a Medication
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Drug name input */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Medication Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Lisinopril, Metformin..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50 focus:bg-white transition-all"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-card-hover z-20 overflow-hidden">
                  {filteredSuggestions.map(drug => (
                    <button
                      key={drug.name}
                      onMouseDown={() => handleSelectDrug(drug)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{drug.name}</p>
                        <p className="text-[11px] text-gray-400">{drug.category} · {drug.dosages.join(', ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dosage */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dosage</label>
            <select
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50 focus:bg-white transition-all"
            >
              <option value="">Select</option>
              {(selectedDrug?.dosages ?? ['5mg', '10mg', '20mg', '40mg']).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity (pills)</label>
            <select
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50 focus:bg-white transition-all"
            >
              {['14', '30', '60', '90', '180'].map(q => (
                <option key={q} value={q}>{q} pills</option>
              ))}
            </select>
          </div>

          {/* ZIP code */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="e.g. 10001"
              maxLength={5}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          {/* Search button */}
          <div className="md:col-span-2 flex flex-col justify-end">
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toggles row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          {/* Generic toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <button type="button" role="switch" aria-checked={showGeneric} onClick={() => setShowGeneric(p => !p)} className={`relative w-9 h-5 rounded-full transition-colors ${showGeneric ? 'bg-primary-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showGeneric ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">Show generic prices</span>
            <span className="text-[10px] font-semibold text-success-600 bg-success-50 border border-success-200 px-1.5 py-0.5 rounded-full">Demo savings</span>
          </label>

          {/* Insurance toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <button type="button" role="switch" aria-checked={hasInsurance} onClick={() => setHasInsurance(p => !p)} className={`relative w-9 h-5 rounded-full transition-colors ${hasInsurance ? 'bg-primary-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasInsurance ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">I have insurance</span>
          </label>

          <span className="ml-auto text-[11px] text-gray-400 hidden sm:block">
            Try searching: Lisinopril, Metformin, Omeprazole
          </span>
        </div>
      </div>

      {/* ── Popular Searches ─────────────────────────────────────────────── */}
      {watchMsg && (
        <p role="alert" className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {watchMsg}
        </p>
      )}

      <Watchlist items={watchlist.items} onRemove={watchlist.remove} onCompare={handleCompare} />

      {!searched && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popular Searches (Demo)</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_DRUGS.map(drug => (
              <button
                key={drug.name}
                onClick={() => { handleSelectDrug(drug); setQuery(drug.name); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-full text-sm font-medium text-gray-600 transition-all"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase">{drug.category}</span>
                <span className="w-px h-3 bg-gray-200" />
                {drug.name}
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">How It Works (Demo)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', icon: '🔍', title: 'Search Your Medication', desc: 'Enter a drug name, dosage, and your ZIP code' },
                { step: '2', icon: '📊', title: 'Compare Prices', desc: 'See prices at pharmacies near you, sorted by cost' },
                { step: '3', icon: '💊', title: 'Get Coupon or Go Generic', desc: 'Demo savings with generic alternatives or coupons' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-base flex-shrink-0">{s.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{s.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {searched && !loading && (
        <div className="space-y-4 animate-fade-in">

          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pharmacies Found', value: sortedResults.length.toString(), color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
              { label: 'Best Price (Demo)', value: `$${bestPrice.toFixed(2)}`, color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-100' },
              { label: 'Avg Price (Demo)', value: `$${avgPrice.toFixed(2)}`, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
              { label: 'Max Savings (Demo)', value: `$${maxSavings.toFixed(2)}`, color: 'text-accent-700', bg: 'bg-accent-50', border: 'border-accent-100' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3`}>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Result header with query info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-gray-900">
                    {query} {dosage && `${dosage}`} · {quantity} pills
                  </h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">DEMO DATA</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {sortedResults.length} pharmacies found {zip ? `near ${zip}` : 'in your area'} · {showGeneric ? 'Showing generic prices' : 'Showing brand prices'}
                  {hasInsurance && ' · With insurance'}
                </p>
              </div>

              {/* Sort & Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleSave}
                  aria-pressed={isSaved}
                  aria-label={`Save to watchlist: ${query.trim()}`}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isSaved
                      ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                      : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save to watchlist'}
                </button>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as typeof filterType)}
                  className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="all">All Types</option>
                  <option value="chain">Chain</option>
                  <option value="independent">Independent</option>
                  <option value="online">Online</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="price">Sort: Lowest Price</option>
                  <option value="savings">Sort: Most Savings</option>
                  <option value="distance">Sort: Nearest</option>
                  <option value="rating">Sort: Best Rated</option>
                </select>
              </div>
            </div>

            {/* ── Pharmacy Comparison Table (desktop) ── */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pharmacy</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Distance</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {showGeneric ? 'Generic Price' : 'Brand Price'}
                    </th>
                    {showGeneric && (
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Price</th>
                    )}
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">You Save</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedResults.map((r, idx) => {
                    const displayPrice = showGeneric && r.genericPrice ? r.genericPrice : r.price;
                    const isBest = idx === 0;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedResult(r === selectedResult ? null : r)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedResult?.id === r.id ? 'bg-primary-50' : ''} ${!r.inStock ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <LogoBadge initials={r.logo} type={r.type} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 text-sm">{r.pharmacy}</span>
                                {isBest && (
                                  <span className="text-[9px] font-bold bg-success-500 text-white px-1.5 py-0.5 rounded-full">BEST</span>
                                )}
                                {r.couponAvailable && (
                                  <span className="text-[9px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full border border-primary-200">COUPON</span>
                                )}
                              </div>
                              <span className={`text-[10px] font-medium ${r.type === 'online' ? 'text-accent-600' : r.type === 'independent' ? 'text-success-600' : 'text-gray-400'} capitalize`}>
                                {r.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.distance}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-base font-bold ${isBest ? 'text-success-600' : 'text-gray-900'}`}>
                            ${displayPrice.toFixed(2)}
                          </span>
                        </td>
                        {showGeneric && (
                          <td className="px-4 py-3 text-right text-sm text-gray-400 line-through">${r.price.toFixed(2)}</td>
                        )}
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-success-600">+${r.savings.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.inStock ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {r.inStock ? '✓ In Stock' : '✗ Call First'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StarRating rating={r.rating} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={e => { e.stopPropagation(); setCouponFor(r); }}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${r.couponAvailable ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                            {r.couponAvailable ? '🏷 Get Coupon' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pharmacy Cards (mobile) ── */}
            <div className="md:hidden space-y-3">
              {sortedResults.map((r, idx) => {
                const displayPrice = showGeneric && r.genericPrice ? r.genericPrice : r.price;
                const isBest = idx === 0;
                return (
                  <div key={r.id} className={`border rounded-xl p-4 transition-all ${isBest ? 'border-success-200 bg-success-50/50' : 'border-gray-100 bg-gray-50/50'} ${!r.inStock ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <LogoBadge initials={r.logo} type={r.type} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{r.pharmacy}</span>
                            {isBest && <span className="text-[9px] font-bold bg-success-500 text-white px-1.5 py-0.5 rounded-full">BEST</span>}
                          </div>
                          <p className="text-xs text-gray-400">{r.distance} · {r.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${isBest ? 'text-success-600' : 'text-gray-900'}`}>${displayPrice.toFixed(2)}</p>
                        {showGeneric && r.genericPrice && <p className="text-xs text-gray-400 line-through">${r.price.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} />
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.inStock ? 'bg-success-50 text-success-700' : 'bg-red-50 text-red-600'}`}>
                          {r.inStock ? '✓ In Stock' : '✗ Call First'}
                        </span>
                      </div>
                      <button onClick={() => setCouponFor(r)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${r.couponAvailable ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {r.couponAvailable ? '🏷 Coupon' : 'View'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom row: Price History + Tips ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Price History Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">6-Month Price Trend</h4>
                  <p className="text-[11px] text-gray-400">Average retail price (Demo Data)</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Demo</span>
              </div>
              <div className="mt-4">
                <PriceHistoryChart showGeneric={showGeneric} />
              </div>
              <div className="mt-3 p-3 bg-success-50 border border-success-100 rounded-xl">
                <p className="text-xs font-semibold text-success-800">📉 Price trend shows gradual decrease (Demo)</p>
                <p className="text-[11px] text-success-700 mt-0.5">Illustrative trend only — demo data</p>
              </div>
            </div>

            {/* Saving Tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h4 className="text-sm font-bold text-gray-900 mb-1">💡 Savings Tips</h4>
              <p className="text-[11px] text-gray-400 mb-4">Ways to reduce your medication cost (general info, not medical advice)</p>
              <div className="space-y-3">
                {[
                  { icon: '💊', title: 'Ask for Generic', desc: 'Generic drugs are FDA-approved and are often cheaper than brand-name versions. Ask your pharmacist.', color: 'bg-primary-50 border-primary-100' },
                  { icon: '🏷', title: 'Use a Discount Coupon', desc: 'Ask your pharmacist about discount cards or coupons that may lower your cost.', color: 'bg-success-50 border-success-100' },
                  { icon: '📦', title: 'Buy 90-Day Supply', desc: 'Mail-order pharmacies often offer a 90-day supply at a lower per-pill cost.', color: 'bg-accent-50 border-accent-100' },
                  { icon: '🤝', title: 'Patient Assistance Programs', desc: 'Many manufacturers offer free or reduced-cost medicines for qualifying patients.', color: 'bg-warning-50 border-warning-100' },
                ].map(tip => (
                  <div key={tip.title} className={`flex items-start gap-3 p-3 rounded-xl border ${tip.color}`}>
                    <span className="text-base flex-shrink-0">{tip.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{tip.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-xs font-bold text-amber-800 mb-1">⚠ Important Disclaimer</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              All prices and pharmacy information shown are <strong>demonstration data only</strong>. This application does not display real pharmacy prices, real coupon codes, or actual drug availability. Never make medical or financial decisions based on this demo. Always consult your pharmacist or healthcare provider before changing medications.
            </p>
          </div>
        </div>
      )}
      {couponFor && (
        <Modal title={couponFor.couponAvailable ? 'Demo coupon' : 'Pharmacy details'} onClose={() => setCouponFor(null)}>
          <p className="text-sm font-semibold text-gray-800">{couponFor.pharmacy}</p>
          <p className="text-xs text-gray-500 mb-3">{couponFor.distance} · {couponFor.type} · {couponFor.inStock ? 'In stock (demo)' : 'Call first (demo)'}</p>
          {couponFor.couponAvailable ? (
            <div className="rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 p-4 text-center">
              <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Demo coupon code</p>
              <p className="text-xl font-mono font-bold text-primary-800 mt-1 tracking-widest">DEMO-{couponFor.logo}-0000</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No coupon is available at this demo pharmacy.</p>
          )}
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
            Fictional pharmacy and fictional code. It cannot be redeemed anywhere.
          </p>
        </Modal>
      )}    </div>
  );
};

export default MedicinePriceFinder;
