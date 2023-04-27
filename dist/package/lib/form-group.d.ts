import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormGroup extends AbstractControl {
    private _controls;
    constructor(controls: {
        [key: string | number]: AbstractControl;
    }, validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get valid(): boolean;
    get controls(): {
        [key: string]: AbstractControl;
        [key: number]: AbstractControl;
    };
    get value(): {
        [key: string]: unknown;
        [key: number]: unknown;
    };
    addControl(name: string, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
    setControl(name: string, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setValue(value: {
        [key: string | number]: unknown;
    }, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    removeControl(name: string, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    at<TResult extends AbstractControl>(name: string): AbstractControl;
    contains(controlName: string): boolean;
    reset(): void;
    private _setUpControls;
    private updateDynamicProperties;
}
