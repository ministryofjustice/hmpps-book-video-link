import type { CourtDto } from 'courtRegister'
import type { PreferencesDTO } from 'userPreferences'
import { Context } from './model'

import CourtApi from '../api/courtApi'
import UserCourtPreferencesApi from '../api/userCourtPreferencesApi'
import { groupBy } from '../utils'

type CourtsByLetter = Map<string, CourtDto[]>

type UserPreferenceCourts = CourtDto & selected

export = class ManageCourtsService {
  constructor(private readonly courtApi: CourtApi, private readonly userCourtPreferencesApi: UserCourtPreferencesApi) {}

  private sortAlphabetically(courts: CourtDto[]): CourtDto[] {
    const sortedCourtList = courts.sort((a, b) => a.courtName.localeCompare(b.courtName))
    return sortedCourtList
  }

  private async getSortedCourts(userId: string): Promise<UserPreferenceCourts[]> {
    const courtsList = await this.courtApi.getCourts()
    const preferredCourts = await this.userCourtPreferencesApi.getUserPreferredCourts(userId)
    const mergedCourts = courtsList.map(court =>
      preferredCourts.items.includes(court.courtId) ? (court.selected = true) : null
    )

    return this.sortAlphabetically(mergedCourts)
  }

  public async getCourtsByLetter(userId: string): Promise<CourtsByLetter> {
    const courts = await this.getSortedCourts(userId)
    return groupBy(courts, (court: CourtDto) => court.courtName.charAt(0).toUpperCase())
  }

  public async getUserPreferredCourts(userId: string): Promise<PreferencesDTO> {
    const userPreferredCourtsList = await this.userCourtPreferencesApi.getUserPreferredCourts(userId)
    return userPreferredCourtsList
  }

  public async updateUserPreferredCourts(
    context: Context,
    userId: string,
    preferredCourts: string[]
  ): Promise<PreferencesDTO> {
    const userPreferredCourtsList = await this.userCourtPreferencesApi.putUserPreferredCourts(
      context,
      userId,
      preferredCourts
    )
    return userPreferredCourtsList
  }
}
