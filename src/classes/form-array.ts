import { Ref, reactive, isProxy, toRaw, watch } from "vue";
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

  /**
   * @param controls AbstractControl list
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  addControls(controls: Array<AbstractControl>, onlySelf?: boolean) {
    this.configureControls(controls);
    this.updateValidity(onlySelf);
  }

  /**
   * @param index control index
   * @param control control AbstractControl
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setControl(index: number, control: AbstractControl, onlySelf?: boolean) {
    if(this._controls[index]) this._controls[index] = control;
    this.updateValidity(onlySelf);
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

  /**
   * @param value control value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setValue(value: any[], onlySelf: boolean = false): void {
    if(!isArray(value) || value.length === 0) return;
    for (let index = 0; index < value.length; index++) {
      if (this._controls?.[index]) {
        this._controls.at(index).setValue(value[index], true);
      } else break;
    }
    this.updateValidity(onlySelf);
  }

  /**
   * @param index control index
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  removeAt(index: number, onlySelf?: boolean) {
    this._controls.splice(index, 1);
    this.updateValidity(onlySelf);
  }

  reset() {
    for (const control of this._controls) control.reset();
    this.clearErrors();
  }
  /**
   * @param index control index
   * @param value control value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  updateAt({ index, value }: { index: number, value: any }, onlySelf: boolean = false) {
    this._controls[index].setValue(value, true);
    this.updateValidity(onlySelf); 
  }

  private configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control._setParent(this);
      this._controls.push(control);
    }
  }
}