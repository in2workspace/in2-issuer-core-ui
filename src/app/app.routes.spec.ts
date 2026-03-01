import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { routes } from './app.routes';
import { basicGuard, settingsGuard } from './core/guards/accessLevel.guard';

describe('App Routes', () => {
  it('should contain a default redirect to home', () => {
    const defaultRoute = routes.find(
      (route) => route.path === '' && route.redirectTo === 'home'
    );
    expect(defaultRoute).toBeTruthy();
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('should define lazy loading for the home module', () => {
    const homeRoute = routes.find((route) => route.path === 'home');
    expect(homeRoute).toBeTruthy();
    expect(typeof homeRoute?.loadChildren).toBe('function');
  });

  it('should actually load the home module', async () => {
    const homeRoute = routes.find(r => r.path === 'home')!;
    const homeModule = await homeRoute.loadChildren!();
    expect(homeModule).toBeDefined();
  });

  it('should define lazy loading for settings with guards', () => {
    const settingsRoute = routes.find((route) => route.path === 'settings');
    expect(settingsRoute).toBeTruthy();
    expect(settingsRoute?.loadChildren).toBeDefined();
    expect(settingsRoute?.canActivate).toContain(AutoLoginPartialRoutesGuard);
    expect(settingsRoute?.canActivate).toContain(settingsGuard);
  });

  it('should actually load the settings module', async () => {
    const settingsRoute = routes.find(r => r.path === 'settings')!;
    const settingsModule = await settingsRoute.loadChildren!();
    expect(settingsModule).toBeDefined();
  });

  it('should define lazy loading for credential-offer', () => {
    const credOfferRoute = routes.find((route) => route.path === 'credential-offer');
    expect(credOfferRoute).toBeTruthy();
    expect(credOfferRoute?.loadChildren).toBeDefined();
  });

  it('should actually load the credential-offer module', async () => {
    const credOfferRoute = routes.find(r => r.path === 'credential-offer')!;
    const module = await credOfferRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should define organization/credentials parent route with guards', () => {
    const parentRoute = routes.find((route) => route.path === 'organization/credentials');
    expect(parentRoute).toBeTruthy();
    expect(parentRoute?.canActivateChild).toContain(AutoLoginPartialRoutesGuard);
    expect(parentRoute?.canActivateChild).toContain(basicGuard);
    expect(Array.isArray(parentRoute?.children)).toBe(true);
  });

  it('should define lazy loading for credential management', () => {
    const parentRoute = routes.find((route) => route.path === 'organization/credentials');
    const credManagementRoute = parentRoute?.children?.find((r) => r.path === '');
    expect(credManagementRoute).toBeTruthy();
    expect(typeof credManagementRoute?.loadChildren).toBe('function');
  });

  it('should actually load the credential management module', async () => {
    const parent = routes.find(r => r.path === 'organization/credentials')!;
    const credManagementRoute = parent.children!.find(r => r.path === '')!;
    const module = await credManagementRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should actually load the credential details module (child of organization/credentials)', async () => {
    const parent = routes.find(r => r.path === 'organization/credentials')!;
    const credDetailsRoute = parent.children!.find(r => r.path === 'details')!;
    const module = await credDetailsRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should actually load the credential creation module (child of organization/credentials)', async () => {
    const parent = routes.find(r => r.path === 'organization/credentials')!;
    const credCreateRoute = parent.children!.find(r => r.path === 'create')!;
    const module = await credCreateRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should define lazy loading for credential details', async () => {
    const parentRoute = routes.find((route) => route.path === 'organization/credentials');
    const credDetailsRoute = parentRoute?.children?.find((r) => r.path === 'details');
    expect(credDetailsRoute).toBeTruthy();
    expect(typeof credDetailsRoute?.loadChildren).toBe('function');
    const module = await credDetailsRoute!.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should define lazy loading for credential creation', () => {
    const parentRoute = routes.find((route) => route.path === 'organization/credentials');
    const credCreateRoute = parentRoute?.children?.find((r) => r.path === 'create');
    expect(credCreateRoute).toBeTruthy();
    expect(typeof credCreateRoute?.loadChildren).toBe('function');
  });

  it('should actually load the credential creation module', async () => {
    const parent = routes.find(r => r.path === 'organization/credentials')!;
    const credCreateRoute = parent.children!.find(r => r.path === 'create')!;
    const module = await credCreateRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should define lazy loading for credential creation on behalf', () => {
    const parentRoute = routes.find((route) => route.path === 'organization/credentials');
    const credCreateonBehalfRoute = parentRoute?.children?.find((r) => r.path === 'create-on-behalf');
    expect(credCreateonBehalfRoute).toBeTruthy();
    expect(typeof credCreateonBehalfRoute?.loadChildren).toBe('function');
  });

  it('should actually load the credential creation-on-behalf module', async () => {
    const parent = routes.find(r => r.path === 'organization/credentials')!;
    const credCreateonBehalfRoute = parent.children!.find(r => r.path === 'create-on-behalf')!;
    const module = await credCreateonBehalfRoute.loadChildren!();
    expect(module).toBeDefined();
  });

  it('should redirect wildcard (**) to home', () => {
    const wildcardRoute = routes.find((route) => route.path === '**');
    expect(wildcardRoute).toBeTruthy();
    expect(wildcardRoute?.redirectTo).toBe('home');
  });
});
