import type { Context, AvailabilityRequest, SelectedRooms, AvailabilityStatus } from './model'

export default interface AvailabilityStatusChecker {
  getAvailabilityStatus(
    context: Context,
    request: AvailabilityRequest,
    selectedRooms: SelectedRooms
  ): Promise<AvailabilityStatus>
}
