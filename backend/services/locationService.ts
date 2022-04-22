import { Location, Court, CourtEmail } from 'whereaboutsApi'
import type { PrisonApi, WhereaboutsApi } from '../api'
import type ManageCourtsService from './manageCourtsService'
import { Context, Prison } from './model'
import { app } from '../config'
import { RoomFinder, RoomFinderFactory } from './roomFinder'

export = class LocationService {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly manageCourtsService: ManageCourtsService,
    private readonly roomFinderFactory: RoomFinderFactory,
    private readonly whereaboutsApi: WhereaboutsApi
  ) {}

  private transformPrison(prison): Prison {
    return { agencyId: prison.agencyId, description: prison.formattedDescription || prison.description }
  }

  public async createRoomFinder(context: Context, agencyId: string): Promise<RoomFinder> {
    const roomFinder = await this.roomFinderFactory(context, agencyId)
    return roomFinder
  }

  public async getRooms(context: Context, agencyId: string): Promise<Location[]> {
    const roomFinder = await this.roomFinderFactory(context, agencyId)
    return roomFinder.allRooms()
  }

  public async getMatchingPrison(context: Context, prison: string): Promise<Prison> {
    const prisons = await this.prisonApi.getAgencies(context)
    const matchingPrison = prisons.filter(p => p.agencyId === prison).map(this.transformPrison)
    return matchingPrison[0]
  }

  public async getVideoLinkEnabledPrisons(context: Context): Promise<Prison[]> {
    const prisons = await this.prisonApi.getAgencies(context)
    return prisons.filter(prison => app.videoLinkEnabledFor.includes(prison.agencyId)).map(this.transformPrison)
  }

  public async getVideoLinkEnabledCourts(context: Context, userId: string): Promise<Court[]> {
    const courts = await this.manageCourtsService.getSelectedCourts(context, userId)
    return courts
  }

  public async getVideoLinkEnabledCourt(context: Context, courtId: string): Promise<Court> {
    const court = await this.manageCourtsService.getCourt(context, courtId)
    return court
  }

  public async getCourtEmailAddress(context: Context, courtId: string): Promise<CourtEmail> {
    const courtEmailAddress = await this.whereaboutsApi.getCourtEmail(context, courtId)
    return courtEmailAddress
  }
}
