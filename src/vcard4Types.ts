import { Nag, VCardNagAttributes } from './errors';
import { NonEmptyArray } from './nonEmptyArray';
import {
  ADRType,
  CLIENTPIDMAPType,
  Flatten,
  GENDERType,
  keyTypeGuard,
  NonEmptyStringArrayType,
  NType,
  NumberType,
  StringType,
  TypeOf,
} from './runtimeTypes';

// VCard4 parameters with runtime introspection capability
export const knownParameters = {
  LANGUAGE: StringType,
  VALUE: StringType,
  PREF: NumberType,
  ALTID: StringType,
  PID: NonEmptyStringArrayType,
  TYPE: NonEmptyStringArrayType,
  MEDIATYPE: StringType,
  CALSCALE: StringType,
  SORT_AS: NonEmptyStringArrayType,
  GEO: StringType,
  TZ: StringType,
  CC: StringType, // RFC8605
  INDEX: NumberType, // RFC6715
  LEVEL: StringType, // RFC6715
};
export type KnownParameterNames = keyof typeof knownParameters;
export const isKnownParameter = keyTypeGuard(knownParameters);

export type VCardParameters = Flatten<
  {
    [k in KnownParameterNames]?: TypeOf<typeof knownParameters[k]>;
  } & { x?: Record<string, NonEmptyArray<string>> }
>;

// VCard4 properties with runtime introspection capability
export const knownProperties = {
  // Cardinality: 1
  BEGIN: StringType,
  VERSION: StringType,
  END: StringType,
  // Cardinality: 1*
  FN: StringType,
  // Cardinality: *1
  PRODID: StringType,
  UID: StringType,
  REV: StringType,
  KIND: StringType,
  N: NType,
  BDAY: StringType,
  ANNIVERSARY: StringType,
  GENDER: GENDERType,
  BIRTHPLACE: StringType, // RFC6474
  DEATHPLACE: StringType, // RFC6474
  DEATHDATE: StringType, // RFC6474
  // Cardinality: *
  CLIENTPIDMAP: CLIENTPIDMAPType,
  SOURCE: StringType,
  XML: StringType,
  NICKNAME: NonEmptyStringArrayType,
  PHOTO: StringType,
  ADR: ADRType,
  TEL: StringType,
  EMAIL: StringType,
  IMPP: StringType,
  LANG: StringType,
  TZ: StringType,
  GEO: StringType,
  TITLE: StringType,
  ROLE: StringType,
  LOGO: StringType,
  ORG: NonEmptyStringArrayType,
  MEMBER: StringType,
  RELATED: StringType,
  CATEGORIES: NonEmptyStringArrayType,
  NOTE: StringType,
  SOUND: StringType,
  URL: StringType,
  KEY: StringType,
  FBURL: StringType,
  CALADRURI: StringType,
  CALURI: StringType,
  CONTACT_URI: StringType, // RFC8605
  EXPERTISE: StringType, // RFC6715
  HOBBY: StringType, // RFC6715
  INTEREST: StringType, // RFC6715
  ORG_DIRECTORY: StringType, // RFC6715
};
export type KnownPropertyNames = keyof typeof knownProperties;
export const isKnownProperty = keyTypeGuard(knownProperties);

// "1" cardinality properties from RFC 6350
// Values are what is expected
export const exactlyOnceProperties = {
  BEGIN: 'VCARD',
  VERSION: '4.0',
  END: 'VCARD',
};
export type ExactlyOncePropertyNames = keyof typeof exactlyOnceProperties;
export type ExactlyOnceProperties = Pick<
  typeof knownProperties,
  ExactlyOncePropertyNames
>;
export const isExactlyOnceProperty = keyTypeGuard(exactlyOnceProperties);

// "1*" cardinality properties from RFC 6350
// Value is default
export const atLeastOnceProperties = { FN: '' };
export type AtLeastOncePropertyNames = keyof typeof atLeastOnceProperties;
export type AtLeastOnceProperties = Pick<
  typeof knownProperties,
  AtLeastOncePropertyNames
>;
export const isAtLeastOnceProperty = keyTypeGuard(atLeastOnceProperties);

// "*1" cardinality properties from RFC 6350
export const atMostOnceProperties = {
  PRODID: 0,
  UID: 0,
  KIND: 0,
  N: 0,
  BDAY: 0,
  ANNIVERSARY: 0,
  GENDER: 0,
  REV: 0,
  BIRTHPLACE: 0,
  DEATHPLACE: 0,
  DEATHDATE: 0,
};
export type AtMostOncePropertyNames = keyof typeof atMostOnceProperties;
export type AtMostOnceProperties = Pick<
  typeof knownProperties,
  AtMostOncePropertyNames
>;
export const isAtMostOnceProperty = keyTypeGuard(atMostOnceProperties);

// "*" cardinality properties from RFC 6350
export type AnyCardinalityProperties = Omit<
  typeof knownProperties,
  | keyof ExactlyOnceProperties
  | keyof AtLeastOnceProperties
  | keyof AtMostOnceProperties
>;
// AnyCardinality type guard cannot be defined, as we do not have an object
// (without, redundantly, actually creating it manually):
// isKnownProperty(x) && !isExactlyOnceProperty(x) && !isAtLeastOnceProperty(x) && !isAtMostOnceProperty(x)

// A single line, with the exception of the property name (which will become the key) to this value, anyway.
export type SingleVCardProperty<ValueType> = {
  group?: string;
  parameters?: VCardParameters;
  value: ValueType;
};

// Compose the vCard
// Every element with its type, embedded in a SingleVCardProperty
export type VCardSingles<Selection extends Partial<typeof knownProperties>> = {
  [k in keyof Selection & keyof typeof knownProperties]: SingleVCardProperty<
    TypeOf<typeof knownProperties[k]>
  >;
};
// Every element with its type, embedded in a NonEmptyArray of SingleVCardProperties
export type VCardMultiples<Selection extends Partial<typeof knownProperties>> =
  {
    [k in keyof Selection & keyof typeof knownProperties]: NonEmptyArray<
      SingleVCardProperty<TypeOf<typeof knownProperties[k]>>
    >;
  };
export type VCard4 = Flatten<
  VCardSingles<ExactlyOnceProperties> &
    Partial<VCardSingles<AtMostOnceProperties>> &
    VCardMultiples<AtLeastOnceProperties> &
    Partial<VCardMultiples<AnyCardinalityProperties>> & {
      x?: Record<string, NonEmptyArray<SingleVCardProperty<string>>>;
      nags?: NonEmptyArray<Nag<VCardNagAttributes>>;
      hasErrors: boolean;
    }
>;
