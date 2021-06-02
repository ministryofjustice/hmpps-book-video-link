import type { PreferencesDTO } from 'userPreferences'
import { Context } from './model'

import UserCourtPreferencesApi from '../api/userCourtPreferencesApi'
import { groupBy } from '../utils'
import WhereaboutsApi from '../api/whereaboutsApi'

export type CourtsByLetter = Map<string, UserPreferenceCourt[]>

export type UserPreferenceCourt = {
  courtName: string
  courtId: string
  isSelected?: boolean
}

export default class ManageCourtsService {
  constructor(
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly userCourtPreferencesApi: UserCourtPreferencesApi
  ) {}

  private sortAlphabetically(courts: UserPreferenceCourt[]): UserPreferenceCourt[] {
    return courts.sort((a, b) => a.courtName.localeCompare(b.courtName))
  }

  public async getSortedCourts(context: Context, userId: string): Promise<UserPreferenceCourt[]> {
    const courtsList = await this.whereaboutsApi.getCourts(context)
    const preferredCourts = await this.userCourtPreferencesApi.getUserPreferredCourts(context, userId)
    return this.sortAlphabetically(
      courtsList.map(court => ({
        courtId: court.id,
        courtName: court.name,
        isSelected: preferredCourts.items.includes(court.id),
      }))
    )
  }

  public async getCourtsByLetter(context: Context, userId: string): Promise<CourtsByLetter> {
    const courts = await this.getSortedCourts(context, userId)
    return groupBy(courts, (court: UserPreferenceCourt) => court.courtName.charAt(0).toUpperCase())
  }

  public async getSelectedCourts(context: Context, userId: string): Promise<UserPreferenceCourt[]> {
    const courts = await this.getSortedCourts(context, userId)
    return courts.filter(court => court.isSelected)
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
