import { parseVCards } from '../';

describe('Importing through the index', () => {
  it('should nag about quoted multiple strings', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Marcel Waldvogel\r\nEMAIL;PREF=yes:a@b.c\r\nEND:VCARD',
        false,
      ),
    ).toStrictEqual({
      vCards: [
        {
          BEGIN: { value: 'VCARD' },
          VERSION: { value: '4.0' },
          FN: [{ value: 'Marcel Waldvogel' }],
          EMAIL: [{ value: 'a@b.c' }],
          END: { value: 'VCARD' },
          hasErrors: true,
          nags: [
            {
              key: 'PARAM_INVALID_NUMBER',
              description: 'Invalid number',
              isError: true,
              attributes: {
                line: 'EMAIL;PREF=yes:a@b.c',
                parameter: 'PREF',
                property: 'EMAIL',
              },
            },
          ],
        },
      ],
    });
  });
});
