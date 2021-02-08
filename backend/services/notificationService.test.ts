import moment from 'moment'
import { BookingDetails, UpdateEmail } from './model'
import config from '../config'
import NotificationService from './notificationService'

const oauthApi = {
  userDetails: jest.fn(),
  userEmail: jest.fn(),
}

const notifyApi = {
  sendEmail: jest.fn(),
}

const bookingDetail: BookingDetails = {
  agencyId: 'WWI',
  offenderNo: 'A1234AA',
  comments: 'some comment',
  courtLocation: 'City of London',
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
  },
  mainDetails: {
    description: 'Vcc Room 1 - 18:00 to 19:00',
    endTime: '19:00',
    prisonRoom: 'Vcc Room 1',
    startTime: '18:00',
  },
  postDetails: {
    description: 'Vcc Room 2 - 19:00 to 19:20',
    endTime: '19:20',
    prisonRoom: 'Vcc Room 2',
    startTime: '19:00',
  },
}

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
}

describe('Notification service', () => {
  const context = {}
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService(oauthApi, notifyApi)
    config.notifications.emails.WWI.omu = 'omu@prison.com'
    config.notifications.emails.WWI.vlb = 'vlb@prison.com'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Send update emails', () => {
    it('Details are retrieved for user', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(oauthApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(oauthApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', {
        ...updateEmail,
        comments: null,
        preDescription: null,
        postDescription: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrison,
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
          },
          reference: null,
        }
      )
    })

    it('should send email to Offender Management Unit', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrison,
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
          },
          reference: null,
        }
      )
    })

    it('Offender Management Unit email address is optional', async () => {
      config.notifications.emails.WWI.omu = null
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

      expect(notifyApi.sendEmail).toHaveBeenCalledTimes(2)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationPrison,
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
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'A_USER', updateEmail)

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
          },
          reference: null,
        }
      )
    })
    it('Should send email to court', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendBookingUpdateEmails(context, 'USER', updateEmail)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingUpdateConfirmationCourt,
        'user@email.com',
        {
          personalisation: {
            comments: 'some comment',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            userName: 'A User',
          },
          reference: null,
        }
      )
    })
  })

  describe('Send cancellation emails', () => {
    it('Details are retrieved for user', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(oauthApi.userEmail).toHaveBeenCalledWith({}, 'A_USER')
      expect(oauthApi.userDetails).toHaveBeenCalledWith({}, 'A_USER')
    })

    it('should send personalisation with optional fields', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', {
        ...bookingDetail,
        comments: null,
        preDetails: null,
        postDetails: null,
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrison,
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
          },
          reference: null,
        }
      )
    })

    it('should send email to Offender Management Unit', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrison,
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
          },
          reference: null,
        }
      )
    })

    it('Offender Management Unit email address is optional', async () => {
      config.notifications.emails.WWI.omu = null
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

      expect(notifyApi.sendEmail).toHaveBeenCalledTimes(2)

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationPrison,
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
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'A_USER', bookingDetail)

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
          },
          reference: null,
        }
      )
    })
    it('Should send email to court', async () => {
      oauthApi.userEmail.mockResolvedValue({ email: 'user@email.com' })
      oauthApi.userDetails.mockResolvedValue({ name: 'A User' })
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendCancellationEmails(context, 'USER', bookingDetail)
      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.bookingCancellationCourt,
        'user@email.com',
        {
          personalisation: {
            comments: 'some comment',
            date: '20 November 2020',
            mainAppointmentInfo: 'Vcc Room 1 - 18:00 to 19:00',
            offenderNo: 'A1234AA',
            postAppointmentInfo: 'Vcc Room 2 - 19:00 to 19:20',
            preAppointmentInfo: 'Vcc Room 3 - 17:40 to 18:00',
            prison: 'some prison',
            prisonerName: 'John Doe',
            userName: 'A User',
          },
          reference: null,
        }
      )
    })
  })
})
