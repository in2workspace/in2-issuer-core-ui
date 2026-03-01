import { TestBed } from '@angular/core/testing';
import { CredentialOfferOnboardingComponent } from './credential-offer-onboarding.component';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { environment } from 'src/environments/environment';

describe('CredentialOfferOnboardingComponent', () => {
  let component: CredentialOfferOnboardingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QRCodeComponent, TranslateModule.forRoot(), CredentialOfferOnboardingComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CredentialOfferOnboardingComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize walletUrl with the value from the environment', () => {
    const expectedUrl = environment.wallet_url;
    expect(component.walletUrl).toBe(expectedUrl);
  });

  it('should initialize walletUrl with default URL if environment.wallet_url is undefined', () => {
    const originalWalletUrl = environment.wallet_url;
    environment.wallet_url = undefined as any;

    const fixture = TestBed.createComponent(CredentialOfferOnboardingComponent);
    const testComponent = fixture.componentInstance;

    expect(testComponent.walletUrl).toBe('https://wallet.dome-marketplace.eu/');

    environment.wallet_url = originalWalletUrl;
  });

  it('should initialize walletTestUrl with the value from the environment', () => {
    const expectedTestUrl = environment.wallet_url_test;
    expect(component.walletTestUrl).toBe(expectedTestUrl);
  });

  it('should get showWalletSameDeviceUrlTest', () => {
    expect(component.showWalletSameDeviceUrlTest).toBe(environment.show_wallet_url_test);
  });

  it('should initialize walletUsersGuideUrl with the correct value from the environment', () => {
    const expectedGuideUrl = environment.knowledge_base_url + "/books/dome-digital-wallet-user-guide";
    expect(component.walletUsersGuideUrl).toBe(expectedGuideUrl);
  });

  it('should set the QR color to "#2d58a7"', () => {
    expect(component.qrColor).toBe('#2d58a7');
  });
});
