import moment, { Moment } from 'moment'
import { Interval } from 'whereaboutsApi'
import { MOMENT_TIME } from '../shared/dateHelpers'

const preStartTime = (startTime: Moment) => moment(startTime).subtract(20, 'minutes')
const postEndTime = (endTime: Moment) => moment(endTime).add(20, 'minutes')

export const createInterval = (start: Moment, end: Moment): Interval => {
  return { start: start.format(MOMENT_TIME), end: end.format(MOMENT_TIME) }
}

export const getPreAppointmentInterval = (startTime: Moment): Interval => {
  return createInterval(preStartTime(startTime), startTime)
}

export const getPostAppointmentInterval = (endTime: Moment): Interval => {
  return createInterval(moment(endTime), postEndTime(endTime))
}

export const getTotalAppointmentInterval = (
  startTime: Moment,
  endTime: Moment,
  preRequired: boolean,
  postRequired: boolean
): Interval => {
  return createInterval(
    preRequired ? preStartTime(startTime) : startTime,
    postRequired ? postEndTime(endTime) : endTime
  )
}
