import moment from 'moment'
import EventsRetriever from './eventsRetriever'
import doesNothing from './configLoader'
import config from '../config'
import WhereaboutsApi from '../api/whereaboutsApi'
import Client from '../api/oauthEnabledClient'
import TokenSource from './tokenSource'

doesNothing()

const { oauth2 } = config.apis

describe('test', () => {
  it('happy flow', async () => {
    const whereaboutsApi = new WhereaboutsApi(
      new Client({
        baseUrl: config.apis.whereabouts.url,
        timeout: config.apis.whereabouts.timeoutSeconds * 1000,
      })
    )

    const tokenSource = new TokenSource(oauth2)
    const er = new EventsRetriever(tokenSource, whereaboutsApi)
    const records = await er.retrieveEventsForDay(moment())

    records.forEach(record => {
      record.forEach(col => process.stdout.write(`${col}, `))
      process.stdout.write('\n')
    })
  })
})
