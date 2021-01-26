import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from './shared/dateHelpers'

export const switchDateFormat = (displayDate: string, fromFormat = 'DD/MM/YYYY'): string => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('YYYY-MM-DD')
  }

  return displayDate
}

export const capitalize = (string: string): string => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

export const capitalizeStart = (string: string): string =>
  string && string[0].toUpperCase() + string.slice(1, string.length)

export const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
export const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(capitalize).join('-'))

export const formatName = (firstName: string, lastName: string): string =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

const arrayToQueryString = (array, key) => array && array.map(item => `${key}=${encodeURIComponent(item)}`).join('&')

export const mapToQueryString = (params: Record<string, unknown>): string =>
  Object.keys(params)
    .filter(key => params[key])
    .map(key => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key].toString())}`
    })
    .join('&')

export const toMap = <T, F extends keyof T>(items: T[] = [], name: F): Map<T[F], T> => {
  return items.reduce((result, item) => {
    result.set(item[name], item)
    return result
  }, new Map<T[F], T>())
}

export const pascalToString = (value: string): string =>
  value &&
  value.substring(0, 1) +
    value
      .substring(1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()

export const isToday = (date: string): boolean => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY').startOf('day').isSame(moment().startOf('day'))
}

const isValidDateTimeFormat = dateTimeString => moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

export const getDate = (dateTimeString: string, format = 'dddd D MMMM YYYY'): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

export const getTime = (dateTimeString: string): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

export const hyphenatedStringToCamel = (string: string): string =>
  string.replace(/[-\s]([a-z])/g, char => char[1].toUpperCase())

export const possessive = (string: string): string => {
  if (!string) return ''

  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

/**
 * Takes an array of promises containing arrays of T and converts to a promise containing an array of T
 */
export const flattenCalls = <T>(arg: Promise<T[]>[]): Promise<T[]> => Promise.all(arg).then(r => r.flat())

export type Codec<T> = {
  read(record: Record<string, unknown>): T
  write(value: T): Record<string, string>
}

export function assertHasStringValues<K extends string>(
  obj: unknown,
  keysToCheck: K[]
): asserts obj is Record<K, string> {
  const matches = obj && typeof obj === 'object'

  if (!matches) {
    throw Error('Not a record')
  }
  const invalidKeys = keysToCheck.filter(k => typeof obj[k] !== 'string')
  if (invalidKeys.length) {
    throw Error(`Missing or invalid keys: ${invalidKeys}`)
  }
}

export function assertHasOptionalStringValues<K extends string>(
  obj: unknown,
  keysToCheck: K[]
): asserts obj is Record<K, string> {
  const matches = obj && typeof obj === 'object'

  if (!matches) {
    throw Error('Not a record')
  }
  const invalidKeys = keysToCheck.filter(k => obj[k] && typeof obj[k] !== 'string')
  if (invalidKeys.length) {
    throw Error(`Non string keys: ${invalidKeys}`)
  }
}
