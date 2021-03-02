jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

process.env.VIDEO_LINK_ENABLED_FOR = 'WWI'
process.env.WANDSWORTH_VLB_EMAIL = 'test@justice.gov.uk'
const config = require('../config')

const { requestBookingFactory } = require('../routes/requestBooking/requestBooking')
const { notifyApi } = require('../api/notifyApi')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')

const { requestBookingCourtTemplateVLBAdminId, requestBookingCourtTemplateRequesterId } = config.notifications

describe('Request a booking', () => {
  let req
  let res
  let logError
  let controller
  const whereaboutsApi = {}
  const oauthApi = {}
  const prisonApi = {}

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
          username: 'testUsername',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    res.redirect = jest.fn()
    req.flash = jest.fn()
    req.flash.mockImplementation(() => [])

    logError = jest.fn()
    notifyApi.sendEmail = jest.fn().mockResolvedValue({})
    whereaboutsApi.getCourtLocations = jest.fn()
    oauthApi.userEmail = jest.fn()
    oauthApi.userDetails = jest.fn()
    prisonApi.getAgencies = jest.fn()

    prisonApi.getAgencies.mockReturnValue([
      { agencyId: 'WWI', description: 'HMP WANDSWORTH', formattedDescription: 'HMP Wandsworth' },
    ])

    oauthApi.userEmail.mockReturnValue({ email: 'test@test' })
    oauthApi.userDetails.mockReturnValue({ name: 'Staff member' })

    controller = requestBookingFactory({ logError, notifyApi, oauthApi, prisonApi })

    // @ts-ignore
    raiseAnalyticsEvent.mockRestore()
  })

  describe('Enter offender details', () => {
    it('should render the correct template with errors and form values', async () => {
      const errors = [{ href: '#first-name', text: 'Enter a first name' }]
      req.flash.mockImplementation(key => (key === 'errors' ? errors : [{ lastName: 'doe' }]))

      await controller.enterOffenderDetails(req, res)
      expect(res.render).toHaveBeenCalledWith('requestBooking/offenderDetails.njk', {
        errors,
        formValues: { lastName: 'doe' },
      })
    })

    it('should stash the offender details and redirect to the confirmation page', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      oauthApi.userEmail.mockReturnValue({
        email: 'test@test',
      })
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          dateOfBirth: '14/05/1920',
        },
      ])

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          comments: 'test',
          date: 'Tuesday 1 January 2019',
          dateOfBirth: '10 December 2019',
          endTime: '11:00',
          firstName: 'John',
          lastName: 'Doe',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          prison: 'HMP Wandsworth',
          startTime: '10:00',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })

    it('should add provide default comment value', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
      }
      oauthApi.userEmail.mockReturnValue({ email: 'test@test' })
      req.flash.mockImplementation(() => [{ prison: 'WWI' }])

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          comments: 'None entered',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })

  describe('Create booking', () => {
    it('should redirect to current page when errors are present', async () => {
      req.body = {}
      req.errors = [
        { text: 'Enter a first name', href: '#first-name' },
        { text: 'Enter a last name', href: '#last-name' },
        { text: 'Enter a date of birth', href: '#dobDay' },
      ]
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'Enter a first name', href: '#first-name' },
        { text: 'Enter a last name', href: '#last-name' },
        { text: 'Enter a date of birth', href: '#dobDay' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/enter-offender-details')
    })

    it('should submit two emails, one for the prison and another for the current user', async () => {
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          courtHearing: 'HMP Wandsworth',
          hearingLocation: 'London',
        },
      ])
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.createBookingRequest(req, res)

      const personalisation = {
        date: 'Tuesday 1 January 2019',
        startTime: '10:00',
        endTime: '11:00',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        dateOfBirth: '10 December 2019',
        firstName: 'John',
        hearingLocation: 'London',
        lastName: 'Doe',
        comments: 'test',
        prison: 'HMP Wandsworth',
      }

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        requestBookingCourtTemplateVLBAdminId,
        'test@justice.gov.uk',
        expect.objectContaining({
          personalisation,
          reference: null,
        })
      )

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        requestBookingCourtTemplateRequesterId,
        'test@test',
        expect.objectContaining({
          personalisation: {
            ...personalisation,
            username: 'Staff member',
          },
          reference: null,
        })
      )
    })

    it('should stash appointment details and redirect to the confirmation page', async () => {
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          hearingLocation: 'London',
        },
      ])
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          date: 'Tuesday 1 January 2019',
          endTime: '11:00',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          prison: 'HMP Wandsworth',
          startTime: '10:00',
          hearingLocation: 'London',
          firstName: 'John',
          lastName: 'Doe',
          comments: 'test',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })

  describe('confirm', () => {
    it('should submit an email and render the confirmation template', () => {
      const details = {
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
      }
      req.flash.mockReturnValue([details])
      controller.confirm(req, res)

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
      const details = {}
      req.flash.mockReturnValue([details])
      await expect(controller.confirm(req, res)).rejects.toThrow('Request details are missing')

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
    })
  })
})
