Reactive vue forms


<a href="https://sleepy-bayou-98049.herokuapp.com/">DEMO</a>

<hr/>  

<a href="https://github.com/rubanNg/todos-form">DEMO SOURCE</a>

<hr/>  


```html
  <template>
    <div class="container justify-content-center">
      <h1 @click="add()">Signle control</h1>

      <br>
      <div class="d-flex flex-column">
        <div class="d-flex">
          <input type="text" :class="{ 'is-invalid': single.hasError('required') }" class="form-control" v-model="single.value">
          <button @click="logControl(single)" :disabled="!single.value" class="btn btn-success">log control to console</button>
        </div>
        <span style="color: red" v-if="single.hasError('required')">Обязательное поле!!!</span>
      </div>
      <hr>

      <h1 @click="add()">Array control</h1>

      <br>
      <div class="d-flex flex-column">
        <div class="d-flex">
          <button @click="manageControl('add')" class="btn btn-success">add value</button>
          <button @click="logControl(array)" class="btn btn-success">log control to console</button>
        </div>
        <ul class="list-group">
          <li class="list-group-item" v-for="(control, index) in array.controls" :key="index">
          <div class="d-flex justify-content-between">
              {{ control.value }}
              <button @click="manageControl('remove', index)" class="btn btn-danger">remove</button>
          </div>
          </li>
        </ul>
      </div>
      <hr>


      <h1 @click="add()">Group control</h1>

      <br>
      <div class="d-flex flex-column">
        <div class="d-flex">
          <input type="text" :class="{ 'is-invalid': group.get('name').errors }" class="form-control" v-model="group.get('name').value">
        </div>
        <span style="color: red" v-if="group.get('name').errors">
          raw errors {{ group.get('name').errors }}
        </span>
        <div class="d-flex">
          <input type="number" :class="{ 'is-invalid': group.get('age').errors }" class="form-control" v-model="group.get('age').value">
        </div>
        <span style="color: red" v-if="group.get('age').errors">
          raw errors {{ group.get('age').errors }}
        </span>
      </div>
      <hr>
      
    </div>
  </template>
```
```javascript
  <script lang="ts" setup>
    import { FormControl, FormGroup, FormArray, Validators, AbstractControl } from 'reactive-vue-form'


    const single = new FormControl('value', [Validators.required]);

    function logControl(control: AbstractControl) {
      console.log({ control })
    }

    const array = new FormArray([]);


    function manageControl(action: string, index: number) {
      if (action === "add") array.addControls([new FormControl(Date.now())])
      if (action === "remove") array.removeAt(index)
    }

    const group = new FormGroup({
      name: new FormControl('', [Validators.required]),
      age: new FormControl('', [
        Validators.required, 
        (control) => { return control.value < 18 ? { young: "Не меньше 18!!!" } : null; }
      ]),
    });

  </script>
```
```style
  <style>
    @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css'
  </style>
```
