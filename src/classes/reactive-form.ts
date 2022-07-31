import { AbstractControl } from "./abstract-conrol";
import { defineProperties, findControl, isArray, toArray, toRecord } from "../utils";
import { ref } from "vue";
import { ArrayState, ObjectState } from "../types";


export class ReactiveForm {

  #structureType: 'array' | 'object' = null;
  #_controls = ref<ObjectState>(null)

  get controls(): ObjectState | ArrayState { 
    return this.#getControls() 
  }
  get value(): any { return this.#getValue(); }

  constructor(controls: ArrayState | ObjectState) {
    this.#configureControls(controls)
  }

  get(path: string) {
    return findControl(this, path)
  }

  #getValue() {
    return Object.keys(this.#_controls.value).reduce((result: any, key) => {
      result[key] = this.#_controls.value[key].value;
      return result;
    }, this.#structureType === "array" ? [] : {})
  }

  #getControls() {
    return this.#structureType === 'object' ? this.#_controls.value : toArray(this.#_controls.value);
  }

  #configureControls(controls: ArrayState | ObjectState) {
    this.#structureType = isArray(controls) ? 'array' : 'object'
    this.#_controls.value = toRecord(controls);
    for (const name in this.#_controls.value) {
      this.#_controls.value[name].setForm(this);
    }
    defineProperties(this);
  }
}
