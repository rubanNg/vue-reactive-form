import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ReactiveValue } from "../types";
import { findFormControl } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {
  #currentControls: ReactiveValue<AbstractControl[]> = reactive({ value: [] });

  constructor(controls: AbstractControl[], validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]) {
    super(validators, asyncValidators);
    this.#updateCurrentControls(controls, { updateParentValidity: false, runAsyncValidators: false });
  }

  get controls(): AbstractControl[] {
    return this.#currentControls.value as AbstractControl[];
  }

  get value(): any[] {
    return this.#currentControls.value.map(control => control.value);
  }

  get valid(): boolean {
    const hasNoError = Object.values(this.errors).length === 0;
    const controls = Object.values(this.#currentControls.value);
    const allControlsHasValidState = controls.every((control) => {
      control.valid;
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
    this.#updateCurrentControls([control], { updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  addControls(controls: AbstractControl[], { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.#updateCurrentControls(controls, { updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControl(index: number, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.#insertControlByIndex(index, control);
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControls(controls: { index: number, control: AbstractControl }[], { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    controls.forEach(({ index, control }) => {
      this.#insertControlByIndex(index, control);
    });
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setValue(values: unknown[], { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}): void {
    this.#currentControls.value.forEach((contol, index) => {
      contol.setValue(values[index], { updateParentValidity, runAsyncValidators });
    });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(index: number): TResult {
    return this.#currentControls.value.at(index) as TResult;
  }

  firstChild<TResult extends AbstractControl>(): TResult {
    return this.#currentControls.value.at(0) as TResult;
  }

  lastChild<TResult extends AbstractControl>(): TResult {
    return this.#currentControls.value.at(-1) as TResult;
  }

  removeAt(index: number, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.#removeControlByIndex(index);
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  reset() {
    for (const control of this.#currentControls.value) {
      control.reset();
    }
    this.clearErrors();
  }

  updateAt(index: number, value: unknown, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this.at(index).setValue(value, { updateParentValidity, runAsyncValidators, updateParentDirty });
  }

  #updateDynamicProperties() {
    const properties = Object.keys(this.#currentControls.value).reduce<PropertyDescriptorMap>((properties, index) => {
      properties[index] = {
        get: () => this.#currentControls.value[parseInt(index)],
        configurable: true,
        enumerable: true,
      }
      return properties;
    }, {})

    Object.defineProperties(this, properties);
  }

  #updateCurrentControls(controls: AbstractControl[], options: ControlUpdateOptions) {
    controls.forEach((control) => {
      control.setParent(this);
    });
    this.#currentControls.value.push(...controls);
    this.#updateDynamicProperties();
    this.updateValidity({ updateParentValidity: options.updateParentValidity, runAsyncValidators: options.runAsyncValidators });
  }

  #insertControlByIndex(index: number, control: AbstractControl) {
    if(this.at(index)) {
      this.#currentControls.value[index] = control;
      this.#currentControls.value[index].setParent(this);
    };
  }

  #removeControlByIndex(index: number) {
    this.#currentControls.value.splice(index, 1);
    this.#updateDynamicProperties();
  }
}