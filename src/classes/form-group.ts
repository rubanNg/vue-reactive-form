import { ref } from "vue";
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties, isObject } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup<ListControlNames extends Record<string, AbstractControl> = any> extends AbstractControl {

  private _controls: Record<string, AbstractControl> = {};

  get controls() { return this._controls as ListControlNames; }
  get valid() {
    for (const controlName in this._controls.value) {
      if (!this._controls[controlName].valid) return false;
    }
    return this.validate();
  }

  get value() {
    const keys = Object.keys(this._controls);
    const result: Record<any, any> = {};
    return keys.reduce((result, controlName) => {
      result[controlName] = this._controls[controlName].value;
      return result;
    }, result)
  }

  constructor(controls: ListControlNames, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this.configureControls(controls);
  }

  setControls(controls: Record<string, AbstractControl>) {
    this.configureControls({ ...controls })
  }

  setForm(form: ReactiveForm) {
    Reflect.set(this, "_form", form);
    for (const control in this._controls) {
      this._controls[control].setForm(form);
    }
  }
  
  setValue(value: Record<string, any> = null): void {
    if (!isObject(value) || Object.keys(value).length === 0) {
      console.error('"setValue" function argument must be a plain object');
      return;
    }
    this.updateValue(value);
  }

  removeControl(name: string) {
    delete this._controls[name]
  }

  contains(name: string) {
    return Boolean(this._controls[name])
  }
  
  reset() {
    for (const control in this._controls) this._controls[control].reset();
  }

  private updateValue(value: Record<string, any>) {
    for (const controlName in value) {
      if (this._controls?.[controlName]) {
        this._controls[controlName].value = value[controlName];
      }
    }
    this.onChange()
  }

  private onChange() {
    this.validate();
  }

  private configureControls(controls: Record<string, AbstractControl>) {
    for (const controlName in controls) {
      this._controls[controlName] = controls[controlName];
      Reflect.set(this._controls[controlName], '_parent', this);
    }
    defineProperties(this);
  }
}