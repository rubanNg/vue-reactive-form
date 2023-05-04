import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ReactiveValue, ObjectKey } from "../types";
import { findFormControl } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormGroup<FormGroupControls extends { [K in keyof FormGroupControls]: AbstractControl } = any> extends AbstractControl {
  #currentControls = reactive<ReactiveValue<{ [key: ObjectKey]: AbstractControl }>>({ value: {} });

  constructor(controls: FormGroupControls, validators: ValidationFn[] = [], asyncValidators: AsyncValidationFn[] = []) {
    super(validators, asyncValidators);
    this.#updateCurrentControls(controls, { updateParentValidity: false, runAsyncValidators: false })
  }

  get valid() {
    const hasNoError = Object.keys(this.errors).length === 0;
    const allControlsHasValidState = Object.values(this.#currentControls.value).every((control) => control.valid);

    return hasNoError && allControlsHasValidState;
  }

  get invalid(): boolean {
    return this.valid === false;
  }

  get controls() {
    return this.#currentControls.value as FormGroupControls;
  }

  get value() {
    return Object.entries(this.#currentControls.value).reduce((result, [name, control]) => {
      return {
        ...result,
        [name]: control.value,
      };
    }, {}) as { [K in keyof FormGroupControls]: unknown };
  }

  override get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  addControl(name: ObjectKey, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.#updateCurrentControls({ [name]: control }, { updateParentValidity, runAsyncValidators, updateParentDirty });
    this.setDirty(true, updateParentDirty);
  }

  addControls(controls: { [key: ObjectKey]: AbstractControl }, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.#updateCurrentControls(controls, { updateParentValidity, runAsyncValidators, updateParentDirty });
    this.setDirty(true, updateParentDirty);
  }

  setControl(name: ObjectKey, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    if(this.#isExistsControl(name)) {
      this.#updateCurrentControls({ [name]: control }, { updateParentValidity, runAsyncValidators, updateParentDirty });
      this.setDirty(true, updateParentDirty);
    }
  }

  setControls(controls: { [key: ObjectKey]: AbstractControl }, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    Object.entries(controls).forEach(([name, control]) => {
      this.setControl(name, control, { updateParentValidity, runAsyncValidators, updateParentDirty });
    });
  }
  
  setValue(value: { [key: ObjectKey]: unknown }, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    Object.entries(value).forEach(([key, value]) => {
      this.#currentControls.value[key].setValue(value, { updateParentValidity, runAsyncValidators, updateParentDirty });
    });
  }

  removeControl(name: string, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    delete this.#currentControls.value[name];
    this.#updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(name: ObjectKey): AbstractControl {
    return this.#currentControls.value[name] as TResult;
  }

  contains(controlName: ObjectKey) {
    return controlName in this.#currentControls.value;
  }
  
  reset() {
    Object.values(this.#currentControls.value).forEach((control) => {
      control.reset();
    });
    this.clearErrors();
  }

  #setUpControls(controls: { [ key: ObjectKey ]: AbstractControl }) {
    Object.entries(controls).forEach(([name, control]) => {
      this.#currentControls.value[name] = control;
      this.#currentControls.value[name].setParent(this);
    });
  }

  #updateDynamicProperties() {
    const properties = Object.keys(this.#currentControls.value).reduce((properties, name) => {
      properties[name] = {
        get: () => this.#currentControls.value[name],
        configurable: true,
        enumerable: true,
      }
      return properties;
    }, {} as PropertyDescriptorMap)

    Object.defineProperties(this, properties);
  }

  #updateCurrentControls(controls: { [key: ObjectKey]: AbstractControl }, options: ControlUpdateOptions) {
    this.#setUpControls(controls);
    this.#updateDynamicProperties();
    this.updateValidity({ updateParentValidity: options.updateParentValidity, runAsyncValidators: options.runAsyncValidators });
  }

  #isExistsControl(name: ObjectKey) {
    return name in this.#currentControls.value;
  }
}