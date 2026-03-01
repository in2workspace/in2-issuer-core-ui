import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CustomEmailValidatorDirective } from './custom-email-validator.directive';

@Component({
    template: `
    <form>
      <input type="email" [formControl]="emailControl" appEmailValidator />
    </form>
  `,
    imports: [ReactiveFormsModule, FormsModule, CustomEmailValidatorDirective]
})
class TestComponent {
  emailControl = new FormControl('');
}

describe('EmailLengthValidatorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let emailControl: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, FormsModule, TestComponent, CustomEmailValidatorDirective],
}).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    emailControl = component.emailControl;
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(fixture).toBeTruthy();
  });

  it('should not set an error for a valid email', () => {
    emailControl.setValue('valid.email@example.com');
    expect(emailControl.errors).toBeNull();
  });

  it('should set an error if the local part exceeds 64 characters', () => {
    const longLocalPart = 'a'.repeat(65) + '@example.com';
    emailControl.setValue(longLocalPart);
    expect(emailControl.errors).toEqual({ emailLocalPartTooLong: true });
  });

  it('should set an error if the domain exceeds 255 characters', () => {
    const longDomain = 'user@' + 'a'.repeat(256) + '.com';
    emailControl.setValue(longDomain);
    expect(emailControl.errors).toEqual({ emailDomainTooLong: true });
  });

  it('should set an error if the email does not match the pattern', () => {

    // Falta l'@
    emailControl.setValue('plainaddress');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // No hi ha l'@
    emailControl.setValue('missingatsymbol.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Nom d'usuari incomplet
    emailControl.setValue('username@.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Falta la part local (usuari)
    emailControl.setValue('@missinguser.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Punt al final de la part local
    emailControl.setValue('john.@missinguser.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Punts consecutius
    emailControl.setValue('.john.@missinguser.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Caràcters no permesos
    emailControl.setValue('"john.@missinguser.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Domini incomplet
    emailControl.setValue('username@.domain.com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Punts consecutius al domini
    emailControl.setValue('username@domain..com');
    expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

    // Subdomini massa curt
    emailControl.setValue('username@a.domain.com');
    expect(emailControl.errors).toEqual(null); // Aquest segueix vàlid segons el patró

    // Domini principal massa curt
    emailControl.setValue('username@n.com');
    expect(emailControl.errors).toEqual({ emailMainDomainTooShort: true });

    // TLD massa curt
    emailControl.setValue('username@domain.c');
    expect(emailControl.errors).toEqual({ emailTopLevelDomainTooShort: true });

    // No pot començar amb un punt
emailControl.setValue('.john.doe@example.com');
expect(emailControl.errors).toEqual({ emailPatternInvalid: true });

// No pot contenir punts de domini consecutius
emailControl.setValue('john.doe@example..com');
expect(emailControl.errors).toEqual({ emailPatternInvalid: true });
});

it('should not set an error for edge cases that are valid', () => {
    // Alias vàlid amb signe més
    emailControl.setValue('user.name+tag+sorting@example.com');
    expect(emailControl.errors).toBeNull();

    // Nom curt vàlid
    emailControl.setValue('x@example.com');
    expect(emailControl.errors).toBeNull();

    // Subdomini vàlid
    emailControl.setValue('user_name@sub-domain.example.com');
    expect(emailControl.errors).toBeNull();
});

  it('should not set an error for a null or empty value', () => {
    emailControl.setValue(null);
    expect(emailControl.errors).toBeNull();

    emailControl.setValue('');
    expect(emailControl.errors).toBeNull();
  });

  it('should not set an error for a non-string value', () => {
    emailControl.setValue(12345);
    expect(emailControl.errors).toBeNull();
  });
});
