# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this
project adheres to [Semantic Versioning](https://semver.org/).

# 0.4.0+ - [Unreleased]

## Added

- Store unparseable lines in `unparseable[]`.
- Tighter type checks

## Fixed

- ESM includes need full file names

## Changed

# 0.4.0 - 2021-11-19

## Added

- Suport RFC8605 property `CONTACT-URI` and parameter `CC`
- Support RFC6715 properties `EXPERTISE`, `INTEREST`, `HOBBY`, `ORG-DIRECTORY`
  and parameters `LEVEL`, `INDEX`
- Support RFC6474 properties `BIRTHPLACE`, `DEATHPLACE`, `DEATHDATE`
- Support RFC6868 double-quoted parameter value escaping using `^` (no more
  support for `\n` for these, see changes below).
- Support RFC6350 parameter `LABEL`, which does not have its own section, but is
  only mentioned (essentially "in passing") in the `ADR` description.

## Fixed

- Did not nag at all about escaping warnings in double-quoted parameter values

## Changed

- Backslash sequences in double-quoted parameter values (e.g., `\n`) are passed
  along transparently, in accordance with RFC6868. `\n` in parameter values _not
  enclosed in double quotes_ will still be processed, as mandated for the
  `LABEL` parameter in
  [RFC6350, `ADR` section](https://datatracker.ietf.org/doc/html/rfc6350#section-6.3.1).
- As of RFC6868 support, single-valued property values no longer use the same
  unescaping code as double-quoted parameter values.
- Ignore "should not happen" code from coverage

# 0.3.1 - 2021-11-08

## Added

## Fixed

- Grouping multiple X-properties of the same type into one group resulted in
  lost properties. Found while tuning code coverage.

## Changed

# 0.3.0 - 2021-11-07

## Added

- Grouping grouped properties (such as `1.ADR` and `1.TEL` into group `1` and
  `2.ADR` and `2.TEL` into `2`, and everything ungrouped into `top`) using
  `groupVCard()`

## Fixed

- Undefined `PREF` is sorted _behind_ `PREF=100` (RFC6350)

## Changed

- Narrowed the `Uppercase<string>` types
- Requires TypeScript 4.1 (released November 2020)

# 0.2.0 - 2021-11-02

## Added

- Documentation: Coverage badge
- Sorting by preference

## Fixed

- Documentation still contained a now outdated draft text block

## Changed

- Breaking change: Non-RFC6350 properties and parameters moved from
  `unrecognized` to `x`, as those should mostly have `X-` names
- Updated documentation to reflect
  [`vcard4` module](https://github.com/kelseykm/vcard4) updates
- Fixed ìsKnownProperty()` spelling

# 0.1.3 - 2021-11-02

## Added

- Documentation: Example code, design, and reference
- License file

## Fixed

## Changed

# 0.1.2 - 2021-10-31

## Added

## Fixed

- Ensure compatibility

## Changed

- Updated `vcard4` explanation

# 0.1.1 - 2021-10-31

## Added

## Fixed

- Missing files added to NPM module

## Changed

# 0.1.0 - 2021-10-31

## Added

- First public release

## Fixed

## Changed
