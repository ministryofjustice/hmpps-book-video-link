import type { Agency } from 'prisonApi'

import PrisonApi from '../api/prisonApi'
import { Context } from './model'
import { groupBy } from '../utils'

type CourtsByLetter = Map<string, Agency[]>

export = class ManageCourtsService {
  constructor(private readonly prisonApi: PrisonApi) {}

  private sortAlphabetically(courts: Agency[]): Agency[] {
    const sortedCourtList = courts.sort((a, b) => a.description.localeCompare(b.description))
    return sortedCourtList
  }

  private async getSortedCourts(context: Context): Promise<Agency[]> {
    const courtsList = await this.prisonApi.getCourts(context)
    return this.sortAlphabetically(courtsList)
  }

  public async getCourtsByLetter(context: Context): Promise<CourtsByLetter> {
    const courts = await this.getSortedCourts(context)
    return groupBy(courts, (court: Agency) => court.description.charAt(0).toUpperCase())
  }
}
