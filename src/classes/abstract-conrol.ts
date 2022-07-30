import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { findControl, toArray } from "../utils";


export abstract class AbstractControl {

  private _form: ReactiveForm = null;
  private _validators: ValidationFn[] = [];

  get validators(): ValidationFn[] { return this._validators; }
  get form() { return this._form; }

  constructor(validators: ValidationFn[]) {
    this._validators = validators;
  }

  setForm(form: ReactiveForm) {
    this._form = form;
  }

  get(path: string) {
    return findControl(this, path)
  }
  
  setValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = Array.isArray(validators) ? validators : [validators]
  }

  addValidators(validators: ValidationFn | ValidationFn[]) {
    for (const validator of toArray(validators)) {
      if (this._validators.some(s => s === validator || s.name === validator.name)) {
        continue;
      };
      this._validators.push(validator); 
    }
  }

  removeValidators(validators: ValidationFn | ValidationFn[]) {
    const newValidators: ValidationFn[] = [];
    for (const validator of toArray(validators)) {
      if (this._validators.some(s => s === validator || s.name === validator.name)) {
        continue;
      }
      newValidators.push(validator);
    }
    this._validators = newValidators;
  }
  
  clearValidators(): void {
    this._validators = [];
  }
  
  //abstract validators: ValidationFn[]; 
  abstract value: any;
  abstract dirty: boolean;
  abstract valid: boolean;
  abstract parent: AbstractControl | null;
  abstract errors: ValidationErrors | null;
  abstract setValue(value: any): void;
  abstract setDirty(value: boolean): void;
  // abstract setValidators(validators: ValidationFn | ValidationFn[]): void;
  // abstract addValidators(validators: ValidationFn | ValidationFn[]): void;
  // abstract removeValidators(validators: ValidationFn | ValidationFn[]): void;
  // abstract clearValidators(): void;
  abstract hasError(errorCode: string): boolean;
  abstract reset(value: any): void;
}