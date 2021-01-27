import moment, { Moment } from 'moment'
import { Interval } from 'whereaboutsApi'
import { MOMENT_TIME } from '../shared/dateHelpers'

type DatePair = [start: Moment, end: Moment]

const preStartTime = (startTime: Moment): Moment => moment(startTime).subtract(20, 'minutes')
const postEndTime = (endTime: Moment): Moment => moment(endTime).add(20, 'minutes')

export const createInterval = ([start, end]: DatePair): Interval => {
  return { start: start.format(MOMENT_TIME), end: end.format(MOMENT_TIME) }
}

export const preAppointmentTimes = (startTime: Moment): DatePair => [preStartTime(startTime), startTime]
export const postAppointmentTime = (endTime: Moment): DatePair => [endTime, postEndTime(endTime)]

export const getPreAppointmentInterval = (startTime: Moment): Interval => {
  return createInterval(preAppointmentTimes(startTime))
}

export const getPostAppointmentInterval = (endTime: Moment): Interval => {
  return createInterval(postAppointmentTime(endTime))
}

export const getTotalAppointmentInterval = (
  startTime: Moment,
  endTime: Moment,
  preRequired: boolean,
  postRequired: boolean
): Interval => {
  return createInterval([
    preRequired ? preStartTime(startTime) : startTime,
    postRequired ? postEndTime(endTime) : endTime,
  ])
}
