import { VCard4, isKnownProperty } from './vcard4Types';

export function sortByPREF<T extends Partial<VCard4>>(vcard: T) {
  for (const k of Object.keys(vcard)) {
    // Cannot use `for (const [k, v] of Object.entries(vcard))` due to
    // https://github.com/microsoft/TypeScript/issues/46718
    if (isKnownProperty(k)) {
      const v = vcard[k];
      if (Array.isArray(v)) {
        v.sort(
          (a, b) => (a.parameters?.PREF || 100) - (b.parameters?.PREF || 100),
        );
      }
    }
  }
  if ('x' in vcard) {
    for (const [k, v] of Object.entries(vcard.x)) {
      v.sort(
        (a, b) => (a.parameters?.PREF || 100) - (b.parameters?.PREF || 100),
      );
    }
  }
}
