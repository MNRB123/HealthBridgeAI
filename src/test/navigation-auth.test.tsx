import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from './helpers';

describe('Navigation', () => {
  it('renders the dashboard with four feature cards', () => {
    renderApp('/');
    expect(screen.getByText(/your health tools/i)).toBeInTheDocument();
    for (const name of ['Medicine Savings', 'Nearby Clinics', 'Wellness Streak']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Appointments').length).toBeGreaterThan(0);
  });

  it.each([
    ['/medicine-price-finder', 'Medicine Price Finder'],
    ['/healthcare-finder', 'Healthcare Finder'],
    ['/mental-wellness', 'Mental Wellness AI'],
    ['/appointments', 'Appointments'],
    ['/settings', 'Settings'],
  ])('opens %s', (path, heading) => {
    renderApp(path);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('navigates with the sidebar', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('link', { name: /find healthcare/i }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Healthcare Finder' })).toBeInTheDocument();
  });

  it('header search routes to the right page', async () => {
    const { user } = renderApp('/');
    await user.type(screen.getByRole('searchbox'), 'dental clinic{Enter}');
    expect(await screen.findByRole('heading', { level: 1, name: 'Healthcare Finder' })).toBeInTheDocument();
  });

  it('notification bell opens a list that navigates', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await user.click(await screen.findByText('Appointment reminder'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Appointments' })).toBeInTheDocument();
  });
});

describe('Login and sign up', () => {
  it('demo login works without a backend and can log out', async () => {
    const { user } = renderApp('/login');
    await user.click(screen.getByRole('button', { name: /continue as demo user/i }));
    expect(await screen.findByText(/your health tools/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('demo login survives a refresh', async () => {
    const first = renderApp('/login');
    await first.user.click(screen.getByRole('button', { name: /continue as demo user/i }));
    first.unmount();
    renderApp('/');
    await waitFor(() => expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument());
  });

  it('login rejects a bad email', async () => {
    const { user } = renderApp('/login');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'whatever');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });

  it('sign up enforces the password rules', async () => {
    const { user } = renderApp('/signup');
    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'weakpass');
    await user.type(screen.getByLabelText('Confirm password'), 'weakpass');
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/uppercase/i);
  });

  it('sign up reports an unreachable backend instead of failing silently', async () => {
    const { user } = renderApp('/signup');
    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Strong1pass');
    await user.type(screen.getByLabelText('Confirm password'), 'Strong1pass');
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));
    expect(await screen.findByRole('alert', {}, { timeout: 8000 })).toBeInTheDocument();
  });
});
