import { RequestHandler } from 'express'
import { Time } from '../../shared/dateHelpers'
import PrisonApi from '../../api/prisonApi'
import LocationService from '../../services/locationService'
import { formatTimes, postAppointmentTimes, preAppointmentTimes } from '../../services/bookingTimes'
import { DateAndTimeAndCourtCodec, DateAndTimeCodec, getNewBooking, setNewBooking } from './state'
import { formatName } from '../../utils'

export default class SelectCourtController {
  constructor(private readonly locationService: LocationService, private readonly prisonApi: PrisonApi) {}

  public view: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const [offenderDetails, agencyDetails, courts] = await Promise.all([
      this.prisonApi.getPrisonerDetails(res.locals, offenderNo),
      this.prisonApi.getAgencyDetails(res.locals, agencyId),
      this.locationService.getVideoLinkEnabledCourts(res.locals),
    ])

    const { firstName, lastName } = offenderDetails
    const { startTime, endTime, preRequired, postRequired } = getNewBooking(req, DateAndTimeCodec)

    return res.render('createBooking/selectCourt.njk', {
      courts,
      offender: {
        name: formatName(firstName, lastName),
        prison: agencyDetails.description,
      },
      details: {
        date: startTime.format('D MMMM YYYY'),
        courtHearingStartTime: Time(startTime),
        courtHearingEndTime: Time(endTime),
      },
      prePostData: {
        'pre-court hearing briefing': preRequired ? formatTimes(preAppointmentTimes(startTime)) : undefined,
        'post-court hearing briefing': postRequired ? formatTimes(postAppointmentTimes(endTime)) : undefined,
      },
      errors: req.flash('errors'),
    })
  }

  public submit: RequestHandler = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const { court } = req.body

    if (req.errors) {
      req.flash('errors', req.errors)
      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-court`)
    }

    const dateAndTime = getNewBooking(req, DateAndTimeCodec)
    setNewBooking(res, DateAndTimeAndCourtCodec, { ...dateAndTime, court })

    return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms`)
  }
}
