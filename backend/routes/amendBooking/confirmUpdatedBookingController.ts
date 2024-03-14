import { RequestHandler } from 'express'
import moment from 'moment'
import type { BookingService, LocationService } from '../../services'
import { getUpdate, clearUpdate } from './state'
import { DATE_ONLY_LONG_FORMAT_SPEC, MOMENT_TIME } from '../../shared/dateHelpers'
import { formatTimes, postAppointmentTimes, preAppointmentTimes } from '../../services/bookingTimes'

export default class CheckAndConfirmYourBookingController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly locationService: LocationService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const errors = req.flash('errors') || []
      const [input] = req.flash('input')

      const update = getUpdate(req)

      const bookingDetails = await this.bookingService.get(res.locals, parseInt(bookingId, 10))

      const courtUpdate = await this.locationService.getVideoLinkEnabledCourt(res.locals, update.courtId)

      const roomFinder = await this.locationService.createRoomFinder(res.locals, bookingDetails.agencyId)

      const comment = input ? input.comment : bookingDetails.comments

      const today = moment().startOf('day')
      const tomorrow = today.clone().add(1, 'day')
      const twoDaysFromNow = today.clone().add(2, 'day')
      const fifteenHrsToday = today.clone().set({ hour: 15, minute: 0 })

      return res.render('amendBooking/confirmUpdatedBooking.njk', {
        errors,
        update,
        bookingId,
        bookingDetails: {
          details: {
            name: bookingDetails.prisonerName,
            prison: bookingDetails.prisonName,
            courtLocation: courtUpdate.name,
          },
          hearingDetails: {
            date: update.date.format(DATE_ONLY_LONG_FORMAT_SPEC),
            mainCourtHearingTime: `${update.startTime.format(MOMENT_TIME)} to ${update.endTime.format(MOMENT_TIME)}`,
            prisonRoomForCourtHearing: roomFinder.prisonRoom(update.mainLocation),
            'pre-court hearing briefing': update.preRequired && formatTimes(preAppointmentTimes(update.startTime)),
            'prison room for pre-court hearing briefing': roomFinder.prisonRoom(update.preLocation),
            'post-court hearing briefing': update.postRequired && formatTimes(postAppointmentTimes(update.endTime)),
            'prison room for post-court hearing briefing': roomFinder.prisonRoom(update.postLocation),
          },
        },
        comment,
        changeBookingLink: `/change-video-link/${bookingId}`,
        warnPrison:
          update.date.isBefore(tomorrow) || (moment().isAfter(fifteenHrsToday) && update.date.isBefore(twoDaysFromNow)),
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(`/confirm-updated-booking/${bookingId}`)
      }

      const update = getUpdate(req)
      const { comment } = req.body

      const status = await this.bookingService.update(
        res.locals,
        req.session.userDetails.username,
        parseInt(bookingId, 10),
        { ...update, comment }
      )

      switch (status) {
        case 'AVAILABLE': {
          clearUpdate(res)
          return res.redirect(`/video-link-change-confirmed/${bookingId}`)
        }
        case 'NOT_AVAILABLE': {
          return res.redirect(`/room-no-longer-available/${bookingId}`)
        }
        default:
          throw Error(`Unrecognised status: ${status}`)
      }
    }
  }
}
