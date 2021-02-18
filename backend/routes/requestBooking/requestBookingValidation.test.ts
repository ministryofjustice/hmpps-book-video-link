import moment from 'moment'
import validator, { errorTypes } from './requestBookingValidation'

describe('RequestBookingValidation', () => {
  const now = moment('2021-01-14T11:20:00.000Z')

  const form = {
    prison: 'WWI',
    date: '14/01/2021',
    startTimeHours: '13',
    startTimeMinutes: '20',
    endTimeHours: '13',
    endTimeMinutes: '50',
    comment: 'A comment',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
  } as Record<string, unknown>

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => now.valueOf()) // Thursday 2021-01-14T11:20:00.000Z
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  describe('checking for historic dates', () => {
    it('should return an error when selected date is in the past', () => {
      expect(validator({ ...form, date: moment(now).subtract(1, 'day').format('DD/MM/YYYY') })).toStrictEqual([
        errorTypes.date.past,
      ])
    })

    it('should not return an error when selected date is now', () => {
      expect(validator({ ...form, date: moment(now).format('DD/MM/YYYY') })).toStrictEqual([])
    })

    it('should not return an error when selected date is in the future', () => {
      expect(validator({ ...form, date: moment(now).add(1, 'day').format('DD/MM/YYYY') })).toStrictEqual([])
    })
  })

  describe('checking for historic start times', () => {
    it('should return an error when selected start time is in the past', () => {
      expect(validator({ ...form, startTimeHours: '11', startTimeMinutes: '19' })).toStrictEqual([
        errorTypes.startTime.past,
      ])
    })

    it('should not return an error when selected start time is now', () => {
      expect(validator({ ...form, startTimeHours: '11', startTimeMinutes: '20' })).toStrictEqual([])
    })

    it('should not return an error when selected start time is in the future', () => {
      expect(validator({ ...form, startTimeHours: '11', startTimeMinutes: '21' })).toStrictEqual([])
    })
  })

  describe('checking for historic end times', () => {
    it('should return an error when selected end time is before now', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '18', endTimeHours: '11', endTimeMinutes: '19' })
      ).toStrictEqual([errorTypes.startTime.past, errorTypes.endTime.past])
    })

    it('should return an error when selected end time is before the start time (set in the future)', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '21', endTimeHours: '11', endTimeMinutes: '20' })
      ).toStrictEqual([errorTypes.endTime.beforeStartTime])
    })

    it('should return an error when selected end time is before the start time (set in the past)', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '19', endTimeHours: '11', endTimeMinutes: '18' })
      ).toStrictEqual([errorTypes.startTime.past, errorTypes.endTime.past])
    })

    it('should return an error when selected start time and end time are the same (set in the future)', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '21', endTimeHours: '11', endTimeMinutes: '21' })
      ).toStrictEqual([errorTypes.endTime.beforeStartTime])
    })

    it('should return an error when selected start time and end time are the same', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '20', endTimeHours: '11', endTimeMinutes: '20' })
      ).toStrictEqual([errorTypes.endTime.beforeStartTime])
    })

    it('should return an error when selected start time and end time are the same (set in the past)', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '19', endTimeHours: '11', endTimeMinutes: '19' })
      ).toStrictEqual([errorTypes.startTime.past, errorTypes.endTime.past])
    })

    it('should not return an error when selected end time falls after the selected start time', () => {
      expect(
        validator({ ...form, startTimeHours: '11', startTimeMinutes: '20', endTimeHours: '11', endTimeMinutes: '21' })
      ).toStrictEqual([])
    })

    it('should not return an error when selected end time is in the future', () => {
      expect(validator({ ...form, endTimeHours: '13', endTimeMinutes: '51' })).toStrictEqual([])
    })
  })

  describe('checking for partial times', () => {
    it('should return an error when only start time hours are entered', () => {
      expect(validator({ ...form, startTimeHours: '11', startTimeMinutes: '' })).toStrictEqual([
        errorTypes.startTime.missingPart,
      ])
    })

    it('should return an error when only start time minutes are entered', () => {
      expect(validator({ ...form, startTimeHours: '', startTimeMinutes: '20' })).toStrictEqual([
        errorTypes.startTime.missingPart,
      ])
    })

    it('should not return an error when both start time hours and minutes are entered', () => {
      expect(validator({ ...form, startTimeHours: '11', startTimeMinutes: '20' })).toStrictEqual([])
    })

    it('should return an error when only end time hours are entered', () => {
      expect(validator({ ...form, endTimeHours: '11', endTimeMinutes: '' })).toStrictEqual([
        errorTypes.endTime.missingPart,
      ])
    })

    it('should return an error when only end time minutes are entered', () => {
      expect(validator({ ...form, endTimeHours: '', endTimeMinutes: '50' })).toStrictEqual([
        errorTypes.endTime.missingPart,
      ])
    })

    it('should not return an error when both end time hours and minutes are entered', () => {
      expect(validator({ ...form, endTimeHours: '13', endTimeMinutes: '50' })).toStrictEqual([])
    })
  })

  describe('checking for missing form values', () => {
    it('should return an error when no prison is entered', () => {
      expect(validator({ ...form, prison: '' })).toStrictEqual([errorTypes.missingPrison])
    })

    it('should return an error when no date is entered', () => {
      expect(validator({ ...form, date: '' })).toStrictEqual([errorTypes.date.missing])
    })

    it('should return an error when an invalid date is entered', () => {
      expect(validator({ ...form, date: '31/02/2020' })).toStrictEqual([errorTypes.date.invalid])
      expect(validator({ ...form, date: 'bob' })).toStrictEqual([errorTypes.date.invalid])
    })

    it('should return an error when no start time is entered', () => {
      expect(validator({ ...form, startTimeHours: '', startTimeMinutes: '' })).toStrictEqual([
        errorTypes.startTime.missing,
      ])
    })

    it('should return an error when no end time is entered', () => {
      expect(validator({ ...form, endTimeHours: '', endTimeMinutes: '' })).toStrictEqual([errorTypes.endTime.missing])
    })

    it('should return an error when no pre court option is selected', () => {
      expect(validator({ ...form, preAppointmentRequired: '' })).toStrictEqual([errorTypes.missingPreCourt])
    })

    it('should return an error when no post court option is selected', () => {
      expect(validator({ ...form, postAppointmentRequired: '' })).toStrictEqual([errorTypes.missingPostCourt])
    })

    it('should return multiply errors when many form values are missing', () => {
      expect(
        validator({
          ...form,
          prison: '',
          date: '',
          startTimeHours: '',
          startTimeMinutes: '',
          endTimeHours: '',
          endTimeMinutes: '',
          preAppointmentRequired: '',
          postAppointmentRequired: '',
        })
      ).toStrictEqual([
        errorTypes.missingPrison,
        errorTypes.missingPreCourt,
        errorTypes.missingPostCourt,
        errorTypes.date.missing,
        errorTypes.startTime.missing,
        errorTypes.endTime.missing,
      ])
    })
  })
})
