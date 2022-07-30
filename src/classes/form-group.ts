import { ref } from "vue";
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { toArray, findControl, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup<ListControlNames extends Record<string, AbstractControl> = any> extends AbstractControl {

  private _controls: Record<string, AbstractControl> = {};
  private _errors: ValidationErrors | null = null;

  dirty: boolean = false;
  parent: AbstractControl = null;

  get errors() { return this._errors; }
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

  constructor(controls: ListControlNames, validators: ValidationFn[] = []) {
    super(validators);
    this.configureControls(controls);
  }

  setDirty(value: boolean) {
    this.dirty = value
  }
  
  hasError(errorCode: string, path?: string) {
    let errors = {};
    if (path) {
      errors = (this.get(path)?.errors || {});
    } else errors = this._errors;
    return errorCode in errors;
  }

  setControls(controls: Record<string, AbstractControl>) {
    this.configureControls({ ...controls })
  }

  reset() {
    for (const control in this._controls) {
      this._controls[control].value = null;
    }
  }

  setForm(form: ReactiveForm) {
    super.setForm(form);
    for (const control in this._controls) {
      this._controls[control].setForm(form);
    }
  }
  
  setValue(values: Array<any> = []): void {
    this.updateValue(values);
  }

  private updateValue(value: Record<any, any>[]) {
    const reset = (!value || Object.keys(value?.length).length === 0);
    for (const controlName in value) {
      if (this._controls?.[controlName]) {
        this._controls[controlName].value = reset ? null : value[controlName];
      }
    }
    this.onChange()
  }

  private validate() {
    for (const validator of this.validators) {
      const error = validator(this);
      if (error !== null) {
        this._errors = {
          ...(this._errors || {}),
          ...error,
        }

        return false;
      }
    }
    this._errors = null;
    return true;
  }

  private onChange() {
    this.validate();
  }

  private configureControls(controls: Record<string, AbstractControl>) {
    for (const controlName in controls) {
      this._controls[controlName] = controls[controlName];
      this._controls[controlName].parent = this;
    }
    defineProperties(this);
  }
}