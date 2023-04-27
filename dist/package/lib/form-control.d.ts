import type { ValidationFn, AsyncValidationFn, ValueSubscribtion, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormControl<T = any> extends AbstractControl {
    private _value;
    private _listiners;
    private _initialValue;
    constructor(value?: T, validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get value(): T;
    private set value(value);
    get valid(): boolean;
    get valueChange(): ValueSubscribtion;
    reset(): void;
    setValue(value: T, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
}
