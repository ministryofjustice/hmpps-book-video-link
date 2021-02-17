const { stubFor } = require('./wiremock')

module.exports = {
  stubFindPrisonersByBookingIds: response =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prisonerOffenderSearch/prisoner-search/booking-ids`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisonerOffenderSearch/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        fixedDelayMilliseconds: status === 500 ? 5000 : '',
      },
    })
  },
}
