jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

const confirmAppointments = require('../controllers/appointments/confirmAppointment')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')

describe('Confirm appointments', () => {
  const prisonApi = {}
  const appointmentsService = {}
  const req = {}
  const res = {}
  const appointmentDetails = {
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    appointmentType: 'appointment1',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
    court: 'London',
  }

  beforeEach(() => {
    prisonApi.getDetails = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [
        { value: 'VLB', text: 'Videolink' },
        { value: 'appointment1', text: 'Appointment 1' },
      ],
      locationTypes: [
        { value: 1, text: 'Room 3' },
        { value: 2, text: 'Room 1' },
        { value: 3, text: 'Room 2' },
      ],
    })

    prisonApi.getDetails.mockReturnValue({
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    req.flash = jest.fn()
    req.params = { offenderNo: 'A12345' }
    req.session = { userDetails: { authSource: 'nomis' } }
    req.originalUrl = 'http://localhost'

    res.render = jest.fn()

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  it('should load court confirmation page when user is not prison staff', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
    })

    req.session = { userDetails: { authSource: '' } }

    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
        preAppointment: {
          endTime: '2017-10-10T11:00:00',
          locationId: 2,
          startTime: '2017-10-10T10:45:00',
          duration: 30,
        },
        appointmentType: 'VLB',
      },
    ])

    await index(req, res)

    expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
      'VLB Appointments',
      'Video link booked for London',
      'Pre: Yes | Post: No'
    )

    expect(res.render).toHaveBeenCalledWith(
      'videolinkBookingConfirmHearingCourt.njk',
      expect.objectContaining({
        videolinkPrisonerSearchLink: '/prisoner-search',
        title: 'The video link has been booked',
        offender: {
          name: 'John Doe',
          prisonRoom: 'Room 3',
          prison: undefined,
        },
        details: {
          date: '10 October 2017',
          courtHearingStartTime: '11:00',
          courtHearingEndTime: '14:00',
          comments: 'Test',
        },
        prepostData: {
          'pre-court hearing briefing': 'Room 1 - 10:45 to 11:00',
        },
        court: { courtLocation: 'London' },
      })
    )
  })

  it('should throw and log a court service error for a court user when appointment details are missing from flash', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
    })
    req.flash.mockImplementation(() => [])
    req.session.userDetails.authSource = 'auth'

    await expect(index(req, res)).rejects.toThrow('Appointment details are missing')
  })
})
