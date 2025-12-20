import { Routes } from '@angular/router';

export const PRIVACY_POLICY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./privacy-policy').then((m) => m.PrivacyPolicyComponent),
    data: { revalidate: 3600 }, // ISR: キャッシュを1時間ごとに再検証
  },
];
