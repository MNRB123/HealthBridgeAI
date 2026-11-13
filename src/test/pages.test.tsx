import { describe, it, expect } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderApp } from './helpers';

describe('Appointments', () => {
  it('books an appointment with correct date/time formatting and persists it', async () => {
    const { user, container } = renderApp('/appointments');
    await user.click(screen.getByRole('button', { name: /book appointment/i }));
    await user.type(screen.getByPlaceholderText(/annual checkup/i), 'Eye Exam');
    fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: '2027-03-05' } });
    fireEvent.change(container.querySelector('input[type="time"]')!, { target: { value: '14:30' } });
    await user.click(screen.getByRole('button', { name: /save appointment/i }));

    expect((await screen.findAllByText('Eye Exam')).length).toBeGreaterThan(0);
    // Local-date parsing + 12-hour time (regressions: UTC off-by-one and raw "14:30")
    const saved = JSON.parse(localStorage.getItem('hb_appointments')!) as { title: string; appointment_date: string; appointment_time: string }[];
    const appt = saved.find(a => a.title === 'Eye Exam');
    expect(appt?.appointment_date).toBe('Mar 5, 2027');
    expect(appt?.appointment_time).toBe('2:30 PM');
  });

  it('requires title, date and time', async () => {
    const { user } = renderApp('/appointments');
    await user.click(screen.getByRole('button', { name: /book appointment/i }));
    await user.click(screen.getByRole('button', { name: /save appointment/i }));
    expect(await screen.findByText(/title, date, and time are required/i)).toBeInTheDocument();
  });

  it('reschedules an appointment', async () => {
    const { user } = renderApp('/appointments');
    await user.click(screen.getAllByText('Annual General Checkup').at(-1)!);
    await user.click(screen.getByRole('button', { name: /^reschedule$/i }));
    fireEvent.change(screen.getByLabelText('New date'), { target: { value: '2027-02-10' } });
    fireEvent.change(screen.getByLabelText('New time'), { target: { value: '09:15' } });
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(localStorage.getItem('hb_appointments')).toContain('Feb 10, 2027'));
    expect(localStorage.getItem('hb_appointments')).toContain('9:15 AM');
  });

  it('cancels and deletes appointments', async () => {
    const { user } = renderApp('/appointments');
    await user.click(screen.getAllByText('Annual General Checkup').at(-1)!);
    await user.click(screen.getByRole('button', { name: /cancel appointment/i }));
    await waitFor(() => expect(localStorage.getItem('hb_appointments')).toContain('"status":"cancelled"'));
    // The detail panel closes after cancelling; reopen it to delete.
    await user.click(screen.getByText('Annual General Checkup'));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(screen.queryByText('Annual General Checkup')).not.toBeInTheDocument());
  });
});

describe('Mental Wellness', () => {
  it('always shows the 988 crisis banner', () => {
    renderApp('/mental-wellness');
    expect(screen.getByRole('link', { name: /call 988/i })).toBeInTheDocument();
  });

  it.each([
    'I feel suicidal',
    'I want to die',
    'I might hurt myself',
  ])('routes crisis message "%s" to 988 support', async (msg) => {
    const { user } = renderApp('/mental-wellness');
    await user.type(screen.getByPlaceholderText(/share how you're feeling/i), msg);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/really concerned/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('responds to "anxious" with the grounding technique', async () => {
    const { user } = renderApp('/mental-wellness');
    await user.type(screen.getByPlaceholderText(/share how you're feeling/i), "I'm feeling anxious today");
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/5-4-3-2-1/, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('saves and deletes a mood journal entry', async () => {
    const { user } = renderApp('/mental-wellness');
    await user.click(screen.getByRole('button', { name: /mood journal/i }));
    await user.type(screen.getByPlaceholderText(/write about your day/i), 'Test journal note');
    await user.click(screen.getByRole('button', { name: /save entry/i }));
    expect(await screen.findByText('Saved!')).toBeInTheDocument();
    expect(localStorage.getItem('hb_journal')).toContain('Test journal note');

    await user.click(screen.getByText('Test journal note'));
    await user.click(screen.getByRole('button', { name: /delete entry/i }));
    await waitFor(() => expect(localStorage.getItem('hb_journal')).not.toContain('Test journal note'));
  });

  it('breathing exercise starts and stops', async () => {
    const { user } = renderApp('/mental-wellness');
    await user.click(screen.getByRole('button', { name: 'Breathing' }));
    await user.click(screen.getByRole('button', { name: /start exercise/i }));
    expect(await screen.findByText(/breathe in slowly/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^stop$/i }));
    expect(await screen.findByText(/press start to begin/i)).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('font size applies app-wide and persists', async () => {
    const { user } = renderApp('/settings');
    await user.click(screen.getByRole('button', { name: /^large$/i }));
    expect(document.documentElement).toHaveClass('hb-font-large');
    expect(localStorage.getItem('hb_display')).toContain('"fontSize":"large"');
  });

  it('high contrast and reduced motion switches apply classes', async () => {
    const { user } = renderApp('/settings');
    await user.click(screen.getByRole('switch', { name: /high contrast/i }));
    await user.click(screen.getByRole('switch', { name: /reduce motion/i }));
    expect(document.documentElement).toHaveClass('hb-contrast');
    expect(document.documentElement).toHaveClass('hb-reduce-motion');
  });

  it('notification toggle persists', async () => {
    const { user } = renderApp('/settings');
    const sw = screen.getByRole('switch', { name: /medicine price alerts/i });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('hb_notifs')).toContain('"medicineAlerts":true');
  });
});
