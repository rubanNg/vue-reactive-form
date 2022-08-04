import { Ref, reactive, isProxy, toRaw } from "vue";
import { AsyncValidatorFn, ValidationFn } from "../types";
import { wrapToArray, isArray, find } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {

  private _controls: AbstractControl[] = reactive([]);

  get controls(): AbstractControl[] { return this._controls; }
  get value(): any[] { 
    return this._controls.map(control => control.value); 
  }

  constructor(controls: Array<AbstractControl>, validators: ValidationFn | ValidationFn[] = [], asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] = []) {
    super(wrapToArray(validators), wrapToArray(asyncValidators));
    this.configureControls(controls);
  }

  addControls(controls: Array<AbstractControl>) {
    this.configureControls(controls);
  }

  setControl(index: number, control: AbstractControl) {
    if(this._controls[index]) this._controls[index] = control;
  }

  at(index: number): AbstractControl {
    return this._controls[index];
  }

  get(path: string | string[]): AbstractControl {
    return find(this, path);
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
    this._controls.splice(index, 1);
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
        this._controls.at(index).value = value[index];
      } else break;
    }
    this.onValueChange()
  }

  private onValueChange() {
    this._updateValidity();
  }

  private configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control._setParent(this);
      this._controls.push(control);
    }
  }
}