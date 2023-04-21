<script setup lang="ts">
import AbstractControlApi from './abstract-control/AbstractControlApi.vue';
import FormControlApi from './form-control/FormControlApi.vue';
import FormGroupApi from './form-group/FormGroupApi.vue';
import FormArrayApi from './form-array/FormArrayApi.vue';
</script>

<template>
  <div style="margin-left: 100px; margin-right: 100px;">
    <h1 class="display-2 text-center pb-5">Documentation</h1>
    <ul class="list-group pb-5">
      <li class="list-group-item">
        <a href="#abstract-control">Api</a>
        <ul class="list-group">
          <li class="list-group-item">
            <a href="#abstract-control-api">AbstractControl</a>
          </li>
          <li class="list-group-item">
            <a href="#form-control-api">FormControl</a>
          </li>
          <li class="list-group-item">
            <a href="#form-group-api">FormGroup</a>
          </li>
          <li class="list-group-item">
            <a href="#form-array-api">FormArray</a>
          </li>
        </ul>
      </li>
      <li class="list-group-item">
        <a href="https://stackblitz.com/edit/vue-reactive-forms?file=src%2FApp.vue" target="_blank">Examples</a>
      </li>
    </ul>
    <AbstractControlApi />
    <FormControlApi />
    <FormGroupApi />
    <FormArrayApi />
  </div>
</template>

<style>
.list-group-item {
  border: none;
  padding: 0;
  padding-left: 30px;
}
.list-group {
  box-shadow: none;
  font-size: 32px;
}
.container {
  margin-right: 100px;
  margin-left: 100px;
  width: calc(100% - 200px) !important;
}

a {
  text-decoration: none !important;
  cursor: pointer;
}

</style>



