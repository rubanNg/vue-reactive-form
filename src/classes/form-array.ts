import { FormGroup } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties, isArray } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {

  private _controls: Array<AbstractControl> = [];

  get controls() { return this._controls; }
  get valid() { return this._controls.some(s => !s.valid) ? false : this.validate(); }
  get value() { return this._controls.map(control => control.value); }

  constructor(controls: Array<AbstractControl>, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this.configureControls(controls);
  }

  addControls(controls: Array<AbstractControl>) {
    this.configureControls(controls);
  }

  at(index: number) {
    return this._controls[index];
  }

  contains(index: number) {
    return Boolean(this._controls[index])
  }

  setValue(value: any[]): void {
    if(!isArray(value) || value.length === 0) return;
    this.updateValue(value);
  }

  removeControl(index: number) {
    this._controls.splice(index, 1);
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

  private updateValue(value: any[]) {
    for (let index = 0; index < value.length; index++) {
      if (this._controls?.[index]) {
        this._controls[index].value = value[index];
      } else break;
    }
    this.onChange()
  }

  private onChange() {
    this.validate();
  }

  private configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control.setParent(this);
      this._controls.push(control);
    }
  }
}