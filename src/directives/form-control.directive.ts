import { App, DirectiveBinding, VNode } from "@vue/runtime-core"
import { FormControl } from "..";
import { AbstractControl } from "../classes/abstract-conrol";


let removeListener: () => void = null;

function updateModel(event: Event) {
  const element = (event.target as HTMLInputElement & { bindingValue: AbstractControl });
  element.bindingValue.value = element.value;
}

export const formControlDirective = {
  install: (app: App<any>) => {
    app.directive('form-control', {
      mounted: (element: HTMLElement & { value?: any, bindingValue: AbstractControl }, binding: DirectiveBinding, vnode: VNode, oldVnode) => {
        if (("value" in element) === false) return;
        element.bindingValue = binding.value;
        element.addEventListener('input', updateModel);
        removeListener = (element.bindingValue as FormControl)?.valueChanged((value) => {
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