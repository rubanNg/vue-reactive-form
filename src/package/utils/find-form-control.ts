import type { AbstractControl } from "../lib/abstract-conrol";
import type { FormArray } from "../lib/form-array";
import type { FormGroup } from "../lib/form-group";

type Controls = {
  controls?: Array<AbstractControl> | { [key: string | number]: AbstractControl }
} & unknown

function find(controls: Array<AbstractControl> | { [key: string | number]: AbstractControl }, name: string | number) {
  return (controls as { [key: string | number]: AbstractControl })?.[name];
}

export function findFormControl<T extends AbstractControl>(parent: AbstractControl & Controls, path: string | string[]) {
  if (!parent) return null;
  
  let value: AbstractControl & Controls = parent;
  const _path = typeof path === 'string' ? path.split(".") : path;

  for (const name of _path) {
    const control = find(value?.controls, name);
    if (control) value = control;
    else return null;
  }

  return value as T;
}