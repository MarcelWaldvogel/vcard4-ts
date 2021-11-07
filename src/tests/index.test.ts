import { parseVCards, sortByPREF, groupVCard } from '../';

describe('Importing through the index', () => {
  it('should import parseVCards', () => {
    parseVCards('');
  });
  it('should import sortByPREF', () => {
    sortByPREF({});
  });
  it('should import groupVCard', () => {
    groupVCard({});
  });
});
