import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

const authGuard = () => {
  const token = inject(AuthService).token();
  return !!token ? true : (location.href = '/login', false);
};

export const appRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./tasks.component').then(m => m.TasksComponent) },
  { path: '**', redirectTo: '' },
];
