import { RequestHandler, Request } from 'express'

export default class ConfirmationController {
  private extractObjectFromFlash({ req, key }) {
    return req.flash(key).reduce(
      (acc, current) => ({
        ...acc,
        ...current,
      }),
      {}
    )
  }

  private getBookingDetails(req: Request) {
    return this.extractObjectFromFlash({ req, key: 'requestBooking' })
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const requestDetails = this.getBookingDetails(req)
      if (!Object.keys(requestDetails).length) throw new Error('Request details are missing')

      const {
        firstName,
        lastName,
        dateOfBirth,
        prison,
        startTime,
        endTime,
        comments,
        date,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
        hearingLocation,
      } = requestDetails

      return res.render('requestBooking/confirmation.njk', {
        details: {
          prison,
          name: `${firstName} ${lastName}`,
          dateOfBirth,
        },
        hearingDetails: {
          date,
          courtHearingStartTime: startTime,
          courtHearingEndTime: endTime,
          comments,
        },
        prePostDetails: {
          'pre-court hearing briefing': preHearingStartAndEndTime,
          'post-court hearing briefing': postHearingStartAndEndTime,
        },
        courtDetails: {
          courtLocation: hearingLocation,
        },
      })
    }
  }
}
