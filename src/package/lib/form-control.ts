import { reactive } from "vue";
import type { ListenerFn, ValidationFn, AsyncValidationFn, ValueSubscribtion, ControlUpdateOptions, ReactiveValue } from "../types";
import { AbstractControl } from "./abstract-conrol";

export class FormControl<TValue = any> extends AbstractControl {
  #currentValue: ReactiveValue<TValue> = reactive({ value: undefined });
  #listiners: ListenerFn[] = [];
  

  constructor(value: TValue = undefined, validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]) {
    super(validators, asyncValidators);
    this.#currentValue.value = value;
    this.updateValidity({ updateParentValidity: false, runAsyncValidators: false });
  }

  get<TResult extends AbstractControl>(path: string | string[]): TResult | null {
    return null;
  }

  get value(): TValue {
    return this.#currentValue.value;
  }

  private set value(value: TValue) {
    this.setValue(value);
  }

  get valid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  get invalid(): boolean {
    return this.valid === false;
  }

  get valueChanged(): ValueSubscribtion {
    const unsubscribeFn = (listener: ListenerFn) => {
      this.#listiners = this.#listiners.filter(fn => fn !== listener);
    }

    return {
      subscribe: (listener: ListenerFn) => {
        this.#listiners.push(listener);
        return () => {
          unsubscribeFn(listener);
        };
      },
      unsubscribe: unsubscribeFn,
    }
  };

  reset(): void {
    this.setDirty(false);
    this.clearErrors();
  };

  setValue(value: TValue, { updateParentValidity = true, runAsyncValidators = true, updateParentDirty = true }: ControlUpdateOptions = {}): void {
    this.#currentValue.value = value;
    this.#listiners.forEach(listener => listener(this.#currentValue.value))
    this.updateValidity({ updateParentValidity, runAsyncValidators });
    this.setDirty(true, updateParentDirty);
  }
}