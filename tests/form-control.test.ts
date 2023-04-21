import { AbstractControl, FormControl } from '../src';

describe('FormControl', () => {
  const initialValue = 'initialValue'
  const formControl = new FormControl(initialValue);

  it('formControl is instance of AbstractControl', () => {
    expect(formControl instanceof AbstractControl).toBe(true);
  });

  it('returns correct value of FormControl', () => {
    expect(formControl.value).toBe(initialValue);
  });

  describe('methods', () => {
    it('reset', () => {
      formControl.setValue('11');
      formControl.setErrors({ errorName: 'error text' });
      formControl.reset();

      expect(formControl.value).toBe(initialValue);
      expect(formControl.errors).toEqual({});
      expect(formControl.dirty).toBe(false);
    });
  })
})