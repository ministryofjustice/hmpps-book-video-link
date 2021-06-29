import validator, { errorTypes } from './selectCourtValidation'

describe('SelectCourtValidation', () => {
  const form = {
    courtId: 'CLDN',
  } as Record<string, string>

  describe('checking court validation', () => {
    it('should return an error when no court is entered', () => {
      expect(validator({ ...form, courtId: '' })).toStrictEqual([errorTypes.missingCourt])
    })

    it('should not return an error when a court is entered', () => {
      expect(validator({ ...form, courtId: 'CRNMC' })).toStrictEqual([])
    })
  })
})
