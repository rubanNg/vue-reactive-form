import { isProxy, reactive, toRaw } from "vue";
import { AsyncValidatorFn, ValidationFn } from "../types";
import { wrapToArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl<T = string | number> extends AbstractControl {

  private _value = reactive({ value: null });
  private _listiners: ((event: T) => void)[] = [];

  get valid () {
    return this.errors === null;
  }

  get value(): T {
    return isProxy(this._value.value) ? toRaw(this._value.value) : this._value.value;
  }

  set value(value) {
    this._value.value = value;
    this.onValueChange();
  }

  constructor(value: T = null, validators: ValidationFn | ValidationFn[] = [], asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] = []) {
    super(wrapToArray(validators), wrapToArray(asyncValidators));
    this._value.value = value ?? null;
    this.updateValidity({ onlySelf: true });
  }

  get(path: string | string[]): AbstractControl {
    return this as AbstractControl;
  }

  /**
   * 
   * @param listener listener
   * @returns unsubscribe function
   */
   valueChanged(listener: (value: T) => void) {
    this._listiners.push(listener);
    return (() => {
      this._listiners = this._listiners.filter(l => l !== listener);
    }).bind(this);
  }

   /**
   * resets value and removes errors
   */
  reset() {
    this.value = null;
    this.clearErrors();
  };

  /**
   * sets the value of control
   * @param value new control value
   */
  setValue(value: T, options: { onlySelf?: boolean } = {}) {
    this.value = value;
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  _isValidControl() {
    return this.errors === null;
  }

  private onValueChange() {
    this._listiners.forEach(listener => listener(this._value.value))
    this.updateValidity();
    this.setDirty(true);
  }
}

