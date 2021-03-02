import validator, { errorTypes, dobError } from './offenderDetailsValidation'

describe('OffenderDetailsValidation', () => {
  const form = {
    firstName: 'John',
    lastName: 'Doe',
    dobDay: '10',
    dobMonth: '12',
    dobYear: '2019',
    comments: 'Some comment',
  } as Record<string, unknown>

  describe('checking for missing form values', () => {
    it('should return an error when no first name is entered', () => {
      expect(validator({ ...form, firstName: '' })).toStrictEqual([errorTypes.missingFirstName])
    })

    it('should return an error when no last name is entered', () => {
      expect(validator({ ...form, lastName: '' })).toStrictEqual([errorTypes.missingLastName])
    })
    it('should return an error when no full date is entered', () => {
      expect(validator({ ...form, dobDay: '', dobMonth: '', dobYear: '' })).toStrictEqual([
        errorTypes.dateOfBirth.missing,
        dobError,
      ])
    })

    it('should return an error when no day is entered', () => {
      expect(validator({ ...form, dobDay: '' })).toStrictEqual([errorTypes.dateOfBirth.missingDay, dobError])
    })

    it('should return an error when no month is entered', () => {
      expect(validator({ ...form, dobMonth: '' })).toStrictEqual([errorTypes.dateOfBirth.missingMonth, dobError])
    })

    it('should return an error when no year is entered', () => {
      expect(validator({ ...form, dobYear: '' })).toStrictEqual([errorTypes.dateOfBirth.missingYear, dobError])
    })

    it('should return multiply errors when many form values are missing', () => {
      expect(
        validator({
          ...form,
          firstName: '',
          lastName: '',
          dobDay: '',
          dobMonth: '',
          dobYear: '',
        })
      ).toStrictEqual([
        errorTypes.missingFirstName,
        errorTypes.missingLastName,
        errorTypes.dateOfBirth.missing,
        dobError,
      ])
    })
  })

  describe('checking for invalid form values', () => {
    it('should return an error when an invalid date is entered', () => {
      expect(validator({ ...form, dobDay: '31', dobMonth: '02', dobYear: '21' })).toStrictEqual([
        errorTypes.dateOfBirth.invalid,
        dobError,
      ])
      expect(validator({ ...form, dobDay: 'bob', dobMonth: 'bob', dobYear: 'bob' })).toStrictEqual([
        errorTypes.dateOfBirth.invalid,
        dobError,
      ])
      expect(validator({ ...form, dobDay: '200', dobMonth: '200' })).toStrictEqual([
        errorTypes.dateOfBirth.invalid,
        dobError,
      ])
    })
  })

  describe('checking for historic/future form values', () => {
    it('should return an error when a future date of birth is entered', () => {
      expect(validator({ ...form, dobDay: '1', dobMonth: '1', dobYear: '8000' })).toStrictEqual([
        errorTypes.dateOfBirth.past,
        dobError,
      ])
    })

    it('should return an error when a year of birth before 1900 is entered', () => {
      expect(validator({ ...form, dobYear: '1899' })).toStrictEqual([errorTypes.dateOfBirth.after1900, dobError])
    })

    it('should not return an error when a year of birth of 1900 or after is entered', () => {
      expect(validator({ ...form, dobYear: '1900' })).toStrictEqual([])
      expect(validator({ ...form, dobYear: '1901' })).toStrictEqual([])
    })
  })

  describe('checking maximum comment length validation', () => {
    it('should return an error when a comment exceeds 3600 characters', () => {
      expect(validator({ ...form, comments: '#'.repeat(3601) })).toStrictEqual([errorTypes.commentLength])
    })

    it('should not return an error when a comment is exactly 3600 characters', () => {
      expect(validator({ ...form, comments: '#'.repeat(3600) })).toStrictEqual([])
    })

    it('should not return an error when a comment is less than 3600 characters', () => {
      expect(validator({ ...form, comments: '#'.repeat(3599) })).toStrictEqual([])
    })
  })
})
