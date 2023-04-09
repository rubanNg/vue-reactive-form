import { reactive } from "vue";
import type { ValidationErrors, ValidationFn, AsyncValidationFn, CancelablePromise, ControlUpdateOptions } from "../types";
import { getUniqueAsyncValidators, getUniqueValidators } from "../utils/get-unique-validators";
import type { FormArray } from "./form-array";
import type { FormGroup } from "./form-group";

export abstract class AbstractControl { 
  private _errors = reactive<ValidationErrors>({});
  private _parent = reactive(null);
  private _validators = reactive<ValidationFn[]>([]);
  private _asyncValidators = reactive<AsyncValidationFn[]>([]);
  private _dirty = reactive<{ value: boolean }>({ value: false });
  private _hasOwnPendingAsyncValidator = reactive<{ value: boolean }>({ value: false });
  private _cancelableExistingAsyncValidators: CancelablePromise<ValidationErrors>[] = [];
  
  constructor(validators: ValidationFn[], asyncValidators: AsyncValidationFn[]) {
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }

  get validators() {
    return this._validators;
  }
  
  get asyncValidators() {
    return this._asyncValidators;
  }

  get valid() {
    return Object.values(this._errors).length === 0;
  }

  get invalid() {
    return !this.valid;
  }

  get errors() {
    return this._errors;
  }

  get parent(): FormArray | FormGroup | null {
    return this._parent;
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
    this._validators = validators;
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  addValidators(validators: ValidationFn[], updateValidity: boolean = false) {
    const unique = getUniqueValidators(this, validators);
    this._validators.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  removeValidators(validators: ValidationFn[], updateValidity: boolean = false) {
    this._validators = this._validators.filter(validator => {
      return validators.some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }
  
  clearValidators(updateValidity: boolean = false) {
    this._validators = [];
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  hasValidator(validatorFn: string | ValidationFn) {
    if (typeof validatorFn === 'string') {
      return this._validators.some(validator => validator.name == validatorFn);
    }
    return this._validators.includes(validatorFn as ValidationFn);
  }

  setAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    this._asyncValidators = asyncValidators;
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  addAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    const unique = getUniqueAsyncValidators(this, asyncValidators);
    this.asyncValidators.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  removeAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false) {
    this._asyncValidators = this.asyncValidators.filter(asyncValidator => {
      return asyncValidators.some(s => s === asyncValidator || s.name === asyncValidator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }
  
  clearAsyncValidators(updateValidity: boolean = false) {
    this._asyncValidators = [];
    updateValidity && this.updateValidity({ updateParentValidity: false });
  }

  hasAsyncValidator(asyncValidatorFn: string | AsyncValidationFn) {
    if (typeof asyncValidatorFn === 'string') {
      return this.asyncValidators.some(asyncValidator => asyncValidator.name == asyncValidatorFn);
    }
    return this.asyncValidators.includes(asyncValidatorFn as AsyncValidationFn);
  }

  hasError(errorName: string) {
    return errorName in this._errors;
  }

  hasErrors(errorsNames: string[]) {
    return errorsNames.every(errorName => errorName in this._errors)
  }

  hasAnyError(errorsNames: string[]) {
    for (const errorName in errorsNames) {
      if (errorName in this._errors) return true;
    }
    return false;
  }

  setErrors(errors: ValidationErrors) {
    this._errors = { ...errors };
  }

  addErrors(errors: ValidationErrors) {
    this._errors = {
      ...this._errors,
      ...errors
    };
  }

  getErrors(errorsNames: string[]): ValidationErrors {
    return errorsNames.reduce((errors: ValidationErrors, errorName) => {
      errors[errorName] = this._errors[errorName];
      return errors;
    }, {});
  }

  removeErrors(errorsNames: string[]): void {
    this._errors = Object.keys(this._errors).reduce((errors: ValidationErrors, errorName) => {
      if (!errorsNames.includes(errorName)) {
        errors[errorName] = this._errors[errorName];
      }
      return errors;
    }, {});
  }

  clearErrors() {
    this._errors = {};
  }

  get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return null;
  }

  setParent(parent: AbstractControl) {
    this._parent = parent;
  }

  setDirty(value: boolean, options: ControlUpdateOptions = { updateParentValidity: true }) {
    this._dirty.value = value;
    if (this.parent && options.updateParentValidity) {
      this.parent.setDirty(value, options);
    }
  }

  updateValidity(options: ControlUpdateOptions = { updateParentValidity: true }) {
    this._cancelExistingAsyncValidator();

    this._errors = this._validators.reduce((errors: ValidationErrors, validator) =>  ({
      ...errors,
      ...this._runValidator(validator),
    }), {});

    if (this.valid) {
      this._runAsyncValidators();
    }

    if (this.parent && options.updateParentValidity) {
      this.parent.updateValidity(options);
    }
  }

  private _runValidator(validator: ValidationFn) {
    return validator(this);
  }

  private _runAsyncValidators() {
    this._hasOwnPendingAsyncValidator.value = true;

    this._cancelableExistingAsyncValidators = this._asyncValidators.map(validator => {
      return this._makeCancelableAsyncValidator(validator);
    });

    Promise.allSettled(this._cancelableExistingAsyncValidators).then((resultErrors) => {
      const errors = resultErrors.reduce((collectedErrors, error) => {
        if (error.status === 'fulfilled') {
          this._hasOwnPendingAsyncValidator.value = false;
          return { ...collectedErrors, ...error.value }; 
        }

        return collectedErrors;
      }, {});

      this.addErrors(errors);
    });
  }

  private _makeCancelableAsyncValidator(asyncValidator: AsyncValidationFn) {
    const abortController = new globalThis.AbortController();
    
    const promise = new Promise((resolve, reject) => {
      abortController.signal.addEventListener('abort', () => {
        reject({});
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
    this._cancelableExistingAsyncValidators.forEach((asyncValidator) => {
      asyncValidator.cancel();
    });
    this._hasOwnPendingAsyncValidator.value = false;
  }

  abstract get value();
  abstract set value(value: any);
  abstract setValue(value: any, options: ControlUpdateOptions): void;
  abstract reset(): void;
}