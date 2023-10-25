import log from '../log'
import {
  BookingDetails,
  Context,
  CreateEmail,
  EmailSpec,
  Recipient,
  RecipientEmailSpec,
  RequestEmail,
  UpdateEmail,
} from './model'
import BookingRequest from './emails/BookingRequest'
import BookingUpdated from './emails/BookingUpdate'
import BookingCancellation from './emails/BookingCancellation'
import BookingCreation from './emails/BookingCreation'
import type PrisonRegisterApi from '../api/prisonRegisterApi'

interface UserDetails {
  email: string
  name: string
}

export default class NotificationService {
  constructor(
    private readonly manageUsersApi: any,
    private readonly notifyApi: any,
    private readonly prisonRegisterApi: PrisonRegisterApi
  ) {}

  private async sendEmail({ templateId, emailAddress, personalisation }): Promise<void> {
    return this.notifyApi.sendEmail(templateId, emailAddress, {
      personalisation,
      reference: null,
    })
  }

  private async getUserDetails(context: Context, username: string): Promise<UserDetails> {
    const [{ email }, { name }] = await Promise.all([
      this.manageUsersApi.userEmail(context, username),
      this.manageUsersApi.userDetails(context, username),
    ])
    return { email, name }
  }

  private async getEmailAddress(
    context: Context,
    recipient: Recipient,
    agencyId: string,
    userEmail: string
  ): Promise<string> {
    switch (recipient) {
      case 'user':
        return userEmail
      case 'omu':
        return this.prisonRegisterApi.getOffenderManagementUnitEmailAddress(context, agencyId)
      case 'vlb':
        return this.prisonRegisterApi.getVideoLinkConferencingCentreEmailAddress(context, agencyId)
      default:
        throw new Error(`could not send email to ${recipient}`)
    }
  }

  private async sendEmails(context: Context, username: string, emailSpec: EmailSpec): Promise<void> {
    const userDetails = await this.getUserDetails(context, username)
    await Promise.all(
      emailSpec.recipients.map(recipientEmailSpec =>
        this.emailToRecipient(context, recipientEmailSpec, userDetails, emailSpec)
      )
    )
  }

  private async emailToRecipient(
    context: Context,
    recipientEmailSpec: RecipientEmailSpec,
    userDetails: UserDetails,
    emailSpec: EmailSpec
  ): Promise<void> {
    let emailAddress
    try {
      emailAddress = await this.getEmailAddress(
        context,
        recipientEmailSpec.recipient,
        emailSpec.agencyId,
        userDetails.email
      )
    } catch (error) {
      /*
       * Ignore failed email address look-ups and do not log here regardless of
       * the kind of failure.
       * 404's are expected, others failures will be due to network problems
       * problems with remote services etc.
       */
      return Promise.resolve()
    }

    if (!emailAddress) {
      return Promise.resolve()
    }

    return this.sendEmail({
      templateId: recipientEmailSpec.template,
      emailAddress,
      personalisation: recipientEmailSpec.personalisation(userDetails.name),
    }).catch(error => {
      log.error(
        `Failed to send the ${recipientEmailSpec.recipient} recipient a ${emailSpec.name} email.`,
        error.response?.data?.errors
      )
      return Promise.resolve()
    })
  }

  public async sendBookingCreationEmails(context: Context, username: string, details: CreateEmail): Promise<void> {
    await this.sendEmails(context, username, BookingCreation(details))
  }

  public async sendBookingUpdateEmails(context: Context, username: string, details: UpdateEmail): Promise<void> {
    await this.sendEmails(context, username, BookingUpdated(details))
  }

  public async sendCancellationEmails(context: Context, username: string, details: BookingDetails): Promise<void> {
    await this.sendEmails(context, username, BookingCancellation(details))
  }

  public async sendBookingRequestEmails(context: Context, username: string, details: RequestEmail): Promise<void> {
    const userDetails = await this.getUserDetails(context, username)
    const emailSpec = BookingRequest(details)
    await Promise.all(
      emailSpec.recipients.map(recipientEmailSpec =>
        this.emailRequestToRecipient(context, recipientEmailSpec, userDetails, emailSpec)
      )
    )
  }

  private async emailRequestToRecipient(
    context: Context,
    recipientEmailSpec: RecipientEmailSpec,
    userDetails: UserDetails,
    emailSpec: EmailSpec
  ): Promise<void> {
    const emailAddress = await this.getEmailAddress(
      context,
      recipientEmailSpec.recipient,
      emailSpec.agencyId,
      userDetails.email
    )

    if (!emailAddress) {
      return
    }

    try {
      await this.sendEmail({
        templateId: recipientEmailSpec.template,
        emailAddress,
        personalisation: recipientEmailSpec.personalisation(userDetails.name),
      })
    } catch (error) {
      log.warn(
        `Failed to send the ${recipientEmailSpec.recipient} recipient a ${emailSpec.name} email.`,
        error.response?.data?.errors
      )
      throw error
    }
  }
}
