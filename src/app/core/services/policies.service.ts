import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { Observable, of, switchMap, take, map } from 'rxjs';
import { TmfAction, TmfFunction } from '../models/entity/lear-credential';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  private executePolicy(tmfFunction: TmfFunction, action: TmfAction, redirectUrl: string, authFlag: boolean = false): Observable<boolean> {
    if (this.authService.hasPower(tmfFunction, action)) {
      return of(true); 
    } else {
      console.error("User with required powers was not found.");
      const errorTitle = this.translate.instant(`error.policy.title`);
      const errorMessage = this.translate.instant(`error.policy.message`);
      
      const dialogRef = this.dialog.openErrorInfoDialog(DialogComponent, errorMessage, errorTitle);
      return dialogRef.afterClosed().pipe(
        take(1),
        switchMap(() => { if (authFlag) { this.authService.logout(); } return of(null); }),
        switchMap(() => this.router.navigate([redirectUrl])),
        map(() => false) 
      );
    }
  }

  public checkOnboardingPolicy(): Observable<boolean> {
    return this.executePolicy('Onboarding', 'Execute', '/home', true);
  }

  public checkSettingsPolicy(): Observable<boolean> {
    return this.executePolicy('CredentialIssuer', 'Configure', '/organization/credentials');
  }
}
