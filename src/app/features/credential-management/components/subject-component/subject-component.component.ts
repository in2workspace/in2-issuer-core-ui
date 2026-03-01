import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialProcedureType } from 'src/app/core/models/dto/credential-procedures-response.dto';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Component to display the subject string when required.
 * If the credential type is in SUBJECT_HANDLERS_MAP, it will use 
 * the corresponding handler to map (i. e. label credentials extract uuid)
 */
@Component({
    selector: 'app-subject',
    imports: [CommonModule, MatTooltip],
    template: `
    <span [matTooltip]="subject$()">{{ displayValue$() }}</span>
  `
})
export class SubjectComponent {
  public subject$ = input.required<string>();
  public type$ = input.required<CredentialProcedureType>();

  public displayValue$ = computed<string>(() => {
   const type = this.type$();
   const subject = this.subject$();
    
    return this.handleSubject(subject, type);
  });

  private readonly SUBJECT_HANDLERS_MAP: {
    [K in CredentialProcedureType]?: (subject:string) => string} = {
    'LABEL_CREDENTIAL': (subject: string) => this.extractUuid(subject)
  } as const;

  private handleSubject(subject: string, type: CredentialProcedureType){
    const handler = this.SUBJECT_HANDLERS_MAP[type];
    return handler ? handler(subject) : subject;
  }


  // SUBJECT HANDLERS

  // This regex matches RFC 4122 UUIDs of versions 1–5:
  //  • v1: time-based
  //  • v2: DCE Security / POSIX UID/GID
  //  • v3: name-based (MD5)
  //  • v4: random
  //  • v5: name-based (SHA-1)
  // and only the RFC 4122 variant (bits 6–7 = 10) in the fourth block.
  private extractUuid(subject: string): string {
    const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/;
    const result = uuidRegex.exec(subject);
    return result ? result[1] : subject;
  }


}