import { notifications } from '../config'
import log from '../log'
import { Context, BookingDetails, UpdateEmail, RequestEmail, Recipient, EmailSpec, CreateEmail } from './model'
import BookingRequest from './emails/BookingRequest'
import BookingUpdated from './emails/BookingUpdate'
import BookingCancellation from './emails/BookingCancellation'
import BookingCreation from './emails/BookingCreation'

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

  public async sendBookingCreationEmails(context: Context, username: string, details: CreateEmail): Promise<void> {
    await this.sendEmails(context, username, BookingCreation(details))
  }

  public async sendBookingRequestEmails(context: Context, username: string, details: RequestEmail): Promise<void> {
    await this.sendEmails(context, username, BookingRequest(details))
  }

  public async sendBookingUpdateEmails(context: Context, username: string, details: UpdateEmail): Promise<void> {
    await this.sendEmails(context, username, BookingUpdated(details))
  }

  public async sendCancellationEmails(context: Context, username: string, details: BookingDetails): Promise<void> {
    await this.sendEmails(context, username, BookingCancellation(details))
  }
}
