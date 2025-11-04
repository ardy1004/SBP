export function getAuthToken(): string | null {
  return localStorage.getItem('adminToken');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('adminToken', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('adminToken');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
