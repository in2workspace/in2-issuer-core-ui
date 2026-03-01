/**
 * @deprecated Theme loading is now handled by ThemeService via APP_INITIALIZER.
 * This module is kept for backward compatibility but is no longer used at startup.
 */

const DEFAULT_THEME_NAME = 'default-theme';
const THEME_LINK_ID = 'runtime-theme';

export function getInitialThemeName(): string {
  return DEFAULT_THEME_NAME;
}

export function applyInitialTheme(): void {
  const initialBundle = getInitialThemeName();
  applyThemeBundle(initialBundle);
}

export function applyThemeBundle(bundleName: string): void {
  const existing = document.getElementById(THEME_LINK_ID);
  existing?.remove();

  const link = document.createElement('link');
  link.id = THEME_LINK_ID;
  link.rel = 'stylesheet';

  const base = document.querySelector('base')?.getAttribute('href') ?? '/';
  link.href = `${base}${bundleName}.css`;

  document.head.appendChild(link);
}
