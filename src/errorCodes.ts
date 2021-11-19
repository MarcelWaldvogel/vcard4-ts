// key → [description, isError]
export const errors = {
  // Problems concerning the entire file
  FILE_EMPTY: ['File did not contain any vCard', true],
  FILE_CRLF: ['Lines ending in bare linefeeds instead of CR+LF', false],
  // Problems concerning a single vCard
  VCARD_BAD_TYPE: ['Not a vCard', true],
  VCARD_NOT_BEGIN: ['vCard did not start with BEGIN line', true],
  VCARD_MISSING_PROP: ['Missing required property', true],
  // Problems concerning the property name (or its termination)
  PROP_NAME_EMPTY: ['Empty property or group name', true],
  PROP_NAME_EOL: ['Property or group name terminated by line end', true],
  PROP_MISSING_COLON: [
    'Internal error: Property not terminated by colon',
    true,
  ],
  PROP_DUPLICATE: ['Illegal duplicate property', true],
  // Problems concerning a parameter name, value, or separator
  PARAM_UNCLOSED_QUOTE: ['Quoted parameter missing closing quote', true],
  PARAM_MISSING_EQUALS: ['Missing equals sign after parameter name', true],
  PARAM_INVALID_NUMBER: ['Invalid number', true],
  PARAM_INVALID_TYPE: ['Internal error: Unexpected type', true],
  PARAM_NOT_SINGLE: ["Internal error: Single parameter isn't", true],
  PARAM_DUPLICATE: ['Illegal duplicate parameter', true],
  PARAM_UNESCAPED_COMMA: ['Unescaped comma in parameter value', false],
  PARAM_BAD_BACKSLASH: ['Backslash found in parameter value', false],
  PARAM_BAD_CIRCUMFLEX: [
    'Circumflex not part of escape sequence in parameter value',
    false,
  ],
  // Problems concerning the actual property value
  VALUE_INVALID: ['Invalid property value', true],
  VALUE_UNESCAPED_COMMA: ['Unescaped comma in value', false],
} as const;
export type errorKeys = keyof typeof errors;
