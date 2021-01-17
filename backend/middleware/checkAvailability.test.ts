import moment from 'moment'

import AvailabilityCheckService from '../services/availabilityCheckService'
import checkAvailability from './checkAvailability'
import { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } from '../shared/dateHelpers'
import { Room } from '../services/model'
import { Services } from '../services'

jest.mock('../services/availabilityCheckService')

const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

const bookingId = 1
const appointmentDetails = {
  bookingId,
  offenderNo: 'A12345',
  firstName: 'john',
  lastName: 'doe',
  locationId: 1,
  startTime: '2017-01-01T12:00:00',
  endTime: '2017-01-01T13:00:00',
  date: '01/01/2017',
  preAppointmentRequired: 'yes',
  postAppointmentRequired: 'yes',
  court: 'Leeds',
}

const req = {
  session: {
    userDetails: {},
  },
  body: {},
  params: {
    offenderNo: 'A12345',
    agencyId: 'MDI',
  },
  flash: jest.fn(),
}
const res = {
  locals: {},
  send: jest.fn(),
  redirect: jest.fn(),
  render: jest.fn(),
}
const next = jest.fn()

describe('check availability middleware', () => {
  let middleware

  beforeEach(() => {
    jest.resetAllMocks()
    middleware = checkAvailability(({ availabilityCheckService } as unknown) as Services)
  })
  const room = (value): Room => ({ value, text: `Room ${value}` })

  describe('when there are no rooms available', () => {
    it('should render no room available page', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: false,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {}
      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(res.render).toHaveBeenCalledWith('createBooking/noAvailabilityForDateTime.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        endTime: '14:00',
        date: 'Sunday 1 January 2017',
        startTime: '13:30',
      })
    })
  })

  describe('when there are rooms available', () => {
    it('should place appointment details into flash and continue to next middleware', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {}
      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(next).toHaveBeenCalled()
    })

    it('should call getAvailability with correct args', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {}
      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(availabilityCheckService.getAvailability).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'MDI',
          date: moment('01/01/2017', DAY_MONTH_YEAR, true),
          endTime: moment('2017-01-01T13:00:00', DATE_TIME_FORMAT_SPEC, true),
          postRequired: true,
          preRequired: true,
          startTime: moment('2017-01-01T12:00:00', DATE_TIME_FORMAT_SPEC, true),
        }
      )
    })
  })

  describe('when selected rooms are no longer available', () => {
    it('should render no rooms are available page when no selected are available', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [room(1)], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {
        selectPreAppointmentLocation: '45',
        selectMainAppointmentLocation: '72',
        selectPostAppointmentLocation: '93',
      }

      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })

    it('should render no rooms are available page when no pre are available', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [room(1)], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {
        selectPreAppointmentLocation: '10',
        selectMainAppointmentLocation: '1',
        selectPostAppointmentLocation: '3',
      }

      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })

    it('should render no rooms are available page when no main are available', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [room(1)], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {
        selectPreAppointmentLocation: '2',
        selectMainAppointmentLocation: '100',
        selectPostAppointmentLocation: '3',
      }

      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })

    it('should render no rooms are available page when no post are available', async () => {
      availabilityCheckService.getAvailability.mockResolvedValue({
        isAvailable: true,
        totalInterval: { start: '13:30', end: '14:00' },
        rooms: { main: [room(1)], pre: [room(2), room(22)], post: [room(3), room(33)] },
      })

      req.body = {
        selectPreAppointmentLocation: '2',
        selectMainAppointmentLocation: '1',
        selectPostAppointmentLocation: '300',
      }

      req.flash.mockReturnValue([appointmentDetails])

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })
  })

  // describe('when there are no rooms available', () => {
  //   beforeEach(() => {
  //     req.body = {
  //       bookingId,
  //       date: moment().format(DAY_MONTH_YEAR),
  //       preAppointmentRequired: 'yes',
  //       postAppointmentRequired: 'yes',
  //     }
  //   })

  //   it('should include pre and post time when checking for availability', async () => {
  //     jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // 2017-01-01T00:00:00.000Z
  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       mainLocations: [],
  //       preLocations: [],
  //       postLocations: [],
  //     })

  //     await middleware(req, res, next)

  //     const mainStartTime = moment().hour(12).minute(0)

  //     const mainEndTime = moment().hour(13).minute(0)

  //     const startTime = moment(mainStartTime).subtract(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)
  //     const endTime = moment(mainEndTime).add(20, 'minutes').format(DATE_TIME_FORMAT_SPEC)

  //     expect(availableSlotsService.getAvailableRooms).toHaveBeenCalledWith(
  //       {},
  //       {
  //         agencyId: 'MDI',
  //         startTime,
  //         endTime,
  //       }
  //     )
  //   })

  //   it('should return the availability for the whole day screen when there is less than two available rooms', async () => {
  //     jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       mainLocations: [],
  //       preLocations: [],
  //       postLocations: [],
  //     })

  //     availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }])

  //     await middleware(req, res, next)

  //     expect(res.render).toHaveBeenCalledWith('createBooking/noAvailabilityForWholeDay.njk', {
  //       continueLink: '/MDI/offenders/A12345/add-court-appointment',
  //       date: 'Sunday 1 January 2017',
  //     })
  //   })

  //   it('should return the availability for date time screen when there is more or equal to two available rooms', async () => {
  //     jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       mainLocations: [],
  //       preLocations: [],
  //       postLocations: [],
  //     })

  //     availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }, { value: 2 }])

  //     await middleware(req, res, next)

  //     expect(res.render).toHaveBeenCalledWith('createBooking/noAvailabilityForDateTime.njk', {
  //       continueLink: '/MDI/offenders/A12345/add-court-appointment',
  //       date: 'Sunday 1 January 2017',
  //       endTime: '13:20',
  //       startTime: '11:40',
  //     })
  //   })

  //   it('should continue with the journey if a pre appointment not required', async () => {
  //     jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       mainLocations: [{ value: 1, text: 'Room 1' }],
  //       preLocations: [],
  //       postLocations: [
  //         { value: 3, text: 'Room 3' },
  //         { value: 4, text: 'Room 4' },
  //       ],
  //     })

  //     req.flash.mockImplementation(() => [
  //       {
  //         ...appointmentDetails,
  //         preAppointmentRequired: 'no',
  //       },
  //     ])

  //     await middleware(req, res, next)

  //     expect(next).toHaveBeenCalled()
  //   })

  //   it('should continue with the journey if a post appointment not required', async () => {
  //     jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       mainLocations: [{ value: 1, text: 'Room 1' }],
  //       preLocations: [
  //         { value: 3, text: 'Room 3' },
  //         { value: 4, text: 'Room 4' },
  //       ],
  //       postLocations: [],
  //     })

  //     req.flash.mockImplementation(() => [
  //       {
  //         ...appointmentDetails,
  //         postAppointmentRequired: 'no',
  //       },
  //     ])

  //     await middleware(req, res, next)

  //     expect(next).toHaveBeenCalled()
  //   })
  // })

  // describe('when selected rooms are still available', () => {
  //   it('should call the next middleware', async () => {
  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       preLocations: [
  //         { value: 1, text: 'Room 1' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //       mainLocations: [{ value: 2, text: 'Room 2' }],
  //       postLocations: [
  //         { value: 1, text: 'Room 1' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //     })

  //     req.body = {
  //       selectPreAppointmentLocation: '1',
  //       selectMainAppointmentLocation: '2',
  //       selectPostAppointmentLocation: '3',
  //       comment: 'Test',
  //     }

  //     middleware = checkAvailability({ existingEventsService, availableSlotsService, availabilityCheckService })
  //     await middleware(req, res, next)

  //     expect(next).toHaveBeenCalled()
  //   })
  // })

  // describe('when selected rooms are no longer available', () => {
  //   it('should render room not available page if originaly selected main room is not available', async () => {
  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       preLocations: [
  //         { value: 1, text: 'Room 1' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //       mainLocations: [{ value: 4, text: 'Room 4' }],
  //       postLocations: [
  //         { value: 1, text: 'Room 1' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //     })

  //     req.body = {
  //       selectPreAppointmentLocation: '1',
  //       selectMainAppointmentLocation: '2',
  //       selectPostAppointmentLocation: '3',
  //       comment: 'Test',
  //     }

  //     middleware = checkAvailability({ existingEventsService, availableSlotsService, availabilityCheckService })
  //     await middleware(req, res, next)

  //     expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
  //     expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
  //       continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
  //     })
  //   })

  //   it('should render room not available page if originally selected pre room is not available', async () => {
  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       preLocations: [
  //         { value: 2, text: 'Room 2' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //       mainLocations: [{ value: 2, text: 'Room 2' }],
  //       postLocations: [
  //         { value: 2, text: 'Room 2' },
  //         { value: 3, text: 'Room 3' },
  //       ],
  //     })

  //     req.body = {
  //       selectPreAppointmentLocation: '1',
  //       selectMainAppointmentLocation: '2',
  //       selectPostAppointmentLocation: '3',
  //       comment: 'Test',
  //     }

  //     middleware = checkAvailability({ existingEventsService, availableSlotsService, availabilityCheckService })
  //     await middleware(req, res, next)

  //     expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
  //     expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
  //       continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
  //     })
  //   })

  //   it('should render room not available page if originally selected post room is not available', async () => {
  //     existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
  //       preLocations: [
  //         { value: 2, text: 'Room 2' },
  //         { value: 4, text: 'Room 4' },
  //       ],
  //       mainLocations: [{ value: 2, text: 'Room 2' }],
  //       postLocations: [
  //         { value: 2, text: 'Room 2' },
  //         { value: 4, text: 'Room 4' },
  //       ],
  //     })

  //     req.body = {
  //       selectPreAppointmentLocation: '1',
  //       selectMainAppointmentLocation: '2',
  //       selectPostAppointmentLocation: '3',
  //       comment: 'Test',
  //     }

  //     middleware = checkAvailability({ existingEventsService, availableSlotsService, availabilityCheckService })
  //     await middleware(req, res, next)

  //     expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
  //     expect(res.render).toHaveBeenCalledWith('createBooking/roomNoLongerAvailable.njk', {
  //       continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
  //     })
  //   })
  // })
})
