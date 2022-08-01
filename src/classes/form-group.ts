import { ref } from "vue";
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";



export class FormGroup<ListControlNames extends Record<string, AbstractControl> = any> extends AbstractControl {

  #_controls: Record<string, AbstractControl> = {};

  dirty: boolean = false;
  parent: AbstractControl = null;

  get controls() { return this.#_controls as ListControlNames; }
  get valid() {
    for (const controlName in this.#_controls.value) {
      if (!this.#_controls[controlName].valid) return false;
    }
    return this.validate();
  }

  get value() {
    const keys = Object.keys(this.#_controls);
    const result: Record<any, any> = {};
    return keys.reduce((result, controlName) => {
      result[controlName] = this.#_controls[controlName].value;
      return result;
    }, result)
  }

  constructor(controls: ListControlNames, validators: ValidationFn | ValidationFn[] = []) {
    super(wrapToArray(validators));
    this.#configureControls(controls);
  }

  setDirty(value: boolean) {
    this.dirty = value
  }

  setControls(controls: Record<string, AbstractControl>) {
    this.#configureControls({ ...controls })
  }

  setForm(form: ReactiveForm) {
    super.setForm(form);
    for (const control in this.#_controls) {
      this.#_controls[control].setForm(form);
    }
  }
  
  setValue(values: Array<any> = []): void {
    this.#updateValue(values);
  }

  removeControl(name: string) {
    delete this.#_controls[name]
  }

  contains(name: string) {
    return Boolean(this.#_controls[name])
  }
  
  reset() {
    for (const control in this.#_controls) this.#_controls[control].reset();
  }

  #updateValue(value: Record<any, any>[]) {
    const reset = (!value || Object.keys(value?.length).length === 0);
    for (const controlName in value) {
      if (this.#_controls?.[controlName]) {
        this.#_controls[controlName].value = reset ? null : value[controlName];
      }
    }
    this.#onChange()
  }

  #onChange() {
    this.validate();
  }

  #configureControls(controls: Record<string, AbstractControl>) {
    for (const controlName in controls) {
      this.#_controls[controlName] = controls[controlName];
      this.#_controls[controlName].parent = this;
    }
    defineProperties(this);
  }
}