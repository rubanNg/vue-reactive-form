import { FormControl, FormGroup } from '../src';
import {
  asyncValidatorWithoutError,
  syncValidatorWithError,
  syncValidatorWithoutError,
  controlErrors,
} from './helpers';

describe('AbstractControl', () => {
  const control = new FormControl();

  beforeEach(() => {
    control.setValidators([]);
    control.setAsyncValidators([]);
    control.clearErrors();
  });

  describe('getters', () => {
    it('validators', () => {
      control.addValidators([syncValidatorWithoutError]);
      expect(control.validators).toEqual([syncValidatorWithoutError]);
    });

    it('asyncValidators', () => {
      control.addAsyncValidators([asyncValidatorWithoutError]);
      expect(control.asyncValidators).toEqual([asyncValidatorWithoutError]);
    });

    it('valid(when control has errors)', () => {
      control.setErrors(controlErrors)
      expect(control.valid).toBe(false);
    });

    it('valid (when control has no errors)', () => {
      control.setErrors(controlErrors);
      control.clearErrors();
      expect(control.valid).toBe(true);
    });

    it('errors(when control has errors)', () => {
      control.setErrors(controlErrors);
      expect(control.errors).toEqual(controlErrors);
    });

    it('errors(when control has no errors)', () => {
      control.setErrors(controlErrors);
      control.clearErrors();
      expect(control.errors).toEqual({});
    });

    it('dirty', () => {
      expect(control.dirty).toBe(false);
    });

    it('dirty(after update control value)', () => {
      control.setValue({ key: 'value' });
      expect(control.dirty).toBe(true);``
    });
  });

  describe('methods', () => {
    it('hasError', () => {
      control.setErrors(controlErrors);
      expect(control.hasError('errorName')).toBe(true);
    });

    it('hasErrors', () => {
      control.setErrors(controlErrors);
      expect(control.hasErrors(Object.keys(controlErrors))).toBe(true);
    });

    it('hasAnyError', () => {
      control.setErrors(controlErrors);
      expect(control.hasAnyError(Object.keys(controlErrors))).toBe(true);
    });

    it('setErrors', () => {
      control.setErrors(controlErrors);
      expect(control.errors).toEqual(controlErrors);
    });

    it('addErrors', () => {
      control.setErrors(controlErrors);
      control.addErrors({ errorName3: 'error text' });
      expect(control.errors).toEqual({
        ...controlErrors,
        errorName3: 'error text'
      });
    });

    it('getErrors', () => {
      control.setErrors(controlErrors);
      expect(control.getErrors(['errorName'])).toEqual({ 'errorName': controlErrors.errorName });
    });

    it('removeErrors', () => {
      control.setErrors({ errorName: 'error text', errorName2: 'error text' });
      control.removeErrors(['errorName2']);
      expect(control.errors).toEqual({ errorName: 'error text' });
    });

    it('clearErrors', () => {
      control.setErrors(controlErrors);
      control.clearErrors();
      expect(control.errors).toEqual({});
    });

    it('setParent', () => {
      const parent = new FormGroup({});
      control.setParent(parent);
      expect(control.parent).toEqual(parent);
    });

    it('setDirty', () => {
      control.setDirty(true);
      expect(control.dirty).toBe(true);
    });

    it('updateValidity', () => {
      control.addValidators([syncValidatorWithError]);
      control.updateValidity();
      expect(control.valid).toBe(false);
      expect(control.errors).toEqual(syncValidatorWithError(control));
    });
  });
});