import { nag, Nag, nagVC, VCardNagAttributes } from './errors.js';
import { isNonEmptyArray, maybeArray, NonEmptyArray } from './nonEmptyArray.js';
import { scanSingleParamValue } from './scan.js';
import { isPropertyChar, nameToKey } from './utils.js';
import {
  atLeastOnceProperties,
  exactlyOnceProperties,
  isAtLeastOnceProperty,
  isAtMostOnceProperty,
  isExactlyOnceProperty,
  isKnownParameter,
  isKnownProperty,
  knownParameters,
  knownProperties,
  SingleVCardProperty,
  VCard4,
  VCardParameters,
} from './vcard4Types.js';

export type LineAttributes = {
  property: string;
  field: string;
  entireLine: string;
  shortenedLine: string;
};
export type ParsedVCards = {
  vCards?: NonEmptyArray<VCard4>;
  nags?: NonEmptyArray<Nag<undefined>>;
};
export type PartialVCard = Partial<Omit<VCard4, 'nags' | 'unparseable'>> & {
  nags: Nag<VCardNagAttributes>[];
  unparseable: string[];
  didNotStartWithBEGIN?: boolean;
};
export type TransitionVCard = Partial<Omit<VCard4, 'nags' | 'unparseable'>> & {
  nags?: Nag<VCardNagAttributes>[];
  unparseable?: string[];
  didNotStartWithBEGIN?: boolean;
};

/**
 * Parse an RFC 6350 (multi-)vCard input into an array and errors.
 * @param vcf Multiline string of potentially multiple vCards
 * @param keepErrors Whether very bad vCards should be deleted
 * @returns Array of vCards with metadata; array of global errors
 */
export function parseVCards(
  vcf: string,
  keepDefective: boolean = false,
): ParsedVCards {
  let globalNags: Nag<undefined>[] = [];

  // 1. unwrap: Be lenient in what we accept
  if (!vcf.includes('\r\n') && vcf.includes('\n')) {
    nag(globalNags, 'FILE_CRLF');
  }
  vcf = vcf.replace(/\r?\n[ \t]/g, '');

  // 2. process (unwrapped) line by line
  let vCardInProgress: PartialVCard = { nags: [], unparseable: [] };
  let vCards: VCard4[] = [];
  for (const line of vcf.split(/\r?\n/)) {
    if (line === '') {
      continue; // Skip empty lines, required at the very end (optional otherwise)
    }
    parseLine(vCardInProgress, line);
    if (!('BEGIN' in vCardInProgress)) {
      vCardInProgress.didNotStartWithBEGIN = true;
    }
    if ('END' in vCardInProgress) {
      // Finish this one, ready for a potential next vCard
      const card = ensureCardinalities(
        globalNags,
        vCardInProgress,
        keepDefective,
      );
      if (card) {
        vCards.push(card);
      }
      vCardInProgress = { nags: [], unparseable: [] };
    }
  }
  // vCard still in progress?
  if (interestingDataIn(vCardInProgress)) {
    const card = ensureCardinalities(
      globalNags,
      vCardInProgress,
      keepDefective,
    );
    if (card) {
      vCards.push(card);
    }
  }

  // Clean return value
  let retval = { vCards: maybeArray(vCards), nags: maybeArray(globalNags) };
  if (!retval.vCards) {
    delete retval.vCards;
  }
  if (!retval.nags) {
    delete retval.nags;
  }
  return retval;
}

function interestingDataIn(partialVCard: PartialVCard): boolean {
  return (
    Object.entries(partialVCard).length > 2 ||
    partialVCard.nags.length > 0 ||
    partialVCard.unparseable.length > 0
  );
}

/**
 * Turn partial vCard either into a full one (with optional errors) or reject it entirely.
 * @param globalNags The global nag list to potentially append to
 * @param partialVCard A partial vCard to either turn into a complete card or refuse
 * @param keepDefective Whether to keep vCards with major defects
 * @returns A full vCard (or null, if too defective)
 */
