import { VCard4, isKnownProperty, SingleVCardProperty } from './vcard4Types';

export type GroupName = SingleVCardProperty<any>['group'] | 'top';
export type GroupedVCard = Record<GroupName, Partial<VCard4>>;

export function groupVCard<T extends Partial<VCard4>>(vcard: T): GroupedVCard {
  const grouped: GroupedVCard = {};
  for (const propertyName of Object.keys(vcard)) {
    // Cannot use `for (const [k, v] of Object.entries(vcard))` due to
    // https://github.com/microsoft/TypeScript/issues/46718
    if (isKnownProperty(propertyName)) {
      const propertyInfo = vcard[propertyName];
      if (Array.isArray(propertyInfo)) {
        for (const e of propertyInfo) {
          const groupName = e.group ?? 'top';
          grouped[groupName] ??= {};
          if (propertyName in grouped[groupName]) {
            (
              grouped[groupName][propertyName] as SingleVCardProperty<any>[]
            ).push(e);
          } else {
            (grouped[groupName][propertyName] as SingleVCardProperty<any>[]) = [
              e,
            ];
          }
        }
      } else {
        const groupName = propertyInfo.group ?? 'top';
        grouped[groupName] ??= {};
        (grouped[groupName][propertyName] as SingleVCardProperty<any>) =
          propertyInfo;
      }
    }
  }
  if ('x' in vcard) {
    for (const [propertyName, propertyInfo] of Object.entries(vcard.x)) {
      for (const e of propertyInfo) {
        const groupName = e.group ?? 'top';
        grouped[groupName] ??= {};
        grouped[groupName].x ??= {};
        if (propertyName in grouped[groupName]) {
          (
            grouped[groupName].x[propertyName] as SingleVCardProperty<any>[]
          ).push(e);
        } else {
          (grouped[groupName].x[propertyName] as SingleVCardProperty<any>[]) = [
            e,
          ];
        }
      }
    }
  }
  return grouped;
}
