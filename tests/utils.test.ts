import { FormArray } from '../src/package/lib/form-array';
import { FormGroup } from '../src/package/lib/form-group';
import { FormControl } from '../src/package/lib/form-control';
import { isPlaneObject, findFormControl } from '../src/package/utils'

describe('utils', () => {
  describe('is-plane-object(true)', () => {
    it('true', () => {
      expect(isPlaneObject({})).toBe(true);
    });

    it('false', () => {
      expect(isPlaneObject([])).toBe(false);
    })
  });

  describe('findFormControl', () => {
    const value = 'FormControl';
    const form = new FormGroup({
      control: new FormGroup({
        controlFormGroup: new FormArray([
          new FormGroup({
            arrayLevel: new FormControl(value),
          })
        ])
      })
    })

    it('exist', () => {
      expect(findFormControl(form, 'control.controlFormGroup.0.arrayLevel')?.value).toBe(value);
    });   

    it('not exist', () => {
      expect(findFormControl(form, 'control.controlFormGroup.0.arrayLevel.null')?.value).toBe(undefined);
    })
  });
});