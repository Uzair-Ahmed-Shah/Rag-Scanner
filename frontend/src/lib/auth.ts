const STORAGE_KEYS = {
  token: 'rag_token',
  userId: 'rag_userId',
  userName: 'rag_userName',
  email: 'rag_email',
} as const;

export interface Session {
  token: string;
  userId: string;
  userName: string;
  email: string;
}

export function getSession(): Session | null {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const userId = localStorage.getItem(STORAGE_KEYS.userId);
  const userName = localStorage.getItem(STORAGE_KEYS.userName);
  const email = localStorage.getItem(STORAGE_KEYS.email);

  if (!token || !userId) {
    clearSession();
    return null;
  }

  return { token, userId, userName: userName || 'user', email: email || '' };
}

export function setSession(data: Session): void {
  localStorage.setItem(STORAGE_KEYS.token, data.token);
  localStorage.setItem(STORAGE_KEYS.userId, data.userId);
  localStorage.setItem(STORAGE_KEYS.userName, data.userName);
  localStorage.setItem(STORAGE_KEYS.email, data.email);
}

export function clearSession(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
