import { ref } from "vue";
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { toArray, findControl, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup<ListControlNames extends Record<string, AbstractControl> = any> extends AbstractControl {

  private _controls: Record<string, AbstractControl> = {};
  private _errors: ValidationErrors | null = null;
  private _validators: ValidationFn[] = [];

  dirty: boolean = false;
  form: ReactiveForm<any> = null;

  get validators(): ValidationFn[] {
    return this._validators;
  }
  
  get controls() {
    return this._controls as ListControlNames;
  }
  
  get valid() {
    for (const controlName in this._controls.value) {
      if (!this._controls[controlName].valid) return false;
    }
    return this.validate();
  }

  get errors() {
    return this._errors;
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
    super();
    this._validators = validators;
    this.configureControls(controls);
  }

  setDirty(value: boolean) {
    this.dirty = value
  }

  setValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = Array.isArray(validators) ? validators : [validators]
  }

  addValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators.push(...toArray(validators));
  }

  removeValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = this.validators.filter(s => !toArray(validators).includes(s))
  }
  
  clearValidators(): void {
    this._validators = [];
  }

  getError(errorCode: string) {
    return this.errors?.[errorCode];
  }
  
  hasError(errorCode: string, path?: string) {
    return Boolean(this.errors?.hasOwnProperty(errorCode))
  }

  get(path: string) {
    return findControl(this, path)
  }

  setControls(controls: Record<string, AbstractControl>) {
    this.configureControls({ ...controls })
  }

  reset() {
    for (const control in this._controls) {
      this._controls[control].value = null;
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
      this._controls[controlName].form = this.form;
    }
    defineProperties(this);
  }
}