import moment from 'moment'
import { RequestHandler } from 'express'

import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } from '../../shared/dateHelpers'
import toAppointmentDetailsSummary from '../../services/toAppointmentDetailsSummary'
import { AvailabilityRequest } from '../../services/model'
import { RoomAndComment } from './dtos'
import type { AvailabilityCheckService, BookingService } from '../../services'
import type PrisonApi from '../../api/prisonApi'

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

  return appointmentDetails.reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )
}

function parseAvailabilityRequest(agencyId: string, obj: Record<string, unknown>): AvailabilityRequest {
  return {
    agencyId,
    date: moment(obj.date, DAY_MONTH_YEAR, true),
    startTime: moment(obj.startTime, DATE_TIME_FORMAT_SPEC, true),
    endTime: moment(obj.endTime, DATE_TIME_FORMAT_SPEC, true),
    preRequired: obj.preAppointmentRequired === 'yes',
    postRequired: obj.postAppointmentRequired === 'yes',
  }
}

const packAppointmentDetails = (req, details) => {
  req.flash('appointmentDetails', details)
}

export default class SelectRoomsController {
  constructor(
    private readonly prisonApi: PrisonApi,
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: AvailabilityCheckService
  ) {}

  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const appointmentDetails = unpackAppointmentDetails(req)
    const { startTime, endTime, preAppointmentRequired, postAppointmentRequired } = appointmentDetails

    const [offenderDetails, agencyDetails] = await Promise.all([
      this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
      this.prisonApi.getAgencyDetails(res.locals, agencyId),
    ])
    const { firstName, lastName } = offenderDetails

    const agencyDescription = agencyDetails.description

    const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

    const availabilityRequest = parseAvailabilityRequest(agencyId, appointmentDetails)

    const {
      rooms: { pre, main, post },
    } = await this.availabilityCheckService.getAvailability(res.locals, availabilityRequest)

    packAppointmentDetails(req, appointmentDetails)

    const [input] = req.flash('input')
    const form = input ? RoomAndComment(input) : {}

    res.render('createBooking/selectRooms.njk', {
      mainLocations: main,
      preLocations: pre,
      postLocations: post,
      date,
      details: toAppointmentDetailsSummary({
        firstName,
        lastName,
        startTime,
        endTime,
        agencyDescription,
      }),
      preAppointmentRequired: preAppointmentRequired === 'yes',
      postAppointmentRequired: postAppointmentRequired === 'yes',
      errors: req.flash('errors') || [],
      form,
    })
  }

  public submit: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const appointmentDetails = unpackAppointmentDetails(req)

    if (req.errors) {
      req.flash('errors', req.errors)
      req.flash('input', req.body)
      packAppointmentDetails(req, appointmentDetails)
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
    }

    const { startTime, endTime, court } = appointmentDetails
    const { preLocation, mainLocation, postLocation, comment } = req.body

    packAppointmentDetails(req, {
      ...appointmentDetails,
      locationId: mainLocation,
      comment,
    })

    const { username } = req.session.userDetails

    const videoBookingId = await this.bookingService.create(res.locals, username, {
      offenderNo,
      agencyId,
      court,
      mainStartTime: moment(startTime, DATE_TIME_FORMAT_SPEC),
      mainEndTime: moment(endTime, DATE_TIME_FORMAT_SPEC),
      pre: preLocation ? Number(preLocation) : undefined,
      main: Number(mainLocation),
      post: postLocation ? Number(postLocation) : undefined,
      comment,
    })

    return res.redirect(`/offenders/${offenderNo}/confirm-appointment/${videoBookingId}`)
  }
}
