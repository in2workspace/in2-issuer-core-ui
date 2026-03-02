import { inject, Injectable, WritableSignal, signal, DestroyRef } from '@angular/core';
import { EventTypes, LoginResponse, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, take, tap } from 'rxjs/operators';
import { UserDataAuthenticationResponse } from "../models/dto/user-data-authentication-response.dto";
import { Power, EmployeeMandator, LEARCredentialEmployee } from "../models/entity/lear-credential";
import { RoleType } from '../models/enums/auth-rol-type.enum';
import { IAM_POST_LOGIN_ROUTE } from '../constants/iam.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LEARCredentialDataNormalizer } from 'src/app/features/credential-details/utils/lear-credential-data-normalizer';
import { environment } from 'src/environments/environment';

// todo restore auth.service.spec.ts
@Injectable({
  providedIn: 'root'
})
export class AuthService{
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly userDataSubject = new BehaviorSubject<UserDataAuthenticationResponse |null>(null);
  private readonly tokenSubject = new BehaviorSubject<string>('');
  private readonly mandatorSubject = new BehaviorSubject<EmployeeMandator | null>(null);
  private readonly mandateeEmailSubject = new BehaviorSubject<string>('');
  private readonly nameSubject = new BehaviorSubject<string>('');
  private readonly normalizer = new LEARCredentialDataNormalizer();
  public readonly roleType: WritableSignal<RoleType> = signal(RoleType.LEAR);
  
  
  
  private userPowers: Power[] = [];
  
  private readonly authEvents = inject(PublicEventsService);
  private readonly destroy$ = inject(DestroyRef);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  public constructor() {
    this.subscribeToAuthEvents();
    this.checkAuth$().subscribe();
  }

  public subscribeToAuthEvents(): void {
    this.authEvents.registerForEvents()
      .pipe(
        takeUntilDestroyed(this.destroy$),
        filter((e) =>
          [
            EventTypes.SilentRenewStarted, 
            EventTypes.SilentRenewFailed,
            EventTypes.IdTokenExpired, 
            EventTypes.TokenExpired
          ].includes(e.type)
        )
      )
      .subscribe((event) => {
        const isOffline = !navigator.onLine;

        switch (event.type) {
          case EventTypes.SilentRenewStarted:
            console.info('Silent renew started: ' + Date.now());
            break;

          // before this happens, the library cleans up the local auth data
          case EventTypes.SilentRenewFailed:
            
            if (isOffline) {
              console.warn('Silent token refresh failed: offline mode', event);

              const onlineHandler = () => {
                console.info('Connection restored. Retrying to authenticate...');
                this.checkAuth$().subscribe(
                  {
                    next: ({ isAuthenticated }) => {
                      if (!isAuthenticated) {
                        console.warn('User still not authenticated after reconnect, logging out');
                        this.authorize();
                      } else {
                        console.info('User reauthenticated successfully after reconnect');
                      }
                    },
                    error: (err) => {
                      console.error('Error while reauthenticating after reconnect:', err);
                      this.authorize();
                    },
                    complete: () => {
                      window.removeEventListener('online', onlineHandler);
                    }
                  });
                
              };

              window.addEventListener('online', onlineHandler);

            } else {
              console.error('Silent token refresh failed: online mode, proceeding to logout', event);
              this.authorize();
            }
            break;

          case EventTypes.IdTokenExpired:
          case EventTypes.TokenExpired:
            console.warn('Session expired:', event);
            console.warn('At: ' + Date.now());
            break;
        }
      });
  }

  public checkAuth$(): Observable<LoginResponse> {
    return this.oidcSecurityService.checkAuth().pipe(
      take(1),
      tap(({ isAuthenticated, userData}) => {
      this.isAuthenticatedSubject.next(isAuthenticated);

      if (isAuthenticated) {
        if(this.getRole(userData) != RoleType.LEAR)  throw new Error('Error Role. '+ this.getRole(userData));
        this.userDataSubject.next(userData);
        this.handleUserAuthentication(userData);

        if (this.router.url === '/' || this.router.url.startsWith('/home')) {
          this.router.navigate([IAM_POST_LOGIN_ROUTE]);
        }
      }else{
          console.warn('Checking authentication: not authenticated.');
      }
    }),
    catchError((err:Error)=>{
      console.error('Checking authentication: error in initial authentication.');
      return throwError(()=>err);
    }));
  }


  public logout(): void {
    console.info('Logout: clearing local session.');
    this.oidcSecurityService.logoffLocal();
    this.isAuthenticatedSubject.next(false);
    this.userDataSubject.next(null);
    this.tokenSubject.next('');
    this.mandatorSubject.next(null);
    this.mandateeEmailSubject.next('');
    this.nameSubject.next('');
    this.userPowers = [];
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }

  public authorize(){
    console.info('Authorize.');
    this.oidcSecurityService.authorize();
  }

  private handleUserAuthentication(userData: UserDataAuthenticationResponse): void {
     //Future work: when accessing with certificate update signal role LER and  handleCertificateLogin
      try{
        const learCredential = this.extractVCFromUserData(userData);
        console.debug('[AUTH] Extracted VC:', JSON.stringify(learCredential, null, 2));
        const normalizedCredential = this.normalizer.normalizeLearCredential(learCredential) as LEARCredentialEmployee;
        console.debug('[AUTH] Normalized VC:', JSON.stringify(normalizedCredential, null, 2));
        this.handleVCLogin(normalizedCredential);
        console.debug('[AUTH] User powers after handleVCLogin:', JSON.stringify(this.userPowers, null, 2));
      }
      catch(error){
        console.error(error);
      }
  }

