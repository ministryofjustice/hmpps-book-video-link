import { Request } from 'express'
import { Agency, InmateDetail } from 'prisonApi'

import NewBookingController from './NewBookingController'
import PrisonApi from '../../../api/prisonApi'
import { RoomAvailability } from '../../../services/model'
import { mockRequest, mockResponse } from '../../__test/requestTestUtils'
import { LocationService, AvailabilityCheckService } from '../../../services'

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>
const locationService = new LocationService(null, null, null) as jest.Mocked<LocationService>

jest.mock('../../../api/prisonApi')
jest.mock('../../../services')

describe('Add court appointment', () => {
  const bookingSlot = {
    isAvailable: true,
    totalInterval: { start: '01:00', end: '02:00' },
  } as RoomAvailability

  const req = mockRequest({
    params: {
      offenderNo: 'A12345',
      agencyId: 'MDI',
    },
    body: {
      bookingId: '123456',
      courtId: 'COURT-1',
      date: '01/01/2021',
      startTimeHours: '01',
      startTimeMinutes: '00',
      endTimeHours: '02',
      endTimeMinutes: '00',
      mainLocation: '123',
      preRequired: 'false',
      postRequired: 'false',
    },
  })

  const context = { user: { username: 'USER-1' } }
  const res = mockResponse({ locals: context })

  let controller: NewBookingController

  beforeEach(() => {
    jest.resetAllMocks()
    const prisoner = {
      firstName: 'firstName',
      lastName: 'lastName',
      bookingId: 1,
    }

    req.flash.mockReturnValue([])

    const agencyDetails = {
      description: 'Moorland',
    }

    prisonApi.getPrisonerDetails.mockResolvedValue(prisoner as InmateDetail)
    prisonApi.getAgencyDetails.mockResolvedValue(agencyDetails as Agency)
    availabilityCheckService.getAvailability.mockResolvedValue(bookingSlot)
    controller = new NewBookingController(prisonApi, availabilityCheckService, locationService)
  })

  describe('start', () => {
    it('Clear cookie and redirects', async () => {
      await controller.start()(req, res, null)

      expect(res.clearCookie).toHaveBeenCalledWith('booking-creation', expect.anything())

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment')
    })
  })

  describe('view', () => {
    it('should request user and agency details', async () => {
      await controller.view()(req, res, null)

      expect(prisonApi.getPrisonerDetails).toHaveBeenCalledWith(context, 'A12345')
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(context, 'MDI')
      expect(locationService.getRooms).toHaveBeenCalledWith(context, 'MDI')
      expect(locationService.getVideoLinkEnabledCourts).toHaveBeenCalledWith(context, 'USER-1')
    })

    it('should render template with default data', async () => {
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking-v2/newBooking.njk',
        expect.objectContaining({
          offenderNo: 'A12345',
          offenderNameWithNumber: 'Firstname Lastname (A12345)',
          agencyDescription: 'Moorland',
          bookingId: 1,
        })
      )
    })

    it('should render view error template', async () => {
      prisonApi.getPrisonerDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

      await expect(controller.view()(req, res, null)).rejects.toThrow('Network error')
    })
  })

  describe('submit', () => {
    const requestWithErrors = errors => ({ ...req, errors } as unknown as Request)

    it('should call flash 2 times if errors', async () => {
      await controller.submit()(requestWithErrors([{ text: 'error message', href: 'error' }]), res, null)

      expect(req.flash).toHaveBeenCalledTimes(2)
    })

    it('should place errors and form data into flash if there are validation errors', async () => {
      await controller.submit()(requestWithErrors([{ text: 'error message', href: 'error' }]), res, null)

      expect(req.flash.mock.calls).toEqual([
        ['errors', [{ href: 'error', text: 'error message' }]],
        [
          'formValues',
          {
            bookingId: '123456',
            courtId: 'COURT-1',
            date: '01/01/2021',
            endTimeHours: '02',
            endTimeMinutes: '00',
            preRequired: 'false',
            postRequired: 'false',
            startTimeHours: '01',
            startTimeMinutes: '00',
            mainLocation: '123',
          },
        ],
      ])
    })
    it('should redirect if validation errors', () => {
      controller.submit()(requestWithErrors([{ href: '#date' }]), res, null)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment')
    })

    it('should place appointment details into cookie if no errors', async () => {
      await controller.submit()(req, res, null)

      expect(res.cookie).toHaveBeenCalledWith(
        'booking-creation',
        {
          bookingId: '123456',
          courtId: 'COURT-1',
          date: '2021-01-01T00:00:00',
          postRequired: 'false',
          endTime: '2021-01-01T02:00:00',
          startTime: '2021-01-01T01:00:00',
          mainLocation: '123',
          postLocation: undefined,
          preLocation: undefined,
          preRequired: 'false',
        },
        expect.any(Object)
      )
    })

    it('should go to the court selection page if no errors', async () => {
      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/confirm-booking')
    })

    it('should go to the "no video link bookings available" page', async () => {
      bookingSlot.isAvailable = false
      await controller.submit()(req, res, null)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/video-link-not-available')
    })
  })
})
