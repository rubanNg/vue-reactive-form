import { AbstractControl } from "..";

export class Validators {
  
  static required(control: AbstractControl) {
    const result = Boolean(control.value);
    if (!result) return { required: true }
    return null;
  }

  static email(control: AbstractControl) {
    const result =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i.test(String(control.value || ''));
    if (!result) return { email: true }
    return null;
  }

  static min(value: number) {
    return function(control: AbstractControl) {
      const result = Number(control.value || '')
      if (isNaN(result) || result < value) return { min: true }
      return null;
    }
  }

  static max(value: number) {
    return function(control: AbstractControl) {
      const result = Number(control.value || '')
      if (isNaN(result) || result > value) return { max: true }
      return null;
    }
  }

  static minLength(value: number) {
    return function(control: AbstractControl) {
      const result = String(control.value || '')
      if (result.length < value) return { minLength: true }
      return null;
    }
  }

  static maxLength(value: number) {
    return function(control: AbstractControl) {
      const result = String(control.value || '')
      if (result.length > value) return { maxLength: true }
      return null;
    }
  }

  static pattern(regex: RegExp) {
    return function(control: AbstractControl) {
      const result = String(control.value || '')
      if (result.match(regex) === null) return { pattern: true }
      return null;
    }
  }

}