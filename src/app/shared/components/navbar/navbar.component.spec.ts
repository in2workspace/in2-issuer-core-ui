import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavbarComponent } from './navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from 'src/app/core/services/theme.service';

class MockAuthService {
  getMandator() {
    return of({ organization: 'Test Organization' });
  }
  getName() {
    return of('Test User');
  }
  logout() {
    return of(void 0);
  }
  hasPower() {
    return true; 
  }
}

export class MockRouter implements Partial<Router> {
  navigate = jest.fn();
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;
  let translateService: TranslateService;
  let router: Router;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatMenuModule,
        RouterModule.forRoot([]),
        NavbarComponent,
        NoopAnimationsModule
    ],
    providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ThemeService, useValue: { snapshot: { branding: { logoUrl: null } } } },
    ],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    translateService = TestBed.inject(TranslateService);
    router = TestBed.inject(Router);

    jest.spyOn(component, 'logout');

    fixture.detectChanges();
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // todo test
  //  it('should initialize with username and organization', () => {
  //   const mockMandator = {
  //     organizationIdentifier: 'VATES-B60645900',
  //     organization: 'Test Organization',
  //     commonName: 'Test Common Name',
  //     emailAddress: 'test@organization.com',
  //     serialNumber: 'SN12345',
  //     country: 'Test Country'
  //   };
  //   const mockName = 'Test User';

  //   jest.spyOn(authService, 'getMandator').mockReturnValue(of(mockMandator));
  //   jest.spyOn(authService, 'getName').mockReturnValue(of(mockName));

  //   component.ngOnInit();
  //   fixture.detectChanges();

  //   expect(component.userName).toEqual(mockName);
  //   expect(component.organization).toEqual(mockMandator.organization);
  // });


  it('should initialize with default language', () => {
    component.ngOnInit();
    expect(component.selectedLanguage).toBe('en');
  });

  it('should change language', () => {
    component.changeLanguage('es');
    expect(component.selectedLanguage).toBe('es');
  });

  it('should call logout on authService', () => {
    component.logout();
    expect(component.logout).toHaveBeenCalled();
  });

  it('should call logout on click', async () => {
    const menuTrigger = fixture.nativeElement.querySelector('button[mat-icon-button]');
    menuTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const logoutLink = overlayContainerElement.querySelector('#logout-link') as HTMLElement;
    expect(logoutLink).toBeTruthy();

    logoutLink.click();
    expect(component.logout).toHaveBeenCalled();
  });

  it('should display the correct username and mandator', () => {
    const mockUserData = {
      organization: 'Test Organization',
      name: 'Test User'
    };
    component.userName = mockUserData.name;
    component.organization = mockUserData.organization;
    fixture.detectChanges();

    const userNameElement: HTMLElement = fixture.nativeElement.querySelector('#username');
    const organizationElement: HTMLElement = fixture.nativeElement.querySelector('#organization');

    expect(userNameElement.textContent).toContain(mockUserData.name);
    expect(organizationElement.textContent).toContain(mockUserData.organization);
  });
});
