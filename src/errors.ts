import { errorKeys, errors } from './errorCodes';

export type Nag<Attributes> = {
  key: string;
  description: string;
  isError: boolean;
  attributes?: Attributes;
};

/**
 * Add a problem for this nag list
 * @param nags The list to append this nag to
 * @param key The error message key
 * @param attributes Optional additional attributes
 */
export function nag<Attributes>(
  nags: Nag<Attributes>[],
  key: errorKeys,
  attributes?: Attributes,
) {
  let data: Nag<Attributes> = {
    key,
    description: errors[key][0],
    isError: errors[key][1],
  };
  if (attributes) {
    data.attributes = attributes;
  }
  nags.push(data);
}

export type VCardNagAttributes = {
  property: string;
  parameter?: string;
  line?: string;
};
/**
 * Append a nag specific to a vCard or vCard line
 * @param nags The list to append this nag to
 * @param key The error message key
 * @param attr Specific information for this vCard
 */
export function nagVC(
  nags: Nag<VCardNagAttributes>[],
  key: errorKeys,
  attributes: VCardNagAttributes,
) {
  if ('line' in attributes) {
    // Shorten the potentially homunguous unwrapped lines (e.g. PHOTO)
    attributes.line = shorten(attributes.line);
  }
  nag(nags, key, attributes);
}

export const SHORTEN_TO = 30;
/**
 * Shortens a string to at most `MAX_DEBUG` chars (plus a trailing `…`, if it was shortened)
 * @param s String
 * @returns Potentially shortened string
 */
export function shorten(s: string, shortenTo: number = SHORTEN_TO): string {
  if (s.length > SHORTEN_TO) {
    return s.substring(0, shortenTo - 1) + '…';
  } else {
    return s;
  }
}
