import type { AbstractControl } from "../lib/abstract-conrol";
type Controls = {
    controls?: Array<AbstractControl> | {
        [key: string | number]: AbstractControl;
    };
} & unknown;
export declare function findFormControl<T extends AbstractControl>(parent: AbstractControl & Controls, path: string | string[]): T;
export {};
