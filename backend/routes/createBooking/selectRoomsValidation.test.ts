import validator, { errorTypes } from './selectRoomsValidation'

describe('SelectAvailableRoomsValidation', () => {
  const form = {
    preAppointmentRequired: 'true',
    postAppointmentRequired: 'true',
    preLocation: '2',
    mainLocation: '1',
    postLocation: '3',
    comment: 'Some comment',
  } as Record<string, string>

  describe('checking for missing form values', () => {
    it('should return an error when no pre location is selected', () => {
      expect(validator({ ...form, preLocation: '' })).toStrictEqual([errorTypes.preLocation.missing])
    })

    it('should return an error when no main location is selected', () => {
      expect(validator({ ...form, mainLocation: '' })).toStrictEqual([errorTypes.missingMainLocation])
    })

    it('should return an error when no post location is selected', () => {
      expect(validator({ ...form, postLocation: '' })).toStrictEqual([errorTypes.postLocation.missing])
    })

    it('should return multiply errors when many form values are missing', () => {
      expect(
        validator({
          ...form,
          preLocation: '',
          mainLocation: '',
          postLocation: '',
        })
      ).toStrictEqual([errorTypes.preLocation.missing, errorTypes.missingMainLocation, errorTypes.postLocation.missing])
    })
  })

  describe('checking maximum comment length validation', () => {
    it('should return an error when a comment exceeds 3600 characters', () => {
      expect(validator({ ...form, comment: '#'.repeat(3601) })).toStrictEqual([errorTypes.commentLength])
    })

    it('should not return an error when a comment is exactly 3600 characters', () => {
      expect(validator({ ...form, comment: '#'.repeat(3600) })).toStrictEqual([])
    })

    it('should not return an error when a comment is less than 3600 characters', () => {
      expect(validator({ ...form, comment: '#'.repeat(3599) })).toStrictEqual([])
    })
  })
})
