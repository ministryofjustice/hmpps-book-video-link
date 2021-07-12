const moment = require('moment')
const nunjucks = require('nunjucks')
const config = require('../config')
const {
  getDate,
  getTime,
  pascalToString,
  capitalize,
  hyphenatedStringToCamel,
  possessive,
  escapeHtml,
} = require('../utils')

module.exports = (app, path) => {
  const njkEnv = nunjucks.configure(
    [path.join(__dirname, '../../views'), 'node_modules/govuk-frontend/', 'node_modules/@ministryofjustice/frontend/'],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('findError', (array, formFieldId) => {
    if (!array) return null
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('findErrors', (errors, formFieldIds) => {
    if (!errors) return null
    const fieldIds = formFieldIds.map(field => `#${field}`)
    const errorIds = errors.map(error => error.href)
    const firstPresentFieldError = fieldIds.find(fieldId => errorIds.includes(fieldId))
    if (firstPresentFieldError) {
      return { text: errors.find(error => error.href === firstPresentFieldError).text }
    }
    return null
  })

  njkEnv.addFilter('formatDate', (value, format) => {
    return value ? moment(value).format(format) : null
  })

  njkEnv.addFilter('hasErrorWithPrefix', (errorsArray, prefixes) => {
    if (!errorsArray) return null
    const formattedPrefixes = prefixes.map(field => `#${field}`)
    return errorsArray.some(error => formattedPrefixes.some(prefix => error.href.startsWith(prefix)))
  })

  njkEnv.addFilter('toTextValue', (array, selected) => {
    if (!array) return null

    const items = array.map(entry => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        hidden: true,
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter('addDefaultSelectedVale', (items, text, show) => {
    if (!items) return null
    const attributes = {}
    if (!show) attributes.hidden = ''

    return [
      {
        text,
        value: '',
        selected: true,
        attributes,
      },
      ...items,
    ]
  })

  njkEnv.addFilter(
    'setSelected',
    (items, selected) =>
      items &&
      items.map(entry => ({
        ...entry,
        selected: entry && entry.value === selected,
      }))
  )

  njkEnv.addFilter('toSummaryViewModel', model =>
    Object.keys(model)
      .filter(key => model[key])
      .map(key => ({
        key: { text: capitalize(pascalToString(key)) },
        value: {
          html: `<span class='${key}'>${escapeHtml(model[key])}</span>`,
          classes: `qa-${hyphenatedStringToCamel(key)}-value`,
        },
      }))
  )

  njkEnv.addFilter(
    'addActions',
    (items, actions) =>
      items &&
      items.map(entry => ({
        key: entry.key,
        value: entry.value,
        actions: { items: [actions[entry.key.text]] },
      }))
  )

  njkEnv.addFilter(
    'removePaddingBottom',
    items =>
      items &&
      items.map(entry => ({
        key: {
          ...entry.key,
          classes: 'govuk-!-padding-bottom-0',
        },
        value: {
          ...entry.value,
          classes: `${entry.value.classes} govuk-!-padding-bottom-0`,
        },
      }))
  )

  njkEnv.addFilter(
    'longLabel',
    items =>
      items &&
      items.map(entry => ({
        key: {
          ...entry.key,
          classes: `${entry.key.classes} govuk-!-width-one-half`,
        },
        value: {
          ...entry.value,
          classes: `${entry.value.classes} govuk-!-width-one-half`,
        },
      }))
  )

  njkEnv.addFilter('showText', value => {
    return value.text
  })

  njkEnv.addFilter('showValue', value => {
    return value.value
  })

  njkEnv.addFilter('toSelect', (array, valueKey, textKey, value) => {
    const emptyOption = {
      value: '',
      text: 'Select',
      selected: value === '',
    }
    const items = array.map(item => ({
      value: item[valueKey],
      text: item[textKey],
      // eslint-disable-next-line eqeqeq
      selected: item[valueKey] == value,
    }))
    return [emptyOption, ...items]
  })

  njkEnv.addFilter('showDefault', (value, specifiedText) => {
    if (value === 0) return value

    return value || specifiedText || '--'
  })

  njkEnv.addFilter('getDate', getDate)
  njkEnv.addFilter('getTime', getTime)
  njkEnv.addFilter('truthy', data => Boolean(data))
  njkEnv.addFilter('possessive', possessive)
  njkEnv.addGlobal('googleAnalyticsId', config.analytics.googleAnalyticsId)
  njkEnv.addGlobal('authUrl', config.apis.oauth2.url)
  return njkEnv
}
