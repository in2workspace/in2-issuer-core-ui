import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from '../app/shared/components/navbar/navbar.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet, NavbarComponent]
})
export class AppComponent {
public title = 'Credential-issuer-ui';
private readonly router= inject(Router);
public readonly showNavbar$ = toSignal(this.router.events.pipe(
  filter((event): event is NavigationEnd => event instanceof NavigationEnd),
  map((event: NavigationEnd) => !event.urlAfterRedirects.startsWith('/home')),
  startWith(!this.router.url.startsWith('/home'))
));

}
