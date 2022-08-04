import { isProxy, Ref, reactive, toRaw } from "vue";
import { AsyncValidatorFn, ValidationFn } from "../types";
import { wrapToArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl<T = any> extends AbstractControl {

  private _value = reactive({ value: null });
  private _listiners: ((event: T) => void)[] = [];

  dirty: boolean = false;

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
  }

  get(path: string | string[]) {
    return null as AbstractControl;
  }


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

  setValue(value: any) {
    this.value = value;
  }

  setDirty(value: boolean) {
    this.dirty = value;
  }

  private onValueChange() {
    this._listiners.forEach(listener => listener(this._value.value))
    this._updateValidity();
    !this.dirty && (this.dirty = true);
  }
}

