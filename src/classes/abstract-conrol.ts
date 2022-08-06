import { reactive } from "vue";
import { FormArray, FormGroup } from "..";
import { AsyncValidatorFn, ControlStatus, ValidationErrors, ValidationFn } from "../types";
import { wrapToArray } from "../utils";

export abstract class AbstractControl { 

  private _errors: { value: ValidationErrors  } = reactive({ value: null });
  private _parent: { value: FormGroup | FormArray | null } = reactive({ value: null });
  private _validators: ValidationFn[] = reactive([]);
  private _asyncValidators: AsyncValidatorFn[] = reactive([]);
  private _dirty: { value: boolean } = reactive({ value: false }) 

  get errors(): ValidationErrors  { return this._errors.value; };
  get parent() { return this._parent.value; }
  get dirty() { return this._dirty.value; }
  get valid() { return this._isValidControl(); }
  get root(): AbstractControl {
    let control: AbstractControl = this;
    while (control._parent) { control = control._parent as AbstractControl;}
    return control;
  }

  constructor(validators: ValidationFn[], asyncValidators: AsyncValidatorFn[]) {
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }
  
  /**
   * 
   * @param validators validators
   * @param updateValidity if true, control will be rechecked, default false
   */
  setValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    this._validators = wrapToArray(validators);
    updateValidity && this.updateValidity();
  }

  /**
   * 
   * @param validators validators
   * @param updateValidity if true, control will be rechecked, default false
   */
  addValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    const distinct = this.distinctValidators(wrapToArray(validators));
    this._validators.push(...distinct);
    updateValidity && this.updateValidity();
  }

  /**
   * 
   * @param validators validators
   * @param updateValidity if true, control will be rechecked, default false
   */
  removeValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    this._validators = this._validators.filter(validator => {
      return wrapToArray(validators).some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity();
  }
  
  /**
   * 
   * @param updateValidity if true, control will be rechecked, default false
   */
  clearValidators(updateValidity: boolean = false) {
    this._validators = [];
    updateValidity && this.updateValidity();
  }

  /**
   * 
   * @param updateValidity if true, control will be rechecked, default false
   */
  clearAsyncValidators(updateValidity: boolean = false) {
    this._asyncValidators = [];
    updateValidity && this.updateValidity();
  }

  hasValidator(validator: string | ValidationFn | AsyncValidatorFn) {
    if (typeof validator === 'string') return this._validators.some(s => s.name == validator);
    else return this._validators.includes(validator as ValidationFn) || this._asyncValidators.includes(validator as AsyncValidatorFn) ;
  }

  hasError(errorName: string) {
    if (!this._errors.value) return false;
    return errorName in this._errors.value;
  }

  hasErrors(errorsNames: string[]) {
    if (!this._errors.value) return false;
    return wrapToArray(errorsNames).every(errorName => errorName in this._errors.value)
  }

  hasAnyError(errorsNames: string[]) {
    if (!this._errors.value) return false;
    for (const errorName in errorsNames) {
      if (this._errors.value[errorName]) return true;
    }
    return false;
  }

  setErrors(errors: ValidationErrors) {
    this._errors.value = errors;
  }

  addErrors(errors: ValidationErrors) {
    this._errors.value = {
      ...this._errors.value,
      ...errors
    };
  }

  getErrors(errorsNames: string | string[]) {
    if (!this._errors.value) return false;
    const errors: ValidationErrors = {}
    for (const errorName in wrapToArray(errorsNames)) {
      if (this._errors?.value[errorName]) errors[errorName] = this._errors.value[errorName];
    }
    return errors;
  }

  removeErrors(errorsNames: string | string[]) {
    if (!this._errors.value) return;
    for (const error of errorsNames) {
      delete this._errors.value[error];
    }
    if (Object.keys(this._errors.value).length === 0) this._errors.value = null;
  }

  clearErrors() {
    this._errors.value = null;
  }


  /**
   * @param options `onlySelf`  When true, each change only affects this control, and not its parent. Default is false. 
   */
  updateValidity(options: { onlySelf?: boolean } = {}) {
    let errors: {} = null;
    for (const validator of this._validators) {
      const validationError = validator(this) || null;
      console.log([
        { 
          CONTROL: this, 
          function: validator,
          result: validationError,
          erros: this._errors.value 
        }
      ])
      if (validationError !== null) {
        errors = { ...errors, ...validationError }
      }
    }
    this.setErrors(errors);
    //this._status.value = this._calculateStatus();
    //async validatords todo
    //if (this._status.value === ControlStatus.VALID) { this.runAsyncValidators(); }
    //async validatords
    if (this._parent.value && !options.onlySelf) {
      this._parent.value.updateValidity(options);
    }
  }

  setParent(parent: FormGroup | FormArray | null) {
    this._parent.value = parent;
  }

  setDirty(value: boolean, options: { onlySelf?: boolean } = {}) {
    this._dirty.value = value;
    this._parent.value?.setDirty(value, options);
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

  abstract get(path: string | string[]): AbstractControl | null;
  abstract get value(): any;
  abstract set value(v: any);
  abstract _isValidControl(): boolean;
  abstract setValue(value: any, onlySelf?: boolean): void;
  abstract reset(): void;
}