import { AbstractControl, FormArray, FormControl, FormGroup } from '../src';
import { controlErrors } from './helpers';

describe('FormGroup', () => {
  const initialValue = 666;
  const firstControl = new FormControl(initialValue);
  const secondControl = new FormControl();
  let formGroup: FormGroup;


  beforeEach(() => {
    formGroup = new FormGroup({
      firstControl: firstControl,
    });

    formGroup.setValidators([]);
    formGroup.setAsyncValidators([]);
    formGroup.clearErrors();
  });

  it('formGroup is instance of AbstractControl', () => {
    expect(formGroup instanceof AbstractControl).toBe(true);
  });

  it('returns correct value of FormGroup', () => {
    expect(formGroup.value).toEqual({ firstControl: initialValue });
  });

  describe('getters', () => {
    it('controls', () => {
      expect(formGroup.controls).toEqual({ firstControl: firstControl });
    });

    it('valid', () => {
      expect(formGroup.valid).toBe(true);
    });

    it('valid(returns false)', () => {
      formGroup.get('firstControl')?.setErrors(controlErrors);
      expect(formGroup.valid).toBe(false);
    });

    it('value', () => {
      formGroup.addControl('object', new FormGroup({
        array: new FormArray([
          new FormControl('one'),
          new FormControl('two'),
          new FormControl('three'),
        ]),
        single: new FormControl('singleValue'),
      }));
      expect(formGroup.value).toEqual({
        firstControl: initialValue,
        object: {
          array: [
            'one',
            'two',
            'three',
          ],
          single: 'singleValue',
        },
      });
    });

  });

  describe('methods', () => {
    it('addControl', () => {
      formGroup.addControl('secondControl', secondControl);

      expect(formGroup.controls).toEqual({
        firstControl: firstControl,
        secondControl: secondControl,
      });
    });

    it('setValue', () => {
      formGroup.addControl('secondControl', secondControl);
      const nextValue = {
        firstControl: 'firstControl',
        secondControl: 'secondControl',
      }
      formGroup.setValue(nextValue)
      
      expect(formGroup.value).toEqual(nextValue);
    });

    it('removeControl', () => {
      formGroup.addControl('secondControl', secondControl);
      formGroup.removeControl('secondControl')
      
      expect(formGroup.controls).toEqual({
        firstControl: firstControl,
      });
    });

    it('at', () => {
      formGroup.addControl('secondControl', secondControl);
      formGroup.setValue({ secondControl: 'secondControl' })
      expect(formGroup.at('secondControl').value).toBe('secondControl');
    });

    it('contains', () => {
      formGroup.addControl('secondControl', secondControl);
      expect(formGroup.contains('secondControl')).toBe(true);
    });

    it('reset', () => {
      formGroup.get('firstControl')?.setValue('firstControl');
      formGroup.reset();
      
      expect(formGroup.value).toEqual({
        firstControl: initialValue,
      });
    });
  })
})