import moment from 'moment'
import { Readable } from 'stream'
import EventsRetriever from './eventsRetriever'
import WhereaboutsApi from '../api/whereaboutsApi'
import TokenSource from './tokenSource'

jest.mock('../api/whereaboutsApi')
jest.mock('./tokenSource')

const whereaboutsApi = new WhereaboutsApi(null) as jest.Mocked<WhereaboutsApi>
const tokenSource = new TokenSource(null) as jest.Mocked<TokenSource>

let eventsRetriever: EventsRetriever

describe('test', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    eventsRetriever = new EventsRetriever(tokenSource, whereaboutsApi)
  })

  it('Retrieves events as nested arrays', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    tokenSource.getTokens.mockResolvedValue(tokens)
    whereaboutsApi.getVideoLinkBookingEvents.mockImplementation((c, writable, m, d) => {
      Readable.from('a,b,c\n1,2,3\n4,5,6').pipe(writable)
      return Promise.resolve()
    })

    const events = await eventsRetriever.retrieveEventsForDay(moment('2021-07-01 09:01:01'))

    expect(events).toStrictEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])

    const call = whereaboutsApi.getVideoLinkBookingEvents.mock.calls[0]
    expect(call[0]).toStrictEqual(tokens)

    expect(
      moment({ year: 2021, month: 6, day: 1, hour: 0, minute: 0, seconds: 0, milliseconds: 0 }).isSame(call[2])
    ).toBe(true)
    expect(call[3]).toBe(1)
  })

  it('Handles no events', async () => {
    const tokens = { access_token: 'at', refresh_token: 'rt' }
    tokenSource.getTokens.mockResolvedValue(tokens)
    whereaboutsApi.getVideoLinkBookingEvents.mockImplementation((c, writable, m, d) => {
      Readable.from('a,b,c\n').pipe(writable)
      return Promise.resolve()
    })

    const events = await eventsRetriever.retrieveEventsForDay(moment('2021-07-01'))
    expect(events).toStrictEqual([])
  })
})
