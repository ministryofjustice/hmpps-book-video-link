import { Request, Response } from 'express'
import ConfirmationController from './confirmationController'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'

jest.mock('../../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Confirmation controller', () => {
  let controller: ConfirmationController
  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ConfirmationController()
  })

  describe('view', () => {
    it('should render the confirmation template and raise an analytics event', async () => {
      req.flash.mockReturnValueOnce([
        {
          comments: 'test',
          date: 'Tuesday 1 January 2019',
          dateOfBirth: '14/05/1920',
          endTime: '11:00',
          firstName: 'John',
          hearingLocation: 'London',
          lastName: 'Doe',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preAppointmentRequired: 'yes',
          preHearingStartAndEndTime: '11:00 to 11:20',
          prison: 'HMP Wandsworth',
          startTime: '10:00',
        },
      ])

      await controller.view()(req, res, null)

      expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
        'VLB Appointments',
        'Video link requested for London',
        'Pre: Yes | Post: Yes'
      )
      expect(res.render).toHaveBeenCalledWith('requestBooking/confirmation.njk', {
        details: {
          prison: 'HMP Wandsworth',
          name: 'John Doe',
          dateOfBirth: '14/05/1920',
        },
        hearingDetails: {
          date: 'Tuesday 1 January 2019',
          courtHearingStartTime: '10:00',
          courtHearingEndTime: '11:00',
          comments: 'test',
        },
        prePostDetails: {
          'post-court hearing briefing': '09:35 to 11:00',
          'pre-court hearing briefing': '11:00 to 11:20',
        },
        courtDetails: {
          courtLocation: 'London',
        },
      })
    })

    it('should throw an error and not raise analytics event if there are no request details', async () => {
      req.flash.mockReturnValueOnce([])

      await expect(controller.view()(req, res, null)).rejects.toThrow('Request details are missing')

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
    })
  })
})
