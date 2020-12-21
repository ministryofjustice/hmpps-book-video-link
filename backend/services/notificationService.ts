import { notifications } from '../config'
import log from '../log'
import { Context, BookingDetails } from './model'

export = class NotificationService {
  constructor(private readonly oauthApi: any, private readonly notifyClient: any) {}

  private sendEmail({ templateId, email, personalisation }): Promise<void> {
    return this.notifyClient.sendEmail(templateId, email, {
      personalisation,
      reference: null,
    })
  }

  public async sendCancellationEmails(context: Context, username: string, details: BookingDetails): Promise<void> {
    const [{ email }, { name }] = await Promise.all([
      this.oauthApi.userEmail(context, username),
      this.oauthApi.userDetails(context, username),
    ])
    const { omu } = notifications.emails[details.agencyId]

    const personalisation = {
      prisonerName: details.prisonerName,
      offenderNo: details.offenderNo,
      prison: details.prisonName,
      date: details.date,
      preAppointmentInfo: details.preDetails?.description,
      mainAppointmentInfo: details.mainDetails.description,
      postAppointmentInfo: details.postDetails?.description,
      comments: details.comments,
    }

    const courtPersonalisation = { userName: name, ...personalisation }
    const prisonPersonalisation = { court: details.courtLocation, ...personalisation }

    this.sendEmail({
      templateId: notifications.bookingCancellationPrison,
      email: omu,
      personalisation: prisonPersonalisation,
    }).catch(error => {
      log.error('Failed to notify OMU about a booking cancellation', error)
    })

    this.sendEmail({
      templateId: notifications.bookingCancellationCourt,
      email,
      personalisation: courtPersonalisation,
    }).catch(error => {
      log.error('Failed to court user about their booking cancellation', error)
    })
  }
}
