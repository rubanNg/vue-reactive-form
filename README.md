Reactive vue forms

```javascript

//Create form

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { ReactiveForm } from './context/reactive-form'
  import { FormArray } from './context/form-array'
  import { FormControl } from './context/form-control';
  import { FormGroup } from './context/form-group';


  const form = new ReactiveForm({
    user: new FormGroup({
      name: new FormGroup({
        // null value
        first: new FormControl(),
        second: new FormControl("secondName')
      }),
      // with default value
      age: FormControl(10) 
    }),
    adress: new FormGroup({
      // null value
      street: new FormControl("Kulal"),
      geo: new FormArray([
        new FormControl(-37.3159)
        new FormControl(81.1496)
      ])
    }),
    contacts: new FormGroup({
      phone: new FormControl("1-770-736-8031 x56442"),
      website: new FormControl("hildegard.org"),
    })
  });


  // get user
  const user = form.get("user").value;
  const user2 = form.user.value;   

  // get second name
  const userNameSecond = form.get("user.name.second").value; 
  const userNameSecond2 = form.user.name.second.value;

  //update user second name
  form.get("user.name.second").setValue("another second name");

  //update geo
  // controls as array
  const [control1, control2] = form.get("adress.geo").controls;
  const control1 = form.get("adress.geo.0");
  const control2 = form.get("adress.geo.1");
  const [-37.3159, 81.1496] = form.get("adress.geo").value;



  //Validate forms
  function validateName(name: string) {
    return (control) => {
      if (control.value === name) return null;
      return {
        nameEqualError: true
      }
    }
  }

  const validateForm = new ReactiveForm({
    user: new FormControl(null, [validateName("name 1")]),
  });

</script>

```


```html
  <template>
    <input type="text" v-model="form.user.value" />
    <span v-if="form.user.hasError('nameEqualError')">Error text here</span>
  </template>
```


Can also be used as a directive


```javascript
  //main.js
  import { formControlDirective } from './directive'
  const app = createApp(App);
  app.use(formControlDirective);

  //App.vue
  const form = new ReactiveForm({
    name: new FormControl(),
    option: new FormControl(3)
  })

  <input v-form-control="form.name" type="text">
  <select v-form-control="form.option">
    <option v-for="value in [1, 2, 3]" :key="value" :value="value">{{ value }}</option>
  </select>
```


Inside custom component

```html
  // Inside custom component

  <template>
    <span>
      <input type="text" v-form-control="formControl"  name="custom-input"/>
    </span>
  </template>

```

```javascript
  <script lang="ts" setup>
    // pass control as a prop inside a custom component
    // prop name may be different
    const { formControl } = defineProps(['formControl']);
  </script>
```
