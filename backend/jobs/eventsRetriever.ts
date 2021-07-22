import { Moment } from 'moment'
import parse from 'csv-parse'
import logger from '../log'

import WhereaboutsApi from '../api/whereaboutsApi'
import TokenSource from './tokenSource'

export default class EventsRetriever {
  private readonly tokenSource: TokenSource

  private readonly whereaboutsApi: WhereaboutsApi

  constructor(tokenSource: TokenSource, whereaboutsApi: WhereaboutsApi) {
    this.tokenSource = tokenSource
    this.whereaboutsApi = whereaboutsApi
  }

  async retrieveEventsForDay(day: Moment): Promise<string[][]> {
    const tokens = await this.tokenSource.getTokens()
    const parser = parse({
      delimiter: ',',
      // line 1 contains the column headers. Ignore this line and start at line 2
      from: 2,
    })
    const records: string[][] = []
    this.whereaboutsApi.getVideoLinkBookingEvents(tokens, parser, day.startOf('day'), 1)
    // eslint-disable-next-line no-restricted-syntax
    for await (const record of parser) {
      records.push(record)
    }
    logger.info(`Retrieved ${records.length} events for ${day}`)
    return records
  }
}
