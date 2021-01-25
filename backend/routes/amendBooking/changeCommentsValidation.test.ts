import validator, { errorTypes } from './changeCommentsValidation'

describe('SelectAvailableRoomsValidation', () => {
  const form = {
    comment: 'Some comment',
  } as Record<string, string>

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
