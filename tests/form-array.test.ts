import { AbstractControl, FormArray, FormControl } from '../src';

describe('FormArray', () => {
  const initialValue = 'initialValue';
  const formControl = new FormControl(initialValue);
  const formControl2 = new FormControl();
  const formArray = new FormArray([
    formControl,
  ]);

  const getLastIndex = () => formArray.controls.length - 1;


  beforeEach(() => {
    formArray.setValidators([]);
    formArray.setAsyncValidators([]);
    formArray.clearErrors();
    formArray.removeAt(1);
  });

  it('formArray is instance of AbstractControl', () => {
    expect(formArray instanceof AbstractControl).toBe(true);
  });

  it('returns correct value of FormGroup', () => {
    expect(formArray.value).toEqual([initialValue]);
  });

  describe('getters', () => {
    it('controls', () => {
      expect(formArray.controls).toEqual([formControl]);
    });

    it('valid', () => {
      expect(formArray.valid).toBe(true);
    });

    it('valid(returns false)', () => {
      formArray.at<FormControl>(0).setErrors({ errorName: 'error text' });
      expect(formArray.valid).toBe(false);
    });
  });


  describe('methods', () => {
    it('addControl', () => {
      formArray.addControl(formControl2);
      expect(formArray.controls).toEqual([
        formControl,
        formControl2
      ]);
    });

    it('setValue', () => {
      formArray.addControl(formControl2);
      const newValue = [
        'value1',
        'value12',
      ];
      formArray.setValue(newValue);
      
      expect(formArray.value).toEqual(newValue);
    });

    it('removeControl', () => {
      formArray.addControl(formControl2);
      formArray.removeAt(getLastIndex());
      
      expect(formArray.controls).toEqual([formControl]);
    });

    it('at', () => {
      formArray.addControl(formControl2);
      formArray.updateAt(getLastIndex(), 'value12')
      
      expect(formArray.at(getLastIndex()).value).toBe('value12');
    });

    it('contains', () => {
      const formControl2 = new FormControl();
      formArray.addControl(formControl2);
      
      expect(formArray.contains(getLastIndex())).toBe(true);
    });

    it('reset', () => {
      formArray.get('formControl')?.setValue('new value');
      formArray.addControl(formControl2);
      formArray.reset();
      
      expect(formArray.value).toEqual([
        initialValue,
        null,
      ]);
    });
  })
})