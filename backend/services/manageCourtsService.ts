import type { PreferencesDTO } from 'userPreferences'
import type { Court } from 'whereaboutsApi'

import { Context, UserPreferenceCourt } from './model'

import UserCourtPreferencesApi from '../api/userCourtPreferencesApi'
import { groupBy } from '../utils'
import WhereaboutsApi from '../api/whereaboutsApi'

export type CourtsByLetter = Map<string, UserPreferenceCourt[]>

export default class ManageCourtsService {
  constructor(
    private readonly whereaboutsApi: WhereaboutsApi,
    private readonly userCourtPreferencesApi: UserCourtPreferencesApi
  ) {}

  private sortAlphabetically(courts: UserPreferenceCourt[]): UserPreferenceCourt[] {
    return courts.sort((a, b) => a.name.localeCompare(b.name))
  }

  public async getSortedCourts(context: Context, userId: string): Promise<UserPreferenceCourt[]> {
    const courtsList = await this.whereaboutsApi.getCourts(context)
    const preferredCourts = await this.userCourtPreferencesApi.getUserPreferredCourts(context, userId)
    return this.sortAlphabetically(
      courtsList.map(court => ({
        ...court,
        isSelected: preferredCourts.items.includes(court.id),
      }))
    )
  }

  public async getCourtsByLetter(context: Context, userId: string): Promise<CourtsByLetter> {
    const courts = await this.getSortedCourts(context, userId)
    return groupBy(courts, (court: UserPreferenceCourt) => court.name.charAt(0).toUpperCase())
  }

  public async getSelectedCourts(context: Context, userId: string): Promise<UserPreferenceCourt[]> {
    const courts = await this.getSortedCourts(context, userId)
    return courts.filter(court => court.isSelected)
  }

  public async getCourt(context: Context, courtId: string): Promise<Court> {
    const courts = await this.whereaboutsApi.getCourts(context)
    return courts.find(c => c.id === courtId)
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
