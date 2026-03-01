import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { QRCodeComponent } from 'angularx-qrcode';
import { KNOWLEDGEBASE_PATH } from 'src/app/core/constants/knowledge.constants';

@Component({
    selector: 'app-credential-offer-onboarding',
    imports: [QRCodeComponent, TranslatePipe],
    templateUrl: './credential-offer-onboarding.component.html',
    styleUrl: './credential-offer-onboarding.component.scss'
})
export class CredentialOfferOnboardingComponent{
  public qrColor = "#2d58a7";
  public walletUsersGuideUrl = environment.knowledge_base_url + KNOWLEDGEBASE_PATH.WALLET;

  public walletUrl = environment.wallet_url || 'https://wallet.dome-marketplace.eu/';
  public walletTestUrl = environment.wallet_url_test || 'https://wallet.dome-marketplace.eu/';
  public readonly showWalletSameDeviceUrlTest =  environment.show_wallet_url_test;
}
