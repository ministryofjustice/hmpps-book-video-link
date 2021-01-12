import moment, { Moment } from 'moment'

export const DATE_ONLY_FORMAT_SPEC = 'YYYY-MM-DD'
export const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'
export const DAY_MONTH_YEAR = 'DD/MM/YYYY'
export const MOMENT_DAY_OF_THE_WEEK = 'dddd'
export const MOMENT_TIME = 'HH:mm'

export const DayOfTheWeek = (dateTime: string): string =>
  moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_DAY_OF_THE_WEEK)
export const DayMonthYear = (dateTime: string): string => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)
export const Time = (dateTime: string | Moment): string => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_TIME)

/**
 * @deprecated use buildDate instead.
 * TODO: this needs tidying up - at the moment returns {string | Moment} but nowhere seems to handle the string case.
 * @return {moment.Moment}
 */
export const buildDateTime = ({ date, hours, minutes, dateFormat = DAY_MONTH_YEAR }): moment.Moment => {
  const time =
    date &&
    Number.isSafeInteger(Number.parseInt(hours, 10)) &&
    Number.isSafeInteger(Number.parseInt(minutes, 10)) &&
    moment(date, dateFormat)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return time ? time.hour(Number(hours)).minutes(Number(minutes)) : ''
}

export const buildDate = (
  date: string | undefined,
  hours: string,
  minutes: string,
  dateFormat: string = DAY_MONTH_YEAR
): moment.Moment | undefined => {
  const dateTime =
    date &&
    Number.isSafeInteger(Number.parseInt(hours, 10)) &&
    Number.isSafeInteger(Number.parseInt(minutes, 10)) &&
    moment(date, dateFormat)

  return dateTime && dateTime.isValid() ? dateTime.hour(Number(hours)).minutes(Number(minutes)) : undefined
}
