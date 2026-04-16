import { CredentialStatus, CredentialType, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { statusByTypeHasSendReminderButton, credentialTypeHasSignCredentialButton, statusHasSignCredentialButton } from './actions-helpers';

describe('Credential Helpers', () => {
  describe('statusByTypeHasSendReminderButton', () => {
    it('returns true for LEARCredentialEmployee with allowed status', () => {
      const allowedStatuses: LifeCycleStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
      allowedStatuses.forEach(status => {
        expect(statusByTypeHasSendReminderButton('LEARCredentialEmployee', status)).toBeTruthy();
      });
    });

    it('returns true for LEARCredentialMachine with allowed status', () => {
      const allowedStatuses: LifeCycleStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD'];
      allowedStatuses.forEach(status => {
        expect(statusByTypeHasSendReminderButton('LEARCredentialMachine', status)).toBeTruthy();
      });
    });

    it('returns true for gx:LabelCredential with allowed status including VALID', () => {
      const allowedStatuses: LifeCycleStatus[] = ['WITHDRAWN', 'DRAFT', 'PEND_DOWNLOAD', 'VALID'];
      allowedStatuses.forEach(status => {
        expect(statusByTypeHasSendReminderButton('gx:LabelCredential', status)).toBeTruthy();
      });
    });

    it('returns false for LEARCredentialEmployee with disallowed status', () => {
      expect(statusByTypeHasSendReminderButton('LEARCredentialEmployee', 'VALID')).toBeFalsy();
      expect(statusByTypeHasSendReminderButton('LEARCredentialEmployee', 'PEND_SIGNATURE')).toBeFalsy();
    });

    it('returns false for VerifiableCertification regardless of status', () => {
      expect(statusByTypeHasSendReminderButton('VerifiableCertification', 'WITHDRAWN')).toBeFalsy();
      expect(statusByTypeHasSendReminderButton('VerifiableCertification', 'DRAFT')).toBeFalsy();
      expect(statusByTypeHasSendReminderButton('VerifiableCertification', 'VALID')).toBeFalsy();
    });
  });

  describe('credentialTypeHasSignCredentialButton', () => {
    const allowed: CredentialType[] = ['LEARCredentialEmployee', 'gx:LabelCredential', 'LEARCredentialMachine'];
    const disallowed: any = 'AnotherType';

    it.each(allowed)('returns true for allowed type %s', (type) => {
      expect(credentialTypeHasSignCredentialButton(type)).toBeTruthy();
    });

    it('returns false for a disallowed type', () => {
      expect(credentialTypeHasSignCredentialButton(disallowed)).toBeFalsy();
    });
  });

  describe('statusHasSignCredentialButton', () => {
    const allowed: LifeCycleStatus[] = ['PEND_SIGNATURE'];
    const disallowed: any = 'DRAFT';

    it.each(allowed)('returns true for allowed status %s', (status) => {
      expect(statusHasSignCredentialButton(status)).toBeTruthy();
    });

    it('returns false for a disallowed status', () => {
      expect(statusHasSignCredentialButton(disallowed)).toBeFalsy();
    });
  });
});
