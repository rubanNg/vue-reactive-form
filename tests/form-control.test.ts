import { AbstractControl, FormControl } from '../src';
import { controlErrors } from './helpers';

describe('FormControl', () => {
  const initialValue = 666;
  const formControl = new FormControl(initialValue);

  it('formControl is instance of AbstractControl', () => {
    expect(formControl instanceof AbstractControl).toBe(true);
  });

  it('returns correct value of FormControl', () => {
    expect(formControl.value).toBe(initialValue);
  });

  describe('methods', () => {
    it('reset', () => {
      formControl.setValue(777);
      formControl.setErrors(controlErrors);
      formControl.reset();

      expect(formControl.value).toBe(initialValue);
      expect(formControl.errors).toEqual({});
      expect(formControl.dirty).toBe(false);
    });
  })
})