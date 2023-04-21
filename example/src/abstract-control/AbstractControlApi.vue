<script setup lang="ts">
import { reactive } from 'vue';
import json from './abstract-control-api.json';

const jsonValues = reactive(json);
</script>

<template>
  <div id="abstract-control-api">
    <h1 class="display-1 pb-5">AbstractControl api</h1>
    <div class="ps-5">
      <template v-for="(value, key) of jsonValues" :key="key">
        <h1 class="display-4">{{ key }}</h1>
        <table class="table table-striped" v-if="key === 'getters'">
          <thead>
            <tr>
              <th style="font-weight: 100">Name</th>
              <th style="font-weight: 100">Type</th>
              <th style="font-weight: 100">Default</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) of value" :key="index">
              <tr v-for="(infoItem, infoKey) of item" :key="infoItem.name" :id="infoItem.name">
                <template v-if="infoKey === 'info'">
                  <td style="font-weight: bold; color: rgb(24,103,192); font-size: 16px;">
                    <a :href="`#${infoItem.name}`">
                    <span>#</span> {{ infoItem.name }}
                    </a>
                  </td>
                  <td style="color: #690;">
                    <code>{{ infoItem.type }}</code>
                  </td>
                  <td style="color: #905;">
                    <code>{{ infoItem.default }}</code>
                  </td>
                </template>
                <template v-else>
                  <td colspan="3">
                    <p v-html="infoItem" style="font-size: 18px;padding: 10px;"></p>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
        <table class="table table-striped" v-if="key === 'methods'">
          <thead>
            <tr>
              <th style="font-weight: 100">Name</th>
              <th style="font-weight: 100">Arguments</th>
              <th style="font-weight: 100">Return</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) of value" :key="index">
              <tr v-for="(infoItem, infoKey) of item" :key="infoItem.name" :id="infoItem.name">
                <template v-if="infoKey === 'info'">
                  <td style="font-weight: bold; color: rgb(24,103,192); font-size: 16px;">
                    <a :href="`#${infoItem.name}`">
                    <span>#</span> {{ infoItem.name }}
                    </a>
                  </td>
                  <td style="color: #690;">
                    <code>{{ infoItem.arguments }}</code>
                  </td>
                  <td style="color: #905;">
                    <code>{{ infoItem.returnType }}</code>
                  </td>
                </template>
                <template v-else>
                  <td colspan="3">
                    <p v-html="infoItem" style="font-size: 18px;padding: 10px;"></p>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<style scoped>
tr td a span {
  opacity: 0;
}
tr td a:hover span {
  opacity: 1;
}
</style>