import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UnicodeValidatorDirective } from './unicode-validator.directive';

@Component({
    template: `
    <form>
      <input type="text" [formControl]="unicodeControl" appUnicodeValidator />
    </form>
  `,
    imports: [ReactiveFormsModule, UnicodeValidatorDirective]
})
class TestComponent {
  unicodeControl = new FormControl('');
}

describe('UnicodeValidatorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let unicodeControl: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, TestComponent, UnicodeValidatorDirective],
}).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    unicodeControl = component.unicodeControl;
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(fixture).toBeTruthy();
  });

  it('should not set an error for valid text', () => {
    const validValues = [
      'Héllo',         // Letters with accents
      'Renée O’Connor', // Apostrof
      'Jean-Pierre',   // Hyphen
      'Joan Martí',    // Space
      'Renée',         // Accent simple name
    ];

    validValues.forEach((value) => {
      unicodeControl.setValue(value);
      expect(unicodeControl.errors).toBeNull();
    });
  });

  it('should set an error for invalid text', () => {
    const invalidValues = [
      'Γειά',         // Greek
      'こんにちは',   // Japanese
      '안녕하세요',    // Korean
      'مرحبا',        // Arabic
      '中文',          // Chinese
      'Hello!',       // Exclamation
      'Test@Name',    // @
      'Name#Value',   // #
      'Value$',       // $
      '12345',        // Numbers
      '🙂',            // Emoji
    ];

    invalidValues.forEach((value) => {
      unicodeControl.setValue(value);
      expect(unicodeControl.errors).not.toBeNull();
    });
  });

  it('should not set an error for an empty value', () => {
    unicodeControl.setValue('');
    expect(unicodeControl.errors).toBeNull();
  });

  it('should not set an error for null or undefined values', () => {
    unicodeControl.setValue(null);
    expect(unicodeControl.errors).toBeNull();

    unicodeControl.setValue(undefined);
    expect(unicodeControl.errors).toBeNull();
  });

  it('should set an error for mixed valid and invalid characters', () => {
    const invalidValues = [
      'Héllo123', // Valid text with numbers
      'Γειά!',    // Valid Greek text with invalid `!`
      '中文🙂',     // Valid Chinese characters with emoji
    ];

    invalidValues.forEach((value) => {
      unicodeControl.setValue(value);
      expect(unicodeControl.errors).toEqual({ invalidUnicode: true });
    });
  });
});
