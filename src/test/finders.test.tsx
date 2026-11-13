import { describe, it, expect } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import { renderApp } from './helpers';

const bestPrice = () => screen.getByText('Best Price (Demo)').nextElementSibling?.textContent ?? '';

describe('Medicine Price Finder', () => {
  it('searches and shows a comparison table', async () => {
    const { user } = renderApp('/medicine-price-finder');
    await user.type(screen.getByPlaceholderText(/lisinopril, metformin/i), 'Lisinopril');
    await user.click(screen.getByRole('button', { name: /^search$/i }));
    expect(await screen.findByText('Pharmacies Found', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getAllByText('Demo Pharmacy One').length).toBeGreaterThan(0);
  });

  it('shows different demo prices for different drugs', async () => {
    const { user } = renderApp('/medicine-price-finder');
    const input = screen.getByPlaceholderText(/lisinopril, metformin/i);
    await user.type(input, 'Lisinopril');
    await user.click(screen.getByRole('button', { name: /^search$/i }));
    await screen.findByText('Best Price (Demo)', {}, { timeout: 4000 });
    const first = bestPrice();
    await user.clear(input);
    await user.type(input, 'Sertraline');
    await user.click(screen.getByRole('button', { name: /^search$/i }));
    await waitFor(() => expect(bestPrice()).not.toBe(''), { timeout: 4000 });
    expect(bestPrice()).not.toBe(first);
  });

  it('opens a demo coupon dialog', async () => {
    const { user } = renderApp('/medicine-price-finder?q=Metformin');
    const buttons = await screen.findAllByRole('button', { name: /get coupon/i });
    await user.click(buttons[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/DEMO-/)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('insurance toggle lowers the displayed price', async () => {
    const { user } = renderApp('/medicine-price-finder?q=Atorvastatin');
    await screen.findByText('Best Price (Demo)');
    const before = parseFloat(bestPrice().replace('$', ''));
    await user.click(screen.getByText('I have insurance'));
    // The results subtitle only says "With insurance" when the toggle is actually on
    expect(await screen.findByText(/with insurance/i)).toBeInTheDocument();
    expect(parseFloat(bestPrice().replace('$', ''))).toBeLessThanOrEqual(Math.min(before, 5));
  });
});

describe('Healthcare Finder', () => {
  it('requires a 5-digit ZIP', async () => {
    const { user } = renderApp('/healthcare-finder');
    await user.click(screen.getByRole('button', { name: /find providers/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/5-digit zip/i);
  });

  it('lists providers after a ZIP search and opens the call dialog', async () => {
    const { user } = renderApp('/healthcare-finder');
    await user.type(screen.getByPlaceholderText('e.g. 10001'), '10001');
    await user.click(screen.getByRole('button', { name: /find providers/i }));
    expect(await screen.findByText(/providers found/i, {}, { timeout: 4000 })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /^call$/i })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/\(555\)/)).toBeInTheDocument();
  });

  it('radius slider actually filters providers', async () => {
    const { user } = renderApp('/healthcare-finder');
    await user.type(screen.getByPlaceholderText('e.g. 10001'), '10001');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /find providers/i }));
    const summary = await screen.findByText(/providers found/i, {}, { timeout: 4000 });
    expect(summary.textContent).toMatch(/^2 providers found/);
  });

  it('provider-type tile filters results', async () => {
    const { user } = renderApp('/healthcare-finder');
    await user.type(screen.getByPlaceholderText('e.g. 10001'), '10001');
    await user.click(screen.getByRole('button', { name: /dental/i }));
    const summary = await screen.findByText(/providers found/i, {}, { timeout: 4000 });
    expect(summary.textContent).toMatch(/^1 providers found/);
  });
});
