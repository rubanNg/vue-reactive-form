import { FormArray, FormGroup } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { find, isAsyncFunction, isPromise, wrapToArray } from "../utils";


enum ControlStatus {
  VALID = "VALID",
  INVALID = "INVALID",
  PENDING = "PENDING"
}

export abstract class AbstractControl {

  private _errors: ValidationErrors = null;
  private _parent: FormGroup | FormArray | null = null;
  private _validators: ValidationFn[] = [];
  private _status: ControlStatus = ControlStatus.VALID;

  get errors(): ValidationErrors  { return this._errors; };
  get validators(): ValidationFn[] { return this._validators; }
  get parent() { return this._parent; }
  get status() {
    if (this._status === ControlStatus.PENDING) return ControlStatus.PENDING;
    return this.valid ? ControlStatus.VALID : ControlStatus.INVALID;
  }

  constructor(validators: ValidationFn[]) {
    this._validators = validators;
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

  hasError(errorName: string) {
    if (!this._errors) return false;
    return errorName in this._errors;
  }

  hasErrors(errorsNames: string[]) {
    if (!this._errors) return false;
    return wrapToArray(errorsNames).every(errorName => errorName in this._errors)
  }

  hasAnyError(errorsNames: string[]) {
    if (!this._errors) return false;
    for (const errorName in errorsNames) {
      if (this._errors[errorName]) return true;
    }
    return false;
  }

  setErrors(errors: ValidationErrors) {
    this._errors = {
      ...this._errors,
      ...errors
    }
  }

  getErrors(errorsNames: string | string[]) {
    if (!this._errors) return false;
    const errors: ValidationErrors = {}
    for (const errorName in wrapToArray(errorsNames)) {
      if (this._errors[errorName]) errors[errorName] = this._errors[errorName];
    }
    return errors;
  }

  clearErrors() {
    this._errors = null;
  }

  validate() {
    let errors: {} = null;
    for (const validator of this.validators) {
      if (isAsyncFunction(validator)) {
        this.executeAsyncValidator(validator);
        continue;
      }
      const error = validator(this) || null;
      if (error !== null) {
        errors = { ...errors, ...error }
      }
    }
    this._errors = errors;
    return this._errors === null;
  }

  setParent(parent: FormGroup | FormArray | null) {
    this._parent = parent;
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

  private executeAsyncValidator(validator: Function) {
    this._status = ControlStatus.PENDING;
    Promise.resolve(validator(this)).then(error => {
      if (error !== null) {
        this._errors = {
          ...this._errors,
          ...error
        }
      }
    }).finally(() => {
      if (this._errors) this._status = ControlStatus.INVALID;
      else this._status = ControlStatus.VALID;
    })
  }

  abstract get(path: string | string[]): AbstractControl | null;
  abstract value: any;
  abstract valid: boolean;
  abstract setValue(value: any): void;
  abstract reset(): void;
}