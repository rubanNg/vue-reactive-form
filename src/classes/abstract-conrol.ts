import { ValidationErrors, ValidationFn } from "../types";


export abstract class AbstractControl<TValue> {

  constructor() {}


  abstract validators: ValidationFn[]; 
  abstract value: TValue;
  abstract dirty: boolean;
  abstract valid: boolean;
  abstract parent: AbstractControl<TValue> | null;
  abstract errors: ValidationErrors | null;
  abstract setValue(value: any): void;
  abstract setDirty(value: boolean): void;
  abstract setValidators(validators: ValidationFn | ValidationFn[]): void;
  abstract addValidators(validators: ValidationFn | ValidationFn[]): void;
  abstract removeValidators(validators: ValidationFn | ValidationFn[]): void;
  abstract clearValidators(): void;
  abstract hasError(errorCode: string): boolean;
  abstract reset(value: any): void;
}