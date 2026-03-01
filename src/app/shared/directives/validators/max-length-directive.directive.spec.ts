import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MaxLengthDirective } from './max-length-directive.directive';
import { By } from '@angular/platform-browser';

@Component({
    template: `
    <input [(ngModel)]="inputValue" appMaxLength="5" />
  `,
    imports: [FormsModule, MaxLengthDirective]
})
class TestComponent {
  inputValue = '';
}

describe('MaxLengthDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let directive: any;
  let inputEl: HTMLInputElement;
  let ngModel: NgModel;
  let validateSpy: any;
  let setErrorSpy: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FormsModule, TestComponent, MaxLengthDirective],
}).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const directiveDebugElement = fixture.debugElement.query(By.directive(MaxLengthDirective));
    directive = directiveDebugElement.injector.get(MaxLengthDirective);

    inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    ngModel = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);

    validateSpy = jest.spyOn(directive, 'validate');
    setErrorSpy = jest.spyOn(ngModel.control, 'setErrors');
  });

  it('should create the directive', () => {
    expect(fixture).toBeTruthy();
  });

  it('should not set an error when the value length is within the limit', () => {
    component.inputValue = '12345'; // exactly 5 characters
    fixture.detectChanges();

    expect(ngModel.control.errors).toBeNull();
  });

  it('should set an error when the value length exceeds the limit', () => {
    const errors = { ...ngModel.control.errors, maxlengthExceeded: true }
    component.inputValue = '123456'; // more than 5 characters
    fixture.detectChanges();
    fixture.whenStable().then(()=>{
      fixture.detectChanges();

      expect(validateSpy).toHaveBeenCalled();
      expect(setErrorSpy).toHaveBeenCalled()
      expect(setErrorSpy).toHaveBeenCalledWith(errors);
      expect(ngModel.control.errors).toEqual({ maxlengthExceeded: true });
    });
  });

  it('should remove the maxlengthExceeded error when the value length is reduced', () => {
    component.inputValue = '123456'; // exceeds limit
    fixture.detectChanges();
    fixture.whenStable().then(()=>{
      fixture.detectChanges();
      expect(ngModel.control.errors).toEqual({ maxlengthExceeded: true });
    });

    component.inputValue = '1234'; // within limit
    fixture.detectChanges();
    fixture.whenStable().then(()=>{
      fixture.detectChanges();
      expect(ngModel.control.errors).toBeNull();
    });
  });

  it('should retain other errors when maxlengthExceeded is removed', () => {
    const initialErrors = { required: true };
    ngModel.control.setErrors(initialErrors);
    component.inputValue = '123456'; // Exceeds max length
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(ngModel.control.errors).toEqual({
        ...initialErrors,
        maxlengthExceeded: true,
      });

      component.inputValue = '1234'; // Within limit
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(ngModel.control.errors).toEqual(initialErrors);
      });
    });
  });

});
