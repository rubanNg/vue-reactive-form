import { AbstractControl } from "../src";
import { AsyncValidationFn, ValidationErrors, ValidationFn } from "../src/package/types";

export const syncValidatorWithoutError: ValidationFn = (conrtol: AbstractControl) => {
  return null;
}

export const syncValidatorWithError: ValidationFn = (conrtol: AbstractControl) => {
  return { errorName: 'error text' };
}

export const asyncValidatorWithoutError: AsyncValidationFn = (conrtol: AbstractControl) => {
  return new Promise((resolve) => resolve(null));
}

