/**
 * Is this a valid character for a group, property, or parameter name?
 * @param char Input character
 * @returns Validity
 */
export function isPropertyChar(char: string): Boolean {
  const c = char.toUpperCase();
  return c === '-' || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

/**
 * Turns a parsed identifier (e.g., `Sort-As`) into a name usable as an
 * object property (`SORT_AS`), in uppercase. This cannot cause collisions,
 * as `_` is not allowed in the input string.
 * @param name The parsed identifier (group, property, or parameter name)
 * @returns The key for the Records.
 */
export function nameToKey(name: string): string {
  return name.toUpperCase().replace(/-/g, '_');
}
