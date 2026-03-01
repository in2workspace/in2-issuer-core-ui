import { CREDENTIAL_MANAGEMENT_SEARCH_PLACEHOLDER_SUBJECT } from './../../core/constants/translations.constants';
import { AfterViewInit, Component, OnInit, inject, ViewChild, DestroyRef, ElementRef } from '@angular/core';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { CredentialProcedureBasicInfo, CredentialProceduresResponse } from "../../core/models/dto/credential-procedures-response.dto";
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass, DatePipe } from '@angular/common';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subject, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatIcon } from '@angular/material/icon';
import { CredentialProcedureWithClass, Filter, FilterConfig } from 'src/app/core/models/entity/lear-credential-management';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';

import { SubjectComponent } from './components/subject-component/subject-component.component';
import { FormsModule } from '@angular/forms';
import { CREDENTIAL_MANAGEMENT_SUBJECT } from 'src/app/core/constants/translations.constants';
import { CapitalizePipe } from 'src/app/shared/pipes/capitalize.pipe';
import { AddPrefixPipe } from 'src/app/shared/pipes/add-prefix.pipe';



@Component({
    selector: 'app-credential-management',
    templateUrl: './credential-management.component.html',
    styleUrls: ['./credential-management.component.scss'],
    imports: [
        FormsModule,
        MatButton,
        MatButtonModule,
        MatTable,
        MatSort,
        MatColumnDef,
        MatFormField,
        MatHeaderCellDef,
        MatHeaderCell,
        MatIcon,
        MatInputModule,
        MatLabel,
        MatSortHeader,
        MatCellDef,
        MatCell,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        NgClass,
        MatPaginator,
        DatePipe,
        SubjectComponent,
        TranslatePipe,
        CapitalizePipe,
        AddPrefixPipe
    ],
    animations: [
        trigger('openClose', [
            state('open', style({
                width: '200px',
                opacity: 1,
            })),
            state('closed', style({
                width: '0px',
                opacity: 0,
            })),
            transition('open => closed', [animate('0.2s')]),
            transition('closed => open', [animate('0.2s')]),
        ]),
    ]
})
export class CredentialManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatSort) public sort!: MatSort;
  @ViewChild('searchInput') public searchInput!: ElementRef<HTMLInputElement>;
  public displayedColumns: string[] = ['subject', 'organization_identifier', 'credential_type', 'updated', 'status'];
  public dataSource = new MatTableDataSource<CredentialProcedureWithClass>();
  public isAdminOrganizationIdentifier = false;
  public isSearchByOrganizationFilterChecked = false;
  public searchLabel = CREDENTIAL_MANAGEMENT_SUBJECT;
  public searchPlaceholder = CREDENTIAL_MANAGEMENT_SEARCH_PLACEHOLDER_SUBJECT;

  public hideSearchBar: boolean = true;


  private readonly authService = inject(AuthService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly statusService = inject(LifeCycleStatusService);
  private readonly searchSubject = new Subject<string>();

  private readonly filtersMap: Record<Filter, FilterConfig> = {
    subject: {
      filterName: "subject",
      translationLabel: CREDENTIAL_MANAGEMENT_SUBJECT,
      placeholderTranslationLabel: CREDENTIAL_MANAGEMENT_SEARCH_PLACEHOLDER_SUBJECT
    }
   } as const;

  public ngOnInit() {
    this.loadCredentialData();
    this.isAdminOrganizationIdentifier = this.authService.hasAdminOrganizationIdentifier();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.setDataSortingAccessor();
    this.setFilter("subject");
    this.setStringSearchSubscription();
  }

  public navigateToCreateCredential(): void {
    this.router.navigate(['/organization/credentials/create']);
  }

  public navigateToCreateCredentialOnBehalf(): void {
    const route = this.isAdminOrganizationIdentifier
      ? ['/organization/credentials/create-on-behalf']
      : ['/organization/credentials/create'];
  
    this.router.navigate(route);
  }
  
  public onRowClick(row: CredentialProcedureBasicInfo): void {
    this.navigateToCredentialDetails(row);
  }

  public navigateToCredentialDetails(credential_procedures: CredentialProcedureBasicInfo): void {
    this.router.navigate([
      '/organization/credentials/details',
      credential_procedures.credential_procedure?.procedure_id
    ]);
  }

  public toggleSearchBar(){
    this.hideSearchBar = !this.hideSearchBar;
    const searchInputNativeEl = this.searchInput.nativeElement;

    if (this.hideSearchBar) {

      this.searchSubject.next('');
      
      if (this.searchInput) {
        searchInputNativeEl.value = '';
      }
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }else{
      searchInputNativeEl.focus();
      searchInputNativeEl.select();
    }
  }

  public onSearchStringChange(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  private loadCredentialData(): void {
    this.credentialProcedureService.getCredentialProcedures()
    .pipe(take(1))
    .subscribe({
      next: (data: CredentialProceduresResponse) => {
        this.dataSource.data = this.statusService.addStatusClass(data.credential_procedures);
      },
      error: (error) => {
        console.error('Error fetching credentials for table', error);
      }
    });
  }

  private setDataSortingAccessor(): void{
    this.dataSource.sortingDataAccessor = (item: CredentialProcedureBasicInfo, property: string) => {
      switch (property) {
        case 'status': {
          const status = item.credential_procedure.status.toLowerCase();
          return status === 'withdrawn' ? 'draft' : status;
        }
        case 'subject': {
          return item.credential_procedure.subject.toLowerCase();
        }
        case 'updated': {
          return item.credential_procedure.updated.toLowerCase();
        }
        case 'credential_type': {
          return item.credential_procedure.credential_type.toLowerCase();
        }
        case 'organization_identifier': {
          return item.credential_procedure.organization_identifier.toLowerCase();
        }
        default:
          return '';
      }
    };
  }

  private setFilter(filter: Filter): void{
    this.setFilterLabelAndPlaceholder(filter);
    this.setFilterPredicate(filter);
  }

  private setFilterPredicate(filter: Filter): void{
    this.dataSource.filterPredicate = (data: CredentialProcedureBasicInfo, filterString: string) => {
      const searchString = filterString.trim().toLowerCase();
      return data.credential_procedure[filter].toLowerCase().includes(searchString);
    };
  }

  private setFilterLabelAndPlaceholder(filter: Filter): void{
    const filterConfig: FilterConfig = this.filtersMap[filter];
    this.searchLabel = filterConfig.translationLabel;
    this.searchPlaceholder = filterConfig.placeholderTranslationLabel;
  }

  private setStringSearchSubscription(): void{
    this.searchSubject.pipe(debounceTime(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.dataSource.filter = searchValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
    });
  }

}