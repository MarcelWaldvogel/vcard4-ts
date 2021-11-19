import { scan1DValue, scan2DValue, scanSingleValue } from '../scan';

describe('Property value scanning', () => {
  it('should escape single values', () => {
    expect(scanSingleValue('A\\nB\\\\nC', null)).toStrictEqual('A\nB\\nC');
  });
  it('should split 1D values on commas', () => {
    expect(scan1DValue('A,B', ',')).toStrictEqual(['A', 'B']);
  });
  it('should split 1D values on semicolons', () => {
    expect(scan1DValue('A;B', ';')).toStrictEqual(['A', 'B']);
  });
  it('should not split at escaped or different', () => {
    expect(scan1DValue('A\\,B;C\\;D,E\\\\,F', ',')).toStrictEqual([
      'A,B;C;D',
      'E\\',
      'F',
    ]);
  });
  it('should understand newlines', () => {
    expect(scan1DValue('A\\nB,C\\\\nD', ',')).toStrictEqual(['A\nB', 'C\\nD']);
  });
  it('should split 2D values', () => {
    expect(scan2DValue('A,B;C;D,E;F;;,G')).toStrictEqual([
      ['A', 'B'],
      ['C'],
      ['D', 'E'],
      ['F'],
      [''],
      ['', 'G'],
    ]);
  });
  it('should understand escaped 2D values', () => {
    expect(scan2DValue('A\\,B\\;C;D,E\\\\;F\\n;;,G')).toStrictEqual([
      ['A,B;C'],
      ['D', 'E\\'],
      ['F\n'],
      [''],
      ['', 'G'],
    ]);
  });
});
