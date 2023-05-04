import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ReactiveValue } from "../types";
import { findFormControl } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {
  private readonly _controls: ReactiveValue<AbstractControl[]> = reactive({ value: [] });

  constructor(controls: AbstractControl[], validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]) {
    super(validators, asyncValidators);
    this._updateCurrentControls(controls, { updateParentValidity: false, runAsyncValidators: false });
  }

  get controls(): AbstractControl[] {
    return this._controls.value as AbstractControl[];
  }

  get value(): any[] {
    return this._controls.value.map(control => control.value);
  }

  get valid(): boolean {
    const hasNoError = Object.values(this.errors).length === 0;
    const controls = Object.values(this._controls.value);
    const allControlsHasValidState = controls.every((control) => {
      return control.valid;
    });

    return hasNoError && allControlsHasValidState;
  }

  get invalid(): boolean {
    return this.valid === false;
  }

  get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  addControl(control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._updateCurrentControls([control], { updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  addControls(controls: AbstractControl[], { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._updateCurrentControls(controls, { updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControl(index: number, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._insertControlByIndex(index, control);
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControls(controls: { index: number, control: AbstractControl }[], { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    controls.forEach(({ index, control }) => {
      this._insertControlByIndex(index, control);
    });
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setValue(values: unknown[], { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}): void {
    this._controls.value.forEach((contol, index) => {
      contol.setValue(values[index], { updateParentValidity, runAsyncValidators });
    });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(index: number): TResult {
    return this._controls.value.at(index) as TResult;
  }

  firstChild<TResult extends AbstractControl>(): TResult {
    return this._controls.value.at(0) as TResult;
  }

  lastChild<TResult extends AbstractControl>(): TResult {
    return this._controls.value.at(-1) as TResult;
  }

  removeAt(index: number, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._removeControlByIndex(index);
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
    this.at(index).setValue(value, { updateParentValidity, runAsyncValidators, updateParentDirty });
  }

  private _updateDynamicProperties() {
    const properties = Object.keys(this._controls.value).reduce<PropertyDescriptorMap>((properties, index) => {
      properties[index] = {
        get: () => this._controls.value[parseInt(index)],
        configurable: true,
        enumerable: true,
      }
      return properties;
    }, {})

    Object.defineProperties(this, properties);
  }

  private _updateCurrentControls(controls: AbstractControl[], options: ControlUpdateOptions) {
    controls.forEach((control) => {
      control.setParent(this);
    });
    this._controls.value.push(...controls);
    this._updateDynamicProperties();
    this.updateValidity({ updateParentValidity: options.updateParentValidity, runAsyncValidators: options.runAsyncValidators });
  }

  private _insertControlByIndex(index: number, control: AbstractControl) {
    if(this.at(index)) {
      this._controls.value[index] = control;
      this._controls.value[index].setParent(this);
    };
  }

  private _removeControlByIndex(index: number) {
    this._controls.value.splice(index, 1);
    this._updateDynamicProperties();
  }
}