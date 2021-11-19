import { parseVCards } from '../parse';

describe('RFC6715 parsing', () => {
  it('should recognize all RFC6715 additions in one go', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marcel Waldvogel\r\nEXPERTISE;LEVEL=expert;index=1:Procrastrination\r\nHOBBY:Reading\r\nINTEREST:Politics\r\nINTEREST:Digitalization\r\nORG-DIRECTORY:https://dir.example.ch\r\nEND:VCARD\r\n',
      ),
    ).toStrictEqual({
      vCards: [
        {
          BEGIN: { value: 'VCARD' },
          VERSION: { value: '4.0' },
          FN: [{ value: 'Marcel Waldvogel' }],
          EXPERTISE: [
            {
              parameters: { LEVEL: 'expert', INDEX: 1 },
              value: 'Procrastrination',
            },
          ],
          HOBBY: [{ value: 'Reading' }],
          INTEREST: [{ value: 'Politics' }, { value: 'Digitalization' }],
          ORG_DIRECTORY: [{ value: 'https://dir.example.ch' }],
          END: { value: 'VCARD' },
          hasErrors: false,
        },
      ],
    });
  });
});
