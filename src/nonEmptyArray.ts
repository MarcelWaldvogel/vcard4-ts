export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Whether the array is not empty.
 * @param a An array to check
 * @returns Non-emptiness (as a type guard)
 */
export function isNonEmptyArray<T>(a: T[]): a is NonEmptyArray<T> {
  return a.length > 0;
}

/**
 * Eliminate empty arrays.
 * @param a A possibly empty array
 * @returns A non-empty array or undefined
 */
export function maybeArray<T>(a: T[]): NonEmptyArray<T> | undefined {
  return isNonEmptyArray(a) ? a : undefined;
}
