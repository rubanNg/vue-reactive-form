import { reactive } from "vue";
import { FormArray, FormGroup } from "..";
import { AsyncValidatorFn, ControlStatus, ValidationErrors, ValidationFn } from "../types";
import { wrapToArray } from "../utils";

export abstract class AbstractControl { 

  private _errors: { value: ValidationErrors  } = reactive({ value: null });
  private _parent: { value: FormGroup | FormArray | null } = reactive({ value: null });
  private _validators: ValidationFn[] = reactive([]);
  private _asyncValidators: AsyncValidatorFn[] = reactive([]);
  private _status: { value: ControlStatus } = reactive({ value: ControlStatus.VALID });

  get errors(): ValidationErrors  { return this._errors.value; };
  get parent() { return this._parent.value; }
  get status(): ControlStatus { return this._status.value }
  get valid() { return this._status.value === ControlStatus.VALID; }
  get root(): AbstractControl {
    let control: AbstractControl = this;
    while (control._parent) {
      control = control._parent as AbstractControl;
    }
    return control;
  }


  constructor(validators: ValidationFn[], asyncValidators: AsyncValidatorFn[]) {
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }
  
  setValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    this._validators = wrapToArray(validators);
    updateValidity && this.updateValidity();
  }

  addValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    const distinct = this.distinctValidators(wrapToArray(validators));
    this._validators.push(...distinct);
    updateValidity && this.updateValidity();
  }

  removeValidators(validators: ValidationFn | ValidationFn[], updateValidity: boolean = false) {
    this._validators = this._validators.filter(validator => {
      return wrapToArray(validators).some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity();
  }
  
  clearValidators(updateValidity: boolean = false) {
    this._validators = [];
    updateValidity && this.updateValidity();
  }

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
    this.updateControlsStatus();
  }

  addErrors(error: ValidationErrors) {
    this._errors.value = {
      ...this._errors.value,
      ...error
    };
    this.updateControlsStatus();

  }

  getErrors(errorsNames: string | string[]) {
    if (!this._errors.value) return false;
    const errors: ValidationErrors = {}
    for (const errorName in wrapToArray(errorsNames)) {
      if (this._errors?.value[errorName]) errors[errorName] = this._errors.value[errorName];
    }
    return errors;
  }

  removeErrors(errorsNames: string | string[], emitValidation: boolean = false) {
    if (!this._errors.value) return false;
    for (const error of errorsNames) {
      if (this._errors.value[error]) delete this._errors.value;
    }
    if (Object.keys(this._errors.value).length === 0) this._errors.value = null;
    emitValidation && this.updateValidity();
  }

  clearErrors() {
    this._errors.value = null;
    this.updateControlsStatus();
  }

  /**
   * @param value control value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  updateValidity(onlySelf?: boolean) {
    let errors: {} = null;
    for (const validator of this._validators) {
      const validationError = validator(this) || null;
      if (validationError !== null) {
        errors = { ...errors, ...validationError }
      }
    }
    this.setErrors(errors);
    this._status.value = this.calculateStatus();
    //if (this._status.value === ControlStatus.VALID) { this.runAsyncValidators(); }
    this._parent.value?.updateValidity(onlySelf);
  }

  setParent(parent: FormGroup | FormArray | null) {
    this._parent.value = parent;
  }

  updateControlsStatus() {
    this._status.value = this.calculateStatus();
    (this._parent.value as AbstractControl)?.updateControlsStatus();
  }

  private runAsyncValidators() {
    this._status.value = ControlStatus.PENDING;
    Promise.allSettled(this._asyncValidators.map(validator => validator(this))).then((validationResult) => {
      let errors: ValidationErrors = {};
      for (const result of validationResult) {
        if (result.status === 'rejected') {
          console.warn(`one or more validators were rejected`);
          continue;
        }
        errors = { ...errors, ...result.value, }
      }
      this.setErrors(errors);
      this.calculateStatus();
    });
  }

  private calculateStatus() {
    if (this._errors.value) return ControlStatus.INVALID;
    else return ControlStatus.VALID;
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
  abstract value: any;
  abstract setValue(value: any, onlySelf?: boolean): void;
  abstract reset(): void;
}