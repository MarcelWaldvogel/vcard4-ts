import { Nag } from './errors';
import { VCard4, SingleVCardProperty, isKnownProperty } from './vcard4Types';

// For some reason, the compiler believes that `Nag` could be a type passed
function PREFValue(a: SingleVCardProperty<any> | Nag<any>): number {
  return (a as SingleVCardProperty<any>).parameters?.PREF || 100;
}

export function sortByPREF<T extends Partial<VCard4>>(vcard: T) {
  for (const [k, v] of Object.entries(vcard)) {
    if (isKnownProperty(k) && Array.isArray(v)) {
      v.sort((a, b) => PREFValue(a) - PREFValue(b));
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
