<script setup lang="ts">
import { AbstractControl, FormControl, FormGroup } from "../../src";
import { ValidationErrors } from "@/package/types";
import { computed } from "vue";

const groupControl = new FormGroup({
  login: new FormControl(),
  password: new FormControl(),
});

const pending = computed(() => groupControl.pending);
const invalid = computed(() => groupControl.invalid);


</script>

<template>
  <h2 id="form-group">FormGroup</h2>
  <h4>
    <a href="https://google.com">View the source code for this example</a>
  </h4>

  <div class="mb-3">
    <label class="form-label">Login</label>
    <input type="text" v-model="groupControl.login.value" class="form-control" placeholder="">
  </div>

  <div class="mb-3">
    <label class="form-label">Password</label>
    <input type="password" v-model="groupControl.password.value" class="form-control" placeholder="">
  </div>
  
  <div class="mb-3">
    <button class="btn btn-success" :disabled="invalid && pending">{{ pending ? 'Pending...' : 'Send' }}</button>
  </div>
</template>
