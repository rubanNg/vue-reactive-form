
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties, isArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {

  private _controls: Array<AbstractControl> = [];

  dirty: boolean = false;
  parent: AbstractControl = null;

  get controls() {
    return this._controls;
  }
  
  get valid() {
    return this._controls.some(s => !s.valid) ? false : this.validate();
  }

  get value() {
    return this._controls.map(control => control.value);
  }

  constructor(controls: Array<AbstractControl>, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this.configureControls(controls);
  }

  setDirty(value: boolean) {
    this.dirty = value
  }

  setControls(controls: AbstractControl | Array<AbstractControl>) {
    this.configureControls(wrapToArray(controls));
  }

  setValue(value:(string | number)[]): void {
    if(!isArray(value) || value.length === 0) return;
    this.updateValue(value);
  }

  setForm(form: ReactiveForm) {
    super.setForm(form);
    for (const control of this._controls) {
      control.setForm(form);
    }
  }

  removeControl(index: number) {
    this._controls.splice(index, 1);
  }

  contains(index: number) {
    return Boolean(this._controls[index])
  }

  removeAt(index: number) {
    this.controls.splice(index, 1);
  }

  reset() {
    for (const control of this._controls) control.reset();
  }

  updateAt({ index, value }: { index: number, value: any }) {
    this._controls[index].value = value;  
  }


  private updateValue(value: (string | number)[]) {
    for (let index = 0; index < value.length; index++) {
      if (index > this._controls.length - 1) break;
      this._controls[index].value = value[index];
    }
    this.onChange()
  }

  private onChange() {
    this.validate();
  }

  private configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control.parent = this;
    }
    this._controls.push(...controls);
    defineProperties(this);
  }

}