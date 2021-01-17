import moment from 'moment'
import { RequestHandler } from 'express'

import { AvailabilityRequest, Room } from '../services/model'
import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../shared/dateHelpers'
import { Services } from '../services'

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')
  const [details] = appointmentDetails.slice(-1)
  return details
}

function parseFlash(agencyId: string, obj: Record<string, unknown>): AvailabilityRequest {
  return {
    agencyId,
    date: moment(obj.date, DAY_MONTH_YEAR, true),
    startTime: moment(obj.startTime, DATE_TIME_FORMAT_SPEC, true),
    endTime: moment(obj.endTime, DATE_TIME_FORMAT_SPEC, true),
    preRequired: obj.preAppointmentRequired === 'yes',
    postRequired: obj.postAppointmentRequired === 'yes',
  }
}

const selectedRoomExists = (selectedRoom: string, possibleRooms: Room[]): boolean =>
  selectedRoom ? possibleRooms.some(room => room.value === Number(selectedRoom)) : true

export default function createCheckAvailability({ availabilityCheckService }: Services): RequestHandler {
  return async (req, res, next) => {
    const appointmentDetails = unpackAppointmentDetails(req)
    const { offenderNo, agencyId } = req.params
    const { selectPreAppointmentLocation, selectMainAppointmentLocation, selectPostAppointmentLocation } = req.body

    const request = parseFlash(agencyId, appointmentDetails)

    const { isAvailable, rooms, totalInterval } = await availabilityCheckService.getAvailability(res.locals, request)

    if (!isAvailable) {
      return res.render('createBooking/noAvailabilityForDateTime.njk', {
        date: request.startTime.format('dddd D MMMM YYYY'),
        startTime: totalInterval.start,
        endTime: totalInterval.end,
        continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment`,
      })
    }

    if (
      !selectedRoomExists(selectPreAppointmentLocation, rooms.pre) ||
      !selectedRoomExists(selectMainAppointmentLocation, rooms.main) ||
      !selectedRoomExists(selectPostAppointmentLocation, rooms.post)
    ) {
      req.flash('appointmentDetails', appointmentDetails)
      return res.render('createBooking/roomNoLongerAvailable.njk', {
        continueLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`,
      })
    }

    req.flash('appointmentDetails', appointmentDetails)
    return next()
  }
}
