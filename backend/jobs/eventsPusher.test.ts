import doesNothing from './configLoader'
import config from '../config'
import EventsPusher from './eventsPusher'

doesNothing()

describe('EventsPusher', () => {
  it('pushes to spreadsheet', async () => {
    const pusher = new EventsPusher(
      config.apis.googleApi.serviceAccountKey,
      config.jobs.videoLinkBookingEventsExport.spreadsheetId
    )

    await pusher.pushEvents([['1', 'a', 'true']])
  })
})
