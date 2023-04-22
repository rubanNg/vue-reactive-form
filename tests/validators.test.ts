import { FormControl, Validators } from "../src";

describe('validators', () => {
  let control: FormControl;
  beforeEach(() => {
    control = new FormControl('');
  });

  it('required', () => {
    control.setValidators([Validators.required]);
    control.setValue('1');
    expect(control.errors).toEqual({});
    control.setValue('');
    expect(control.errors).toEqual(Validators.required(control));
  });

  it('max', () => {
    control.setValidators([Validators.max(9)]);
    control.setValue(8);
    expect(control.errors).toEqual({});
    control.setValue(10);
    expect(control.errors).toEqual(Validators.max(9)(control));
  });

  it('min', () => {
    control.setValidators([Validators.min(0)]);
    control.setValue(0);
    expect(control.errors).toEqual({});
    control.setValue(-1);
    expect(control.errors).toEqual(Validators.min(0)(control));
  });

  it('maxLength', () => {
    control.setValidators([Validators.maxLength(0)]);
    control.setValue([]);
    expect(control.errors).toEqual({});
    control.setValue([{}]);
    expect(control.errors).toEqual(Validators.maxLength(0)(control));
  });

  it('minLength', () => {
    control.setValidators([Validators.minLength(1)]);
    control.setValue([{}]);
    expect(control.errors).toEqual({});
    control.setValue([]);
    expect(control.errors).toEqual(Validators.minLength(1)(control));
  });

  it('email', () => {
    control.setValidators([Validators.email]);
    control.setValue('mail@mail.com');
    expect(control.errors).toEqual({});
    control.setValue('mail@mail.');
    expect(control.errors).toEqual(Validators.email(control));
  })
})