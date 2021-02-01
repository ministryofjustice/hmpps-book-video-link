import moment from 'moment'
import { RequestHandler } from 'express'

import { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } from '../../shared/dateHelpers'
import { notifications } from '../../config'
import toAppointmentDetailsSummary from '../../services/toAppointmentDetailsSummary'
import { properCaseName } from '../../utils'
import { Services } from '../../services'
import { AvailabilityRequest } from '../../services/model'

const { confirmBookingCourtTemplateId, prisonCourtBookingTemplateId, emails } = notifications

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

const validate = ({
  preAppointmentRequired,
  postAppointmentRequired,
  selectPreAppointmentLocation,
  selectPostAppointmentLocation,
  selectMainAppointmentLocation,
  comment,
}) => {
  const errors = []

  if (!selectMainAppointmentLocation)
    errors.push({
      text: 'Select a prison room for the court hearing video link',
      href: '#selectMainAppointmentLocation',
    })

  if (preAppointmentRequired === 'yes' && !selectPreAppointmentLocation)
    errors.push({
      text: 'Select a prison room for the pre-court hearing briefing',
      href: '#selectPreAppointmentLocation',
    })

  if (postAppointmentRequired === 'yes' && !selectPostAppointmentLocation)
    errors.push({
      text: 'Select a prison room for the post-court hearing briefing',
      href: '#selectPostAppointmentLocation',
    })

  if (
    postAppointmentRequired === 'yes' &&
    selectMainAppointmentLocation &&
    selectPostAppointmentLocation &&
    selectPostAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push({
      text: 'Select a different room for the post-court hearing to the room for the court hearing briefing',
      href: '#selectPostAppointmentLocation',
    })
  }

  if (
    preAppointmentRequired === 'yes' &&
    selectPreAppointmentLocation &&
    selectMainAppointmentLocation &&
    selectPreAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push({
      text: 'Select a different room for the pre-court hearing to the room for the court hearing briefing',
      href: '#selectPreAppointmentLocation',
    })
  }

  if (comment && comment.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comment' })

  return errors
}

type Handlers = {
  index: RequestHandler
  validateInput: RequestHandler
  createAppointments: RequestHandler
}

export default function selectCourtAppointmentRoomsFactory({
  prisonApi,
  bookingService,
  availabilityCheckService,
  oauthApi,
  notifyApi,
}: Services): Handlers {
  const index = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const appointmentDetails = unpackAppointmentDetails(req)
    const { startTime, endTime, preAppointmentRequired, postAppointmentRequired } = appointmentDetails

    const [offenderDetails, agencyDetails] = await Promise.all([
      prisonApi.getPrisonerDetails(res.locals, offenderNo),
      prisonApi.getAgencyDetails(res.locals, agencyId),
    ])
    const { firstName, lastName, bookingId } = offenderDetails

    const agencyDescription = agencyDetails.description

    const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

    const availabilityRequest = parseAvailabilityRequest(agencyId, appointmentDetails)

    const {
      rooms: { pre, main, post },
    } = await availabilityCheckService.getAvailability(res.locals, availabilityRequest)

    packAppointmentDetails(req, {
      ...appointmentDetails,
      mainLocations: main,
      preLocations: pre,
      postLocations: post,
      agencyDescription,
      firstName,
      lastName,
      bookingId,
      date,
    })

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
    })
  }

  const createPreAppointment = ({ startTime, preAppointmentLocation }) => {
    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minutes')
    const preDetails = {
      startTime: preStartTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: startTime,
      locationId: Number(preAppointmentLocation),
    }

    return preDetails
  }

  const createPostAppointment = ({ endTime, postAppointmentLocation }) => {
    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minutes')

    const postDetails = {
      startTime: endTime,
      endTime: postEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(postAppointmentLocation),
    }

    return postDetails
  }

  const validateInput = (req, res, next) => {
    const {
      selectPreAppointmentLocation,
      selectMainAppointmentLocation,
      selectPostAppointmentLocation,
      comment,
    } = req.body
    const appointmentDetails = unpackAppointmentDetails(req)
    const {
      startTime,
      endTime,
      firstName,
      lastName,
      date,
      preAppointmentRequired,
      postAppointmentRequired,
      agencyDescription,
      mainLocations,
      preLocations,
      postLocations,
    } = appointmentDetails

    const errors = validate({
      preAppointmentRequired,
      postAppointmentRequired,
      selectPreAppointmentLocation,
      selectPostAppointmentLocation,
      selectMainAppointmentLocation,
      comment,
    })

    packAppointmentDetails(req, appointmentDetails)
    if (errors.length) {
      return res.render('createBooking/selectRooms.njk', {
        mainLocations,
        preLocations,
        postLocations,
        formValues: {
          preAppointmentLocation: selectPreAppointmentLocation && Number(selectPreAppointmentLocation),
          mainAppointmentLocation: selectMainAppointmentLocation && Number(selectMainAppointmentLocation),
          postAppointmentLocation: selectPostAppointmentLocation && Number(selectPostAppointmentLocation),
          comment,
        },
        errors,
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
      })
    }

    return next()
  }

  const createAppointments = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const appointmentDetails = unpackAppointmentDetails(req)
    const {
      startTime,
      endTime,
      preAppointmentRequired,
      postAppointmentRequired,
      firstName,
      lastName,
      mainLocations,
      preLocations,
      postLocations,
      court,
      date,
      agencyDescription,
    } = appointmentDetails
    const { username, name } = req.session.userDetails
    const {
      selectPreAppointmentLocation,
      selectMainAppointmentLocation,
      selectPostAppointmentLocation,
      comment,
    } = req.body

    const prepostAppointments = {} as any

    if (preAppointmentRequired === 'yes') {
      prepostAppointments.preAppointment = createPreAppointment({
        startTime,
        preAppointmentLocation: selectPreAppointmentLocation,
      })
    }

    if (postAppointmentRequired === 'yes') {
      prepostAppointments.postAppointment = createPostAppointment({
        endTime,
        postAppointmentLocation: selectPostAppointmentLocation,
      })
    }

    packAppointmentDetails(req, {
      ...appointmentDetails,
      ...prepostAppointments,
      locationId: selectMainAppointmentLocation,
      comment,
    })

    const userEmailData = await oauthApi.userEmail(res.locals, username)

    const preAppointmentInfo =
      preAppointmentRequired === 'yes'
        ? `${preLocations.find(l => l.value === Number(selectPreAppointmentLocation)).text}, ${Time(
            prepostAppointments.preAppointment.startTime
          )} to ${Time(startTime)}`
        : 'Not required'

    const postAppointmentInfo =
      postAppointmentRequired === 'yes'
        ? `${postLocations.find(l => l.value === Number(selectPostAppointmentLocation)).text}, ${Time(
            endTime
          )} to ${Time(prepostAppointments.postAppointment.endTime)}`
        : 'Not required'

    if (userEmailData && userEmailData.email) {
      const personalisation = {
        startTime: Time(startTime),
        endTime: Time(endTime),
        comments: comment || 'None entered.',
        firstName: properCaseName(firstName),
        lastName: properCaseName(lastName),
        offenderNo,
        location: mainLocations.find(l => l.value === Number(selectMainAppointmentLocation)).text,
        preAppointmentInfo,
        postAppointmentInfo,
        court,
        date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
        prison: agencyDescription,
        userName: name,
      }

      notifyApi.sendEmail(confirmBookingCourtTemplateId, userEmailData.email, {
        personalisation,
        reference: null,
      })

      if (emails[agencyId] && emails[agencyId].omu) {
        notifyApi.sendEmail(prisonCourtBookingTemplateId, emails[agencyId].omu, {
          personalisation,
          reference: null,
        })
      }
    }

    await bookingService.create(res.locals, {
      bookingId: appointmentDetails.bookingId,
      court: appointmentDetails.court,
      comment,
      pre: prepostAppointments.preAppointment,
      main: {
        locationId: parseInt(selectMainAppointmentLocation, 10),
        startTime: appointmentDetails.startTime,
        endTime: appointmentDetails.endTime,
      },
      post: prepostAppointments.postAppointment,
    })

    return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
  }

  return { index, validateInput, createAppointments }
}
