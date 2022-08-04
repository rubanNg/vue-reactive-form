import { isProxy, reactive, Ref, ref, toRaw } from "vue";
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

  addControls(controls: { [key: string]: AbstractControl }) {
    this.configureControls({ ...controls })
  }

  get(path: string | string[]): AbstractControl {
    return find(this, path);
  }

  setControl(name: string, control: AbstractControl) {
    if(this._controls[name]) this._controls[name] = control;
  }
  
  setValue(value: { [key: string]: any }): void {
    if (!isObject(value) || Object.keys(value).length === 0) {
      console.error('"setValue" function argument must be a plain object');
      return;
    }
    this.updateValue(value);
  }

  removeControl(name: string) {
    delete this._controls[name]
  }

  contains(name: string) {
    return Boolean(this._controls[name])
  }
  
  reset() {
    for (const control in this._controls) this._controls[control].reset();
  }

  private updateValue(value: Record<string, any>) {
    for (const name in value) {
      if (this._controls?.[name]) {
        this._controls[name].value = value[name];
      }
    }
    this.onValueChange()
  }

  private onValueChange() {
    this._updateValidity();
  }

  private configureControls(controls: Record<string, AbstractControl>) {
    for (const name in controls) {
      this._controls[name] = controls[name];
      this._controls[name]._setParent(this);
    }
  }
}