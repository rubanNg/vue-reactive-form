import { FormArray, FormGroup, ReactiveForm } from "..";
import { AbstractControl } from "../classes/abstract-conrol";


export function wrapToArray<T>(value: T | T[]) {
  return (isArray(value) ? value : [value]);
}

export function defineProperties(target: any) {
  const result: PropertyDescriptorMap = {};
  for (const controlName in target.controls) {
    const existControl = target?.[controlName] instanceof AbstractControl;
    if (!existControl) {
      result[controlName] = {
        get: () => target.controls[controlName],
        configurable: true,
        enumerable: true,
      }
    }
  }
  Object.defineProperties(target, result);
}

export function defineProperty(target: any, controlName: string) {
  Object.defineProperty(target, controlName, {
    get: () => target.controls[controlName],
    configurable: true,
    enumerable: true,
  });
}

export function undefineProperties(object: any, properties: string | string[]) {
  for (const property of toArray(properties)) {
    delete object[property]; 
  }
}

export function find<T>(parent: any, path: string): T {
  let value = parent;
  for (const segment of path.split(".")) {
    value = (value || parent);
    if (value[segment]) {
      value = value[segment];
    } else {
      return null;
    };
  }
  return value as T;
}

export function toRecord<T = any>(value: any): Record<string, T> {
  if (isObject(value)) return value as Record<string, any>;
  if (isArray(value)) {
    return value.reduce((result: any, arrayValue: any, index: number) => {
      result[index] = arrayValue;
      return result;
    }, {} as Record<string, T>)
  }
  return {};
}

export function toArray<T = any>(value: any): T[] {
  if (isObject(value)) {
    return Object.entries(value).map(([_, value]) => value) as T[];
  }
  if (isArray(value)) return value as T[];
  return [value] as T[];
}

export function isPromise(value: any) {
  return value && typeof value === 'function' &&  typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isArray(value: any): value is any[] {
  return toString.call(value) === "[object Array]"
}

export function isObject(value: any): value is {} {
  return toString.call(value) === "[object Object]"
}


export function interceptControlsGetters<T>(object: any): T {
  return new Proxy(object, {
    get(target, property) {
      if (property in target) {
        [property, target, property in target]
        return Reflect.get(target, property);
      } else if (property in (target.controls || {})) {
        [property, target.controls, property in target.controls]
        return Reflect.get(target.controls, property);
      } else return null;
    }
  })
}