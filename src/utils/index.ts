import { AbstractControl } from "../classes/abstract-conrol";


export function wrapToArray<T>(value: T | T[]) {
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

export function toRecord(value: any): Record<string, any> {
  if (isObject(value)) return value as Record<string, any>;
  if (isArray(value)) {
    return value.reduce((result: any, arrayValue: any, index: number) => {
      result[index] = arrayValue;
      return result;
    }, {} as Record<string, any>)
  }
  return {};
}

export function toArray(value: any) {
  if (isObject(value)) {
    return Object.entries(value).map(([_, value]) => value);
  }
  if (isArray(value)) return value;
  return [value];
}

export function isPromise(value: any) {
  return typeof value === 'function' &&  typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isArray(value: any) {
  return toString.call(value) === "[object Array]"
}

export function isObject(value: any) {
  return toString.call(value) === "[object Object]"
}