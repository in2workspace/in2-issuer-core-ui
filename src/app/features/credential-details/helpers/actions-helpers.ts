import { CredentialType, LifeCycleStatus } from "src/app/core/models/entity/lear-credential";

const statusByTypeHasSendReminderButtonRecord: Readonly<Record<CredentialType, readonly LifeCycleStatus[]>> = {
  LEARCredentialEmployee: ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'],
  LEARCredentialMachine: ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'],
  VerifiableCertification: [],
  'gx:LabelCredential': ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD', 'VALID'],
};

const credentialTypeHasSignCredentialButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'gx:LabelCredential'];
const credentialTypeHasRevokeCredentialButtonArr: CredentialType[] = ['LEARCredentialEmployee', 'LEARCredentialMachine', 'gx:LabelCredential'];

const statusHasSingCredentialButtonArr: LifeCycleStatus[] = ['PEND_SIGNATURE'];
const statusHasRevokeCredentialButtonArr: LifeCycleStatus[] = ['VALID'];

export function statusByTypeHasSendReminderButton(type: CredentialType, status: LifeCycleStatus): boolean {
    const validStatuses = statusByTypeHasSendReminderButtonRecord[type].includes(status);
    console.log("Checking if status ", status, " is in valid statuses ", validStatuses, " for credential type ", type);
    const isValid = statusByTypeHasSendReminderButtonRecord[type].includes(status);
    console.log("Is valid for type ", type, ": ", isValid);
  return isValid;
}

export function credentialTypeHasSignCredentialButton(type: CredentialType): boolean{
    return credentialTypeHasSignCredentialButtonArr.includes(type);
}

export function credentialTypeHasRevokeCredentialButton(type: CredentialType): boolean{
    return credentialTypeHasRevokeCredentialButtonArr.includes(type);
}

export function statusHasSignCredentialButton(status: LifeCycleStatus): boolean{
    return statusHasSingCredentialButtonArr.includes(status);
}

export function statusHasRevokeCredentialButton(status: LifeCycleStatus): boolean{
    return statusHasRevokeCredentialButtonArr.includes(status);
}