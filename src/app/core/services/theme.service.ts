import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Theme } from '../models/theme.model';

/** Default semantic tokens — neutral, brand-independent colors for content areas. */
const SEMANTIC_DEFAULTS: Record<string, string> = {
  '--surface-page':         '#F5F7FA',
  '--surface-card':         '#FFFFFF',
  '--surface-muted':        '#E8ECF1',

  '--text-primary':         '#1A1A2E',
  '--text-secondary':       '#6B7280',
  '--text-disabled':        '#9CA3AF',

  '--border-default':       '#D1D5DB',
  '--border-strong':        '#9CA3AF',

  '--action-primary':       '#2563EB',
  '--action-primary-hover': '#1D4ED8',
  '--action-primary-contrast': '#FFFFFF',
  '--action-secondary':     '#F3F4F6',
  '--action-secondary-hover': '#E5E7EB',
  '--action-secondary-text': '#374151',

  '--status-success':       '#059669',
  '--status-warning':       '#D97706',
  '--status-error':         '#DC2626',
  '--status-info':          '#2563EB',
  '--status-neutral':       '#6B7280',

  '--radius-sm':            '4px',
  '--radius-md':            '8px',
  '--radius-lg':            '16px',
  '--radius-full':          '9999px',

  '--shadow-sm':            '0 1px 2px rgba(0,0,0,0.05)',
  '--shadow-md':            '0 4px 6px rgba(0,0,0,0.07)',
  '--shadow-lg':            '0 10px 15px rgba(0,0,0,0.1)',
};

/**
 * Hue range considered "safe" for action buttons (blue–indigo–violet).
 * The color must also have enough lightness to stand out on white backgrounds.
 * If checks fail, we keep the neutral default (#2563EB).
 */
const SAFE_HUE_MIN = 200;
const SAFE_HUE_MAX = 280;
const SAFE_LIGHTNESS_MIN = 0.35;
const SAFE_LIGHTNESS_MAX = 0.65;

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

    // ── Layer 1: Brand tokens (header/footer only) ──
    root.setProperty('--brand-primary', theme.branding.primaryColor);
    root.setProperty('--brand-primary-contrast', theme.branding.primaryContrastColor);
    root.setProperty('--brand-secondary', theme.branding.secondaryColor);
    root.setProperty('--brand-secondary-contrast', theme.branding.secondaryContrastColor);

    const rgb = this.hexToRgb(theme.branding.primaryColor);
    if (rgb) {
      root.setProperty('--brand-primary-rgb', `${rgb.r} ${rgb.g} ${rgb.b}`);
    }

    // Backwards compatibility — components still using old names will keep working
    root.setProperty('--primary-color', theme.branding.primaryColor);
    root.setProperty('--primary-contrast-color', theme.branding.primaryContrastColor);
    root.setProperty('--secondary-color', theme.branding.secondaryColor);
    root.setProperty('--secondary-contrast-color', theme.branding.secondaryContrastColor);
    if (rgb) {
      root.setProperty('--primary-color-rgb', `${rgb.r} ${rgb.g} ${rgb.b}`);
    }

    // ── Layer 2: Semantic tokens (content area) ──
    for (const [prop, value] of Object.entries(SEMANTIC_DEFAULTS)) {
      root.setProperty(prop, value);
    }

    // Smart action-primary: use tenant color only if its hue is "safe" (blue range)
    if (this.isSafeHue(theme.branding.primaryColor)) {
      root.setProperty('--action-primary', theme.branding.primaryColor);
      root.setProperty('--action-primary-contrast', theme.branding.primaryContrastColor);
    }

    // Compute RGB channels for status colors (useful for rgba() variants)
    for (const status of ['success', 'warning', 'error', 'info', 'neutral']) {
      const hex = root.getPropertyValue(`--status-${status}`).trim();
      const statusRgb = this.hexToRgb(hex);
      if (statusRgb) {
        root.setProperty(`--status-${status}-rgb`, `${statusRgb.r} ${statusRgb.g} ${statusRgb.b}`);
      }
    }

    // Compute RGB channels for action-primary
    const actionHex = root.getPropertyValue('--action-primary').trim();
    const actionRgb = this.hexToRgb(actionHex);
    if (actionRgb) {
      root.setProperty('--action-primary-rgb', `${actionRgb.r} ${actionRgb.g} ${actionRgb.b}`);
    }

    if (theme.branding.name) {
      document.title = theme.branding.name;
    }

    if (theme.branding.faviconUrl) {
      this.setFavicon(theme.branding.faviconUrl);
    }
  }

  /**
   * Returns true if the hex color is suitable as an action button color:
   * - Hue falls in the blue–indigo–violet range [200–280]
   * - Lightness is between 35–65% (not too dark, not too washed out)
   */
  private isSafeHue(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    if (d === 0) return false; // achromatic — not safe

    let h = 0;
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;

    const l = (max + min) / 2;

    return h >= SAFE_HUE_MIN && h <= SAFE_HUE_MAX
        && l >= SAFE_LIGHTNESS_MIN && l <= SAFE_LIGHTNESS_MAX;
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
