import type { ValidationFn, AsyncValidationFn, ControlUpdateOptions, ObjectKey } from "../types";
import { AbstractControl } from "./abstract-conrol";
export declare class FormGroup<FormGroupControls extends {
    [K in keyof FormGroupControls]: AbstractControl;
} = any> extends AbstractControl {
    #private;
    constructor(controls: FormGroupControls, validators?: ValidationFn[], asyncValidators?: AsyncValidationFn[]);
    get valid(): boolean;
    get invalid(): boolean;
    get controls(): FormGroupControls;
    get value(): { [K in keyof FormGroupControls]: unknown; };
    get<TResult extends AbstractControl>(path: string | string[]): TResult | null;
    addControl(name: ObjectKey, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    addControls(controls: {
        [key: ObjectKey]: AbstractControl;
    }, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setControl(name: ObjectKey, control: AbstractControl, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setControls(controls: {
        [key: ObjectKey]: AbstractControl;
    }, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    setValue(value: {
        [key: ObjectKey]: unknown;
    }, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    removeControl(name: string, { updateParentValidity, runAsyncValidators, updateParentDirty }?: ControlUpdateOptions): void;
    at<TResult extends AbstractControl>(name: ObjectKey): AbstractControl;
    contains(controlName: ObjectKey): boolean;
    reset(): void;
}
