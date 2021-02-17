import StartController from './startController'
import PrisonApi from '../../api/prisonApi'
import AvailabilityCheckService from '../../services/availabilityCheckService'

const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
const availabilityCheckService = new AvailabilityCheckService(null) as jest.Mocked<AvailabilityCheckService>

jest.mock('../../api/prisonApi')
jest.mock('../../services/availabilityCheckService')

describe('Add court appointment', () => {
  const bookingSlot = {
    isAvailable: true,
    totalInterval: { start: '01:00', end: '02:00' },
  }

  const req = {
    session: {
      userDetails: {
        username: 'COURT_USER',
        active: true,
        name: 'Court User',
        authSource: 'nomis',
        staffId: 123456,
        userId: '654321',
      },
    },
    params: {
      offenderNo: 'A12345',
      agencyId: 'MDI',
    },
    flash: null,
    errors: [],
    body: {
      bookingId: '123456',
      date: '01/01/2021',
      startTimeHours: '01',
      startTimeMinutes: '00',
      endTimeHours: '02',
      endTimeMinutes: '00',
      preAppointmentRequired: 'YES',
      postAppointmentRequired: 'NO',
    },
  }

  const res = { locals: { context: {} }, send: jest.fn(), redirect: jest.fn(), render: jest.fn() }

  let controller

  beforeEach(() => {
    const prisoner = {
      firstName: 'firstName',
      lastName: 'lastName',
      bookingId: 1,
    }

    const agencyDetails = {
      description: 'Moorland',
    }

    req.errors = []
    req.flash = jest.fn()
    req.flash.mockImplementation(() => [])
    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue(prisoner)
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetails)
    availabilityCheckService.getAvailability = jest.fn().mockResolvedValue(bookingSlot)
    controller = new StartController(prisonApi, availabilityCheckService)
  })

  describe('view', () => {
    it('should request user and agency details', async () => {
      await controller.view()(req, res)

      expect(prisonApi.getPrisonerDetails).toHaveBeenCalledWith({ context: {} }, 'A12345')
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({ context: {} }, 'MDI')
    })

    it('should render template with default data', async () => {
      await controller.view()(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/start.njk',
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

      await expect(controller.view()(req, res)).rejects.toThrow('Network error')
    })
  })

  describe('submit', () => {
    it('should call flash 1 time if no errors', async () => {
      await controller.submit()(req, res)

      expect(req.flash).toHaveBeenCalledTimes(1)
    })
    it('should call flash 2 times if errors', async () => {
      req.errors = [{ text: 'error message', href: 'error' }]
      await controller.submit()(req, res)

      expect(req.flash).toHaveBeenCalledTimes(2)
    })

    it('should place errors and form data into flash if there are validation errors', async () => {
      req.errors = [{ text: 'error message', href: 'error' }]
      await controller.submit()(req, res)

      expect(req.flash.mock.calls).toEqual([
        ['errors', [{ href: 'error', text: 'error message' }]],
        [
          'formValues',
          {
            bookingId: '123456',
            date: '01/01/2021',
            endTimeHours: '02',
            endTimeMinutes: '00',
            postAppointmentRequired: 'NO',
            preAppointmentRequired: 'YES',
            startTimeHours: '01',
            startTimeMinutes: '00',
          },
        ],
      ])
    })
    it('should redirect if validation errors', () => {
      req.errors = [{ date: undefined }]
      controller.submit()(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment')
    })

    it('should place appointment details into flash if no errors', async () => {
      await controller.submit()(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
        bookingId: '123456',
        date: '01/01/2021',
        endTimeHours: '02',
        endTimeMinutes: '00',
        postAppointmentRequired: 'NO',
        preAppointmentRequired: 'YES',
        startTimeHours: '01',
        startTimeMinutes: '00',
        endTime: '2021-01-01T02:00:00',
        startTime: '2021-01-01T01:00:00',
        agencyId: 'MDI',
      })
    })

    it('should go to the court selection page if no errors', async () => {
      await controller.submit()(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
    })

    it('should go to the "no video link bookings available" page', async () => {
      bookingSlot.isAvailable = false
      await controller.submit()(req, res)

      expect(res.render).toHaveBeenCalledWith('createBooking/noAvailabilityForDateTime.njk', {
        date: 'Friday 1 January 2021',
        startTime: '01:00',
        endTime: '02:00',
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
      })
    })
  })
})
