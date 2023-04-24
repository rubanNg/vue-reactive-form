import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ReactiveValue } from "../types";
import { findFormControl } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {
  private _controls = reactive<ReactiveValue<AbstractControl[]>>({ value: [] });

  constructor(controls: AbstractControl[],
    validators: ValidationFn[] = [],
    asyncValidators: AsyncValidationFn[] = [],
  ) {
    super(validators, asyncValidators);
    this._controls.value = this._setUpControls(controls);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity: false, runAsyncValidators: false });
  }

  get controls(): AbstractControl[] {
    return this._controls.value as AbstractControl[];
  }

  get value() {
    return this._controls.value.map(control => control.value);
  }

  override get valid() {
    const hasNoError = Object.values(this.errors).length === 0;
    const allControlsHasValidState = Object.values(this._controls.value).every((control) => control.valid);

    return hasNoError && allControlsHasValidState;
  }

  override get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  addControl(control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    control.setParent(this as AbstractControl);
    this._controls.value.push(control);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  addControls(controls: AbstractControl[], { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    controls.forEach((control) => {
      control.setParent(this as AbstractControl);
      this._controls.value.push(control);
    });
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControl(index: number, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    if(!this.at(index)) {
      return;
    };

    this._controls.value[index] = control;
    this._controls.value[index].setParent(this as AbstractControl);
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setValue(values: unknown[], { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}): void {
    this._controls.value.forEach((contol, index) => {
      contol.setValue(values[index], { updateParentValidity, runAsyncValidators });
    });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(index: number): AbstractControl {
    return this._controls.value.at(index) as TResult;
  }

  first<TResult extends AbstractControl>(): AbstractControl {
    return this._controls.value.at(0) as TResult;
  }

  last<TResult extends AbstractControl>(): AbstractControl {
    return this._controls.value.at(-1) as TResult;
  }

  contains(index: number) {
    return !!this.at(index);
  }

  removeAt(index: number, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._controls.value.splice(index, 1);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  reset() {
    for (const control of this._controls.value) {
      control.reset();
    }
    this.clearErrors();
  }

  updateAt(index: number, value: unknown, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.at(index).setValue(value, { updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  private _setUpControls(controls: AbstractControl[]) {
    return controls.map((control) => {
      control.setParent(this);
      return control;
    });
  }

  private updateDynamicProperties() {
    const properties = this._controls.value.reduce((properties, _, index) => {
      properties[index] = {
        get: () => this._controls.value[index],
        configurable: true,
        enumerable: true,
      }
      return properties;
    }, {} as PropertyDescriptorMap)

    Object.defineProperties(this, properties);
  }
}