import axios from 'axios';
import { getSession, clearSession } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────
export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  token: string;
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function authSignup(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/signup', { email, password, name });
  return data;
}

// ─── Chat API ────────────────────────────────────────────────────────────
export interface ChatSource {
  fileName: string;
  chunkIndex: number;
}

export interface ChatResponse {
  response: string;
  escalated: boolean;
  debug_intent?: string;
  confidenceScore?: number;
  sources?: ChatSource[];
}

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  const { data } = await api.post('/chat', { query });
  return data;
}

// ─── Documents API ───────────────────────────────────────────────────────
export interface DocumentRecord {
  documentId: string;
  fileName: string;
  uploadDate: string;
}

export async function uploadDocument(file: File, onProgress?: (pct: number) => void) {
  const formData = new FormData();
  formData.append('document', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const { data } = await api.get('/documents');
  return data.documents;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await api.delete(`/documents/${documentId}`);
}

// ─── Tickets API ─────────────────────────────────────────────────────────────
export interface TicketSummary {
  id: string;
  query: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
}

export async function listTickets(): Promise<TicketSummary[]> {
  const { data } = await api.get('/tickets');
  return data.tickets;
}

export async function closeTicket(ticketId: string): Promise<void> {
  await api.patch(`/tickets/${ticketId}/close`);
}

// ─── Rate Limit API ───────────────────────────────────────────────────────────
export async function getRateLimitStatus(): Promise<{ minuteRemaining: number; dailyRemaining: number }> {
  const { data } = await api.get('/rate-limit/status');
  return data;
}
