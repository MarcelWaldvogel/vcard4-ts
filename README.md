![vcard4-ts](./assets/vCard4-ts.svg)

# vcard4-ts — A vCard 4.0 library with type safety first

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

```ts
import { vcard4parse } from 'vcard4-ts';

const cards = vcard4parse(string);
for (const card in cards) {
  // XXX TODO
}
```

## Design

### Avoiding mistakes

1. DRY
2. Designed for type safety (library)
   - Data structure
   - Processing
3. Clear for consumer of the data structure
   - No flatten-single-element-array optimizations
     - → Recipient needs to check always
     - More code for user
     - Rare case not tested

Elements, which can occur multiple times, are always an array, never just an individual element.

Optional elements, which can occur multiple times, are stored as follows:

- If there is no value for them at all, it is `undefined`
- If there is a value, it is a `NonEmptyArray` of that value

This is to make testing for presence easier without having to pre-fill all possible optional elements with an empty array.

## Related work

- Searching for `vcard` on [NPM](https://npmjs.org) results in mostly vCard generators or converters to/from other formats. Notable exceptions:
  - [vcard4](https://github.com/kelseykm/vcard4) is a vCard 4.0 generator which also includes parsing capabilities.  
    Trying to create type annotations for `vcard4` turned out to be hard. The resulting types for the parser would be so lax as not to help when writing a program processing it further, requiring runtime type verification in the application. Also, their design decision to transform arrays with a single member into requires every access to verify the field's structure. Furthermore, it has some (easily fixable) issues with its RFC 6350 compliance (lack of support for multiple vCards in a single file, not supporting lines folded with tabs, lack of property group support, or incomplete unescaping rules) and the IETF's general [Robustness principle](https://en.wikipedia.org/wiki/Robustness_principle) (i.e., not accepting bare newlines).
  - [vdata-parser](https://github.com/floriangosse/vdata-parser) is a generic vCard/vCalendar parser, handling multiple cards in a single file.  
    Similar to `vcard4` above, it does not seem amenable to reasonably tight types and mixes elements and arrays. Furthermore, it is unaware of the expected parameter/property structure and does not handle escaped data.

- The runtime type introspection required for DRY is modeled after [Zod](https://github.com/colinhacks/zod/).  
  Zod was even used for an early prototype. However, a ultra-lightweight, tailored alternative to Zod was created (clocking in at under 200 bytes minified/gzipped). Zod would have created overhead (additional dependencies, bundle size, but especially the amount of code needed to define and query the schema, while having to touch Zod internals which might change in the future), while providing little benefit. For example, Zod's `transform` seemed to be impossible to apply to parsing directly. So, Zod's would just have been used to duplicate work that had already been performed
