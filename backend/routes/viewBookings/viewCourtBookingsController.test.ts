import moment from 'moment'
import viewCourtBookingsController from './viewCourtBookingsController'
import ViewBookingsService from '../../services/viewBookingsService'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'

jest.mock('../../services/viewBookingsService')

describe('View court bookings', () => {
  const viewBookingsService = new ViewBookingsService(null, null, null, null) as jest.Mocked<ViewBookingsService>

  const req = mockRequest({})
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })
  let controller

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00
    controller = viewCourtBookingsController(viewBookingsService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ViewCourtBookingsController', () => {
    it('When user has single preferred court - template render ', async () => {
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'Westminster Crown Court', value: 'WMRCN' }],
        appointments: [],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [],
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

    it('When user has multiple preferred courts (bookings for first court in alphabetical order shown) - template render ', async () => {
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'City of London', value: 'CLDN' }],
        appointments: [],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [],
        date: moment(),
        courtId: 'CLDN',
        courts: [{ value: 'CLDN', text: 'City of London' }],
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    it('When user has multiple preferred courts and updates a selected court to view bookings for - Api calls', async () => {
      req.query = {
        ...req.query,
        courtId: 'WMRCN',
      }
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'Westminster Crown Court', value: 'WMRCN' }],
        appointments: [],
      })
      await controller(req, res)
      expect(viewBookingsService.getList).toHaveBeenCalledWith(res.locals, moment(), 'WMRCN', 'A_USER')
    })

    it('When user has multiple preferred courts and updates a selected court to view bookings for - template render ', async () => {
      req.query = {
        ...req.query,
        courtId: 'WMRCN',
      }
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'Westminster Crown Court', value: 'WMRCN' }],
        appointments: [],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [],
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

    it('When user has multiple preferred courts (bookings for first court in alphabetical order shown) and selects a date - Api calls', async () => {
      req.query = {
        ...req.query,
        date: '2 January 2020',
      }
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'City of London', value: 'CLDN' }],
        appointments: [],
      })

      await controller(req, res)

      expect(viewBookingsService.getList).toHaveBeenCalledWith(
        res.locals,
        moment('2 January 2020', 'D MMMM YYYY'),
        'CLDN',
        'A_USER'
      )
    })

    it('When user has multiple preferred courts (bookings for first court in alphabetical order shown) and selects a date - template render ', async () => {
      req.query = {
        ...req.query,
        date: '2 January 2020',
      }
      viewBookingsService.getList.mockResolvedValue({
        courts: [{ text: 'City of London', value: 'CLDN' }],
        appointments: [],
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewBookings/index.njk', {
        appointments: [],
        date: moment('2 January 2020', 'D MMMM YYYY'),
        courtOption: 'CLDN',
        courts: [{ value: 'CLDN', text: 'City of London' }],
        hearingDescriptions: {
          MAIN: 'Court hearing',
          POST: 'Post-court hearing',
          PRE: 'Pre-court hearing',
        },
      })
    })

    describe('when there is an error retrieving information', () => {
      it('should render the error template', async () => {
        viewBookingsService.getList.mockRejectedValue(new Error('Problem retrieving courts'))
        await expect(controller(req, res)).rejects.toThrow('Problem retrieving courts')
      })
    })
  })
})
