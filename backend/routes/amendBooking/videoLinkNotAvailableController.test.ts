import { Request, Response } from 'express'

import VideoLinkNotAvailableController from './videoLinkNotAvailableController'

describe('video link is not available controller', () => {
  let controller: VideoLinkNotAvailableController
  const appointmentDetails = {
    dateSlashSeparated: '01/01/2021',
    startTimeHours: '03',
    startTimeMinutes: '10',
    endTimeHours: '07',
    endTimeMinutes: '00',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
    date: 'Monday 01 January 2021',
    startTime: '03.10',
    endTime: '07.00',
    prisoner: { name: 'some prisoner' },
    locations: { prison: 'some prison', court: 'some court' },
  }

  const req = ({
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345', bookingId: 123 },
    session: { userDetails: { activeCaseLoadId: 'LEI', name: 'Bob Smith', username: 'BOB_SMITH' } },
    body: {},
    flash: jest.fn(),
  } as unknown) as jest.Mocked<Request>

  const res = ({
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as jest.Mocked<Response>

  beforeEach(() => {
    controller = new VideoLinkNotAvailableController()
  })

  describe('view', () => {
    it("should render the 'amendBooking/noAvailabilityForDateTime' page", async () => {
      const mockFlashState = ({ input }) => (req.flash as any).mockReturnValueOnce(input)

      mockFlashState({
        input: [appointmentDetails],
      })

      await controller.view()(req, res, null)
      expect(res.render).toHaveBeenCalledWith('amendBooking/noAvailabilityForDateTime.njk', {
        bookingId: 123,
        input: {
          date: 'Monday 01 January 2021',
          dateSlashSeparated: '01/01/2021',
          endTime: '07.00',
          endTimeHours: '07',
          endTimeMinutes: '00',
          locations: { court: 'some court', prison: 'some prison' },
          postAppointmentRequired: 'yes',
          preAppointmentRequired: 'yes',
          prisoner: { name: 'some prisoner' },
          startTime: '03.10',
          startTimeHours: '03',
          startTimeMinutes: '10',
        },
      })
    })
  })

  describe('submit', () => {
    it('should display booking details', async () => {
      req.body = appointmentDetails

      await controller.submit()(req, res, null)
      expect(res.redirect).toHaveBeenCalledWith(`/change-Date-And-Time/123`)
      expect(req.flash).toBeCalledWith('input', {
        date: '01/01/2021',
        endTime: '07.00',
        endTimeHours: '10',
        endTimeMinutes: '00',
        locations: { court: 'some court', prison: 'some prison' },
        postAppointmentRequired: 'yes',
        preAppointmentRequired: 'yes',
        prisoner: { name: 'some prisoner' },
        startTime: '03.10',
        startTimeHours: '03',
        startTimeMinutes: '10',
      })
    })
  })
})
