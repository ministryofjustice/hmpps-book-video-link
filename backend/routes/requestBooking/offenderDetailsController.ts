import { RequestHandler, Request } from 'express'
import moment from 'moment'
import { DAY_MONTH_YEAR, Time } from '../../shared/dateHelpers'
import type LocationService from '../../services/locationService'
import type NotificationService from '../../services/notificationService'

export default class OffenderDetailsController {
  public constructor(
    private readonly locationService: LocationService,
    private readonly notificationService: NotificationService
  ) {}

  private extractObjectFromFlash({ req, key }) {
    return req.flash(key).reduce(
      (acc, current) => ({
        ...acc,
        ...current,
      }),
      {}
    )
  }

  private packBookingDetails(req: Request, data?) {
    return req.flash('requestBooking', data)
  }

  private getBookingDetails(req: Request) {
    return this.extractObjectFromFlash({ req, key: 'requestBooking' })
  }

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('requestBooking/offenderDetails.njk', {
        errors: req.flash('errors'),
        formValues: this.extractObjectFromFlash({ req, key: 'input' }),
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { firstName, lastName, dobDay, dobMonth, dobYear, comments } = req.body
      const bookingDetails = this.getBookingDetails(req)

      if (req.errors) {
        this.packBookingDetails(req, bookingDetails)
        req.flash('errors', req.errors)
        req.flash('input', req.body)
        return res.redirect('/request-booking/enter-offender-details')
      }

      const {
        date,
        startTime,
        endTime,
        prison,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
        hearingLocation,
      } = bookingDetails

      const dateOfBirth = moment({
        day: dobDay,
        month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1,
        year: dobYear,
      })

      const matchingPrison = await this.locationService.getMatchingPrison(res.locals, prison)

      const personalisation = {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.format('D MMMM YYYY'),
        date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
        startTime: Time(startTime),
        endTime: endTime && Time(endTime),
        agencyId: prison,
        prison: matchingPrison.description,
        hearingLocation,
        comments,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      }

      this.packBookingDetails(req, personalisation)

      const { username } = req.session.userDetails
      await this.notificationService.sendBookingRequestEmails(res.locals, username, personalisation)

      return res.redirect('/request-booking/confirmation')
    }
  }
}
