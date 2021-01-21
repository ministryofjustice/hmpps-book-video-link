import validator, { errorTypes } from './selectAvailableRoomsValidation'

describe('SelectAvailableRoomsValidation', () => {
  const form = {
    preAppointmentRequired: 'true',
    postAppointmentRequired: 'true',
    selectPreAppointmentLocation: '2',
    selectMainAppointmentLocation: '1',
    selectPostAppointmentLocation: '3',
    comment: 'Some comment',
  } as Record<string, string>

  describe('checking for missing form values', () => {
    it('should return an error when no pre location is selected', () => {
      expect(validator({ ...form, selectPreAppointmentLocation: '' })).toStrictEqual([errorTypes.preLocation.missing])
    })

    it('should return an error when no main location is selected', () => {
      expect(validator({ ...form, selectMainAppointmentLocation: '' })).toStrictEqual([errorTypes.missingMainLocation])
    })

    it('should return an error when no post location is selected', () => {
      expect(validator({ ...form, selectPostAppointmentLocation: '' })).toStrictEqual([errorTypes.postLocation.missing])
    })

    it('should return multiply errors when many form values are missing', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '',
          selectMainAppointmentLocation: '',
          selectPostAppointmentLocation: '',
        })
      ).toStrictEqual([errorTypes.missingMainLocation, errorTypes.preLocation.missing, errorTypes.postLocation.missing])
    })
  })

  describe('checking for difference of locations', () => {
    it('should return an error when the pre location and main location are the same', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '1',
          selectMainAppointmentLocation: '1',
        })
      ).toStrictEqual([errorTypes.preLocation.different])
    })

    it('should return an error when the post location and main location are the same', () => {
      expect(
        validator({
          ...form,
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '1',
        })
      ).toStrictEqual([errorTypes.postLocation.different])
    })

    it('should not return an error when the pre, main and post locations are all different', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '2',
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '3',
        })
      ).toStrictEqual([])
    })

    it('should not return an error when the pre and post locations are the same but different to the main location', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '2',
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '2',
        })
      ).toStrictEqual([])
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
