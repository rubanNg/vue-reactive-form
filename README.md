Reactive vue forms


<a href="https://sleepy-bayou-98049.herokuapp.com/">DEMO</a>

<hr/>  

<a href="https://github.com/rubanNg/todos-form">DEMO SOURCE</a>

<hr/>  

```html
   <template>
    <div class="container justify-content-center">
      <h1 @click="add()">Hello</h1>

      <br>
      <div class="d-flex">
        <input type="text" class="form-control" v-model="group.get('selected').value">
        <button @click="add()" class="btn btn-success">Add</button>
      </div>
      <hr>


      <ul class="list-group">
        <li class="list-group-item" v-for="(control, index) in group.get('values').controls" :key="index">{{ control.value }}</li>
      </ul>


      <h1>FormGroup</h1>
      <div><pre>{{ group.value }}</pre></div>

      <h1>FormArray</h1>
      <div><pre>{{ simpleArrayForm.value }}</pre></div>

      <h1>Nested value</h1>
      <h3>group.get("test.nested.nested_nested.0.arrayGroup.array1.0")</h3>
      //OR
      <h3>group.get([test, nested, nested_nested , 0, arrayGroup, array1, 0])</h3>
      <div><pre>{{ simpleArrayForm.value }}</pre></div>
    </div>
  </template>
```

```javascript
  import { FormControl, FormGroup, FormArray, Validators } from 'reactive-vue-form'


    const group = new FormGroup({
      selected: new FormControl(''),
      values: new FormArray([]),
      test: new FormGroup({
        nested: new FormGroup({
          nested_nested: new FormArray([
            new FormGroup({
              arrayGroup: new FormGroup({
                array1: new FormArray([
                  new FormControl('deep')
                ])
              })
            }),
            new FormControl("array item")
          ]),
          single: new FormControl('single'),
          array: new FormArray([
            new FormGroup({
              arrayGroup: new FormGroup({
                array1: new FormArray([
                  new FormControl('deep')
                ])
              })
            }),
            new FormControl("array item")
          ])
        })
      })
    });

    const simpleArrayForm = new FormArray([
      new FormControl(1),
      new FormControl(2),
      new FormControl(3),
      new FormControl(4),
    ]);



    function add() {
      (group.controls.values as FormArray).addControls([
        new FormControl(group.controls.selected.value)
      ]);
      group.controls.selected.setValue('');
    }

```
```style
  <style>
    @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css'
  </style>
```
