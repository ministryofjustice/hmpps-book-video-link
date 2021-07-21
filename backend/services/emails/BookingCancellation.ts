import { BookingDetails, EmailSpec } from '../model'
import { notifications } from '../../config'

export default function BookingCancellation(details: BookingDetails): EmailSpec {
  const personalisation = {
    prisonerName: details.prisonerName,
    offenderNo: details.offenderNo,
    prison: details.prisonName,
    court: details.courtLocation,
    date: details.dateDescription,
    preAppointmentInfo: details.preDetails?.description || 'Not required',
    mainAppointmentInfo: details.mainDetails.description,
    postAppointmentInfo: details.postDetails?.description || 'Not required',
    comments: details.comments || 'None entered',
  }

  return {
    name: 'BookingCancellation',
    agencyId: details.agencyId,
    recipients: [
      {
        recipient: 'vlb',
        template: notifications.bookingCancellationPrison,
        personalisation: () => personalisation,
      },
      {
        recipient: 'omu',
        template: notifications.bookingCancellationPrison,
        personalisation: () => personalisation,
      },
      {
        recipient: 'user',
        template: notifications.bookingCancellationCourt,
        personalisation: (usersName: string) => ({ userName: usersName, ...personalisation }),
      },
    ],
  }
}
