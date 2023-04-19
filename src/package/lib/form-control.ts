import { reactive } from "vue";
import type { ListenerFn, ValidationFn, AsyncValidationFn, ValueSubscribtion, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";

export class FormControl extends AbstractControl {
  private _value = reactive<{ value: any }>({ value: null });
  private _listiners: ListenerFn[] = [];

  constructor(value: any = null, validators: ValidationFn[] = [], asyncValidators: AsyncValidationFn[] = []) {
    super(validators, asyncValidators);
    this._value.value = value;
    this.updateValidity({ updateParentValidity: false, runAsyncValidators: false });
  }

  get value(): any {
    return this._value.value;
  }

  set value(value: any) {
    this.setValue(value);
  }

  get valueChange(): ValueSubscribtion {
    const unsubscribeFn = (listener: ListenerFn) => {
      this._listiners = this._listiners.filter(fn => fn !== listener);
    }

    return {
      subscribe: (listener: ListenerFn) => {
        this._listiners.push(listener);
        return () => {
          unsubscribeFn(listener);
        };
      },
      unsubscribe: unsubscribeFn,
    }
  };

  reset() {
    this._value.value = null;
    this.setDirty(false);
    this.clearErrors();
  };

  setValue(value: any, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}) {
    this._value.value = value;
    this._listiners.forEach(listener => listener(this._value.value))
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }
}