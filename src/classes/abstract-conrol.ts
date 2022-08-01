import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { find, wrapToArray } from "../utils";


export abstract class AbstractControl {

  private _errors: ValidationErrors = null;
  private _form: ReactiveForm = null;
  private _validators: ValidationFn[] = [];

  get errors(): ValidationErrors  { return this._errors; };
  get validators(): ValidationFn[] { return this._validators; }
  get form() { return this._form; }

  constructor(validators: ValidationFn[]) {
    this._validators = validators;
  }

  setForm(form: ReactiveForm) {
    this._form = form;
  }

  get(path: string) {
    return find<AbstractControl>(this, path)
  }
  
  setValidators(validators: ValidationFn | ValidationFn[], emitValidation: boolean = false) {
    this._validators = wrapToArray(validators);
    emitValidation && this.validate();
  }

  addValidators(validators: ValidationFn | ValidationFn[], emitValidation: boolean = false) {
    const distinct = this.distinctValidators(wrapToArray(validators));
    this._validators.push(...distinct);
    emitValidation && this.validate();
  }

  removeValidators(validators: ValidationFn | ValidationFn[], emitValidation: boolean = false) {
    this._validators = this._validators.filter(validator => {
      return wrapToArray(validators).some(s => s === validator || s.name === validator.name) ? false : true;
    });
    emitValidation && this.validate();
  }
  
  clearValidators(emitValidation: boolean = false) {
    this._validators = [];
    emitValidation && this.validate();
  }

  hasError(error: string, path?: string) {
    if (path) return error in (this.get(path) ? this.get(path)._errors : {});
    return error in (this._errors || {});
  }

  setErrors(errors: ValidationErrors) {
    this._errors = {
      ...this._errors,
      ...errors
    }
  }

  getError(error: string, path?: string) {
    return path ? find<ValidationErrors>(this._errors, path) : this._errors[error] || null;
  }

  validate() {
    let errors: {} = null;
    for (const validator of this.validators) {
      const error = validator(this) || null;
      if (error !== null) {
        errors = { ...errors, ...error }
      }
    }
    this._errors = errors;
    return this._errors === null;
  }

  private distinctValidators (validators: ValidationFn[]) {
    const unique: ValidationFn[] = [];
    for (const validator of wrapToArray(validators)) {
      if (this._validators.some(s => s === validator || s.name === validator.name)) {
        continue;
      }
      unique.push(validator);
    }
    return unique;
  }
  
  abstract value: any;
  abstract dirty: boolean;
  abstract valid: boolean;
  abstract parent: AbstractControl | null;
  abstract setValue(value: any): void;
  abstract setDirty(value: boolean): void;
  abstract reset(): void;
}