function ensureCardinalities(
  globalNags: Nag<undefined>[],
  partialVCard: PartialVCard,
  keepDefective: boolean,
): VCard4 | null {
  // Major problems
  if (partialVCard.didNotStartWithBEGIN === true) {
    if (keepDefective) {
      nagVC(partialVCard.nags, 'VCARD_NOT_BEGIN', { property: 'BEGIN' });
    } else {
      nag(globalNags, 'VCARD_NOT_BEGIN');
      return null;
    }
  }
  for (const property of ['BEGIN', 'END'] as const) {
    if (partialVCard[property]?.value?.toUpperCase() !== 'VCARD') {
      if (keepDefective) {
        nagVC(partialVCard.nags, 'VCARD_BAD_TYPE', { property });
      } else {
        nag(globalNags, 'VCARD_BAD_TYPE');
        return null;
      }
    }
  }

  // Cardinality '1' properties
  for (const [k, expectedValue] of Object.entries(exactlyOnceProperties)) {
    if (isExactlyOnceProperty(k)) {
      // Type guard needed to make the compiler happy
      if (!(k in partialVCard)) {
        nagVC(partialVCard.nags, 'VCARD_MISSING_PROP', { property: k });
        partialVCard[k] = { value: expectedValue };
      } else {
        if (partialVCard[k]!.value.toUpperCase() !== expectedValue) {
          nagVC(partialVCard.nags, 'VALUE_INVALID', {
            property: k,
            line: `${k}:${partialVCard[k]!.value}`,
          });
        }
      }
    }
  }

  // Cardinality '1*' properties
  for (const [k, defaultValue] of Object.entries(atLeastOnceProperties)) {
    if (isAtLeastOnceProperty(k)) {
      // Type guard needed to make the compiler happy
      if (!(k in partialVCard)) {
        nagVC(partialVCard.nags, 'VCARD_MISSING_PROP', { property: k });
        partialVCard[k] = [{ value: defaultValue }];
      }
    }
  }

  // Clean: Remove undefined parameters
  for (const [key] of Object.entries(partialVCard)) {
    const k = key as keyof typeof partialVCard;
    if (isKnownProperty(k)) {
      if (isAtMostOnceProperty(k) || isExactlyOnceProperty(k)) {
        const v: SingleVCardProperty<any> = partialVCard[k]!;
        if (
          'parameters' in v &&
          (!v.parameters || Object.keys(v.parameters).length === 0)
        ) {
          delete v.parameters;
        }
      } else {
        const v: NonEmptyArray<SingleVCardProperty<any>> = partialVCard[k]!;
        for (const i in v) {
          const vi = v[i]; // Improves type checks
          if (
            'parameters' in vi &&
            (!vi.parameters || Object.keys(vi.parameters).length === 0)
          ) {
            delete vi.parameters;
          }
        }
      }
    }
  }
  for (const [k, v] of Object.entries(partialVCard.x ?? {})) {
    for (const i in v) {
      const vi = v[i]; // Improves type checks
      if (
        'parameters' in vi &&
        (!vi.parameters || Object.keys(vi.parameters).length === 0)
      ) {
        delete vi.parameters;
      }
    }
  }

  /*
   * Until the `return` statement, we are in a transition:
   * At the beginning, `nags` and `unparseable` are arrays, defined but
   * possibly empty; at the end, both are optional `NonEmptyArray`s.
   * This is not easily reflected in types, but we're trying.
   */
  const transitionVCard = partialVCard as TransitionVCard;
  // Clean Nags; set hasErrors
  if (isNonEmptyArray(transitionVCard.nags!)) {
    transitionVCard.hasErrors = (transitionVCard.nags ?? [])
      .map((nag) => nag.isError)
      .reduce((a, b) => a || b, false);
  } else {
    transitionVCard.hasErrors = false;
    delete transitionVCard.nags;
  }

  // Clean `unparseable`
  transitionVCard.unparseable = maybeArray(transitionVCard.unparseable!);
  if (!transitionVCard.unparseable) {
    delete transitionVCard.unparseable;
  }

  // Clean possible internal flags
  delete transitionVCard.didNotStartWithBEGIN;

  // All the required fields are here now, great!
  return transitionVCard as VCard4;
}

