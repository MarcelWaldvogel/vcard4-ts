![vcard4-ts](./assets/vCard4-ts.svg)

# vcard4-ts — A vCard 4.0 library with type safety first

![Coverage badge](./assets/coverage-badge.svg)

`vcard4-ts` was designed with the following goals:

- [RFC 6350](https://datatracker.ietf.org/doc/html/rfc6350) compliant

- TypeScript (and type safety) from the ground up

- Avoid mistakes, DRY (Don't Repeat Yourself)

  - The data structure definition, created from RFC 6350, contains instructions for the parser

- The returned data structure is easy to use
  - The decisions to be made by the calling code should be as few and as simple as possible. Everything that can be delegated to the IDE (while writing your code) and TypeScript compile time should be handled there. E.g., no need to check whether there is a single or multiple values: if something can occur multiple times, the item is always in an array.

## Installation

`yarn add vcard4-ts` or `npm i vcard4-ts`. No dependencies (except devDependencies).

## Usage

### Simple example

Basic usage is straightforward:

```ts
import { parseVCards } from 'vcard4-ts';
import { readFileSync } from 'fs';

const vcf = readFileSync('example.vcf').toString();

const cards = parseVCards(vcf);
if (cards.vCards) {
  for (const card of cards.vCards) {
    console.log('Card found for ' + card.FN[0].value[0]);
  }
} else {
  console.error('No valid vCards in file');
}
```

We can see two basic principles in action:

1. The types are always clear, no expensive run-time testing whether there is just a single value or there are multiple values. (This is the prime directive.)
2. There are no `null` or `undefined` (aka nullish) values; and any arrays will always have at least one element. This is the secondary directive.

As a result of these principles, the following rules apply:

1. Mandatory properties (`BEGIN`, `END`, `VERSION`, and `FN`) always do exist and are never `null` or `undefined` ("nullish").
2. Optional properties (all the others defined in RFC 6350) only exist, if they do appear in the file. I.e., if they exist, they also have a value and are never nullish. (However, the strings may still be empty.)
3. To match the prime directive, any property, whether mandatory or optional, that _may_ appear more than once, is [_always_ an array of values](#arrays).

These rules make software development more predictable and thus faster, less error-prone:

- Typescript can verify type correctness.
- Autocompletion and type inference in IDEs such as VSCode/VSCodium works and is very helpful.

### More elaborate example

This example demonstrates the access to parsing errors and warnings, to structured information, and non-RFC6350 properties. Explanations are in the [design](#design) and [reference](#reference) sections below.

```ts
if (cards.nags) {
  // There were global problems, e.g. because the file did seem to contain invalid vCards.
  // Those cards can be obtained by passing `keepDefective: true` to `parseVCards()`.
  for (const nag of cards.nags) {
    if (nag.isError) {
      console.error(
        `Error ${nag.key} (${nag.description}) with ${nag.attributes}`,
      );
    } else {
      console.warn(
        `Warning ${nag.key} (${nag.description}) with ${nag.attributes}`,
      );
    }
  }
}
for (const card of cards.vCards) {
  // You're guaranteed to have all these (required) properties
  console.log('Found vCard with version ' + card.VERSION.value);
  console.log('Full name: ' + card.FN[0].value[0]);
  // Maybe some optional RFC6350 property?
  if (card.EMAIL) {
    // There might be multiple EMAIL property lines, but we're guaranteed to have one value per property
    console.log('Emailable at: ' + card.EMAIL[0].value);
    // Access its TYPE parameter
    if (card.EMAIL[0].parameters?.TYPE) {
      console.log('It is of type: ' + card.EMAIL[0].parameters.TYPE[0]);
    }
  }
  if (card.ADR) {
    // All elements of the address, including the locality, can have multiple values.
    // And we still could have multiple addresses (e.g., work and home). We'll just print the first.
    console.log('Living in: ' + card.ADR[0].value.locality[0]);
  }
  if (card.x) {
    for (const [k, v] of Object.entries(card.x)) {
      console.log('Non-RFC6350 property ' + k + ', with ' + JSON.stringify(v));
    }
  }
  if (card.nags) {
    console.log(
      'While parsing this card, the following was noticed ' +
        '(and either the problematic part dropped or ignored)',
    );
    for (const nag of card.nags) {
      if (nag.isError) {
        console.error(
          `Error ${nag.key} (${nag.description}) at ${nag.attributes}`,
        );
      } else {
        console.warn(
          `Warning ${nag.key} (${nag.description}) at ${nag.attributes}`,
        );
      }
    }
  }
}
```

## Design

The prime design goal is to avoid mistakes in the code and enable calling code to avoid mistakes as well. Designing for (type) safety is achieved by [Don't Repeat Yourself](#dry), [Parse, don't validate](#parse-dont-validate), and [Array thickening](#array-thickening).

### DRY

[Don't Repeat Yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) was a basic design principle while developing the module. The description of the data structure is centralized. The goal was to have only a single authoritative source of type information, from which both compile-time type information and runtime parsing instructions would be derived. As TypeScript transpilation output no longer contains the type information, it was necessary to jump through hoops. (Luckily, [Colin McDonnell's Zod](https://colinhacks.com/essays/zod) was a great resource for educating about hoop-jumping.)

### Parse, don't validate

The idea of [parsing instead of validation](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) was introduced by Alexis King, for the Haskell ecosystem. The gist of it: Directly parse the source data into the required (type-safe) format, instead of first parsing it into an (essentially) untyped format and then validating it to be of the right type. This assures that type safety starts earlier and is guaranteed to be consistent throughout the entire codebase.

In `vcard4-ts`, data structures are created and filled type-safe from the start. Because properties will be added on a line-by-line basis, required properties cannot be ensured to exist from the start. Therefore, as an exception to this rule, the existance of required fields is only ensured at the end.

### Array thickening

The advantage of always having an array IMHO greatly outweighs the disadvantages. Calling code can always assume that the contents _are_ an array. I.e., arrays with just a single value are _never_ flattened (therefore the name). If you are only interested in one value, just use the one at index 0, which will always exist. If you want to deal with multiple values, use array methods such as `map()` and `join()`, which you can always use, because it is always an array. Yes, this results in more time and space spent during the creation of the data structure.

More importantly, this relieves calling code from performing case distinctions on every single access. Instead, the existence of the property can be asserted once and every reference to it later already knows how to deal with it. It is even possible to combine assertion and access with [optional chaining](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining).

Array thickening results in less code for the caller, which often also results in less code coverage, i.e., the uncommon case is not tested. In other words, array thickening turns the general case (whether common or uncommon) into the only case.

## Reference

### Property/parameter names

All vCard properties and parameters in the data structures are uppercase and dashes have been converted to underscores. This makes them clearly visible and easily accessible as JavaScript/TypeScript properties, avoiding the harder-to-type hash/array notation (i.e., `card.SORT_AS` instead of `card['SORT-AS']`).

Lowercase JavaScript/TypeScript properties are maintained by the parser.

### Property cardinality

- `BEGIN`, `END`, and `VERSION` exist exactly once (cardinality `1` in RFC6350; required value in TypeScript)
- `FN` (full name) exists at least once (`1*` in RFC6350; optional array in TypeScript)
- `PRODID`, `UID`, `REV`, `KIND`, `N` (name), `BDAY`, `ANNIVERSARY`, and `GENDER` are optional (`*1` in RFC6350; optional value in TypeScript)
- [All others](src/vcard4Types.ts) can occur any number of times (`*` in RFC6350; optional array in TypeScript)

### Property value type

- `N` is an object with the following properties: `familyNames`, `givenNames`, `additionalNames`, `honorificPrefixes`, `honorificSuffixes`; each a required `string[]`. Remember that arrays are guaranteed to always have at least one element, i.e., the an empty `honorificPrefixes` property will be encoded as an array consisting of an empty string `['']`.
- `ADR` is similar to `N`, but with the following string array fields: `postOfficeBox`, `extendedAddress`, `streetAddress`, `locality` (city), `region`, `postalCode`, and `countryName`.
- `GENDER` consists of two `string`s, a required `sex` and an optional explanatory `text`. `sex` is required by RFC6350 to be one of `M`, `F`, `O`, `N`, `U`, or the empty string. However, this is not checked by `vcard4-ts`.
- `CLIENTPIDMAP` consists of `pidRef`, a `number`, and a `uri`, a `string`.
- All other properties' values are mapped to a single `string`, even if they are defined as more structured types, such as dates or URIs.

### Property parameters

Properties can have [(mostly optional) parameters](https://datatracker.ietf.org/doc/html/rfc6350#section-5):

- `PREF` is a `number`. It is not asserted whether it is in the range [1…100] required by the RFC; non-numeric values are returned as `NaN`.
- `PID`, `TYPE`, and `SORT_AS` (`SORT-AS` in the VCF) are `string[]`s, again with a guaranteed minimum array length of 1. (Please note that [the example in the RFC](https://datatracker.ietf.org/doc/html/rfc6350#section-8) quotes the enumeration of `TYPE`s, which seems inconsistent with the [`TYPE` definition](https://datatracker.ietf.org/doc/html/rfc6350#section-5.6), so you may want to apply `split(',')` to all `TYPE` values first.)
- All others are single `string`s.

### Non-RFC6350 properties and parameters

Any property or parameter whose type is not explicitely given in RFC6350, including those prefixed by `X-`, are not included at the same level as the rest of the properties. One reason is that [TypeScript does not really allow default types on object properties](https://basarat.gitbook.io/typescript/type-system/index-signatures#excluding-certain-properties-from-the-index-signature) and therefore, [nested index signatures](https://basarat.gitbook.io/typescript/type-system/index-signatures#design-pattern-nested-index-signature) are recommended for this.

Instead, non-RFC6350 properties and parameters are put into an `x` object property. The actual value will be a plain, unprocessed `string`. If it has more structure, you need to extract it yourselves, e.g. using

- `scan1DValue()`, which unescapes and splits at the specified `splitChar` (`,`, as used for `PID` or `TYPE` parameters; or `;`, as used for the `GENDER` value); or
- `scan2DValue()`, which splits into a `string[][]` at `;` _and_ `,` (used for `ADR` and `N` values).

For example, the `string` value of an `X-ABUID` property in card `card` would be available as `card.x.X_ABUID.value`.

### Handling errors

**Your application can just ignore the errors, if it does not want to bother.**

One of the design goals so obvious that it was not specifically mentioned above, is that `vcard4-ts` should be as easy to use as possible. Anyone who ever had to deal with user-specified input can tell horror stories about what can go wrong. Last but not least, ensuring [user-specified input fulfills certain requirements is also a matter of security](https://owasp.org/Top10/A03_2021-Injection/).

Therefore, `parseVCards()` returns the information in a format as consistent as possible, minimizing doubt and variability. In general, any line that cannot be parsed is ignored, and any vCard which does not fulfill minimum criteria is discarded.

This process is documented in the `nags` property of the returned object(s). The `nags` property is an array of warnings and errors that occurred during the processing.

#### Warnings and errors

A _warning_ indicates that even though the input does not fulfill an RFC6350 criteria, the parser believes that it could safely correct the problem and that the data returned is probably exactly what its originator meant it to be.

An _error_, on the other hand, indicates that some information was dropped, or, alternatively, that some required information was added. The resulting parsed data is not the same as originally provided, but it is the best the parser could do to achieve RFC6350 conformance.

If at least one actual error (not just warnings) is included in the nags, `hasErrors` is set to `true`. Depending on the policy of the calling code,

- data can be accepted as returned by the parser (most lenient),
- data can be refused if `hasErrors` is `true` (it always exists, but hopefully is `false`), or
- data can be refused if `nags` exists (i.e., any errors or warnings occured; the most strict policy).

#### Global, local, and mixed nags

_Local_ nags are specific to a vCard and are stored there, alongside the properties.

Local nags have the following type:

```ts
{
  key: string; // A short string to match against in the code
  description: string; // A longer english-language description to display to the user
  isError: boolean; // Error or warning?
  attributes: {
    property: string; // The property it occurred at (or '', if there was a property name parsing problem)
    parameter?: string; // If the problem occurred while parsing a parameter, this is its name
    line?: string; // The first few characters of the line on which this error occurred
  }
}
```

_Global_ nags are set at the top level of the returned structure, alongside the `vCards` field, if it exists. They indicate problems not related to a vCard, or related to a vCard which was not included because it was considered too bad to be returned.

Global nags use the same type as local nags above, but without the `attributes`.

_Mixed_ nags are used to indicate errors affecting an entire vCard (there are no mixed warnings). If `parseVCards()` detects a major problem with a vCard (`VCARD_BAD_TYPE` or `VCARD_NOT_BEGIN`), then—by default—this vCard is dropped and the error—unable to be stored _in_ the vCard itself—is bubbled up to the _global_ level. However, if `keepDefective=true` is passed as an optional argument, these vCards are not dropped and the error is stored in the vCard itself.

#### The nags

- `FILE_EMPTY`: A global error.
- `FILE_CRLF`: A global warning, that lines did not end in carriage return+line feed as specified in RFC6350, but just with line feeds. (This only checks the first line end and is therefore subject to false negatives, if line ends are not consistent.)
- `VCARD_BAD_TYPE`: A mixed error resulting in a defective card. The `BEGIN` or `END` property does not have the required `VCARD` value.
- `VCARD_NOT_BEGIN`: A mixed error resulting in a defective card. The first property of the vCard is not a `BEGIN` property.
- `VCARD_MISSING_PROP`: A local error. A required property is missing and has been added with a default value. The default for `VERSION` is `4.0`; for `FN`, the empty string.
- `PROP_NAME_EMPTY`: A local error. The property has an empty name.
- `PROP_NAME_EOL`: A local error. The property name is terminated by the end of line, i.e., colon and value are missing.
- `PROP_DUPLICATE`: A local error. property which may not appear more than once has been seen a second time.
- `PARAM_UNCLOSED_QUOTE`: A local error. A parameter had a quoted value, but the quote was unbalanced.
- `PARAM_MISSING_EQUALS`: A local error. A parameter name was not terminated by an equals sign.
- `PARAM_INVALID_NUMBER`: A local error. The parameter value should have been a number but wasn't.
- `PARAM_DUPLICATE`: A local error. A parameter that can only have a single value was specified more than once.
- `PARAM_UNESCAPED_COMMA`: A local warning. A parameter accepting only a single value contained an unescaped comma. This may indicate incomplete character escaping or trying to provide multiple values where they are not allowed.
- `VALUE_INVALID`: A local error. A property with a required value had a different value.
- `VALUE_UNESCAPED_COMMA`: A local warning. A property accepting only a single value contained an unescaped comma. This may indicate old-style (vCard3) value, e.g. for `PHOTO`, which is considered incomplete character escaping in vCard4.

## Related work

- Searching for `vcard` on [NPM](https://npmjs.org) results in mostly vCard generators or converters to/from other formats. Notable exceptions:

  - [vcard4](https://github.com/kelseykm/vcard4) is a vCard 4.0 generator which also includes parsing capabilities.  
    Trying to create type annotations for `vcard4` turned out to be hard. The resulting types for the parser would be so lax as not to help when writing a program processing it further, requiring runtime type verification in the application. Also, their design decision to transform arrays with a single member into requires every access to verify the field's structure. Furthermore, it has some (easily fixable) issues with its RFC 6350 compliance (lack of support for multiple vCards in a single file, lack of property group support, or incomplete unescaping rules) and the IETF's general [Robustness principle](https://en.wikipedia.org/wiki/Robustness_principle) (i.e., not accepting bare newlines).
  - [vdata-parser](https://github.com/floriangosse/vdata-parser) is a generic vCard/vCalendar parser, handling multiple cards in a single file.  
    Similar to `vcard4` above, it does not seem amenable to reasonably tight types and mixes elements and arrays. Furthermore, it is unaware of the expected parameter/property structure and does not handle escaped data.

- The runtime type introspection required for DRY is modeled after [Zod](https://github.com/colinhacks/zod/).  
  Zod was even used for an early prototype. However, a ultra-lightweight, tailored alternative to Zod was created (clocking in at under 200 bytes minified/gzipped). Zod would have created overhead (additional dependencies, bundle size, but especially the amount of code needed to define and query the schema, while having to touch Zod internals which might change in the future), while providing little benefit. For example, Zod's `transform` seemed to be impossible to apply to parsing directly. So, Zod's would just have been used to duplicate work that had already been performed
