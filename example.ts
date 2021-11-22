// The origin of the example code in the REAMDE; look there for
// documentation. This here is just for convenience and testing.

import { parseVCards, sortByPREF } from './src';
import { readFileSync } from 'fs';

const vcf = readFileSync('example.vcf').toString();

const cards = parseVCards(vcf);
// Simple example
for (const card of cards.vCards ?? []) {
  console.log('Card found for ' + card.FN[0].value[0]);
}

// More elaborate example
if (cards.nags) {
  // There were global problems, e.g. because the file did seem to contain invalid vCards.
  // Those cards can be obtained by passing `keepDefective: true` to `parseVCards()`.
  for (const nag of cards.nags) {
    if (nag.isError) {
      console.error(`${nag.key} (${nag.description}): ${nag.attributes}`);
    } else {
      console.warn(`${nag.key} (${nag.description}): ${nag.attributes}`);
    }
  }
}
for (let card of cards.vCards) {
  // If you would like element 0 to correspond to the most PREFerred item:
  sortByPREF(card);

  // You're guaranteed to have all these (required) properties,
  // no need to check their existence first. Also, the editor will
  // auto-complete and know the type.
  console.log('Found vCard with version ' + card.VERSION.value);
  console.log('Full name: ' + card.FN[0].value[0]);

  // Maybe some optional (any-cardinality) RFC6350 property is present?
  if (card.EMAIL) {
    // There might be multiple EMAIL property lines, but as the EMAIL field
    // is present, we're guaranteed to have at least one value. See
    // https://netfuture.ch/2021/11/array-thickening-more-can-be-less/
    console.log('Emailable at: ' + card.EMAIL[0].value);
    // Is it known whether it is a work or home address?
    if (card.EMAIL[0].parameters?.TYPE) {
      console.log('It is of type: ' + card.EMAIL[0].parameters.TYPE[0]);
    }
  }

  // The same with a structured any-cardinality property
  if (card.ADR) {
    // All elements of the address, including the locality, can have multiple
    // values. And we still could have multiple addresses (e.g., work and
    // home). We'll just print the first.
    console.log('Living in: ' + card.ADR[0].value.locality[0]);
  }

  // Any property not in the standard (and its extension RFCs)?
  // (Their name should be prefixed with `X-`)
  if (card.x) {
    for (const [k, v] of Object.entries(card.x)) {
      console.log('Non-RFC6350 property ' + k + ', with ' + JSON.stringify(v));
    }
  }

  // Any problems found while parsing the vCard?
  if (card.nags) {
    console.log(
      'While parsing this card, the following was noticed ' +
        '(and either the problematic part dropped or ignored)',
    );
    for (const nag of card.nags) {
      if (nag.isError) {
        console.error(`Global ${nag.key} (${nag.description})`);
      } else {
        console.warn(`Global ${nag.key} (${nag.description})`);
      }
    }

    // Some of these problems might be unparseable lines. They are archived
    // here.
    if (card.unparseable) {
      console.log('The following unparseable lines were encountered:');
      for (const line of card.unparseable) {
        console.log(line);
      }
    }
  }
}
