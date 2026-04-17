import { inject, Injectable } from "@angular/core";
import { CredentialIssuanceTypedViewModelSchema, CredentialIssuanceSchemaProvider } from "src/app/core/models/entity/lear-credential-issuance";
import { AuthService } from "src/app/core/services/auth.service";
import { CountryService } from "src/app/shared/services/country.service";
import { convertToOrderedArray, employeeMandatorFieldsOrder } from "../../helpers/fields-order-helpers";
import { emailField, firstNameField, lastNameField, organizationField, organizationIdentifierField, serialNumberField } from "./common-issuance-schema-fields";
import { KeyGeneratorComponent } from "../../components/key-generator/key-generator.component";
import { IssuancePowerComponent } from '../../components/power/issuance-power.component';

@Injectable({ providedIn: 'root' })
export class LearCredentialMachineIssuanceSchemaProvider implements CredentialIssuanceSchemaProvider<'LEARCredentialMachine'> {

  private readonly authService = inject(AuthService);
  private readonly countryService = inject(CountryService);

  public getSchema(): CredentialIssuanceTypedViewModelSchema<'LEARCredentialMachine'> {
    const countriesSelectorOptions = this.countryService.getCountriesAsSelectorOptions();

    return {
      type: 'LEARCredentialMachine',
      schema:
      [
      // KEYS
      {
        key: 'keys',
        type: 'group',
        display: 'main',
        custom: {
          component: KeyGeneratorComponent
        },
        groupFields: [
          {
            key: 'didKey',
            type: 'control',
            controlType: 'text',
            validators: [{name: 'required'}]
          }
        ]
      },
      // MANDATEE
      {
        key: 'mandatee',
        type: 'group',
        display: 'main',
        groupFields: [
          {
            key: 'domain',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'required' },
              { name: 'isDomain' }
            ]
          },
          {
            key: 'ipAddress',
            type: 'control',
            controlType: 'text',
            validators: [
              { name: 'isIP' }
            ]
          }
        ]
      },
      // MANDATOR (static when onBehalf)
      {
        key: 'mandator',
        type: 'group',
        display: 'pref_side',
        staticValueGetter: () => {
            const mandator = this.authService.getRawMandator();
            return mandator ? { mandator: convertToOrderedArray(mandator, employeeMandatorFieldsOrder) } : null;
          },
        groupFields: [
          {
            ...firstNameField
          },
          {
            ...lastNameField
          },
          { 
            ...emailField 
          },
          {
            ...serialNumberField
          },
          {
            ...organizationField
          },
          {
            ...organizationIdentifierField
          },
          {
            key: 'country',
            type: 'control',
            controlType: 'selector',
            multiOptions: countriesSelectorOptions,
            validators: [{ name: 'required' }]
          }
        ]
      },
      // POWER
      {
        key: 'power',
        type: 'group',
        groupFields: [],
        custom: {
          component: IssuancePowerComponent,
          data: [
                {
                  action: [
                      "Create",
                      "Update",
                      "Delete",
                  ],
                  function: "ProductOffering",
                  isAdminRequired: false
                },
                {
                  action: ['Execute'],
                  function: 'Onboarding',
                  isAdminRequired: true
                },
                {
                  action: [
                      "Upload"
                  ],
                  function: "Certification",
                  isAdminRequired: true
            }
          ]
        }
      },
    ]};

  }
}
