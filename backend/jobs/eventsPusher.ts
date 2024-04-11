import { google, GoogleApis } from 'googleapis'
// eslint-disable-next-line camelcase
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4'
import logger from '../log'

export default class EventsPusher {
  // eslint-disable-next-line camelcase
  private readonly spreadsheets: sheets_v4.Resource$Spreadsheets

  private readonly spreadsheetId: string

  constructor(serviceAccountKey: string, spreadsheetId: string) {
    this.spreadsheets = this.configuredSpreadsheetsApi(this.getCredentials(serviceAccountKey))
    this.spreadsheetId = spreadsheetId
  }

  getCredentials = (serviceAccountKey: string): any => {
    try {
      return JSON.parse(serviceAccountKey)
    } catch (e) {
      // Deliberately obfuscate actual error as may contain creds/key
      throw new Error('An error occurred parsing creds')
    }
  }

  // eslint-disable-next-line camelcase
  configuredSpreadsheetsApi(credentials): sheets_v4.Resource$Spreadsheets {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    google.options({ auth })
    const api: GoogleApis = google
    return api.sheets('v4').spreadsheets
  }

  async pushEvents(events: string[][]): Promise<void> {
    if (events.length < 2 || events[0].length < 1) {
      logger.info(`EventsPusher: Finished. No events to push.`)
      return
    }
    const firstRow = parseInt(events[0][0], 10)
    const range = `A${firstRow + 1}`
    try {
      const result = await this.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          data: [
            {
              range,
              values: events,
            },
          ],
          valueInputOption: 'USER_ENTERED',
        },
      })
      logger.info(result?.data?.responses || 'EventsPusher: Finished. No response from sheets API')
    } catch (error) {
      logger.info(`eventsPusher.pushEvents failed. events[0][0]: ${events[0][0]}`)
      logger.info(`events received: ${events}`)
      logger.info(error)
      throw error
    }
  }
}
