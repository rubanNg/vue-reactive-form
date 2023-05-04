import type { AbstractControl } from "../lib/abstract-conrol";
import type { AsyncValidationFn, ValidationFn } from "../types";
export declare function getUniqueValidators(control: AbstractControl, validators: ValidationFn[]): ValidationFn[];
export declare function getUniqueAsyncValidators(control: AbstractControl, validators: AsyncValidationFn[]): AsyncValidationFn[];
