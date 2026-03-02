import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [RouterLink, MatIcon, MatMenuModule, MatButtonModule, TranslatePipe]
})
export class NavbarComponent implements OnInit {
  public userName: string = '';
  public organization: string = '';
  public selectedLanguage = 'en';
  public isMenuOpen:boolean = false;
  public logoSrc: string | null = null;

  private readonly themeService = inject(ThemeService);

  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  
  public ngOnInit() {
    this.logoSrc = this.themeService.snapshot?.branding?.logoUrl ?? null;

    this.authService.getMandator()
      .pipe(take(1))
      .subscribe(mandator => {
        if (mandator) {
          this.organization = mandator.organization
        }
      })
    this.authService.getName()
      .pipe(take(1))
      .subscribe(name => {
        if (name) {
          this.userName = name;
        }
      });
  }

  public logout() {
    this.authService.logout();
  }

  public isCredentialIssuerAndConfigure():boolean {
    if(this.authService.hasPower('CredentialIssuer', 'Configure')) return true;
    return false;
  }

  //currently not used
  public changeLanguage(languageCode: string): void {
    this.translate.use(languageCode);
    this.selectedLanguage = languageCode;
  }
}
