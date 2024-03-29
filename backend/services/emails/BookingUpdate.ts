import { EmailSpec, UpdateEmail } from '../model'
import { notifications } from '../../config'

export default function BookingUpdate(details: UpdateEmail): EmailSpec {
  const personalisation = {
    prisonerName: details.prisonerName,
    offenderNo: details.offenderNo,
    prison: details.prisonName,
    court: details.courtLocation,
    date: details.dateDescription,
    preAppointmentInfo: details.preDescription || 'Not required',
    mainAppointmentInfo: details.mainDescription,
    postAppointmentInfo: details.postDescription || 'Not required',
    comments: details.comments || 'None entered',
    courtEmailAddress: details.courtEmailAddress,
  }

  return {
    name: 'BookingUpdate',
    agencyId: details.agencyId,
    recipients: [
      {
        recipient: 'vlb',
        template: details.courtEmailAddress
          ? notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress
          : notifications.bookingUpdateConfirmationPrison,
        personalisation: () => personalisation,
      },
      {
        recipient: 'omu',
        template: details.courtEmailAddress
          ? notifications.bookingUpdateConfirmationPrisonWithCourtEmailAddress
          : notifications.bookingUpdateConfirmationPrison,
        personalisation: () => personalisation,
      },
      {
        recipient: 'user',
        template: notifications.bookingUpdateConfirmationCourt,
        personalisation: (usersName: string) => ({ userName: usersName, ...personalisation }),
      },
    ],
  }
}
