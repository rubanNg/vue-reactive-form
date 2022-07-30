import { App, DirectiveBinding, VNode } from "@vue/runtime-core"
import { AbstractControl } from "../classes/abstract-conrol";


function updateModel(event: Event) {
  const element = (event.target as HTMLInputElement & { bindingValue: any });
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
      mounted: (el: HTMLElement & { bindingValue: any }, binding: DirectiveBinding, vnode: VNode, oldVnode) => {
        if (!(el?.hasOwnProperty("value"))) return;
        const bindingValue = binding.value;
        isAbstractControl(bindingValue);
        el.bindingValue = bindingValue;
        el.addEventListener('input', updateModel);
      },
      unmounted: (el: HTMLInputElement, binding: DirectiveBinding, vnode: VNode, oldVnode) => {
        el.removeEventListener('input', updateModel);
      }
    })
  }
}