// Minimalistic runtime type introspection for basic (and vCard value) types.
// Modeled after [https://github.com/colinhacks/zod](Zod).

import { errorKeys } from './errorCodes';
import { nagVC } from './errors';
import { NonEmptyArray } from './nonEmptyArray';
import { scan1DValue, scan2DValue, scanSingleValue } from './scan';

export type TypeOf<T extends RuntimeTypeAnnotation<any>> = T['type'];
export type Flatten<T extends object> = { [k in keyof T]: T[k] };

/**
 * Creates a subtype of the base schema, where only the keys are included
 * whose type is compatible with Condition.
 *
 * E.g.
 *   SubType<{BEGIN: string; END: string; NICKNAME: string[];}, string>
 * will result in
 *   {BEGIN: string; END: string;}
 *
 * Obtained from https://www.piotrl.net/typescript-condition-subset-types/
 */
export type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;
/**
 * Creates a subtype of the Base schema, where only the keys are included
 * whose RuntimeTypeAnnotation type is compatible with Condition.
 *
 * E.g.
 *   RTSubType<
 *     {BEGIN: StringType; END: StringType; NICKNAME: NonEmptyStringType;},
 *     string>
 * will result in
 *   {BEGIN: StringType; END: StringType;}
 */
export type RTSubType<
  Base extends Record<string, RuntimeTypeAnnotation<any>>,
  Condition,
> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key]['type'] extends Condition ? Key : never;
  }[keyof Base]
>;

export type Name =
  | 'string'
  | 'string[]'
  | 'string[+]'
  | 'number'
  | 'ADR'
  | 'N'
  | 'GENDER'
  | 'CLIENTPIDMAP';

export type ParseFunction<T> = (
  rawValue: string,
  errorCallback: (error: errorKeys) => void,
) => T;

export class RuntimeTypeAnnotation<Type> {
  readonly type: Type;
  readonly name: Name;
  readonly parse: ParseFunction<Type>;
  constructor(name: Name, parse: ParseFunction<Type>) {
    this.name = name;
    this.parse = parse;
  }
}
export const StringType = new RuntimeTypeAnnotation<string>(
  'string',
  (rawValue, errorCallback) => scanSingleValue(rawValue, errorCallback),
);
export const NonEmptyStringArrayType = new RuntimeTypeAnnotation<NonEmptyArray<string>>(
  'string[+]',
  (rawValue) => scan1DValue(rawValue, ','),
);
export const NumberType = new RuntimeTypeAnnotation<number>('number', (rawValue) =>
  parseInt(rawValue, 10),
);
export const ADRType = new RuntimeTypeAnnotation<{
  postOfficeBox?: NonEmptyArray<string>;
  extendedAddress?: NonEmptyArray<string>;
  streetAddress?: NonEmptyArray<string>;
  locality?: NonEmptyArray<string>;
  region?: NonEmptyArray<string>;
  postalCode?: NonEmptyArray<string>;
  countryName?: NonEmptyArray<string>;
}>('ADR', (rawValue) => {
  const [
    postOfficeBox,
    extendedAddress,
    streetAddress,
    locality,
    region,
    postalCode,
    countryName,
  ] = scan2DValue(rawValue);
  return {
    postOfficeBox,
    extendedAddress,
    streetAddress,
    locality,
    region,
    postalCode,
    countryName,
  };
});
export const NType = new RuntimeTypeAnnotation<{
  familyNames: NonEmptyArray<string>;
  givenNames: NonEmptyArray<string>;
  additionalNames: NonEmptyArray<string>;
  honorificPrefixes: NonEmptyArray<string>;
  honorificSuffixes: NonEmptyArray<string>;
}>('N', (rawValue) => {
  const [familyNames, givenNames, additionalNames, honorificPrefixes, honorificSuffixes] =
    scan2DValue(rawValue);
  return {
    familyNames,
    givenNames,
    additionalNames,
    honorificPrefixes,
    honorificSuffixes,
  };
});
export const GENDERType = new RuntimeTypeAnnotation<{
  sex: string;
  text?: string;
}>('GENDER', (rawValue) => {
  const [sex, text] = scan1DValue(rawValue, ';');
  return { sex, text };
});
export const CLIENTPIDMAPType = new RuntimeTypeAnnotation<{
  pidRef: number;
  uri: string;
}>('CLIENTPIDMAP', (rawValue) => {
  const [pidRef, uri] = scan1DValue(rawValue, ';');
  return { pidRef: parseInt(pidRef, 10), uri };
});

/**
 * Creates a type guard function, which will check whether its parameter, the key,
 * exists in the schema. The schema must be an actual object (typically a const),
 * it's type is inferred by the generic.
 *
 * Asserts to the type system that key is in the schema. This cannot be done directly
 * (as type information is only available at compile time), therefore, we need to
 * infer the type information from the schema (this direction is possible) and
 * verify at runtime against the schema.
 * @param schema The schema to check against (an actual variable/const, not a type!)
 * @returns The type guard function.
 */
export function keyTypeGuard<T extends Record<string, any>>(
  schema: T,
): (key: string) => key is keyof T & string {
  return (key): key is keyof T & string => {
    return key in schema;
  };
}

/**
 * WIP
 *
 * Creates a type guard function, which will check whether its parameter, the key,
 * exists in the RuntimeTypeAnnotation schema with the given type name.
 * The schema must be an actual object (typically a const),
 * and the generic T must be `keyof typeof schema`.
 *
 * Asserts to the type system that key is in T. This cannot be done directly
 * (as type information is only available at compile time), therefore, we need to
 * infer the type information from the schema (this direction is possible) and
 * verify at runtime against the schema.
 * @param schema The schema to check against (an actual variable/const, not a type!)
 * @returns The type guard function.
 */
// export function rtTypeGuard<Base extends Record<string, any>, Type, Name>(
//   schema: Record<string, RuntimeTypeAnnotation<any>>,
// ): (key: string) => key is keyof SubType<Base, Type> {
//   return (key): key is T => {
//     return schema[key]?.type;
//   };
// }
