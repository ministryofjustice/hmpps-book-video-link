const { buildDate, DATE_TIME_FORMAT_SPEC } = require('./dateHelpers')

describe('Date helpers', () => {
  describe('buildDate', () => {
    it('should return a valid date time with 0 as hours and minutes', () => {
      const dateTime = buildDate('20/10/2012', '0', '0')
      expect(dateTime.format(DATE_TIME_FORMAT_SPEC)).toEqual('2012-10-20T00:00:00')
    })

    it('should return a valid date time with strings as params ', () => {
      const dateTime = buildDate('20/10/2012', '00', '00')
      expect(dateTime.format(DATE_TIME_FORMAT_SPEC)).toEqual('2012-10-20T00:00:00')
    })

    it('should handle invalid times ', () => {
      const dateTime = buildDate('20/10/2012', 'OO', 'OO')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle negative times ', () => {
      const dateTime = buildDate('20/10/2012', 'OO', 'OO')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle empty hours and minutes', () => {
      const dateTime = buildDate('20/10/2012', '', '')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle null hours and minutes', () => {
      const dateTime = buildDate('20/10/2012', null, null)
      expect(dateTime).toEqual(undefined)
    })

    it('should handle empty date', () => {
      const dateTime = buildDate('', '01', '02')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle null date', () => {
      const dateTime = buildDate(null, '01', '02')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle illogical date', () => {
      const dateTime = buildDate('32/02/2012', '01', '02')
      expect(dateTime).toEqual(undefined)
    })

    it('should handle invalid date', () => {
      const dateTime = buildDate('Wat?', '01', '02')
      expect(dateTime).toEqual(undefined)
    })
  })
})
