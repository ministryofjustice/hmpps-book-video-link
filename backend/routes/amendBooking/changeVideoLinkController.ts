import { RequestHandler } from 'express'
import type BookingService from '../../services/bookingService'
import LocationService from '../../services/locationService'

import { DAY_MONTH_YEAR, Hours, Minutes, HOURS_TIME, MINUTES_TIME } from '../../shared/dateHelpers'
import { ChangeVideoLinkBooking, toFormValues } from './forms'
import { clearUpdate, setUpdate, getUpdate } from './state'
import { AvailabilityCheckService } from '../../services'

export default class ChangeVideoLinkController {
  public constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityCheckService: AvailabilityCheckService,
    private readonly locationService: LocationService
  ) {}

  public start(): RequestHandler {
    return (req, res) => {
      const { bookingId } = req.params
      clearUpdate(res)
      return res.redirect(`/change-video-link/${bookingId}`)
    }
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      const { username } = res.locals.user

      const errors = req.flash('errors') || []
      const [input] = req.flash('input')

      const update = getUpdate(req)

      const [bookingDetails, courts] = await Promise.all([
        this.bookingService.get(res.locals, parseInt(bookingId, 10)),
        this.locationService.getVideoLinkEnabledCourts(res.locals, username),
      ])

      const rooms = await this.locationService.getRooms(res.locals, bookingDetails.agencyId)

      const currentBookingDetails = update
        ? toFormValues(update)
        : {
            date: bookingDetails.date.format(DAY_MONTH_YEAR),
            courtId: bookingDetails.courtId,
            startTimeHours: Hours(bookingDetails.mainDetails.startTime),
            startTimeMinutes: Minutes(bookingDetails.mainDetails.startTime),
            endTimeHours: Hours(bookingDetails.mainDetails.endTime),
            endTimeMinutes: Minutes(bookingDetails.mainDetails.endTime),
            preLocation: bookingDetails.preDetails?.locationId,
            mainLocation: bookingDetails.mainDetails.locationId,
            postLocation: bookingDetails.postDetails?.locationId,
            preRequired: bookingDetails.preDetails ? 'true' : 'false',
            postRequired: bookingDetails.postDetails ? 'true' : 'false',
          }

      return res.render('amendBooking/changeVideoLinkBooking.njk', {
        errors,
        courts: courts.map(c => ({ value: c.id, text: c.name })),
        rooms,
        bookingId,
        agencyId: bookingDetails.agencyId,
        prisoner: {
          name: bookingDetails.prisonerName,
        },
        locations: {
          prison: bookingDetails.prisonName,
        },
        form: input || currentBookingDetails,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { bookingId } = req.params
      if (req.errors) {
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect(`/change-video-link/${bookingId}`)
      }

      const form = ChangeVideoLinkBooking(req.body)

      const { isAvailable } = await this.availabilityCheckService.getAvailability(res.locals, {
        videoBookingId: parseInt(bookingId, 10),
        ...form,
      })

      setUpdate(res, form)

      return res.redirect(
        isAvailable ? `/confirm-updated-booking/${bookingId}` : `/video-link-not-available/${bookingId}`
      )
    }
  }
}
