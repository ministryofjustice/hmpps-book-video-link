import { stubFor } from './wiremock'

module.exports = {
  stubAllCourts: courts => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/courts/paged\\?courtTypeIds=CRN&courtTypeIds=COU&courtTypeIds=MAG&courtTypeIds=IMM&size=1000',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courts || [],
      },
    })
  },
}
