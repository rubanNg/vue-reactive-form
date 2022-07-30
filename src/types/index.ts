import { AbstractControl } from "../classes/abstract-conrol";


export type ValidationErrors = Record<string, boolean>;
export type ValidationFn = (control: AbstractControl) => ValidationErrors | null;
