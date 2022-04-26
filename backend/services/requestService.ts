import { CourtEmail } from 'whereaboutsApi'
import type { WhereaboutsApi } from '../api'
import { Context, RequestEmail } from './model'
import type NotificationService from './notificationService'

export = class RequestService {
  constructor(
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly notificationService: NotificationService
  ) {}

  public async getCourtEmailAddress(context: Context, courtId: string): Promise<CourtEmail> {
    const courtEmailAddress = await this.whereaboutsApi.getCourtEmail(context, courtId)
    return courtEmailAddress
  }

  public async sendBookingRequestEmails(context: Context, username: string, details: RequestEmail): Promise<void> {
    await this.notificationService.sendBookingRequestEmails(context, username, details)
  }
}
