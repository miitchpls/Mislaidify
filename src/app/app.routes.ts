import { Routes } from '@angular/router';
import { HeroComponent } from './pages/hero/hero.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '@guards/auth/auth.guard';
import { guestGuard } from '@guards/guest/guest.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    component: HeroComponent,
    canActivate: [guestGuard],
  }
];
