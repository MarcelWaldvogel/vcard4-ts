import { shorten } from '../errors.js';

describe('Shortening strings', () => {
  it('should shorten long strings', () => {
    expect(shorten('0'.repeat(40))).toStrictEqual('0'.repeat(29) + '…');
  });
  it('should keep strings of length 30', () => {
    expect(shorten('0'.repeat(30))).toStrictEqual('0'.repeat(30));
  });
  it('should keep short strings', () => {
    expect(shorten('0'.repeat(20))).toStrictEqual('0'.repeat(20));
  });
  it('should be configurable', () => {
    expect(shorten('0'.repeat(40), 20)).toStrictEqual('0'.repeat(19) + '…');
  });
});
