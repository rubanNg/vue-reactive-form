import { AbstractControl } from "./abstract-conrol";
import { defineProperties, findControl } from "../utils";
import { ref } from "vue";


export class ReactiveForm {

  private _controls = ref<Record<string, AbstractControl>>(null)

  get controls() { return this._controls.value; }
  get value() { return this.getValue(); }

  constructor(controls: Record<string, AbstractControl>) {
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

  private configureControls(controls: Record<string, AbstractControl>) {
    for (const controlName in controls) {
      controls[controlName].setForm(this);
    }
    this._controls.value = controls;
    defineProperties(this);
  }

}