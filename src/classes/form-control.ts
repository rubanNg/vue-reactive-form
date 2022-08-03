import { isProxy, toRaw } from "vue";
import { ValidationFn } from "../types";
import { wrapToArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl<T = any> extends AbstractControl {

  private _value: T = null;
  private _listiners: ((event: T) => void)[] = [];

  dirty: boolean = false;

  get valid() {
    return this.validate();
  }

  get value(): T {
    return isProxy(this._value) ? toRaw(this._value) : this._value;
  }

  set value(value) {
    this._value = value;
    this.onChange();
  }

  constructor(value: T = null, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this._value = value ?? null;
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
  };

  setValue(value: any) {
    this.value = value;
  }

  setDirty(value: boolean) {
    this.dirty = value;
  }

  private onChange() {
    this._listiners.forEach(listener => listener(this._value))
    this.validate();
    !this.dirty && (this.dirty = true);
  }
}

