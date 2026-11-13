/**
 * HealthBridge AI — API Client
 * Thin fetch wrapper that talks to the FastAPI backend at localhost:8000.
 * Falls back gracefully when the backend is not running (demo mode).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** Read the JWT token stored after login */
export function getToken(): string | null {
  return localStorage.getItem('hb_token');
}

/** Store the JWT token */
export function setToken(token: string): void {
  localStorage.setItem('hb_token', token);
}

/** Clear the JWT token (logout) */
export function clearToken(): void {
  localStorage.removeItem('hb_token');
  localStorage.removeItem('hb_user');
}

/** Build auth headers */
function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

/** Generic request helper */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  useAuth = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: useAuth ? authHeaders() : { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface JournalEntry {
  id: number;
  user_id: number;
  mood: number;
  note: string;
  tags: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  title: string;
  provider_name: string;
  provider_type: string;
  location: string;
  appointment_date: string;
  duration_minutes: number;
  notes: string;
  is_telehealth: boolean;
  status: string;
  created_at: string;
}

export interface AppointmentCreate {
  title: string;
  provider_name?: string;
  provider_type?: string;
  location?: string;
  appointment_date: string;
  duration_minutes?: number;
  notes?: string;
  is_telehealth?: boolean;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  is_crisis_flagged: boolean;
  created_at: string;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, full_name: string, password: string) =>
    request<TokenResponse>('POST', '/api/auth/register', { email, full_name, password }, false),

  login: (email: string, password: string) => {
    // FastAPI OAuth2 form expects application/x-www-form-urlencoded
    const form = new URLSearchParams({ username: email, password });
    return fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<TokenResponse>;
    });
  },

  me: () => request<UserProfile>('GET', '/api/auth/me'),
};

// ── Journal API ───────────────────────────────────────────────────────────────

export const journalApi = {
  list: () => request<JournalEntry[]>('GET', '/api/journal/'),
  create: (mood: number, note: string, tags = '') =>
    request<JournalEntry>('POST', '/api/journal/', { mood, note, tags }),
  delete: (id: number) => request<void>('DELETE', `/api/journal/${id}`),
  moodSummary: (days = 30) =>
    request<{ average_mood: number | null; entry_count: number; days: number }>(
      'GET', `/api/journal/mood-summary?days=${days}`
    ),
};

// ── Appointments API ──────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (status = 'all') =>
    request<Appointment[]>('GET', `/api/appointments/?status_filter=${status}`),
  create: (data: AppointmentCreate) =>
    request<Appointment>('POST', '/api/appointments/', data),
  update: (id: number, data: Partial<AppointmentCreate> & { status?: string }) =>
    request<Appointment>('PATCH', `/api/appointments/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/api/appointments/${id}`),
};

// ── Wellness / Chat API ───────────────────────────────────────────────────────

export const wellnessApi = {
  createSession: (title = 'Wellness Check-in') =>
    request<ChatSession>('POST', '/api/wellness/sessions', { title }),
  listSessions: () => request<ChatSession[]>('GET', '/api/wellness/sessions'),
  getSession: (id: number) =>
    request<ChatSession>('GET', `/api/wellness/sessions/${id}`),
  sendMessage: (session_id: number, message: string) =>
    request<ChatMessage>('POST', '/api/wellness/chat', { session_id, message }),
  getMessages: (session_id: number) =>
    request<ChatMessage[]>('GET', `/api/wellness/sessions/${session_id}/messages`),
};

// ── Medicine API ──────────────────────────────────────────────────────────────

export const medicineApi = {
  search: (drug_name: string, dosage = '10mg', quantity = 30, zip_code = '00000') =>
    request<{ results: unknown[] }>('GET',
      `/api/medicine/search?drug_name=${encodeURIComponent(drug_name)}&dosage=${dosage}&quantity=${quantity}&zip_code=${zip_code}`,
      undefined,
      false,
    ),
};

// ── Health check ──────────────────────────────────────────────────────────────

export const healthCheck = () =>
  fetch(`${BASE_URL}/health`)
    .then((r) => r.json())
    .catch(() => null);
