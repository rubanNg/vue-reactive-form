import { AbstractControl } from "../classes/abstract-conrol";


export function toArray(value: any | any[]) {
  return Array.isArray(value) ? value : [value];
}

export function defineProperties(target: any) {
  const result: PropertyDescriptorMap = {};
  for (const controlName in target.controls) {
    const existControl = target?.[controlName] instanceof AbstractControl;
    if (!existControl) {
      result[controlName] = {
        get: () => target.controls[controlName],
      }
    }
  }
  Object.defineProperties(target, result);
}

export function findControl(parent: any, path: string): AbstractControl {
  let value = null;
  for (const segment of path.split(".")) {
    value = (value || parent);
    if (value[segment]) {
      value = value[segment];
    } else break;
  }
  return value;
}