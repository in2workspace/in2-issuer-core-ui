import { Component, computed, input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSelect } from '@angular/material/select';
import { AddAsteriskDirective } from 'src/app/shared/directives/add-asterisk.directive';
import { NgComponentOutlet, TitleCasePipe } from '@angular/common';
import { CredentialIssuanceViewModelControlField, CredentialIssuanceViewModelField, CredentialIssuanceViewModelGroupField } from 'src/app/core/models/entity/lear-credential-issuance';

/**
 * DynamicFieldComponent
 * - Takes as inputs a field schema (control or group), its name and the parent FormGroup.
 * - If the field schema type is 'control', it renders it. This case needs the parent Form Group because controls need parent FormGroup to be in the same view
 * - If the field schema type is 'group', it iterates over the child fields and renders them recusively (calling the dynamic component itself)
 */
@Component({
    selector: 'app-dynamic-field',
    imports: [
        AddAsteriskDirective,
        NgComponentOutlet,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        ReactiveFormsModule,
        TitleCasePipe,
        TranslatePipe,
    ],
    templateUrl: './dynamic-field.component.html',
    styleUrl: './dynamic-field.component.scss'
})
export class DynamicFieldComponent {
  public fieldSchema$ = input.required<CredentialIssuanceViewModelField>();
  public controlSchema$ = computed<CredentialIssuanceViewModelControlField | null>(() => {
    const f = this.fieldSchema$();
    return f.type === 'control' ? f : null;
  });

  public groupSchema$ = computed<CredentialIssuanceViewModelGroupField | null>(() => {
    const f = this.fieldSchema$();
    return f.type === 'group' ? f : null;
  });

  public fieldName$ = input.required<string>();
  public parentFormGroup$ = input.required<FormGroup>();

  
  public childControl$ = computed<FormControl | null>(() => {
    if (!this.controlSchema$()) return null;
    const ac: AbstractControl | null = this.parentFormGroup$().get(this.fieldName$());
    return ac instanceof FormControl ? ac : null;
  });

  public childGroup$ = computed<FormGroup | null>(() => {
    if (!this.groupSchema$()) return null;
    const ac: AbstractControl | null = this.parentFormGroup$().get(this.fieldName$());
    return ac instanceof FormGroup ? ac : null;
  });

  public getErrorMessage(control: AbstractControl | null): string {
    if (!control?.errors) return "";
    const err = Object.values(control.errors)[0];
    const defaultLabel = err.value;
    return defaultLabel;
  }

  public getErrorsArgs(control: AbstractControl | null): Record<string, string> {
    if (!control?.errors) return {};
    const err = Object.values(control.errors)[0];
    const args = err.args as [];
    let translateParams = {};
    if(args && args.length > 0){
      args.forEach((arg, i) => {
        translateParams = { ...translateParams, [i]: arg }
      });
    }
    return translateParams;
  }



}

