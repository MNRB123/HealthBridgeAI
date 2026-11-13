import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderApp } from './helpers';

const KEY = 'hb_watchlist';

const item = (name: string, over: Record<string, unknown> = {}) => ({
  id: `${name.toLowerCase()}|10mg|30`,
  name,
  dosage: '10mg',
  quantity: '30',
  showGeneric: true,
  hasInsurance: false,
  savedPrice: 4.5,
  savedAt: '2026-11-01T12:00:00.000Z',
  ...over,
});

const saved = () => JSON.parse(localStorage.getItem(KEY) ?? '[]') as { name: string }[];
const saveBtn = (name: string) => screen.getByRole('button', { name: new RegExp(`save to watchlist: ${name}`, 'i') });

describe('Medicine watchlist (spec: medicine-watchlist)', () => {
  it('shows an explanation when empty (2.2)', () => {
    renderApp('/medicine-price-finder');
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(within(panel).getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it('saves a search with its settings and demo price (1.1, 1.2)', async () => {
    const { user } = renderApp('/medicine-price-finder?q=Lisinopril');
    await user.click(saveBtn('Lisinopril'));
    const [entry] = saved() as unknown as Record<string, unknown>[];
    expect(entry).toMatchObject({ name: 'Lisinopril', quantity: '30', showGeneric: true, hasInsurance: false });
    expect(typeof entry.savedPrice).toBe('number');
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(within(panel).getByText(/demo price when saved/i)).toBeInTheDocument();
  });

  it('exposes the saved state to assistive tech and toggles off without duplicating (1.3, 5.2)', async () => {
    const { user } = renderApp('/medicine-price-finder?q=Lisinopril');
    const btn = saveBtn('Lisinopril');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(saved()).toHaveLength(1);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(saved()).toHaveLength(0);
  });

  it('removes an item immediately (2.4, 5.1)', async () => {
    localStorage.setItem(KEY, JSON.stringify([item('Metformin')]));
    const { user } = renderApp('/medicine-price-finder');
    await user.click(screen.getByRole('button', { name: 'Remove Metformin from watchlist' }));
    // Scope to the panel: "Metformin" also appears as a popular-search chip elsewhere on the page.
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(within(panel).queryByText(/metformin/i)).not.toBeInTheDocument();
    expect(within(panel).getByText(/nothing saved yet/i)).toBeInTheDocument();
    expect(saved()).toHaveLength(0);
  });

  it('refuses an 11th item and explains why (1.4)', async () => {
    const ten = Array.from({ length: 10 }, (_, i) => item(`Drug${i}`));
    localStorage.setItem(KEY, JSON.stringify(ten));
    const { user } = renderApp('/medicine-price-finder?q=Atorvastatin');
    await user.click(saveBtn('Atorvastatin'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/full/i);
    expect(saved()).toHaveLength(10);
  });

  it('persists across a remount (3.1)', async () => {
    const first = renderApp('/medicine-price-finder?q=Omeprazole');
    await first.user.click(saveBtn('Omeprazole'));
    first.unmount();
    renderApp('/medicine-price-finder');
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(within(panel).getByText(/omeprazole/i)).toBeInTheDocument();
  });

  it.each([
    ['not json at all', 'this is {not json'],
    ['an object instead of an array', '{"not":"an array"}'],
    ['array of wrong-shaped entries', '[{"foo":1},"x",null]'],
  ])('survives malformed storage: %s (3.3)', (_label, value) => {
    localStorage.setItem(KEY, value);
    renderApp('/medicine-price-finder');
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(within(panel).getByText(/nothing saved yet/i)).toBeInTheDocument();
  });

  it('"Compare again" restores the saved inputs and shows results (2.3)', async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([item('Sertraline', { dosage: '50mg', quantity: '60', showGeneric: false, hasInsurance: true })]),
    );
    const { user } = renderApp('/medicine-price-finder');
    await user.click(screen.getByRole('button', { name: 'Compare Sertraline again' }));
    expect(await screen.findByText('Pharmacies Found', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/lisinopril, metformin/i)).toHaveValue('Sertraline');
    expect(screen.getByText(/showing brand prices/i)).toBeInTheDocument();
    expect(screen.getByText(/with insurance/i)).toBeInTheDocument();
    // The quantity dropdown itself was restored (the text "60 pills" appears in several places)
    expect(screen.getByDisplayValue('60 pills')).toBeInTheDocument();
  });

  it('never shows price drops, alerts, or savings claims in the panel (4.1)', () => {
    localStorage.setItem(KEY, JSON.stringify([item('Metformin'), item('Levothyroxine')]));
    renderApp('/medicine-price-finder');
    const panel = screen.getByRole('region', { name: /saved medicines/i });
    expect(panel.textContent).not.toMatch(/price drop|dropped|alert|you saved|cheaper|increase|decrease|notify/i);
  });

  it('is cleared by "Delete all saved demo data" in Settings (3.2)', async () => {
    localStorage.setItem(KEY, JSON.stringify([item('Metformin')]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { user } = renderApp('/settings');
    await user.click(screen.getByRole('button', { name: /delete all saved demo data/i }));
    await waitFor(() => expect(localStorage.getItem(KEY)).toBeNull());
  });
});
