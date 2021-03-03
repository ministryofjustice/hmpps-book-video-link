import { notifications } from '../config'
import log from '../log'
import { Context, BookingDetails, UpdateEmail, RequestEmail } from './model'

export = class NotificationService {
  constructor(private readonly oauthApi: any, private readonly notifyApi: any) {}

  private sendEmail({ templateId, email, personalisation }): Promise<void> {
    return this.notifyApi.sendEmail(templateId, email, {
      personalisation,
      reference: null,
    })
  }

  private async getUserDetails(context: Context, username: string) {
    const [{ email }, { name }] = await Promise.all([
      this.oauthApi.userEmail(context, username),
      this.oauthApi.userDetails(context, username),
    ])
    return { email, name }
  }

  public async sendBookingRequestEmails(context: Context, username: string, details: RequestEmail): Promise<void> {
    const { email, name } = await this.getUserDetails(context, username)
    const { vlb } = notifications.emails[details.agencyId]

    const personalisation = {
      firstName: details.firstName,
      lastName: details.lastName,
      prison: details.prison,
      dateOfBirth: details.dateOfBirth,
      date: details.date,
      startTime: details.startTime,
      endTime: details.endTime,
      preHearingStartAndEndTime: details.preHearingStartAndEndTime || 'Not required',
      postHearingStartAndEndTime: details.postHearingStartAndEndTime || 'Not required',
      comments: details.comments || 'None entered',
      hearingLocation: details.hearingLocation,
    }

    const courtPersonalisation = { userName: name, ...personalisation }

    this.sendEmail({
      templateId: notifications.requestBookingCourtTemplateVLBAdminId,
      email: vlb,
      personalisation,
    }).catch(error => {
      log.error(`Failed to email the prison about a booking request: ${error.message}`, error.response?.data?.errors)
    })

    this.sendEmail({
      templateId: notifications.requestBookingCourtTemplateRequesterId,
      email,
      personalisation: courtPersonalisation,
    }).catch(error => {
      log.error(`Failed to email the requester a copy of the booking: ${error.message}`, error.response?.data?.errors)
    })
  }

  public async sendBookingUpdateEmails(context: Context, username: string, details: UpdateEmail): Promise<void> {
    const { email, name } = await this.getUserDetails(context, username)
    const { omu, vlb } = notifications.emails[details.agencyId]

    const personalisation = {
      prisonerName: details.prisonerName,
      offenderNo: details.offenderNo,
      prison: details.prisonName,
      date: details.dateDescription,
      preAppointmentInfo: details.preDescription || 'Not required',
      mainAppointmentInfo: details.mainDescription,
      postAppointmentInfo: details.postDescription || 'Not required',
      comments: details.comments || 'None entered',
    }

    const courtPersonalisation = { userName: name, ...personalisation }
    const prisonPersonalisation = { court: details.courtLocation, ...personalisation }

    if (omu) {
      this.sendEmail({
        templateId: notifications.bookingUpdateConfirmationPrison,
        email: omu,
        personalisation: prisonPersonalisation,
      }).catch(error => {
        log.error(`Failed to notify OMU about a booking update: ${error.message}`, error.response?.data?.errors)
      })
    }

    this.sendEmail({
      templateId: notifications.bookingUpdateConfirmationPrison,
      email: vlb,
      personalisation: prisonPersonalisation,
    }).catch(error => {
      log.error(`Failed to notify VLB Admin about a booking update: ${error.message}`, error.response?.data?.errors)
    })

    this.sendEmail({
      templateId: notifications.bookingUpdateConfirmationCourt,
      email,
      personalisation: courtPersonalisation,
    }).catch(error => {
      log.error(`Failed to notify court user about a booking update: ${error.message}`, error.response?.data?.errors)
    })
  }

  public async sendCancellationEmails(context: Context, username: string, details: BookingDetails): Promise<void> {
    const { email, name } = await this.getUserDetails(context, username)
    const { omu, vlb } = notifications.emails[details.agencyId]

    const personalisation = {
      prisonerName: details.prisonerName,
      offenderNo: details.offenderNo,
      prison: details.prisonName,
      date: details.dateDescription,
      preAppointmentInfo: details.preDetails?.description || 'Not required',
      mainAppointmentInfo: details.mainDetails.description,
      postAppointmentInfo: details.postDetails?.description || 'Not required',
      comments: details.comments || 'None entered',
    }

    const courtPersonalisation = { userName: name, ...personalisation }
    const prisonPersonalisation = { court: details.courtLocation, ...personalisation }

    if (omu) {
      this.sendEmail({
        templateId: notifications.bookingCancellationPrison,
        email: omu,
        personalisation: prisonPersonalisation,
      }).catch(error => {
        log.error(`Failed to notify OMU about a booking cancellation: ${error.message}`, error.response?.data?.errors)
      })
    }

    this.sendEmail({
      templateId: notifications.bookingCancellationPrison,
      email: vlb,
      personalisation: prisonPersonalisation,
    }).catch(error => {
      log.error(
        `Failed to notify VLB Admin about a booking cancellation: ${error.message}`,
        error.response?.data?.errors
      )
    })

    this.sendEmail({
      templateId: notifications.bookingCancellationCourt,
      email,
      personalisation: courtPersonalisation,
    }).catch(error => {
      log.error(
        `Failed to notify court user about a booking cancellation: ${error.message}`,
        error.response?.data?.errors
      )
    })
  }
}
