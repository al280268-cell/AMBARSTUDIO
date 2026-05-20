/**
 * AMBAR STUDIO — API Service (TypeScript)
 * Centralized HTTP client for backend communication.
 * Uses Vite proxy in dev — all /api requests go to the backend automatically.
 */
import type {
  AuthData,
  LoginPayload,
  RegisterPayload,
  User,
  Provider,
  ProviderProfilePayload,
  Product,
  ProductPayload,
  Project,
  GenerateResult,
  Quote,
  QuotePayload,
  QuoteRespondPayload,
  CheckoutPayload,
  CheckoutResponse,
  PaymentConfirmation,
  Review,
  ReviewPayload,
  ChatPayload,
  ChatResponse,
  ChatMessage,
  ChatSession,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || ''; // Empty = use Vite proxy (relative URLs)

function getToken(): string | null {
  const data = localStorage.getItem('ambar_auth');
  if (!data) return null;
  try {
    return (JSON.parse(data) as AuthData).access_token;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    localStorage.removeItem('ambar_auth');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error del servidor' }));
    throw new Error(err.detail || `Error ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

const api = {
  // ── Auth ──
  register: (data: RegisterPayload) =>
    request<AuthData>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginPayload) =>
    request<AuthData>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  recoverPassword: (email: string) =>
    request<{ detail: string; demo_token?: string }>('/api/auth/recover', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: { token: string; password: string }) =>
    request<{ detail: string }>('/api/auth/reset', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () =>
    request<User>('/api/auth/me'),
  updateProfile: (data: { name?: string; city?: string }) =>
    request<User>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  // ── Admin: Users ──
  getUsers: () =>
    request<User[]>('/api/auth/users'),

  // ── Projects ──
  createProject: (formData: FormData) =>
    request<Project>('/api/projects', { method: 'POST', body: formData }),
  getProjects: () =>
    request<Project[]>('/api/projects'),
  getProject: (id: number | string) =>
    request<Project>(`/api/projects/${id}`),
  generateDesign: (id: number | string) =>
    request<GenerateResult>(`/api/projects/${id}/generate`, { method: 'POST' }),
  deleteProject: (id: number) =>
    request<void>(`/api/projects/${id}`, { method: 'DELETE' }),

  // ── Providers ──
  getProviders: (params = '') =>
    request<Provider[]>(`/api/providers${params ? '?' + params : ''}`),
  getProvider: (id: number) =>
    request<Provider>(`/api/providers/${id}`),
  getAllProviders: () =>
    request<Provider[]>('/api/providers/all'),
  createProviderProfile: (data: ProviderProfilePayload) =>
    request<Provider>('/api/providers/profile', { method: 'POST', body: JSON.stringify(data) }),
  createProduct: (data: ProductPayload) =>
    request<Product>('/api/providers/products', { method: 'POST', body: JSON.stringify(data) }),
  getProviderProducts: (id: number) =>
    request<Product[]>(`/api/providers/${id}/products`),
  deleteProduct: (id: number) =>
    request<void>(`/api/providers/products/${id}`, { method: 'DELETE' }),
  uploadProviderImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ image_url: string; detail: string }>('/api/providers/profile/image', { method: 'POST', body: formData });
  },
  uploadProductImage: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ product_id: number; image_url: string; detail: string }>(`/api/providers/products/${productId}/image`, { method: 'POST', body: formData });
  },

  // ── Quotes ──
  createQuote: (data: QuotePayload) =>
    request<Quote>('/api/quotes', { method: 'POST', body: JSON.stringify(data) }),
  getQuotes: () =>
    request<Quote[]>('/api/quotes'),
  respondQuote: (id: number, data: QuoteRespondPayload) =>
    request<Quote>(`/api/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // ── Payments ──
  getPlans: () =>
    request<Record<string, { name: string; price: number; tokens: number; description: string; entregable: string }>>('/api/payments/plans'),
  getPaymentConfig: () =>
    request<{ publishable_key: string; stripe_enabled: boolean; currency: string }>('/api/payments/config'),
  createCheckout: (data: CheckoutPayload) =>
    request<CheckoutResponse>('/api/payments/checkout', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (sessionId: string) =>
    request<PaymentConfirmation>(`/api/payments/confirm/${sessionId}`, { method: 'POST' }),
  getPaymentHistory: () =>
    request<Array<{ id: number; amount: number; currency: string; plan: string; tokens_added: number; status: string; created_at: string }>>('/api/payments/history'),

  // ── Reviews ──
  createReview: (data: ReviewPayload) =>
    request<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getProviderReviews: (id: number) =>
    request<Review[]>(`/api/reviews/provider/${id}`),

  // ── Chat ──
  sendChat: (data: ChatPayload) =>
    request<ChatResponse>('/api/chat', { method: 'POST', body: JSON.stringify(data) }),
  sendAuthenticatedChat: (data: ChatPayload) =>
    request<ChatResponse>('/api/chat/authenticated', { method: 'POST', body: JSON.stringify(data) }),
  getChatHistory: (projectId?: number) =>
    request<ChatMessage[]>(`/api/chat/history${projectId ? '?project_id=' + projectId : ''}`),

  // ── Admin: Chat ──
  getChatSessions: () =>
    request<ChatSession[]>('/api/chat/admin/sessions'),
  getAdminChatHistory: (userId: number) =>
    request<ChatMessage[]>(`/api/chat/admin/history/${userId}`),
  sendAdminMessage: (userId: number, message: string) =>
    request<{ status: string }>('/api/chat/admin/send', { method: 'POST', body: JSON.stringify({ user_id: userId, message }) }),

  // ── Utility ──
  health: () =>
    request<{ status: string }>('/api/health'),
};

export default api;
