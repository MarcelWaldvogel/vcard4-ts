import { VCard4 } from '../vcard4Types.js';
import { groupVCard } from '../group.js';

describe('Grouping by property group', () => {
  it('should put everything without a group into the top layer', () => {
    const vcard: Partial<VCard4> = {
      EMAIL: [{ value: 'a@a.a' }, { value: 'b@b.b' }, { value: 'c@c.c' }],
    };
    expect(groupVCard(vcard)).toStrictEqual({
      top: {
        EMAIL: [{ value: 'a@a.a' }, { value: 'b@b.b' }, { value: 'c@c.c' }],
      },
    });
  });
  it('should put everything into their group', () => {
    const vcard: Partial<VCard4> = {
      EMAIL: [
        { group: 'A', value: 'a@a.a' },
        { group: 'B', value: 'b@b.b' },
        { value: 'c@c.c' },
      ],
    };
    expect(groupVCard(vcard)).toStrictEqual({
      A: {
        EMAIL: [{ group: 'A', value: 'a@a.a' }],
      },
      B: {
        EMAIL: [{ group: 'B', value: 'b@b.b' }],
      },
      top: {
        EMAIL: [{ value: 'c@c.c' }],
      },
    });
  });
  it('should allow multiple properties', () => {
    const vcard: Partial<VCard4> = {
      EMAIL: [
        { group: 'A', value: 'a@a.a' },
        { group: 'B', value: 'b@b.b' },
        { value: 'c@c.c' },
      ],
      TEL: [
        { group: 'A', value: '+111' },
        { group: 'B', value: '+222' },
        { value: '+333' },
      ],
    };
    expect(groupVCard(vcard)).toStrictEqual({
      A: {
        EMAIL: [{ group: 'A', value: 'a@a.a' }],
        TEL: [{ group: 'A', value: '+111' }],
      },
      B: {
        EMAIL: [{ group: 'B', value: 'b@b.b' }],
        TEL: [{ group: 'B', value: '+222' }],
      },
      top: {
        EMAIL: [{ value: 'c@c.c' }],
        TEL: [{ value: '+333' }],
      },
    });
  });
  it('should also handle singleton properties (even though grouping them makes no sense)', () => {
    const vcard: Partial<VCard4> = {
      BEGIN: { value: 'VCARD' },
      END: { value: 'VCARD' },
      EMAIL: [{ group: 'B', value: 'b@b.b' }, { value: 'c@c.c' }],
      TEL: [{ group: 'A', value: '+111' }, { value: '+333' }],
      UID: { group: 'A', value: '123' },
    };
    expect(groupVCard(vcard)).toStrictEqual({
      A: {
        TEL: [{ group: 'A', value: '+111' }],
        UID: { group: 'A', value: '123' },
      },
      B: {
        EMAIL: [{ group: 'B', value: 'b@b.b' }],
      },
      top: {
        BEGIN: { value: 'VCARD' },
        END: { value: 'VCARD' },
        EMAIL: [{ value: 'c@c.c' }],
        TEL: [{ value: '+333' }],
      },
    });
  });
  it('should deal with unrecognized properties', () => {
    const vcard: Partial<VCard4> = {
      BEGIN: { value: 'VCARD' },
      END: { value: 'VCARD' },
      x: {
        X_EMAIL: [{ group: 'B', value: 'b@b.b' }, { value: 'c@c.c' }],
        X_TEL: [
          { group: 'A', value: '+111' },
          { group: 'A', value: '+123' },
          { value: '+333' },
        ],
        X_ABUID: [{ group: 'A', value: '123' }],
      },
    };
    expect(groupVCard(vcard)).toStrictEqual({
      A: {
        x: {
          X_TEL: [
            { group: 'A', value: '+111' },
            { group: 'A', value: '+123' },
          ],
          X_ABUID: [{ group: 'A', value: '123' }],
        },
      },
      B: {
        x: {
          X_EMAIL: [{ group: 'B', value: 'b@b.b' }],
        },
      },
      top: {
        BEGIN: { value: 'VCARD' },
        END: { value: 'VCARD' },
        x: { X_EMAIL: [{ value: 'c@c.c' }], X_TEL: [{ value: '+333' }] },
      },
    });
  });
  it('should also handle (ignore) nags and hasErrors', () => {
    const vcard: Partial<VCard4> = {
      BEGIN: { value: 'VCARD' },
      END: { value: 'VCARD' },
      EMAIL: [{ group: 'B', value: 'b@b.b' }, { value: 'c@c.c' }],
      TEL: [{ group: 'A', value: '+111' }, { value: '+333' }],
      UID: { group: 'A', value: '123' },
      nags: [
        {
          key: 'PROP_NAME_EMPTY',
          description: 'Empty property or group name',
          isError: true,
        },
      ],
      hasErrors: true,
    };
    expect(groupVCard(vcard)).toStrictEqual({
      A: {
        TEL: [{ group: 'A', value: '+111' }],
        UID: { group: 'A', value: '123' },
      },
      B: {
        EMAIL: [{ group: 'B', value: 'b@b.b' }],
      },
      top: {
        BEGIN: { value: 'VCARD' },
        END: { value: 'VCARD' },
        EMAIL: [{ value: 'c@c.c' }],
        TEL: [{ value: '+333' }],
      },
    });
  });
});
