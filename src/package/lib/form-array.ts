import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions } from "../types";
import { findFormControl } from "../utils/find-form-control";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {
  private _controls: AbstractControl[] = reactive([]);

  constructor(controls: AbstractControl[],
    validators: ValidationFn[] = [],
    asyncValidators: AsyncValidationFn[] = [],
  ) {
    super(validators, asyncValidators);
    this._controls = this._setUpControls(controls);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity: false, runAsyncValidators: false });
  }

  get controls(): AbstractControl[] {
    return this._controls;
  }

  get value(): any[] {
    return this._controls.map(control => control.value);
  }

  override get valid() {
    const hasNoError = Object.values(this.errors).length === 0;
    const allControlsHasValidState = Object.values(this._controls).every((control) => control.valid);

    return hasNoError && allControlsHasValidState;
  }

  override get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  addControl(control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    control.setParent(this as AbstractControl);
    this._controls.push(control);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  setControl(index: number, control: AbstractControl, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    if(!this.at(index)) {
      return;
    };

    this._controls[index] = control;
    this._controls[index].setParent(this as AbstractControl);
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  at<TResult extends AbstractControl>(index: number): AbstractControl {
    return this._controls[index] as TResult;
  }

  contains(index: number) {
    return !!this.at(index);
  }

  setValue(value: any[], { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}): void {
    this._controls.forEach((contol, index) => {
      contol.setValue(value[index], { updateParentValidity, runAsyncValidators });
    });

    this.setDirty(true, updateParentDirty);
  }

  removeAt(index: number, { updateParentValidity = true, runAsyncValidators = false, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._controls.splice(index, 1);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }

  reset() {
    for (const control of this._controls) {
      control.reset();
    }
    this.clearErrors();
  }

  updateAt(index: number, value: any, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
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
    this._controls.forEach((_, index) => {
      Object.defineProperty(this, index, {
        get: () => this.at(index),
        configurable: true,
        enumerable: true,
      });
    })
  }
}