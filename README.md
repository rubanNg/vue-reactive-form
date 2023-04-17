```html
  <input type="text" v-model="control.value" />
```

```js
// simple control with validator
  const control = new FromControl('defaultValue', [
    (control) => (control as FormControl).value == 1 ? null: { notOne: 'must be 1' } 
  ]);
```




```js 
// simple control with validator
const control = new FromControl('defaultValue', [
  (control) => (control as FormControl).value == 1 ? null: { notOne: 'must be 1' } 
]);

// get value
const value = control.value;
// gwt state
const valid = control.valid;
// set valie
// if updateParentValidity  === false validate only self control
// else valiudate parent control and parent of parent and etc
control.setValue('new value', { updateParentValidity: false });

// get errors
// look like  { 'errorName': 'error text', 'errorName2': 'error text 2' }
const errors = control.errors;

// rewrite current errors with new errors
control.setErrors({ error: 'new error' })

// add errors to current errors
control.addErrors({ error: 'new error' })

control.hasError('errorName');
// contains all errors
control.hasErrors(['error1', 'error3']);
// contains any error
control.hasAnyError(['error1', 'error3']);

// form group
const group = new FormGroup({
    name: new FromControl(),
    age: new FromControl(0, [
      (control) => (control as FormControl).value < 18 ? null: { small: 'invalid value' } 
    ]),
    period: new FormGroup({
        dateStart: new FormControl(new Date()),
        dateEnd: new FormControl(new Date()),
    });
});

// get nested control
const endDate = group.period.dateEnd as FormControl;
// or
const endDate = group.get<FormControl>('period.dateEnd');

// add new control
group.addControl('subName', new FormControl());

// remvoe control by name
group.removeControl('subName');




//form array

const formArray = new FormArray([
  new FormGroup({
    values: new FormArray([
      new FormControl('value 1'),
      new FormControl('value 1'),
      new FormControl('value 1'),
      new FormGroup({
        subValues: new FormArray([
          new FormControl('subvalue1'),
        ])
      }),
    ]),
  })
]);

// get nested control
const formArraySubValues = array.period[0].values[3].subValues as FormArray;
// or
const subValue1 = group.get<FormArray>('period.0.values.3.subValues.0');

const controlsOfFormArray = formArray.controls;

const formGroup_values = formArray.at(0).get('values');
```

```html
  <template v-for="control in controlsOfFormArray">
    <template v-if="control instanceof FormControl">
      <input v-model="control.value" />
    </template>
    <template v-else>
      <template v-for="subControl in control.subValues)">
        <input v-model="subControl.value" />
      </template> 
    </template> 
  </template>  
```



