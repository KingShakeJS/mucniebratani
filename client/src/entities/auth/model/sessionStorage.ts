const SESSION_FLAG_KEY = 'has_auth_session';

export function hasAuthSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(SESSION_FLAG_KEY) === 'true';
}

export function markAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_FLAG_KEY, 'true');
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_FLAG_KEY);
}
