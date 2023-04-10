import { reactive } from "vue";
import type { ValidationFn, AsyncValidationFn, FormGroupValue, ControlUpdateOptions } from "../types";
import { findFormControl } from "../utils/find-form-control";
import { AbstractControl } from "./abstract-conrol";

export class FormGroup extends AbstractControl {
  private _controls: { [key: string]: AbstractControl } = reactive({});

  constructor(controls: { [ key: string ]: AbstractControl },
    validators: ValidationFn[] = [],
    asyncValidators: AsyncValidationFn[] = [],
  ) {
    super(validators, asyncValidators);
    this._setUpControls(controls);
    this.updateDynamicProperties();
    this.updateValidity({ updateParentValidity: false });
  }

  override get valid() {
    const hasNoError = Object.values(this.errors).length === 0;
    const allControlsHasValidState = Object.values(this._controls).every((control) => control.valid);

    return hasNoError && allControlsHasValidState;
  }

  get controls() {
    return this._controls;
  }

  get value() {
    return Object.entries(this._controls).reduce((result: FormGroupValue, [name, control]) => {
      return {
        ...result,
        [name]: control.value,
      };
    }, {});
  }

  addControl(name: string, control: AbstractControl, options: ControlUpdateOptions = { updateParentValidity: true }) {
    this._setUpControls({ [name]: control });
    this.updateDynamicProperties();
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  override get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return findFormControl(this, path) as TResult;
  }

  setControl(name: string, control: AbstractControl, options: ControlUpdateOptions = { updateParentValidity: true }) {
    if(!(name in this._controls)) {
      throw new Error("non-existing control");
    }

    if (!(control instanceof AbstractControl)) {
      throw new Error("must be AbstractControl");
    }

    this._setUpControls({ [name]: control });
    this.updateDynamicProperties();
    this.updateValidity(options);
    this.setDirty(true, options);
  }
  
  setValue(value: { [key: string]: any }, options: ControlUpdateOptions = { updateParentValidity: true }) {
    Object.entries(value).forEach(([key, value]) => {
      this._controls[key].setValue(value, options);
    });
    this.setDirty(true, options);
  }

  removeControl(name: string, options: ControlUpdateOptions = { updateParentValidity: true }) {
    delete this._controls[name];
    this.updateDynamicProperties();
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  at<TResult extends AbstractControl>(name: string): AbstractControl {
    return this._controls[name] as TResult;
  }

  contains(controlName: string) {
    return controlName in this._controls;
  }
  
  reset() {
    Object.values(this._controls).forEach((control) => control.reset());
    this.clearErrors();
  }

  private _setUpControls(controls: { [ key: string ]: AbstractControl }) {
    Object.entries(controls).forEach(([name, control]) => {
      this._controls[name] = control;
      this._controls[name].setParent(this);
    });
  }

  private updateDynamicProperties() {
    const formGroup = this;
    
    Object.entries(formGroup._controls).forEach(([name, control]) => {
      Object.defineProperty(formGroup, name, {
        get: () => formGroup._controls[name],
        configurable: true,
        enumerable: true,
      });
    })
  }
}