/**
 * Parse a line and extend the partial vCard accordingly.
 * @param vCardInProgress The vCard to add the line to, if possible
 * @param line The new line
 */
export function parseLine(vCardInProgress: PartialVCard, line: string) {
  const propertyInfo = extractProperty(line, vCardInProgress.nags);
  if (!propertyInfo) {
    vCardInProgress.unparseable.push(line);
    return;
  }
  const property = propertyInfo.property;
  const parameterInfo = parseParameters(
    line,
    propertyInfo.end,
    vCardInProgress.nags,
    property,
  );
  if (!parameterInfo) {
    // Has already been nagged
    vCardInProgress.unparseable.push(line);
    return;
  }
  const parameters = parameterInfo.parameters;
  if (line.charAt(parameterInfo.end) !== ':') {
    // Should not happen
    nagVC(vCardInProgress.nags, 'PROP_MISSING_COLON', { property, line });
    vCardInProgress.unparseable.push(line);
    return;
  }
  const rawValue = line.substring(parameterInfo.end + 1);

  if (isKnownProperty(property)) {
    // Obtain the value parsed into the right type.
    // Using the property's `<Type>parse()` ensures that we have the proper type,
    // however, to convince the compiler of the same, an 8-way condition would
    // be necessary for each of the three `vCardInProgress[property]` assignments…
    const parsedValue: any = knownProperties[property].parse(
      rawValue,
      (error) => {
        nagVC(vCardInProgress.nags, error, { property, line });
      },
    );

    if (isExactlyOnceProperty(property) || isAtMostOnceProperty(property)) {
      // Deal with property cardinality
      if (property in vCardInProgress) {
        // Too many; ignore all but first
        nagVC(vCardInProgress.nags, 'PROP_DUPLICATE', { property, line });
        vCardInProgress.unparseable.push(line);
        return;
      } else {
        vCardInProgress[property] = { parameters, value: parsedValue };
      }
    } else {
      // Multiple properties: AtLeastOnce, AnyCardinality
      if (property in vCardInProgress) {
        vCardInProgress[property]!.push({ parameters, value: parsedValue });
      } else {
        vCardInProgress[property] = [{ parameters, value: parsedValue }];
      }
    }
  } else {
    // Add x property
    vCardInProgress.x ??= {};
    if (property in vCardInProgress.x) {
      vCardInProgress.x[property].push({
        parameters,
        value: rawValue,
      });
    } else {
      vCardInProgress.x[property] = [{ parameters, value: rawValue }];
    }
  }
}

/**
 * Scan a group or property name.
 * @param line The entire line
 * @param start The offset at which to start scanning
 * @returns The scanned name and end position in upper case, or throws an error
 */
export function scanPropertyOrGroup(
  line: string,
  start: number,
  nags: Nag<VCardNagAttributes>[],
): { name: string; end: number } | null {
  for (let i = start; i < line.length; i++) {
    if (!isPropertyChar(line.charAt(i))) {
      if (start === i) {
        nagVC(nags, 'PROP_NAME_EMPTY', { property: '', line });
        return null;
      } else {
        return { name: nameToKey(line.substring(start, i)), end: i };
      }
    }
  }
  nagVC(nags, 'PROP_NAME_EOL', { property: line.substring(start), line });
  return null;
}

type GroupedProperty = {
  group?: Uppercase<string>;
  property: Uppercase<string>;
  end: number;
};

