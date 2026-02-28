import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { CredentialIssuanceComponent } from '../credential-issuance/components/credential-issuance/credential-issuance.component';

export default [
  { path: '', component: SettingsComponent,
    children: [
        { path: 'schemes', component: CredentialIssuanceComponent },
      ]
   },
] as Routes;

