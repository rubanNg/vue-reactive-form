import { AbstractControl } from "./abstract-conrol";
import { defineProperties, find, isArray, isObject, toArray, toRecord } from "../utils";
import { ref } from "vue";


enum Type {
  Array,
  Object
}

export class ReactiveForm {

  #structureType: Type = null;
  #_controls = ref<Record<string, AbstractControl>>(null)

  get controls() { 
    if (this.#structureType === Type.Object) return this.#_controls.value as Record<string, AbstractControl>;
    if (this.#structureType === Type.Array) return toArray<AbstractControl>(this.#_controls.value);
  }
  get value(): any { return this.#getValue(); }

  constructor(controls: AbstractControl[] | Record<string, AbstractControl>) {
    this.#configureControls(controls)
  }

  get(path: string) {
    return find<AbstractControl>(this, path)
  }

  addControl(control: AbstractControl, name?: string) {
    if (this.#structureType === Type.Array) {
      const index = this.#getNextIndex();
      this.#_controls.value[index] = control;
    } else {
      if (!name) throw new Error("The name argument is a required parameter because controls are an object.");
      this.#_controls.value[name] = control;
    }
  }

  #getNextIndex() {
    return Object.keys(this.#_controls).length.toString();
  }

  #getValue() {
    return Object.keys(this.#_controls.value).reduce((result: any, key) => {
      result[key] = this.#_controls.value[key].value;
      return result;
    }, this.#structureType === Type.Array ? [] : {})
  }

  #configureControls(controls: AbstractControl[] | Record<string, AbstractControl>) {
    this.#structureType = isArray(controls) ? Type.Array : Type.Object
    this.#_controls.value = toRecord(controls);
    for (const name in this.#_controls.value) {
      this.#_controls.value[name].setForm(this);
    }
    defineProperties(this);
  }
}
