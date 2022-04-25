import { WhereaboutsApi } from '../api'
import NotificationService from './notificationService'
import RequestService from './requestService'
import type { RequestEmail } from './model'

jest.mock('../api')
jest.mock('./manageCourtsService')

const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const notificationService = new NotificationService(null, null, null) as jest.Mocked<NotificationService>

describe('Request service', () => {
  const context = {}
  const user = 'user1'
  const emailData = {} as RequestEmail
  let service: RequestService

  beforeEach(() => {
    service = new RequestService(whereaboutsApi, notificationService)
    notificationService.sendBookingRequestEmails = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCourtEmailAddress', () => {
    it('Should get single court email address using courtId ', async () => {
      whereaboutsApi.getCourtEmail.mockResolvedValue({ email: 'court@email.com' })
      const response = await service.getCourtEmailAddress(context, 'DRBYCC')
      expect(response).toEqual({ email: 'court@email.com' })
    })
  })

  describe('sendBookingRequestEmails', () => {
    it('Should call notification service ', async () => {
      await service.sendBookingRequestEmails(context, user, emailData)
      expect(notificationService.sendBookingRequestEmails).toHaveBeenLastCalledWith(context, user, emailData)
    })
  })
})
