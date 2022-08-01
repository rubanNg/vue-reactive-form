import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl extends AbstractControl {

  private _value: any = null;
  private _listiners: ((event: string) => void)[] = [];

  dirty: boolean = false;


  get valid() {
    return this.validate();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this.onChange();
  }

  constructor(value: any, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this._value = value ?? null;
  }


  valueChange(listener: (value: string) => void) {
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

  setForm(form: ReactiveForm) {
    Reflect.set(this, "_form", form);
  }


  private onChange() {
    this._listiners.forEach(listener => listener(this._value))
    this.validate();
    !this.dirty && (this.dirty = true);
  }

}

