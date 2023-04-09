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
    this.updateValidity({ updateParentValidity: false });
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

  addControl(control: AbstractControl, options: ControlUpdateOptions = { updateParentValidity: true }) {
    control.setParent(this as AbstractControl);
    this._controls.push(control);
    this.updateDynamicProperties();
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  setControl(index: number, control: AbstractControl, options: ControlUpdateOptions = { updateParentValidity: true }) {
    if(!this.at(index)) {
      return;
    };

    this._controls[index] = control;
    this._controls[index].setParent(this as AbstractControl);
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  at(index: number): AbstractControl {
    return this._controls[index];
  }

  contains(index: number) {
    return !!this.at(index);
  }

  setValue(value: any[], options: ControlUpdateOptions = { updateParentValidity: true }): void {
    this._controls.forEach((contol, index) => {
      contol.setValue(value[index], options);
    });

    this.setDirty(true, options);
  }

  removeAt(index: number, options: ControlUpdateOptions = { updateParentValidity: true }) {
    this._controls.splice(index, 1);
    this.updateDynamicProperties();
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  reset() {
    for (const control of this._controls) {
      control.reset();
    }
    this.clearErrors();
  }

  updateAt(index: number, value: any | number, options: ControlUpdateOptions = { updateParentValidity: true }) {
    this.at(index).setValue(value, options);
    this.setDirty(true, options);
  }

  private _setUpControls(controls: AbstractControl[]) {
    return controls.map((control) => {
      control.setParent(this);
      return control;
    });
  }

  private updateDynamicProperties() {
    const formArray = this;

    formArray._controls.forEach((_, index) => {
      Object.defineProperty(formArray, index, {
        get: () => formArray.at(index),
        configurable: true,
        enumerable: true,
      });
    })
  }
}