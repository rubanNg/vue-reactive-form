import { AbstractControl } from "../classes/abstract-conrol";


export type ValidationErrors = Record<string, any>;
export type ValidationFn = (control: AbstractControl) => ValidationErrors | null;
