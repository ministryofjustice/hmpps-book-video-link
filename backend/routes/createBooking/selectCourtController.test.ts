import { Request, Response } from 'express'
import { Agency, InmateDetail } from 'prisonApi'
import PrisonApi from '../../api/prisonApi'
import LocationService from '../../services/locationService'
import SelectCourtController from './selectCourtController'

jest.mock('../../services/locationService')
jest.mock('../../api/prisonApi')

describe('Select court appoinment court', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: SelectCourtController

  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: {} },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({ locals: {}, render: jest.fn(), redirect: jest.fn() } as unknown) as jest.Mocked<Response>

  const bookingId = 1
  const appointmentDetails = {
    bookingId,
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
    locationDescription: 'Room 3',
    locationTypes: [
      { value: 1, text: 'Room 3' },
      { value: 2, text: 'Room 2' },
      { value: 3, text: 'Room 3' },
    ],
    date: '10/10/2019',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    prisonApi.getPrisonerDetails.mockResolvedValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'John',
      lastName: 'Doe',
    } as InmateDetail)
    prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Moorland' } as Agency)

    locationService.getVideoLinkEnabledCourts.mockResolvedValue([
      { text: 'Westminster', value: 'Westminster' },
      { text: 'Wimbledon', value: 'Wimbledon' },
      { text: 'City of London', value: 'City of London' },
    ])
    ;(req.flash as any).mockImplementation(() => [appointmentDetails])

    controller = new SelectCourtController(locationService, prisonApi)
  })

  describe('index', () => {
    it('should render the template correctly with the court values sorted alphabetically', async () => {
      await controller.view(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectCourt.njk',
        expect.objectContaining({
          courts: [
            { text: 'Westminster', value: 'Westminster' },
            { text: 'Wimbledon', value: 'Wimbledon' },
            { text: 'City of London', value: 'City of London' },
          ],
          prePostData: {
            'post-court hearing briefing': '14:00 to 14:20',
            'pre-court hearing briefing': '10:40 to 11:00',
          },
        })
      )
    })

    it('should not include pre post data if not required', async () => {
      ;(req.flash as any).mockImplementation(() => [
        {
          ...appointmentDetails,
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        },
      ])
      await controller.view(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking/selectCourt.njk',
        expect.objectContaining({
          prePostData: {},
        })
      )
    })
  })

  describe('post', () => {
    describe('when no court has been selected', () => {
      it('should return an error', async () => {
        await controller.submit(
          ({ ...req, errors: [{ text: 'some error', href: '#court' }] } as unknown) as Request,
          res,
          null
        )

        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')

        expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#court', text: 'some error' }])
      })
    })

    describe('when a court has been selected', () => {
      it('should populate the details with the selected court and redirect to room selection page ', async () => {
        req.body = { court: 'City of London' }
        await controller.submit(req, res, null)

        expect(req.flash).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({ court: 'City of London' })
        )
        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-rooms')
      })
    })
  })
})
