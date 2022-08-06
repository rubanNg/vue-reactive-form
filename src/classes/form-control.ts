import { reactive } from "vue";
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
    return this._value.value;
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

  get(path: string | string[]) {
    return this;
  }

  /**
   * 
   * @param listener listener
   * @returns unsubscribe function
   */
  valueChanges(listener: (value: T) => void) {
    this._listiners.push(listener);
    return (() => {
      this._listiners = this._listiners.filter(l => l !== listener);
    }).bind(this);
  }

  reset() {
    this.value = null;
    this.clearErrors();
  };

  setValue(value: T) {
    this.value = value;
  }

  _isValidControl() {
    return this.errors !== null;
  }

  private onValueChange() {
    this._listiners.forEach(listener => listener(this._value.value))
    this.updateValidity();
    this.setDirty(true);
  }
}

