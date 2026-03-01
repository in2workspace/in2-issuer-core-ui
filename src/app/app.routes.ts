import { Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { basicGuard, settingsGuard } from './core/guards/accessLevel.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.default)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.default),
    canActivate: [AutoLoginPartialRoutesGuard, settingsGuard],
  },
  {
    path: 'organization/credentials',
    canActivateChild: [AutoLoginPartialRoutesGuard, basicGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/credential-management/credential-management.routes').then(m => m.default)
      },
      {
        path: 'details',
        loadChildren: () => import('./features/credential-details/credential-details.routes').then(m => m.default)
      },
      {
        path: 'create',
        loadChildren: () => import('./features/credential-issuance/credential-issuance.routes').then(m => m.default)
      },
      {
        path: 'create-on-behalf',
        loadChildren: () => import('./features/credential-issuance/credential-issuance.routes').then(m => m.default)
      },
    ],
  },
  {
    path: 'credential-offer',
    loadChildren: () =>
      import('./features/credential-offer/credential-offer.routes').then(
        (m) => m.default
      ),
  },
  { path: '**', redirectTo: 'home' }
];
