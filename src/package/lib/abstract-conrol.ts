import { reactive } from "vue";
import type { ValidationErrors, ValidationFn, AsyncValidationFn, CancelablePromise, ControlUpdateOptions, ReactiveValue } from "../types";
import { getUniqueAsyncValidators, getUniqueValidators } from "../utils";
import type { FormArray } from "./form-array";
import type { FormGroup } from "./form-group";

export abstract class AbstractControl { 
  private readonly _errors: ReactiveValue<ValidationErrors> = reactive({ value: {} });
  private readonly _parent: ReactiveValue<AbstractControl> = reactive({ value: null });
  private readonly _validators: ReactiveValue<ValidationFn[]> = reactive({ value: [] });
  private readonly _asyncValidators: ReactiveValue<AsyncValidationFn[]> = reactive({ value: [] });
  private readonly _dirty: ReactiveValue<boolean> = reactive({ value: false });
  private readonly _hasOwnPendingAsyncValidator: ReactiveValue<boolean> = reactive({ value: false });
  private _existingCancelableAsyncValidators: CancelablePromise<ValidationErrors>[] = [];
  
  constructor(validators: ValidationFn[] = [], asyncValidators: AsyncValidationFn[] = []) {
    this._validators.value = validators;
    this._asyncValidators.value = asyncValidators;
  }

  get validators(): ValidationFn[] {
    return this._validators.value;
  }
  
  get asyncValidators(): AsyncValidationFn[] {
    return this._asyncValidators.value;
  }

  get errors(): ValidationErrors {
    return this._errors.value;
  }

  get parent(): FormGroup | FormArray {
    return this._parent.value as (FormGroup | FormArray);
  }

  get dirty(): boolean {
    return this._dirty.value; 
  }

  get root(): AbstractControl {
    let control: AbstractControl = this;
    while (control?.parent) {
      control = control.parent;
    }
    return control;
  }

  get pending(): boolean {
    return this._hasOwnPendingAsyncValidator.value;
  }

  setValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    this._validators.value = validators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    const unique = getUniqueValidators(this, validators);
    this._validators.value.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    this._validators.value = this._validators.value.filter(validator => {
      return validators.some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearValidators(updateValidity: boolean = false): void {
    this._validators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasValidator(validatorFn: string | ValidationFn): boolean {
    if (typeof validatorFn === 'string') {
      return this._validators.value.some(validator => validator.name == validatorFn);
    }
    return this._validators.value.includes(validatorFn as ValidationFn);
  }

  setAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    this._asyncValidators.value = asyncValidators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    const unique = getUniqueAsyncValidators(this, asyncValidators);
    this.asyncValidators.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    this._asyncValidators.value = this.asyncValidators.filter(asyncValidator => {
      return asyncValidators.some(s => s === asyncValidator || s.name === asyncValidator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearAsyncValidators(updateValidity: boolean = false): void {
    this._asyncValidators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasAsyncValidator(asyncValidatorFn: string | AsyncValidationFn): boolean {
    if (typeof asyncValidatorFn === 'string') {
      return this.asyncValidators.some(asyncValidator => asyncValidator.name == asyncValidatorFn);
    }
    return this.asyncValidators.includes(asyncValidatorFn as AsyncValidationFn);
  }

  hasError(errorName: string): boolean {
    return errorName in this._errors.value;
  }

  hasErrors(errorNames: string[]): boolean {
    return errorNames.every(errorName => errorName in this._errors.value)
  }

  hasAnyError(errorNames: string[]): boolean {
    return errorNames.some(errorName => errorName in this._errors.value);
  }

  setErrors(errors: ValidationErrors): void {
    this._errors.value = { ...errors };
  }

  addErrors(errors: ValidationErrors): void {
    this._errors.value = {
      ...this._errors.value,
      ...errors
    };
  }

  getErrors(errorNames: string[]): ValidationErrors {
    return errorNames.reduce((errors: ValidationErrors, errorName) => {
      errors[errorName] = this._errors.value[errorName];
      return errors;
    }, {});
  }

  removeErrors(errorNames: string[]): void {
    const currentErrors = { ...this._errors.value };
    errorNames.forEach((errorName) => {
      delete currentErrors[errorName];
    });
    this._errors.value = currentErrors;
  }

  clearErrors(): void {
    this._errors.value = {};
  }

  setParent(parent: FormGroup | FormArray | null): void {
    this._parent.value = parent;
  }

  setDirty(value: boolean, updateParentDirty: boolean = false): void {
    this._dirty.value = value;
    if (this.parent && updateParentDirty) {
      this.parent.setDirty(value, updateParentDirty);
    }
  }

  updateValidity({ updateParentValidity = true, runAsyncValidators = true }: ControlUpdateOptions = {}): void {
    this._cancelExistingAsyncValidator();

    const errors = this.validators.reduce((errors: ValidationErrors, validator) => ({
      ...errors,
      ...validator(this),
    }), {}) as ValidationErrors;

    this.setErrors(errors);

    if (this.valid && runAsyncValidators && this.asyncValidators.length > 0) {
      this._runAsyncValidators();
    }

    if (updateParentValidity) {
      this.parent?.updateValidity({ updateParentValidity, runAsyncValidators });
    }
  }

  private _runAsyncValidators() {
    this._hasOwnPendingAsyncValidator.value = true;

    this._existingCancelableAsyncValidators = this.asyncValidators.map(asyncValidator => {
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
      this.setErrors(errors);
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

  abstract get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
  abstract get value(): unknown;
  abstract get valid(): boolean;
  abstract get invalid(): boolean;
  abstract setValue(value: unknown, options?: ControlUpdateOptions): void;
  abstract reset(): void;
}