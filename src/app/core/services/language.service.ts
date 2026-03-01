import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * @deprecated Language setup is now handled by ThemeService via APP_INITIALIZER.
 * This service is kept for backward compatibility but is no longer called at startup.
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public readonly translate = inject(TranslateService);

  private readonly availableLanguages = ['en', 'es', 'ca'];
  private readonly defaultLang = 'en';

  public async setLanguage(){
    this.setAvailableLanguages();

    const browserLang = this.setBrowserLanguage();
    if(browserLang) return;

    this.setDefaultLanguage();
  }

  private setAvailableLanguages(): void{
    this.translate.addLangs(this.availableLanguages);
  }

  private setDefaultLanguage(){
    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(this.defaultLang);
  }

private setBrowserLanguage(): string | undefined {
  const availableLangs = this.translate.getLangs();
  
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const lang of browserLanguages) {
    const shortLang = lang.split('-')[0];

    if (availableLangs.includes(shortLang)) {
      this.translate.use(shortLang);
      return shortLang;
    }
  }
  console.log("Couldn't find any available browser language.");
  return undefined;
}

}
