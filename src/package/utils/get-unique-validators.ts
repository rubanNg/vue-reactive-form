import type { AbstractControl } from "../lib/abstract-conrol";
import type { AsyncValidationFn, ValidationFn } from "../types";

export function getUniqueValidators(control: AbstractControl, validators: ValidationFn[]) {
  return validators.reduce((uniqueValidators: ValidationFn[], validatorFn) => {
    const exist = control.validators.some(validator => validator === validatorFn);
    return exist ? uniqueValidators : [validatorFn, ...uniqueValidators];
  }, []);
}

export function getUniqueAsyncValidators(control: AbstractControl, validators: AsyncValidationFn[]) {
  return validators.reduce((uniqueValidators: AsyncValidationFn[], validatorFn) => {
    const exist = control.asyncValidators.some(validator => validator === validatorFn);
    return exist ? uniqueValidators : [validatorFn, ...uniqueValidators];
  }, []);
}