import type { AbstractControl } from "../lib/abstract-conrol";
import { ValidationErrors } from "../types";

export class Validators {
  static required(control: AbstractControl): ValidationErrors {
    return [
      (control.value as { length: number })?.length === 0,
      control?.value === null,
      control?.value === undefined,
    ].some(value => value === true) ? { required: 'value is a required' } : null;
  }

  static max(value: number) {
    return function (control: AbstractControl): ValidationErrors {
      return Number(control.value) > value ? { max: `value must be less than or equal to ${value}` } : null;
    }
  }

  static min(value: number) {
    return function (control: AbstractControl): ValidationErrors {
      return Number(control.value) >= value ? null : { min: `value must be greater than or equal to ${value}` };
    }
  }

  static maxLength(value: number) {
    return function (control: AbstractControl): ValidationErrors {
      return (control.value as { length: number })?.length <= value ? null : {
        maxLength: `value length must be less than or equal to ${value}`,
      };
    }
  }

  static minLength(value: number) {
    return function (control: AbstractControl): ValidationErrors {
      return (control.value as { length: number })?.length < value ? {
        minLength: `value length must be greater than or equal to ${value}`,
      } : null;
    }
  }

  static email(control: AbstractControl): ValidationErrors {
    return (control.value as string).match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi)?.length > 0 ? null : {
      email: `value must be a valid email`,
    };
  }
}
