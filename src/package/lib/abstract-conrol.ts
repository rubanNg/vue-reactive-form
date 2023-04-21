import { reactive } from "vue";
import type { ValidationErrors, ValidationFn, AsyncValidationFn, CancelablePromise, ControlUpdateOptions, ReactiveValue } from "../types";
import { getUniqueAsyncValidators, getUniqueValidators } from "../utils/get-unique-validators";
import type { FormArray } from "./form-array";
import type { FormGroup } from "./form-group";

export abstract class AbstractControl { 
  private _errors = reactive<ReactiveValue<ValidationErrors>>({ value: {} });
  private _parent = reactive<ReactiveValue<AbstractControl>>({ value: null });
  private _validators = reactive<ReactiveValue<ValidationFn[]>>({ value: [] });
  private _asyncValidators = reactive<ReactiveValue<AsyncValidationFn[]>>({ value: [] });
  private _dirty = reactive<ReactiveValue<boolean>>({ value: false });
  private _hasOwnPendingAsyncValidator = reactive<ReactiveValue<boolean>>({ value: false });
  private _existingCancelableAsyncValidators: CancelablePromise<ValidationErrors>[] = [];
  
  constructor(validators: ValidationFn[], asyncValidators: AsyncValidationFn[]) {
    this._validators.value = validators;
    this._asyncValidators.value = asyncValidators;
  }

  get validators() {
    return this._validators.value;
  }
  
  get asyncValidators() {
    return this._asyncValidators.value;
  }

  get valid() {
    return Object.keys(this._errors.value).length === 0;
  }

  get invalid() {
    return this.valid === false;
  }

  get errors() {
    return this._errors.value;
  }

  get parent(): FormArray | FormGroup | null {
    return this._parent.value as (FormArray | FormGroup | null);
  }

  get dirty() {
    return this._dirty.value; 
  }

  get root() {
    let control: AbstractControl = this;
    while (control?.parent) {
      control = control.parent;
    }
    return control;
  }

  get pending() {
    return this._hasOwnPendingAsyncValidator.value;
  }

  setValidators(validators: ValidationFn[], updateValidity: boolean = false) {
    this._validators.value = validators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addValidators(validators: ValidationFn[], updateValidity: boolean = false) {
    const unique = getUniqueValidators(this, validators);
    this._validators.value.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeValidators(validators: ValidationFn[], updateValidity: boolean = false) {
    this._validators.value = this._validators.value.filter(validator => {
      return validators.some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearValidators(updateValidity: boolean = false) {
    this._validators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasValidator(validatorFn: string | ValidationFn) {
    if (typeof validatorFn === 'string') {
      return this._validators.value.some(validator => validator.name == validatorFn);
    }
    return this._validators.value.includes(validatorFn as ValidationFn);
  }

  setAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    this._asyncValidators.value = asyncValidators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    const unique = getUniqueAsyncValidators(this, asyncValidators);
    this.asyncValidators.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    this._asyncValidators.value = this.asyncValidators.filter(asyncValidator => {
      return asyncValidators.some(s => s === asyncValidator || s.name === asyncValidator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearAsyncValidators(updateValidity: boolean = false) {
    this._asyncValidators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasAsyncValidator(asyncValidatorFn: string | AsyncValidationFn) {
    if (typeof asyncValidatorFn === 'string') {
      return this.asyncValidators.some(asyncValidator => asyncValidator.name == asyncValidatorFn);
    }
    return this.asyncValidators.includes(asyncValidatorFn as AsyncValidationFn);
  }

  hasError(errorName: string) {
    return errorName in this._errors.value;
  }

  hasErrors(errorsNames: string[]) {
    return errorsNames.every(errorName => errorName in this._errors.value)
  }

  hasAnyError(errorsNames: string[]) {
    return errorsNames.some(errorName => errorName in this._errors.value);
  }

  setErrors(errors: ValidationErrors) {
    this._errors.value = { ...errors };
  }

  addErrors(errors: ValidationErrors) {
    this._errors.value = {
      ...this._errors.value,
      ...errors
    };
  }

  getErrors(errorsNames: string[]): ValidationErrors {
    return errorsNames.reduce((errors: ValidationErrors, errorName) => {
      errors[errorName] = this._errors.value[errorName];
      return errors;
    }, {});
  }

  removeErrors(errorsNames: string[]): void {
    this._errors.value = Object.keys(this._errors.value).reduce((errors: ValidationErrors, errorName) => {
      if (!errorsNames.includes(errorName)) {
        errors[errorName] = this._errors.value[errorName];
      }
      return errors;
    }, {});
  }

  clearErrors() {
    this._errors.value = {};
  }

  get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return null;
  }

  setParent(parent: AbstractControl) {
    this._parent.value = parent;
  }

  setDirty(value: boolean, updateParentDirty: boolean = false) {
    this._dirty.value = value;
    if (this.parent && updateParentDirty) {
      this.parent.setDirty(value, updateParentDirty);
    }
  }

  updateValidity({ updateParentValidity = true, runAsyncValidators = true }: ControlUpdateOptions = {}) {
    this._cancelExistingAsyncValidator();

    this._errors.value = this._validators.value.reduce((errors: ValidationErrors, validator) => ({
      ...errors,
      ...validator(this),
    }), {});

    if (this.valid && runAsyncValidators) {
      this._runAsyncValidators();
    }

    if (updateParentValidity) {
      this.parent?.updateValidity({ updateParentValidity, runAsyncValidators });
    }
  }

  private _runAsyncValidators() {
    this._hasOwnPendingAsyncValidator.value = true;

    this._existingCancelableAsyncValidators = this._asyncValidators.value.map(asyncValidator => {
      return this._makeCancelableAsyncValidator(asyncValidator);
    });

    Promise.allSettled(this._existingCancelableAsyncValidators).then((resultErrors) => {
      const errors = resultErrors.reduce((collectedErrors, error) => {
        console.log(resultErrors);
        if (error.status === 'fulfilled') {
          return { ...collectedErrors, ...error.value }; 
        }
        return collectedErrors;
      }, {} as ValidationErrors);

      this._hasOwnPendingAsyncValidator.value = false;
      this._errors.value = errors;
      this._existingCancelableAsyncValidators = [];
    });
  }

  private _makeCancelableAsyncValidator(asyncValidator: AsyncValidationFn) {
    const abortController = new AbortController();
    
    const promise = new Promise((resolve, reject) => {
      abortController.signal.addEventListener('abort', () => {
        reject(null);
      });

      asyncValidator(this, abortController).then((error) => {
        resolve(error);
      });
    }) as CancelablePromise<ValidationErrors>;

    promise.cancel = () => {
      abortController.abort();
    };

    return promise;
  }

  private _cancelExistingAsyncValidator() {
    this._existingCancelableAsyncValidators.forEach((asyncValidator) => {
      asyncValidator.cancel();
    });
    this._hasOwnPendingAsyncValidator.value = false;
  }

  abstract get value(): unknown;
  abstract setValue(value: unknown, options?: ControlUpdateOptions): void;
  abstract reset(): void;
}