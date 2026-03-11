import {Component, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {environment} from 'src/environments/environment';
import {NavbarComponent} from '../app/shared/components/navbar/navbar.component';
import {DOCUMENT} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs';
import { LanguageService } from './core/services/language.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, NavbarComponent]
})
export class AppComponent implements OnInit{
public title = 'Credential-issuer-ui';
private readonly document = inject(DOCUMENT);
private readonly languageService = inject(LanguageService);
private readonly router= inject(Router);
public readonly showNavbar$ = toSignal(this.router.events.pipe(
  filter((event): event is NavigationEnd => event instanceof NavigationEnd),
  map((event: NavigationEnd) => !event.urlAfterRedirects.startsWith('/home')),
  startWith(!this.router.url.startsWith('/home'))
));

 ngOnInit(){
  this.languageService.setLanguage();
  this.setFavicon();
 }

 private setFavicon(): void {
  const faviconSrc = environment.customizations.assets.base_url + "/" + environment.customizations.assets.favicon_path;

  // load favicon from environment
  const faviconLink: HTMLLinkElement = this.document.querySelector("link[rel='icon']") || this.document.createElement('link');
  faviconLink.type = 'image/x-icon';
  faviconLink.rel = 'icon';
  faviconLink.href = faviconSrc;

  this.document.head.appendChild(faviconLink);

  // load apple-touch icon from environment
  const appleFaviconLink: HTMLLinkElement = this.document.querySelector("link[rel='apple-touch-icon']") || this.document.createElement('link');
  appleFaviconLink.type = 'image/x-icon';
  appleFaviconLink.rel = 'apple-touch-icon';
  appleFaviconLink.href = faviconSrc;

  this.document.head.appendChild(appleFaviconLink);
}


}
