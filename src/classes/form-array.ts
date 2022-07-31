
import { ReactiveForm } from "..";
import { ValidationErrors, ValidationFn } from "../types";
import { wrapToArray, findControl, defineProperties } from "../utils";
import { AbstractControl } from "./abstract-conrol";


export class FormArray extends AbstractControl {

  #_controls: Array<AbstractControl> = [];

  dirty: boolean = false;
  parent: AbstractControl = null;

  get controls() {
    return this.#_controls;
  }
  
  get valid() {
    return this.#_controls.some(s => !s.valid) ? false : this.validate();
  }

  get value() {
    return this.#_controls.map(control => control.value);
  }

  constructor(controls: Array<AbstractControl>, validators: ValidationFn[] = []) {
    super(validators);
    this.#configureControls(controls);
  }

  setDirty(value: boolean) {
    this.dirty = value
  }

  setControls(controls: Array<AbstractControl>) {
    this.#configureControls(controls);
  }

  removeAt(index: number) {
    this.controls.splice(index, 1);
  }

  reset() {
    for (const control of this.#_controls) {
      control.value = null;
    }
  }

  setValue(value: any[] | { index: number, value: any }[]): void {
    this.#updateValue(value);
  }

  setForm(form: ReactiveForm) {
    super.setForm(form);
    for (const control of this.#_controls) {
      control.setForm(form);
    }
  }

  #updateValue(value: any[] | { index: number, value: any }[]) {
    if(!value || value?.length === 0) {
      this.reset();
    } else {
      for (let index = 0; index < value.length; index++) {
        // если массив бошльше чем полей в  массиве
        if (index > this.#_controls.length - 1) break;
        const needUpdateByIndex = (value?.[index]?.index !== null) && (value?.[index]?.index !== undefined);
        if (needUpdateByIndex) this.#updateByIndex(value[index]);
        else {
          this.#_controls[index].value = value[index];
        }
      }
    }

    this.#onChange()
  }

  #updateByIndex({ index, value }: { index: number, value: any }) {
    this.#_controls[index].value = value;  
  }

  #onChange() {
    this.validate();
  }

  #configureControls(controls: Array<AbstractControl>) {
    for (const control of controls) {
      control.parent = this;
    }
    this.#_controls.push(...controls);
    defineProperties(this);
  }

}