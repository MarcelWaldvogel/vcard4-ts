import { shorten } from '../errors';

describe('Property value scanning', () => {
  it('should split values', () => {
    expect(shorten('0'.repeat(40))).toStrictEqual('0'.repeat(29) + '…');
  });
});
