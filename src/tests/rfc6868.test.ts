import { scanSingleParamValue } from '../scan';
import { errorKeys } from '../errorCodes';
import { parseVCards } from '../parse';

describe('RFC6868 scanning', () => {
  it('should handle unescaped values', () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc123', (error) => warnings.add(error)),
    ).toStrictEqual('abc123');
    expect(warnings).toStrictEqual(new Set());
  });
  it("should handle ^'", () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue("abc^'123", (error) => warnings.add(error)),
    ).toStrictEqual('abc"123');
    expect(warnings).toStrictEqual(new Set());
  });
  it("should handle ^^'", () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc^^123', (error) => warnings.add(error)),
    ).toStrictEqual('abc^123');
    expect(warnings).toStrictEqual(new Set());
  });
  it('should handle ^n', () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc^n123', (error) => warnings.add(error)),
    ).toStrictEqual('abc\n123');
    expect(warnings).toStrictEqual(new Set());
  });
  it('should nag about ^x', () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc^x123', (error) => warnings.add(error)),
    ).toStrictEqual('abc^x123');
    expect(warnings).toStrictEqual(new Set(['PARAM_BAD_CIRCUMFLEX']));
  });
  it('should handle ^^^', () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc^^^123', (error) => warnings.add(error)),
    ).toStrictEqual('abc^^123');
    expect(warnings).toStrictEqual(new Set(['PARAM_BAD_CIRCUMFLEX']));
  });
  it('should nag about \n and keep it', () => {
    let warnings: Set<errorKeys> = new Set();
    expect(
      scanSingleParamValue('abc\\n123', (error) => warnings.add(error)),
    ).toStrictEqual('abc\\n123');
    expect(warnings).toStrictEqual(new Set(['PARAM_BAD_BACKSLASH']));
  });
});

describe('RFC6868 parsing', () => {
  it('should understand \\n in LABEL', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marcel Waldvogel\r\nADR;LABEL=Some\\nMultiline\\nLabel:;;Oberstadt 8;Stein am Rhein;;8260;Switzerland\r\nEND:VCARD\r\n',
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
              parameters: { LABEL: 'Some\nMultiline\nLabel' },
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
