import validator, { errorTypes } from './selectCourtValidation'

describe('SelectCourtValidation', () => {
  const form = {
    hearingLocation: 'London',
  } as Record<string, string>

  describe('checking maximum comment length validation', () => {
    it('should return an error when no hearing location is entered', () => {
      expect(validator({ ...form, hearingLocation: '' })).toStrictEqual([errorTypes.missingHearingLocation])
    })

    it('should not return an error when a hearing location is entered', () => {
      expect(validator({ ...form, hearingLocation: 'Croydon' })).toStrictEqual([])
    })
  })
})
