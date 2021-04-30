import type { CourtDto } from 'courtRegister'

import CourtApi from '../api/courtApi'
import { groupBy } from '../utils'

type CourtsByLetter = Map<string, CourtDto[]>

export = class ManageCourtsService {
  constructor(private readonly courtApi: CourtApi) {}

  private sortAlphabetically(courts: CourtDto[]): CourtDto[] {
    const sortedCourtList = courts.sort((a, b) => a.courtName.localeCompare(b.courtName))
    return sortedCourtList
  }

  private async getSortedCourts(): Promise<CourtDto[]> {
    const courtsList = await this.courtApi.getCourts()
    return this.sortAlphabetically(courtsList)
  }

  public async getCourtsByLetter(): Promise<CourtsByLetter> {
    const courts = await this.getSortedCourts()
    return groupBy(courts, (court: CourtDto) => court.courtName.charAt(0).toUpperCase())
  }
}
