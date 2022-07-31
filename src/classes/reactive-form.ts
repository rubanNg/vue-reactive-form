import { AbstractControl } from "./abstract-conrol";
import { defineProperties, findControl, isObject, toRecord } from "../utils";
import { ref } from "vue";
import { ArrayState, ObjectState } from "../types";


export class ReactiveForm {

  private _controls = ref<Record<string, AbstractControl>>(null)

  get controls() { return this._controls.value; }
  get value() { return this.getValue(); }

  constructor(controls: ArrayState | ObjectState) {
    this.configureControls(controls)
  }

  get(path: string) {
    return findControl(this, path)
  }

  private getValue() {
    const formValue: Record<string, any> = {};
    for (const name in this._controls.value) {
      formValue[name] = this._controls.value[name].value;
    }
    return formValue;
  }

  private configureControls(controls: ArrayState | ObjectState) {
    this._controls.value = toRecord(controls);
    for (const name in this._controls.value) {
      this._controls.value[name].setForm(this);
    }
    defineProperties(this);
  }
}