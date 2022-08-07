import { isProxy, reactive, Ref, ref, toRaw, watch } from "vue";
import { AsyncValidatorFn, ControlStatus, ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties, isObject, find } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup extends AbstractControl {

  private _controls: { [key: string]: AbstractControl } = reactive({});

  get controls() { return this._controls; }
  get value() {
    return Object.entries(this._controls).reduce((result: { [key: string]: any }, [name, control]) => {
      result[name] = isProxy(control.value) ? toRaw(control.value) : control.value;
      return result;
    }, {});
  }

  constructor(controls: { [ key: string ]: AbstractControl }, validators: ValidationFn | ValidationFn[] = [], asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] = []) {
    super(wrapToArray(validators), wrapToArray(asyncValidators));
    for (const name in controls) {
      this._controls[name] = controls[name];
      this._controls[name].setParent(this);
    }
    this.updateValidity({ onlySelf: true });
  }

  /**
   * @param controls controls list
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  addControls(controls: { [key: string]: AbstractControl }, options: { onlySelf?: boolean } = {}) {
    for (const name in controls) {
      this._controls[name] = controls[name];
      this._controls[name].setParent(this);
    }
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  get(path: string | string[]): AbstractControl {
    return find(this, path);
  }

  /**
   * @param name control name
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setControl(name: string, control: AbstractControl, options: { onlySelf?: boolean } = {}) {
    if(this._controls[name]) {
      control.setParent(this);
      this._controls[name] = control;
    }
    this.updateValidity(options);
    this.setDirty(true, options);
  }
  
   /**
   * @param value controls value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setValue(value: { [key: string]: any }, options: { onlySelf?: boolean } = {}) {
    if (!isObject(value) || Object.keys(value).length === 0) {
      console.error('"setValue" function argument must be a plain object');
      return;
    }
    for (const name in value) {
      if (this._controls?.[name]) {
        this._controls[name].setValue(value[name], options);
      }
    }
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  /**
   * @param value control name
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  removeControl(name: string, options: { onlySelf?: boolean } = {}) {
    delete this._controls[name];
    this.updateValidity(options);
    this.setDirty(true, options);
  }

  contains(name: string) {
    return Boolean(this._controls[name])
  }
  
   /**
   * resets child controls values and removes errors
   */
  reset() {
    for (const control in this._controls) this._controls[control].reset();
    this.clearErrors();
  }

  _isValidControl() {
    return Object.entries(this._controls).every(([_, control]) => control.valid) && this.errors === null;
  }
}