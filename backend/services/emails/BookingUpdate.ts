import { EmailSpec, UpdateEmail } from '../model'
import { notifications } from '../../config'

export default function BookingUpdate(details: UpdateEmail): EmailSpec {
  const personalisation = {
    prisonerName: details.prisonerName,
    offenderNo: details.offenderNo,
    prison: details.prisonName,
    date: details.dateDescription,
    preAppointmentInfo: details.preDescription || 'Not required',
    mainAppointmentInfo: details.mainDescription,
    postAppointmentInfo: details.postDescription || 'Not required',
    comments: details.comments || 'None entered',
  }

  return {
    name: 'BookingUpdate',
    agencyId: details.agencyId,
    recipients: [
      {
        recipient: 'vlb',
        template: notifications.bookingUpdateConfirmationPrison,
        personalisation: () => ({ court: details.courtLocation, ...personalisation }),
      },
      {
        recipient: 'omu',
        template: notifications.bookingUpdateConfirmationPrison,
        personalisation: () => ({ court: details.courtLocation, ...personalisation }),
      },
      {
        recipient: 'user',
        template: notifications.bookingUpdateConfirmationCourt,
        personalisation: (usersName: string) => ({ userName: usersName, ...personalisation }),
      },
    ],
  }
}
