import {
  CLIENTPIDMAPType,
  GENDERType,
  NonEmptyStringArrayType,
  NType,
  NumberType,
} from '../runtimeTypes';

describe('Runtime type verification', () => {
  it('should parse non-empty string arrays', () => {
    expect(NonEmptyStringArrayType.parse('A,B', null)).toStrictEqual([
      'A',
      'B',
    ]);
  });
  it('should parse integers', () => {
    expect(NumberType.parse('123', null)).toStrictEqual(123);
  });
  it('should always parse in base 10', () => {
    expect(NumberType.parse('0123', null)).toStrictEqual(123);
  });
  it('should hiccup on hex', () => {
    expect(NumberType.parse('0x123', null)).toStrictEqual(0);
  });
  it('should puke on non-numeric content', () => {
    expect(NumberType.parse('', null)).toStrictEqual(NaN);
  });

  it('should understand names', () => {
    expect(NType.parse('Last;First;1;2,2;3,3,3', null)).toStrictEqual({
      familyNames: ['Last'],
      givenNames: ['First'],
      additionalNames: ['1'],
      honorificPrefixes: ['2', '2'],
      honorificSuffixes: ['3', '3', '3'],
    });
  });
  it('should understand sex', () => {
    expect(GENDERType.parse('M', null)).toStrictEqual({
      sex: 'M',
      text: undefined,
    });
  });
  it('should understand modern genders', () => {
    expect(GENDERType.parse(";it's complicated", null)).toStrictEqual({
      sex: '',
      text: "it's complicated",
    });
  });
  it('should have heard about CLIENTPIDMAP', () => {
    expect(CLIENTPIDMAPType.parse('1;urn:uuid:...', null)).toStrictEqual({
      pidRef: 1,
      uri: 'urn:uuid:...',
    });
  });
});
