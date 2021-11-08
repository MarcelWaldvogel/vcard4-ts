# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this
project adheres to [Semantic Versioning](https://semver.org/).

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
