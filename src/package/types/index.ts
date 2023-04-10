import type { AbstractControl } from "../lib/abstract-conrol";

type UnsubscribeFn = (listener: ListenerFn) => void

export type CancelablePromise<T = unknown> = Promise<T> & { cancel: () => void };
export type FormGroupValue = { [key: string | number]: any };
export type ListenerFn = (value: any) => void;
export type ValidationErrors = { [key: string]: boolean | string };
export type ValidationFn<T extends AbstractControl = AbstractControl> = (control: T) => ValidationErrors | null;
export type AsyncValidationFn<T extends AbstractControl = AbstractControl> = (control: T, abortController?: AbortController) => Promise<ValidationErrors | null>;
export type ValueSubscribtion = { subscribe: (listener: ListenerFn) => UnsubscribeFn, unsubscribe: UnsubscribeFn };
export type ControlUpdateOptions = { updateParentValidity: boolean }