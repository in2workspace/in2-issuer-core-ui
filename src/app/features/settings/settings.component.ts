import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet, RouterLink,  RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list'; 
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-settings',
    imports: [TranslatePipe, MatIcon, MatSidenavModule, RouterModule, MatDividerModule, RouterOutlet, RouterLink, MatListModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  opened = true;

}
