import { TestBed } from '@angular/core/testing';
import { LearCredentialMachineIssuanceSchemaProvider } from './lear-credential-machine-issuance-schema-provider';
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryService } from 'src/app/shared/services/country.service';
import * as fieldsHelpers from '../../helpers/fields-order-helpers';
import {
  emailField,
  firstNameField,
  lastNameField,
  organizationField,
  organizationIdentifierField,
  serialNumberField,
} from './common-issuance-schema-fields';
import { KeyGeneratorComponent } from '../../components/key-generator/key-generator.component';
import { IssuancePowerComponent } from '../../components/power/issuance-power.component';
import { CredentialIssuanceTypedViewModelSchema } from 'src/app/core/models/entity/lear-credential-issuance';

describe('LearCredentialMachineIssuanceSchemaProvider', () => {
  let service: LearCredentialMachineIssuanceSchemaProvider;
  let authMock: jest.Mocked<AuthService>;
  let countryMock: jest.Mocked<CountryService>;
  const fakeCountries = [{ label: 'C', value: 'c' }];

  const fakeMandatorRaw: Record<string, string> = {};
  for (const k of fieldsHelpers.employeeMandatorFieldsOrder) {
    fakeMandatorRaw[k] = `val-${k}`;
  }

  beforeEach(() => {
    authMock = {
      getRawMandator: jest.fn(),
    } as any;

    countryMock = {
      getCountriesAsSelectorOptions: jest.fn().mockReturnValue(fakeCountries),
    } as any;

    jest
      .spyOn(fieldsHelpers, 'convertToOrderedArray')
      .mockImplementation((obj: any, order: any[]) =>
        order
          .filter((k: any) => obj[k] != null)
          .map((k: any) => ({ key: k, value: obj[k] }))
      );

    TestBed.configureTestingModule({
      providers: [
        LearCredentialMachineIssuanceSchemaProvider,
        { provide: AuthService, useValue: authMock },
        { provide: CountryService, useValue: countryMock },
      ],
    });

    service = TestBed.inject(LearCredentialMachineIssuanceSchemaProvider);
  });

  describe('getSchema()', () => {
    let schema: CredentialIssuanceTypedViewModelSchema<'LEARCredentialMachine'>;

    beforeEach(() => {
      schema = service.getSchema();
    });

    it('includes the keys group with KeyGeneratorComponent', () => {
      const keysGroup = schema.schema.find(f => f.key === 'keys');
      expect(keysGroup).toBeDefined();
      expect(keysGroup?.type).toBe('group');
      expect(keysGroup?.display).toBe('main');
      expect(keysGroup?.custom?.component).toBe(KeyGeneratorComponent);

      const didField = keysGroup?.groupFields[0];
      expect(didField).toMatchObject({
        key: 'didKey',
        type: 'control',
        validators: [{ name: 'required' }],
      });
    });

    it('includes the mandatee group with domain and ipAddress fields', () => {
      const mand = schema.schema.find(f => f.key === 'mandatee');
      expect(mand).toBeDefined();
      expect(mand?.groupFields).toHaveLength(2);

      const [domain, ip] = mand!.groupFields;
      expect(domain).toMatchObject({
        key: 'domain',
        controlType: 'text',
        validators: [{ name: 'required' }, { name: 'isDomain' }],
      });
      expect(ip).toMatchObject({
        key: 'ipAddress',
        validators: [{ name: 'isIP' }],
      });
    });

    it('includes the mandator group and staticValueGetter behavior', () => {
      const mandator = schema.schema.find(f => f.key === 'mandator');
      expect(mandator).toBeDefined();
      expect(mandator?.display).toBe('pref_side');
      expect(typeof mandator?.staticValueGetter).toBe('function');

      authMock.getRawMandator.mockReturnValue(null);
      expect(mandator?.staticValueGetter!()).toBeNull();

      authMock.getRawMandator.mockReturnValue(fakeMandatorRaw as any);
      const staticData = mandator?.staticValueGetter!();
      expect(staticData).toHaveProperty('mandator');

      expect(staticData!.mandator).toEqual(
        fieldsHelpers.employeeMandatorFieldsOrder.map(k => ({
          key: k,
          value: fakeMandatorRaw[k],
        }))
      );

      const fields = mandator?.groupFields;
      expect(fields![0]).toEqual(firstNameField);
      expect(fields![1]).toEqual(lastNameField);
      expect(fields![2]).toEqual(emailField);
      expect(fields![3]).toEqual(serialNumberField);
      expect(fields![4]).toEqual(organizationField);
      expect(fields![5]).toEqual(organizationIdentifierField);
      expect(fields![6]).toMatchObject({
        key: 'country',
        controlType: 'selector',
        multiOptions: fakeCountries,
        validators: [{ name: 'required' }],
      });
    });

    it('includes the power group with IssuancePowerComponent', () => {
      const power = schema.schema.find(f => f.key === 'power');
      expect(power).toBeDefined();
      expect(power?.type).toBe('group');
      expect(power?.groupFields).toEqual([]);
      expect(power?.custom).toMatchObject({
        component: IssuancePowerComponent,
        data: [
          {
            action: ['Create', 'Update', 'Delete'],
            function: 'ProductOffering',
            isAdminRequired: false,
          },
          {
            action: ['Execute'],
            function: 'Onboarding',
            isAdminRequired: true,
          },
          {
            action: ['Upload'],
            function: 'Certification',
            isAdminRequired: true,
          },
        ],
      });
    });
  });
});