import { Ref, reactive, isProxy, toRaw, watch } from "vue";
import { AsyncValidatorFn, ValidationFn } from "../types";
import { wrapToArray, isArray, find } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {


  private _controls: AbstractControl[] = reactive([]);

  get controls(): AbstractControl[] { return this._controls; }
  get value(): (string | number)[] {
    return this._controls.map(({ value }) => isProxy(value) ? toRaw(value) : value);
  }

  constructor(controls: Array<AbstractControl>, validators: ValidationFn | ValidationFn[] = [], asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] = []) {
    super(wrapToArray(validators), wrapToArray(asyncValidators));
    this._controls = controls.map(control => {
      control.setParent(this);
      return control;
    });
    this.updateValidity({ onlySelf: true });
  }

  /**
   * @param controls AbstractControl list
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  addControls(controls: Array<AbstractControl>, options: { onlySelf?: boolean } = {}) {
    this._controls.push(...controls.map(control => {
      control.setParent(this);
      return control;
    }));
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  /**
   * @param index control index
   * @param control control `AbstractControl`
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setControl(index: number, control: AbstractControl, options: { onlySelf?: boolean } = {}) {
    if(this._controls[index]) this._controls[index] = control;
    this.updateValidity(options);
    this.setDirty(true, options);
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
  setValue(value: any[], options: { onlySelf?: boolean } = {}): void {
    if(!isArray(value) || value.length === 0) return;
    for (let index = 0; index < value.length; index++) {
      if (this._controls?.[index]) {
        this._controls.at(index).setValue(value[index], options);
      } else break;
    }
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  /**
   * @param index control index
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  removeAt(index: number, options: { onlySelf?: boolean } = {}) {
    this._controls.splice(index, 1);
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  /**
   * resets child controls values and removes errors
   */
  reset() {
    for (const control of this._controls) control.reset();
    this.clearErrors();
  }
  /**
   * @param index control index
   * @param value control value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  updateAt({ index, value }: { index: number, value: any }, options: { onlySelf?: boolean } = {}) {
    this._controls[index].setValue(value, options);
    this.updateValidity(options); 
    this.setDirty(true, options);
  }

  _isValidControl() {
    return this._controls.every(control => control.valid) && this.errors === null;
  }
}