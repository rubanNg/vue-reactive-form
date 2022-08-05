import { isProxy, reactive, Ref, ref, toRaw, watch } from "vue";
import { AsyncValidatorFn, ControlStatus, ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties, isObject, find } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup extends AbstractControl {


  private _controls: { [key: string]: AbstractControl } = reactive({});

  get controls() { return this._controls; }

  get value() {
    return Object.entries(this._controls).reduce((result: { [key: string]: any }, [name, control]) => {
      result[name] = control.value;
      return result;
    }, {})
  }

  constructor(controls: { [ key: string ]: AbstractControl }, validators: ValidationFn | ValidationFn[] = [], asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] = []) {
    super(wrapToArray(validators), wrapToArray(asyncValidators));
    this.configureControls(controls);
  }

  /**
   * @param controls controls list
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  addControls(controls: { [key: string]: AbstractControl }, onlySelf?: boolean) {
    this.configureControls({ ...controls });
    this.updateValidity(onlySelf);
  }

  get(path: string | string[]): AbstractControl {
    return find(this, path);
  }

  /**
   * @param name control name
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setControl(name: string, control: AbstractControl, onlySelf?: boolean) {
    if(this._controls[name]) this._controls[name] = control;
    this.updateValidity(onlySelf);
  }
  
   /**
   * @param value controls value
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  setValue(value: { [key: string]: any }, onlySelf?: boolean) {
    if (!isObject(value) || Object.keys(value).length === 0) {
      console.error('"setValue" function argument must be a plain object');
    } else {
      for (const name in value) {
        if (this._controls?.[name]) {
          this._controls[name].setValue((value as { [key: string]: any })[name], true);
        }
      }
      this.updateValidity(onlySelf)
    }
  }

  /**
   * @param value control name
   * @param onlySelf When true, each change only affects this control, and not its parent. Default is false. 
   */
  removeControl(name: string, onlySelf?: boolean) {
    delete this._controls[name];
    this.updateValidity(onlySelf);
  }

  contains(name: string) {
    return Boolean(this._controls[name])
  }
  
  reset() {
    for (const control in this._controls) this._controls[control].reset();
    this.clearErrors();
  }

  private configureControls(controls: Record<string, AbstractControl>) {
    for (const name in controls) {
      this._controls[name] = controls[name];
      this._controls[name]._setParent(this);
    }
  }
}