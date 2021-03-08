import { EmailSpec, CreateEmail } from '../model'
import { notifications } from '../../config'
import { DATE_ONLY_LONG_FORMAT_SPEC } from '../../shared/dateHelpers'

export default function BookingCreation(details: CreateEmail): EmailSpec {
  const personalisation = {
    comments: details.comment || 'None entered',
    prisonerName: details.prisonerName,
    offenderNo: details.offenderNo,
    preAppointmentInfo: details.preDetails || 'Not required',
    mainAppointmentInfo: details.mainDetails,
    postAppointmentInfo: details.postDetails || 'Not required',
    date: details.date.format(DATE_ONLY_LONG_FORMAT_SPEC),
    prison: details.prison,
  }

  return {
    name: 'BookingCreation',
    agencyId: details.agencyId,
    recipients: [
      {
        recipient: 'vlb',
        template: notifications.bookingCreationConfirmationPrison,
        personalisation: () => ({ court: details.court, ...personalisation }),
      },
      {
        recipient: 'omu',
        template: notifications.bookingCreationConfirmationPrison,
        personalisation: () => ({ court: details.court, ...personalisation }),
      },
      {
        recipient: 'user',
        template: notifications.bookingCreationConfirmationCourt,
        personalisation: (usersName: string) => ({ userName: usersName, ...personalisation }),
      },
    ],
  }
}
