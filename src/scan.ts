import { errorKeys } from './errorCodes';
import { NonEmptyArray } from './nonEmptyArray';

/**
 * Remove escape sequences from a quoted parameter string.
 * Essentially just understands \n, as almost all other escaping is either unnecessary or illegal.
 * @param s Escaped (formerly quoted) parameter value string
 * @returns Unescaped string
 */
export function scanSingleValue(
  s: string,
  errorCallback: ((error: errorKeys) => void) | null,
): string {
  let index = 0;
  let value = '';
  let unescapedComma = false;
  while (index < s.length) {
    if (s.charAt(index) === '\\') {
      const escaped = s.charAt(index + 1);
      if (escaped.toUpperCase() === 'N') {
        value += '\n';
      } else {
        value += escaped;
      }
      index += 2;
    } else {
      if (s.charAt(index) === ',') {
        unescapedComma = true;
      }
      value += s.charAt(index++);
    }
  }
  if (unescapedComma && errorCallback) {
    errorCallback('VALUE_UNESCAPED_COMMA');
  }
  return value;
}

/**
 * Splits a property value at semicolons *OR* commas.
 * Observes escaped commas/semicolons, and replaces \n.
 * @param s A property's value
 * @param splitChar A semicolon or comma
 * @returns The array of unescaped strings
 */
export function scan1DValue(
  s: string,
  splitChar: ',' | ';',
): NonEmptyArray<string> {
  let retval: string[] = [];
  let index = 0;
  let unescaped = '';
  while (index < s.length) {
    const c = s.charAt(index);
    if (c === splitChar) {
      retval.push(unescaped);
      unescaped = '';
      index++;
    } else if (c === '\\') {
      const escaped = s.charAt(index + 1);
      if (escaped.toUpperCase() === 'N') {
        unescaped += '\n';
      } else {
        unescaped += escaped;
      }
      index += 2;
    } else {
      unescaped += s.charAt(index++);
    }
  }
  retval.push(unescaped);
  return retval as NonEmptyArray<string>;
}

/**
 * Splits a property value at semicolons (level 1) and the part between the semicolons at commas (level 2).
 * Observes escaped commas/semicolons, and replaces \n.
 * @param s A property's value
 * @returns 2D string array
 */
export function scan2DValue(s: string): NonEmptyArray<NonEmptyArray<string>> {
  let retval: NonEmptyArray<string>[] = [];
  let currentValue: string[] = [];
  let index = 0;
  let unescaped = '';
  while (index < s.length) {
    const c = s.charAt(index);
    if (c === ';') {
      currentValue.push(unescaped);
      unescaped = '';
      retval.push(currentValue as NonEmptyArray<string>);
      currentValue = [];
      index++;
    } else if (c === ',') {
      currentValue.push(unescaped);
      unescaped = '';
      index++;
    } else if (c === '\\') {
      const escaped = s.charAt(index + 1);
      if (escaped.toUpperCase() === 'N') {
        unescaped += '\n';
      } else {
        unescaped += escaped;
      }
      index += 2;
    } else {
      unescaped += s.charAt(index++);
    }
  }
  currentValue.push(unescaped);
  retval.push(currentValue as NonEmptyArray<string>);
  return retval as NonEmptyArray<NonEmptyArray<string>>;
}
