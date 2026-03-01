import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [QRCodeComponent, TranslatePipe]
})
export class HomeComponent{
  @ViewChild('loginSection') loginSection!: ElementRef<HTMLElement>;
  @ViewChild('header') header!: ElementRef;
  public walletUrl = environment.wallet_url ?? '';
  public knowledge_base_url = environment.knowledge_base_url;

  private readonly themeService = inject(ThemeService);
  public readonly logoSrc = this.themeService.snapshot?.branding?.logoUrl ?? null;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public login() {
    this.authService.login();
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // we use content wrapper as reference because we need space for navbar
public scrollToLoginSection(): void {
  // The navbar uses position: fixed, so its height overlaps the target section.
  // We calculate the section's absolute position and subtract the navbar height
  // to ensure the section becomes fully visible below the fixed header.
  const element = this.loginSection.nativeElement;
  const rect = element.getBoundingClientRect();

  const navbarHeight = this.header.nativeElement.offsetHeight;
  console.log('navbar h: ' + navbarHeight);

  const top = rect.top + window.scrollY - navbarHeight;

  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}

}
