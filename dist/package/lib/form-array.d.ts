import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormArray extends AbstractControl {
    private _controls;
    constructor(controls: AbstractControl[], validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get controls(): AbstractControl[];
    get value(): unknown[];
    get valid(): boolean;
    get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
    addControl(control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    addControls(controls: AbstractControl[], { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setControl(index: number, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setValue(values: unknown[], { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    at<TResult extends AbstractControl>(index: number): AbstractControl;
    firstChild<TResult extends AbstractControl>(): AbstractControl;
    lastChild<TResult extends AbstractControl>(): AbstractControl;
    contains(index: number): boolean;
    removeAt(index: number, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    reset(): void;
    updateAt(index: number, value: unknown, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    private _setUpControls;
    private updateDynamicProperties;
}
