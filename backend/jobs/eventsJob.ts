import moment from 'moment'
import WhereaboutsApi from '../api/whereaboutsApi'
import Client from '../api/oauthEnabledClient'
import EventsRetriever from './eventsRetriever'
import TokenSource from './tokenSource'
import EventsPusher from './eventsPusher'
import logger from '../log'
import doesNothing from './configLoader'
// config import must come after configLoader import
import config from '../config'

// Need a call that does nothing to prevent ts from eliding the import.
doesNothing()

const retriever = new EventsRetriever(
  new TokenSource(config.apis.oauth2),
  new WhereaboutsApi(
    new Client({
      baseUrl: config.apis.whereabouts.url,
      timeout: config.apis.whereabouts.timeoutSeconds * 1000,
    })
  )
)

const pusher = new EventsPusher(
  config.apis.googleApi.serviceAccountKey,
  config.jobs.videoLinkBookingEventsExport.spreadsheetId
)

const job = async () => {
  const events = await retriever.retrieveEventsForDay(moment())
  await pusher.pushEvents(events)
}

job().catch(error => logger.error(error))
