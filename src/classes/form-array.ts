
import { ValidationErrors, ValidationFn } from "../types";
import { toArray, findControl, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {

  private _controls: Array<AbstractControl> = [];
  private _errors: ValidationErrors | null = null;
  private _validators: ValidationFn[] = [];

  get validators(): ValidationFn[] {
    return this._validators;
  }
  dirty: boolean = false;
  parent: AbstractControl = null;


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

  constructor(controls: Array<AbstractControl>, validators: ValidationFn[] = []) {
    super();
    this._validators = validators;
    this.configureControls([...controls]);
    console.log("CREATE ARRAY ", controls)
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

  setControls(controls: Array<AbstractControl>) {
    this.configureControls(controls);
  }

  removeAt(index: number) {
    this.controls.splice(index, 1);
  }

  reset() {
    for (const control of this._controls) {
      control.value = null;
    }
  }

  setValue(value: any[] | { index: number, value: any }[]): void {
    this.updateValue(value);
  }

  private updateValue(value: any[] | { index: number, value: any }[]) {
    if(!value || value?.length === 0) {
      this.reset();
    } else {
      for (let index = 0; index < value.length; index++) {
        // если массив бошльше чем полей в  массиве
        if (index > this._controls.length - 1) break;
        const needUpdateByIndex = (value?.[index]?.index !== null) && (value?.[index]?.index !== undefined);
        if (needUpdateByIndex) this.updateByIndex(value[index]);
        else {
          this._controls[index].value = value[index];
        }
      }
    }

    this.onChange()
  }

  private updateByIndex({ index, value }: { index: number, value: any }) {
    this._controls[index].value = value;  
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

  private configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control.parent = this as AbstractControl;
    }
    this._controls.push(...controls);
    defineProperties(this);
  }

}