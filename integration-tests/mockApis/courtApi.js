const { stubFor } = require('./wiremock')
const courtResponse = require('./responses/courts.json')

module.exports = {
  stubAllCourts: (courts = courtResponse) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern:
          '/courtRegister/courts/paged\\?courtTypeIds=CRN&courtTypeIds=COU&courtTypeIds=MAG&courtTypeIds=IMM&size=1000',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { content: courts || [] },
      },
    })
  },
}
