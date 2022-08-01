import { AbstractControl } from "./abstract-conrol";
import {
   defineProperties, 
  defineProperty, 
  find, 
  interceptControlsGetters, 
  isArray, 
  isObject,
  toArray, 
  toRecord, 
  undefineProperties 
} from "../utils";
import { ref } from "vue";


enum Type {
  Array,
  Object
}

export class ReactiveForm {

  private structureType: Type = null;
  private _controls = ref<Record<string, AbstractControl>>(null)

  get controls() { 
    switch (this.structureType) {
      case Type.Object: {
        return this._controls.value as Record<string, AbstractControl>
      }
      case Type.Array: {
        return toArray<AbstractControl>(this._controls.value);
      }
    }
  }
  get value(): any { return this.getValue(); }

  constructor(controls: AbstractControl[] | Record<string, AbstractControl>) {
    this.structureType = isArray(controls) ? Type.Array : Type.Object;
    console.log("ON_CREATE: ", this)
    this._controls.value = toRecord(controls);
    this.configureControls();
    return interceptControlsGetters(this);
  }

  get(path: string) {
    return find<AbstractControl>(this, path)
  }

  setControl(control: AbstractControl, name?: string) {
    if (this.structureType === Type.Array) {
      const array = [
        ...toArray(this._controls.value),
        control,
      ];
      this._controls.value = toRecord<AbstractControl>(array);
    } else {
      if (!name) throw new Error('The "name" argument is a required parameter because controls are an object.');
      this._controls.value[name] = control;
    }
  }

  removeControl(name: any) {
    if (this.structureType === Type.Array) {
      const array = toArray(this._controls.value);
      array.splice(name, 1);
      this._controls.value = toRecord<AbstractControl>(array);
    } else {
      delete this._controls.value[name];
    }
    undefineProperties(this, name);
  }

  private getValue() {
    return Object.keys(this._controls.value).reduce((result: any, key) => {
      result[key] = this._controls.value[key].value;
      return result;
    }, this.structureType === Type.Array ? [] : {})
  }

  private attachForm() {
    for (const name in this._controls.value) {
      this._controls.value[name].setForm(this);
    }
  }

  private configureControls() {
    this.attachForm();
  }
}
