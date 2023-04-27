import type { AbstractControl } from "../lib/abstract-conrol";
import { ValidationErrors } from "../types";
export declare class Validators {
    static required(control: AbstractControl): ValidationErrors;
    static max(value: number): (control: AbstractControl) => ValidationErrors;
    static min(value: number): (control: AbstractControl) => ValidationErrors;
    static maxLength(value: number): (control: AbstractControl) => ValidationErrors;
    static minLength(value: number): (control: AbstractControl) => ValidationErrors;
    static email(control: AbstractControl): ValidationErrors;
}
