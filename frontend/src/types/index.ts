/**
 * AMBAR STUDIO — Shared TypeScript Types
 * All interfaces and types used across the application.
 */

// ──────────────────────────────────────────────
// Auth & User
// ──────────────────────────────────────────────
export type UserRole = 'user' | 'provider' | 'admin';
export type PlanKey = 'free' | 'habitacion' | 'depto' | 'casa' | 'edificio' | 'provider' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  tokens_balance: number;
  plan: PlanKey;
  city: string;
  avatar_url: string;
  created_at: string;
}

export interface AuthData {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  city: string;
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export interface Provider {
  id: number;
  user_id: number;
  business_name: string;
  bio: string;
  categories: string[];
  whatsapp: string;
  instagram: string;
  contact_email: string;
  coverage: 'local' | 'national';
  city: string;
  lat: number | null;
  lng: number | null;
  rating: number;
  review_count: number;
  verified: boolean;
  stock_available: boolean;
  image_url: string;
  created_at: string;
  user_name?: string;
}

export interface ProviderProfilePayload {
  business_name: string;
  bio?: string;
  categories?: string[];
  whatsapp?: string;
  instagram?: string;
  contact_email?: string;
  coverage?: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  stock_available?: boolean;
}

export interface Product {
  id: number;
  provider_id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image_url: string;
  created_at: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  category?: string;
  image_url?: string;
}

// ──────────────────────────────────────────────
// Project & Materials
// ──────────────────────────────────────────────
export type ProjectStatus = 'draft' | 'uploaded' | 'generating' | 'completed' | 'failed';

export interface Material {
  id: number;
  category: string;
  name: string;
  description: string;
  estimated_quantity: number;
  unit: string;
  estimated_unit_cost: number;
  estimated_total_cost: number;
  icon: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  original_image: string;
  generated_image: string;
  style: string;
  width: number;
  length: number;
  height: number;
  area: number;
  status: ProjectStatus;
  created_at: string;
  materials: Material[];
}

export interface GenerateResult {
  project_id: number;
  status: string;
  generated_image: string;
  materials: Material[];
  estimated_total_cost: number;
}

// ──────────────────────────────────────────────
// Quote
// ──────────────────────────────────────────────
export type QuoteStatus = 'pending' | 'responded' | 'accepted' | 'rejected';

export interface Quote {
  id: number;
  project_id: number;
  provider_id: number;
  user_id: number;
  status: QuoteStatus;
  user_message: string;
  provider_response: string;
  quoted_amount: number | null;
  created_at: string;
  provider_name?: string;
  project_name?: string;
}

export interface QuotePayload {
  project_id: number;
  provider_id: number;
  message: string;
}

export interface QuoteRespondPayload {
  provider_response: string;
  quoted_amount?: number | null;
  status?: string;
}

// ──────────────────────────────────────────────
// Payment
// ──────────────────────────────────────────────
export interface CheckoutPayload {
  plan: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface PaymentConfirmation {
  tokens_added?: number;
  [key: string]: unknown;
}

// ──────────────────────────────────────────────
// Review
// ──────────────────────────────────────────────
export interface Review {
  id: number;
  provider_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

export interface ReviewPayload {
  provider_id: number;
  rating: number;
  comment?: string;
}

// ──────────────────────────────────────────────
// Chat
// ──────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'admin';
  content: string;
}

export interface ChatPayload {
  message: string;
  project_id?: number;
}

export interface ChatResponse {
  reply: string;
  project_id?: number;
}

export interface ChatSession {
  user_id: number;
  user_name: string;
  last_message: string;
}

// ──────────────────────────────────────────────
// Plan display
// ──────────────────────────────────────────────
export interface PlanDeliverable {
  label: string;
  entregable: string;
  icon: string;
  showMaterials: boolean;
  showProviders: boolean;
  watermark: boolean;
}
