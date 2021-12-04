import { VCard4, isKnownProperty, SingleVCardProperty } from './vcard4Types.js';

export function sortByPREF<T extends Partial<VCard4>>(vcard: T) {
  for (const k of Object.keys(vcard)) {
    // Cannot use `for (const [k, v] of Object.entries(vcard))` due to
    // https://github.com/microsoft/TypeScript/issues/46718
    if (isKnownProperty(k)) {
      const v = vcard[k];
      if (Array.isArray(v)) {
        v.sort(
          (a: SingleVCardProperty<any>, b: SingleVCardProperty<any>) =>
            (a.parameters?.PREF || Number.MAX_SAFE_INTEGER) -
            (b.parameters?.PREF || Number.MAX_SAFE_INTEGER),
        );
      }
    }
  }
  if ('x' in vcard) {
    for (const [k, v] of Object.entries(vcard.x!)) {
      v.sort(
        (a: SingleVCardProperty<any>, b: SingleVCardProperty<any>) =>
          (a.parameters?.PREF || Number.MAX_SAFE_INTEGER) -
          (b.parameters?.PREF || Number.MAX_SAFE_INTEGER),
      );
    }
  }
}
