import { reactive } from "vue";
import type { ValidationErrors, ValidationFn, AsyncValidationFn, CancelablePromise, ControlUpdateOptions, ReactiveValue } from "../types";
import { getUniqueAsyncValidators, getUniqueValidators } from "../utils";
import type { FormArray } from "./form-array";
import type { FormGroup } from "./form-group";

export abstract class AbstractControl { 
  #errors: ReactiveValue<ValidationErrors> = reactive({ value: {} });
  #parent: ReactiveValue<AbstractControl> = reactive({ value: null });
  #validators: ReactiveValue<ValidationFn[]> = reactive({ value: [] });
  #asyncValidators: ReactiveValue<AsyncValidationFn[]> = reactive({ value: [] });
  #dirty: ReactiveValue<boolean> = reactive({ value: false });
  #hasOwnPendingAsyncValidator: ReactiveValue<boolean> = reactive({ value: false });
  #existingCancelableAsyncValidators: CancelablePromise<ValidationErrors>[] = [];
  
  constructor(validators: ValidationFn[] = [], asyncValidators: AsyncValidationFn[] = []) {
    this.#validators.value = validators;
    this.#asyncValidators.value = asyncValidators;
  }

  get validators(): ValidationFn[] {
    return this.#validators.value;
  }
  
  get asyncValidators(): AsyncValidationFn[] {
    return this.#asyncValidators.value;
  }

  get errors(): ValidationErrors {
    return this.#errors.value;
  }

  get parent(): FormGroup | FormArray {
    return this.#parent.value as (FormGroup | FormArray);
  }

  get dirty(): boolean {
    return this.#dirty.value; 
  }

  get root(): AbstractControl {
    let control: AbstractControl = this;
    while (control?.parent) {
      control = control.parent;
    }
    return control;
  }

  get pending(): boolean {
    return this.#hasOwnPendingAsyncValidator.value;
  }

  setValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    this.#validators.value = validators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    const unique = getUniqueValidators(this, validators);
    this.#validators.value.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeValidators(validators: ValidationFn[], updateValidity: boolean = false): void {
    this.#validators.value = this.#validators.value.filter(validator => {
      return validators.some(s => s === validator || s.name === validator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearValidators(updateValidity: boolean = false): void {
    this.#validators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasValidator(validatorFn: string | ValidationFn): boolean {
    if (typeof validatorFn === 'string') {
      return this.#validators.value.some(validator => validator.name == validatorFn);
    }
    return this.#validators.value.includes(validatorFn as ValidationFn);
  }

  setAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    this.#asyncValidators.value = asyncValidators;
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  addAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    const unique = getUniqueAsyncValidators(this, asyncValidators);
    this.asyncValidators.push(...unique);
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  removeAsyncValidators(asyncValidators: AsyncValidationFn[], updateValidity: boolean = false): void {
    this.#asyncValidators.value = this.asyncValidators.filter(asyncValidator => {
      return asyncValidators.some(s => s === asyncValidator || s.name === asyncValidator.name) ? false : true;
    });
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }
  
  clearAsyncValidators(updateValidity: boolean = false): void {
    this.#asyncValidators.value = [];
    updateValidity && this.updateValidity({ updateParentValidity: updateValidity, runAsyncValidators: false });
  }

  hasAsyncValidator(asyncValidatorFn: string | AsyncValidationFn): boolean {
    if (typeof asyncValidatorFn === 'string') {
      return this.asyncValidators.some(asyncValidator => asyncValidator.name == asyncValidatorFn);
    }
    return this.asyncValidators.includes(asyncValidatorFn as AsyncValidationFn);
  }

  hasError(errorName: string): boolean {
    return errorName in this.#errors.value;
  }

  hasErrors(errorNames: string[]): boolean {
    return errorNames.every(errorName => errorName in this.#errors.value)
  }

  hasAnyError(errorNames: string[]): boolean {
    return errorNames.some(errorName => errorName in this.#errors.value);
  }

  setErrors(errors: ValidationErrors): void {
    this.#errors.value = { ...errors };
  }

  addErrors(errors: ValidationErrors): void {
    this.#errors.value = {
      ...this.#errors.value,
      ...errors
    };
  }

  getErrors(errorNames: string[]): ValidationErrors {
    return errorNames.reduce((errors: ValidationErrors, errorName) => {
      errors[errorName] = this.#errors.value[errorName];
      return errors;
    }, {});
  }

  removeErrors(errorNames: string[]): void {
    const currentErrors = { ...this.#errors.value };
    errorNames.forEach((errorName) => {
      delete currentErrors[errorName];
    });
    this.#errors.value = currentErrors;
  }

  clearErrors(): void {
    this.#errors.value = {};
  }

  setParent(parent: FormGroup | FormArray | null): void {
    this.#parent.value = parent;
  }

  setDirty(value: boolean, updateParentDirty: boolean = false): void {
    this.#dirty.value = value;
    if (this.parent && updateParentDirty) {
      this.parent.setDirty(value, updateParentDirty);
    }
  }

  updateValidity({ updateParentValidity = true, runAsyncValidators = true }: ControlUpdateOptions = {}): void {
    this.#cancelExistingAsyncValidator();

    this.#errors.value = this.#validators.value.reduce((errors: ValidationErrors, validator) => ({
      ...errors,
      ...validator(this),
    }), {}) as ValidationErrors;

    if (this.valid && runAsyncValidators && this.#asyncValidators.value.length > 0) {
      this.#runAsyncValidators();
    }

    if (updateParentValidity) {
      this.parent?.updateValidity({ updateParentValidity, runAsyncValidators });
    }
  }

  #runAsyncValidators() {
    this.#hasOwnPendingAsyncValidator.value = true;

    this.#existingCancelableAsyncValidators = this.#asyncValidators.value.map(asyncValidator => {
      return this.#makeCancelableAsyncValidator(asyncValidator);
    });

    Promise.allSettled(this.#existingCancelableAsyncValidators).then((resultErrors) => {
      const errors = resultErrors.reduce((collectedErrors, error) => {
        console.log(resultErrors);
        if (error.status === 'fulfilled') {
          return { ...collectedErrors, ...error.value }; 
        }
        return collectedErrors;
      }, {} as ValidationErrors);

      this.#hasOwnPendingAsyncValidator.value = false;
      this.#errors.value = errors;
      this.#existingCancelableAsyncValidators = [];
    });
  }

  #makeCancelableAsyncValidator(asyncValidator: AsyncValidationFn) {
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

  #cancelExistingAsyncValidator() {
    this.#existingCancelableAsyncValidators.forEach((asyncValidator) => {
      asyncValidator.cancel();
    });
    this.#hasOwnPendingAsyncValidator.value = false;
  }

  abstract get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
  abstract get value(): unknown;
  abstract get valid(): boolean;
  abstract get invalid(): boolean;
  abstract setValue(value: unknown, options?: ControlUpdateOptions): void;
  abstract reset(): void;
}