import { FormControl } from '../src';

describe('FormControl', () => {
  it('control is instance of FormControl', () => {
    const control = new FormControl('');
    expect(control instanceof FormControl).toBe(true);
  });
});