import { parseVCards } from '../parse';

describe('RFC8605 parsing', () => {
  it('should recognize CC', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marcel Waldvogel\r\nADR;cc=CH;type=work:;;Oberstadt 8;Stein am Rhein;;8260;Switzerland\r\nEND:VCARD\r\n',
        true,
      ),
    ).toStrictEqual({
      vCards: [
        {
          BEGIN: { value: 'VCARD' },
          VERSION: { value: '4.0' },
          FN: [{ value: 'Marcel Waldvogel' }],
          ADR: [
            {
              parameters: { CC: 'CH', TYPE: ['work'] },
              value: {
                postOfficeBox: [''],
                extendedAddress: [''],
                streetAddress: ['Oberstadt 8'],
                locality: ['Stein am Rhein'],
                region: [''],
                postalCode: ['8260'],
                countryName: ['Switzerland'],
              },
            },
          ],
          END: { value: 'VCARD' },
          hasErrors: false,
        },
      ],
    });
  });
  it('should recognize CC', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marcel Waldvogel\r\nCONTACT-URI:mailto:mw@example.ch\r\nCONTACT-URI:https://example.ch/contact/\r\nEND:VCARD\r\n',
        true,
      ),
    ).toStrictEqual({
      vCards: [
        {
          BEGIN: { value: 'VCARD' },
          VERSION: { value: '4.0' },
          FN: [{ value: 'Marcel Waldvogel' }],
          CONTACT_URI: [
            { value: 'mailto:mw@example.ch' },
            { value: 'https://example.ch/contact/' },
          ],
          END: { value: 'VCARD' },
          hasErrors: false,
        },
      ],
    });
  });
});
