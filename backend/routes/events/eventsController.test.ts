import WhereaboutsApi from '../../api/whereaboutsApi'
import { mockRequest, mockResponse } from '../__test/requestTestUtils'
import EventsController from './eventsController'

jest.mock('../../api/whereaboutsApi')

const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>

let controller: EventsController

describe('EventsController', () => {
  describe('view', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      controller = new EventsController(whereaboutsApi)
    })

    it('First view', async () => {
      const req = mockRequest({})
      const res = mockResponse()

      await controller.view(req, res, null)
      expect(res.render).toHaveBeenCalledWith('events/index.njk', {
        downloadPath: undefined,
        errors: [],
        formValues: {},
      })
    })

    it('Valid submission', async () => {
      const req = mockRequest({
        query: {
          startDay: '30',
          startMonth: '03',
          startYear: '2021',
          days: '7',
        },
      })
      const res = mockResponse()

      await controller.view(req, res, null)
      expect(res.render).toHaveBeenCalledWith('events/index.njk', {
        downloadPath: '/video-link-booking-events-csv?start-date=2021-03-30&days=7',
        errors: [],
        formValues: {
          days: '7',
          startDay: '30',
          startMonth: '03',
          startYear: '2021',
        },
      })
    })

    it('Invalid submission', async () => {
      const req = mockRequest({
        query: {
          startDay: '30',
          startMonth: '03',
          startYear: '2021',
        },
      })
      const res = mockResponse()

      await controller.view(req, res, null)
      expect(res.render).toHaveBeenCalledWith('events/index.njk', {
        downloadPath: undefined,
        errors: [{ href: '#days', text: 'Enter the number of days of events to download' }],
        formValues: {
          startDay: '30',
          startMonth: '03',
          startYear: '2021',
        },
      })
    })
  })

  describe('getCsv', () => {
    it('rejects invalid start-date', () => {
      const req = mockRequest({
        query: {
          days: '3',
          'start-date': 'xxxx',
        },
      })
      const res = mockResponse()

      controller.getCsv(req, res, null)
      expect(res.sendStatus.mock.calls.length).toBe(1)
      expect(res.sendStatus.mock.calls[0][0]).toBe(400)
    })

    it('rejects invalid days', () => {
      const req = mockRequest({
        query: {
          'start-date': '2021-03-28',
          days: 'x',
        },
      })
      const res = mockResponse()

      controller.getCsv(req, res, null)
      expect(res.sendStatus.mock.calls.length).toBe(1)
      expect(res.sendStatus.mock.calls[0][0]).toBe(400)
    })

    it('Returns CSV', () => {
      const req = mockRequest({
        query: {
          'start-date': '2021-03-28',
          days: '7',
        },
      })
      const res = mockResponse()

      controller.getCsv(req, res, null)

      expect(res.set.mock.calls.length).toBe(1)
      expect(res.set.mock.calls[0]).toEqual([
        'Content-Disposition',
        'attachment;filename=video-link-booking-events-from-2021-03-28-for-7-days.csv',
      ])
    })
  })
})
