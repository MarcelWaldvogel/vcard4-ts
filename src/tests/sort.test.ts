import { VCard4 } from '../vcard4Types.js';
import { sortByPREF } from '../sort.js';

describe('Sorting by preference', () => {
  it('should sort RFC6350 properties with valid PREF value', () => {
    let vcard: Partial<VCard4> = {
      EMAIL: [
        { parameters: { PREF: 3 }, value: 'c@c.c' },
        { parameters: { PREF: 1 }, value: 'a@a.a' },
        { parameters: { PREF: 2 }, value: 'b@b.b' },
      ],
    };
    sortByPREF(vcard);
    expect(vcard).toStrictEqual({
      EMAIL: [
        { parameters: { PREF: 1 }, value: 'a@a.a' },
        { parameters: { PREF: 2 }, value: 'b@b.b' },
        { parameters: { PREF: 3 }, value: 'c@c.c' },
      ],
    });
  });
  it('should sort non-RFC6350 properties with valid PREF value', () => {
    let vcard: Partial<VCard4> = {
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: 2 }, value: '2222.2222' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
          { parameters: { PREF: 1 }, value: '1111.1111' },
        ],
      },
    };
    sortByPREF(vcard);
    expect(vcard).toStrictEqual({
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: 1 }, value: '1111.1111' },
          { parameters: { PREF: 2 }, value: '2222.2222' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
        ],
      },
    });
  });
  it('should sort properties with missing PREF value last', () => {
    let vcard: Partial<VCard4> = {
      EMAIL: [
        { parameters: { PREF: 3 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'de' }, value: 'a@a.a' },
        { parameters: { PREF: 2 }, value: 'b@b.b' },
      ],
      x: {
        X_COMPUSERVE: [
          { value: '2222.2222' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
          { parameters: { PREF: 1 }, value: '1111.1111' },
        ],
      },
    };
    sortByPREF(vcard);
    expect(vcard).toStrictEqual({
      EMAIL: [
        { parameters: { PREF: 2 }, value: 'b@b.b' },
        { parameters: { PREF: 3 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'de' }, value: 'a@a.a' },
      ],
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: 1 }, value: '1111.1111' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
          { value: '2222.2222' },
        ],
      },
    });
  });
  it('should sort properties with missing PREF behind 100', () => {
    let vcard: Partial<VCard4> = {
      EMAIL: [
        { parameters: { PREF: 100 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'de' }, value: 'a@a.a' },
        { parameters: { PREF: 2 }, value: 'b@b.b' },
      ],
      x: {
        X_COMPUSERVE: [
          { value: '2222.2222' },
          { parameters: { PREF: 100 }, value: '3333.3333' },
          { parameters: { PREF: 1 }, value: '1111.1111' },
        ],
      },
    };
    sortByPREF(vcard);
    expect(vcard).toStrictEqual({
      EMAIL: [
        { parameters: { PREF: 2 }, value: 'b@b.b' },
        { parameters: { PREF: 100 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'de' }, value: 'a@a.a' },
      ],
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: 1 }, value: '1111.1111' },
          { parameters: { PREF: 100 }, value: '3333.3333' },
          { value: '2222.2222' },
        ],
      },
    });
  });
  it('should sort properties with NaN/missing PREF value last (and maintain their relative order)', () => {
    let vcard: Partial<VCard4> = {
      UID: { value: '123' },
      EMAIL: [
        { parameters: { PREF: 3 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'de', PREF: 1 }, value: 'a@a.a' },
        { parameters: { LANGUAGE: 'en', PREF: NaN }, value: 'b@b.b' },
        { value: 'd@d.d' },
        { value: 'e@e.e' },
      ],
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: NaN }, value: '2222.2222' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
          { parameters: { PREF: 1 }, value: '1111.1111' },
          { value: '4444.4444' },
        ],
      },
    };
    sortByPREF(vcard);
    expect(vcard).toStrictEqual({
      UID: { value: '123' },
      EMAIL: [
        { parameters: { LANGUAGE: 'de', PREF: 1 }, value: 'a@a.a' },
        { parameters: { PREF: 3 }, value: 'c@c.c' },
        { parameters: { LANGUAGE: 'en', PREF: NaN }, value: 'b@b.b' },
        { value: 'd@d.d' },
        { value: 'e@e.e' },
      ],
      x: {
        X_COMPUSERVE: [
          { parameters: { PREF: 1 }, value: '1111.1111' },
          { parameters: { PREF: 3 }, value: '3333.3333' },
          { parameters: { PREF: NaN }, value: '2222.2222' },
          { value: '4444.4444' },
        ],
      },
    });
  });
});
