import { App, DirectiveBinding, VNode } from "@vue/runtime-core"
import { FormControl } from "..";
import { AbstractControl } from "../classes/abstract-conrol";


let removeListener: () => void = null;

function updateModel(event: Event) {
  const element = (event.target as HTMLInputElement & { bindingValue: AbstractControl });
  element.bindingValue.value = element.value;
}

function isAbstractControl(value: any) {
  if (!(value instanceof AbstractControl)) {
    throw new Error("v-form-control directive value must be AbstractControl instance");
  }
}


export const formControlDirective = {
  install: (app: App<any>) => {
    app.directive('form-control', {
      mounted: (element: HTMLElement & { value?: any, bindingValue: AbstractControl }, binding: DirectiveBinding, vnode: VNode, oldVnode) => {
        if (("value" in element) === false) return;
        isAbstractControl(binding.value);
        element.bindingValue = binding.value;
        element.addEventListener('input', updateModel);
        removeListener = (element.bindingValue as FormControl).detectChange((value) => {
          (element.value !== value) && (element.value = value);
        });
      },
      unmounted: (el: HTMLInputElement, binding: DirectiveBinding, vnode: VNode, oldVnode) => {
        el.removeEventListener('input', updateModel);
        (removeListener && typeof removeListener === 'function') && removeListener();
      }
    })
  }
}