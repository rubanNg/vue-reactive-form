import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { toArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";

export class FormControl extends AbstractControl {

  private _value: any = null;
  //private _errors: ValidationErrors = null;
  private _listiners: ((event: string) => void)[] = [];

  parent: AbstractControl = null;
  dirty: boolean = false;

  // get errors(): ValidationErrors  {
  //   return this._errors;
  // };

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

  constructor(value: any, validators: ValidationFn[] = []) {
    super(validators);
    this._value = value || null;
  }

  /**
   * @param listener emit on every value change
   * @returns unsubscribe function
   */
  detectChange(listener: (value: string) => void) {
    this._listiners.push(listener);

    return (() => {
      this._listiners = this._listiners.filter(l => l !== listener);
    }).bind(this);
  }

  reset(value: any) {
    this.value = value;
  };

  setValue(value: any) {
    this.value = value;
  }
  
  // hasError(errorCode: string) {
  //   return errorCode in (this._errors || {});
  // }

  setDirty(value: boolean) {
    this.dirty = value;
  }

  setForm(form: ReactiveForm) {
    super.setForm(form);
  }


  private onChange() {
    this._listiners.forEach(listener => listener(this._value))
    this.validate();
    !this.dirty && (this.dirty = true);
  }

}

