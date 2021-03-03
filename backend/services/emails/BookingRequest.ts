import { RequestEmail, EmailSpec } from '../model'
import { notifications } from '../../config'

export default function BookingRequest(details: RequestEmail): EmailSpec {
  const personalisation = {
    firstName: details.firstName,
    lastName: details.lastName,
    prison: details.prison,
    dateOfBirth: details.dateOfBirth,
    date: details.date,
    startTime: details.startTime,
    endTime: details.endTime,
    preHearingStartAndEndTime: details.preHearingStartAndEndTime || 'Not required',
    postHearingStartAndEndTime: details.postHearingStartAndEndTime || 'Not required',
    comments: details.comments || 'None entered',
    hearingLocation: details.hearingLocation,
  }

  return {
    name: 'BookingRequest',
    agencyId: details.agencyId,
    recipients: [
      {
        recipient: 'vlb',
        template: notifications.requestBookingCourtTemplateVLBAdminId,
        personalisation: () => personalisation,
      },
      {
        recipient: 'user',
        template: notifications.requestBookingCourtTemplateRequesterId,
        personalisation: (usersName: string) => ({ userName: usersName, ...personalisation }),
      },
    ],
  }
}
