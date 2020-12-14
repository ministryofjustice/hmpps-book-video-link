import moment from 'moment'
import viewCourtBookingsController from '../controllers/viewCourtBookingsController'
import BookingService from '../services/bookingService'

jest.mock('../services/bookingService')

describe('View court bookings', () => {
  const bookingService = new BookingService(null, null) as jest.Mocked<BookingService>

  let req
  let res
  let controller

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00

    req = {
      query: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
        },
      },
    }
    res = { locals: {}, render: jest.fn() }

    bookingService.getAppointmentList.mockResolvedValue({ courts: ['Wimbledon', 'Southwark'], appointments: [] })
    controller = viewCourtBookingsController(bookingService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ViewCourtBookingsController', () => {
    it('When no search params - API calls', async () => {
      await controller(req, res)
      expect(bookingService.getAppointmentList).toHaveBeenCalledWith(res.locals, moment(), undefined)
    })

    it('When no search params - template render ', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewCourtBookings.njk', {
        appointments: [],
        date: moment(),
        title: 'Video link bookings for 1 January 2020',
        courtOption: undefined,
        courts: [
          { value: 'Wimbledon', text: 'Wimbledon' },
          { value: 'Southwark', text: 'Southwark' },
          { value: 'Other', text: 'Other' },
        ],
        user: { displayName: 'Test User' },
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    it('When selecting a court - Api calls', async () => {
      req.query = {
        ...req.query,
        courtOption: 'Wimbledon',
      }
      await controller(req, res)
      expect(bookingService.getAppointmentList).toHaveBeenCalledWith(res.locals, moment(), 'Wimbledon')
    })

    it('When selecting a court - template render ', async () => {
      req.query = {
        ...req.query,
        courtOption: 'Wimbledon',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewCourtBookings.njk', {
        appointments: [],
        date: moment(),
        title: 'Video link bookings for 1 January 2020 - Wimbledon',
        courtOption: 'Wimbledon',
        courts: [
          { value: 'Wimbledon', text: 'Wimbledon' },
          { value: 'Southwark', text: 'Southwark' },
          { value: 'Other', text: 'Other' },
        ],
        user: { displayName: 'Test User' },
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    it('When selecting a date - Api calls', async () => {
      req.query = {
        ...req.query,
        date: '2 January 2020',
      }
      await controller(req, res)
      expect(bookingService.getAppointmentList).toHaveBeenCalledWith(
        res.locals,
        moment('2 January 2020', 'D MMMM YYYY'),
        undefined
      )
    })

    it('When selecting a date - template render ', async () => {
      req.query = {
        ...req.query,
        date: '2 January 2020',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewCourtBookings.njk', {
        appointments: [],
        date: moment('2 January 2020', 'D MMMM YYYY'),
        title: 'Video link bookings for 2 January 2020',
        courtOption: undefined,
        courts: [
          { value: 'Wimbledon', text: 'Wimbledon' },
          { value: 'Southwark', text: 'Southwark' },
          { value: 'Other', text: 'Other' },
        ],
        user: { displayName: 'Test User' },
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    describe('when there is an error retrieving information', () => {
      it('should render the error template', async () => {
        bookingService.getAppointmentList.mockRejectedValue(new Error('Problem retrieving courts'))
        await expect(controller(req, res)).rejects.toThrow('Problem retrieving courts')
      })
    })
  })
})
