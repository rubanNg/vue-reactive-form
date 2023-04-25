# Simplest way to validate yours  vue forms

## https://rubanng.github.io/reactive-forms-api


## FormControl with validation

#### create control
```js
const initialValue = null;
const control = new FormControl(initialValue);
```
#### usage in html
```html
<input type="text" v-model="control.value" />
```

## FormGroup with validation
```js

function checkTodoStatus<FormGroup>(control) {
  const todos = control.get<FormArray>('todos');
  if (todos.controls.every(control => control instanceof FormGroup)) {
    return todos.value.every(value => value.status === true) ? null : { 'errorStatus': 'all must be completed' }
  }

  return null;
}

const formGroup = new FormGroup({
  name: new FormControl(),
  age: new FormControl(),
  tosos: new FormArray([]),
}, [checkTodoStatus]);

// add new todo with status

formGroup.todos.addControl(new FormGroup({
  status: new FormControl(false),
  name: new FormControl(''),
}));

// or simple todo with only name

formGroup.todos.addControl(new FormControl('todo name')),

// or both

formGroup.todos.addControls([
  new FormGroup({
    status: new FormControl(false),
    name: new FormControl(''),
  }),
  new FormControl('todo name')
]);
```

## render FormArray
```html
  <div class="d-flex">
    <div>{{ formGroup.name.value }}<div>
    <div>{{ formGroup.age.value }}<div>
  </div>
  <template v-for="control in formGroup.todos.controls">
    <template v-if="control instanceof FormControl">
      <textarea v-model="control.value"></textarea>
    </template>
    <template v-if="control instanceof FormGroup">
      <input type="checkbox" v-model="control.status.value" />
      <textarea v-model="control.name.value"></textarea>
    </template>
  </template>
```

## Validation

#### There are two ways to validate data
1. synchronous functions
2. asynchronous functions

### synchronous functions

```js
const initialValue = null;
// generic type for control
function validator<FormControl>(control) {
  if (control.value == 1) {
    // return error
    return { 'one': 'value muse be 1' }
  }
  // ok
  return null
}
const control = new FormControl(initialValue, [validator]);
```
#### Show errors

```html
<pre>
  {{ control.errors }}
</pre>
```

### asynchronous function
```js
/*
  abortController is https://developer.mozilla.org/ru/docs/Web/API/AbortController
  It can be used to cancel requests.
  If the form is updated then all active asynchronous validators will be canceled and will be called
  abortController.abort();
  function should return promise or be async function
*/

function asyncValidator<FormControl>(control, abortController): Promise<ValidationErrors> {
  return fetch(url, {
    signal: abortController.signal
  }).then((response) => {
    if (response.error) {
      return {
        return { 'httpError': response.errorMessage }
      }
    }
    
    // ok
    return null;
  });

}
const control = new FormControl(initialValue, [asyncValidator]);
```

### pending
a status that makes it clear if asynchronous validators are working
If yes then return true otherwise false
