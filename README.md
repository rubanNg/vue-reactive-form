# Simplest way to validate yours  vue forms

## https://rubanng.github.io/reactive-forms-api

## FormControl

#### create control
```js
const initialValue = null;
const control = new FormControl(initialValue);
```
#### usage in html
```html
<input type="text" v-model="control.value" />
```


## FormGroup
```js
const formGroup = new FormGroup({
  name: new FormControl(),
  age: new FormControl(),
  tosos: new FormArray([]),
});
```
#### usage in html
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

### add child

```js
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

## FormArray
```js
const formArray = new FormArray([
  new FormControl(),
  new FormArray([
    new FormControl(),
  ]),
  new FormArray([
    new FormGroup({
      control: new FormFormArray([]),
    }) 
  ]),
]);
```

#### usage in html
```html
  <template v-for="control in formArray.controls">
    <template v-if="control instanceof FormControl">
      <textarea v-model="control.value"></textarea>
    </template>
    <template v-if="control instanceof FormArray">
      <render-array :array="control.controls" />
    </template>
  </template>
```


# Validation

### There are two ways to validate data
1. synchronous functions
2. asynchronous functions

## synchronous functions

#### FormControl

```js
const initialValue = null;
// generic type for control
function validator<FormControl>(control) {
  if (control.value != 1) {
    // if not valid
    return { 'one': 'value must be 1' }
  }
  // if valid
  return null
}
const control = new FormControl(initialValue, [validator]);
```


#### FormGroup

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
  tosos: new FormArray([
    new FormGroup({ status: new FormControl(false), name: new FormControl() }),
    new FormGroup({ status: new FormControl(false), name: new FormControl() }),
    new FormGroup({ status: new FormControl(false), name: new FormControl() })
  ]),
}, [checkTodoStatus]);
```

#### FormArray

```js
function controlsLength<FormArray>(control) {
  if (control.controls.length < 2)) {
    return { 'controlsLength': 'invalid length' }
  }

  return null;
}

const formGroup = new FormArray({
  new FormControl(),
  new FormControl(),
}, [controlsLength]);
```



### asynchronous function

## Everything is exactly the same as with synchronous validators, only the validator must return a promise

```js
/*
  abortController - https://developer.mozilla.org/en/docs/Web/API/AbortController.
  It can be used to cancel requests.
  If the form is updated, then all active asynchronous validators will be canceled and the method will be called
  abortController.abort(); 
  dont call abortController.abort() inside validator just return error object or null
  
  
  validator must return a promise or be an asynchronous function
*/

function asyncValidator<FormControl>(control, abortController): Promise<ValidationErrors> {
  return fetch(url, {
    signal: abortController.signal
  }).then((response) => {
    // if not valid
    if (response.error) {
      return {
        return { 'httpError': response.errorMessage }
      }
    }
    
    // if valid
    return null;
  });

}
const control = new FormControl(initialValue, [/*sync validators*/], [asyncValidator]);
```

## property
# pending
Allows you to control the processes of synchronous verification
If it returns true, then 1 or more asynchronous validators in progress