/**
 * Extract (group and) property names.
 * @param line The line to be scanned (from start)
 * @returns (Optional) group, property (both in uppercase), and scanning end. Or null on error.
 */
export function extractProperty(
  line: string,
  nags: Nag<VCardNagAttributes>[],
): GroupedProperty | null {
  const part1 = scanPropertyOrGroup(line, 0, nags);
  if (part1 === null) {
    return null;
  }
  if (line.charAt(part1.end) !== '.') {
    // Ordinary property
    return { property: part1.name, end: part1.end };
  } else {
    // Grouped property
    const part2 = scanPropertyOrGroup(line, part1.end + 1, nags);
    if (part2 === null) {
      return null;
    } else {
      return { group: part1.name, property: part2.name, end: part2.end };
    }
  }
}

/**
 * Scan a lone parameter value, without unescaping it
 * @param line The line to be parsed
 * @param start The offset to start parsing at (*after* the equals sign!)
 * @returns The parsed value and the end offset of it
 */
export function scanParamRawValue(
  line: string,
  start: number,
): { value: string; end: number } {
  let index = start;
  while (index < line.length && !':;'.includes(line.charAt(index))) {
    index++;
  }
  return { value: line.substring(start, index), end: index };
}

/**
 * Scan the potentially multiple values of this parameter.
 * @param line The line currently being parsed
 * @param start The offset to start parsing at
 * @param property The name of the property this parameter belongs to
 * @param parameter The name of the parameter
 * @param nags The list of all complaints
 * @param singleValue Do not treat commas as separator
 * @returns A string[] value and a parsing end, or null
 */
export function scanParamValues(
  line: string,
  start: number,
  property: string,
  parameter: string,
  nags: Nag<VCardNagAttributes>[],
  singleValue: boolean = false,
): { value: string[]; end: number } | null {
  const moreItemsChar = singleValue ? '' : ',';
  const separatorChars = singleValue ? ';:' : ',;:';
  let index = start;
  let parameterValues: string[] = [];
  let unescapedComma = false;
  while (
    line.charAt(index) === (parameterValues.length === 0 ? '=' : moreItemsChar)
  ) {
    index++;
    if (line.charAt(index) === ',') {
      unescapedComma = true;
    }
    if (line.charAt(index) === '"') {
      // Quoted value
      const closingQuote = line.indexOf('"', index + 1);
      if (closingQuote < 0) {
        nagVC(nags, 'PARAM_UNCLOSED_QUOTE', { property, parameter, line });
        return null;
      }
      parameterValues.push(
        scanSingleParamValue(
          line.substring(index + 1, closingQuote),
          (error) => {
            nagVC(nags, error, { property, parameter, line });
          },
        ),
      );
      index = closingQuote + 1;
    } else {
      // Potentially escaped value
      let currentValue = '';
      while (
        index < line.length &&
        !separatorChars.includes(line.charAt(index))
      ) {
        if (line.charAt(index) === ',') {
          unescapedComma = true;
        }
        if (line.charAt(index) === '\\') {
          const escaped = line.charAt(index + 1);
          if (escaped.toUpperCase() === 'N') {
            currentValue += '\n';
          } else {
            currentValue += escaped;
          }
          index += 2;
        } else {
          currentValue += line.charAt(index++);
        }
      }
      parameterValues.push(currentValue);
    }
  }
  if (unescapedComma) {
    // Only warn once per parameter
    nagVC(nags, 'PARAM_UNESCAPED_COMMA', { property, parameter, line });
  }
  return { value: parameterValues, end: index };
}

/**
 * Scan a lone parameter value, unescaping it
 * @param line The line to be parsed
 * @param start The offset to start parsing at (the equals sign)
 * @param property The name of the property this parameter belongs to
 * @param parameter The name of the parameter
 * @param nags The list of all complaints
 * @returns The parsed value and the end offset of it
 */
