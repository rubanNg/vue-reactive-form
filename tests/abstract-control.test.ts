import { AbstractControl, FormArray, FormControl, FormGroup } from '../src';
import { asyncValidatorWithoutError, syncValidatorWithError, syncValidatorWithoutError } from './helpers';

describe('AbstractControl', () => {
  const abstractControl = new FormControl(null);

  beforeEach(() => {
    abstractControl.setValidators([]);
    abstractControl.setAsyncValidators([]);
    abstractControl.clearErrors();
  });

  describe('getters', () => {
    it('validators', () => {
      abstractControl.addValidators([syncValidatorWithoutError]);
      expect(abstractControl.validators).toEqual([syncValidatorWithoutError]);
    });

    it('asyncValidators', () => {
      abstractControl.addAsyncValidators([asyncValidatorWithoutError]);
      expect(abstractControl.asyncValidators).toEqual([asyncValidatorWithoutError]);
    });

    it('valid(when control has errors)', () => {
      abstractControl.setErrors({ error: 'text error' })
      expect(abstractControl.valid).toBe(false);
    });

    it('valid (when control has no errors)', () => {
      abstractControl.setErrors({ error: 'text error' });
      abstractControl.clearErrors();
      expect(abstractControl.valid).toBe(true);
    });

    it('errors(when control has errors)', () => {
      abstractControl.setErrors({ error: 'text error' });
      expect(abstractControl.errors).toEqual({ error: 'text error' });
    });

    it('errors(when control has no errors)', () => {
      abstractControl.setErrors({ error: 'text error' });
      abstractControl.clearErrors();
      expect(abstractControl.errors).toEqual({});
    });

    it('dirty', () => {
      expect(abstractControl.dirty).toBe(false);
    });

    it('dirty(after update control value)', () => {
      abstractControl.setValue(1);
      expect(abstractControl.dirty).toBe(true);``
    });
  });

  describe('methods', () => {
    it('hasError', () => {
      abstractControl.setErrors({ errorName: 'error text' });
      expect(abstractControl.hasError('errorName')).toBe(true);
    });

    it('hasErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      expect(abstractControl.hasErrors(['errorName', 'errorName2'])).toBe(true);
    });

    it('hasAnyError', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      expect(abstractControl.hasAnyError(['errorName', 'errorName2'])).toBe(true);
    });

    it('setErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      expect(abstractControl.errors).toEqual({ errorName: 'error text', errorName2: 'error text' });
    });

    it('addErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      abstractControl.addErrors({ errorName3: 'error text' });
      expect(abstractControl.errors).toEqual({ errorName: 'error text', errorName2: 'error text',  errorName3: 'error text' });
    });

    it('getErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      expect(abstractControl.getErrors(['errorName'])).toEqual({ errorName: 'error text' });
    });

    it('removeErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      abstractControl.removeErrors(['errorName2']);
      expect(abstractControl.errors).toEqual({ errorName: 'error text' });
    });

    it('clearErrors', () => {
      abstractControl.setErrors({ errorName: 'error text', errorName2: 'error text' });
      abstractControl.clearErrors();
      expect(abstractControl.errors).toEqual({});
    });

    it('setParent', () => {
      const parent = new FormGroup({});
      abstractControl.setParent(parent);
      expect(abstractControl.parent).toEqual(parent);
    });

    it('setDirty', () => {
      abstractControl.setDirty(true);
      expect(abstractControl.dirty).toBe(true);
    });

    it('updateValidity', () => {
      abstractControl.addValidators([syncValidatorWithError]);
      abstractControl.updateValidity();
      expect(abstractControl.valid).toBe(false);
      expect(abstractControl.errors).toEqual(syncValidatorWithError(abstractControl));
    });
  });
});