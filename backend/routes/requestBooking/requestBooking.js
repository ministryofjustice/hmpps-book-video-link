const moment = require('moment')
const { DAY_MONTH_YEAR, Time } = require('../../shared/dateHelpers')
const {
  notifications: { requestBookingCourtTemplateVLBAdminId, requestBookingCourtTemplateRequesterId, emails: emailConfig },
} = require('../../config')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const extractObjectFromFlash = ({ req, key }) =>
  req.flash(key).reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )

const getBookingDetails = req => extractObjectFromFlash({ req, key: 'requestBooking' })
const packBookingDetails = (req, data) => req.flash('requestBooking', data)
const requestBookingFactory = ({ logError, notifyApi, oauthApi, prisonApi }) => {
  const sendEmail = ({ templateId, email, personalisation }) =>
    notifyApi.sendEmail(templateId, email, {
      personalisation,
      reference: null,
    })

  const enterOffenderDetails = async (req, res) =>
    res.render('requestBooking/offenderDetails.njk', {
      errors: req.flash('errors'),
      formValues: extractObjectFromFlash({ req, key: 'formValues' }),
    })

  const createBookingRequest = async (req, res) => {
    const { firstName, lastName, dobDay, dobMonth, dobYear, comments } = req.body

    const bookingDetails = getBookingDetails(req)

    if (req.errors) {
      packBookingDetails(req, bookingDetails)
      req.flash('errors', req.errors)
      req.flash('formValues', req.body)
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

    const prisons = await prisonApi.getAgencies(res.locals)
    const matchingPrison = prisons.find(p => p.agencyId === prison)

    const personalisation = {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth.format('D MMMM YYYY'),
      date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
      startTime: Time(startTime),
      endTime: endTime && Time(endTime),
      prison: matchingPrison.formattedDescription || matchingPrison.description,
      hearingLocation,
      comments: comments || 'None entered',
      preHearingStartAndEndTime,
      postHearingStartAndEndTime,
    }

    const { username } = req.session.userDetails
    const { email } = await oauthApi.userEmail(res.locals, username)
    const { name } = await oauthApi.userDetails(res.locals, username)

    packBookingDetails(req, personalisation)

    const { vlb } = emailConfig[prison]

    sendEmail({ templateId: requestBookingCourtTemplateVLBAdminId, email: vlb, personalisation }).catch(error => {
      logError(req.originalUrl, error, 'Failed to email the prison about a booking request')
    })

    sendEmail({
      templateId: requestBookingCourtTemplateRequesterId,
      email,
      personalisation: {
        ...personalisation,
        username: name,
      },
    }).catch(error => {
      logError(req.originalUrl, error, 'Failed to email the requester a copy of the booking')
    })

    return res.redirect('/request-booking/confirmation')
  }

  const confirm = async (req, res) => {
    const requestDetails = getBookingDetails(req)
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
      preAppointmentRequired,
      postAppointmentRequired,
      preHearingStartAndEndTime,
      postHearingStartAndEndTime,
      hearingLocation,
    } = requestDetails

    raiseAnalyticsEvent(
      'VLB Appointments',
      `Video link requested for ${hearingLocation}`,
      `Pre: ${preAppointmentRequired === 'yes' ? 'Yes' : 'No'} | Post: ${
        postAppointmentRequired === 'yes' ? 'Yes' : 'No'
      }`
    )

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
  return {
    createBookingRequest,
    enterOffenderDetails,
    confirm,
  }
}

module.exports = {
  requestBookingFactory,
}
