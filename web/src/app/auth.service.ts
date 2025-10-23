import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal<string | null>(localStorage.getItem('token'));
  orgId = signal<string | null>(localStorage.getItem('orgId'));

  setAuth(token: string, orgId?: string | null) {
    this.token.set(token);
    localStorage.setItem('token', token);
    if (orgId != null) {
      this.orgId.set(orgId);
      localStorage.setItem('orgId', orgId);
    }
  }

  clear() {
    this.token.set(null);
    this.orgId.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('orgId');
  }
}
