import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen grid place-items-center bg-gray-50">
    <form class="bg-white p-6 rounded-2xl shadow w-80 space-y-3" (ngSubmit)="login()">
      <h1 class="text-xl font-semibold mb-2 text-center">Sign in</h1>
      <input [(ngModel)]="email" name="email" placeholder="email" class="w-full border rounded px-3 py-2" />
      <input [(ngModel)]="password" name="password" placeholder="password" type="password" class="w-full border rounded px-3 py-2" />
      <input [(ngModel)]="orgId" name="orgId" placeholder="orgId (optional)" class="w-full border rounded px-3 py-2" />
      <button class="w-full bg-black text-white rounded py-2">Login</button>
      <div *ngIf="err" class="text-red-600 text-sm">{{err}}</div>
    </form>
  </div>
  `
})
export class LoginComponent {
  http = inject(HttpClient);
  auth = inject(AuthService);

  email = 'admin@local';
  password = 'admin123';
  orgId = '';
  err = '';

  async login() {
    this.err = '';
    try {
      const res = await this.http.post<any>('http://localhost:3000/api/auth/login', {
        email: this.email, password: this.password, orgId: this.orgId || null
      }).toPromise();
      this.auth.setAuth(res!.access_token, res!.orgId ?? null);
      location.href = '/'; // navigate to home
    } catch (e: any) {
      this.err = e?.error?.message || 'Login failed';
    }
  }
}
