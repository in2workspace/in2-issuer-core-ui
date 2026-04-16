import { TestBed } from '@angular/core/testing';
import { CredentialDetailsService } from './credential-details.service';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { CredentialActionsService } from './credential-actions.service';
import { of } from 'rxjs';
import { Injector } from '@angular/core';
import { GxLabelCredentialDetailsViewModelSchema } from 'src/app/core/models/schemas/credential-details/gx-label-credential-details-schema';
import { LearCredentialEmployeeDetailsViewModelSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-employee-details-schema';
import { LearCredentialMachineDetailsViewModelSchema } from 'src/app/core/models/schemas/credential-details/lear-credential-machine-details-schema';
import { VerifiableCertificationDetailsViewModelSchema } from 'src/app/core/models/schemas/credential-details/verifiable-certification-details-schema';
import { DetailsKeyValueField, DetailsGroupField, ViewModelSchema } from 'src/app/core/models/entity/lear-credential-details';
import { ComponentPortal } from '@angular/cdk/portal';
import * as actionHelpers from 'src/app/features/credential-details/helpers/actions-helpers';
import { LEARCredentialEmployee, LEARCredential } from 'src/app/core/models/entity/lear-credential';

describe('CredentialDetailsService', () => {
  let service: CredentialDetailsService;

  const mockCredentialProcedureService = {
    getCredentialProcedureById: jest.fn(),
  };

  const mockCredentialActionsService = {
    openSendReminderDialog: jest.fn(),
    openSignCredentialDialog: jest.fn(),
    openRevokeCredentialDialog: jest.fn(),
  };

  const mockDialogWrapperService = {
    openErrorInfoDialog: jest.fn()
  } as any;
  const mockRouter = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CredentialDetailsService,
        FormBuilder,
        { provide: CredentialProcedureService, useValue: mockCredentialProcedureService },
        { provide: CredentialActionsService, useValue: mockCredentialActionsService },
        { provide: DialogWrapperService, useValue: mockDialogWrapperService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(CredentialDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the procedureId$ signal when setProcedureId is called', () => {
    service.setProcedureId('abc123');
    expect(service.procedureId$()).toBe('abc123');
  });

  it('should call actionsService.openSendReminderDialog with procedureId', () => {
    service.procedureId$.set('pid123');
    service.openSendReminderDialog();
    expect(mockCredentialActionsService.openSendReminderDialog).toHaveBeenCalledWith('pid123');
  });

  it('should call actionsService.openSignCredentialDialog with procedureId', () => {
    service.procedureId$.set('pid456');
    service.openSignCredentialDialog();
    expect(mockCredentialActionsService.openSignCredentialDialog).toHaveBeenCalledWith('pid456');
  });

  it('getProcedureId ha de retornar el valor de procedureId$', () => {
  (service as any).procedureId$ = () => 'proc-123';
  expect((service as any).getProcedureId()).toBe('proc-123');
});

  describe('getters', () => {
    it('getCredential ha de retornar vc quan existeix', () => {
    const fakeCred: any = {
      id: 'cred-1',
      type: [],
      description: '',
      credentialSubject: {
        mandate: {
          id: '',
          life_span: { start: '', end: '' },
          mandatee: {} as any,
          mandator: {} as any,
          power: [],
          signer: {} as any,
        }
      },
      validFrom: '',
      validUntil: '',
      credentialStatus: {
        id: 'st-1',
        type: 'RevocationList2020Status',
        statusPurpose: 'revocation',
        statusListIndex: 0,
        statusListCredential: ['list-1']
      }
    };
    (service as any).credentialProcedureDetails$ = () => ({ credential: { vc: fakeCred } });
    expect((service as any).getCredential()).toBe(fakeCred);
  });

  it('getCredential ha de retornar undefined quan no hi ha dades', () => {
    (service as any).credentialProcedureDetails$ = () => undefined;
    expect((service as any).getCredential()).toBeUndefined();
  });

  // it('getCredentialId ha de retornar l’id de la credencial', () => {
  //   const fake: LEARCredential = { id: 'cred-42' } as any;
  //   (service as any).getCredential = () => fake;
  //   expect((service as any).getCredentialId()).toBe('cred-42');
  // });

  // it('getCredentialId ha de retornar undefined si no hi ha credential', () => {
  //   (service as any).getCredential = () => undefined;
  //   expect((service as any).getCredentialId()).toBeUndefined();
  // });
  });

  describe('getCredentialListId', () => {
    it('sense statusListCredential: retorna empty string i loggea error', () => {
      const noStatus: any = { credentialStatus: { statusListCredential: undefined } };
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (service as any).getCredential = () => noStatus;
      const result = (service as any).getCredentialListId();
      expect(result).toBe('');
      expect(console.error).toHaveBeenCalledWith('No Status List Credential found in vc: ');
      expect(console.error).toHaveBeenCalledWith(noStatus);
    });

    it('amb statusListCredential: retorna l’últim element sense error', () => {
      const withStatus: any = { credentialStatus: { statusListCredential: 'one/two/three' } };
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (service as any).getCredential = () => withStatus;

      expect((service as any).getCredentialListId()).toBe('three');
      expect(console.error).not.toHaveBeenCalled();
    });

  });

  describe('evaluateFieldMain', () => {
 it('should evaluate “key-value” and “group” correctly', () => {
    const credStub = { foo: 'bar' } as any;

    const kv: DetailsKeyValueField = {
      type: 'key-value',
      key: 'x',
      value: (c: any) => 'valX',
      custom: {
        token: 'T' as any,
        component: class {},
        value: (c: any) => 'V'
      }
    };

    const grp: DetailsGroupField = {
      type: 'group',
      key: 'g',
      value: (c: any) => [
        { type: 'key-value', key: 'y', value: 'valY' }
      ] as DetailsKeyValueField[]
    };

    const kvGroup: DetailsGroupField = {
      type: 'group',
      key: 'gKv',
      value: [ kv ]
    };

    const schema: ViewModelSchema = {
      main: [ kvGroup, grp ],
      side: []
    };

    const evaluated = (service as any).evaluateSchemaValues(schema, credStub);

    const evaluatedGroup = evaluated.main[0] as any;
    expect(evaluatedGroup.key).toBe('gKv');
    expect(Array.isArray(evaluatedGroup.value)).toBeTruthy();

    const evaluatedKv = evaluatedGroup.value[0] as any;
    expect(evaluatedKv.key).toBe('x');
    expect(evaluatedKv.value).toBe('valX');
    expect(evaluatedKv.custom!.value).toBe('V');

    const evaluatedDynGroup = evaluated.main[1] as any;
    expect(evaluatedDynGroup.key).toBe('g');
    expect(Array.isArray(evaluatedDynGroup.value)).toBeTruthy();
    expect((evaluatedDynGroup.value[0] as any).value).toBe('valY');
  });
});

  describe('getSchemaByType', () => {
    it('retorna el schema correcte per cada tipus', () => {
      expect((service as any).getSchemaByType('LEARCredentialEmployee'))
        .toBe(LearCredentialEmployeeDetailsViewModelSchema);
      expect((service as any).getSchemaByType('LEARCredentialMachine'))
        .toBe(LearCredentialMachineDetailsViewModelSchema);
      expect((service as any).getSchemaByType('VerifiableCertification'))
        .toBe(VerifiableCertificationDetailsViewModelSchema);
      expect((service as any).getSchemaByType('gx:LabelCredential'))
        .toBe(GxLabelCredentialDetailsViewModelSchema);
    });
  });

  describe('computed signals', () => {
    const mockVc = {
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      credentialStatus: 'VALID'
    } as any;

    beforeEach(() => {
      // reset signals
      service.procedureId$.set('');
      service.credentialProcedureDetails$.set(undefined);
      // for the computed‐override tests
      jest.restoreAllMocks();
    });

    it('lifeCycleStatus$() should be undefined when no data', () => {
      expect(service.lifeCycleStatus$()).toBeUndefined();
    });

    it('lifeCycleStatus$() should return data.lifeCycleStatus', () => {
      const payload = { lifeCycleStatus: 'PENDING' } as any;
      service.credentialProcedureDetails$.set(payload);
      expect(service.lifeCycleStatus$()).toBe('PENDING');
    });

    it('credential$() should return vc when present', () => {
      service.credentialProcedureDetails$.set({ credential: { vc: mockVc } } as any);
      expect(service.credential$()).toBe(mockVc);
    });

    it('credential$() should be undefined when no vc', () => {
      service.credentialProcedureDetails$.set({ credential: { vc: undefined } } as any);
      expect(service.credential$()).toBeUndefined();
    });

    it('credentialValidFrom$() and credentialValidUntil$() fallback to empty string', () => {
      expect(service.credentialValidFrom$()).toBe('');
      expect(service.credentialValidUntil$()).toBe('');
    });

    it('credentialValidFrom$() and credentialValidUntil$() map from vc', () => {
      service.credentialProcedureDetails$.set({ credential: { vc: mockVc } } as any);
      expect(service.credentialValidFrom$()).toBe('2024-01-01');
      expect(service.credentialValidUntil$()).toBe('2024-12-31');
    });

    it('credentialStatus$() returns vc.credentialStatus', () => {
      service.credentialProcedureDetails$.set({ credential: { vc: mockVc } } as any);
      expect(service.credentialStatus$()).toBe('VALID');
    });

    it('credentialType$() delegates to getCredentialType()', () => {
      const spy = jest.spyOn(service as any, 'getCredentialType').mockReturnValue('THE‑TYPE');
      service.credentialProcedureDetails$.set({ credential: { vc: mockVc } } as any);
      expect(service.credentialType$()).toBe('THE‑TYPE');
      expect(spy).toHaveBeenCalledWith(mockVc);
    });

    it('showSideTemplateCard$() is false by default, true when sideViewModel has items', () => {
      expect(service.showSideTemplateCard$()).toBe(false);
      service.sideViewModel$.set([ { foo: 'bar' } as any ]);
      expect(service.showSideTemplateCard$()).toBe(true);
    });

    it('enableRevokeCredentialButton$() is false when no status, true when credentialStatus set', () => {
      service.credentialProcedureDetails$.set({ credential: { vc: { validFrom: '', validUntil: '', credentialStatus: undefined } } } as any);
      expect(service.enableRevokeCredentialButton$()).toBe(false);

      service.credentialProcedureDetails$.set({
        credential: {
          vc: { validFrom: '', validUntil: '', credentialStatus: {status:'ANY'} }
        }
      } as any);
      expect(service.enableRevokeCredentialButton$()).toBe(true);
    });


    it('showReminderButton$, showSignCredentialButton$, showRevokeCredentialButton$ all false by default', () => {
      expect(service.showReminderButton$()).toBe(false);
      expect(service.showSignCredentialButton$()).toBe(false);
      expect(service.showRevokeCredentialButton$()).toBe(false);
    });

    describe('showReminderButton$', () => {
      it('should return false when no type or status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: undefined,
          credential: { vc: undefined }
        } as any);

        expect(service.showReminderButton$()).toBe(false);
      });

      it('should return true for LEARCredentialEmployee with WITHDRAWN status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'WITHDRAWN',
          credential: { vc: { type: ['LEARCredentialEmployee'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });

      it('should return true for LEARCredentialEmployee with DRAFT status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'DRAFT',
          credential: { vc: { type: ['LEARCredentialEmployee'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });

      it('should return true for LEARCredentialEmployee with PEND_DOWNLOAD status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'PEND_DOWNLOAD',
          credential: { vc: { type: ['LEARCredentialEmployee'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });

      it('should return false for LEARCredentialEmployee with VALID status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'VALID',
          credential: { vc: { type: ['LEARCredentialEmployee'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(false);
      });

      it('should return true for gx:LabelCredential with VALID status (NEW)', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'VALID',
          credential: { vc: { type: ['gx:LabelCredential'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });

      it('should return true for gx:LabelCredential with WITHDRAWN status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'WITHDRAWN',
          credential: { vc: { type: ['gx:LabelCredential'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });

      it('should return false for VerifiableCertification regardless of status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'WITHDRAWN',
          credential: { vc: { type: ['VerifiableCertification'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(false);
      });

      it('should return true for LEARCredentialMachine with PEND_DOWNLOAD status', () => {
        service.credentialProcedureDetails$.set({
          lifeCycleStatus: 'PEND_DOWNLOAD',
          credential: { vc: { type: ['LEARCredentialMachine'], validFrom: '', validUntil: '', credentialStatus: undefined } }
        } as any);
        expect(service.showReminderButton$()).toBe(true);
      });
    });

     it('showActionsButtonsContainer$() és true si almenys un botó està visible', () => {
      service.credentialProcedureDetails$.set({
        lifeCycleStatus: 'PEND_SIGNATURE',
        credential: { vc: { type: ['LEARCredentialEmployee'], validFrom: '', validUntil: '', credentialStatus: 'OK' } }
      } as any);

      jest.spyOn(actionHelpers, 'statusHasSignCredentialButton').mockReturnValue(true);
      jest.spyOn(actionHelpers, 'credentialTypeHasSignCredentialButton').mockReturnValue(true);

      expect(service.showSignCredentialButton$()).toBe(true);

      expect(service.showActionsButtonsContainer$()).toBe(true);
    });
});


describe('Load models', () => {
  it('should load and evaluate credential models correctly', () => {
  const svc: any = service;

  jest.spyOn(svc, 'credentialType$').mockReturnValue('MyType');

  const vc = { foo: 'bar' };
  const mockData = { credential: { vc, type: 'MyType' } };
  jest.spyOn(svc, 'loadCredentialDetails').mockReturnValue(of(mockData));

  const getSchemaSpy   = jest.spyOn(svc, 'getSchemaByType').mockReturnValue({ schemaKey: 'schemaVal' });
  const evaluated         = { evaluatedKey: 'evaluatedVal' };
  const evaluateSpy         = jest.spyOn(svc, 'evaluateSchemaValues').mockReturnValue(evaluated);
  const templateSpy    = jest.spyOn(svc, 'setViewModels').mockImplementation(() => {});

  const injector = TestBed.inject(Injector);
  svc.loadCredentialModels(injector);

  expect(svc.loadCredentialDetails).toHaveBeenCalled();
  expect(getSchemaSpy).toHaveBeenCalledWith('MyType');
  expect(evaluateSpy).toHaveBeenCalledWith({ schemaKey: 'schemaVal' }, vc);
  expect(templateSpy).toHaveBeenCalledWith(evaluated, injector);
});
});

describe('shouldIncludeSideField', () => {
  it('should include fields with a key other than "issuer"', () => {
    const field: any = { key: 'other', type: 'key-value', value: null };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });

  it('should exclude issuer when type is key-value and value is null', () => {
    const field: any = { key: 'issuer', type: 'key-value', value: null };
    expect((service as any).shouldIncludeSideField(field)).toBe(false);
  });

  it('should include issuer when type is key-value and value is not null', () => {
    const field: any = { key: 'issuer', type: 'key-value', value: 'foo' };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });

  it('should exclude issuer when type is group and all children values are null', () => {
    const field: any = {
      key: 'issuer',
      type: 'group',
      value: [
        { type: 'key-value', value: null },
        { type: 'key-value', value: null },
      ],
    };
    expect((service as any).shouldIncludeSideField(field)).toBe(false);
  });

  it('should include issuer when type is group and at least one child value is not null', () => {
    const field: any = {
      key: 'issuer',
      type: 'group',
      value: [
        { type: 'key-value', value: null },
        { type: 'key-value', value: 'bar' },
      ],
    };
    expect((service as any).shouldIncludeSideField(field)).toBe(true);
  });
});

describe('setViewModels', () => {
  let mockMainViewModel$: { set: jest.Mock<any, any> };
  let mockSideViewModel$: { set: jest.Mock<any, any> };

  beforeEach(() => {
    // Mock the internal template model subjects
    mockMainViewModel$ = { set: jest.fn() };
    mockSideViewModel$ = { set: jest.fn() };
    (service as any).mainViewModel$ = mockMainViewModel$;
    (service as any).sideViewModel$ = mockSideViewModel$;
  });

  it('should extend main and side schemas and set the template models', () => {
    // Arrange dummy schema and injector
    const dummySchema: any = { main: { foo: 'bar' }, side: { baz: 'qux' } };
    const dummyInjector = {} as Injector;

    // Prepare extended schemas
    const extendedMain = { foo: 'extended' };
    const extendedSide = { baz: 'extended' };
    // Spy on extendFields to return extended schemas in order
    const extendSpy = jest.spyOn(service as any, 'extendFields')
      .mockReturnValueOnce(extendedMain)
      .mockReturnValueOnce(extendedSide);

    // Act: call the private method
    (service as any).setViewModels(dummySchema, dummyInjector);

    // Assert extendFields calls
    expect(extendSpy).toHaveBeenCalledWith(dummySchema.main, dummyInjector);
    expect(extendSpy).toHaveBeenCalledWith(dummySchema.side, dummyInjector);

    // Assert that template models are set
    expect(mockMainViewModel$.set).toHaveBeenCalledWith(extendedMain);
    expect(mockSideViewModel$.set).toHaveBeenCalledWith(extendedSide);
  });
});

describe('extendFields', () => {
  it('should return identical fields array when no custom or group', () => {
    // Arrange
    const fields: any[] = [
      { key: 'field1', type: 'key-value', value: 'val', custom: null }
    ];
    const injector = Injector.create({ providers: [] });

    // Act
    const result = (service as any).extendFields(fields, injector);

    // Assert
    expect(result).toEqual(fields);
    expect(result[0].portal).toBeUndefined();
  });

  it('should add portal property when custom is defined', () => {
    // Arrange dummy component and token/value
    class DummyComponent {};
    const token = 'TEST_TOKEN';
    const tokenInjectionValue = 'injectedValue';

    const fields: any[] = [
      {
        key: 'field2',
        type: 'custom',
        value: 'val2',
        custom: {
          token,
          value: tokenInjectionValue,
          component: DummyComponent
        }
      }
    ];
    const injector = Injector.create({ providers: [] });

    // Act
    const result = (service as any).extendFields(fields, injector);
    const extended = result[0];

    // Assert portal instance and injector behavior
    expect(extended.portal).toBeInstanceOf(ComponentPortal);
    expect((extended.portal as ComponentPortal<any>).component).toBe(DummyComponent);
    // The portal.injector should provide the custom value
    expect(extended.portal.injector.get(token)).toBe(tokenInjectionValue);
  });

  it('should recursively extend group fields', () => {
    // Arrange a nested group field
    const nested: any = {
      key: 'nested',
      type: 'key-value',
      value: 'nestedVal',
      custom: null
    };
    const groupField: any = {
      key: 'groupField',
      type: 'group',
      value: [nested],
      custom: null
    };
    const injector = Injector.create({ providers: [] });

    // Spy on extendFields to track recursive calls
    const spy = jest.spyOn(service as any, 'extendFields');

    // Act
    const result = (service as any).extendFields([groupField], injector);
    const extendedGroup = result[0];

    // Assert top-level call and recursive call
    expect(spy).toHaveBeenCalledWith([nested], injector);
    expect(extendedGroup.value).toEqual([nested]);
  });
});

});