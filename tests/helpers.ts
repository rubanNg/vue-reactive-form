import { AbstractControl } from "../src";
import { AsyncValidationFn, ValidationErrors, ValidationFn } from "../src/package/types";

export const syncValidatorWithoutError: ValidationFn = (conrtol: AbstractControl) => {
  return null;
}

export const syncValidatorWithError: ValidationFn = (conrtol: AbstractControl) => {
  return controlErrors;
}

export const asyncValidatorWithoutError: AsyncValidationFn = (conrtol: AbstractControl) => {
  return new Promise((resolve) => resolve(null));
}

export const controlErrors = {
  error: 'text error',
  errorName: 'ivalid name',
};


export const nestedValue = {
  firstControl: 666,
  control_0: [
    {
      array_0: null,
      array_1: undefined,
      array_2: { text: 'Text', value: 1, },
    },
    [
      [1, 2, 3],
    ]
  ],
  control_1: [
    [
      [1, 2, 3],
      [
        [1, 2, 3],
      ]
    ]
  ]
} as any;

