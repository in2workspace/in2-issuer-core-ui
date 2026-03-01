import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Theme } from '../models/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<Theme | null>(null);

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  async load(): Promise<void> {
    const theme = await firstValueFrom(this.http.get<Theme>('/assets/theme.json'));
    this.theme$.next(theme);
    this.applyTheme(theme);

    if (theme.i18n) {
      this.translate.addLangs(theme.i18n.available);
      this.translate.setDefaultLang(theme.i18n.defaultLang);

      const browserLang = this.detectBrowserLanguage(theme.i18n.available);
      this.translate.use(browserLang ?? theme.i18n.defaultLang);
    }
  }

  getTheme(): Observable<Theme | null> {
    return this.theme$.asObservable();
  }

  get snapshot(): Theme | null {
    return this.theme$.value;
  }

  private detectBrowserLanguage(available: string[]): string | undefined {
    const browserLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];

    for (const lang of browserLanguages) {
      const shortLang = lang.split('-')[0];
      if (available.includes(shortLang)) {
        return shortLang;
      }
    }
    return undefined;
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement.style;
    root.setProperty('--primary-color', theme.branding.primaryColor);
    root.setProperty('--primary-contrast-color', theme.branding.primaryContrastColor);
    root.setProperty('--secondary-color', theme.branding.secondaryColor);
    root.setProperty('--secondary-contrast-color', theme.branding.secondaryContrastColor);

    const rgb = this.hexToRgb(theme.branding.primaryColor);
    if (rgb) {
      root.setProperty('--primary-color-rgb', `${rgb.r} ${rgb.g} ${rgb.b}`);
    }

    if (theme.branding.name) {
      document.title = theme.branding.name;
    }

    if (theme.branding.faviconUrl) {
      this.setFavicon(theme.branding.faviconUrl);
    }
  }

  private setFavicon(url: string): void {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;

    let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = url;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : null;
  }
}