  private getRole(userData: UserDataAuthenticationResponse): RoleType | null {
    if (userData.role) {
      return userData.role;
    }
    // Derive role from credential type when not provided as explicit claim
    try {
      const vc = this.extractVCFromUserData(userData);
      const types: string[] = (vc as unknown as Record<string, unknown>)?.['type'] as string[] ?? [];
      if (types.includes('LEARCredentialEmployee')) {
        return RoleType.LEAR;
      }
      if (types.includes('LEARCredentialMachine')) {
        return RoleType.LER;
      }
    } catch {
      // VC not available yet
    }
    return null;
  }

  private handleCertificateLogin(userData: UserDataAuthenticationResponse): void {
    const certData = this.extractDataFromCertificate(userData);
    this.mandatorSubject.next(certData);
    this.nameSubject.next(certData.commonName);
  }

  private extractDataFromCertificate(userData: UserDataAuthenticationResponse): EmployeeMandator {
    return {
        id: userData.id,
        organizationIdentifier: userData.organizationIdentifier,
        organization: userData.organization,
        commonName: userData.name,
        email: userData?.email ?? '',
        serialNumber: userData?.serial_number ?? '',
        country: userData.country
      }
  }

  private handleVCLogin(learCredential: LEARCredentialEmployee): void {
    const mandator = {
      id: learCredential.credentialSubject.mandate.mandator.id,
      organizationIdentifier: learCredential.credentialSubject.mandate.mandator.organizationIdentifier,
      organization: learCredential.credentialSubject.mandate.mandator.organization,
      commonName: learCredential.credentialSubject.mandate.mandator.commonName,
      email: learCredential.credentialSubject.mandate.mandator.email,
      serialNumber: learCredential.credentialSubject.mandate.mandator.serialNumber,
      country: learCredential.credentialSubject.mandate.mandator.country
    };
    
    this.mandatorSubject.next(mandator);
  
    const email = learCredential.credentialSubject.mandate.mandatee.email;
    const name = learCredential.credentialSubject.mandate.mandatee.firstName + ' ' + learCredential.credentialSubject.mandate.mandatee.lastName;
  
    this.mandateeEmailSubject.next(email);
    this.nameSubject.next(name);
    this.userPowers = this.extractUserPowers(learCredential);
  }

  public hasPower(tmfFunction: string, tmfAction: string): boolean {
    return this.userPowers.some((power: Power) => {
      if (power.function === tmfFunction) {
        const action = power.action;
        return action === tmfAction || (Array.isArray(action) && action.includes(tmfAction));
      }
      return false;
    });
  }

  // POLICY: user_powers_restriction_policy
  public hasAdminOrganizationIdentifier() : boolean {
    const mandatorData = this.mandatorSubject.getValue();
    if (mandatorData != null){
      return environment.admin_organization_id === mandatorData.organizationIdentifier;
    }
    return false
  }

  public getMandator(): Observable<EmployeeMandator | null> {
    return this.mandatorSubject.asObservable();
  }

  //todo maybe rename (i.e. getPlainMandator), since "Raw" is being used for unnormalized VC/fields
  public getRawMandator(): EmployeeMandator | null {
    return this.mandatorSubject.getValue();
  }

  public login(): void {
    this.oidcSecurityService.authorize();
  }

  public handleLoginCallback(): void {
    this.oidcSecurityService.checkAuth()
      .pipe(take(1))
      .subscribe(({ isAuthenticated, userData, accessToken }) => {
        if (isAuthenticated ) {
          let learCredential: LEARCredentialEmployee;
          try {
            learCredential = this.extractVCFromUserData(userData);
          } catch {
            this.logout();
            return;
          }

          if(learCredential!=null){
            const normalizedCredential = this.normalizer.normalizeLearCredential(learCredential) as LEARCredentialEmployee;
            this.userPowers = this.extractUserPowers(normalizedCredential);
            const hasOnboardingPower = this.hasPower('Onboarding','Execute');
            if (!hasOnboardingPower) {
              this.logout();
              return;
            }
          }

          this.isAuthenticatedSubject.next(true);
          this.userDataSubject.next(userData);
          this.tokenSubject.next(accessToken);
        }
      });
  }

  public isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  public getUserData(): Observable<UserDataAuthenticationResponse | null> {
    return this.userDataSubject.asObservable();
  }

  public getMandateeEmail(): string {
    return this.mandateeEmailSubject.getValue();
  }

  public getToken(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  public getName(): Observable<string> {
    return this.nameSubject.asObservable()
  }

  private extractVCFromUserData(userData: UserDataAuthenticationResponse): LEARCredentialEmployee {
    // Support both 'vc' (object, from Keycloak) and 'vc_json' (string, from verifier)
    if (userData?.vc) {
      return userData.vc;
    }
    const vcJson = (userData as unknown as Record<string, unknown>)?.['vc_json'];
    if (vcJson && typeof vcJson === 'string') {
      return JSON.parse(vcJson) as LEARCredentialEmployee;
    }
    throw new Error('VC claim error: neither vc nor vc_json found in userData.');
  }

  private extractUserPowers(learCredential: LEARCredentialEmployee): Power[] {
    try {
      return learCredential?.credentialSubject.mandate.power || [];
    } catch (error) {
      return [];
    }
  }

}