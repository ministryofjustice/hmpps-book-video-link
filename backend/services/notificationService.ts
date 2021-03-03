import { notifications } from '../config'
import log from '../log'
import { Context, BookingDetails, UpdateEmail, RequestEmail, Recipient, EmailSpec } from './model'
import BookingRequest from './emails/bookingRequest'

export default class NotificationService {
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

  private getEmailAddress(recipient: Recipient, agencyId: string, userEmail: string): string {
    switch (recipient) {
      case 'user':
        return userEmail
      case 'omu':
        return notifications.emails[agencyId]?.omu
      case 'vlb':
        return notifications.emails[agencyId]?.vlb
      default:
        throw new Error(`could not send email to ${recipient}`)
    }
  }

  private async sendEmails(context: Context, username: string, spec: EmailSpec): Promise<void> {
    const { email: userEmail, name: usersName } = await this.getUserDetails(context, username)

    spec.recipients.forEach(email => {
      const emailAddress = this.getEmailAddress(email.recipient, spec.agencyId, userEmail)
      if (emailAddress) {
        this.sendEmail({
          templateId: email.template,
          email: emailAddress,
          personalisation: email.personalisation(usersName),
        }).catch(error => {
          log.error(
            `Failed to email the ${email.recipient} a ${spec.name}: ${error.message}`,
            error.response?.data?.errors
          )
        })
      }
    })
  }

  public async sendBookingRequestEmails(context: Context, username: string, details: RequestEmail): Promise<void> {
    await this.sendEmails(context, username, BookingRequest(details))
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
