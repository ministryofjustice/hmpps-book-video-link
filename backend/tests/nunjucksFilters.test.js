const express = require('express')
const path = require('path')
const nunjucksSetup = require('../utils/nunjucksSetup')

describe('toSummaryViewModel filter', () => {
  const app = express()
  const njk = nunjucksSetup(app, path)

  const partialModel = {
    date: '2 February 2021',
    courtHearingStartTime: '09:00',
    courtHearingEndTime: '09:10',
  }

  const partialResult = [
    {
      key: { text: 'Date' },
      value: {
        html: "<span class='date'>2 February 2021</span>",
        classes: 'qa-date-value',
      },
    },
    {
      key: { text: 'Court hearing start time' },
      value: {
        html: "<span class='courtHearingStartTime'>09:00</span>",
        classes: 'qa-courtHearingStartTime-value',
      },
    },
    {
      key: { text: 'Court hearing end time' },
      value: {
        html: "<span class='courtHearingEndTime'>09:10</span>",
        classes: 'qa-courtHearingEndTime-value',
      },
    },
  ]

  it('should escape <> characters', () => {
    const model = {
      ...partialModel,
      comments: 'this and <bold> some bold text </bold> \r\n that followed by a blank line \r\n\r another line',
    }

    const result = njk.filters.toSummaryViewModel(model)

    expect(result).toEqual([
      ...partialResult,
      {
        key: { text: 'Comments' },
        value: {
          html:
            "<span class='comments'>this and &lt;bold&gt; some bold text &lt;/bold&gt; \r\n" +
            ' that followed by a blank line \r\n' +
            '\r another line</span>',
          classes: 'qa-comments-value',
        },
      },
    ])
  })

  it('should escape & characters', () => {
    const model = {
      ...partialModel,
      comments: 'this and & some more text \r\n that followed by a blank line \r\n\r another line',
    }

    const result = njk.filters.toSummaryViewModel(model)
    expect(result).toEqual([
      ...partialResult,
      {
        key: { text: 'Comments' },
        value: {
          html:
            "<span class='comments'>this and &amp; some more text \r\n" +
            ' that followed by a blank line \r\n' +
            '\r another line</span>',
          classes: 'qa-comments-value',
        },
      },
    ])
  })

  it('should escape quote characters', () => {
    const model = {
      ...partialModel,
      comments: 'this and "some quoted text" \r\n that followed by a blank line \r\n\r another line',
    }

    const result = njk.filters.toSummaryViewModel(model)
    expect(result).toEqual([
      ...partialResult,
      {
        key: { text: 'Comments' },
        value: {
          html:
            "<span class='comments'>this and &quot;some quoted text&quot; \r\n" +
            ' that followed by a blank line \r\n' +
            '\r another line</span>',
          classes: 'qa-comments-value',
        },
      },
    ])
  })
})
