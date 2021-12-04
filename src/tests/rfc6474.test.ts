import { parseVCards } from '../parse.js';

describe('RFC6715 parsing', () => {
  it('should recognize all RFC6715 additions in one go', () => {
    expect(
      parseVCards(
        'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nBIRTHPLACE:Somewhere\r\nDEATHDATE;value=text:Not yet\r\nDEATHPLACE:Unknown\r\nEND:VCARD\r\n',
      ),
    ).toStrictEqual({
      vCards: [
        {
          BEGIN: { value: 'VCARD' },
          VERSION: { value: '4.0' },
          FN: [{ value: 'Jane Doe' }],
          BIRTHPLACE: { value: 'Somewhere' },
          DEATHPLACE: { value: 'Unknown' },
          // I know that the existence of `DEATHDATE` implies state=dead, but hey, this is test data!
          DEATHDATE: { parameters: { VALUE: 'text' }, value: 'Not yet' },
          END: { value: 'VCARD' },
          hasErrors: false,
        },
      ],
    });
  });
});
