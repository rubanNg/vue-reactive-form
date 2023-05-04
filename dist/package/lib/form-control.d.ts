import type { ValidationFn, AsyncValidationFn, ValueSubscribtion, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormControl<TValue = any> extends AbstractControl {
    private readonly _value;
    private _listiners;
    constructor(value?: TValue, validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
    get value(): TValue;
    private set value(value);
    get valid(): boolean;
    get invalid(): boolean;
    get valueChanged(): ValueSubscribtion;
    reset(): void;
    setValue(value: TValue, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
}
