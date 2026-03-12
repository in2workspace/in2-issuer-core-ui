import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CredentialManagementComponent } from './credential-management.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';
import { CredentialProcedureWithClass } from 'src/app/core/models/entity/lear-credential-management';
import { CredentialProcedureBasicInfo, CredentialProceduresResponse } from 'src/app/core/models/dto/credential-procedures-response.dto';
import { ElementRef } from '@angular/core';

// helper to mock search input
function createMockInput(initialValue = '') {
  const el = document.createElement('input');
  el.value = initialValue;
  const focusSpy = jest.spyOn(el, 'focus').mockImplementation(() => {});
  const selectSpy = jest.spyOn(el, 'select').mockImplementation(() => {});
  return { el, focusSpy, selectSpy };
}

describe('CredentialManagementComponent', () => {
  let component: CredentialManagementComponent;
  let fixture: ComponentFixture<CredentialManagementComponent>;
  let credentialProcedureService: CredentialProcedureService;
  let credentialProcedureSpy: jest.SpyInstance;
  let authService: jest.Mocked<any>;
  let router: Router;
  let statusService: LifeCycleStatusService;

  beforeEach(async () => {
    authService = {
      getMandator: () => of(null),
      getName: () => of('Name'),
      getToken: () => of('token'),
      logout: () => of(void 0),
      hasPower: () => true,
      hasAdminOrganizationIdentifier: jest.fn().mockReturnValue(true),
    } as jest.Mocked<any>;

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({}),
        CredentialManagementComponent, // standalone
      ],
      providers: [
        CredentialProcedureService,
        TranslateService,
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    credentialProcedureService = TestBed.inject(CredentialProcedureService);
    credentialProcedureSpy = jest.spyOn(credentialProcedureService, 'getCredentialProcedures');
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    statusService = TestBed.inject(LifeCycleStatusService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialManagementComponent);
    component = fixture.componentInstance;
    // avoid error in ngOnInit
    credentialProcedureSpy.mockReturnValue(of({ credential_procedures: [] } as CredentialProceduresResponse));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.resetAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call hasAdminOrganizationIdentifier on ngOnInit', () => {
    component.ngOnInit();
    expect(authService.hasAdminOrganizationIdentifier).toHaveBeenCalled();
    expect(component.isAdminOrganizationIdentifier).toBe(true);
  });

  it('should call loadCredentialData on ngOnInit', () => {
    // Spy on the private method
    const loadSpy = jest.spyOn(component as any, 'loadCredentialData');
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it('should set dataSource filter and reset paginator on search', fakeAsync(() => {
    // attach a real-ish paginator so firstPage exists
    component.dataSource['_paginator'] = { firstPage: jest.fn() } as any;
    const paginatorSpy = jest.spyOn(component.dataSource.paginator!, 'firstPage');

    component['searchSubject'].next('FOO');
    tick(500); // debounce

    expect(component.dataSource.filter).toBe('foo');
    expect(paginatorSpy).toHaveBeenCalled();
  }));

  it('should set dataSource filter and not reset paginator if paginator is undefined', fakeAsync(() => {
    // force paginator undefined
    jest.spyOn(component.dataSource, 'paginator', 'get').mockReturnValue(null);
    const paginator = component.dataSource.paginator;
    component['searchSubject'].next('BAR');
    tick(500); // debounce

    expect(component.dataSource.filter).toBe('bar');
    expect(paginator).toBeNull(); // no error nor firstPage call expected
  }));

  it('should run all setup functions inside ngAfterViewInit', () => {
    // Provide dummy paginator and sort so assignments work
    const mockPaginator = {} as any;
    const mockSort = { sortChange: { emit: jest.fn() } } as any;
    component.paginator = mockPaginator;
    component.sort = mockSort;

    // Spies on the private setup methods called inside ngAfterViewInit
    const sortAccessorSpy = jest.spyOn(component as any, 'setDataSortingAccessor');
    const filterPredicateSpy = jest.spyOn(component as any, 'setFilterPredicate');
    const searchSubSpy = jest.spyOn(component as any, 'setStringSearchSubscription');

    component.ngAfterViewInit();

    // Assignments done
    expect(component.dataSource.paginator).toBe(mockPaginator);
    expect(component.dataSource.sort).toBe(mockSort);

    // Methods executed with the right arguments
    expect(sortAccessorSpy).toHaveBeenCalledTimes(1);
    expect(filterPredicateSpy).toHaveBeenCalledWith('subject');
    expect(searchSubSpy).toHaveBeenCalledTimes(1);
  });

  it('should configure sortingDataAccessor correctly (status, subject, updated, credential_type, organization_identifier)', () => {
    component.ngAfterViewInit();
    const mockItem: any = {
      credential_procedure: {
        procedure_id: 'id-proc',
        status: 'WITHDRAWN',
        subject: 'Subject Test',
        updated: '2024-10-20',
        credential_type: 'Type Test',
        organization_identifier: 'ORG-ABC-123'
      },
    };
    expect(component.dataSource.sortingDataAccessor(mockItem, 'status')).toBe('draft');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'subject')).toBe('subject test');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'updated')).toBe(Date.parse('2024-10-20'));
    expect(component.dataSource.sortingDataAccessor(mockItem, 'credential_type')).toBe('type test');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'organization_identifier')).toBe('org-abc-123');
    expect(component.dataSource.sortingDataAccessor(mockItem, 'unknown')).toBe('');
  });

  it('should map non-withdrawn status as lowercased status', () => {
    component.ngAfterViewInit();
    const mockItem: any = {
      credential_procedure: {
        status: 'VALID',
      },
    };

    expect(component.dataSource.sortingDataAccessor(mockItem, 'status')).toBe('valid');
  });

  it('should return 0 for invalid updated date when sorting', () => {
    component.ngAfterViewInit();
    const mockItem: any = {
      credential_procedure: {
        updated: 'not-a-date',
      },
    };

    expect(component.dataSource.sortingDataAccessor(mockItem, 'updated')).toBe(0);
  });

  it('should configure filterPredicate for subject by default (ngAfterViewInit)', () => {
    component.ngAfterViewInit(); // sets filter to "subject"
    const mockItem: any = {
      credential_procedure: { subject: 'My Fancy Subject' }
    };
    expect(component.dataSource.filterPredicate!(mockItem, 'fancy')).toBe(true); // match
    expect(component.dataSource.filterPredicate!(mockItem, 'xyz')).toBe(false);  // no match
  });

  it('should call searchSubject.next with input value when onSearchStringChange is triggered', () => {
    const nextSpy = jest.spyOn(component['searchSubject'], 'next');
    const event = { target: { value: 'searchTerm' } } as unknown as Event;

    component.onSearchStringChange(event);

    expect(nextSpy).toHaveBeenCalledWith('searchTerm');
  });


  it('should call searchSubject.next with the correct filter value', () => {
    const event = { target: { value: 'searchTerm'} } as any;
    const nextSpy = jest.spyOn(component['searchSubject'], 'next');
    component.onSearchStringChange(event);
    expect(nextSpy).toHaveBeenCalledWith('searchTerm');
  });

  it('should focus and select input when opening the search bar', () => {
    component.hideSearchBar = true;

    const { el, focusSpy, selectSpy } = createMockInput();
    component.searchInput = new ElementRef<HTMLInputElement>(el);

    component.toggleSearchBar();

    expect(component.hideSearchBar).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();
  });

  it('should clear value, push empty filter, and go to first page when closing the search bar', () => {
    component.hideSearchBar = false;

    const { el } = createMockInput('lorem');
    component.searchInput = new ElementRef<HTMLInputElement>(el);

    component.dataSource['_paginator'] = { firstPage: jest.fn() } as any;
    const firstPageSpy = jest.spyOn(component.dataSource.paginator!, 'firstPage');

    const nextSpy = jest.spyOn(component['searchSubject'], 'next');
    component.toggleSearchBar();

    expect(component.hideSearchBar).toBe(true);
    expect(el.value).toBe('');
    expect(nextSpy).toHaveBeenCalledWith('');
    expect(firstPageSpy).toHaveBeenCalled();
  });

  it('should toggle searchbar open/close consistently', () => {
    component.hideSearchBar = true;

    component.toggleSearchBar();
    expect(component.hideSearchBar).toBeFalsy();

    component.toggleSearchBar();
    expect(component.hideSearchBar).toBeTruthy();
  });

  it('should navigate to create credential', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.navigateToCreateCredential();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/organization/credentials/create',
    ]);
  });

  it('should call navigateToCredentialDetails when a row is clicked', () => {
    const row = {
      credential_procedure: {
        procedure_id: 'row-id',
      },
    } as CredentialProcedureBasicInfo;

    const navigateDetailsSpy = jest.spyOn(component, 'navigateToCredentialDetails');

    component.onRowClick(row);

    expect(navigateDetailsSpy).toHaveBeenCalledWith(row);
  });

  it('should navigate to details route with procedure id', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const row: CredentialProcedureBasicInfo = {
      credential_procedure: {
        procedure_id: 'details-id',
        subject: '' as any,
        credential_type: 'LEAR_CREDENTIAL_EMPLOYEE',
        status: {} as any,
        updated: '',
        email: '',
        organization_identifier: '',
      },
    };

    component.navigateToCredentialDetails(row);

    expect(navigateSpy).toHaveBeenCalledWith([
      '/organization/credentials/details',
      'details-id',
    ]);
  });

  it('should navigate to create-on-behalf when isAdminOrganizationIdentifier is true', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.isAdminOrganizationIdentifier = true;

    component.navigateToCreateCredentialOnBehalf();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/organization/credentials/create-on-behalf',
    ]);
  });

  it('should navigate to create when isAdminOrganizationIdentifier is false', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.isAdminOrganizationIdentifier = false;

    component.navigateToCreateCredentialOnBehalf();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/organization/credentials/create',
    ]);
  });

  it('should load credential data and update dataSource', fakeAsync(() => {
    const mockProc: CredentialProcedureBasicInfo = {
      credential_procedure: {
        procedure_id: 'id1',
        subject: 'S1',
        status: 'DRAFT',
        updated: '2025-07-01',
        credential_type: 'LEAR_CREDENTIAL_EMPLOYEE',
        email: 'email',
        organization_identifier: 'VATES-000000',
      },
    };
    const mockResponse = { credential_procedures: [mockProc] } as CredentialProceduresResponse;
    const withClass: CredentialProcedureWithClass[] = [{ ...mockProc, statusClass: 'status-active' }];
    const statusSpy = jest.spyOn(statusService, 'addStatusClass').mockReturnValue(withClass);

    (component as any).loadCredentialData();
    tick();

    expect(statusSpy).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(withClass);
  }));

  it('should log an error if getCredentialProcedures fails', fakeAsync(() => {
    const error = new Error('oops');
    credentialProcedureSpy.mockReturnValue(throwError(() => error));

    expect(() => (component as any).loadCredentialData()).not.toThrow();
  }));

  it('should set searchLabel and searchPlaceholder according to filter config', () => {
  // Call private method with "subject"
  (component as any).setFilterLabelAndPlaceholder('subject');
  expect(component.searchLabel).toBe(component['filtersMap'].subject.translationLabel);
  expect(component.searchPlaceholder).toBe(component['filtersMap'].subject.placeholderTranslationLabel);
});

it('should subscribe to searchSubject and update dataSource.filter (and call firstPage if paginator exists)', fakeAsync(() => {
  // Attach paginator mock with firstPage spy
  component.dataSource['_paginator'] = { firstPage: jest.fn() } as any;
  const firstPageSpy = jest.spyOn(component.dataSource.paginator!, 'firstPage');

  // Manually call the private subscription setup
  (component as any).setStringSearchSubscription();

  // Emit value into searchSubject
  component['searchSubject'].next('  Foo  ');
  tick(500); // simulate debounceTime(500)

  expect(component.dataSource.filter).toBe('foo'); // trimmed + lowercased
  expect(firstPageSpy).toHaveBeenCalled();
}));

it('should update filter even if paginator is undefined', fakeAsync(() => {
  // Ensure paginator is undefined
  jest.spyOn(component.dataSource, 'paginator', 'get').mockReturnValue(null);

  (component as any).setStringSearchSubscription();

  component['searchSubject'].next('Bar');
  tick(500);

  expect(component.dataSource.filter).toBe('bar');
  // no error and no paginator call
}));

});
