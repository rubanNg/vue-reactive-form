import type { AbstractControl } from "../lib/abstract-conrol";
import type { FormArray } from "../lib/form-array";
import type { FormGroup } from "../lib/form-group";

export function findFormControl(parent: FormGroup | FormArray, path: string | string[]) {
  if (!parent) return null;
  
  function findControl(controls: any, name: any) {
    return controls?.[name];
  }

  let value = parent;
  const _path = typeof path === 'string' ? path.split("."): path;

  for (const name of _path) {
    const control = findControl(value?.controls, name);
    if (control) value = control;
    else return null;
  }

  return value as AbstractControl;
}