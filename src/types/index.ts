import { AbstractControl } from "../classes/abstract-conrol";


export type ValidationErrors = Record<string, boolean>;
export type ValidationFn = <TValue>(control: AbstractControl<TValue>) => ValidationErrors | null;
