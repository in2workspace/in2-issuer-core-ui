import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { MatIcon } from '@angular/material/icon';
import { environment } from 'src/environments/environment';
import { KNOWLEDGEBASE_PATH } from 'src/app/core/constants/knowledge.constants';

@Component({
    selector: 'app-credential-offer',
    templateUrl: './credential-offer.component.html',
    styleUrls: ['./credential-offer.component.scss'],
    imports: [QRCodeComponent, TranslatePipe, MatIcon]
})
export class CredentialOfferComponent{
  @Output() public refreshCredential = new EventEmitter<void>();
  public qrColor = "#2d58a7";
  public copied = false;
  public walletUsersGuideUrl = environment.knowledge_base_url + KNOWLEDGEBASE_PATH.WALLET;
  public credentialOfferUri$ = input.required<string>();

  public readonly walletSameDeviceUrl = environment.wallet_url + '/protocol/callback';
  public walletSameDeviceUrl$ = computed<string>(()=>{
    const httpsUrl = this.extractCredentialOfferHttpsUrl(this.credentialOfferUri$());
    return this.walletSameDeviceUrl + '?credential_offer_uri=' + encodeURIComponent(httpsUrl);
  });

  //TEST URLS
  public readonly showWalletSameDeviceUrlTest =  environment.show_wallet_url_test;
  public readonly walletSameDeviceTestUrl = environment.wallet_url_test + '/protocol/callback';

  public walletSameDeviceTestUrl$ = computed<string>(()=>{
    const httpsUrl = this.extractCredentialOfferHttpsUrl(this.credentialOfferUri$());
    return this.walletSameDeviceTestUrl + '?credential_offer_uri=' + encodeURIComponent(httpsUrl);
  });

  /**
   * Extracts the HTTPS credential offer URL from the openid-credential-offer:// URI.
   * Input:  openid-credential-offer://?credential_offer_uri=https%3A%2F%2F...
   * Output: https://...
   */
  private extractCredentialOfferHttpsUrl(oid4vciUri: string): string {
    try {
      const parsed = new URL(oid4vciUri.replace('openid-credential-offer://', 'https://openid-credential-offer/'));
      const innerUrl = parsed.searchParams.get('credential_offer_uri');
      return innerUrl ?? oid4vciUri;
    } catch {
      return oid4vciUri;
    }
  }

public copyQrContent(): void {
  navigator.clipboard.writeText(this.credentialOfferUri$());
  this.copied = true;
  setTimeout(() => this.copied = false, 2000);
}

public onRefreshCredentialClick(event:Event): void{
  event.preventDefault();
  this.refreshCredential.emit();
}

}
