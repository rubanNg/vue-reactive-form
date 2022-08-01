import { AbstractControl } from "./abstract-conrol";
import {
  find, 
  interceptControlsGetters, 
  isArray, 
  toArray, 
  toRecord
} from "../utils";
import { ref } from "vue";


enum Type {
  Array,
  Object
}

export class ReactiveForm {

  private structureType: Type = null;
  private _controls = ref<Record<string, AbstractControl>>({})

  get controls() { 
    switch (this.structureType) {
      case Type.Object: return this._controls.value
      case Type.Array: return toArray<AbstractControl>(this._controls.value);
    }
  }

  get value(): any { return this.mapValue(); }

  constructor(controls: AbstractControl[] | Record<string, AbstractControl>) {
    return this.configureInstance(controls);
  }

  get(path: string) {
    return find<AbstractControl>(this, path);
  }

  setControl(control: AbstractControl, name?: string) {
    if (this.structureType === Type.Array) {
      const array = Object.entries(this._controls.value).map(([_, control]) => {
        return control;
      });
      this._controls.value = toRecord<AbstractControl>([...array, control]);
    } else {
      if (!name) throw new Error('The "name" argument is a required parameter because controls are an object.');
      this._controls.value[name] = control;
    }
  }

  removeControl(name: any) {
    delete this._controls.value[name];
    if (this.structureType === Type.Array) {
      this._controls.value = toRecord<AbstractControl>(toArray(this._controls.value));
    }
  }

  private mapValue() {
    const initialState = this.structureType === Type.Array ? [] : {}
    return Object.keys(this._controls.value).reduce((result: any, key) => {
      result[key] = this._controls.value[key].value
      return result;
    }, initialState)
  }

  private configureInstance(controls: AbstractControl[] | Record<string, AbstractControl>) {
    this.structureType = isArray(controls) ? Type.Array : Type.Object;
    this._controls.value = toRecord(controls);
    for (const name in this._controls.value) this._controls.value[name].setForm(this);
    return interceptControlsGetters<ReactiveForm>(this);
  }
}
