import moment from 'moment'
import viewCourtBookingsController from './viewCourtBookingsController'
import ViewBookingsService from '../../services/viewBookingsService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'
import { Bookings } from '../../services/model'
import { DATE_ONLY_LONG_FORMAT_SPEC } from '../../shared/dateHelpers'

jest.mock('../../services/viewBookingsService')

describe('View court bookings', () => {
  const viewBookingsService = new ViewBookingsService(null, null, null, null) as jest.Mocked<ViewBookingsService>

  let res
  let controller

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00
    controller = viewCourtBookingsController(viewBookingsService)
    res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })

    viewBookingsService.getList.mockResolvedValue({
      courts: [{ name: 'Westminster Crown Court', id: 'WMRCN' }],
      appointments: [{ videoLinkBookingId: 1 }],
    } as Bookings)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ViewCourtBookingsController', () => {
    it('Renders initial page when no options selected', async () => {
      const req = mockRequest({})

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [{ videoLinkBookingId: 1 }],
        date: moment(),
        courtId: undefined,
        courts: [{ value: 'WMRCN', text: 'Westminster Crown Court' }],
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    it('When court is provided but no date', async () => {
      const req = mockRequest({ query: { courtId: 'WMRCN' } })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [{ videoLinkBookingId: 1 }],
        date: moment(),
        courtId: 'WMRCN',
        courts: [{ value: 'WMRCN', text: 'Westminster Crown Court' }],
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    it('When date is provided but no court Id', async () => {
      const req = mockRequest({ query: { date: '2 January 2020' } })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [{ videoLinkBookingId: 1 }],
        date: moment('2 January 2020', DATE_ONLY_LONG_FORMAT_SPEC),
        courtId: undefined,
        courts: [{ value: 'WMRCN', text: 'Westminster Crown Court' }],
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    describe('when there is an error retrieving information', () => {
      it('should render the error template', async () => {
        const req = mockRequest({})
        viewBookingsService.getList.mockRejectedValue(new Error('Problem retrieving courts'))
        await expect(controller(req, res)).rejects.toThrow('Problem retrieving courts')
      })
    })
  })
})
