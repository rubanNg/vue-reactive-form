
import { ValidationErrors, ValidationFn } from "../types";
import { toArray, findControl, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl<any> {

  private _controls: Array<AbstractControl<any>> = [];
  private _errors: ValidationErrors | null = null;
  private _value: any[] = [];
  private _validators: ValidationFn[] = [];

  get validators(): ValidationFn[] {
    return this._validators;
  }
  dirty: boolean = false;
  parent: AbstractControl<any> | null = null;


  get controls() {
    return this._controls;
  }
  
  get valid() {
    return this._controls.every(s => s.valid) && this.validate();
  }

  get errors() {
    return this._errors;
  }

  get value() {
    return this._controls.map(control => control.value);
  }

  constructor(controls: Array<AbstractControl<any>>, validators: ValidationFn[] = []) {
    super();
    this._validators = validators;
    this.configureControls([...controls]);
    console.log("CREATE ARRAY ", controls)
  }

  setValue(values: Array<any> = []): void {
    this.updateValue(values);
  }
  setDirty(value: boolean) {
    this.dirty = value
  }

  setValidators(validators: ValidationFn | ValidationFn[]) {
    this._validators = Array.isArray(validators) ? validators : [validators]
  }

  addValidators(validators: ValidationFn | ValidationFn[]) {
    this.validators.push(...toArray(validators));
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
  
  hasError(errorCode: string) {
    return Boolean(this.errors?.hasOwnProperty(errorCode));
  }

  get(path: string) {
    return findControl(this, path)
  }

  setControls(controls: Array<AbstractControl<any>>) {
    this.configureControls(controls);
  }

  removeAt(index: number) {
    this.controls.splice(index, 1);
  }

  reset(value: any[]) {
    for (const [index, control] of this._controls.entries()) {
      control.setValue(value?.[index] || null);
    }
  }

  private updateValue(values: any[]) {
    if (!values || values?.length === 0) {
      this._value = [];
    } else {
      for (const [index, value] of values.entries()) {
        this._value[index] = value;
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

  private configureControls(controls: Array<AbstractControl<any>>) {
    for (const control of controls) {
      control.parent = this as AbstractControl<any>;
    }
    this._controls.push(...controls);
    defineProperties(this);
  }

}