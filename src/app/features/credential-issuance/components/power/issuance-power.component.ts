import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { KeyValuePipe } from '@angular/common';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { EMPTY, Observable } from 'rxjs';
import { DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { AuthService } from 'src/app/core/services/auth.service';
import { IssuanceFormPowerSchema } from 'src/app/core/models/entity/lear-credential-issuance';
import { BaseIssuanceCustomFormChild } from 'src/app/features/credential-details/components/base-issuance-custom-form-child';
import { environment } from 'src/environments/environment';

export interface TempIssuanceFormPowerSchema extends IssuanceFormPowerSchema{
  isDisabled: boolean;
}

export interface NormalizedTempIssuanceFormSchemaPower extends TempIssuanceFormPowerSchema{
  normalizedActions: NormalizedAction[];
}

export type NormalizedAction = { action: string; value: boolean };

@Component({
    selector: 'app-issuance-power',
    templateUrl: './issuance-power.component.html',
    styleUrls: ['./issuance-power.component.scss'],
    imports: [KeyValuePipe, ReactiveFormsModule, MatFormField, MatSelect, MatSelectTrigger, MatOption, MatButton, MatSlideToggle, FormsModule, MatMiniFabButton, MatIcon, MatLabel, MatSelect, TranslatePipe]
})
export class IssuancePowerComponent extends BaseIssuanceCustomFormChild<UntypedFormGroup> implements OnInit{

  public organizationIdentifierIsAdmin: boolean;
  public _powersInput: IssuanceFormPowerSchema[] = [];
  public selectorPowers: TempIssuanceFormPowerSchema[] = [];
  public selectedPower: TempIssuanceFormPowerSchema | undefined;
  public readonly sysTenant: string = environment.sys_tenant;

  private readonly authService = inject(AuthService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  public constructor(){
    super();
    this.organizationIdentifierIsAdmin = this.authService.hasAdminOrganizationIdentifier();
  }
  
  
  @Input()
  public set powersInput(value: IssuanceFormPowerSchema[]) {
    this.resetForm();
    this._powersInput = value || [];
    this.selectorPowers = this.mapToTempPowerSchema(value) || [];
  }

  //this makes keyvaluePipe respect the order
  public keepOrder = (_: any, _2: any) => 0;

  public addPower(funcName: string) {
    const power = this._powersInput.find(p => p.function === funcName);
    const actions = power?.action;
    if(!actions){
      console.error('No actions for this power');
      return;
    }
    const toggleGroup: Record<string, FormControl> = {};
    for (const action of actions) {
      toggleGroup[action] = new FormControl(false);
    }
    this.form().addControl(funcName, new FormGroup(toggleGroup));
    this.selectorPowers = [...this.selectorPowers.map(p => {
      if(p.function === funcName){
        p = { ...p, isDisabled: true}
      }
      return p;
    })];
    this.selectedPower = undefined;
  }

  public removePower(funcName: string): void {
    const dialogData: DialogData = {
        title: this.translate.instant("power.remove-dialog.title"),
        message: this.translate.instant("power.remove-dialog.message") + funcName,
        confirmationType: 'sync',
        status: `default`
    }
    const removeAfterClose =  (): Observable<any> => {
    if (this.form().contains(funcName)) {
          this.form().removeControl(funcName);
        }

    this.selectorPowers = this.selectorPowers.map(p => {
      if (p.function === funcName) {
        return { ...p, isDisabled: false };
      }
      return p;
    });
      return EMPTY;
    };
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, removeAfterClose);
    
  }

  public ngOnInit(){
    this.form().addValidators(this.powerRulesValidator);
    this.form().updateValueAndValidity({ emitEvent: false });
    const selectorPowers = this.data();
    this._powersInput = selectorPowers || [];
    this.selectorPowers = this.mapToTempPowerSchema(selectorPowers) || [];
  }

public getPowerByFunction(functionName: string): TempIssuanceFormPowerSchema | undefined {
  return this.selectorPowers.find(p => p.function === functionName);
}

public getFormGroup(control: any): FormGroup {
  return control as FormGroup;
}

private mapToTempPowerSchema(powers: IssuanceFormPowerSchema[]): TempIssuanceFormPowerSchema[]{
  return powers
    .map(p => ({...p, isDisabled: false}))
    .filter(p => this.organizationIdentifierIsAdmin || !p.isAdminRequired);
}

private resetForm() {
  this.form().reset();            
  for (const key of Object.keys(this.form().controls)) {
    this.form().removeControl(key);
  }
}

private readonly powerRulesValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const group = ctrl as FormGroup;
  const controls = Object.values(group.controls) as FormGroup[];

  const hasOnePower = controls.length > 0;
  const hasOneActionPerPower = controls.every(c =>
    Object.values(c.value as Record<string, boolean>).some(Boolean)
  );

  const errors: ValidationErrors = {};
  if (!hasOnePower) errors['noPower'] = true;
  if (!hasOneActionPerPower) errors['noActionPerPower'] = true;

  return Object.keys(errors).length ? errors : null;
};
  

}
