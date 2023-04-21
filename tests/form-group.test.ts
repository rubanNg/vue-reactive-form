import { AbstractControl, FormControl, FormGroup } from '../src';

describe('FormGroup', () => {
  const initialValue = 'initialValue';
  const formControl = new FormControl(initialValue);
  const formGroup = new FormGroup({
    control: formControl,
  });


  beforeEach(() => {
    formGroup.setValidators([]);
    formGroup.setAsyncValidators([]);
    formGroup.clearErrors();
  });

  it('formGroup is instance of AbstractControl', () => {
    expect(formGroup instanceof AbstractControl).toBe(true);
  });

  it('returns correct value of FormGroup', () => {
    expect(formGroup.value).toEqual({ control: initialValue });
  });

  describe('getters', () => {
    it('controls', () => {
      expect(formGroup.controls).toEqual({ control: formControl });
    });

    it('valid', () => {
      expect(formGroup.valid).toBe(true);
    });

    it('valid(returns false)', () => {
      formGroup.get('control')?.setErrors({ errorName: 'error text' });
      expect(formGroup.valid).toBe(false);
    });
  });


  describe('methods', () => {
    it('addControl', () => {
      const formControl2 = new FormControl();
      formGroup.addControl('control2', formControl2);

      expect(formGroup.controls).toEqual({
        control: formControl,
        control2: formControl2,
      });
    });

    it('setValue', () => {
      const formControl2 = new FormControl();
      formGroup.addControl('control2', formControl2);
      formGroup.setValue({
        control: 'value1',
        control2: 'value12',
      })
      
      expect(formGroup.value).toEqual({
        control: 'value1',
        control2: 'value12',
      });
    });

    it('removeControl', () => {
      const formControl2 = new FormControl();
      formGroup.addControl('control2', formControl2);
      formGroup.removeControl('control2')
      
      expect(formGroup.controls).toEqual({
        control: formControl,
      });
    });

    it('at', () => {
      const formControl2 = new FormControl();
      formGroup.addControl('control2', formControl2);
      formGroup.setValue({ control2: 'value12' })
      
      expect(formGroup.at('control2').value).toBe('value12');
    });

    it('contains', () => {
      const formControl2 = new FormControl();
      formGroup.addControl('control2', formControl2);
      
      expect(formGroup.contains('control2')).toBe(true);
    });

    it('reset', () => {
      formGroup.get('formControl')?.setValue('new value');
      formGroup.reset();
      
      expect(formGroup.value).toEqual({
        control: initialValue,
        control2: null,
      });
    });
  })
})