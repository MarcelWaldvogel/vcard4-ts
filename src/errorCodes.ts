// key → [description, isError]
export const errors = {
  FILE_EMPTY: ['File did not contain any vCard', true],
  FILE_CRLF: ['Lines ending in bare linefeeds instead of CR+LF', false],
  VCARD_BAD_TYPE: ['Not a vCard', true],
  VCARD_NOT_BEGIN: ['vCard did not start with BEGIN line', true],
  VCARD_MISSING_PROP: ['Missing required property', true],
  PROP_NAME_EMPTY: ['Empty property or group name', true],
  PROP_NAME_EOL: ['Property or group name terminated by line end', true],
  PROP_MISSING_COLON: ['Property not terminated by colon', true],
  PROP_DUPLICATE: ['Illegal duplicate property', true],
  PARAM_UNCLOSED_QUOTE: ['Quoted parameter missing closing quote', true],
  PARAM_MISSING_EQUALS: ['Missing equals sign after parameter name', true],
  PARAM_INVALID_NUMBER: ['Invalid number', true],
  PARAM_INVALID_TYPE: ['Internal error: Unexpected type', true],
  PARAM_DUPLICATE: ['Illegal duplicate parameter', true],
  VALUE_INVALID: ['Invalid property value', true],
  VALUE_UNESCAPED_COMMA: ['Unescaped comma in value', false],
} as const;
export type errorKeys = keyof typeof errors;
