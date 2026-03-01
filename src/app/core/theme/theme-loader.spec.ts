import * as runtimeTheme from './theme-loader';
import { applyInitialTheme } from './theme-loader';

describe('runtime theme functions', () => {
  const THEME_LINK_ID = 'runtime-theme';

  beforeEach(() => {
    // Clean DOM between tests.
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('getInitialThemeBundleName', () => {
    it('always returns default-theme', () => {
      expect(runtimeTheme.getInitialThemeName()).toBe('default-theme');
    });
  });

  describe('applyInitialTheme', () => {
    it('applies default-theme', () => {
      applyInitialTheme();

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/default-theme.css');
    });
  });

  describe('applyThemeBundle', () => {
    it('creates a <link> with correct id/rel and appends it to <head>', () => {
      // base href not present => fallback to "/"
      runtimeTheme.applyThemeBundle('default-theme');

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.id).toBe(THEME_LINK_ID);
      expect(link!.rel).toBe('stylesheet');
      expect(link!.getAttribute('href')).toBe('/default-theme.css');
    });

    it('uses <base href> when present', () => {
      const base = document.createElement('base');
      base.setAttribute('href', '/app/');
      document.head.appendChild(base);

      runtimeTheme.applyThemeBundle('my-theme');

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/app/my-theme.css');
    });

    it('removes an existing theme link before adding the new one', () => {
      const existing = document.createElement('link');
      existing.id = THEME_LINK_ID;
      existing.rel = 'stylesheet';
      existing.href = '/old.css';
      document.head.appendChild(existing);

      expect(document.head.querySelectorAll(`link#${THEME_LINK_ID}`).length).toBe(1);

      runtimeTheme.applyThemeBundle('new-theme');

      const links = document.head.querySelectorAll<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('href')).toBe('/new-theme.css');
      expect(Array.from(links).some((l) => l.getAttribute('href') === '/old.css')).toBe(false);
    });

    it('handles missing <head> state by still appending correctly (sanity)', () => {
      // In JSDOM, document.head exists; this test mainly ensures no exception.
      expect(() => runtimeTheme.applyThemeBundle('abc')).not.toThrow();
      expect(document.getElementById(THEME_LINK_ID)).not.toBeNull();
    });
  });
});
