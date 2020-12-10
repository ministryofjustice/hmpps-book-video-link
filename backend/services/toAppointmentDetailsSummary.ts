import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC, Time } from '../shared/dateHelpers'
import { properCaseName } from '../utils'

interface AppointmentDetails {
  firstName: string
  lastName: string
  location?: string
  startTime: string
  endTime?: string
  comment?: string
  agencyDescription: string
  court?: string
}

interface AppointmentDetailsSummary {
  prisonerName: string
  prison: string
  location: string | undefined
  date: string
  startTime: string
  endTime: string | undefined
  comment: string | undefined
  court: string | undefined
}

export = function toAppointmentDetailsSummary({
  firstName,
  lastName,
  location,
  startTime,
  endTime,
  comment,
  agencyDescription,
  court,
}: AppointmentDetails): AppointmentDetailsSummary {
  return {
    prisonerName: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
    prison: agencyDescription,
    location,
    date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
    startTime: Time(startTime),
    endTime: endTime && Time(endTime),
    comment,
    court,
  }
}
