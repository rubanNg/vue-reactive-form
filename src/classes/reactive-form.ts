import { AbstractControl } from "./abstract-conrol";
import { defineProperties, findControl } from "../utils";
import { ref } from "vue";

export class ReactiveForm<T extends Record<string, AbstractControl>> {

  //private _controls: T = null;
  private _controls = ref<T>(null)

  get controls(): T { return this._controls.value; }
  get value() { return this.getValue(); }

  constructor(controls: T) {
    this.configureControls(controls)
  }

  get(path: string) {
    return findControl(this, path)
  }

  private getValue() {
    return Object.keys(this._controls.value).reduce((result, key) => {
      result[key] = this._controls.value[key].value;
      return result;
    }, {} as Record<any, any>)
  }

  private configureControls(controls: T) {
    this._controls.value = controls;
    defineProperties(this);
  }

}