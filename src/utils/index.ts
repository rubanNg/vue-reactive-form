import { AbstractControl } from "../classes/abstract-conrol";


export function toArray<T>(value: T | T[]) {
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
  let value = parent;
  for (const segment of path.split(".")) {
    value = (value || parent);
    if (value[segment]) {
      value = value[segment];
    } else {
      return null;
    };
  }
  return value;
}


export function isPromise(value: any) {
  return typeof value === 'function' &&  typeof value.then === 'function' && typeof value.catch === 'function';
}