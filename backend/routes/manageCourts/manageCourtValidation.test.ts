import validator, { errorTypes } from './manageCourtsValidation'

describe('ManageCourtsValidation', () => {
  const form = {
    courts: ['Some Court'],
  } as Record<string, unknown>

  describe('checking number of courts selection', () => {
    it('should not return an error when a user selects one court', () => {
      expect(validator({ ...form, courts: ['Some Court'] })).toStrictEqual([])
    })

    it('should not return an error when a user selects more than one court', () => {
      expect(validator({ ...form, courts: ['Some Court', 'Another Court'] })).toStrictEqual([])
    })

    it('should return an error when no courts are selected', () => {
      expect(validator({ ...form, courts: undefined })).toStrictEqual([errorTypes.atLeastOne])
    })
  })
})
