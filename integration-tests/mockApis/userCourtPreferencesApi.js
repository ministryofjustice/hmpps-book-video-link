const { stubFor } = require('./wiremock')

module.exports = {
  stubGetUserCourtPreferences: preferredCourts => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/userPreferences/users/COURT_USER/preferences/video_link_booking.preferred_courts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { items: preferredCourts || [] },
      },
    })
  },
  stubUpdateUserCourtPreferences: preferredCourts => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/userPreferences/users/COURT_USER/preferences/video_link_booking.preferred_courts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { items: preferredCourts || [] },
      },
    })
  },
}
