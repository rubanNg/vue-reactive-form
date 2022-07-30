import { ValidationErrors, ValidationFn } from "../types";
import { toArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl<TValue> extends AbstractControl<TValue> {


  private _value: TValue = null;
  private _errors: ValidationErrors = null;
  private _validators: ValidationFn[] = [];

  parent: AbstractControl<TValue> = null;
  dirty: boolean = false;


  get validators(): ValidationFn[] {
    return this._validators;
  }

  get errors(): ValidationErrors | null  {
    return this._errors;
  };

  get valid() {
    return this.validate();
  }

  get value() {
    return this._value as TValue;
  }

  set value(value: TValue) {
    this._value = value;
    this.onChange();
  }

  constructor(value?: TValue, validators: ValidationFn[] = []) {
    super();
    this._value = value || null;
    this._validators = validators;
  }

  reset(value: TValue) {
    this.value = value;
  };

  setValue(value: TValue) {
    this.value = value;
  }

  setValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = Array.isArray(validators) ? validators : [validators]
  }

  addValidators(validators: ValidationFn | ValidationFn[]) {
    this.validators.push(...toArray(validators));
  }

  removeValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = this.validators.filter(s => !toArray(validators).includes(s))
  }
  
  clearValidators(): void {
    this._validators = [];
  }
  
  hasError(errorCode: string) {
    return Boolean(this._errors?.hasOwnProperty(errorCode))
  }

  setDirty(value: boolean) {
    this.dirty = value;
  }

  private validate() {
    for (const validator of this.validators) {
      const error = validator(this);
      if (error !== null) {
        this._errors = {
          ...this._errors,
          ...error,
        }
        return false;
      }
    }
    this._errors = null;
    return true;
  }

  private onChange() {
    this.validate();
    !this.dirty && (this.dirty = true);
  }

}

