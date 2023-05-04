import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormArray extends AbstractControl {
    private readonly _controls;
    constructor(controls: AbstractControl[], validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get controls(): AbstractControl[];
    get value(): any[];
    get valid(): boolean;
    get invalid(): boolean;
    get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
    addControl(control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    addControls(controls: AbstractControl[], { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setControl(index: number, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setControls(controls: {
        index: number;
        control: AbstractControl;
    }[], { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setValue(values: unknown[], { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    at<TResult extends AbstractControl>(index: number): TResult;
    firstChild<TResult extends AbstractControl>(): TResult;
    lastChild<TResult extends AbstractControl>(): TResult;
    removeAt(index: number, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    reset(): void;
    updateAt(index: number, value: unknown, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    private _updateDynamicProperties;
    private _updateCurrentControls;
    private _insertControlByIndex;
    private _removeControlByIndex;
}
