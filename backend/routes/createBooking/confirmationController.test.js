jest.mock('../../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

const controller = require('./confirmationController')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

describe('Confirm appointments', () => {
  const prisonApi = {}
  const locationService = {}
  const req = {}
  const res = {}
  const appointmentDetails = {
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
    court: 'London',
    agencyId: 'MDI',
  }

  beforeEach(() => {
    prisonApi.getPrisonerDetails = jest.fn()
    locationService.getRooms = jest.fn()

    locationService.getRooms.mockReturnValue([
      { value: 1, text: 'Room 3' },
      { value: 2, text: 'Room 1' },
      { value: 3, text: 'Room 2' },
    ])

    prisonApi.getPrisonerDetails.mockReturnValue({
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

    req.flash.mockReturnValue([appointmentDetails])
  })

  it('should load court confirmation page when user is not prison staff', async () => {
    const index = controller({
      prisonApi,
      locationService,
    })

    req.session = { userDetails: { authSource: '' } }

    req.flash.mockReturnValue([
      {
        ...appointmentDetails,
        preAppointment: {
          endTime: '2017-10-10T11:00:00',
          locationId: 2,
          startTime: '2017-10-10T10:45:00',
          duration: 30,
        },
      },
    ])

    await index(req, res)

    expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
      'VLB Appointments',
      'Video link booked for London',
      'Pre: Yes | Post: No'
    )

    expect(res.render).toHaveBeenCalledWith(
      'createBooking/confirmation.njk',
      expect.objectContaining({
        videolinkPrisonerSearchLink: '/prisoner-search',
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
    const index = controller({
      prisonApi,
      locationService,
    })
    req.flash.mockReturnValue([])
    req.session.userDetails.authSource = 'auth'

    await expect(index(req, res)).rejects.toThrow('Appointment details are missing')
  })
  it('Should call locationService with agencyId', async () => {
    const index = controller({
      prisonApi,
      locationService,
    })
    res.locals = {}
    await index(req, res)

    expect(locationService.getRooms).toBeCalledWith({}, 'MDI')
  })
})
