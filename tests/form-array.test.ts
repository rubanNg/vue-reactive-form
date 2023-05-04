import { AbstractControl, FormArray, FormControl } from '../src';
import { controlErrors } from './helpers';

describe('FormArray', () => {
  const initialValue = 666;
  let firstControl: FormControl;
  let secondControl: FormControl;
  let formArray: FormArray;

  const getLastIndex = () => formArray.controls.length - 1;

  // const controlsArrays = [
  //   new FormControl(0),
  //   new FormControl(1),
  //   new FormControl(2),
  // ];

  beforeEach(() => {
    // firstControl = new FormControl(initialValue);
    // secondControl = new FormControl();
    formArray = new FormArray([
      new FormControl(),
    ]);
    formArray.setValidators([]);
    formArray.setAsyncValidators([]);
    formArray.clearErrors();
  });

  it('formArray is instance of AbstractControl', () => {
    const isInstance = formArray instanceof AbstractControl
    expect(isInstance).toBe(true);
  });

  // it('returns correct value of FormGroup', () => {
  //   expect(formArray.value).toEqual([initialValue]);
  // });

  // describe('getters', () => {
  //   it('controls', () => {
  //     expect(formArray.controls).toEqual([firstControl]);
  //   });

  //   it('valid', () => {
  //     expect(formArray.valid).toBe(true);
  //   });

  //   it('valid(returns false)', () => {
  //     formArray.at<FormControl>(0).setErrors(controlErrors);
  //     expect(formArray.valid).toBe(false);
  //   });
  // });


  // describe('methods', () => {
  //   it('addControl', () => {
  //     formArray.addControl(secondControl);
  //     expect(formArray.controls).toEqual([
  //       firstControl,
  //       secondControl
  //     ]);
  //   });

  //   it('addControls', () => {
  //     formArray.addControls(controlsArrays);
  //     expect(formArray.at(1).value).toBe(controlsArrays.at(0)?.value);
  //     formArray.removeAt(0);
  //     expect(formArray.at(0).value).toBe(controlsArrays.at(0)?.value);
  //     formArray.removeAt(-1);
  //     expect(formArray.at(-1).value).toBe(controlsArrays.at(-2)?.value);
  //   });

  //   it('setValue', () => {
  //     formArray.addControl(secondControl);
  //     const nextValue = [
  //       'first control value',
  //       'second control value',
  //     ];
  //     formArray.setValue(nextValue);
      
  //     expect(formArray.value).toEqual(nextValue);
  //   });

  //   it('removeControl', () => {
  //     formArray.addControl(secondControl);
  //     formArray.removeAt(getLastIndex());
      
  //     expect(formArray.controls).toEqual([firstControl]);
  //   });

  //   it('at', () => {
  //     formArray.addControl(secondControl);
  //     formArray.updateAt(getLastIndex(), 'second control value')
      
  //     expect(formArray.at(getLastIndex()).value).toBe('second control value');
  //   });

  //   it('reset', () => {
  //     formArray.get<FormControl>('firstControl')?.setValue('first control value');
  //     formArray.addControl(secondControl);
  //     formArray.reset();
      
  //     expect(formArray.value).toEqual([
  //       initialValue,
  //       undefined,
  //     ]);
  //   });
  // })
})