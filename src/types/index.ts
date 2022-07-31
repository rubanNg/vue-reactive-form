import { AbstractControl } from "../classes/abstract-conrol";


export type ArrayState = AbstractControl[];
export type ObjectState = Record<string, AbstractControl>;
export type ValidationErrors = Record<string, boolean | string>;
export type ValidationFn<T = AbstractControl> = (control: T) => ValidationErrors | null;
