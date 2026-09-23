import { Routes } from '@angular/router';

export const PRIVACY_POLICY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./privacy-policy').then((m) => m.PrivacyPolicyComponent),
  },
];
