import request from 'supertest'
import deleteAppointment from '../controllers/appointments/deleteAppointment'
// import { appWithAllRoutes, user } from './testutils/appSetup'

// jest.mock('../services/report/draftReportService')

// const draftReportService = new DraftReportService(null, null, null, null, null) as jest.Mocked<DraftReportService>

// let app

// beforeEach(() => {
//   app = appWithAllRoutes({ draftReportService })
//   draftReportService.getCurrentDraft.mockResolvedValue({})
// })

// afterEach(() => {
//   jest.resetAllMocks()
// })

// describe('GET /section/form', () => {
//   test('should render use-of-force-details using locations for persisted agency if existing report', () => {
//     draftReportService.getCurrentDraft.mockResolvedValue({ id: '1', agencyId: 'persisted-agency-id' })
//     return request(app)
//       .get(`/report/1/use-of-force-details`)
//       .expect('Content-Type', /html/)
//       .expect(res => {
//         expect(res.text).toContain('Use of force details')
//       })
//   })
// })
