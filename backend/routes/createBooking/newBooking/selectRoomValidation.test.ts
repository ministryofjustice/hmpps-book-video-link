import validator, { errorTypes } from './selectRoomValidation'

describe('SelectAvailableRoomsValidation', () => {
  const form = {
    preRequired: 'true',
    postRequired: 'true',
    preLocation: '2',
    mainLocation: '1',
    postLocation: '3',
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
      ).toStrictEqual([errorTypes.missingMainLocation, errorTypes.preLocation.missing, errorTypes.postLocation.missing])
    })
  })
})
