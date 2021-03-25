import moment, { Moment } from 'moment'

export const DATE_ONLY_FORMAT_SPEC = 'YYYY-MM-DD'
export const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'
export const DATE_ONLY_LONG_FORMAT_SPEC = 'D MMMM YYYY'
export const DATE_ONLY_EXTRA_LONG_FORMAT_SPEC = 'dddd D MMMM YYYY'
export const DAY_MONTH_YEAR = 'DD/MM/YYYY'
export const MOMENT_DAY_OF_THE_WEEK = 'dddd'
export const MOMENT_TIME = 'HH:mm'

export const DayOfTheWeek = (dateTime: string): string =>
  moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_DAY_OF_THE_WEEK)
export const DayMonthYear = (dateTime: string): string => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)
export const Time = (dateTime: string | Moment): string => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_TIME)

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
