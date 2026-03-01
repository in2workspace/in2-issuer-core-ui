import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { OrganizationNameValidatorDirective } from './organization-name.validator.directive';

@Component({
    template: `
    <form>
      <input type="text" [formControl]="orgNameControl" appOrgNameValidator />
    </form>
  `,
    imports: [ReactiveFormsModule, OrganizationNameValidatorDirective]
})
class TestComponent {
  orgNameControl = new FormControl('');
}

describe('OrganizationNameValidatorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let orgNameControl: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, TestComponent, OrganizationNameValidatorDirective],
}).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    orgNameControl = component.orgNameControl;
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(fixture).toBeTruthy();
  });

  it('should not set an error for an empty value', () => {
    orgNameControl.setValue('');
    expect(orgNameControl.errors).toBeNull();
  });

  it('should not set an error for names with valid characters', () => {
    orgNameControl.setValue('Organization-123 & Associates, Ltd.');
    expect(orgNameControl.errors).toBeNull();
  });

  it('should allow names with valid Latin characters and permitted symbols', () => {
    const validNames = [
      "Org Name",       // Space
      "O'Connor",       // Apostrof
      "AT&T",           // Ampersand
      "Café-au-lait",   // Latin characters with accent and hyphens
      "Dr. John's Org", // Dots, apostrofs, spaces
      "Org(2024)",      // Parenthesis and numbers
    ];

    validNames.forEach((name) => {
      orgNameControl.setValue(name);
      expect(orgNameControl.errors).toBeNull();
    });
  });

  it('should set an error for names containing special characters not allowed', () => {
    const invalidNames = [
      'Org@Name',  // '@'
      'Org#Name',  // '#'
      'Org$Name',  // '$'
      'Org%Name',  // '%'
      'Org^Name',  // '^'
      'Org*Name',  // '*'
      'Org=Name',  // '='
      'Org+Name',  // '+'
      'Org~Name',  // '~'
      'Org!Name',  // '!'
      'Org?Name',  // '?'
      'Org|Name',  // '|'
      'Org\\Name', // '\'
      'Org<Name>', // '<', '>'
      'Org[Name]', // '[', ']'
      'Org{Name}', // '{', '}'
    ];

    invalidNames.forEach((name) => {
      orgNameControl.setValue(name);
      expect(orgNameControl.errors).toEqual({ invalidOrgName: true });
    });
  });

  it('should set an error for names containing emojis', () => {
    const invalidNames = [
      'Org😀Name',
      'Org🚀Name',
      'Org❤️Name',
    ];

    invalidNames.forEach((name) => {
      orgNameControl.setValue(name);
      expect(orgNameControl.errors).toEqual({ invalidOrgName: true });
    });
  });


});
