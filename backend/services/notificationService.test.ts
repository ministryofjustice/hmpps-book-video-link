import moment from 'moment'
import { BookingDetails, UpdateEmail, RequestEmail, CreateEmail } from './model'
import config from '../config'
import NotificationService from './notificationService'
import PrisonRegisterApi from '../api/prisonRegisterApi'

jest.mock('../api/prisonRegisterApi')

const manageUsersApi = {
  userDetails: jest.fn(),
  userEmail: jest.fn(),
}

const notifyApi = {
  sendEmail: jest.fn(),
}

const prisonRegisterApi = new PrisonRegisterApi(null) as jest.Mocked<PrisonRegisterApi>

describe('Notification service', () => {
  const context = {}
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService(manageUsersApi, notifyApi, prisonRegisterApi)
    prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockResolvedValue('omu@prison.com')
    prisonRegisterApi.getVideoLinkConferencingCentreEmailAddress.mockResolvedValue('vlb@prison.com')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Send request emails', () => {
    const requestEmail: RequestEmail = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '10 December 2019',
      date: '20 November 2020',
      startTime: '10:00',
      endTime: '11:00',
      agencyId: 'WWI',
      prison: 'some prison',
      hearingLocation: 'London',
      comments: 'some comment',
      preHearingStartAndEndTime: '11:00 to 11:20',
      postHearingStartAndEndTime: '09:35 to 11:00',
      courtEmailAddress: 'court@mail.com',
    }

    it('Details are retrieved for user', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingRequestEmails(context, 'A_USER', requestEmail)

      expect(manageUsersApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(manageUsersApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingRequestEmails(context, 'A_USER', {
        ...requestEmail,
        comments: null,
        preHearingStartAndEndTime: null,
        postHearingStartAndEndTime: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.requestBookingCourtTemplateRequesterId,
        'user@email.com',
        {
          personalisation: {
            firstName: 'John',
            lastName: 'Doe',
            prison: 'some prison',
            dateOfBirth: '10 December 2019',
            date: '20 November 2020',
            startTime: '10:00',
            endTime: '11:00',
            preHearingStartAndEndTime: 'Not required',
            postHearingStartAndEndTime: 'Not required',
            comments: 'None entered',
            hearingLocation: 'London',
            userName: 'A User',
            courtEmailAddress: 'court@mail.com',
          },
          reference: null,
        }
      )
    })

    it('should send email to Prison Video Link Booking Admin', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingRequestEmails(context, 'A_USER', requestEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.requestBookingCourtTemplateVLBAdminWithCourtEmailAddress,
        'vlb@prison.com',
        {
          personalisation: {
            firstName: 'John',
            lastName: 'Doe',
            prison: 'some prison',
            dateOfBirth: '10 December 2019',
            date: '20 November 2020',
            startTime: '10:00',
            endTime: '11:00',
            comments: 'some comment',
            preHearingStartAndEndTime: '11:00 to 11:20',
            postHearingStartAndEndTime: '09:35 to 11:00',
            hearingLocation: 'London',
            courtEmailAddress: 'court@mail.com',
          },
          reference: null,
        }
      )
    })

    it('Should send email to court', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingRequestEmails(context, 'A_USER', requestEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.requestBookingCourtTemplateRequesterId,
        'user@email.com',
        {
          personalisation: {
            firstName: 'John',
            lastName: 'Doe',
            prison: 'some prison',
            dateOfBirth: '10 December 2019',
            date: '20 November 2020',
            startTime: '10:00',
            endTime: '11:00',
            comments: 'some comment',
            preHearingStartAndEndTime: '11:00 to 11:20',
            postHearingStartAndEndTime: '09:35 to 11:00',
            hearingLocation: 'London',
            userName: 'A User',
            courtEmailAddress: 'court@mail.com',
          },
          reference: null,
        }
      )
    })
    it('Should not send court email address', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingRequestEmails(context, 'A_USER', {
        ...requestEmail,
        courtEmailAddress: undefined,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.requestBookingCourtTemplateVLBAdmin,
        'vlb@prison.com',
        {
          personalisation: {
            firstName: 'John',
            lastName: 'Doe',
            prison: 'some prison',
            dateOfBirth: '10 December 2019',
            date: '20 November 2020',
            startTime: '10:00',
            endTime: '11:00',
            comments: 'some comment',
            preHearingStartAndEndTime: '11:00 to 11:20',
            postHearingStartAndEndTime: '09:35 to 11:00',
            hearingLocation: 'London',
            courtEmailAddress: undefined,
          },
          reference: null,
        }
      )
    })

    it('Should throw error', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockRejectedValue(new Error('Network error'))

      await expect(
        notificationService.sendBookingRequestEmails(context, 'A_USER', {
          ...requestEmail,
          courtEmailAddress: undefined,
        })
      ).rejects.toThrow()
    })
  })

  describe('Send update emails', () => {
    const updateEmail: UpdateEmail = {
      agencyId: 'WWI',
      offenderNo: 'A1234AA',
      comments: 'some comment',
      courtLocation: 'City of London',
      dateDescription: '20 November 2020',
      prisonName: 'some prison',
      prisonerName: 'John Doe',
      preDescription: 'Vcc Room 3 - 17:40 to 18:00',
      mainDescription: 'Vcc Room 1 - 18:00 to 19:00',
      postDescription: 'Vcc Room 2 - 19:00 to 19:20',
      courtEmailAddress: 'court@email.com',
    }

    it('Details are retrieved for user', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(manageUsersApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(manageUsersApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', {
        ...updateEmail,
        comments: null,
        preDescription: null,
        postDescription: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'None entered',
            court: 'City of London',
            courtEmailAddress: 'court@email.com',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Not required',
            preAppointmentInfo: 'Not required',
            prison: 'some prison',
            prisonerName: 'John Doe',
          },
          reference: null,
        }
      )
    })

    it('should send email to Offender Management Unit', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('Offender Management Unit email address is optional', async () => {
      prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockRejectedValue({})

      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledTimes(2)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        expect.anything()
      )

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationCourt,
        'user@email.com',
        expect.anything()
      )
    })

    it('should send email to Prison Video Link Booking Admin', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })
    it('should not include court email address in email to prison', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', {
        ...updateEmail,
        courtEmailAddress: undefined,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrison,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: undefined,
          },
          reference: null,
        }
      )
    })

    it('Should send email to court', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'USER', updateEmail)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationCourt,
        'user@email.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            userName: 'A User',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })
  })

  describe('Send cancellation emails', () => {
    const bookingDetail: BookingDetails = {
      agencyId: 'WWI',
      offenderNo: 'A1234AA',
      comments: 'some comment',
      courtLocation: 'City of London',
      courtId: 'CLDN',
      courtEmailAddress: 'court@email.com',
      date: moment('2020-11-20'),
      dateDescription: '20 November 2020',
      prisonBookingId: 789,
      prisonName: 'some prison',
      prisonerName: 'John Doe',
      videoBookingId: 123,
      preDetails: {
        description: 'Vcc Room 3 - 17:40 to 18:00',
        endTime: '18:00',
        prisonRoom: 'Vcc Room 3',
        startTime: '17:40',
        locationId: 3,
      },
      mainDetails: {
        description: 'Vcc Room 1 - 18:00 to 19:00',
        endTime: '19:00',
        prisonRoom: 'Vcc Room 1',
        startTime: '18:00',
        locationId: 1,
      },
      postDetails: {
        description: 'Vcc Room 2 - 19:00 to 19:20',
        endTime: '19:20',
        prisonRoom: 'Vcc Room 2',
        startTime: '19:00',
        locationId: 2,
      },
    }

    it('Details are retrieved for user', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(manageUsersApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(manageUsersApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', {
        ...bookingDetail,
        comments: null,
        preDetails: null,
        postDetails: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'None entered',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Not required',
            preAppointmentInfo: 'Not required',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('should send email to Offender Management Unit', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('Offender Management Unit email address is optional', async () => {
      prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockRejectedValue({})

      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(notifyApi.sendEmail).toHaveBeenCalledTimes(2)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        expect.anything()
      )

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationCourt,
        'user@email.com',
        expect.anything()
      )
    })

    it('should send email to Prison Video Link Booking Admin', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('should not send email to Prison Video Link Booking Admin', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', {
        ...bookingDetail,
        courtEmailAddress: undefined,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrison,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: undefined,
          },
          reference: null,
        }
      )
    })

    it('Should send email to court', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'USER', bookingDetail)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationCourt,
        'user@email.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            userName: 'A User',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })
  })

  describe('Send creation emails', () => {
    const createEmail: CreateEmail = {
      agencyId: 'WWI',
      offenderNo: 'A1234AA',
      comment: 'some comment',
      court: 'City of London',
      prison: 'some prison',
      prisonerName: 'John Doe',
      date: moment('2020-11-20T18:00:00'),
      preDetails: 'Vcc Room 3 - 17:40 to 18:00',
      mainDetails: 'Vcc Room 1 - 18:00 to 19:00',
      postDetails: 'Vcc Room 2 - 19:00 to 19:20',
      courtEmailAddress: 'court@email.com',
    }
    it('Details are retrieved for user', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)

      expect(manageUsersApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(manageUsersApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', {
        ...createEmail,
        comment: null,
        preDetails: null,
        postDetails: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'None entered',
            court: 'City of London',
            date: '20 November 2020',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Not required',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            preAppointmentInfo: 'Not required',
            prisonerName: 'John Doe',
            prison: 'some prison',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('should send email to Offender Management Unit', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationPrisonWithCourtEmailAddress,
        'omu@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('Offender Management Unit email address is optional', async () => {
      prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockRejectedValue({})

      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledTimes(2)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        expect.anything()
      )

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationCourt,
        'user@email.com',
        expect.anything()
      )
    })

    it('should send email to Prison Video Link Booking Admin', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationPrisonWithCourtEmailAddress,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('Should send email to court', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'USER', createEmail)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationCourt,
        'user@email.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            userName: 'A User',
            courtEmailAddress: 'court@email.com',
          },
          reference: null,
        }
      )
    })

    it('should not include court email address in email sent to prison', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingCreationEmails(context, 'A_USER', {
        ...createEmail,
        courtEmailAddress: undefined,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCreationConfirmationPrison,
        'vlb@prison.com',
        {
          personalisation: {
            comments: 'some comment',
            court: 'City of London',
            date: '20 November 2020',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            courtEmailAddress: undefined,
          },
          reference: null,
        }
      )
    })

    it('fails to get emailAddress on prisonApi exception', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockRejectedValue(new Error('Network error'))
      const result = await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)
      expect(result).toBe(undefined)
    })

    it('fails to send email on Notify exception', async () => {
      manageUsersApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      manageUsersApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockRejectedValue(new Error('Network error'))

      prisonRegisterApi.getOffenderManagementUnitEmailAddress.mockResolvedValue('some email address')
      const result = await notificationService.sendBookingCreationEmails(context, 'A_USER', createEmail)
      expect(result).toBe(undefined)
    })
  })
})
