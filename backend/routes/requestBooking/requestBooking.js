const moment = require('moment')
const { buildDate, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../shared/dateHelpers')
const {
  notifications: { requestBookingCourtTemplateVLBAdminId, requestBookingCourtTemplateRequesterId, emails: emailConfig },
  app: { videoLinkEnabledFor },
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
const findBookingDetails = req => {
  try {
    return getBookingDetails(req)
  } catch (error) {
    if (error.status === 500) {
      return undefined
    }
    throw error
  }
}

const requestBookingFactory = ({ logError, notifyApi, whereaboutsApi, oauthApi, prisonApi }) => {
  const sendEmail = ({ templateId, email, personalisation }) =>
    notifyApi.sendEmail(templateId, email, {
      personalisation,
      reference: null,
    })

  const getVideoLinkEnabledPrisons = async locals => {
    const prisons = await prisonApi.getAgencies(locals)

    return prisons
      .filter(prison => videoLinkEnabledFor.includes(prison.agencyId))
      .map(vlp => ({
        agencyId: vlp.agencyId,
        description: vlp.formattedDescription || vlp.description,
      }))
  }

  const startOfJourney = async (req, res) => {
    const prisonDropdownValues = (await getVideoLinkEnabledPrisons(res.locals)).map(prison => ({
      text: prison.description,
      value: prison.agencyId,
    }))
    return res.render('requestBooking/requestBooking.njk', {
      prisons: prisonDropdownValues,
    })
  }

  const checkAvailability = async (req, res) => {
    const {
      prison,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      preAppointmentRequired,
      postAppointmentRequired,
    } = req.body

    const startTime = buildDate(date, startTimeHours, startTimeMinutes)
    const endTime = buildDate(date, endTimeHours, endTimeMinutes)

    if (req.errors) {
      packBookingDetails(req)
      const prisonDropdownValues = (await getVideoLinkEnabledPrisons(res.locals)).map(p => ({
        text: p.description,
        value: p.agencyId,
      }))
      return res.render('requestBooking/requestBooking.njk', {
        errors: req.errors,
        prisons: prisonDropdownValues,
        formValues: req.body,
      })
    }

    packBookingDetails(req, {
      prison,
      date,
      startTime: moment(startTime).format(DATE_TIME_FORMAT_SPEC),
      endTime: endTime && moment(endTime).format(DATE_TIME_FORMAT_SPEC),
      preAppointmentRequired,
      postAppointmentRequired,
    })

    return res.redirect('/request-booking/select-court')
  }

  const enterOffenderDetails = async (req, res) =>
    res.render('requestBooking/offenderDetails.njk', {
      errors: req.flash('errors'),
      formValues: extractObjectFromFlash({ req, key: 'formValues' }),
    })

  const selectCourt = async (req, res) => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(res.locals)
    const details = findBookingDetails(req)
    if (!details.prison) {
      return res.redirect('/request-booking')
    }
    const { date, startTime, endTime, prison, preAppointmentRequired, postAppointmentRequired } = details

    const getPreHearingStartAndEndTime = () => {
      if (preAppointmentRequired !== 'yes') return 'Not required'
      const preCourtHearingStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minute')
      const preCourtHearingEndTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
      return `${Time(preCourtHearingStartTime)} to ${Time(preCourtHearingEndTime)}`
    }

    const getPostCourtHearingStartAndEndTime = () => {
      if (postAppointmentRequired !== 'yes') return 'Not required'
      const postCourtHearingStartTime = moment(endTime, DATE_TIME_FORMAT_SPEC)
      const postCourtHearingEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minute')
      return `${Time(postCourtHearingStartTime)} to ${Time(postCourtHearingEndTime)}`
    }

    const preHearingStartAndEndTime = getPreHearingStartAndEndTime()
    const postHearingStartAndEndTime = getPostCourtHearingStartAndEndTime()

    packBookingDetails(req, {
      ...details,
      preHearingStartAndEndTime,
      postHearingStartAndEndTime,
    })

    const prisons = await prisonApi.getAgencies(res.locals)
    const matchingPrison = prisons.find(p => p.agencyId === prison)

    return res.render('requestBooking/selectCourt.njk', {
      prisonDetails: {
        prison: matchingPrison.formattedDescription || matchingPrison.description,
      },
      hearingDetails: {
        date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
        courtHearingStartTime: Time(startTime),
        courtHearingEndTime: Time(endTime),
      },
      prePostDetails: {
        'pre-court hearing briefing': preHearingStartAndEndTime,
        'post-court hearing briefing': postHearingStartAndEndTime,
      },
      hearingLocations: courtLocations.map(location => ({
        value: location,
        text: location,
      })),
      errors: req.flash('errors') || [],
    })
  }

  const validateCourt = async (req, res) => {
    const { hearingLocation } = req.body
    const bookingDetails = getBookingDetails(req)
    if (req.errors && req.errors.length > 0) {
      packBookingDetails(req, bookingDetails)
      req.flash('errors', req.errors)
      return res.redirect('/request-booking/select-court')
    }
    packBookingDetails(req, {
      ...bookingDetails,
      hearingLocation,
    })
    return res.redirect('/request-booking/enter-offender-details')
  }

  const createBookingRequest = async (req, res) => {
    const { firstName, lastName, dobDay, dobMonth, dobYear, comments } = req.body

    const bookingDetails = getBookingDetails(req)

    const dateOfBirth = moment({
      day: dobDay,
      month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1,
      year: dobYear,
    })

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
    startOfJourney,
    checkAvailability,
    selectCourt,
    validateCourt,
    createBookingRequest,
    enterOffenderDetails,
    confirm,
  }
}

module.exports = {
  requestBookingFactory,
}
