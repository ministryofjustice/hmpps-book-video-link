import { Request } from 'express'
import { Agency, InmateDetail } from 'prisonApi'
import PrisonApi from '../../api/prisonApi'
import LocationService from '../../services/locationService'
import { mockNext, mockRequest, mockResponse } from '../__test/requestTestUtils'
import SelectCourtController from './selectCourtController'

jest.mock('../../services/locationService')
jest.mock('../../api/prisonApi')

describe('Select court appoinment court', () => {
  const prisonApi = new PrisonApi(null) as jest.Mocked<PrisonApi>
  const locationService = new LocationService(null, null) as jest.Mocked<LocationService>

  let controller: SelectCourtController

  const req = mockRequest({ params: { agencyId: 'MDI', offenderNo: 'A12345' } })
  const res = mockResponse({ locals: { context: {}, user: { username: 'A_USER' } } })
  const next = mockNext()

  beforeEach(() => {
    jest.resetAllMocks()
    prisonApi.getPrisonerDetails.mockResolvedValue({
      bookingId: 1,
      offenderNo: 'A12345',
      firstName: 'John',
      lastName: 'Doe',
    } as InmateDetail)
    prisonApi.getAgencyDetails.mockResolvedValue({ description: 'Moorland' } as Agency)

    locationService.getVideoLinkEnabledCourts.mockResolvedValue([
      { text: 'Westminster Crown Court', value: 'WMRCN' },
      { text: 'Wimbledon County Court', value: 'WLDCOU' },
      { text: 'City of London', value: 'CLDN' },
    ])
    req.flash.mockReturnValue([])

    controller = new SelectCourtController(locationService, prisonApi)

    req.signedCookies = {
      'booking-creation': {
        bookingId: '123456',
        date: '2017-11-10T00:00:00',
        postRequired: 'true',
        preRequired: 'true',
        endTime: '2017-11-10T14:00:00',
        startTime: '2017-11-10T11:00:00',
      },
    }
  })

  describe('index', () => {
    it('should render the template correctly with the court values sorted alphabetically', async () => {
      await controller.view(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking-v2/selectCourt.njk',
        expect.objectContaining({
          courts: [
            { text: 'Westminster Crown Court', value: 'WMRCN' },
            { text: 'Wimbledon County Court', value: 'WLDCOU' },
            { text: 'City of London', value: 'CLDN' },
          ],
          prePostData: {
            'post-court hearing briefing': '14:00 to 14:15',
            'pre-court hearing briefing': '10:45 to 11:00',
          },
        })
      )
    })

    it('should not include pre post data if not required', async () => {
      req.signedCookies = {
        'booking-creation': {
          courtId: 'CLDN',
          bookingId: '123456',
          date: '2017-11-10T00:00:00',
          postRequired: 'false',
          preRequired: 'false',
          endTime: '2017-11-10T14:00:00',
          startTime: '2017-11-10T11:00:00',
        },
      }

      await controller.view(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'createBooking-v2/selectCourt.njk',
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
          { ...req, errors: [{ text: 'some error', href: '#courtId' }] } as unknown as Request,
          res,
          null
        )

        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#courtId', text: 'some error' }])
      })
    })

    describe('when a court has been selected', () => {
      it('should populate the details with the selected court and redirect to room selection page ', async () => {
        req.body = { courtId: 'CLDN' }

        await controller.submit(req, res, next)

        expect(res.cookie).toHaveBeenCalledWith(
          'booking-creation',
          {
            courtId: 'CLDN',
            bookingId: '123456',
            date: '2017-11-10T00:00:00',
            postRequired: 'true',
            preRequired: 'true',
            endTime: '2017-11-10T14:00:00',
            startTime: '2017-11-10T11:00:00',
          },
          expect.any(Object)
        )

        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-rooms')
      })
    })
  })
})
