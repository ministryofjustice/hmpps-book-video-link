import { RequestHandler } from 'express'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../shared/dateHelpers'
import toAppointmentDetailsSummary from '../../services/toAppointmentDetailsSummary'
import PrisonApi from '../../api/prisonApi'
import LocationService from '../../services/locationService'
import { getPostAppointmentInterval, getPreAppointmentInterval } from '../../services/bookingTimes'

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

export default class SelectCourtController {
  constructor(private readonly locationService: LocationService, private readonly prisonApi: PrisonApi) {}

  public view: RequestHandler = async (req, res) => {
    const appointmentDetails = unpackAppointmentDetails(req)
    const { offenderNo, agencyId } = req.params

    const [offenderDetails, agencyDetails, courts] = await Promise.all([
      this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
      this.prisonApi.getAgencyDetails(res.locals, agencyId),
      this.locationService.getVideoLinkEnabledCourts(res.locals),
    ])

    const { firstName, lastName } = offenderDetails
    const { startTime, endTime, preAppointmentRequired, postAppointmentRequired } = appointmentDetails

    req.flash('appointmentDetails', appointmentDetails)

    const details = toAppointmentDetailsSummary({
      firstName,
      lastName,
      startTime,
      endTime,
      agencyDescription: agencyDetails.description,
    })

    const getPreHearingStartAndEndTime = () => {
      if (preAppointmentRequired !== 'yes') return undefined
      const { start: preStart, end: preEnd } = getPreAppointmentInterval(moment(startTime, DATE_TIME_FORMAT_SPEC))
      return `${preStart} to ${preEnd}`
    }

    const getPostHearingStartAndEndTime = () => {
      if (postAppointmentRequired !== 'yes') return undefined
      const { start: postStart, end: postEnd } = getPostAppointmentInterval(moment(endTime, DATE_TIME_FORMAT_SPEC))
      return `${postStart} to ${postEnd}`
    }

    return res.render('createBooking/selectCourt.njk', {
      courts,
      offender: {
        name: details.prisonerName,
        prison: details.prison,
      },
      details: {
        date: details.date,
        courtHearingStartTime: details.startTime,
        courtHearingEndTime: details.endTime,
      },
      prePostData: {
        'pre-court hearing briefing': getPreHearingStartAndEndTime(),
        'post-court hearing briefing': getPostHearingStartAndEndTime(),
      },
      errors: req.flash('errors'),
    })
  }

  public submit: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const { court } = req.body
    const appointmentDetails = unpackAppointmentDetails(req)

    if (req.errors) {
      req.flash('appointmentDetails', appointmentDetails)
      req.flash('errors', req.errors)
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-court`)
    }

    req.flash('appointmentDetails', { ...appointmentDetails, court })

    return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
  }
}
