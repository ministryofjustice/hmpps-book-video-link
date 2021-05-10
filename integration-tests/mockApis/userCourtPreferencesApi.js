const { stubFor } = require('./wiremock')

module.exports = {
  stubGetUserCourtPreferences: (userId, courts) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/userPreferences/users/${userId}/preferences/video_link_booking.preferred_courts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { items: courts || [] },
      },
    })
  },
  stubUpdateUserCourtPreferences: (userId, courts) => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/userPreferences/users/${userId}/preferences/video_link_booking.preferred_courts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { items: courts || [] },
      },
    })
  },
}
