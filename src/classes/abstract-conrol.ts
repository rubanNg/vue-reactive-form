import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";


export abstract class AbstractControl {

  constructor() {}


  abstract validators: ValidationFn[]; 
  abstract value: any;
  abstract dirty: boolean;
  abstract valid: boolean;
  abstract form: ReactiveForm<any> | null;
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