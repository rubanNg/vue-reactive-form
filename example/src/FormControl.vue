<script setup lang="ts">
import { AbstractControl, FormControl } from "../../src";
import { ValidationErrors } from "@/package/types";
import { computed } from "vue";

function validator(control: AbstractControl): ValidationErrors {
  if ((control as FormControl).value != 'valid@mail.com') {
    return {
      invalidValue: 'value must be "valid@mail.com"',
    }
  }
  return null;
}

const control = new FormControl('valid@mail.ru', [validator], [
  async (control) => {
    console.log('async');
    return {
      async: 'error'
    };
  }
]);
</script>

<template>
  <div id="form-control">
    <h2>Form Control</h2>
    <h4>
      <a href="https://google.com">View the source code for this example</a>
    </h4>

    <div class="mb-3">
      <label class="form-label">Email</label>
      <input type="text" v-model="control.value" class="form-control" placeholder="valid@mail.com">

      <div v-if="control.hasError('invalidValue') && control.dirty">
        <p style="color:red">{{ control.errors.invalidValue }}</p>
      </div>

      <div v-if="control.hasError('async') && control.dirty">
        <p style="color:red">{{ control.errors.async }}</p>
      </div>
    </div>

    <div class="mb-3">
      <p>Valid: <b>{{ control.value }}</b></p>
      <p>Valid: <b>{{ control.valid }}</b></p>
      <p>Invalid: <b>{{ control.invalid }}</b></p>
      <p>
        Errors:
        <pre>{{ control.errors }}</pre>
      </p>
    </div>

    <div class="mb-3">
      <button class="btn btn-success" :disabled="control.invalid">Send</button>
    </div>
  </div>
</template>
