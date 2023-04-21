import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ReactiveValue } from "../types";
import { findFormControl } from "../utils/find-form-control";
import { AbstractControl } from "./abstract-conrol";

export class FormGroup extends AbstractControl {
  private _controls = reactive<ReactiveValue<{ [key: string]: AbstractControl }>>({ value: {} });

  constructor(controls: { [ key: string ]: AbstractControl },
    validators: ValidationFn[] = [],
    asyncValidators: AsyncValidationFn[] = [],
  ) {
    super(validators, asyncValidators);
    this._setUpControls(controls);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity: false, runAsyncValidators: false });
  }

  override get valid() {
    const hasNoError = Object.keys(this.errors).length === 0;
    const allControlsHasValidState = Object.values(this._controls.value).every((control) => control.valid);

    return hasNoError && allControlsHasValidState;
  }

  get controls() {
    return this._controls.value;
  }

  get value() {
    return Object.entries(this._controls.value).reduce((result: { [key: string]: unknown }, [name, control]) => {
      return {
        ...result,
        [name]: control.value,
      };
    }, {});
  }

  addControl(name: string, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._setUpControls({ [name]: control });
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  override get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  setControl(name: string, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    if(!(name in this._controls.value)) {
      return;
    }

    this._setUpControls({ [name]: control });
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }
  
  setValue(value: { [key: string]: unknown }, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    Object.entries(value).forEach(([key, value]) => {
      this._controls.value[key].setValue(value, { updateParentValidity, runAsyncValidators, updateParentDirty });
    });
  }

  removeControl(name: string, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    delete this._controls.value[name];
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(name: string): AbstractControl {
    return this._controls.value[name] as TResult;
  }

  contains(controlName: string) {
    return controlName in this._controls.value;
  }
  
  reset() {
    Object.values(this._controls.value).forEach((control) => {
      control.reset();
    });
    this.clearErrors();
  }

  private _setUpControls(controls: { [ key: string ]: AbstractControl }) {
    Object.entries(controls).forEach(([name, control]) => {
      this._controls.value[name] = control;
      this._controls.value[name].setParent(this);
    });
  }

  private updateDynamicProperties() {
    const properties = Object.keys(this._controls.value).reduce((properties, name) => {
      properties[name] = {
        get: () => this._controls.value[name],
        configurable: true,
        enumerable: true,
      }
      return properties;
    }, {} as PropertyDescriptorMap)

    Object.defineProperties(this, properties);
  }
}