export function scanParamValue(
  line: string,
  start: number,
  property: string,
  parameter: string,
  nags: Nag<VCardNagAttributes>[],
): { value: string; end: number } | null {
  const result = scanParamValues(line, start, property, parameter, nags, true);
  if (result) {
    /* istanbul ignore else */
    if (result.value.length === 1) {
      return { value: result.value[0], end: result.end };
    } else {
      // Should not happen anymore since the support of `singleValue`
      nagVC(nags, 'PARAM_NOT_SINGLE', { property, parameter, line });
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Parse the parameters. Used after scanning the property or group. What remains should be the value.
 * @param line The vCard line to be analyzed
 * @param start The offset where to start parsing (the equals sign)
 * @returns A record of VCardParameters, and the end offset.
 */
export function parseParameters(
  line: string,
  start: number,
  nags: Nag<VCardNagAttributes>[],
  property: string,
): {
  parameters: VCardParameters;
  end: number;
} | null {
  let index = start;
  let parameters: VCardParameters = {};
  while (line.charAt(index) === ';') {
    // Parse another property: Name
    index++;
    const start = index;
    while (isPropertyChar(line.charAt(index))) {
      index++;
    }
    const parameterName = nameToKey(line.substring(start, index));
    if (line.charAt(index) !== '=') {
      nagVC(nags, 'PARAM_MISSING_EQUALS', {
        property,
        parameter: parameterName,
        line,
      });
      return null;
    }
    // Index still points at the equals sign!

    // Value(s)
    if (isKnownParameter(parameterName)) {
      switch (knownParameters[parameterName].name) {
        case 'string':
        case 'number':
          {
            if (parameterName in parameters) {
              nagVC(nags, 'PARAM_DUPLICATE', {
                property,
                parameter: parameterName,
                line,
              });
            }
            const retval = scanParamValue(
              line,
              index,
              property,
              parameterName,
              nags,
            );
            if (retval) {
              index = retval.end;
              if (knownParameters[parameterName].name === 'number') {
                const num = parseInt(retval.value, 10);
                if (isFinite(num)) {
                  (parameters as any)[parameterName] = num;
                } else {
                  nagVC(nags, 'PARAM_INVALID_NUMBER', {
                    property,
                    parameter: parameterName,
                    line,
                  });
                }
              } else {
                (parameters as any)[parameterName] = retval.value;
              }
            } else {
              return null;
            }
          }
          break;
        case 'string[+]':
          // Re-scan the `=`
          const values = scanParamValues(
            line,
            index,
            property,
            parameterName,
            nags,
          );
          if (values == null) {
            return null;
          } else {
            if (parameterName in parameters) {
              (parameters[parameterName] as string[]) = (
                parameters[parameterName] as string[]
              ).concat(values.value);
            } else {
              (parameters as any)[parameterName] = values.value;
            }
            index = values.end;
          }
          break;
        /* istanbul ignore next */
        default:
          // Skip over this unknown type; should never happen
          const retval = scanParamValue(
            line,
            index,
            property,
            parameterName,
            nags,
          );
          nagVC(nags, 'PARAM_INVALID_TYPE', {
            property,
            parameter: parameterName,
            line,
          });
          if (retval) {
            index = retval.end;
          } else {
            return null;
          }
      }
    } else {
      parameters.x ??= {};
      // scanParamRawValue, unlike scanParamValue(s), starts *after* the equals sign
      const { value, end } = scanParamRawValue(line, index + 1);
      if (parameterName in parameters.x) {
        // This is inconsistent:
        // `KEY=value;KEY=v2` results in `{KEY: ['value', 'v2']}`, whereas
        // `KEY=value,v2` results in `{KEY: ['value,v2']}`.
        // However, this is the only way not to make assumptions about the value type.
        parameters.x[parameterName].push(value);
      } else {
        parameters.x[parameterName] = [value];
      }
      index = end;
    }
  }
  return { parameters, end: index };
}
